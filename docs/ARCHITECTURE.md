# ResQ-LK Architecture Documentation

## System Overview

ResQ-LK is a comprehensive emergency response platform designed for Sri Lanka, supporting three distinct user personas:

1. **Nimal** - Feature phone user (USSD/SMS access)
2. **Ayesha** - Smartphone user (Mobile app access)
3. **Anura** - Web administrator (Dashboard access)

## Architecture Pattern

The system follows a **3-tier architecture** with **microservices** pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  Flutter Mobile App  │  React Web Dashboard  │  USSD/SMS   │
│     (Ayesha)        │      (Anura)          │   (Nimal)   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  Auth Service  │  Relief Service  │  Volunteer Service      │
│                │                  │                         │
│  Map Service   │  Team Service    │  SMS/USSD Gateway       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  MySQL Database  │  SMS Gateway  │  USSD Gateway            │
│                  │  (Dialog)     │  (Mobitel)               │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MySQL 8.0
- **Authentication**: JWT (JSON Web Tokens)
- **SMS Gateway**: Twilio (with Dialog/Mobitel integration)
- **Real-time**: Socket.io for WebSocket connections
- **Validation**: Express-validator
- **Security**: Helmet, CORS, bcryptjs

### Mobile App (Flutter)
- **Framework**: Flutter 3.x
- **State Management**: Provider
- **HTTP Client**: Dio
- **Local Storage**: SharedPreferences
- **Maps**: Google Maps Flutter
- **Location**: Geolocator
- **UI Components**: Material Design 3

### Web Dashboard (React)
- **Framework**: React 18
- **UI Library**: Material-UI (MUI)
- **State Management**: Context API + useReducer
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Charts**: Recharts
- **Maps**: Leaflet with React-Leaflet
- **Forms**: Formik + Yup
- **Notifications**: Notistack

## Database Schema

### Core Tables

#### Users
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  user_type ENUM('feature_phone', 'smartphone', 'admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Relief Requests
```sql
CREATE TABLE relief_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  people_count INT NOT NULL,
  needs TEXT NOT NULL,
  urgency_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  request_token VARCHAR(50) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

#### Volunteer Offers
```sql
CREATE TABLE volunteer_offers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  skills TEXT NOT NULL,
  availability TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

#### Emergency Teams
```sql
CREATE TABLE emergency_teams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  team_type ENUM('medical', 'rescue', 'logistics', 'communication') NOT NULL,
  location VARCHAR(255) NOT NULL,
  status ENUM('available', 'deployed', 'busy') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API Design

### Authentication Endpoints
- `POST /api/auth/request-otp` - Request OTP for login
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/admin-login` - Admin login with email/password
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Relief Request Endpoints
- `POST /api/relief/request` - Create new relief request
- `GET /api/relief/my-requests` - Get user's requests
- `GET /api/relief/all` - Get all requests (admin)
- `PUT /api/relief/:id/status` - Update request status
- `GET /api/relief/stats` - Get emergency statistics

### Volunteer Endpoints
- `POST /api/volunteer/offer` - Submit volunteer offer
- `GET /api/volunteer/my-offers` - Get user's offers
- `GET /api/volunteer/all` - Get all offers (admin)
- `PUT /api/volunteer/:id/status` - Update offer status
- `GET /api/volunteer/stats` - Get volunteer statistics

### Admin Endpoints
- `GET /api/admin/dashboard` - Get dashboard overview
- `POST /api/admin/teams` - Create emergency team
- `GET /api/admin/teams` - Get all teams
- `POST /api/admin/teams/:teamId/assign/:requestId` - Assign team to request
- `GET /api/admin/map-data` - Get map data for visualization

### USSD Endpoints
- `POST /api/ussd/dialog` - Dialog USSD gateway
- `POST /api/ussd/mobitel` - Mobitel USSD gateway
- `POST /api/ussd/` - Generic USSD endpoint

## Data Flow

### Relief Request Flow
1. User submits relief request via mobile app or USSD
2. System generates unique request token
3. SMS confirmation sent to user
4. Admin receives notification in dashboard
5. Admin assigns emergency team
6. Team status updated to "deployed"
7. User receives status updates via SMS

### Volunteer Flow
1. User submits volunteer offer via mobile app
2. Admin reviews offer in dashboard
3. Admin accepts/rejects offer
4. User receives SMS notification
5. If accepted, volunteer can be assigned to relief requests

### USSD Flow
1. User dials *123# on feature phone
2. USSD gateway sends request to backend
3. Backend processes menu navigation
4. User submits relief request or volunteer offer
5. System creates database entry
6. SMS confirmation sent to user

## Security Considerations

### Authentication
- JWT tokens with 24-hour expiration
- OTP-based authentication for mobile users
- Email/password for admin users
- Token refresh mechanism

### Data Protection
- Input validation on all endpoints
- SQL injection prevention with parameterized queries
- XSS protection with helmet middleware
- CORS configuration for cross-origin requests

### SMS Security
- OTP expiration (10 minutes)
- Rate limiting for OTP requests
- SMS delivery confirmation logging

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Database connection pooling
- Load balancer ready architecture
- Microservices can be deployed independently

### Performance
- Database indexing on frequently queried fields
- Caching layer for static data
- Pagination for large datasets
- WebSocket connections for real-time updates

### Monitoring
- Health check endpoints
- Error logging and monitoring
- Performance metrics collection
- SMS delivery status tracking

## Deployment Architecture

### Development Environment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flutter App   │    │  React Dashboard │    │  Node.js API    │
│   (localhost)   │    │   (localhost)    │    │  (localhost)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                        ┌─────────────────┐
                        │   MySQL DB      │
                        │  (localhost)    │
                        └─────────────────┘
```

### Production Environment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │  Web Dashboard  │    │  Load Balancer  │
│   (App Store)   │    │   (CDN)         │    │   (Nginx)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                        ┌─────────────────┐
                        │  API Servers    │
                        │  (Multiple)     │
                        └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   MySQL Cluster │
                        │  (Master-Slave) │
                        └─────────────────┘
```

## Integration Points

### SMS Gateway Integration
- Twilio API for SMS sending
- Dialog/Mobitel USSD gateway integration
- SMS delivery status webhooks
- Rate limiting and cost optimization

### Map Integration
- Google Maps API for mobile app
- Leaflet for web dashboard
- Geocoding for address conversion
- Real-time location tracking

### Emergency Services Integration
- Direct emergency number integration (119)
- Police, ambulance, fire service coordination
- Government emergency response systems

## Future Enhancements

### Phase 2 Features
- AI-powered emergency classification
- Predictive analytics for resource allocation
- Multi-language support (Sinhala, Tamil)
- Offline capability for mobile app
- Push notifications
- Video calling for emergency coordination

### Phase 3 Features
- IoT integration for automated alerts
- Drone deployment coordination
- Blockchain for transparent resource tracking
- Machine learning for pattern recognition
- Integration with weather services
- Community-based emergency networks
