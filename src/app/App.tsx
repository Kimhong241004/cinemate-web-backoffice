import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
