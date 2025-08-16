# ResQ-LK Project Summary

## Project Overview

**ResQ-LK** is a comprehensive emergency response platform designed specifically for Sri Lanka, connecting communities in crisis through a multi-platform solution. The system supports three distinct user personas, ensuring accessibility for all segments of the population.

### Target Users

1. **Nimal** - Feature phone user accessing via USSD/SMS
2. **Ayesha** - Smartphone user with full mobile app access
3. **Anura** - Web administrator managing emergency responses

## Key Features

### 🚨 Emergency Relief Requests
- **Multi-platform submission**: Mobile app, USSD, and web dashboard
- **Location-based requests**: GPS coordinates and address input
- **Urgency classification**: Low, Medium, High, Critical levels
- **Real-time tracking**: Request status updates via SMS
- **Token-based system**: Unique identifiers for request tracking

### 👥 Volunteer Management
- **Skill-based matching**: Medical, rescue, logistics, communication
- **Availability tracking**: Immediate, today, this week, on-call
- **Admin approval workflow**: Review and accept/reject volunteers
- **Assignment system**: Match volunteers to relief requests

### 🏥 Emergency Team Coordination
- **Team types**: Medical, rescue, logistics, communication
- **Status management**: Available, deployed, busy
- **Assignment tracking**: Link teams to specific requests
- **Real-time updates**: Live status changes

### 📱 USSD Integration
- **Feature phone access**: Dial *123# for emergency services
- **Menu-driven interface**: Simple navigation for basic phones
- **SMS confirmations**: Token-based request tracking
- **Multi-carrier support**: Dialog and Mobitel integration

### 📊 Admin Dashboard
- **Real-time monitoring**: Live emergency statistics
- **Map visualization**: Geographic distribution of requests
- **Team management**: Create and assign emergency teams
- **Analytics**: Request trends and response metrics

## Technology Stack

### Backend (Node.js)
- **Framework**: Express.js with microservices architecture
- **Database**: MySQL 8.0 with automatic schema creation
- **Authentication**: JWT tokens with OTP verification
- **SMS Gateway**: Twilio integration with Dialog/Mobitel support
- **Real-time**: Socket.io for live updates
- **Security**: Helmet, CORS, bcryptjs, express-validator

### Mobile App (Flutter)
- **Framework**: Flutter 3.x with Material Design 3
- **State Management**: Provider pattern
- **HTTP Client**: Dio for API communication
- **Local Storage**: SharedPreferences for user data
- **Maps**: Google Maps Flutter integration
- **Location**: Geolocator for GPS coordinates

### Web Dashboard (React)
- **Framework**: React 18 with hooks and context
- **UI Library**: Material-UI (MUI) with custom theme
- **State Management**: Context API + useReducer
- **HTTP Client**: Axios with interceptors
- **Charts**: Recharts for data visualization
- **Maps**: Leaflet with React-Leaflet
- **Forms**: Formik + Yup validation

## System Architecture

### 3-Tier Architecture
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

## Database Schema

### Core Tables
- **users**: User profiles and authentication
- **relief_requests**: Emergency relief requests
- **volunteer_offers**: Volunteer availability and skills
- **emergency_teams**: Response team management
- **team_assignments**: Team-to-request assignments
- **sms_logs**: SMS communication tracking

## API Endpoints

### Authentication
- `POST /api/auth/request-otp` - Request OTP for login
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/admin-login` - Admin login with email/password

### Relief Requests
- `POST /api/relief/request` - Create new relief request
- `GET /api/relief/my-requests` - Get user's requests
- `GET /api/relief/all` - Get all requests (admin)
- `PUT /api/relief/:id/status` - Update request status

### Volunteers
- `POST /api/volunteer/offer` - Submit volunteer offer
- `GET /api/volunteer/all` - Get all offers (admin)
- `PUT /api/volunteer/:id/status` - Update offer status

### Admin Dashboard
- `GET /api/admin/dashboard` - Get dashboard overview
- `POST /api/admin/teams` - Create emergency team
- `GET /api/admin/map-data` - Get map data for visualization

### USSD
- `POST /api/ussd/dialog` - Dialog USSD gateway
- `POST /api/ussd/mobitel` - Mobitel USSD gateway

## User Flows

### Emergency Request Flow
1. User submits relief request (mobile/USSD)
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

## Security Features

### Authentication & Authorization
- JWT tokens with 24-hour expiration
- OTP-based authentication for mobile users
- Email/password for admin users
- Role-based access control

### Data Protection
- Input validation on all endpoints
- SQL injection prevention
- XSS protection with helmet middleware
- CORS configuration for cross-origin requests

### SMS Security
- OTP expiration (10 minutes)
- Rate limiting for OTP requests
- SMS delivery confirmation logging

## Scalability & Performance

### Horizontal Scaling
- Stateless API design
- Database connection pooling
- Load balancer ready architecture
- Microservices can be deployed independently

### Performance Optimizations
- Database indexing on frequently queried fields
- Pagination for large datasets
- WebSocket connections for real-time updates
- Caching layer for static data

## Development Status

### ✅ Completed Features
- [x] Project structure and architecture setup
- [x] Backend API development with all endpoints
- [x] Database schema and automatic creation
- [x] Authentication system (OTP + JWT)
- [x] SMS service integration (mock + Twilio)
- [x] USSD service implementation
- [x] Mobile app UI (splash, login, theme)
- [x] Web dashboard foundation (login, routing, theme)
- [x] Comprehensive documentation

### 🚧 In Progress
- [ ] Mobile app screens (relief, volunteer, profile)
- [ ] Web dashboard pages (dashboard, relief, volunteers, teams)
- [ ] Real-time map integration
- [ ] Push notifications
- [ ] Offline capability

### 📋 Planned Features
- [ ] Multi-language support (Sinhala, Tamil)
- [ ] AI-powered emergency classification
- [ ] Predictive analytics
- [ ] Video calling for coordination
- [ ] IoT integration
- [ ] Blockchain for transparency

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

### SMS Gateway
- Twilio API for SMS sending
- Dialog/Mobitel USSD gateway integration
- SMS delivery status webhooks
- Rate limiting and cost optimization

### Maps & Location
- Google Maps API for mobile app
- Leaflet for web dashboard
- Geocoding for address conversion
- Real-time location tracking

### Emergency Services
- Direct emergency number integration (119)
- Police, ambulance, fire service coordination
- Government emergency response systems

## Business Impact

### Social Impact
- **Lifesaving**: Faster emergency response times
- **Accessibility**: Support for feature phone users
- **Community**: Volunteer coordination and engagement
- **Transparency**: Real-time tracking and accountability

### Economic Impact
- **Efficiency**: Optimized resource allocation
- **Cost reduction**: Streamlined emergency response
- **Scalability**: Support for multiple emergency types
- **Sustainability**: Long-term emergency management solution

### Technical Impact
- **Innovation**: Multi-platform emergency response system
- **Standards**: Industry best practices implementation
- **Scalability**: Cloud-ready architecture
- **Integration**: Open API for third-party services

## Future Roadmap

### Phase 2 (Q2 2025)
- AI-powered emergency classification
- Predictive analytics for resource allocation
- Multi-language support (Sinhala, Tamil)
- Offline capability for mobile app
- Push notifications
- Video calling for emergency coordination

### Phase 3 (Q3 2025)
- IoT integration for automated alerts
- Drone deployment coordination
- Blockchain for transparent resource tracking
- Machine learning for pattern recognition
- Integration with weather services
- Community-based emergency networks

## Conclusion

ResQ-LK represents a comprehensive solution for emergency response in Sri Lanka, designed with accessibility, scalability, and user experience in mind. The multi-platform approach ensures that emergency services are available to all segments of the population, regardless of their device capabilities.

The system's modular architecture allows for easy expansion and integration with existing emergency services, while the real-time communication features enable efficient coordination between emergency responders, volunteers, and affected communities.

With its focus on saving lives and improving emergency response efficiency, ResQ-LK has the potential to make a significant positive impact on emergency management in Sri Lanka and serve as a model for similar systems in other regions.

---

**Project Status**: Development Phase  
**Target Launch**: August 14, 2025  
**License**: MIT  
**Repository**: [ResQ-LK GitHub Repository]  
**Contact**: support@resq-lk.lk
