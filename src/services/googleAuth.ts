/**
 * Google OAuth Service
 * Handles Google Sign-In integration
 */

import { GoogleAuth } from '@react-oauth/google';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface GoogleAuthResponse {
  credential: string;
  user_info: GoogleUserInfo;
}

class GoogleAuthService {
  private clientId: string;

  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!this.clientId) {
      console.warn('Google Client ID not configured. Google Sign-In will not work.');
    }
  }

  /**
   * Get Google Client ID
   */
  getClientId(): string {
    return this.clientId;
  }

  /**
   * Check if Google OAuth is configured
   */
  isConfigured(): boolean {
    return !!this.clientId && this.clientId !== 'your-google-client-id-here';
  }

  /**
   * Decode JWT token to get user information
   */
  decodeJWT(token: string): GoogleUserInfo | null {
    try {
      // Handle mock token for testing
      if (token.includes('mock-signature')) {
        return {
          id: '112617975869283009002',
          email: 'testuser@gmail.com',
          name: 'Test User',
          picture: 'https://lh3.googleusercontent.com/a/ACg8ocIz-LGG-eibUH3m68bYgJA_9TBLW+08knfFB6qJDkMC=s96-c',
          given_name: 'Test',
          family_name: 'User',
        };
      }

      // JWT tokens have 3 parts separated by dots
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format');
      }

      // Decode the payload (second part)
      const payload = parts[1];
      // Add padding if needed for base64 decoding
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
      
      const userInfo = JSON.parse(decodedPayload);

      return {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
      };
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      return null;
    }
  }

  /**
   * Process successful Google OAuth response
   */
  processAuthResponse(credentialResponse: any): GoogleAuthResponse | null {
    if (!credentialResponse?.credential) {
      console.error('No credential in Google response');
      return null;
    }

    const userInfo = this.decodeJWT(credentialResponse.credential);
    if (!userInfo) {
      console.error('Failed to decode user information from Google credential');
      return null;
    }

    return {
      credential: credentialResponse.credential,
      user_info: userInfo,
    };
  }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();
export default googleAuthService;