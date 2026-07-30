import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const [formState, setFormState] = useState({
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

  const redirectPath = useMemo(() => location.state?.from || '/dashboard', [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((currentState) => ({
      ...currentState,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      await login(formState);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-showcase">
        <span className="eyebrow">SpendWise</span>
        <h1>Your monthly money story, minus the spreadsheet mess.</h1>
        <p>
          Track transactions, stay ahead of budgets, and keep the whole picture visible from one calm dashboard.
        </p>
      </section>

      <section className="auth-card">
        <div className="auth-header">
          <h2>Welcome back</h2>
          <p>Sign in to continue tracking your month.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input name="email" type="email" placeholder="alex@example.com" value={formState.email} onChange={handleChange} />
          </label>
          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formState.password}
              onChange={handleChange}
            />
          </label>
          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
          <button type="submit" className="primary-button wide" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </div>
  );
}

export default LoginPage;
