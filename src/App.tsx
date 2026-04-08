import { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Boss } from './pages/Boss';
import { Login } from './pages/Login';
import { Stats } from './pages/Stats';
import { useAuthStore } from './store/useAuthStore';
import { useUserStore } from './store/useUserStore';
import { useHabitStore } from './store/useHabitStore';

// Global Error Boundary to catch Firebase async crashes and React errors
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught app error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full items-center justify-center p-6 bg-surface-container-lowest text-center">
          <div className="max-w-md p-8 rounded-xl bg-surface-container-highest border border-error-container">
            <span className="material-symbols-outlined text-error text-6xl mb-4">warning</span>
            <h1 className="text-2xl font-bold text-error mb-2 tracking-tight">System Failure</h1>
            <p className="text-on-surface-variant font-body mb-6 text-sm">
              The application encountered an unexpected error. Please restart your session.
            </p>
            <div className="text-xs bg-surface-container text-on-surface p-4 rounded text-left overflow-auto max-h-32 mb-6">
              {this.state.error?.message}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-error-container text-on-error hover:bg-error transition-colors rounded font-bold font-label tracking-widest uppercase text-sm"
            >
              Reboot Matrix
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route Wrapper
const AuthGuard = ({ children }: { children: ReactNode }) => {
  const fbUser = useAuthStore(state => state.fbUser);
  if (!fbUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Temporary placeholders for our pages.
const Profile = () => <div className="text-center pt-32">Profile Working</div>;

function App() {
  const initAuthListener = useAuthStore(state => state.initAuthListener);
  const fbUser = useAuthStore(state => state.fbUser);
  const initialized = useAuthStore(state => state.initialized);
  const initUserListener = useUserStore(state => state.initUserListener);
  const initDataSync = useHabitStore(state => state.initDataSync);

  useEffect(() => {
    initAuthListener();
  }, [initAuthListener]);

  useEffect(() => {
    if (fbUser) {
      const unsubUser = initUserListener();
      const unsubData = initDataSync(fbUser.uid);
      return () => {
        unsubUser();
        unsubData();
      }
    }
  }, [initUserListener, initDataSync, fbUser]);

  if (!initialized) {
    return <div className="h-screen w-full bg-background flex flex-col items-center justify-center text-primary-container">
      <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
      <p className="font-mono text-xs uppercase tracking-widest mt-4">Initializing Security Protocol...</p>
    </div>;
  }

  return (
    <ErrorBoundary>
      <div className="max-w-md mx-auto w-full min-h-[100dvh] relative bg-background shadow-2xl sm:border-x sm:border-neutral-900 overflow-x-hidden flex flex-col">
        <Router>
          <Routes>
            <Route path="/login" element={!fbUser ? <Login /> : <Navigate to="/dashboard" replace />} />
            
            <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/boss" element={<AuthGuard><Boss /></AuthGuard>} />
            <Route path="/stats" element={<AuthGuard><Stats /></AuthGuard>} />
            <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </div>
    </ErrorBoundary>
  );
}

export default App;
