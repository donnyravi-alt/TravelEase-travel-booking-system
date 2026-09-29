import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@travelease.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login({ email, password });
      if (data.user.role !== 'admin') {
        setError('Access denied. Account is not an administrator.');
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden border-top border-danger border-4">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <i className="bi bi-shield-lock-fill text-danger display-4"></i>
                <h3 className="fw-bold mt-2">Admin Portal</h3>
                <p className="text-muted small">TravelEase Administrative Management</p>
              </div>

              {error && (
                <div className="alert alert-danger rounded-3 small py-2 mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Admin Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-danger w-100 rounded-pill py-2 fw-bold shadow-sm" disabled={loading}>
                  {loading ? 'Authenticating...' : 'Sign In as Administrator'}
                </button>
              </form>

              <div className="mt-4 p-3 bg-light rounded-3 small">
                <strong className="d-block mb-1">Default Admin Login:</strong>
                <div>Email: <code>admin@travelease.com</code> (or <code>admin@travelgo.com</code>)</div>
                <div>Password: <code>admin123</code></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
