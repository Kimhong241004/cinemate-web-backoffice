import { Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../context/LanguageContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1
            className="text-[120px] sm:text-[180px] lg:text-[220px] font-extrabold bg-clip-text text-transparent leading-none"
            style={{
              backgroundImage:
                'linear-gradient(90deg, rgb(231, 0, 11) 0%, rgb(231, 33, 11) 7.1429%, rgb(232, 49, 10) 14.286%, rgb(232, 62, 10) 21.429%, rgb(232, 73, 9) 28.571%, rgb(232, 82, 9) 35.714%, rgb(232, 91, 8) 42.857%, rgb(232, 100, 7) 50%, rgb(232, 107, 7) 57.143%, rgb(232, 115, 6) 64.286%, rgb(231, 122, 5) 71.429%, rgb(231, 130, 4) 78.571%, rgb(230, 136, 2) 85.714%, rgb(229, 143, 1) 92.857%, rgb(228, 150, 0) 100%)',
            }}
          >
            404
          </h1>
        </div>

        <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
          {t.notFound.title}
        </h2>
        <p className="text-[#71717a] text-base sm:text-lg mb-8 max-w-md mx-auto">
          {t.notFound.message}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#18181b] border border-[#27272a] text-white rounded-lg hover:bg-[#27272a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.notFound.goBack}
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" />
            {t.notFound.goHome}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
