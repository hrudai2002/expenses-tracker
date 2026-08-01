import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import ChangePasswordModal from './ChangePasswordModal.jsx';
import { BudgetIcon, DashboardIcon, MoreIcon, TransactionsIcon, TrendUpIcon } from './Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', Icon: DashboardIcon },
  { label: 'Transactions', to: '/transactions', Icon: TransactionsIcon },
  { label: 'Budget', to: '/budgets', Icon: BudgetIcon }
];

function Sidebar() {
  const { token, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!passwordModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [passwordModalOpen]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  const handleOpenChangePassword = () => {
    setMenuOpen(false);
    setPasswordModalOpen(true);
  };

  const passwordModal =
    passwordModalOpen ? (
      <ChangePasswordModal token={token} isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    ) : null;

  return (
    <aside className="sidebar">
      <div className="brand-panel">
        <div className="brand-mark">
          <TrendUpIcon />
        </div>
        <div>
          <h1>SpendWise</h1>
          <p>Expenses Tracker</p>
        </div>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-label">Menu</span>
        <nav className="sidebar-nav">
          {navItems.map(({ label, to, Icon }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-link-icon">
                <Icon />
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="profile-badge">{user?.name?.charAt(0) || 'U'}</div>
        <div className="sidebar-user-block">
          <div className="sidebar-user-copy">
            <strong>{user?.name || 'User'}</strong>
            <p>{user?.email || 'Signed in'}</p>
          </div>
          <div className="sidebar-menu" ref={menuRef}>
            <button
              type="button"
              className="sidebar-menu-trigger"
              aria-label="Account menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MoreIcon />
            </button>
            {menuOpen ? (
              <div className="sidebar-menu-dropdown">
                <button type="button" onClick={handleOpenChangePassword}>
                  Change password
                </button>
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {passwordModalOpen ? createPortal(passwordModal, document.body) : null}
    </aside>
  );
}

export default Sidebar;
