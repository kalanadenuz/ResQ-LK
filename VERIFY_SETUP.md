# 🔍 ResQ-LK System Verification Guide

**Complete verification checklist to ensure all components work properly**

## 📋 Pre-Verification Checklist

Before running the verification tests, ensure you have:

- [ ] Node.js 18+ installed
- [ ] MySQL 8.0+ installed and running
- [ ] Java JDK 17/18 installed (for Android)
- [ ] Android Studio installed (for Android development)
- [ ] All components installed following SETUP_INSTRUCTIONS.md

## 🚀 Quick Start Verification

### 1. Database Verification

```bash
# Test database connection
mysql -u resq_user -p resq_lk -e "SELECT COUNT(*) as user_count FROM users;"

# Expected output: user_count with a number (should be at least 1 for admin)
```

### 2. Backend Verification

```bash
# Navigate to backend
cd backend

# Install dependencies (if not done)
npm install

# Start backend server
npm start

# In another terminal, test the API
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"..."}

curl http://localhost:3000/api
# Expected: API documentation JSON
```

### 3. Web Dashboard Verification

```bash
# Navigate to web directory
cd web

# Install dependencies (if not done)
npm install

# Start web dashboard
npm start

# Open http://localhost:3001 in browser
# Login with: admin@resq-lk.com / admin123
```

### 4. Mobile App Verification

```bash
# Navigate to mobile app
cd mobile/ResQLKMobile

# Install dependencies (if not done)
npm install

# Start Metro bundler
npm start

# In another terminal, run on Android
npm run android
```

## 🧪 Detailed Component Testing

### Backend API Testing

#### Authentication Endpoints
```bash
# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+94770000001",
    "email": "test@example.com"
  }'

# Test user login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+94770000001"
  }'
```

#### Emergency Endpoints
```bash
# Get emergency locations
curl http://localhost:3000/api/emergency/locations

# Get evacuation time slots
curl http://localhost:3000/api/emergency/time-slots
```

#### Relief Endpoints
```bash
# Get relief types
curl http://localhost:3000/api/relief/types

# Get relief statistics
curl http://localhost:3000/api/relief/statistics
```

#### Volunteer Endpoints
```bash
# Get available shifts
curl http://localhost:3000/api/volunteer/shifts

# Get available tasks
curl http://localhost:3000/api/volunteer/tasks
```

### Web Dashboard Testing

#### Login Flow
1. Open http://localhost:3001
2. Enter admin credentials:
   - Email: `admin@resq-lk.com`
   - Password: `admin123`
3. Verify successful login and dashboard display

#### Dashboard Features
- [ ] View statistics cards (active emergencies, pending relief, etc.)
- [ ] View live map with emergency locations
- [ ] View recent requests list
- [ ] Navigate to all sidebar menu items

#### Emergency Management
- [ ] View emergency requests table
- [ ] Filter requests by status
- [ ] View request details modal
- [ ] Update request status (approve/cancel)

#### Relief Management
- [ ] View relief requests table
- [ ] Filter requests by status
- [ ] View request details modal
- [ ] Update request status

#### Volunteer Management
- [ ] View volunteer registrations table
- [ ] Filter volunteers by status
- [ ] View volunteer details modal
- [ ] Update volunteer status

#### Map Management
- [ ] View live map with locations
- [ ] Add new emergency location
- [ ] Edit existing location
- [ ] Delete location

#### Statistics
- [ ] View performance charts
- [ ] View monthly activity graphs
- [ ] View location distribution pie chart

### Mobile App Testing

#### Welcome Screen
- [ ] View gradient header
- [ ] See language dropdown
- [ ] See notification and settings icons
- [ ] View all four main action buttons:
  - Request Rescue
  - Book Relief
  - Volunteer
  - Live Map

#### Emergency Screen
- [ ] View location grid
- [ ] Select different locations
- [ ] Navigate to evacuation time selection
- [ ] Use action buttons

#### Evacuation Time Screen
- [ ] View time slot grid
- [ ] Select different time slots
- [ ] Navigate to nearby locations
- [ ] Use back button

#### Volunteer Screen
- [ ] Fill in personal information
- [ ] Select shifts (single selection)
- [ ] Select tasks (multi-selection)
- [ ] Submit registration

#### Map Screen
- [ ] View Sri Lanka map
- [ ] See location markers
- [ ] View legend
- [ ] Search locations

#### Profile Screen
- [ ] View profile information
- [ ] Switch to edit mode
- [ ] Update profile details
- [ ] Save changes

## 🔧 Integration Testing

### Mobile ↔ Backend Integration
1. **Emergency Request Flow**
   - Create emergency request from mobile
   - Verify it appears in web dashboard
   - Update status from web dashboard
   - Verify status update in mobile

2. **Relief Request Flow**
   - Create relief request from mobile
   - Verify it appears in web dashboard
   - Update status from web dashboard
   - Verify status update in mobile

3. **Volunteer Registration Flow**
   - Register as volunteer from mobile
   - Verify registration appears in web dashboard
   - Update status from web dashboard
   - Verify status update in mobile

### Web ↔ Backend Integration
1. **Real-time Updates**
   - Make changes in web dashboard
   - Verify changes reflect in database
   - Refresh page and verify persistence

2. **Map Integration**
   - Add new location via web dashboard
   - Verify location appears on map
   - Verify location data in database

## 🚨 Common Issues & Solutions

### Database Issues
```bash
# If database connection fails
mysql -u root -p
CREATE USER 'resq_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON resq_lk.* TO 'resq_user'@'localhost';
FLUSH PRIVILEGES;
```

### Backend Issues
```bash
# If port 3000 is in use
lsof -i :3000
kill -9 <PID>

# If dependencies are missing
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Web Dashboard Issues
```bash
# If port 3001 is in use
lsof -i :3001
kill -9 <PID>

# If build fails
cd web
rm -rf node_modules package-lock.json
npm install
```

### Mobile App Issues
```bash
# If Metro bundler fails
cd mobile/ResQLKMobile
npx react-native start --reset-cache

# If Android build fails
cd android
./gradlew clean
cd ..
npm run android
```

## 📊 Performance Verification

### Backend Performance
```bash
# Test API response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/emergency/locations"

# Expected: Response time < 500ms
```

### Database Performance
```sql
-- Test query performance
EXPLAIN SELECT * FROM emergency_requests WHERE status = 'pending';
-- Expected: Uses indexes, not full table scan
```

### Mobile App Performance
- [ ] App launches within 3 seconds
- [ ] Screen transitions are smooth
- [ ] No memory leaks during navigation
- [ ] API calls complete within 2 seconds

## 🔐 Security Verification

### Authentication
- [ ] JWT tokens are properly generated
- [ ] Tokens expire correctly
- [ ] Protected routes require authentication
- [ ] Password hashing is implemented

### Input Validation
- [ ] All API endpoints validate input
- [ ] SQL injection prevention works
- [ ] XSS prevention is implemented
- [ ] Rate limiting is active

### Data Protection
- [ ] Sensitive data is encrypted
- [ ] HTTPS is used in production
- [ ] CORS is properly configured
- [ ] Helmet security headers are active

## 📱 Device Testing

### Android Testing
- [ ] Test on Android emulator
- [ ] Test on physical Android device
- [ ] Test different screen sizes
- [ ] Test different Android versions

### iOS Testing (macOS only)
- [ ] Test on iOS simulator
- [ ] Test on physical iOS device
- [ ] Test different screen sizes
- [ ] Test different iOS versions

## 🎯 Final Verification Checklist

### System Integration
- [ ] All three components (backend, web, mobile) are running
- [ ] Database is accessible from all components
- [ ] API communication works between all components
- [ ] Real-time updates work across components

### User Flows
- [ ] Complete emergency request flow works end-to-end
- [ ] Complete relief request flow works end-to-end
- [ ] Complete volunteer registration flow works end-to-end
- [ ] Admin dashboard can manage all requests

### Data Integrity
- [ ] All data is properly stored in database
- [ ] Data relationships are maintained
- [ ] Updates are reflected across all components
- [ ] No data loss during operations

### Error Handling
- [ ] Graceful error handling in all components
- [ ] User-friendly error messages
- [ ] System recovery from errors
- [ ] Logging of errors for debugging

## 🎉 Success Criteria

Your ResQ-LK system is fully functional when:

1. ✅ All components start without errors
2. ✅ All API endpoints respond correctly
3. ✅ Web dashboard displays and functions properly
4. ✅ Mobile app runs on target devices
5. ✅ Database operations work correctly
6. ✅ User flows work end-to-end
7. ✅ Admin can manage all requests
8. ✅ Real-time updates work across components

## 📞 Support

If you encounter issues during verification:

1. Check the troubleshooting section in `SETUP_INSTRUCTIONS.md`
2. Review error logs in each component
3. Verify all prerequisites are installed
4. Ensure all environment variables are set correctly
5. Check network connectivity between components

---

**🎉 Congratulations! If all verification steps pass, your ResQ-LK Emergency Response System is fully operational and ready for production use.**
