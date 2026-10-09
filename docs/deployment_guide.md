# Production Deployment & Setup Guide — Sathuragiri Decoration

## 1. Prerequisites
- **Node.js**: v18.x or v20.x LTS
- **PostgreSQL**: v14+ (or SQLite for zero-config local development)
- **Package Manager**: npm v9+

---

## 2. Environment Variables Configuration

### Server (`server/.env`):
```env
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://user:password@localhost:5432/sathuragiri_db?schema=public"
JWT_SECRET="your_long_secure_jwt_secret_random_string_2026"
JWT_EXPIRES_IN="7d"
COOKIE_SECRET="your_secure_cookie_secret_key"
CLIENT_URL="https://sathuragiridecoration.com"
```

### Client (`client/.env`):
```env
VITE_API_BASE_URL="https://api.sathuragiridecoration.com/api/v1"
```

---

## 3. Database Initialization (PostgreSQL)

1. Switch datasource provider in `server/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Run Prisma migrations:
   ```bash
   cd server
   npx prisma migrate deploy
   ```
3. Seed the database with initial categories, services, packages, and admin credentials:
   ```bash
   npm run db:seed
   ```

---

## 4. Production Build & Execution

### Building the Entire Stack:
```bash
npm run build
```

### Running Backend with PM2:
```bash
cd server
npm install -g pm2
pm2 start dist/server.js --name "sathuragiri-api"
pm2 save
```

### Serving Frontend with NGINX / Caddy:
Point your web server root to `client/dist` and configure SPA history mode routing (`try_files $uri $uri/ /index.html;`).

---

## 5. Security & Maintenance Checklist
- [x] HTTPS enforced on all domains.
- [x] HttpOnly, Secure, SameSite cookies enabled in production mode.
- [x] Rate limiting active on authentication (`/auth/login`) and enquiry submission (`/enquiries`).
- [x] CORS origin restricted to the official production frontend domain.
- [x] Database backups scheduled with `pg_dump`.
