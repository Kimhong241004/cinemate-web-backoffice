// Routes configuration updated
import { createBrowserRouter } from 'react-router';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import ContentLibrary from './pages/ContentLibrary';
import UserManagement from './pages/UserManagement';
import TvChannels from './pages/TvChannels';
import Radio from './pages/Radio';
import Creators from './pages/Creators';
import Movies from './pages/Movies';
import AddMovie from './pages/AddMovie';
import Author from './pages/Author';
import Transactions from './pages/Transactions';
import PromoCodes from './pages/PromoCodes';
import Subscriptions from './pages/Subscriptions';
import UserSystem from './pages/UserSystem';
import Settings from './pages/Settings';
import ProfileSettings from './pages/ProfileSettings';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'content-library',
        element: <ContentLibrary />,
      },
      {
        path: 'user-management',
        element: <UserManagement />,
      },
      {
        path: 'tv-channels',
        element: <TvChannels />,
      },
      {
        path: 'radio',
        element: <Radio />,
      },
      {
        path: 'creators',
        element: <Creators />,
      },
      {
        path: 'movies',
        element: <Movies />,
      },
      {
        path: 'movies/add',
        element: <AddMovie />,
      },
      {
        path: 'movies/edit/:id',
        element: <AddMovie />,
      },
      {
        path: 'author',
        element: <Author />,
      },
      {
        path: 'transactions',
        element: <Transactions />,
      },
      {
        path: 'promo-codes',
        element: <PromoCodes />,
      },
      {
        path: 'subscriptions',
        element: <Subscriptions />,
      },
      {
        path: 'user-system',
        element: <UserSystem />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'profile-settings',
        element: <ProfileSettings />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
