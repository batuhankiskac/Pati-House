# Pati House

## Default Admin Credentials

The seeded administrator account uses the following credentials:

- **Username:** `Hill`
- **Password:** `Yula.2024`

If you reseed or reset the database, ensure the admin entry uses the same values so you can sign in to the dashboard. During local development the app will also fall back to these credentials when the PostgreSQL instance is unavailable, so you can still access the admin area while working offline.

## Site Setup Instructions

This guide will help you resolve the "ECONNREFUSED" error that occurs when the PostgreSQL database is not running. Follow these steps to diagnose and fix the issue.

### 1. Check if Docker and Docker Compose are Installed

First, verify that Docker and Docker Compose are installed on your system:

#### Check Docker Installation
```bash
docker --version
```

Expected output:
```
Docker version 20.10.0 or higher, build xxxxxxx
```

#### Check Docker Compose Installation
```bash
docker-compose --version
```

Expected output:
```
docker-compose version 1.29.0 or higher, build xxxxxxx
```

#### Alternative Docker Compose Check (Docker v20.10+)
```bash
docker compose version
```

Expected output:
```
Docker Compose version v2.0.0 or higher
```

If Docker is not installed, refer to the "What to do if Docker is not installed" section at the end of this guide.

### 2. Start the PostgreSQL Database Using Docker Compose

Navigate to your project directory and start the database services:

```bash
cd /path/to/your/project
docker-compose up -d postgres
```

This command will:
- Start the PostgreSQL database container in detached mode
- Create the `pati_dev` database
- Initialize it with the schema from `src/lib/db/schema.sql`
- Map port 5432 on your host to port 5432 in the container

Expected output:
```
Creating network "pati_default" with the default driver
Creating volume "pati_postgres_data" with default driver
Creating pati_postgres_1 ... done
```

### 3. Verify the Database is Running Properly

#### Check if the container is running
```bash
docker-compose ps
```

Expected output showing the postgres service is running:
```
      Name                     Command               State           Ports
----------------------------------------------------------------------------------
pati_postgres_1      docker-entrypoint.sh postgres    Up      0.0.0.0:5432->5432/tcp
```

#### Check the container logs
```bash
docker-compose logs postgres
```

Look for messages indicating the database is ready:
```
LOG: database system is ready to accept connections
```

#### Test database connectivity
```bash
# Connect to the database container
docker-compose exec postgres psql -U postgres -d pati_dev
```

Expected output:
```
psql (13.x)
Type "help" for help.

pati_dev=#
```

You can run simple SQL commands to verify:
```sql
\dt
-- Should show tables: adoption_requests, cats, users

SELECT COUNT(*) FROM cats;
-- Should return a count (0 if no data)

\q
-- To exit the database shell
```

### 4. Troubleshooting Common Issues

#### Issue: Port already in use
If you see an error like "port is already allocated":
```bash
Error response from daemon: Ports are not available: listen tcp 0.0.0.0:5432: bind: address already in use
```

Solution:
1. Check what's using port 5432:
   ```bash
   lsof -i :5432
   ```
2. Stop the conflicting service or change the port mapping in `docker-compose.yml`

#### Issue: Container fails to start
If the container exits immediately:
```bash
docker-compose ps
```

Shows the container in "Exit" state.

Solution:
1. Check detailed logs:
   ```bash
   docker-compose logs postgres
   ```
2. Look for error messages and address them accordingly

#### Issue: Database connection refused from application
If your application still can't connect:

1. Verify environment variables:
   Check that your `.env` or `.env.development` file contains:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pati_dev
   ```

### Optional: Enable Redis Caching

The admin panel and API work even if Redis is not running. By default, caching is disabled unless you explicitly provide a `REDIS_URL` environment variable. When the variable is missing, the application falls back to an in-memory no-op cache so you won't see repeated `ECONNREFUSED 127.0.0.1:6379` errors while developing locally.

To enable Redis caching:

1. Start a Redis instance (for example with Docker):
   ```bash
   docker run --name pati-redis -p 6379:6379 -d redis:7
   ```
2. Set the connection string in your environment:
   ```
   REDIS_URL=redis://localhost:6379
   ```
3. Restart the Next.js dev server so it picks up the new configuration.

If Redis becomes unavailable at runtime, the cache gracefully falls back to the no-op implementation and your requests will continue to work.

2. Test connection from host:
   ```bash
   # Install PostgreSQL client if not already installed
   # Ubuntu/Debian:
   sudo apt-get install postgresql-client

   # macOS with Homebrew:
   brew install libpq
   brew link libpq --force

   # Test connection
   psql -h localhost -p 5432 -U postgres -d pati_dev
   ```

3. If connection still fails, restart the container:
   ```bash
   docker-compose down
   docker-compose up -d postgres
   ```

#### Issue: Permission denied errors
If you encounter permission issues with volumes:

1. Stop the containers:
   ```bash
   docker-compose down
   ```

2. Remove the volumes:
   ```bash
   docker volume rm pati_postgres_data
   ```

3. Restart the services:
   ```bash
   docker-compose up -d postgres
   ```

### 5. What to do if Docker is not installed

#### Installing Docker on Ubuntu/Debian:
```bash
# Update package index
sudo apt-get update

# Install Docker
sudo apt-get install docker.io

# Start Docker service
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker

# Add your user to the docker group (to run Docker without sudo)
sudo usermod -aG docker $USER

# Log out and log back in for group changes to take effect
```

#### Installing Docker on macOS:
1. Download Docker Desktop for Mac from [Docker's website](https://www.docker.com/products/docker-desktop)
2. Follow the installation instructions
3. Start Docker Desktop

#### Installing Docker on Windows:
1. Download Docker Desktop for Windows from [Docker's website](https://www.docker.com/products/docker-desktop)
2. Follow the installation instructions
3. Start Docker Desktop

#### Installing Docker Compose:
If Docker Compose is not installed separately:

##### On Ubuntu/Debian:
```bash
sudo apt-get install docker-compose-plugin
```

##### On other systems:
Follow the official Docker Compose installation guide: https://docs.docker.com/compose/install/

### 6. Additional Verification Steps

#### Run the application's database test script
```bash
npm run test:db
```

Or if using a direct test:
```bash
node src/lib/db/test-connection.ts
```

Expected successful output:
```
Testing database connection...
✅ Database connection successful!
Current time from database: 2025-09-21T08:00:00.000Z
```

#### Check application logs
If the application is still having issues, check the application logs:
```bash
# If logs are written to a file
tail -f logs/app.log

# Or check any error output from your application
```

### 7. Useful Docker Commands for Database Management

#### View running containers
```bash
docker-compose ps
```

#### Stop the database container
```bash
docker-compose stop postgres
```

#### Restart the database container
```bash
docker-compose restart postgres
```

#### Remove the database container (data will be preserved in the volume)
```bash
docker-compose rm postgres
```

#### Remove the database container and its volume (WARNING: This will delete all data)
```bash
docker-compose down -v
```

#### Access the database shell directly
```bash
docker-compose exec postgres psql -U postgres -d pati_dev
```

#### View container logs
```bash
docker-compose logs postgres
```

#### Follow container logs in real-time
```bash
docker-compose logs -f postgres
```

### Conclusion

Following these steps should resolve the database connectivity issue. The most common cause is simply that the Docker container with the PostgreSQL database is not running. Starting it with `docker-compose up -d postgres` should fix the "ECONNREFUSED" error.

If you continue to experience issues, check:
1. That Docker and Docker Compose are properly installed
2. That the correct environment variables are set
3. That there are no port conflicts
4. That your user has proper permissions to run Docker commands
