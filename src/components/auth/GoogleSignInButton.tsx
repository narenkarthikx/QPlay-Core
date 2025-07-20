import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import { googleAuthService } from '../../services/googleAuth';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
}) => {
  const { signInWithGoogle } = useAuth();
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Google Identity Services is available
    const checkGoogleAvailability = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        setIsGoogleLoaded(true);
      } else {
        // Wait a bit more and try again
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.google?.accounts?.id) {
            setIsGoogleLoaded(true);
          } else {
            setLoadError('Google services failed to load. This might be due to network restrictions or ad blockers.');
          }
        }, 2000);
      }
    };

    checkGoogleAvailability();
  }, []);

  const handleSuccess = async (credentialResponse: any) => {
    try {
      await signInWithGoogle(credentialResponse);
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.message || 'Google sign-in failed';
      onError?.(errorMessage);
    }
  };

  const handleError = () => {
    const errorMessage = 'Google sign-in was cancelled or failed';
    onError?.(errorMessage);
  };

  if (!googleAuthService.isConfigured()) {
    return (
      <div className="w-full p-3 bg-gray-800/30 border border-gray-600 rounded-xl text-center">
        <p className="text-gray-400 text-sm">
          Google Sign-In is not configured
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full space-y-2">
        <div className="w-full p-3 bg-yellow-900/30 border border-yellow-600 rounded-xl text-center">
          <p className="text-yellow-300 text-sm font-medium mb-1">
            Google Sign-In Unavailable
          </p>
          <p className="text-yellow-200 text-xs">
            {loadError}
          </p>
        </div>
        {/* Demo button for development/testing */}
        <button
          onClick={() => {
            // Simulate a Google OAuth response for testing
            // In production, this would be replaced by the actual Google OAuth button
            const mockCredential = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjdkYzBkYjU5OGJiNjJhZGU4ZmVjMmRhOWVmMTBkMjQ0YjBkZjNjZjciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMTQ2OTk2MzkzODc2LWw2cDV2dXU5NWY1ZWdyYjJpcmtjYXNsc21lZHRpcWZwLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMTQ2OTk2MzkzODc2LWw2cDV2dXU5NWY1ZWdyYjJpcmtjYXNsc21lZHRpcWZwLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTEyNjE3OTc1ODY5MjgzMDA5MDAyIiwiZW1haWwiOiJ0ZXN0dXNlckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6InRhNW5SUEFGZFlEb3BkVEN6TjZQYVEiLCJuYW1lIjoiVGVzdCBVc2VyIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0l6LUxHRy1laWJVSDNtNjhiWWdKQV85VEJMV3cwOGtuZkZCNnFKRGtNQz1zOTYtYyIsImdpdmVuX25hbWUiOiJUZXN0IiwiZmFtaWx5X25hbWUiOiJVc2VyIiwiaWF0IjoxNzA1MDQxNjAwLCJleHAiOjE3MDUwNDUyMDB9.mock-signature";
            
            const mockGoogleResponse = {
              credential: mockCredential,
            };
            handleSuccess(mockGoogleResponse);
          }}
          className="w-full px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-500 rounded-xl
                   transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
          disabled={disabled}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continue with Google (Demo)</span>
        </button>
      </div>
    );
  }

  if (!isGoogleLoaded) {
    return (
      <div className="w-full p-3 bg-gray-800/30 border border-gray-600 rounded-xl text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
          <p className="text-gray-400 text-sm">
            Loading Google Sign-In...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        auto_select={false}
        theme="filled_black"
        size="large"
        text="signin_with"
        shape="rectangular"
        width="100%"
        disabled={disabled}
      />
    </div>
  );
};

export default GoogleSignInButton;