import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login({ email, password });
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(redirect);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <i className="bi bi-compass-fill text-primary display-4"></i>
                <h3 className="fw-bold mt-2">Welcome Back</h3>
                <p className="text-muted small">Sign in to manage your bookings and explore packages.</p>
              </div>

              {error && (
                <div className="alert alert-danger rounded-3 small py-2 mb-3" role="alert">
                  <i className="bi bi-exclamation-circle-fill me-1"></i> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope text-muted"></i></span>
                    <input
                      type="email"
                      className="form-control border-start-0"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-lock text-muted"></i></span>
                    <input
                      type="password"
                      className="form-control border-start-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 rounded-pill py-2 fw-bold shadow-sm" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Signing In...
                    </>
                  ) : (
                    'Log In'
                  )}
                </button>
              </form>

              <div className="mt-4 pt-3 border-top text-center small text-muted">
                Don't have an account yet?{' '}
                <Link to="/register" className="fw-bold text-primary text-decoration-none">
                  Register Now
                </Link>
              </div>

              <div className="mt-3 p-3 bg-light rounded-3 small">
                <strong className="d-block text-dark mb-1">Demo Credentials:</strong>
                <div>User: <code>john@example.com</code> / <code>user123</code></div>
                <div>Admin: <code>admin@travelease.com</code> / <code>admin123</code></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
