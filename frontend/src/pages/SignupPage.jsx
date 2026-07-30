import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function SignupPage() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

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
      await signup(formState);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-showcase">
        <span className="eyebrow">Create your workspace</span>
        <h1>Build cleaner money habits with a dashboard that feels made for you.</h1>
        <p>
          Set category budgets, log income or expenses anytime in the month, and keep the interface elegant while you learn your patterns.
        </p>
      </section>

      <section className="auth-card">
        <div className="auth-header">
          <h2>Create account</h2>
          <p>Start your private expense tracker in under a minute.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input name="name" type="text" placeholder="Alex Morgan" value={formState.name} onChange={handleChange} />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" placeholder="alex@example.com" value={formState.email} onChange={handleChange} />
          </label>
          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              placeholder="Choose a strong password"
              value={formState.password}
              onChange={handleChange}
            />
          </label>
          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
          <button type="submit" className="primary-button wide" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </div>
  );
}

export default SignupPage;
