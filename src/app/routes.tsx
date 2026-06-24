// Routes configuration updated
import { createBrowserRouter } from 'react-router';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard/Dashboard';
import UserManagement from './pages/UserManagment/UserManagement';
import Movies from './pages/Movies/Movies';
import AddMovie from './pages/Movies/AddMovie';
import EditMovie from './pages/Movies/EditMovie';
import Author from './pages/Author/Author';
import Transactions from './pages/Transactions/Transactions';
import PromoCodes from './pages/PromoCodes/PromoCodes';
import Subscriptions from './pages/Subscriptions/Subscriptions';
import UserSystem from './pages/UserSystem/UserSystem';
import Settings from './pages/Settings/Settings';
import ProfileSettings from './pages/Settings/ProfileSettings';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Rooms from './pages/Rooms/Rooms';

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

      // hidden Content Library route
     /* {
        path: 'content-library',
        element: <ContentLibrary />,
      }, */
      
      {
        path: 'user-management',
        element: <UserManagement />,
      },

      // hidden Content Management routes
      /* {
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
      }, */
      
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
        element: <EditMovie />,
      },
      {
        path: 'author',
        element: <Author />,
      },
      {
        path: 'rooms',
        element: <Rooms />,
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
