import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { UploadManagerProvider } from './context/UploadManagerContext';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <UploadManagerProvider>
            <RouterProvider router={router} />
          </UploadManagerProvider>
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
