# ResQ-LK Setup Guide

This guide will help you set up the ResQ-LK emergency response platform on your local development environment.

## Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher)
- **Flutter** (v3.0 or higher)
- **Git** (v2.0 or higher)
- **Code Editor** (VS Code recommended)

### Optional Software
- **Postman** (for API testing)
- **MySQL Workbench** (for database management)
- **Android Studio** (for mobile app development)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ResQ-LK
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
1. Copy the environment example file:
```bash
cp env.example .env
```

2. Edit `.env` file with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=resq_lk
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-secret-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# SMS Gateway Configuration (Optional for development)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# USSD Gateway Configuration
USSD_SERVICE_CODE=*123#
USSD_SESSION_TIMEOUT=30

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Logging Configuration
LOG_LEVEL=info
```

#### Database Setup
1. Create MySQL database:
```sql
CREATE DATABASE resq_lk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. The database tables will be created automatically when you start the server.

#### Start Backend Server
```bash
npm run dev
```

The backend will be available at `http://localhost:3000`

### 3. Mobile App Setup (Flutter)

#### Install Flutter Dependencies
```bash
cd mobile
flutter pub get
```

#### Platform Setup
For Android:
```bash
flutter doctor --android-licenses
```

For iOS (macOS only):
```bash
cd ios
pod install
cd ..
```

#### Run Mobile App
```bash
flutter run
```

### 4. Web Dashboard Setup (React)

#### Install Dependencies
```bash
cd web
npm install
```

#### Environment Configuration
Create `.env` file in the web directory:
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_APP_NAME=ResQ-LK
REACT_APP_VERSION=1.0.0
```

#### Start Web Dashboard
```bash
npm start
```

The web dashboard will be available at `http://localhost:3001`

## Verification Steps

### 1. Backend Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "ResQ-LK Backend is running",
  "timestamp": "2025-01-14T00:00:00.000Z"
}
```

### 2. Database Connection
Check the console output when starting the backend. You should see:
```
Connected to MySQL database
Database created or already exists
Table 1 created or already exists
...
```

### 3. API Endpoints Test
Test the authentication endpoint:
```bash
curl -X POST http://localhost:3000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "94712345678", "userType": "smartphone"}'
```

### 4. Mobile App Test
1. Open the Flutter app on your device/emulator
2. Navigate through the splash screen
3. Try the login flow with a test phone number

### 5. Web Dashboard Test
1. Open `http://localhost:3001` in your browser
2. Use demo credentials:
   - Email: `admin@resq-lk.lk`
   - Password: `admin123`

## Development Workflow

### Backend Development
```bash
cd backend
npm run dev  # Start with nodemon for auto-reload
```

### Mobile App Development
```bash
cd mobile
flutter run  # Hot reload enabled
```

### Web Dashboard Development
```bash
cd web
npm start  # Hot reload enabled
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Mobile App Tests
```bash
cd mobile
flutter test
```

### Web Dashboard Tests
```bash
cd web
npm test
```

## Database Management

### Access MySQL
```bash
mysql -u root -p
USE resq_lk;
```

### View Tables
```sql
SHOW TABLES;
```

### Sample Data Insertion
```sql
-- Insert admin user
INSERT INTO users (phone, email, name, user_type) 
VALUES ('94712345678', 'admin@resq-lk.lk', 'Admin User', 'admin');

-- Insert sample relief request
INSERT INTO relief_requests (location, people_count, needs, urgency_level) 
VALUES ('Colombo, Sri Lanka', 5, 'Food and water needed', 'high');

-- Insert sample volunteer offer
INSERT INTO volunteer_offers (skills, availability, location) 
VALUES ('Medical assistance', 'Immediately available', 'Colombo, Sri Lanka');
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
**Error**: `ER_ACCESS_DENIED_ERROR`
**Solution**: Check MySQL credentials in `.env` file

#### 2. Port Already in Use
**Error**: `EADDRINUSE`
**Solution**: Change port in `.env` file or kill existing process

#### 3. Flutter Dependencies Issue
**Error**: `pubspec.yaml` dependencies conflict
**Solution**: Run `flutter clean && flutter pub get`

#### 4. React Build Error
**Error**: Module not found
**Solution**: Delete `node_modules` and run `npm install`

#### 5. SMS Not Working
**Note**: SMS functionality requires Twilio credentials. For development, SMS will be logged to console.

### Debug Mode

#### Backend Debug
```bash
cd backend
DEBUG=* npm run dev
```

#### Flutter Debug
```bash
cd mobile
flutter run --debug
```

#### React Debug
```bash
cd web
REACT_APP_DEBUG=true npm start
```

## Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment
2. Use PM2 or similar process manager
3. Set up reverse proxy (Nginx)
4. Configure SSL certificates

### Mobile App Deployment
1. Build release APK:
```bash
cd mobile
flutter build apk --release
```

2. Build iOS app (macOS only):
```bash
cd mobile
flutter build ios --release
```

### Web Dashboard Deployment
1. Build production version:
```bash
cd web
npm run build
```

2. Deploy to static hosting (Netlify, Vercel, etc.)

## API Documentation

### Swagger Documentation
Once the backend is running, visit:
```
http://localhost:3000/api-docs
```

### Postman Collection
Import the provided Postman collection for API testing.

## Contributing

### Code Style
- Backend: ESLint + Prettier
- Mobile: Flutter lint rules
- Web: ESLint + Prettier

### Git Workflow
1. Create feature branch
2. Make changes
3. Run tests
4. Submit pull request

### Commit Messages
Use conventional commit format:
```
feat: add new relief request feature
fix: resolve database connection issue
docs: update setup instructions
```

## Support

### Documentation
- Architecture: `docs/ARCHITECTURE.md`
- API Reference: `docs/API.md`
- Deployment: `docs/DEPLOYMENT.md`

### Issues
Report issues on the project repository with:
- Detailed description
- Steps to reproduce
- Environment details
- Error logs

### Contact
- Email: support@resq-lk.lk
- GitHub: Project repository issues
- Slack: Development team channel

## License

This project is licensed under the MIT License - see the LICENSE file for details.
