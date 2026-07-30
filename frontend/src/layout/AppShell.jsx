import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';

function AppShell() {
  const location = useLocation();
  const pageClass = location.pathname.replace('/', '') || 'dashboard';

  return (
    <div className={`app-shell ${pageClass}`}>
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
