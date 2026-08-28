import { useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Index from './pages/Index';
import GetStarted from './pages/GetStarted';
import ScrollToHash from './components/ScrollToHash';
import Auth from './pages/Auth';
import { ThemeProvider } from './components/ui/themeToggle'; // Your theme provider

const queryClient = new QueryClient();

const NavigationHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hasLoadedSession = sessionStorage.getItem('hasLoadedSession');
    if (!hasLoadedSession) {
      sessionStorage.setItem('hasLoadedSession', 'true');
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }
  }, [navigate, location]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      sessionStorage.removeItem('hasLoadedSession');
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* 1. Wrap the entire app in ThemeProvider */}
    <ThemeProvider> 
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <NavigationHandler>
            <ScrollToHash />
            <Routes>
              <Route path="/" element={<Auth />} />
              <Route path="/Index" element={<Index />} />
              <Route path="/get-started" element={<GetStarted />} />
            </Routes>
          </NavigationHandler>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;