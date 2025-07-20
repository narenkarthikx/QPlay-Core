# Google OAuth Integration Guide

## Overview

This document describes the Google OAuth 2.0 integration implemented for the Quantum Quest application. The integration allows users to sign in using their Google accounts while maintaining compatibility with the existing email/password authentication system.

## Frontend Implementation ✅ COMPLETE

### Components Added

1. **Google OAuth Service** (`src/services/googleAuth.ts`)
   - Handles JWT token decoding
   - Processes Google OAuth responses
   - Provides configuration validation
   - Supports mock tokens for testing

2. **Google Sign-In Button** (`src/components/auth/GoogleSignInButton.tsx`)
   - Renders Google OAuth button using `@react-oauth/google`
   - Handles loading states and error conditions
   - Provides fallback demo button when Google services are blocked
   - Graceful error handling with user-friendly messages

3. **Updated Auth Context** (`src/contexts/AuthContext.tsx`)
   - Added `signInWithGoogle` method
   - Integrates with existing authentication flow
   - Maintains unified user session management

4. **Updated Auth Modal** (`src/components/auth/AuthModal.tsx`)
   - Added "Or continue with" divider
   - Integrated Google Sign-In button
   - Consistent error handling

### Environment Configuration

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=146996393876-l6p5vuu95f5egrb2irkcaslsmedtiqfp.apps.googleusercontent.com
```

### Flow

1. User clicks "Sign in with Google" button
2. Google OAuth popup appears (or demo button if blocked)
3. User authenticates with Google
4. Google returns JWT credential token
5. Frontend decodes token to extract user info
6. Frontend sends credential + user info to backend `/api/auth/google`
7. Backend validates token and creates/updates user
8. Backend returns access token
9. Frontend stores token and updates user session

## Backend Integration ⚠️ REQUIRED

The backend needs to implement the following endpoint to complete the integration:

### Endpoint: `POST /api/auth/google`

**Request Body:**
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6...", // Google JWT token
  "user_info": {
    "id": "112617975869283009002",
    "email": "user@gmail.com",
    "name": "User Name",
    "picture": "https://lh3.googleusercontent.com/...",
    "given_name": "User",
    "family_name": "Name"
  }
}
```

**Response:**
```json
{
  "access_token": "your-app-access-token",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "user-uuid",
    "email": "user@gmail.com",
    "username": "generated-or-existing-username",
    "full_name": "User Name",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "login_type": "google",
    "created_at": "2024-01-01T00:00:00Z",
    // ... other user fields
  }
}
```

### Backend Implementation Logic

1. **Verify Google JWT Token**
   - Validate token signature using Google's public keys
   - Verify token audience matches your client ID
   - Extract user information from verified token

2. **User Management**
   - Check if user exists by email in database
   - If exists: Update user info (name, picture) and login timestamp
   - If new: Create user with Google profile information
   - Set `login_type` to 'google'

3. **Session Management**
   - Generate your app's access token
   - Return user data and token

### Python Backend Example (using Supabase)

```python
import jwt
import requests
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    data = request.get_json()
    credential = data.get('credential')
    user_info = data.get('user_info')
    
    try:
        # Verify Google token
        id_info = id_token.verify_oauth2_token(
            credential, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )
        
        # Extract email from verified token
        email = id_info['email']
        
        # Check if user exists in Supabase
        existing_user = supabase.table('users').select('*').eq('email', email).execute()
        
        if existing_user.data:
            # Update existing user
            user = existing_user.data[0]
            updated_user = supabase.table('users').update({
                'full_name': user_info.get('name'),
                'avatar_url': user_info.get('picture'),
                'last_login': datetime.utcnow().isoformat(),
                'login_type': 'google'
            }).eq('id', user['id']).execute()
            user_data = updated_user.data[0]
        else:
            # Create new user
            new_user = supabase.table('users').insert({
                'email': email,
                'username': generate_username_from_email(email),
                'full_name': user_info.get('name'),
                'avatar_url': user_info.get('picture'),
                'login_type': 'google',
                'is_verified': True,  # Google emails are pre-verified
                'created_at': datetime.utcnow().isoformat()
            }).execute()
            user_data = new_user.data[0]
        
        # Generate access token for your app
        access_token = generate_jwt_token(user_data['id'])
        
        return jsonify({
            'access_token': access_token,
            'token_type': 'bearer',
            'expires_in': 3600,
            'user': user_data
        })
        
    except ValueError as e:
        return jsonify({'error': 'Invalid Google token'}), 400
    except Exception as e:
        return jsonify({'error': 'Authentication failed'}), 500
```

## Data Saved

When a user signs in with Google, the following data is saved:

| Field | Source | Required | Description |
|-------|--------|----------|-------------|
| `email` | Google token | ✅ | User's Google email address |
| `name`/`full_name` | Google profile | ✅ | User's display name from Google |
| `avatar_url`/`profile_img` | Google profile | ❌ | Profile picture URL |
| `login_type` | System | ✅ | Set to 'google' |
| `created_at` | System | ✅ | Account creation timestamp |
| `last_login` | System | ✅ | Last login timestamp |
| `is_verified` | System | ✅ | Set to true (Google pre-verifies emails) |

## Testing

### Frontend Testing ✅ COMPLETE

1. **Normal Environment**: Google OAuth button appears and functions
2. **Blocked Environment**: Graceful fallback with error message and demo button
3. **Demo Mode**: Mock Google token is processed correctly
4. **Error Handling**: Network errors and token validation failures are handled

### Backend Testing ⚠️ TODO

1. Test Google token verification
2. Test user creation for new Google users
3. Test user login for existing Google users
4. Test user login for existing email/password users with same email
5. Verify unified session management

## Security Considerations

1. **No secrets in frontend**: Only client ID is exposed (this is safe)
2. **Token verification**: Backend must verify Google JWT tokens
3. **Secure session management**: Use your app's own access tokens
4. **Email validation**: Ensure Google emails match existing users correctly

## Error Handling

### Frontend Errors ✅ IMPLEMENTED
- Google services blocked/unavailable
- Network connection issues
- Token processing failures
- Backend API errors

### Backend Errors ⚠️ TODO
- Invalid Google tokens
- Token verification failures
- Database errors
- User creation/update failures

## Production Deployment

1. **Environment Variables**: Ensure `VITE_GOOGLE_CLIENT_ID` is set
2. **Google Console**: Configure authorized domains
3. **Backend**: Implement `/api/auth/google` endpoint
4. **Testing**: Verify end-to-end flow

## Current Status

- ✅ Frontend implementation complete
- ✅ Google OAuth button integration
- ✅ Error handling and fallbacks
- ✅ Mock testing functionality
- ⚠️ Backend endpoint implementation needed
- ⚠️ End-to-end testing pending

The frontend is production-ready and will work seamlessly once the backend endpoint is implemented.