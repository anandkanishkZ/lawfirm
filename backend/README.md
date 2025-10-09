# Law Firm Management System - Backend API

A robust Node.js backend API for the Law Firm Management System using Express.js, PostgreSQL, and Prisma ORM.

## 🚀 Features

- **JWT Authentication** with secure cookie support
- **Password Security** with bcrypt hashing and strength validation
- **Role-Based Access Control** (Admin, Lawyer, Staff, Client)
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **Error Handling** with detailed logging
- **Database Management** with Prisma ORM
- **Security Middleware** (Helmet, CORS, etc.)

## 📋 Prerequisites

Before running this backend, make sure you have:

- **Node.js** (v16 or higher)
- **PostgreSQL** (v13 or higher)
- **npm** or **yarn** package manager

## ⚙️ Installation & Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
```

### 4. Configure Environment Variables
Edit the `.env` file with your settings:

```env
# Environment Configuration
NODE_ENV=development
PORT=5000

# Database Configuration (Update with your PostgreSQL credentials)
DATABASE_URL="postgresql://username:password@localhost:5432/lawfirm_db"

# JWT Configuration (Change these in production!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Cookie Configuration
COOKIE_SECRET="your-cookie-secret-key"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. Database Setup

#### Create PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE lawfirm_db;

# Exit PostgreSQL
\q
```

#### Generate Prisma Client & Push Schema
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push
```

#### Seed Database with Default Users
```bash
npm run db:seed
```

### 6. Start the Development Server
```bash
npm run dev
```

The API server will be running at `http://localhost:5000`

## 📊 Default Users

The database is seeded with these default users (password: `password`):

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@lawfirm.com | password |
| Lawyer | lawyer@lawfirm.com | password |
| Staff | staff@lawfirm.com | password |
| Client | client@example.com | password |

**⚠️ Important:** Change these default passwords in production!

## 🛠️ Available Scripts

```bash
# Development with auto-reload
npm run dev

# Production start
npm start

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Run database migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with default data
npm run db:seed
```

## 🔌 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | No |
| GET | `/api/auth/check-email` | Check if email exists | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/refresh-token` | Refresh JWT token | Yes |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health status |

## 📝 API Usage Examples

### Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "role": "CLIENT"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lawfirm.com",
    "password": "password"
  }'
```

### Get Current User (Protected Route)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔒 Security Features

- **Password Hashing** using bcrypt with salt rounds
- **JWT Tokens** with expiration and secure cookies
- **Rate Limiting** to prevent brute force attacks
- **Input Validation** and sanitization
- **CORS Protection** with configured origins
- **Helmet** for security headers
- **Role-Based Access Control**

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── middleware/
│   │   ├── auth.js              # JWT middleware
│   │   └── errorHandler.js      # Error handling
│   ├── routes/
│   │   └── auth.js              # Authentication routes
│   ├── utils/
│   │   ├── auth.js              # Auth utilities
│   │   └── validation.js        # Validation helpers
│   ├── index.js                 # Main server file
│   └── seed.js                  # Database seeder
├── prisma/
│   └── schema.prisma            # Database schema
├── package.json
├── .env.example
└── README.md
```

## 🚦 Development Workflow

1. **Start PostgreSQL** database
2. **Run the backend** with `npm run dev`
3. **Start the frontend** (from the main project directory)
4. **Test API endpoints** using the provided examples

## 🔧 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -U username -d lawfirm_db`

### Port Already in Use
- Change the `PORT` in `.env` file
- Kill existing process: `lsof -ti:5000 | xargs kill -9`

### Prisma Issues
- Regenerate client: `npm run db:generate`
- Reset database: `npx prisma db push --force-reset`

## 📈 Next Steps

This authentication system is ready for integration with the frontend. Future enhancements include:

- **Case Management API**
- **Document Management**
- **Billing System**
- **Calendar Integration**
- **Notification System**

## 🤝 Integration with Frontend

To integrate with the existing frontend:

1. Update the frontend `auth.tsx` to use API calls instead of mock data
2. Replace localStorage with secure HTTP-only cookies
3. Add proper error handling for API responses
4. Implement token refresh logic

---

**🔐 Security Note:** This implementation uses secure practices but should be reviewed by a security professional before production deployment.