# PostgreSQL Admin Panel

A **modern, beautiful web-based database administration tool** - a superior alternative to legacy tools like phpMyAdmin, Adminer, and pgAdmin.

Built with Next.js 16, Material UI, and TypeScript for a fast, intuitive, and secure database management experience.

## Overview

This is a **PostgreSQL database administration panel** that provides:
- 🎨 **Modern, beautiful UI** with Material UI components and dark mode support
- 🔒 **Secure authentication** with bcrypt password hashing and JWT sessions
- 📊 **Database viewing** - Browse tables, view data, and explore schema
- 🔍 **SQL query interface** - Execute SELECT queries safely with result display
- 🐳 **All-in-one Docker image** - PostgreSQL 15 and admin UI in one container
- ⚡ **Production-ready** - Deploy to Caprover, Docker, or any cloud platform
- 🚀 **Zero configuration** - Works out of the box with included PostgreSQL
- 🔐 **Security-first design** - SQL injection protection, session management, auto-generated passwords

## Why Choose This Over Legacy Tools?

| Old Tool | Issues | This Solution |
|----------|--------|---------------|
| **phpMyAdmin** | PHP-based, outdated UI, MySQL-only | Modern Next.js, beautiful UI, PostgreSQL |
| **Adminer** | Single PHP file, basic features | Full-featured app with secure authentication |
| **pgAdmin** | Heavy desktop app, complex setup | Lightweight web app, simple deployment |
| **SQL Workbench** | Desktop only, OS-specific | Web-based, works everywhere |

## Key Features

### Database Management
- 📊 **View database tables** - Browse all tables with metadata
- 📋 **Table data viewer** - View table contents with pagination
- 🔍 **SQL query interface** - Execute SELECT queries safely
- 🔒 **Query validation** - Only SELECT queries allowed for security
- 📈 **Row count display** - See result counts instantly

### Security & Authentication
- 🔐 **User/password authentication** - Secure bcrypt password hashing
- 🎫 **JWT session management** - HTTP-only cookies for sessions
- 🔑 **Auto-generated passwords** - Secure 32-character passwords
- 🛡️ **SQL injection protection** - Multiple layers of validation
- 🚫 **Query restrictions** - Only read-only SELECT queries allowed

### Deployment & Infrastructure
- 🐳 **All-in-one Docker image** - PostgreSQL + admin UI in one container
- 📦 **GitHub Container Registry** - Automated CI/CD builds
- ☁️ **Caprover compatible** - Deploy with one click
- 🌐 **Cloudflare Tunnel support** - Easy HTTPS without port exposure
- 💾 **Persistent storage** - Data survives container restarts
- 🔄 **Auto-migrations** - Database schema applied on startup

### User Experience
- 💎 **Material UI design** - Clean, modern interface
- 🌙 **Dark mode friendly** - Easy on the eyes
- ⚡ **Fast & responsive** - Built with React and Next.js
- 📱 **Mobile-friendly** - Responsive design for all devices

## Quick Start

### Option 1: Docker (Recommended)

The simplest way to get started. The Docker image includes PostgreSQL 15 and the admin UI.

```bash
# Pull and run from GitHub Container Registry
docker run -d \
  -p 3000:3000 \
  -p 5432:5432 \
  -e JWT_SECRET="your-secret-key-change-in-production" \
  -e CREATE_ADMIN_USER=true \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your-secure-password \
  --name postgres-admin \
  ghcr.io/johndoe6345789/postgres:latest
```

Or build locally:

```bash
git clone https://github.com/johndoe6345789/postgres.git
cd postgres
docker build -t postgres-admin .
docker run -d -p 3000:3000 -p 5432:5432 \
  -e JWT_SECRET="your-secret-key" \
  -e CREATE_ADMIN_USER=true \
  postgres-admin
```

**Access the admin panel**: http://localhost:3000/admin/login

Default credentials (if not specified):
- **Username**: `admin`
- **Password**: `admin123` (or auto-generated if not provided)

### Option 2: Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres-admin:
    image: ghcr.io/johndoe6345789/postgres:latest
    ports:
      - '3000:3000'
      - '5432:5432'
    environment:
      - JWT_SECRET=your-secret-key-change-in-production
      - CREATE_ADMIN_USER=true
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=your-secure-password
    volumes:
      - postgres_data:/var/lib/postgresql/15/main
    restart: unless-stopped

volumes:
  postgres_data:
```

Run:
```bash
docker-compose up -d
```

### Option 3: Local Development

Prerequisites:
- Node.js 20+
- PostgreSQL 15+ (or use included Docker setup)

```bash
# Clone repository
git clone https://github.com/johndoe6345789/postgres.git
cd postgres

# Install dependencies
npm install

# Set up environment
cp .env .env.local
# Edit .env.local with your database connection

# Run migrations
npm run db:migrate

# Create admin user
npm run db:seed-admin

# Start development server
npm run dev
```

**Access the admin panel**: http://localhost:3000/admin/login

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://docker:docker@localhost:5432/postgres` | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Auto-generated | Yes* |
| `CREATE_ADMIN_USER` | Create admin user on startup | `true` | No |
| `ADMIN_USERNAME` | Initial admin username | `admin` | No |
| `ADMIN_PASSWORD` | Initial admin password | `admin123` or auto-generated | No |
| `NODE_ENV` | Environment mode | `production` | No |

*JWT_SECRET is auto-generated if not provided, but must remain consistent across restarts.

### Security Best Practices

**For Production Deployments:**

1. **Set a strong JWT_SECRET**:
```bash
# Generate a secure secret
openssl rand -base64 32
```

2. **Use strong admin passwords**:
```bash
# Use the built-in password generator
npm run generate:password

# Output example:
# Password: xK9@mP2&vL8#qR5!wN7^zT4%yU6*aB3$
```

3. **Enable HTTPS** (via reverse proxy, Cloudflare, or Caprover)

4. **Change default credentials immediately** after first login

5. **Restrict network access** to trusted IPs if possible

### Admin User Management

#### Auto-generated Passwords

When creating an admin user without specifying a password, a secure 32-character password is automatically generated:

```bash
npm run db:seed-admin

# Output:
# ✅ Admin user created successfully!
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📧 Username: admin
# 🔑 Password: aB3$xK9@mP2&vL8#qR5!wN7^zT4%yU6*
# ⚠️  This password was auto-generated. Save it securely!
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🌐 Login at: http://localhost:3000/admin/login
```

#### Custom Credentials

Provide custom credentials via environment variables:

```bash
ADMIN_USERNAME=myuser ADMIN_PASSWORD=mypassword npm run db:seed-admin
```

Or using Docker:
```bash
docker run -p 3000:3000 \
  -e ADMIN_USERNAME=myuser \
  -e ADMIN_PASSWORD=mypassword \
  -e CREATE_ADMIN_USER=true \
  postgres-admin
```

#### Password Generator

Generate secure passwords for any use:

```bash
# Generate 32-character password (default)
npm run generate:password

# Generate 64-character password
npm run generate:password 64

# Generate without special characters
npm run generate:password 32 false
```

## Deployment Options

### Docker

The all-in-one Docker image is the easiest deployment option:

```bash
docker pull ghcr.io/johndoe6345789/postgres:latest

docker run -d \
  -p 3000:3000 \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/15/main \
  -e JWT_SECRET="$(openssl rand -base64 32)" \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your-secure-password \
  --name postgres-admin \
  --restart unless-stopped \
  ghcr.io/johndoe6345789/postgres:latest
```

### Caprover

Deploy to Caprover with minimal configuration:

1. **Create a new app** in Caprover dashboard
   - App Name: `postgres-admin`
   - Enable HTTPS (automatic via Let's Encrypt)

2. **Deploy via Dockerfile**
   - Caprover automatically uses the Dockerfile from the repository
   - No additional configuration needed

3. **Set Environment Variables**:
```
JWT_SECRET=<generate-with-openssl-rand-base64-32>
CREATE_ADMIN_USER=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

4. **Access**: https://postgres-admin.your-caprover-domain.com/admin/login

**Benefits:**
- ✅ Automatic HTTPS via Let's Encrypt
- ✅ Built-in PostgreSQL in the container
- ✅ Persistent storage handled by Caprover
- ✅ Auto-restart on failure
- ✅ Zero-downtime deployments

### Cloudflare Tunnel

Secure HTTPS access without exposing ports publicly:

1. **Install cloudflared**:
```bash
# Follow: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/
```

2. **Start the application**:
```bash
docker-compose up -d
```

3. **Create and configure tunnel**:
```bash
cloudflared tunnel login
cloudflared tunnel create postgres-admin
```

4. **Configure tunnel** (`~/.cloudflared/config.yml`):
```yaml
tunnel: <your-tunnel-id>
credentials-file: /path/to/<tunnel-id>.json

ingress:
  - hostname: postgres-admin.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

5. **Route DNS**:
```bash
cloudflared tunnel route dns postgres-admin postgres-admin.yourdomain.com
```

6. **Run tunnel**:
```bash
cloudflared tunnel run postgres-admin
```

**Access**: https://postgres-admin.yourdomain.com/admin/login

**Security Benefits:**
- ✅ Automatic HTTPS via Cloudflare
- ✅ DDoS protection
- ✅ WAF (Web Application Firewall)
- ✅ Rate limiting
- ✅ Optional Cloudflare Access for extra authentication

### External PostgreSQL Connection

Connect to an existing PostgreSQL database instead of using the built-in one:

```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@external-host:5432/dbname" \
  -e JWT_SECRET="your-secret" \
  -e CREATE_ADMIN_USER=true \
  postgres-admin
```

**Note:** Port 5432 is only exposed when using the built-in PostgreSQL database.

## Development

### Prerequisites
- Node.js 20+
- npm
- PostgreSQL 15+ (or use Docker)

### Setup

```bash
# Clone repository
git clone https://github.com/johndoe6345789/postgres.git
cd postgres

# Install dependencies
npm install

# Set up environment variables
cp .env .env.local
# Edit .env.local with your configuration

# Run database migrations
npm run db:migrate

# Create admin user
npm run db:seed-admin

# Start development server
npm run dev
```

### Available Scripts

#### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

#### Database
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Apply database migrations
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:seed-admin` - Create/reset admin user

#### Testing
- `npm run test` - Run unit tests with Vitest
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run storybook` - Start Storybook for component development

#### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues
- `npm run check:types` - TypeScript type checking

#### Utilities
- `npm run generate:password [length] [useSpecial]` - Generate secure passwords
- `npm run commit` - Interactive commit message generator

### Project Structure

```
├── src/
│   ├── app/
│   │   ├── admin/           # Admin panel pages
│   │   │   ├── login/       # Login page
│   │   │   └── dashboard/   # Admin dashboard
│   │   └── api/admin/       # Admin API routes
│   ├── components/          # React components
│   ├── models/              # Database models (DrizzleORM)
│   ├── utils/               # Utility functions
│   └── libs/                # Library configurations
├── migrations/              # Database migrations
├── scripts/                 # Utility scripts
│   ├── seed-admin.ts        # Admin user creation
│   └── generate-password.ts # Password generator
├── tests/                   # Test files
├── Dockerfile               # All-in-one Docker image
└── docker-compose.yml       # Docker Compose configuration
```

### Database Schema

The application uses DrizzleORM for database operations. Schemas are defined in `src/models/Schema.ts`.

**To modify the schema:**

1. Edit `src/models/Schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run db:migrate`

**Current schema includes:**
- `admin_users` - Admin panel user accounts
- Additional application tables as needed

### API Routes

Admin panel API endpoints:

- `POST /api/admin/login` - User authentication
- `POST /api/admin/logout` - User logout
- `GET /api/admin/tables` - List all database tables
- `POST /api/admin/table-data` - Get data from specific table
- `POST /api/admin/query` - Execute SQL query (SELECT only)

**Security Features:**
- JWT authentication required for all admin routes
- SQL injection protection with parameterized queries
- Only SELECT queries allowed in query interface
- HTTP-only cookies for session management

## Security

### Authentication & Authorization
- ✅ **Bcrypt password hashing** - Industry-standard password security
- ✅ **JWT session tokens** - Secure, stateless authentication
- ✅ **HTTP-only cookies** - Prevents XSS token theft
- ✅ **Auto-generated passwords** - Strong default credentials
- ✅ **Secure session management** - Automatic session expiration

### SQL Injection Protection
- ✅ **Query validation** - Only SELECT queries allowed
- ✅ **Parameterized queries** - All user input is properly escaped
- ✅ **Table name validation** - Whitelist-based table access
- ✅ **Multiple validation layers** - Defense in depth approach

### Production Security Checklist

Before deploying to production:

- [ ] Change default admin credentials
- [ ] Set a strong, unique JWT_SECRET
- [ ] Enable HTTPS (via reverse proxy or Cloudflare)
- [ ] Restrict database access to trusted IPs
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity
- [ ] Set up database backups
- [ ] Use strong PostgreSQL passwords

### Security Recommendations

1. **Use environment variables** for all secrets
2. **Enable HTTPS** for all production deployments
3. **Restrict network access** with firewall rules
4. **Regular backups** of PostgreSQL data
5. **Monitor logs** for unauthorized access attempts
6. **Update regularly** to get security patches

## Troubleshooting

### Common Issues

**Issue: Cannot connect to database**
- Ensure PostgreSQL is running
- Check DATABASE_URL is correct
- Verify network connectivity
- Check PostgreSQL logs: `docker logs <container-id>`

**Issue: Admin login fails**
- Verify admin user exists: Run `npm run db:seed-admin`
- Check JWT_SECRET is set correctly
- Clear browser cookies and try again
- Check logs for authentication errors

**Issue: Port already in use**
- Stop existing services on ports 3000 or 5432
- Or map to different ports: `-p 3001:3000 -p 5433:5432`

**Issue: Docker container exits immediately**
- Check logs: `docker logs postgres-admin`
- Verify environment variables are set
- Ensure JWT_SECRET is provided or auto-generated
- Check PostgreSQL initialization logs

**Issue: "Only SELECT queries allowed" error**
- SQL interface only allows read-only queries for security
- Use database tools for modifications
- Or access PostgreSQL directly on port 5432

### Getting Help

- **Issues**: https://github.com/johndoe6345789/postgres/issues
- **Discussions**: https://github.com/johndoe6345789/postgres/discussions
- **Documentation**: See [ADMIN_README.md](ADMIN_README.md) for additional details

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and improvements.

**Upcoming features:**
- Full CRUD operations (Create, Update, Delete)
- Visual database designer
- Multi-database server connections
- Advanced query builder
- Export data (CSV, JSON, SQL)
- Table schema editor
- User management with roles

## Contributing

Contributions are welcome! Here's how to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits (`npm run commit`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Use the interactive commit tool
npm run commit
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Remi W.
