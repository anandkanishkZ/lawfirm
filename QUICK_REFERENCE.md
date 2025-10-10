# 🚀 QUICK REFERENCE - CLIENT MANAGEMENT SYSTEM

## ⚡ Quick Start Commands

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
npm run dev
```

**Access**: http://localhost:3000/clients  
**Login**: admin@lawfirm.com / Admin@123

---

## 📋 Common Tasks

### Create a Client
1. Go to: http://localhost:3000/clients/new
2. Fill required fields: Name, Phone, Address, City, State
3. Click "Create Client"

### Search Clients
1. Go to: http://localhost:3000/clients
2. Type in search box (name/email/phone)
3. Use filters for type/KYC status

### Delete a Client
1. Click "..." on client row
2. Select "Delete"
3. Confirm in dialog

---

## 🔧 Quick Fixes

### Backend Won't Start
```bash
# Check PostgreSQL is running
# Verify .env file exists in backend/
# Check DATABASE_URL in backend/.env
```

### Frontend Can't Connect
```bash
# Verify backend is running: http://localhost:5000/api/health
# Check .env.local has: NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Database Error
```sql
-- Create database if missing
CREATE DATABASE lawfirm_db;

-- Then run:
cd backend
npm run db:push
npm run db:seed
```

---

## 📍 Key URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main app |
| Clients Page | http://localhost:3000/clients | Client list |
| New Client | http://localhost:3000/clients/new | Create client |
| Backend | http://localhost:5000 | API server |
| Health Check | http://localhost:5000/api/health | Status |

---

## 🔑 API Endpoints

```bash
# Authentication
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me

# Clients
POST   /api/clients              # Create
GET    /api/clients              # List (with filters)
GET    /api/clients/stats        # Statistics
GET    /api/clients/:id          # Get one
PUT    /api/clients/:id          # Update
DELETE /api/clients/:id          # Delete
```

---

## 🎯 Search & Filter Examples

```bash
# Search by name
/api/clients?search=ram

# Filter by type
/api/clients?clientType=INDIVIDUAL

# Filter by KYC
/api/clients?kycStatus=VERIFIED

# Combined
/api/clients?search=ram&clientType=INDIVIDUAL&kycStatus=PENDING

# Pagination
/api/clients?page=1&limit=20
```

---

## 📊 Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Create migration
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio (GUI)
npm run db:studio
```

---

## 🔒 Permissions

| Action | Admin | Lawyer | Staff | Client |
|--------|-------|--------|-------|--------|
| Create | ✅ | ✅ | ❌ | ❌ |
| View All | ✅ | Assigned | Assigned | ❌ |
| Edit | ✅ | Assigned | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ |

---

## 📝 Client Fields

### Required
- Name
- Phone
- Address
- City
- State

### Optional
- Email
- Alternate Phone
- Postal Code
- Country (default: Nepal)

### Identity (Nepal)
- PAN Number
- Citizenship Number
- National ID
- Passport Number

### Company (if applicable)
- Company Name
- Company Type
- Registration Number

---

## ⚙️ Environment Variables

### Backend (.env)
```bash
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/lawfirm_db"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🧪 Testing

### Run API Tests
```powershell
.\test-api.ps1
```

### Manual Test Checklist
- [ ] Create client
- [ ] View clients list
- [ ] Search clients
- [ ] Filter by type
- [ ] Filter by KYC
- [ ] Delete client
- [ ] Check statistics

---

## 🐛 Common Errors

| Error | Solution |
|-------|----------|
| "Can't reach database" | Check PostgreSQL is running |
| "Port 5000 in use" | Change PORT in backend/.env |
| "Token expired" | Login again |
| "CORS error" | Check FRONTEND_URL in backend/.env |
| "Module not found" | Run `npm install` |

---

## 📂 Important Files

```
backend/
  .env                        # Backend config
  src/index.js               # Server entry
  src/controllers/clientController.js
  src/routes/clients.js
  prisma/schema.prisma       # Database schema

frontend/
  .env.local                 # Frontend config
  app/clients/page.tsx       # Client list
  app/clients/new/page.tsx   # New client form
  lib/api/clients.ts         # API functions
```

---

## 🎨 UI Components Used

- MainLayout
- Card
- Button
- Input
- Select
- Table
- Dialog
- Badge
- Avatar
- Toast
- LoadingSpinner

---

## 📈 Statistics Tracked

1. **Total Clients** - All active clients
2. **Individual Clients** - Client type INDIVIDUAL
3. **Company Clients** - Client type COMPANY
4. **Verified KYC** - KYC status VERIFIED

---

## 🔄 Data Flow

```
User Action → Frontend → API Client → 
Backend → Database → Response → 
Frontend → UI Update → User Feedback
```

---

## 💡 Pro Tips

1. **Search is debounced** - Wait 300ms after typing
2. **Filters auto-refresh** - No need to click apply
3. **Stats are real-time** - Always current
4. **Delete is soft** - Can be recovered from DB
5. **Client ID auto-generated** - Format: CLT-YYYY-NNN

---

## 📞 Quick Support

**Check Logs:**
- Browser DevTools Console (F12)
- Backend Terminal
- Network Tab for API calls

**Verify Services:**
```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend
Open http://localhost:3000
```

---

## 🎯 Next Features (TODO)

- [ ] Edit client functionality
- [ ] Client detail view
- [ ] KYC document upload
- [ ] Bulk operations
- [ ] Export to Excel
- [ ] Email notifications
- [ ] Advanced filters
- [ ] Audit trail

---

## ✨ Keyboard Shortcuts

- `Ctrl + K` - Focus search (coming soon)
- `Esc` - Close dialogs
- `Enter` - Submit forms

---

## 📦 Package Updates

```bash
# Update all packages
npm update

# Check for outdated
npm outdated

# Audit security
npm audit
```

---

**Version**: 1.0.0  
**Quick Reference Updated**: January 10, 2025

---

## 🎉 Success Indicators

✅ Backend health check returns 200  
✅ Frontend loads without errors  
✅ Can create a client  
✅ Client appears in list  
✅ Search works  
✅ Filters work  
✅ Delete works  
✅ Statistics update  

**If all ✅ → System is working perfectly!**
