# Postgres dashboard — self-contained build.
#
# Context: a workspace assembled by .github/scripts/assemble_workspace.py, NOT
# a bare checkout of this repo:
#
#   <context>/
#     package.json            generated workspace root
#     frontends/postgres/     this repo
#     libraries/{components,hooks,redux,scss,icons}/
#
# package.json declares its @metabuilder/* dependencies as relative file: paths
# (file:../../libraries/components and friends), so the app can only be built
# from that layout. Assembling it is what the workflow does before calling
# docker build.
#
# This previously started FROM metabuilder/base-postgres-deps, which prebaked
# the libraries. That image is unbuildable today: its Dockerfile wants
# package.json files from the eight frontends that left metabuilder in the repo
# split, plus a package-lock.json that is committed nowhere. Installing from
# the assembled workspace instead costs a slower build and owes nothing to a
# base image no pipeline can produce.

# --- Build stage ---
FROM node:24-alpine AS builder

WORKDIR /app

# Native deps: node-gyp needs python3/make/g++, and sharp (Next.js image
# optimisation) needs vips at build time on Alpine.
RUN apk add --no-cache python3 make g++ vips-dev

# The whole library tree, before npm install.
#
# This deliberately does NOT enumerate individual package.json files, which is
# what it did before and which was wrong four separate times: @metabuilder/types
# went missing, then redux-slices. Every package that anything in the tree
# depends on must be a workspace at install time, and the workspace globs
# (libraries/redux/*) only match directories that already exist -- so a
# selective COPY silently shrinks the workspace set. Because the @metabuilder
# scope is unpublished, the result is a registry 404 naming a package rather
# than anything pointing at the copy list.
#
# The cost is that editing library source invalidates the install layer. The
# npm cache mount absorbs most of that, and it is a far better trade than a
# hand-maintained list that has to stay in step with six repos' internals.
COPY package.json ./
COPY libraries/ ./libraries/
COPY frontends/postgres/package.json ./frontends/postgres/

# No package-lock.json is committed anywhere in this family, so `npm ci` is not
# an option -- see the note in metabuilder's CI about the same constraint.
# --legacy-peer-deps is not cosmetic: package.json declares eslint@^10 while
# eslint-plugin-jsx-a11y@6.10.2 peers on eslint ^3..^9, so a plain install
# fails with ERESOLVE. That conflict is dev-tooling only -- this image never
# runs eslint -- but it is a real defect in the manifest and the flag hides it
# rather than fixing it. Reconciling those two versions is the proper fix.
RUN --mount=type=cache,target=/root/.npm \
    npm install --ignore-scripts --prefer-offline --no-audit --no-fund --legacy-peer-deps

# Sources after the install, so editing them does not invalidate it. The
# workspace links are path-based and resolve once these land.
COPY frontends/postgres/ ./frontends/postgres/

ENV SKIP_ENV_VALIDATION=true
ENV JWT_SECRET=build-placeholder
ENV NEXT_PUBLIC_SENTRY_DISABLED=true
ENV NODE_OPTIONS="--max-old-space-size=3072"
ARG NEXT_PUBLIC_DBAL_OIDC_BASE_URL=/api/dbal
ARG NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID=postgres-dashboard-web
ENV NEXT_PUBLIC_DBAL_OIDC_BASE_URL=${NEXT_PUBLIC_DBAL_OIDC_BASE_URL}
ENV NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID=${NEXT_PUBLIC_DBAL_OIDC_CLIENT_ID}

RUN --mount=type=cache,target=/app/frontends/postgres/.next/cache \
    cd frontends/postgres && npx next build --turbopack

# --- Runtime stage ---
FROM node:24-alpine
WORKDIR /app

# sharp's runtime half of the build-time vips-dev above.
RUN apk add --no-cache vips

COPY --from=builder /app/frontends/postgres/.next/standalone ./
COPY --from=builder /app/frontends/postgres/.next/static ./frontends/postgres/.next/static
COPY --from=builder /app/frontends/postgres/public ./frontends/postgres/public
COPY --from=builder /app/frontends/postgres/migrations ./frontends/postgres/migrations

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

# Next's standalone output keeps the workspace layout, so the server lives
# under the app's own path rather than at the root.
WORKDIR /app/frontends/postgres
CMD ["node", "server.js"]
