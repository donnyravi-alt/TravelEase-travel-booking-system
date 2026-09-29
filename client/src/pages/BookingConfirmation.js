import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsAPI } from '../services/api';

export default function BookingConfirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadBooking() {
      try {
        const data = await bookingsAPI.getById(id);
        setBooking(data);
      } catch (err) {
        setError(err.message || 'Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Generating receipt...</span>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger rounded-4 text-center py-4 shadow-sm">
          <h4>Receipt Error</h4>
          <p>{error || 'Could not locate the requested booking confirmation.'}</p>
          <Link to="/my-bookings" className="btn btn-primary rounded-pill px-4 mt-2">
            View My Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Success Banner */}
          <div className="alert alert-success rounded-4 border-0 p-4 mb-4 text-center shadow-sm">
            <i className="bi bi-check-circle-fill display-3 text-success d-block mb-2"></i>
            <h2 className="fw-bold">Booking Successfully Confirmed!</h2>
            <p className="mb-0">Thank you for choosing TravelEase. Your itinerary has been reserved in our system.</p>
          </div>

          {/* Printable Ticket Receipt Card */}
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4 print-container">
            <div className="card-header bg-primary text-white p-4 d-flex justify-content-between align-items-center">
              <div>
                <h4 className="fw-bold mb-0"><i className="bi bi-compass-fill text-warning me-2"></i> TravelEase Travel Voucher</h4>
                <span className="text-white-70 small">Official E-Ticket Confirmation &bull; Booking #{booking.id}</span>
              </div>
              <div className="text-end">
                <span className="badge bg-warning text-dark fs-6 px-3 py-2 rounded-pill font-monospace">
                  {booking.booking_code}
                </span>
              </div>
            </div>

            <div className="card-body p-4 p-md-5">
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <span className="text-muted small d-block">Traveler Name</span>
                  <strong className="fs-5 text-dark">{booking.user_name}</strong>
                  <div className="small text-muted">{booking.user_email}</div>
                  <div className="small text-muted mt-1"><i className="bi bi-hash text-primary"></i> <strong>Booking ID:</strong> #{booking.id}</div>
                </div>
                <div className="col-md-6 text-md-end">
                  <span className="text-muted small d-block">Booking Status</span>
                  <span className={`badge ${booking.status === 'Confirmed' ? 'bg-success' : 'bg-danger'} px-3 py-2 rounded-pill fs-6 mb-1`}>
                    {booking.status}
                  </span>
                  <div className="small text-muted">
                    Payment: <span className="badge bg-light text-success border border-success">{booking.payment_status || 'Paid'} (Demo Simulated)</span>
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              {/* Trip Details */}
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <h5 className="fw-bold text-primary mb-3"><i className="bi bi-geo-alt me-2"></i> Destination & Package</h5>
                  <p className="mb-1"><strong>Destination:</strong> {booking.destination_name}, {booking.country}</p>
                  <p className="mb-1"><strong>Package:</strong> {booking.package_title}</p>
                  <p className="mb-1"><strong>Travelers:</strong> {booking.num_travelers} Person(s)</p>
                </div>
                <div className="col-md-6">
                  <h5 className="fw-bold text-primary mb-3"><i className="bi bi-building me-2"></i> Accommodation & Dates</h5>
                  <p className="mb-1"><strong>Hotel:</strong> {booking.hotel_name}</p>
                  <p className="mb-1"><strong>Rooms:</strong> {booking.num_rooms} Room(s)</p>
                  <p className="mb-1"><strong>Duration:</strong> {booking.num_nights || Math.max(1, Math.round(Math.abs(new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24)))} Night(s)</p>
                  <p className="mb-1"><strong>Travel Dates:</strong> {new Date(booking.start_date).toLocaleDateString()} to {new Date(booking.end_date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-light rounded-4 p-4 mb-4 border">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="fw-bold mb-0 text-dark">Total Amount</h5>
                    <span className="text-muted small">All taxes & fees included &bull; Demo Simulation</span>
                  </div>
                  <h2 className="fw-extrabold text-success mb-0">${parseFloat(booking.total_price).toFixed(2)}</h2>
                </div>
              </div>

              <div className="text-muted small border-top pt-3 text-center">
                Please present this booking code <strong>{booking.booking_code}</strong> at check-in. For assistance, contact support@travelease.com.
              </div>
            </div>
          </div>

          {/* Navigation to My Bookings, Home, Destinations & Print */}
          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
            <div className="d-flex flex-wrap gap-2">
              <Link to="/my-bookings" className="btn btn-primary rounded-pill px-4 fw-bold">
                <i className="bi bi-journal-check me-2"></i> My Bookings
              </Link>
              <Link to="/destinations" className="btn btn-outline-primary rounded-pill px-4 fw-bold">
                <i className="bi bi-geo-alt me-2"></i> Destinations
              </Link>
              <Link to="/" className="btn btn-outline-secondary rounded-pill px-4 fw-bold">
                <i className="bi bi-house me-2"></i> Home
              </Link>
            </div>
            <button className="btn btn-secondary rounded-pill px-4 fw-bold" onClick={() => window.print()}>
              <i className="bi bi-printer me-2"></i> Print Voucher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
