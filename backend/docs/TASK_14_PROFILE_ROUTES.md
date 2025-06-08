# Task 14: Profile Enhancement Routes Documentation

## Overview

Task 14 introduces comprehensive profile enhancement functionality to the Smile Adventure application, providing advanced user profile management, avatar upload capabilities, professional search features, and admin user management tools.

## Features Implemented

### 1. Enhanced Profile Management
- **Profile Completion Tracking**: Real-time calculation of profile completion percentage
- **Profile Updates**: Comprehensive user profile editing with validation
- **Emergency Contacts**: Support for emergency contact information
- **Communication Preferences**: User-defined communication method preferences

### 2. Avatar Upload System
- **File Upload**: Secure avatar image upload with validation
- **File Type Validation**: Support for common image formats (JPG, PNG, GIF)
- **Size Limitations**: Configurable file size limits (default 2MB)
- **Storage Management**: Organized file storage in dedicated avatar directory

### 3. User Preferences Management
- **Language Settings**: Multi-language support configuration
- **Theme Preferences**: Light/dark/auto theme selection
- **Notification Settings**: Customizable notification preferences
- **Privacy Controls**: Granular privacy level management
- **Timezone Configuration**: User-specific timezone settings

### 4. Professional Search & Discovery
- **Advanced Filters**: Search by specialization, location, experience, availability
- **Distance-Based Search**: Proximity-based professional discovery
- **Insurance Filtering**: Filter professionals by insurance acceptance
- **Professional Profiles**: Detailed professional information display

### 5. Admin User Management
- **User Overview**: Comprehensive user list with pagination
- **Status Management**: Admin controls for user activation/deactivation
- **Profile Monitoring**: Profile completion tracking for all users
- **User Analytics**: Activity tracking and user statistics

## API Endpoints

### Profile Management Endpoints

#### GET `/users/profile/completion`
- **Description**: Get user profile completion status
- **Authentication**: Required
- **Response**: Profile completion percentage, missing fields, recommendations

#### PUT `/users/profile/update`
- **Description**: Update user profile information
- **Authentication**: Required
- **Body**: UserProfileUpdate schema
- **Response**: Updated user profile

#### POST `/users/profile/avatar`
- **Description**: Upload user avatar image
- **Authentication**: Required
- **Body**: Multipart form data with image file
- **Response**: Avatar upload status and URL

### Preferences Endpoints

#### GET `/users/profile/preferences`
- **Description**: Get user preferences
- **Authentication**: Required
- **Response**: Current user preferences

#### PUT `/users/profile/preferences`
- **Description**: Update user preferences
- **Authentication**: Required
- **Body**: UserPreferences schema
- **Response**: Updated preferences

### Professional Search Endpoints

#### POST `/users/profile/search/professionals`
- **Description**: Search for professionals with filters
- **Authentication**: Required
- **Body**: ProfessionalSearchFilters schema
- **Response**: List of matching professionals

#### GET `/users/profile/professional/{professional_id}`
- **Description**: Get detailed professional profile
- **Authentication**: Required
- **Parameters**: professional_id (integer)
- **Response**: Professional profile details

### Admin Management Endpoints

#### GET `/users/profile/admin/users`
- **Description**: Get all users (admin only)
- **Authentication**: Admin role required
- **Query Parameters**: page, limit
- **Response**: Paginated user list

#### PUT `/users/profile/admin/users/{user_id}/status`
- **Description**: Update user status (admin only)
- **Authentication**: Admin role required
- **Parameters**: user_id (integer)
- **Body**: User status update data
- **Response**: Updated user information

#### DELETE `/users/profile/admin/users/{user_id}`
- **Description**: Delete user account (admin only)
- **Authentication**: Admin role required
- **Parameters**: user_id (integer)
- **Response**: Deletion confirmation

## Schemas

### ProfileCompletionResponse
```python
{
    "completion_percentage": int,
    "missing_fields": List[str],
    "recommendations": List[str]
}
```

### UserProfileUpdate
```python
{
    "first_name": Optional[str],
    "last_name": Optional[str],
    "phone_number": Optional[str],
    "bio": Optional[str],
    "location": Optional[str],
    "emergency_contact_name": Optional[str],
    "emergency_contact_phone": Optional[str],
    "preferred_communication": Optional[str]
}
```

### UserPreferences
```python
{
    "language": str,
    "timezone": str,
    "notifications_enabled": bool,
    "privacy_level": str,
    "theme": str
}
```

### ProfessionalSearchFilters
```python
{
    "specializations": Optional[List[str]],
    "location": Optional[str],
    "experience_years": Optional[int],
    "availability": Optional[str],
    "max_distance": Optional[int],
    "accepts_insurance": Optional[bool]
}
```

## Configuration Settings

### Avatar Upload Configuration
- `AVATAR_MAX_SIZE`: Maximum avatar file size (default: 2MB)
- `AVATAR_ALLOWED_TYPES`: Allowed file types (jpg, jpeg, png, gif)
- `AVATAR_UPLOAD_PATH`: Upload directory path

### Profile Completion Configuration
- `PROFILE_COMPLETION_REQUIRED_FIELDS`: Required fields for completion calculation
- `PROFILE_COMPLETION_OPTIONAL_FIELDS`: Optional fields contributing to completion

### Search Configuration
- `PROFESSIONAL_SEARCH_RADIUS`: Default search radius (default: 25 miles)
- `PROFESSIONAL_SEARCH_LIMIT`: Maximum search results (default: 50)

## Database Schema Changes

### New Tables
1. **user_preferences**: User preference storage
2. **professional_profiles**: Enhanced professional information
3. **user_activity_logs**: Activity tracking for audit trails
4. **professional_reviews**: Review and rating system

### Enhanced User Table
- Added bio, location, avatar_url fields
- Added emergency contact information
- Added communication preferences
- Added profile update tracking

## Security Features

### Role-Based Access Control
- **User Role**: Access to personal profile and search features
- **Professional Role**: Enhanced profile management and visibility
- **Admin Role**: Full user management capabilities

### File Upload Security
- File type validation
- File size restrictions
- Secure file storage
- Malicious file detection

### Data Validation
- Phone number format validation
- Email format validation
- Input sanitization
- XSS prevention

## Error Handling

### Custom Exceptions
- `ProfileNotFoundError`: Profile not found
- `InvalidAvatarError`: Invalid avatar file
- `AvatarUploadError`: Avatar upload failure
- `ProfileUpdateError`: Profile update failure
- `InsufficientPermissionsError`: Access denied
- `ProfessionalNotFoundError`: Professional not found
- `PreferencesUpdateError`: Preferences update failure

### Error Response Format
```python
{
    "detail": "Error description",
    "status_code": 400,
    "error_type": "ValidationError"
}
```

## Testing

### Test Coverage
- Profile completion calculation
- Profile update validation
- Avatar upload functionality
- User preferences management
- Professional search filters
- Admin user management
- Role-based access control
- Error handling scenarios

### Test Files
- `backend/tests/test_profile_routes.py`: Comprehensive route testing
- Database fixtures and mock data
- Authentication token testing
- File upload testing

## Usage Examples

### Update User Profile
```python
headers = {"Authorization": f"Bearer {access_token}"}
data = {
    "bio": "Healthcare professional specializing in pediatric care",
    "location": "New York, NY",
    "phone_number": "+1234567890"
}
response = requests.put("/users/profile/update", json=data, headers=headers)
```

### Upload Avatar
```python
headers = {"Authorization": f"Bearer {access_token}"}
files = {"file": ("avatar.jpg", open("avatar.jpg", "rb"), "image/jpeg")}
response = requests.post("/users/profile/avatar", files=files, headers=headers)
```

### Search Professionals
```python
headers = {"Authorization": f"Bearer {access_token}"}
filters = {
    "specializations": ["behavioral_therapy", "occupational_therapy"],
    "location": "New York",
    "max_distance": 25,
    "accepts_insurance": true
}
response = requests.post("/users/profile/search/professionals", json=filters, headers=headers)
```

## Integration Notes

### Router Integration
- Profile routes integrated into main users router with `/profile` prefix
- Consistent with existing application architecture
- Maintains backward compatibility

### Database Migration
- Migration file: `003_add_profile_enhancements.py`
- Adds new tables and columns
- Includes proper indexes for performance
- Supports both upgrade and downgrade operations

### Configuration Updates
- Added Task 14 specific configuration settings
- Maintains existing configuration structure
- Environment-specific settings support

## Performance Considerations

### Database Optimization
- Proper indexing on frequently queried columns
- Efficient search queries with filters
- Pagination for large result sets

### File Storage
- Organized file storage structure
- Efficient file serving
- CDN-ready file URLs

### Caching Opportunities
- Profile completion calculation caching
- Search result caching
- User preference caching

## Future Enhancements

### Potential Improvements
1. **Advanced Search**: Geolocation-based search with maps
2. **Review System**: Professional rating and review functionality
3. **Appointment Booking**: Direct appointment scheduling
4. **Communication Tools**: In-app messaging system
5. **Mobile App Support**: Mobile-optimized endpoints
6. **Analytics Dashboard**: User behavior analytics
7. **Multi-factor Authentication**: Enhanced security features
8. **Social Features**: User connections and networks

### Scalability Considerations
- Microservice architecture preparation
- Database sharding strategies
- CDN integration for file storage
- API rate limiting implementation
