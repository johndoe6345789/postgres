# Next.js Application with Multi-Database Support

A production-ready Next.js 16 application with database management capabilities, built with TypeScript, Tailwind CSS, and DrizzleORM for connecting to multiple database backends.

## Overview

This project is a full-stack web application featuring:
- **Next.js 16** with App Router for server-side rendering and static site generation
- **DrizzleORM** for type-safe database operations with support for PostgreSQL, MySQL, and SQLite
- **PostgreSQL 15** included as default database in Docker container
- **Multi-database support** - Connect to external PostgreSQL, MySQL, or SQLite servers
- **Authentication** using Clerk with support for multiple auth providers
- **TypeScript** for type safety across the entire stack
- **Tailwind CSS 4** for modern, responsive styling
- **Docker** support for easy deployment
- **Comprehensive testing** with Vitest, Playwright, and Storybook

## Features

- ⚡ **Next.js 16** with App Router support
- 🔥 **TypeScript** for type safety
- 💎 **Tailwind CSS 4** for styling
- 🔒 **Clerk Authentication** with social login support
- 📦 **DrizzleORM** - Support for PostgreSQL, MySQL, and SQLite
- 🔌 **Multi-Database Support** - Connect to custom database servers
- 🐳 **Docker** with included PostgreSQL 15 (default option)
- 🧪 **Testing Suite** - Vitest for unit tests, Playwright for E2E
- 🎨 **Storybook** for UI component development
- 📏 **ESLint & Prettier** for code quality
- 🔍 **TypeScript strict mode**
- 🌐 **Multi-language (i18n)** support with next-intl
- 🚨 **Error Monitoring** with Sentry
- 🔐 **Security** with Arcjet (bot detection, rate limiting)

## Quick Start

### Prerequisites
- Node.js 20+ and npm
- Docker (optional, for containerized deployment)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/johndoe6345789/postgres.git
cd postgres
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file:
```env
# Database
DATABASE_URL=postgresql://docker:docker@localhost:5432/postgres

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret

# Optional: Admin user creation
CREATE_ADMIN_USER=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

4. Run the development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser.

### Docker Deployment

The Docker container includes PostgreSQL 15 as the default database option. You can also connect to external database servers.

Build and run with included PostgreSQL:

```bash
docker build -t postgres-app .
docker run -p 3000:3000 -p 5432:5432 \
  -e JWT_SECRET=your_secret_here \
  postgres-app
```

Or connect to an external database:

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="******your-external-db:5432/mydb" \
  -e JWT_SECRET=your_secret_here \
  postgres-app
```

The Docker container includes both PostgreSQL and the Next.js application, but PostgreSQL is optional - you can connect to any external PostgreSQL, MySQL, or SQLite database.

## Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── models/           # Database models (DrizzleORM schemas)
│   ├── utils/            # Utility functions
│   ├── libs/             # Third-party library configurations
│   └── locales/          # i18n translations
├── tests/
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
├── migrations/           # Database migrations
├── public/               # Static assets
├── Dockerfile            # Docker configuration
└── docker-compose.yml    # Docker Compose setup
```

## Available Scripts

### Development
- `npm run dev` - Start development server with live reload
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run build-local` - Build with local database

### Database
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Apply database migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:seed-admin` - Seed admin user

### Testing
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run storybook` - Start Storybook for component development

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues automatically
- `npm run check:types` - Type check with TypeScript
- `npm run check:deps` - Check for unused dependencies
- `npm run check:i18n` - Validate translations

### Utilities
- `npm run commit` - Interactive commit message generator (Conventional Commits)
- `npm run generate:password` - Generate secure passwords

## Database Schema

This application uses [DrizzleORM](https://orm.drizzle.team/) which supports multiple database backends:
- **PostgreSQL** (default, included in Docker container)
- **MySQL/MariaDB** (connect to external server)
- **SQLite** (for local development)

Database schemas are defined in `src/models/Schema.ts` using DrizzleORM. To modify the schema:

1. Edit `src/models/Schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run db:migrate`

### Connecting to Different Databases

The included PostgreSQL in Docker is just the default option. You can connect to any database by setting the `DATABASE_URL` environment variable:

**PostgreSQL:**
```env
DATABASE_URL=******localhost:5432/mydb
```

**MySQL:**
```env
DATABASE_URL=mysql://user:password@localhost:3306/mydb
```

**SQLite:**
```env
DATABASE_URL=file:./local.db
```

## Authentication

This project uses [Clerk](https://clerk.com) for authentication. To set up:

1. Create a Clerk account and application
2. Copy your API keys to `.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Features include:
- Email/password authentication
- Social login (Google, GitHub, etc.)
- Multi-factor authentication (MFA)
- User management dashboard

## Testing

### Unit Tests
Run unit tests with Vitest:
```bash
npm run test
```

Unit tests are located alongside source files with `.test.ts` or `.test.tsx` extensions.

### E2E Tests
Run end-to-end tests with Playwright:
```bash
npx playwright install  # First time only
npm run test:e2e
```

E2E tests are in the `tests/e2e` directory with `.e2e.ts` extensions.

### Component Development
Use Storybook for isolated component development:
```bash
npm run storybook
```

## Deployment

### Environment Variables

Required environment variables for production:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `JWT_SECRET` - Secret for JWT token signing
- `NODE_ENV=production`

Optional:
- `CREATE_ADMIN_USER` - Set to `true` to create admin user on startup
- `ADMIN_USERNAME` - Admin username (default: admin)
- `ADMIN_PASSWORD` - Admin password (default: admin123)

### Docker

The application can be deployed using the included Dockerfile:

```bash
# Build image
docker build -t postgres-app .

# Run container
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e CLERK_SECRET_KEY="sk_..." \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..." \
  -e JWT_SECRET="your-secret" \
  postgres-app
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits (`npm run commit`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Use the interactive commit tool:

```bash
npm run commit
```

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and improvements.

## License

Licensed under the MIT License. See [LICENSE](LICENSE) for more information.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.
