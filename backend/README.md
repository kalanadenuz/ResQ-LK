# ResQ-LK Backend API

A comprehensive emergency response platform backend for Sri Lanka, providing APIs for emergency management, relief coordination, volunteer management, and real-time communication.

## 🚀 Features

### Core Functionality
- **User Authentication & Management**: JWT-based authentication with profile management
- **Emergency Request Management**: Create, track, and manage emergency requests
- **Relief Coordination**: Manage relief requests and distribution
- **Volunteer Management**: Register, approve, and assign volunteers
- **Location Services**: Emergency locations, evacuation centers, and safe zones
- **Time Slot Management**: Evacuation time slot booking and management
- **Real-time Notifications**: SMS, push notifications, and in-app notifications
- **Statistics & Analytics**: Comprehensive reporting and analytics

### Technical Features
- **RESTful API**: Clean, well-documented REST endpoints
- **JWT Authentication**: Secure token-based authentication
- **Database Integration**: MySQL with comprehensive data models
- **Input Validation**: Request validation using express-validator
- **Error Handling**: Comprehensive error handling and logging
- **WebSocket Support**: Real-time communication capabilities
- **SMS Integration**: Twilio integration for SMS notifications

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ResQ-LK/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` file with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=resq_lk
   DB_PORT=3306

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key

   # SMS Configuration (Twilio)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

4. **Set up the database**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE resq_lk;
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "phone_number": "+94710833711",
  "name": "Muttusami",
  "age": 54,
  "location": "Nuwara Eliya"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone_number": "+94710833711"
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "age": 55,
  "location": "Colombo"
}
```

### Emergency Management Endpoints

#### Create Emergency Request
```http
POST /api/emergency/request
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "location": "Colombo Central",
  "urgency_level": "high",
  "description": "Flood emergency, need immediate evacuation",
  "people_count": 3
}
```

#### Get Emergency Requests
```http
GET /api/emergency/requests?status=pending&urgency_level=high
Authorization: Bearer <jwt_token>
```

#### Get User's Emergency Requests
```http
GET /api/emergency/my-requests
Authorization: Bearer <jwt_token>
```

#### Cancel Emergency Request
```http
PUT /api/emergency/requests/:id/cancel
Authorization: Bearer <jwt_token>
```

### Relief Management Endpoints

#### Create Relief Request
```http
POST /api/relief/request
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "location": "Galle",
  "relief_type": "food",
  "urgency_level": "medium",
  "description": "Need food supplies for 5 people",
  "people_count": 5
}
```

#### Get Relief Requests
```http
GET /api/relief/requests?relief_type=food&status=pending
Authorization: Bearer <jwt_token>
```

### Volunteer Management Endpoints

#### Register as Volunteer
```http
POST /api/volunteer/register
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "shift_preference": "morning",
  "skills": "medical_aids,supply_distribution",
  "availability": true
}
```

#### Get Volunteers
```http
GET /api/volunteer/volunteers?status=approved&shift_preference=morning
Authorization: Bearer <jwt_token>
```

### Location Services Endpoints

#### Get Emergency Locations
```http
GET /api/emergency/locations?location_type=relief_center&status=active
Authorization: Bearer <jwt_token>
```

#### Get Available Locations
```http
GET /api/emergency/locations/available
Authorization: Bearer <jwt_token>
```

### Time Slot Management Endpoints

#### Get Time Slots
```http
GET /api/emergency/time-slots?date=2024-01-15&status=available
Authorization: Bearer <jwt_token>
```

#### Book Time Slot
```http
POST /api/emergency/time-slots/:id/book
Authorization: Bearer <jwt_token>
```

## 🗄️ Database Schema

### Core Tables
- **users**: User profiles and authentication
- **emergency_requests**: Emergency request management
- **relief_requests**: Relief request management
- **volunteers**: Volunteer registration and management
- **emergency_locations**: Emergency centers and safe zones
- **evacuation_time_slots**: Time slot booking system
- **notifications**: User notifications
- **emergency_assignments**: Volunteer assignments to emergencies

### Relationships
- Users can have multiple emergency requests
- Users can have multiple relief requests
- Users can register as volunteers
- Volunteers can be assigned to emergencies
- Emergency locations have capacity and occupancy tracking
- Time slots have booking and availability tracking

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | localhost |
| `DB_USER` | MySQL username | root |
| `DB_PASSWORD` | MySQL password | - |
| `DB_NAME` | Database name | resq_lk |
| `JWT_SECRET` | JWT signing secret | - |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | - |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | - |
| `PORT` | Server port | 3000 |

### SMS Configuration

To enable SMS notifications, configure Twilio:

1. Sign up for a Twilio account
2. Get your Account SID and Auth Token
3. Add them to your `.env` file
4. The system will automatically send SMS notifications for:
   - Emergency request confirmations
   - Status updates
   - Volunteer assignments

## 🚀 Deployment

### Production Setup

1. **Set environment variables**
   ```bash
   NODE_ENV=production
   JWT_SECRET=your-production-secret
   DB_HOST=your-production-db-host
   ```

2. **Build and start**
   ```bash
   npm run build
   npm start
   ```

3. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start server.js --name resq-lk-backend
   pm2 save
   pm2 startup
   ```

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Monitoring & Logging

### Health Check
```http
GET /health
```

### Logging
- Application logs are written to `./logs/app.log`
- Error logs include stack traces and context
- Request logs include method, URL, status, and response time

### Statistics Endpoints
- `/api/emergency/statistics` - Emergency statistics
- `/api/relief/statistics` - Relief statistics
- `/api/volunteer/statistics` - Volunteer statistics

## 🔒 Security

### Authentication
- JWT tokens with configurable expiration
- Token refresh mechanism
- Secure password handling

### Input Validation
- All inputs are validated using express-validator
- SQL injection prevention through parameterized queries
- XSS protection through input sanitization

### Rate Limiting
- Configurable rate limiting per IP
- Request throttling for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 API Versioning

The API uses versioning through URL prefixes:
- Current version: `/api/v1/`
- Future versions: `/api/v2/`, etc.

## 📱 Mobile App Integration

This backend is designed to work seamlessly with the ResQ-LK mobile app. Key integration points:

- **Authentication**: JWT token-based authentication
- **Real-time updates**: WebSocket connections for live updates
- **Push notifications**: Firebase integration for mobile notifications
- **Offline support**: API designed to handle offline scenarios
- **Location services**: GPS integration for emergency location tracking

## 🚨 Emergency Response Features

### Real-time Emergency Management
- Instant emergency request creation
- Automatic volunteer assignment
- Real-time status updates
- Location-based emergency routing

### Coordination Features
- Multi-agency coordination
- Resource allocation
- Capacity management
- Communication channels

### Analytics & Reporting
- Emergency response metrics
- Volunteer performance tracking
- Resource utilization reports
- Response time analysis
