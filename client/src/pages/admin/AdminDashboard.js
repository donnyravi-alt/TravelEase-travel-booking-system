import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/admin/login');
      return;
    }
    loadDashboardData();
  }, [user, isAdmin]);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const statsData = await adminAPI.getStats();
      const usersData = await adminAPI.getAllUsers();
      setStats(statsData);
      setUsersList(usersData);
    } catch (err) {
      setError(err.message || 'Failed to load admin statistics.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Admin Dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger rounded-4 text-center">
          <h4>Admin Access Error</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Chart 1: Bookings by Destination (Bar Chart)
  const destinationLabels = stats?.destinations?.length > 0 
    ? stats.destinations.map(d => d.destination_name)
    : ['No Data Yet'];
  const destinationBookings = stats?.destinations?.length > 0
    ? stats.destinations.map(d => d.booking_count)
    : [0];
  const destinationRevenues = stats?.destinations?.length > 0
    ? stats.destinations.map(d => parseFloat(d.revenue || 0))
    : [0];

  const barChartData = {
    labels: destinationLabels,
    datasets: [
      {
        label: 'Number of Bookings',
        data: destinationBookings,
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
        borderRadius: 8
      },
      {
        label: 'Revenue ($)',
        data: destinationRevenues,
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        borderRadius: 8
      }
    ]
  };

  // Chart 2: Status Distribution (Doughnut Chart)
  const statusLabels = stats?.statuses?.length > 0
    ? stats.statuses.map(s => s.status)
    : ['Confirmed', 'Cancelled'];
  const statusCounts = stats?.statuses?.length > 0
    ? stats.statuses.map(s => s.count)
    : [0, 0];

  const doughnutChartData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusCounts,
        backgroundColor: ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6'],
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="container-fluid py-4 px-md-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom">
        <div>
          <span className="badge bg-danger px-3 py-1 rounded-pill mb-1 fw-bold">Admin Console</span>
          <h2 className="fw-extrabold mb-0 text-dark">TravelEase Operations Dashboard</h2>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <Link to="/admin/destinations" className="btn btn-outline-primary rounded-pill fw-bold">
            <i className="bi bi-geo-alt me-1"></i> Destinations
          </Link>
          <Link to="/admin/packages" className="btn btn-outline-primary rounded-pill fw-bold">
            <i className="bi bi-box-seam me-1"></i> Packages
          </Link>
          <Link to="/admin/hotels" className="btn btn-outline-primary rounded-pill fw-bold">
            <i className="bi bi-building me-1"></i> Hotels
          </Link>
          <Link to="/admin/bookings" className="btn btn-primary rounded-pill fw-bold">
            <i className="bi bi-journal-check me-1"></i> Manage Bookings
          </Link>
        </div>
      </div>

      {/* KPI Statistic Cards */}
      <div className="row g-4 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-primary text-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-white-70 small uppercase fw-bold">Total Registered Users</span>
                <h2 className="display-6 fw-extrabold mb-0">{stats?.summary?.total_users || 0}</h2>
              </div>
              <i className="bi bi-people display-4 text-white-50"></i>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-success text-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-white-70 small uppercase fw-bold">Total Bookings</span>
                <h2 className="display-6 fw-extrabold mb-0">{stats?.summary?.total_bookings || 0}</h2>
              </div>
              <i className="bi bi-ticket-perforated display-4 text-white-50"></i>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-warning text-dark h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-dark-70 small uppercase fw-bold">Total Platform Revenue</span>
                <h2 className="display-6 fw-extrabold mb-0">${parseFloat(stats?.summary?.total_revenue || 0).toFixed(2)}</h2>
              </div>
              <i className="bi bi-currency-dollar display-4 text-dark-50"></i>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-dark text-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-white-70 small uppercase fw-bold">Active Destinations</span>
                <h2 className="display-6 fw-extrabold mb-0">{stats?.summary?.active_destinations || 0}</h2>
              </div>
              <i className="bi bi-globe display-4 text-white-50"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 border-bottom pb-2">
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill fw-bold me-2 ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-bar-chart-line me-1"></i> Chart.js Analytics
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill fw-bold ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="bi bi-people me-1"></i> Registered Users ({usersList.length})
          </button>
        </li>
      </ul>

      {/* Overview Tab with Chart.js */}
      {activeTab === 'overview' && (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h5 className="fw-bold mb-4 text-dark"><i className="bi bi-graph-up text-primary me-2"></i> Bookings & Revenue by Destination</h5>
              <div style={{ minHeight: '320px' }}>
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: false }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h5 className="fw-bold mb-4 text-dark"><i className="bi bi-pie-chart text-success me-2"></i> Booking Status Distribution</h5>
              <div style={{ minHeight: '260px' }} className="d-flex align-items-center justify-content-center">
                <Doughnut
                  data={doughnutChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-header bg-white p-4">
            <h5 className="fw-bold mb-0 text-dark"><i className="bi bi-people text-primary me-2"></i> User Directory</h5>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Registered At</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-bold">#{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || 'N/A'}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-primary'} px-3 py-1 rounded-pill`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="small text-muted">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
