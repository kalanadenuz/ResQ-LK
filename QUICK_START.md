# ⚡ ResQ-LK Quick Start Guide

**Get your emergency response system running in 10 minutes!**

## 🚀 Super Quick Setup

### Prerequisites Check
```bash
# Check Node.js version (should be 18+)
node --version

# Check if MySQL is running
mysql --version

# Check if you're in the project directory
pwd
# Should show: /path/to/ResQ-LK
```

### 1. Database Setup (2 minutes)
```bash
# Create database and user
mysql -u root -p
```

In MySQL console:
```sql
CREATE DATABASE resq_lk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'resq_user'@'localhost' IDENTIFIED BY 'resq123';
GRANT ALL PRIVILEGES ON resq_lk.* TO 'resq_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# Import schema
mysql -u resq_user -p resq_lk < database/schema.sql
```

### 2. Backend Setup (3 minutes)
```bash
cd backend
npm install
cp env.example .env
```

Edit `.env` file:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_USER=resq_user
DB_PASSWORD=resq123
DB_NAME=resq_lk
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
API_BASE_URL=http://localhost:3000/api
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,http://localhost:3001
```

```bash
npm start
```

### 3. Web Dashboard Setup (2 minutes)
```bash
# Open new terminal
cd web
npm install
npm start
```

### 4. Mobile App Setup (3 minutes)
```bash
# Open new terminal
cd mobile/ResQLKMobile
npm install
npm start
```

In another terminal:
```bash
cd mobile/ResQLKMobile
npm run android
```

## 🧪 Quick Test

### Test Backend API
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Test Web Dashboard
1. Open http://localhost:3001
2. Login with: `admin@resq-lk.com` / `admin123`
3. You should see the dashboard with statistics

### Test Mobile App
1. App should launch on Android emulator/device
2. You should see the Welcome screen with 4 buttons
3. Test navigation between screens

## 🎯 What You Should See

### Backend (Terminal 1)
```
🚀 ResQ-LK Backend Server running on port 3000
📊 Database connected successfully
🔐 JWT authentication enabled
🛡️ Security middleware active
📝 API documentation available at /api
```

### Web Dashboard (Terminal 2)
```
Compiled successfully!

You can now view resq-lk-admin-dashboard in the browser.

  Local:            http://localhost:3001
  On Your Network:  http://192.168.x.x:3001
```

### Mobile App (Terminal 3)
```
Metro waiting on exp://192.168.x.x:8081
Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

## 🔧 Troubleshooting Quick Fixes

### Database Issues
```bash
# If MySQL connection fails
sudo systemctl start mysql
# or
brew services start mysql
```

### Port Issues
```bash
# If port 3000 is in use
lsof -i :3000
kill -9 <PID>

# If port 3001 is in use
lsof -i :3001
kill -9 <PID>
```

### Mobile App Issues
```bash
# If Metro bundler fails
npx react-native start --reset-cache

# If Android build fails
cd android
./gradlew clean
cd ..
npm run android
```

## 📱 Test User Flows

### Emergency Request Flow
1. **Mobile App**: Welcome → Emergency → Select Location → Select Time → Submit
2. **Web Dashboard**: Emergency Requests → View new request → Approve
3. **Mobile App**: Check status update

### Volunteer Registration Flow
1. **Mobile App**: Welcome → Volunteer → Fill form → Submit
2. **Web Dashboard**: Volunteer Management → View registration → Approve
3. **Mobile App**: Check status update

### Relief Request Flow
1. **Mobile App**: Welcome → Relief → Fill form → Submit
2. **Web Dashboard**: Relief Requests → View request → Process
3. **Mobile App**: Check status update

## 🎉 Success Indicators

✅ **Backend**: API responds to health check
✅ **Database**: Can query users table
✅ **Web Dashboard**: Admin can login and see dashboard
✅ **Mobile App**: App launches and shows Welcome screen
✅ **Integration**: Data flows between all components

## 📞 Need Help?

1. **Check SETUP_INSTRUCTIONS.md** - Detailed setup guide
2. **Check VERIFY_SETUP.md** - Comprehensive testing guide
3. **Check individual README files** - Component-specific guides
4. **Check error logs** - Look for specific error messages

## 🚀 Next Steps

Once everything is running:

1. **Explore the Web Dashboard** - Test all admin features
2. **Test Mobile App Flows** - Complete user journeys
3. **Customize Configuration** - Update settings for your needs
4. **Deploy to Production** - Follow deployment guide
5. **Train Users** - Set up user training programs

---

**🎉 You now have a fully functional emergency response system!**

*For detailed setup, see `SETUP_INSTRUCTIONS.md`*
*For comprehensive testing, see `VERIFY_SETUP.md`*
