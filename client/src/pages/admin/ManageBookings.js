import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, bookingsAPI } from '../../services/api';

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);
    try {
      const data = await adminAPI.getAllBookings();
      setBookings(data);
    } catch (err) {
      setFeedback({ type: 'danger', text: err.message || 'Failed to fetch admin bookings.' });
    } finally {
      setLoading(false);
    }
  }

  const confirmCancel = async () => {
    if (!bookingToCancel) return;
    setCancelling(true);
    try {
      await bookingsAPI.cancel(bookingToCancel.id);
      setFeedback({ type: 'success', text: `Booking #${bookingToCancel.booking_code} cancelled successfully.` });
      setBookingToCancel(null);
      loadBookings();
    } catch (err) {
      setFeedback({ type: 'danger', text: err.message || 'Failed to cancel booking.' });
      setBookingToCancel(null);
    } finally {
      setCancelling(false);
    }
  };

  const filteredBookings = statusFilter === 'All'
    ? bookings
    : bookings.filter(b => b.status === statusFilter);

  return (
    <div className="container-fluid py-4 px-md-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <Link to="/admin/dashboard" className="text-decoration-none small text-muted">
            <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
          </Link>
          <h2 className="fw-bold mb-0 text-dark">Customer Travel Bookings</h2>
        </div>
        <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
          <label className="small fw-bold text-muted me-1">Filter Status:</label>
          <select
            className="form-select rounded-pill px-3 shadow-sm"
            style={{ width: '160px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {feedback.text && (
        <div className={`alert alert-${feedback.type} alert-dismissible fade show rounded-4 mb-4`} role="alert">
          <i className={`bi ${feedback.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} me-2`}></i>
          {feedback.text}
          <button type="button" className="btn-close" onClick={() => setFeedback({ type: '', text: '' })}></button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading all bookings...</span>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Code</th>
                  <th>Customer</th>
                  <th>Destination & Package</th>
                  <th>Hotel</th>
                  <th>Dates</th>
                  <th>Travelers</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="fw-bold font-monospace text-primary">{b.booking_code}</td>
                      <td>
                        <div className="fw-bold">{b.user_name}</div>
                        <div className="small text-muted">{b.user_email}</div>
                      </td>
                      <td>
                        <div className="fw-bold">{b.destination_name}</div>
                        <div className="small text-muted">{b.package_title}</div>
                      </td>
                      <td>{b.hotel_name}</td>
                      <td className="small">
                        {new Date(b.start_date).toLocaleDateString()} to {new Date(b.end_date).toLocaleDateString()}
                      </td>
                      <td>{b.num_travelers} pax ({b.num_rooms} rms)</td>
                      <td className="fw-bold text-success">${parseFloat(b.total_price).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${b.status === 'Confirmed' ? 'bg-success' : 'bg-danger'} px-3 py-1 rounded-pill`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="text-end">
                        {b.status === 'Confirmed' && (
                          <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={() => setBookingToCancel(b)}>
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {bookingToCancel && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> Cancel Customer Booking
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setBookingToCancel(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="mb-2">Are you sure you want to cancel booking <strong>#{bookingToCancel.booking_code}</strong>?</p>
                <div className="bg-light p-3 rounded-3 small">
                  <div><strong>Customer:</strong> {bookingToCancel.user_name} ({bookingToCancel.user_email})</div>
                  <div><strong>Package:</strong> {bookingToCancel.package_title}</div>
                  <div><strong>Total Amount:</strong> ${parseFloat(bookingToCancel.total_price).toFixed(2)}</div>
                </div>
              </div>
              <div className="modal-footer border-0 p-3 bg-light">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setBookingToCancel(null)} disabled={cancelling}>
                  Keep Active
                </button>
                <button type="button" className="btn btn-danger rounded-pill px-4 fw-bold" onClick={confirmCancel} disabled={cancelling}>
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
