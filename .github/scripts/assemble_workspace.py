#!/usr/bin/env python3
"""Rebuild the workspace layout the Postgres dashboard's package.json assumes.

package.json declares its @metabuilder/* dependencies as relative file: paths
-- file:../../libraries/components and friends -- which resolve only when this
repo sits at frontends/postgres inside the old monorepo, with those libraries
beside it. A bare checkout therefore cannot npm install at all, which is why
every CI run in this repo has failed.

This script builds that layout in a scratch directory:

    <workspace>/
      package.json              generated workspace root
      frontends/postgres/       this repo (copied, not moved)
      libraries/components/     from the components repo (contains m3/)
      libraries/hooks/
      libraries/redux/          provides dbal-sso and persist
      libraries/scss/
      libraries/icons/          resolved by components via a relative path

Nothing in the app or its package.json changes; the paths simply resolve.

Typical use:

    # Assemble at pinned SHAs, then build the image with that root as context
    python3 .github/scripts/assemble_workspace.py --dest /tmp/ws
    docker build -f Dockerfile -t postgres-dashboard /tmp/ws

    # Take sibling branch heads instead of the pins
    python3 .github/scripts/assemble_workspace.py --dest /tmp/ws --floating

    # See the plan without touching anything
    python3 .github/scripts/assemble_workspace.py --dest /tmp/ws --dry-run

Private sibling repos need a token with read access: pass --token or set
WORKSPACE_TOKEN. A workflow's default GITHUB_TOKEN only sees its own repo.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
MANIFEST = REPO_ROOT / ".github" / "workspace.json"


class AssemblyError(RuntimeError):
    """A mount could not be produced; the workspace is not usable as-is."""


def run_git(args: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess:
    proc = subprocess.run(["git", *args], cwd=cwd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise AssemblyError(f"git {' '.join(args)} failed ({proc.returncode}):\n{proc.stderr.strip()}")
    return proc


def clone_url(owner: str, repo: str, token: str | None) -> str:
    if token:
        return f"https://x-access-token:{token}@github.com/{owner}/{repo}.git"
    return f"https://github.com/{owner}/{repo}.git"


def fetch_repo(url: str, ref: str, dest: Path, display: str) -> None:
    """Shallow-fetch one ref. Works for both SHAs and branch names, which a
    plain `git clone --depth 1` cannot do for an arbitrary commit."""
    dest.mkdir(parents=True, exist_ok=True)
    run_git(["init", "--quiet"], cwd=dest)
    run_git(["remote", "add", "origin", url], cwd=dest)
    try:
        run_git(["fetch", "--depth", "1", "--quiet", "origin", ref], cwd=dest)
    except AssemblyError as exc:
        raise AssemblyError(f"could not fetch {ref} from {display}: {exc}") from exc
    run_git(["checkout", "--quiet", "FETCH_HEAD"], cwd=dest)
    shutil.rmtree(dest / ".git", ignore_errors=True)


def generate_root_package_json(dest: Path) -> None:
    """Write the workspace root package.json.

    The monorepo's own root is not in this repo, and the app's package.json is
    the *frontend's*, not a workspace root. npm needs a root declaring the
    workspaces before the file: links resolve, so one is generated rather than
    committed -- committing it would be a second copy of the layout to keep in
    step with workspace.json.

    The root is also the only place npm honours `overrides`: those declared in
    a workspace are ignored, so the peer-dependency pins below cannot live in
    the app's own package.json.
    """
    app_pkg = json.loads((dest / "frontends" / "postgres" / "package.json").read_text())
    app_deps = {**app_pkg.get("dependencies", {}), **app_pkg.get("devDependencies", {})}

    def declared(name: str, fallback: str) -> str:
        """Take the app's own range so an upgrade there does not silently
        leave a stale pin behind here."""
        return app_deps.get(name, fallback)

    root = {
        "name": "postgres-dashboard-workspace",
        "private": True,
        "version": "0.0.0",
        # Every mounted directory that contains an @metabuilder package must be
        # listed. A package that is mounted but not declared here is not a
        # workspace, so npm resolves it from the registry instead -- and the
        # @metabuilder scope is not published, so the failure is a 404 rather
        # than a version conflict. libraries/icons is deliberately absent: it
        # has no package.json at all and is reached through a relative import.
        "workspaces": [
            "frontends/postgres",
            "libraries/components",
            "libraries/components/m3",
            "libraries/hooks",
            "libraries/redux/*",
            "libraries/scss",
            "libraries/types",
        ],
        # Targeted peer-dependency pins, in place of --legacy-peer-deps.
        #
        # The flag worked, but by switching peer resolution off for the whole
        # tree -- it would equally have hidden a genuine incompatibility
        # introduced later. These pin only the edges that are actually wrong,
        # in nested form ("within package X, use version Y for Z"), so nothing
        # else's view of eslint or react is touched.
        "overrides": {
            # eslint 10 is newer than most plugins' declared peer ranges: they
            # cap at ^9 or ^9.7 and work with 10 in practice. Pinning them one
            # at a time did not work -- fixing jsx-a11y surfaced
            # eslint-plugin-react, which would have surfaced the next -- so
            # every eslint plugin and config the app declares gets the same
            # treatment. Derived from package.json rather than listed here, so
            # adding a plugin does not silently reintroduce the problem.
            **{
                name: {"eslint": declared("eslint", "^10.0.1")}
                for name in app_deps
                if name.startswith(("eslint-plugin-", "eslint-config-"))
                or ("eslint" in name and name.startswith("@"))
            },
            # react-redux@9 peers react ^18 while this tree is on React 19 --
            # the same pattern, a range that predates the major.
            "react-redux": {
                "react": declared("react", "^19.2.4"),
                "react-dom": declared("react-dom", "^19.2.4"),
            },
        },
    }
    (dest / "package.json").write_text(json.dumps(root, indent=2) + "\n")


def assemble(manifest: dict, dest: Path, token: str | None, floating: bool, dry_run: bool) -> int:
    owner = manifest["owner"]
    mounted = 0

    for entry in manifest["repos"]:
        name = entry["repo"]
        ref = entry["branch"] if floating else entry["ref"]
        targets = ", ".join(m["to"] for m in entry["mounts"])
        print(f"==> {name}@{ref[:12]} -> {targets}", flush=True)
        if dry_run:
            mounted += len(entry["mounts"])
            continue

        url = clone_url(owner, name, token)
        display = f"{owner}/{name}"
        with tempfile.TemporaryDirectory(prefix=f"pg-{name}-") as tmp:
            work = Path(tmp) / "src"
            fetch_repo(url, ref, work, display)
            for mount in entry["mounts"]:
                src = work if mount["from"] == "." else work / mount["from"]
                if not src.is_dir():
                    raise AssemblyError(f"{name}: '{mount['from']}' not found in the repo")
                target = dest / mount["to"]
                if target.exists():
                    shutil.rmtree(target)
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copytree(src, target)
                mounted += 1

    # This repo goes where its own file: paths expect to find it.
    app_dest = dest / "frontends" / "postgres"
    print(f"==> (this repo) -> frontends/postgres", flush=True)
    if not dry_run:
        if app_dest.exists():
            shutil.rmtree(app_dest)
        app_dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(
            REPO_ROOT,
            app_dest,
            # node_modules would be a stale tree from a different layout, and
            # .git is large and pointless here.
            ignore=shutil.ignore_patterns(".git", "node_modules", ".next"),
        )
        generate_root_package_json(dest)
    mounted += 1
    return mounted


def verify(dest: Path, manifest: dict) -> None:
    """Fail loudly on an empty mount.

    An empty directory is worse than a missing one: npm resolves the file:
    link, finds no package.json, and reports a confusing error far from here.
    """
    expected = [m["to"] for e in manifest["repos"] for m in e["mounts"]]
    expected.append("frontends/postgres")
    for rel in expected:
        path = dest / rel
        if not path.is_dir() or not any(path.iterdir()):
            raise AssemblyError(f"{rel} is missing or empty after assembly")


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dest", required=True, type=Path,
                        help="Directory to assemble the workspace into.")
    parser.add_argument("--manifest", default=MANIFEST, type=Path,
                        help="Path to workspace.json (default: .github/workspace.json).")
    parser.add_argument("--token", default=os.environ.get("WORKSPACE_TOKEN") or os.environ.get("GITHUB_TOKEN"),
                        help="GitHub token for private repos.")
    parser.add_argument("--floating", action="store_true",
                        help="Use each repo's branch head instead of its pinned SHA.")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print the plan without fetching or writing anything.")
    args = parser.parse_args()

    try:
        manifest = json.loads(args.manifest.read_text())
        args.dest.mkdir(parents=True, exist_ok=True)
        count = assemble(manifest, args.dest, args.token, args.floating, args.dry_run)
        if not args.dry_run:
            verify(args.dest, manifest)
        print(f"\nMounted {count} path(s) into {args.dest}.")
        return 0
    except AssemblyError as exc:
        print(f"\nerror: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
