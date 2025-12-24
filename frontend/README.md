# 🏛️ Law Firm Management System

A comprehensive, full-stack law firm management system built with Next.js frontend and Node.js backend.

## 🚀 Features

### 🎯 Currently Implemented
- ✅ **Full Authentication System** - JWT-based with role-based access control
- ✅ **User Management** - Admin, Lawyer, Staff, Client roles
- ✅ **Secure Backend API** - Node.js + Express + PostgreSQL + Prisma
- ✅ **Modern Frontend** - Next.js 13 + TypeScript + Tailwind CSS
- ✅ **Real-time Connection Status** - Backend connectivity monitoring
- ✅ **Password Security** - Bcrypt hashing with strength validation
- ✅ **Rate Limiting** - Protection against brute force attacks

### 📋 Planned Features
- 🔄 Case Management System
- 🔄 Client Portal
- 🔄 Document Management
- 🔄 Calendar & Hearing Scheduling
- 🔄 Billing & Invoice System
- 🔄 Task Management
- 🔄 Notification System

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 13 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** React Context
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Animations:** Framer Motion

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **Security:** Helmet, CORS, Rate Limiting
- **Validation:** express-validator

## 🚦 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### 1. Clone & Setup
```bash
git clone https://github.com/jayshant/law-firm-management-system.git
cd law-firm-management-system

# Install frontend dependencies
npm install

# Setup backend
cd backend
npm install
cp .env.example .env
```

### 2. Database Setup
```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE lawfirm_db;"

# Update backend/.env with your database credentials
# DATABASE_URL="postgresql://postgres:your_password@localhost:5432/lawfirm_db"

# Generate Prisma client and push schema
npm run db:generate
npm run db:push

# Seed database with default users
npm run db:seed
```

### 3. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 4. Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **API Health:** http://localhost:5000/api/health

## 👥 Default Users

| Role   | Email               | Password | Access Level    |
|--------|---------------------|----------|-----------------|
| Admin  | admin@lawfirm.com   | password | Full access     |
| Lawyer | lawyer@lawfirm.com  | password | Case management |
| Staff  | staff@lawfirm.com   | password | Limited access  |
| Client | client@example.com  | password | View only       |

⚠️ **Important:** Change these passwords in production!

## 📁 Project Structure

```
law-firm-management-system/
├── 📁 frontend/
│   ├── 📁 app/                    # Next.js App Router pages
│   │   ├── 📁 dashboard/          # Dashboard page
│   │   ├── 📁 cases/             # Cases management
│   │   ├── 📁 clients/           # Client management
│   │   └── 📄 layout.tsx         # Root layout
│   ├── 📁 components/            # Reusable UI components
│   │   ├── 📁 auth/              # Authentication components
│   │   ├── 📁 layout/            # Layout components
│   │   └── 📁 ui/                # Base UI components
│   ├── 📁 lib/                   # Utilities & configuration
│   │   ├── 📁 api/               # API client & services
│   │   ├── 📄 auth.tsx           # Authentication context
│   │   └── 📄 utils.ts           # Helper utilities
│   └── 📁 types/                 # TypeScript definitions
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 📁 controllers/       # API route handlers
│   │   ├── 📁 middleware/        # Express middleware
│   │   ├── 📁 routes/            # API routes
│   │   ├── 📁 utils/             # Backend utilities
│   │   ├── 📁 config/            # Configuration files
│   │   └── 📄 index.js           # Server entry point
│   ├── 📁 prisma/               # Database schema
│   └── 📄 package.json          # Backend dependencies
└── 📄 TESTING_GUIDE.md         # Comprehensive testing guide
```

## 🔐 Security Features

- **JWT Authentication** with secure HTTP-only cookies
- **Password Hashing** using bcrypt with 12 salt rounds
- **Rate Limiting** to prevent brute force attacks
- **Input Validation** and sanitization
- **CORS Protection** with configured origins
- **SQL Injection Prevention** via Prisma ORM
- **XSS Protection** with input sanitization
- **Security Headers** via Helmet middleware

## 🧪 Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

### Quick Test
```bash
# Test backend health
curl http://localhost:5000/api/health

# Test login API
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lawfirm.com","password":"password"}'
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |

## 🔧 Development Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend
```bash
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm run db:generate # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:migrate  # Run database migrations
npm run db:studio   # Open Prisma Studio
npm run db:seed     # Seed database with default data
```

## 🚀 Deployment

### Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Backend (.env):**
```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-super-secret-jwt-key"
FRONTEND_URL="https://your-domain.com"
```

### Production Considerations
- Use strong JWT secrets
- Enable SSL/HTTPS
- Configure proper CORS origins
- Set up database backups
- Monitor application logs
- Implement proper error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [TESTING_GUIDE.md](./TESTING_GUIDE.md)
2. Ensure both frontend and backend servers are running
3. Verify database connection
4. Check browser console for errors
5. Review backend logs for API errors

## 🔄 Roadmap

### Phase 1: Core Foundation ✅
- [x] Authentication system
- [x] User management
- [x] Basic UI framework

### Phase 2: Case Management 🔄
- [ ] Case CRUD operations
- [ ] Case assignment workflow
- [ ] Case status tracking
- [ ] Document association

### Phase 3: Client Portal 📋
- [ ] Client registration
- [ ] KYC document upload
- [ ] Client dashboard
- [ ] Communication tools

### Phase 4: Document Management 📋
- [ ] File upload system
- [ ] Document categorization
- [ ] Search and filtering
- [ ] Version control

### Phase 5: Advanced Features 📋
- [ ] Calendar integration
- [ ] Billing system
- [ ] Notification system
- [ ] Reporting dashboard
- [ ] Mobile app

---

**Built with ❤️ for legal professionals**
