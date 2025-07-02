# 🔐 Google Sign-In Integration — Setup & Summary

This document outlines the complete integration of **Google Sign-In** in both the **React frontend** and **Flask backend** using Supabase.

---

## ✅ 1. `.env` (Frontend) – ➕ Added

**Purpose**: Store environment variables for Google OAuth and backend URL.

```env
VITE_BACKEND_URL=http://127.0.0.1:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## ✅ 2. `vite-env.d.ts` – ➕ Added

**Purpose**: Enable TypeScript support for `import.meta.env`.

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## ✅ 3. `tsconfig.json` – ✅ Updated

**Purpose**: Ensure proper TypeScript support for Vite, JSX, and `vite-env`.

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["vite/client"]
  },
  "include": ["src", "vite-env.d.ts"]
}
```

---

## ✅ 4. `App.tsx` – ✅ Updated

**Purpose**: Wrap the app in `<GoogleOAuthProvider>`.

```tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
  <App />
</GoogleOAuthProvider>
```

---

## ✅ 5. `AuthModal.tsx` – ✅ Updated

**Purpose**: Integrated Google Login button in the Auth modal.

```ts
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { toast } from 'react-hot-toast';

const LoginWithGoogle: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { signInWithGoogle } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const credential = credentialResponse.credential;
    if (!credential) {
      toast.error("Missing Google credential");
      return;
    }

    try {
      await signInWithGoogle(credential);
      toast.success("Welcome to Quantum Quest!");
      onClose();
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      toast.error("Google Login Failed");
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => toast.error("Google Login Failed")}
    />
  );
};
```

→ Inserted inside modal:

```tsx
<div className="mt-6">
  <LoginWithGoogle onClose={onClose} />
</div>
```

---

## ✅ 6. `AuthContext.tsx` – ✅ Updated

**Purpose**: Added context logic for Google login.

```ts
// User interface updated
interface User {
  ...
  auth_provider: 'google' | 'email';
}

const signInWithGoogle = async (credential: string) => {
  setLoading(true);
  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential })
    });

    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      if (data.access_token) {
        localStorage.setItem("quantum-quest-token", data.access_token);
        apiService.setAuthToken(data.access_token);
      }
    } else {
      throw new Error(data.error || "Google sign-in failed");
    }
  } catch (err: any) {
    throw new Error(err.message || "Google auth error");
  } finally {
    setLoading(false);
  }
};
```

---

## ✅ 7. `services/api.ts` – ❌ No Change Needed

Handled Google login inside `AuthContext.tsx`.

---

## ✅ 8. `production_server.py` (Flask Backend) – ✅ Updated

**Purpose**: Handle Google Sign-In via `/api/auth/google`.

```python
from flask import request, jsonify
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
import requests
import os
import random
import string
from datetime import datetime, timezone

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

# Utility to generate unique username
def generate_username(email):
    base = email.split('@')[0]
    suffix = ''.join(random.choices(string.digits, k=4))
    return f"{base}_{suffix}"

@app.route('/api/auth/google', methods=['POST', 'OPTIONS'])
def google_auth():
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()
        credential = data.get("credential")
        if not credential:
            return jsonify({"success": False, "error": "Missing credential"}), 400

        id_info = id_token.verify_oauth2_token(
            credential, grequests.Request(), GOOGLE_CLIENT_ID
        )

        email = id_info["email"]
        full_name = id_info.get("name", "")
        avatar_url = id_info.get("picture", "")
        provider = "google"

        response = requests.get(
            f"{SUPABASE_REST_URL}/users?email=eq.{email}",
            headers=get_supabase_headers()
        )

        if response.status_code == 200 and response.json():
            user = response.json()[0]
            return jsonify({"success": True, "user": user})

        username = generate_username(email)
        username_check = requests.get(
            f"{SUPABASE_REST_URL}/users?username=eq.{username}",
            headers=get_supabase_headers()
        )
        while username_check.status_code == 200 and username_check.json():
            username = generate_username(email)
            username_check = requests.get(
                f"{SUPABASE_REST_URL}/users?username=eq.{username}",
                headers=get_supabase_headers()
            )

        user_data = {
            "email": email,
            "username": username,
            "full_name": full_name,
            "avatar_url": avatar_url,
            "auth_provider": provider,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "is_verified": True,
            "is_premium": False,
            "total_playtime": 0,
            "games_completed": 0,
            "best_completion_time": None,
            "total_score": 0,
            "quantum_mastery_level": 1,
            "is_active": True
        }

        response = requests.post(
            f"{SUPABASE_REST_URL}/users",
            headers=get_supabase_headers(use_service_key=True),
            json=user_data
        )

        if response.status_code not in [200, 201]:
            return jsonify({"success": False, "error": "User creation failed"}), 500

        created_user = response.json()[0]

        leaderboard_entries = [{
            "user_id": created_user.get("id"),
            "category": "total_score",
            "completion_time": None,
            "total_score": 0,
            "difficulty": "easy",
            "rooms_completed": 0,
            "hints_used": 0,
            "achieved_at": datetime.now(timezone.utc).isoformat()
        }]

        try:
            requests.post(
                f"{SUPABASE_REST_URL}/leaderboard_entries",
                headers=get_supabase_headers(use_service_key=True),
                json=leaderboard_entries
            )
        except Exception as e:
            print(f"[WARN] Leaderboard creation failed: {e}")

        return jsonify({"success": True, "user": created_user}), 201

    except ValueError as e:
        return jsonify({"success": False, "error": f"Invalid Google token: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Unexpected error: {str(e)}"}), 500
```

---

## ✅ 9. Supabase `users` Table – ✅ Updated

**New column**:

```sql
auth_provider TEXT DEFAULT 'email'
```

Used to distinguish users signed in via Google vs email/password.

---

## 📦 Packages Installed

```bash
# Frontend
npm install @react-oauth/google react-hot-toast

# Backend
pip install google-auth
```

---

You're now fully set up for **Google Sign-In with Supabase** and can build from here!

