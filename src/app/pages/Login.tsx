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
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden p-4 sm:p-6">
      {/* Background Blur Effects */}
      <div className="absolute top-0 left-0 w-[200px] sm:w-[384px] h-[200px] sm:h-[384px] bg-[rgba(231,0,11,0.1)] rounded-full blur-[80px] sm:blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[200px] sm:w-[384px] h-[200px] sm:h-[384px] bg-[rgba(228,150,0,0.1)] rounded-full blur-[80px] sm:blur-[120px]" />

      {/* Login Card */}
      <div className="relative bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] p-6 sm:p-[30px] w-full max-w-[448px] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.4)]">
        {/* Logo & Branding */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-[#e7000b] to-[#e49600] shadow-[0px_0px_40px_0px_rgba(231,0,11,0.3)] overflow-hidden mb-4 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">M</span>
          </div>
          <h1
            className="text-[30px] font-extrabold leading-[36px] tracking-[4px] uppercase bg-clip-text text-transparent mb-1"
            style={{
              fontFamily: "'Open Sans', sans-serif",
              fontVariationSettings: "'wdth' 100",
              backgroundImage:
                "linear-gradient(90deg, rgb(228, 150, 0) 0%, rgb(230, 157, 46) 7.1429%, rgb(231, 164, 69) 14.286%, rgb(233, 171, 87) 21.429%, rgb(234, 177, 103) 28.571%, rgb(235, 184, 119) 35.714%, rgb(236, 191, 133) 42.857%, rgb(238, 197, 147) 50%, rgb(239, 204, 161) 57.143%, rgb(240, 210, 174) 64.286%, rgb(240, 217, 188) 71.429%, rgb(241, 223, 201) 78.571%, rgb(242, 229, 214) 85.714%, rgb(242, 236, 227) 92.857%, rgb(243, 242, 240) 100%)",
            }}
          >
            MOITV
          </h1>
          <p className="text-[#71717b] text-sm font-bold">
            {t.login.adminPortal}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 p-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#ef4444] flex-shrink-0" />
            <p className="text-[#ef4444] text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-[#d4d4d8] text-sm font-bold">
              {t.login.emailAddress}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@moitv.com"
              required
              disabled={isLoading}
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] px-4 py-3 text-white placeholder:text-[#52525c] focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-[#d4d4d8] text-sm font-bold">
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
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] px-4 py-3 pr-12 text-white placeholder:text-[#52525c] focus:outline-none focus:border-[rgba(255,255,255,0.2)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717b] hover:text-white transition-colors disabled:opacity-50"
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
            className="w-full h-[51px] rounded-[14px] text-white text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgb(231, 0, 11) 0%, rgb(231, 33, 11) 7.1429%, rgb(232, 49, 10) 14.286%, rgb(232, 62, 10) 21.429%, rgb(232, 73, 9) 28.571%, rgb(232, 82, 9) 35.714%, rgb(232, 91, 8) 42.857%, rgb(232, 100, 7) 50%, rgb(232, 107, 7) 57.143%, rgb(232, 115, 6) 64.286%, rgb(231, 122, 5) 71.429%, rgb(231, 130, 4) 78.571%, rgb(230, 136, 2) 85.714%, rgb(229, 143, 1) 92.857%, rgb(228, 150, 0) 100%)",
            }}
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
