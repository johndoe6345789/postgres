# Postgres Web Admin Panel

A modern web-based admin interface for PostgreSQL with Material UI.

## Features

- 🔐 User/password authentication
- 💎 Material UI design
- 📊 View database tables
- 🔍 SQL query interface (SELECT only for security)
- 📋 Table data viewer with pagination
- 🐳 Docker support
- 📦 GitHub Container Registry (GHCR) integration

## Quick Start

### 1. Setup Database

First, ensure your database is running and migrations are applied:

```bash
npm run db:migrate
```

### 2. Create Admin User

Create an admin user for logging into the admin panel:

```bash
npm run db:seed-admin
```

This creates a default admin user:
- **Username**: admin
- **Password**: admin123

You can customize these credentials by setting environment variables:
```bash
ADMIN_USERNAME=myuser ADMIN_PASSWORD=mypassword npm run db:seed-admin
```

### 3. Access the Admin Panel

Start the development server:
```bash
npm run dev
```

Navigate to: **http://localhost:3000/admin/login**

## Docker Deployment

The project includes an **all-in-one Docker image** that contains both PostgreSQL and the Next.js application, making deployment simple and straightforward.

### Build Docker Image

```bash
docker build -t postgres-admin .
```

### Run with Docker (All-in-One)

The simplest way to run the application is using the all-in-one image:

```bash
docker run -p 3000:3000 -p 5432:5432 \
  -e JWT_SECRET="your-secret-key" \
  -e ADMIN_USERNAME="admin" \
  -e ADMIN_PASSWORD="admin123" \
  postgres-admin
```

The container will:
1. Start PostgreSQL automatically
2. Run database migrations
3. Create the admin user
4. Start the Next.js application

Access the admin panel at: **http://localhost:3000/admin/login**

### Using Docker Compose

The easiest way to run the application:

```bash
docker-compose up
```

This will:
- Build the all-in-one image
- Start PostgreSQL and Next.js in the same container
- Expose ports 3000 (web) and 5432 (database)
- Create a persistent volume for PostgreSQL data
- Automatically create an admin user

Access the admin panel at: **http://localhost:3000/admin/login**

Default credentials:
- **Username**: admin
- **Password**: admin123

### Multi-Container Setup (Optional)

If you prefer to run PostgreSQL in a separate container, create this `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  admin:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/mydb
      JWT_SECRET: your-secret-key-here
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Run:
```bash
docker-compose up
```

## GitHub Container Registry (GHCR)

The project automatically builds and publishes Docker images to GitHub Container Registry when you push to the main branch or create tags.

### Pull from GHCR

```bash
docker pull ghcr.io/johndoe6345789/postgres:latest
```

### Run from GHCR

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e JWT_SECRET="your-secret-key" \
  ghcr.io/johndoe6345789/postgres:latest
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key-change-in-production` |
| `ADMIN_USERNAME` | Initial admin username | `admin` |
| `ADMIN_PASSWORD` | Initial admin password | `admin123` |

## Security

- Only SELECT queries are allowed in the SQL query interface
- Password authentication with bcrypt hashing
- JWT-based session management
- HTTP-only cookies for session tokens
- Protected API routes requiring authentication

## API Routes

- `POST /api/admin/login` - User login
- `POST /api/admin/logout` - User logout  
- `GET /api/admin/tables` - List all database tables
- `POST /api/admin/query` - Execute SQL query (SELECT only)

## Production Deployment

1. Set strong passwords for admin users
2. Use a secure JWT_SECRET
3. Enable HTTPS
4. Configure proper CORS settings
5. Set up database backups
6. Monitor logs and errors

## Development

```bash
# Install dependencies
npm install

# Run migrations
npm run db:migrate

# Create admin user
npm run db:seed-admin

# Start dev server
npm run dev
```

## License

MIT
