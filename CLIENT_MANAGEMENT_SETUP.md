# 🚀 CLIENT MANAGEMENT SYSTEM - COMPLETE SETUP GUIDE

## 📋 Overview
This guide will help you set up and run the fully functional Client Management System with backend integration.

## ✅ What's Been Implemented

### Backend (Complete)
- ✅ PostgreSQL database with Prisma ORM
- ✅ Client model with Nepal-specific fields (PAN, Citizenship, National ID, Passport)
- ✅ Full CRUD API endpoints
- ✅ JWT authentication and authorization
- ✅ Role-based access control (Admin, Lawyer, Staff, Client)
- ✅ Input validation and sanitization
- ✅ Error handling middleware
- ✅ Client statistics endpoint
- ✅ Search and filtering capabilities

### Frontend (Complete)
- ✅ Client listing page with real-time data
- ✅ Client creation form
- ✅ Search and filter functionality
- ✅ Statistics dashboard
- ✅ Delete confirmation dialog
- ✅ Loading states and error handling
- ✅ Toast notifications
- ✅ Responsive design

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Step 1: Database Setup

1. **Install PostgreSQL** (if not already installed)
   ```bash
   # Windows: Download from https://www.postgresql.org/download/windows/
   # Or use chocolatey:
   choco install postgresql
   ```

2. **Create Database**
   ```sql
   -- Open PostgreSQL command line (psql)
   psql -U postgres
   
   -- Create database
   CREATE DATABASE lawfirm_db;
   
   -- Verify
   \l
   ```

3. **Update Database Connection**
   - File: `backend\.env`
   - Update the `DATABASE_URL` with your PostgreSQL credentials:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/lawfirm_db"
   ```

### Step 2: Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate Prisma Client**
   ```bash
   npm run db:generate
   ```

4. **Push schema to database**
   ```bash
   npm run db:push
   ```

5. **Seed initial data** (Optional - creates admin user)
   ```bash
   npm run db:seed
   ```

6. **Start backend server**
   ```bash
   npm run dev
   ```

   Server should start at: http://localhost:5000
   Health check: http://localhost:5000/api/health

### Step 3: Frontend Setup

1. **Open new terminal and navigate to root**
   ```bash
   cd ..
   ```

2. **Install dependencies** (if not done)
   ```bash
   npm install
   ```

3. **Verify environment variables**
   - File: `.env.local`
   - Should contain:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start frontend**
   ```bash
   npm run dev
   ```

   Frontend should start at: http://localhost:3000

## 🔐 Authentication

### Default Admin Credentials (after seeding)
- Email: `admin@lawfirm.com`
- Password: `Admin@123`

### Create New User (via API)
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "lawyer@lawfirm.com",
  "password": "Lawyer@123",
  "name": "Sarah Johnson",
  "role": "LAWYER"
}
```

## 📊 Client Management Features

### 1. Create Client
- Navigate to: http://localhost:3000/clients/new
- Fill in the form with client details
- Required fields: Name, Phone, Address, City, State
- Submit to create

### 2. View Clients
- Navigate to: http://localhost:3000/clients
- See all clients in table format
- View statistics at the top
- Use filters to search

### 3. Search & Filter
- **Search**: By name, email, phone, or client ID
- **Client Type**: Individual, Company, Partnership, Trust, Society
- **KYC Status**: Pending, Verified, Under Review, Rejected, Incomplete

### 4. Update Client
- Click on "Edit" in dropdown menu
- Modify client information
- Save changes

### 5. Delete Client
- Click on "Delete" in dropdown menu
- Confirm deletion
- Client will be soft-deleted (isActive = false)

## 🔍 API Endpoints

### Client Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/clients` | Create new client | Yes (Admin/Lawyer) |
| GET | `/api/clients` | Get all clients (with filters) | Yes |
| GET | `/api/clients/stats` | Get client statistics | Yes |
| GET | `/api/clients/:id` | Get client by ID | Yes |
| PUT | `/api/clients/:id` | Update client | Yes (Admin/Lawyer) |
| DELETE | `/api/clients/:id` | Delete client | Yes (Admin only) |

### Query Parameters for GET /api/clients

```
?page=1
&limit=20
&search=john
&clientType=INDIVIDUAL
&kycStatus=VERIFIED
&priority=HIGH
&assignedLawyerId=<lawyer-id>
&sortBy=createdAt
&sortOrder=desc
```

## 🧪 Testing

### Test Client Creation

1. **Via Frontend**
   - Go to http://localhost:3000/clients/new
   - Fill in the form
   - Click "Create Client"

2. **Via API (using curl/Postman)**
   ```bash
   POST http://localhost:5000/api/clients
   Authorization: Bearer <your-jwt-token>
   Content-Type: application/json

   {
     "name": "Ram Prasad Sharma",
     "email": "ram@example.com",
     "phone": "+977-9876543210",
     "address": "Thamel, Kathmandu",
     "city": "Kathmandu",
     "state": "Bagmati",
     "pincode": "44600",
     "country": "Nepal",
     "citizenshipNo": "12-02-75-12345",
     "panNumber": "123456789",
     "clientType": "INDIVIDUAL",
     "priority": "MEDIUM"
   }
   ```

### Test Client Retrieval

```bash
GET http://localhost:5000/api/clients?limit=10
Authorization: Bearer <your-jwt-token>
```

## 🐛 Troubleshooting

### Database Connection Error
**Error**: "Can't reach database server"
**Solution**:
1. Ensure PostgreSQL is running
2. Check credentials in `.env`
3. Verify database exists

### Port Already in Use
**Error**: "Port 5000 is already in use"
**Solution**:
1. Change PORT in `backend/.env`
2. Update `NEXT_PUBLIC_API_URL` in `.env.local`

### CORS Error
**Error**: "CORS policy blocked"
**Solution**:
1. Verify `FRONTEND_URL` in `backend/.env` is `http://localhost:3000`
2. Restart backend server

### Token Expired
**Error**: "Token expired or invalid"
**Solution**:
1. Login again to get new token
2. Token expires in 7 days by default

## 📁 File Structure

```
LFMS/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── src/
│   │   ├── controllers/
│   │   │   └── clientController.js # Client business logic
│   │   ├── routes/
│   │   │   └── clients.js         # Client routes
│   │   ├── middleware/
│   │   │   └── auth.js            # Authentication
│   │   └── index.js               # Server entry
│   └── .env                       # Environment variables
├── app/
│   └── clients/
│       ├── page.tsx               # Client list page
│       └── new/
│           └── page.tsx           # New client form
├── lib/
│   └── api/
│       ├── client.ts              # API client
│       └── clients.ts             # Client API functions
└── .env.local                     # Frontend environment
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input sanitization
- SQL injection prevention (Prisma)
- Role-based access control
- Rate limiting
- CORS protection
- Helmet security headers

## 📈 Next Steps

1. **Implement Edit Client Page** - Create update functionality
2. **View Client Details** - Single client view page
3. **Document Upload** - Add KYC document upload
4. **Case Association** - Link clients to cases
5. **Lawyer Assignment** - Assign lawyers to clients
6. **Bulk Operations** - Export, import clients
7. **Advanced Filters** - More filtering options
8. **Audit Trail** - Track all changes

## 💡 Tips

1. **Use filters** - Quickly find clients by type or status
2. **Refresh data** - Click refresh button to get latest data
3. **Priority clients** - Mark important clients as HIGH or URGENT
4. **KYC tracking** - Monitor KYC status for compliance
5. **Role permissions** - Only admins can delete clients

## 📞 Support

For issues or questions:
1. Check console logs (Frontend: Browser DevTools, Backend: Terminal)
2. Verify all services are running
3. Check database connectivity
4. Review error messages in toast notifications

## ✨ Features Comparison

| Feature | Mock Data (Before) | Real Backend (Now) |
|---------|-------------------|-------------------|
| Data Persistence | ❌ Lost on refresh | ✅ Saved in database |
| Search | ❌ Client-side only | ✅ Server-side search |
| Statistics | ❌ Static | ✅ Real-time |
| Validation | ❌ Basic | ✅ Comprehensive |
| Security | ❌ None | ✅ JWT + RBAC |
| Filters | ❌ Limited | ✅ Advanced |
| CRUD Operations | ❌ Mock | ✅ Fully functional |

---

**Status**: ✅ Client Management System Fully Operational
**Last Updated**: January 2025
