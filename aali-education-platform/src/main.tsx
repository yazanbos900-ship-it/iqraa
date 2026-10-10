import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './firebase/AuthContext';
import { NotificationProvider } from './firebase/NotificationContext';
import { PlatformDataProvider } from './firebase/PlatformDataContext';

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <PlatformDataProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </PlatformDataProvider>
  </AuthProvider>
);
