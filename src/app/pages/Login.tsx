import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/");
      } else {
        setError(t.login.invalidCredentials);
      }
    } catch (err) {
      setError(t.login.errorOccurred);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-slate-100 flex items-center justify-center overflow-hidden p-4 sm:p-6">
      {/* Background Blur Effects */}
      <div className="absolute top-0 left-0 w-[200px] sm:w-[384px] h-[200px] sm:h-[384px] bg-[rgba(108,92,231,0.12)] rounded-full blur-[80px] sm:blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[200px] sm:w-[384px] h-[200px] sm:h-[384px] bg-[rgba(255,46,99,0.12)] rounded-full blur-[80px] sm:blur-[120px]" />

      {/* Login Card */}
      <div className="relative bg-#1a1514 border border-[#2a2a2a] rounded-[14px] p-6 sm:p-[30px] w-full max-w-[448px] shadow-2xl">
        {/* Logo & Branding */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#FF2E63] shadow-[0px_0px_40px_0px_rgba(108,92,231,0.35)] overflow-hidden mb-4 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">C</span>
          </div>
          <h1 className="text-[30px] font-extrabold leading-[36px] tracking-[4px] uppercase bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] bg-clip-text text-transparent mb-1">
            CINEMATE
          </h1>
          <p className="text-gray-400 text-sm font-bold">
            {t.login.adminPortal}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-white text-sm font-bold">
              {t.login.emailAddress}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cinemate.com"
              required
              disabled={isLoading}
              className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-[14px] px-4 py-3 text-slate-100 placeholder:text-gray-500 focus:outline-none focus:border-[#555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-white text-sm font-bold">
              {t.login.password}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.login.enterPassword}
                required
                disabled={isLoading}
                className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-[14px] px-4 py-3 pr-12 text-slate-100 placeholder:text-gray-500 focus:outline-none focus:border-[#555] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[51px] rounded-[14px] text-white text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity bg-gradient-to-r from-[#6C5CE7] to-[#FF2E63] hover:opacity-90"
          >
            {isLoading ? t.login.signingIn : t.login.signIn}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <p className="text-[#52525c] text-xs text-center">
          {t.login.footerText}
        </p>
      </div>
    </div>
  );
};

export default Login;
