# 🚨 ResQ-LK Complete Setup Instructions

**Complete setup guide for ResQ-LK Emergency Response System**

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Database Setup](#database-setup)
- [Backend Setup](#backend-setup)
- [Mobile App Setup](#mobile-app-setup)
- [Web Admin Dashboard Setup](#web-admin-dashboard-setup)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🎯 System Overview

ResQ-LK is a comprehensive emergency response system with three main components:

1. **Backend API** (Node.js/Express + MySQL)
2. **Mobile App** (React Native)
3. **Web Admin Dashboard** (React)

## 🔧 Prerequisites

### Required Software
- **Node.js** 18.0 or higher
- **MySQL** 8.0 or higher
- **Git**
- **Java Development Kit (JDK)** 17 or 18 (for Android development)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

### System Requirements
- **RAM**: Minimum 8GB, Recommended 16GB
- **Storage**: At least 10GB free space
- **OS**: Windows 10/11, macOS 10.15+, or Ubuntu 18.04+

## 🚀 Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/ResQ-LK.git
cd ResQ-LK
```

### Step 2: Database Setup

1. **Install MySQL** (if not already installed)
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server
   
   # macOS (using Homebrew)
   brew install mysql
   
   # Windows
   # Download from https://dev.mysql.com/downloads/mysql/
   ```

2. **Start MySQL Service**
   ```bash
   # Ubuntu/Debian
   sudo systemctl start mysql
   sudo systemctl enable mysql
   
   # macOS
   brew services start mysql
   
   # Windows
   # Start from Services or MySQL Installer
   ```

3. **Create Database and User**
   ```bash
   mysql -u root -p
   ```

   ```sql
   -- Create database
   CREATE DATABASE resq_lk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   
   -- Create user (optional but recommended)
   CREATE USER 'resq_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON resq_lk.* TO 'resq_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

4. **Import Database Schema**
   ```bash
   mysql -u root -p resq_lk < database/schema.sql
   ```

### Step 3: Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_USER=resq_user
   DB_PASSWORD=your_secure_password
   DB_NAME=resq_lk
   DB_PORT=3306
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=24h
   
   # SMS Service (Twilio) - Optional
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_phone
   
   # API Configuration
   API_BASE_URL=http://localhost:3000/api
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,http://localhost:3001
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```

   The backend should now be running on `http://localhost:3000`

### Step 4: Web Admin Dashboard Setup

1. **Navigate to web directory**
   ```bash
   cd web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

   The web dashboard should now be running on `http://localhost:3001`

### Step 5: Mobile App Setup

1. **Navigate to mobile directory**
   ```bash
   cd mobile/ResQLKMobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint** (if needed)
   Edit `src/services/api.js` and update the base URL if your backend is running on a different port.

4. **Start Metro bundler**
   ```bash
   npm start
   ```

5. **Run on Android**
   ```bash
   npm run android
   ```

6. **Run on iOS** (macOS only)
   ```bash
   npm run ios
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=resq_user
DB_PASSWORD=your_secure_password
DB_NAME=resq_lk
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# API Configuration
API_BASE_URL=http://localhost:3000/api
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,http://localhost:3001

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Web Dashboard (.env)
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENVIRONMENT=development
```

### Database Configuration

The system uses MySQL with the following default settings:
- **Database**: `resq_lk`
- **Character Set**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

### Default Admin Account

After running the database schema, a default admin account is created:
- **Email**: `admin@resq-lk.com`
- **Phone**: `+94770000000`
- **Password**: `admin123` (change this immediately in production)

## 🧪 Testing

### Backend API Testing

1. **Test health endpoint**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Test API documentation**
   ```bash
   curl http://localhost:3000/api
   ```

### Web Dashboard Testing

1. Open `http://localhost:3001` in your browser
2. Login with admin credentials
3. Test all dashboard features

### Mobile App Testing

1. Ensure Metro bundler is running
2. Test on Android emulator or physical device
3. Test on iOS simulator or physical device (macOS only)

## 🚀 Deployment

### Production Deployment

#### Backend Deployment

1. **Set up production environment**
   ```bash
   NODE_ENV=production
   ```

2. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "resq-lk-backend"
   pm2 startup
   pm2 save
   ```

3. **Set up reverse proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### Web Dashboard Deployment

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy to web server**
   ```bash
   # Copy build folder to web server
   cp -r build/* /var/www/html/
   ```

#### Mobile App Deployment

1. **Android APK Build**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

2. **iOS Build**
   ```bash
   # Use Xcode to archive and distribute
   ```

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check MySQL service status
sudo systemctl status mysql

# Check database connection
mysql -u resq_user -p resq_lk

# Verify database exists
SHOW DATABASES;
```

#### 2. Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### 3. Node.js Version Issues
```bash
# Check Node.js version
node --version

# Use nvm to switch versions
nvm install 18
nvm use 18
```

#### 4. Android Build Issues
```bash
# Clean Android build
cd android
./gradlew clean

# Check Java version
java -version

# Set JAVA_HOME
export JAVA_HOME=/path/to/java17
```

#### 5. iOS Build Issues
```bash
# Clean iOS build
cd ios
rm -rf build
pod install

# Check Xcode version
xcodebuild -version
```

### Log Files

- **Backend logs**: Check console output or PM2 logs
- **Web dashboard logs**: Check browser console
- **Mobile app logs**: Check Metro bundler console

### Performance Optimization

1. **Database Optimization**
   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX idx_emergency_status ON emergency_requests(status);
   CREATE INDEX idx_relief_status ON relief_requests(status);
   ```

2. **Backend Optimization**
   - Enable compression
   - Use Redis for caching (optional)
   - Implement database connection pooling

3. **Frontend Optimization**
   - Enable code splitting
   - Use CDN for static assets
   - Implement lazy loading

## 📞 Support

For additional support:

1. **Check the documentation** in the `docs/` folder
2. **Review the API documentation** at `http://localhost:3000/api`
3. **Check GitHub issues** for known problems
4. **Contact the development team**

## 🔐 Security Considerations

1. **Change default passwords** immediately
2. **Use HTTPS** in production
3. **Implement rate limiting**
4. **Regular security updates**
5. **Database backups**
6. **Input validation**
7. **SQL injection prevention**

## 📊 Monitoring

1. **Application monitoring** with PM2
2. **Database monitoring** with MySQL Workbench
3. **Error tracking** with Sentry (optional)
4. **Performance monitoring** with New Relic (optional)

---

**🎉 Congratulations! Your ResQ-LK Emergency Response System is now set up and ready to use.**

*For additional help, refer to the individual component README files in each directory.*
