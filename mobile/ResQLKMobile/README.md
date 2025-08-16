# ResQ-LK Mobile App

A React Native mobile application for emergency response and relief coordination in Sri Lanka.

## Features

### 🚨 Emergency Response
- **Request Rescue**: Emergency evacuation requests with location and time slot selection
- **Real-time Updates**: Live status updates for emergency requests
- **Location Services**: Interactive map with emergency centers and shelters
- **Time Slot Booking**: Evacuation time slot selection and management

### 🏥 Relief Coordination
- **Relief Booking**: Medical and humanitarian relief request system
- **Resource Management**: Track and manage relief resources
- **Status Tracking**: Monitor relief request status

### 👥 Volunteer Management
- **Volunteer Registration**: Complete volunteer signup with shift and task selection
- **Task Assignment**: Assign and manage volunteer tasks
- **Availability Management**: Track volunteer availability and shifts
- **Performance Tracking**: Monitor volunteer activities and contributions

### 📍 Location Services
- **Interactive Map**: Sri Lanka map with emergency locations
- **Location Search**: Find nearby emergency centers and shelters
- **Real-time Updates**: Live location status and availability
- **Legend System**: Color-coded location types (hospitals, relief centers, shelters)

### 👤 User Profile Management
- **Profile View**: Display user information and statistics
- **Profile Editing**: Update personal information and preferences
- **Activity History**: Track user's emergency and relief history
- **Notifications**: Real-time notifications and alerts

## Screens

1. **Welcome Screen**: Main dashboard with action buttons
2. **Emergency Screen**: Request rescue with location and time selection
3. **Evacuation Time Screen**: Time slot selection for evacuation
4. **Volunteer Screen**: Volunteer registration and management
5. **Map Screen**: Interactive location map with legend
6. **Profile Screen**: User profile view and editing
7. **Relief Screen**: Relief booking and management

## Technology Stack

- **Framework**: React Native 0.73.0
- **Navigation**: React Navigation v6
- **State Management**: React Hooks (useState, useEffect)
- **UI Components**: React Native core components
- **Icons**: React Native Vector Icons
- **Styling**: StyleSheet API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Maps**: React Native SVG (custom map implementation)

## Prerequisites

- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- JDK 11 or higher

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ResQLKMobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies (macOS only)**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Configure environment**
   - Update the API base URL in `src/services/api.ts`
   - Configure your backend server URL

## Running the App

### Android
```bash
npx react-native run-android
```

### iOS (macOS only)
```bash
npx react-native run-ios
```

### Metro Bundler
```bash
npx react-native start
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
│   ├── WelcomeScreen.tsx
│   ├── EmergencyScreen.tsx
│   ├── EvacuationTimeScreen.tsx
│   ├── VolunteerScreen.tsx
│   ├── MapScreen.tsx
│   ├── ProfileScreen.tsx
│   └── ReliefScreen.tsx
├── services/           # API services and utilities
│   └── api.ts
├── utils/              # Utility functions and configurations
│   └── navigation.tsx
└── assets/             # Images, fonts, and other assets
```

## API Integration

The app connects to the ResQ-LK backend API with the following endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Emergency Management
- `POST /api/emergency/requests` - Create emergency request
- `GET /api/emergency/requests` - Get emergency requests
- `GET /api/emergency/locations` - Get emergency locations
- `GET /api/emergency/timeslots` - Get time slots

### Volunteer Management
- `POST /api/volunteer/register` - Volunteer registration
- `GET /api/volunteer/volunteers` - Get volunteers
- `PUT /api/volunteer/volunteers/:id` - Update volunteer

### Relief Management
- `POST /api/relief/requests` - Create relief request
- `GET /api/relief/requests` - Get relief requests

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
API_BASE_URL=http://localhost:3000/api
```

### Backend Connection
Update the API base URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://your-backend-url:3000/api';
```

## Development

### Code Style
- Use TypeScript for type safety
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling

### Testing
```bash
npm test
```

### Building for Production

#### Android
```bash
cd android
./gradlew assembleRelease
```

#### iOS
```bash
cd ios
xcodebuild -workspace ResQLKMobile.xcworkspace -scheme ResQLKMobile -configuration Release
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Android build issues**
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

3. **iOS build issues**
   ```bash
   cd ios && pod deintegrate && pod install && cd ..
   ```

### Debugging
- Use React Native Debugger
- Enable Chrome Developer Tools
- Use Flipper for advanced debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Version History

- **v1.0.0**: Initial release with core features
  - Welcome screen with navigation
  - Emergency request system
  - Volunteer registration
  - Location services
  - Profile management
  - Backend API integration
