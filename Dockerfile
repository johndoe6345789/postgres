# All-in-one image with PostgreSQL and Next.js
FROM node:20-bookworm

# Install PostgreSQL
RUN apt-get update && apt-get install -y \
    postgresql-15 \
    postgresql-client-15 \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Set up PostgreSQL
USER postgres
RUN /etc/init.d/postgresql start && \
    psql --command "CREATE USER docker WITH SUPERUSER PASSWORD 'docker';" && \
    createdb -O docker postgres

# Switch back to root
USER root

# Configure PostgreSQL to allow connections
RUN echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/15/main/pg_hba.conf && \
    echo "listen_addresses='*'" >> /etc/postgresql/15/main/postgresql.conf

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Build the Next.js application
RUN npm run build

# Copy startup script
COPY <<EOF /start.sh
#!/bin/bash
set -e

# Start PostgreSQL
service postgresql start

# Wait for PostgreSQL to be ready
until pg_isready -h localhost -p 5432; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

# Set DATABASE_URL if not provided
export DATABASE_URL=\${DATABASE_URL:-postgresql://docker:docker@localhost:5432/postgres}

# Run migrations
npm run db:migrate

# Create admin user if needed
if [ "\$CREATE_ADMIN_USER" = "true" ]; then
  npm run db:seed-admin || true
fi

# Start Next.js
exec npm start
EOF

RUN chmod +x /start.sh

# Expose ports
EXPOSE 3000 5432

# Environment variables
ENV NODE_ENV=production
ENV DATABASE_URL=postgresql://docker:docker@localhost:5432/postgres
ENV CREATE_ADMIN_USER=true
ENV ADMIN_USERNAME=admin
ENV ADMIN_PASSWORD=admin123
ENV JWT_SECRET=change-this-secret-in-production

# Set the default command
CMD ["/start.sh"]
