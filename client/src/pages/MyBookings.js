import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../services/api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    loadMyBookings();
  }, []);

  async function loadMyBookings() {
    setLoading(true);
    try {
      const data = await bookingsAPI.getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;

    setCancellingId(bookingToCancel.id);
    setError('');
    setSuccessMsg('');
    try {
      const res = await bookingsAPI.cancel(bookingToCancel.id);
      setSuccessMsg(res.message || 'Booking cancelled successfully.');
      setBookingToCancel(null);
      // Update local state immediately
      setBookings(prev => prev.map(b => b.id === bookingToCancel.id ? { ...b, status: 'Cancelled' } : b));
    } catch (err) {
      setError(err.message || 'Failed to cancel booking.');
      setBookingToCancel(null);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Travel Bookings</h2>
          <p className="text-muted mb-0">View your active itineraries, receipts, or cancel upcoming trips.</p>
        </div>
        <Link to="/packages" className="btn btn-warning text-dark fw-bold rounded-pill px-4">
          + Book New Trip
        </Link>
      </div>

      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show rounded-4 mb-4" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i> {successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show rounded-4 mb-4" role="alert">
          <i className="bi bi-exclamation-circle-fill me-2"></i> {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading bookings...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger rounded-4">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="alert alert-info rounded-4 text-center py-5 shadow-sm">
          <i className="bi bi-ticket-perforated display-3 text-muted mb-3 d-block"></i>
          <h4>No Active Bookings Found</h4>
          <p className="text-muted mb-3">You haven't booked any travel packages yet.</p>
          <Link to="/destinations" className="btn btn-primary rounded-pill px-4 fw-bold">
            Explore Destinations
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="col-12">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="row g-0">
                  <div className="col-md-4 position-relative">
                    <img
                      src={booking.destination_image || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80'}
                      className="img-fluid h-100 object-fit-cover w-100"
                      alt={booking.destination_name}
                      style={{ minHeight: '220px' }}
                    />
                    <span className="badge bg-dark text-white position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill font-monospace">
                      {booking.booking_code}
                    </span>
                  </div>
                  <div className="col-md-8">
                    <div className="card-body p-4 d-flex flex-column h-100">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <span className="text-primary fw-bold small text-uppercase">{booking.country}</span>
                          <h4 className="fw-bold text-dark mb-0">{booking.package_title}</h4>
                        </div>
                        <span className={`badge ${booking.status === 'Confirmed' ? 'bg-success' : 'bg-danger'} px-3 py-2 rounded-pill fs-7`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="row g-2 text-muted small mb-3">
                        <div className="col-sm-6">
                          <i className="bi bi-geo-alt me-1 text-danger"></i> Destination: <strong>{booking.destination_name}</strong>
                        </div>
                        <div className="col-sm-6">
                          <i className="bi bi-building me-1 text-primary"></i> Hotel: <strong>{booking.hotel_name}</strong>
                        </div>
                        <div className="col-sm-6">
                          <i className="bi bi-calendar-range me-1 text-warning"></i> Dates: {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                        </div>
                        <div className="col-sm-6">
                          <i className="bi bi-people me-1 text-success"></i> {booking.num_travelers} Travelers ({booking.num_rooms} Rooms)
                        </div>
                      </div>

                      <div className="mt-auto border-top pt-3 d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fs-7 text-muted">Total Booking Price</span>
                          <h4 className="fw-bold text-success mb-0">${parseFloat(booking.total_price).toFixed(2)}</h4>
                        </div>
                        <div className="d-flex gap-2">
                          <Link to={`/booking-confirmation/${booking.id}`} className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold">
                            <i className="bi bi-file-earmark-text me-1"></i> Receipt
                          </Link>
                          {booking.status === 'Confirmed' && (
                            <button
                              className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold"
                              onClick={() => setBookingToCancel(booking)}
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {bookingToCancel && (
        <div className="modal show d-block bg-dark bg-opacity-50 tab-index-modal" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-danger text-white border-0 py-3">
                <h5 className="modal-title fw-bold"><i className="bi bi-exclamation-octagon me-2"></i> Confirm Cancellation</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setBookingToCancel(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="mb-2">Are you sure you want to cancel this booking?</p>
                <div className="bg-light p-3 rounded-3 small text-muted mb-3">
                  <div><strong>Booking Code:</strong> {bookingToCancel.booking_code}</div>
                  <div><strong>Destination:</strong> {bookingToCancel.destination_name}</div>
                  <div><strong>Package:</strong> {bookingToCancel.package_title}</div>
                  <div><strong>Dates:</strong> {new Date(bookingToCancel.start_date).toLocaleDateString()} - {new Date(bookingToCancel.end_date).toLocaleDateString()}</div>
                </div>
                <p className="text-muted small mb-0">
                  <i className="bi bi-info-circle me-1"></i> Your booking history record will remain saved as "Cancelled".
                </p>
              </div>
              <div className="modal-footer border-0 p-3 bg-light">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setBookingToCancel(null)}>
                  Keep Booking
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4 fw-bold"
                  onClick={handleConfirmCancel}
                  disabled={cancellingId === bookingToCancel.id}
                >
                  {cancellingId === bookingToCancel.id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel Booking'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
