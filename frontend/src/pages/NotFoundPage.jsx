import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="auth-shell simple">
      <section className="auth-card centered">
        <div className="auth-header">
          <h2>Page not found</h2>
          <p>The page you are looking for does not exist in this frontend yet.</p>
        </div>
        <Link to="/dashboard" className="primary-button wide">
          Back to Dashboard
        </Link>
      </section>
    </div>
  );
}

export default NotFoundPage;

