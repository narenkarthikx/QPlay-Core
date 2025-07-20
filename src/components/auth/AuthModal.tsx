import React, { useState } from "react";
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import GoogleSignInButton from "./GoogleSignInButton";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "signin",
}) => {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    fullName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, loading } = useAuth();

  // Modal transition state
  const [visible, setVisible] = useState(isOpen);

  React.useEffect(() => {
    if (isOpen) setVisible(true);
    else {
      // Delay unmount for transition
      const timeout = setTimeout(() => setVisible(false), 250);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Accessibility: trap focus when modal is open
  const modalRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length) focusable[0].focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (mode === "signin") {
        await signIn(formData.email, formData.password);
      } else {
        await signUp({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          full_name: formData.fullName || undefined,
        });
      }
      onClose();
    } catch (error: any) {
      setErrors({ general: error.message || "Authentication failed" });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setErrors({});
    setFormData({ email: "", password: "", username: "", fullName: "" });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 rounded-2xl border border-gray-700 max-w-md w-full p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-orbitron font-bold">
              {mode === "signin" ? "Welcome Back" : "Join Quantum Quest"}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {mode === "signin"
                ? "Sign in to continue your quantum journey"
                : "Create your account to start exploring"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl
                         focus:border-purple-400 focus:outline-none transition-colors duration-200"
                placeholder="Enter your email"
                required
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Username (signup only) */}
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl
                           focus:border-purple-400 focus:outline-none transition-colors duration-200"
                  placeholder="Choose a username"
                  required
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username}</p>
              )}
            </div>
          )}

          {/* Full Name (signup only, optional) */}
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl
                         focus:border-purple-400 focus:outline-none transition-colors duration-200"
                placeholder="Enter your full name"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-600 rounded-xl
                         focus:border-purple-400 focus:outline-none transition-colors duration-200"
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
            {mode === "signup" && (
              <p className="text-gray-500 text-xs mt-1">
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-900/30 border border-red-500 rounded-xl">
              <p className="text-red-300 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500
                     hover:from-purple-400 hover:to-violet-400 disabled:opacity-50
                     disabled:cursor-not-allowed rounded-xl font-semibold
                     transition-all duration-300 transform hover:scale-105
                     flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>
                  {mode === "signin" ? "Signing In..." : "Creating Account..."}
                </span>
              </>
            ) : (
              <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900/95 text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <GoogleSignInButton
            onSuccess={() => onClose()}
            onError={(error) => setErrors({ general: error })}
            disabled={loading}
          />

          {/* Mode Switch */}
          <div className="text-center pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              {mode === "signin"
                ? "Don't have an account?"
                : "Already have an account?"}
              <button
                type="button"
                onClick={switchMode}
                className="ml-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-200"
              >
                {mode === "signin" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </form>

        {/* Features Preview (signup mode) */}
        {mode === "signup" && (
          <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
            <h3 className="font-semibold text-purple-300 mb-2">
              What you'll get:
            </h3>
            <ul className="text-sm text-purple-200 space-y-1">
              <li>• Save your progress across all quantum rooms</li>
              <li>• Compete on global leaderboards</li>
              <li>• Unlock achievements and track statistics</li>
              <li>• Access to advanced quantum challenges</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
