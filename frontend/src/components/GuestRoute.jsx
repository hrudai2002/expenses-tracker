import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function GuestRoute({ children }) {
  const { isAuthenticated, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="screen-state">
        <div className="state-card">
          <h2>Preparing your workspace...</h2>
          <p>Checking your session and syncing the latest account details.</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default GuestRoute;

