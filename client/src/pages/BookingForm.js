import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { destinationsAPI, packagesAPI, hotelsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BookingForm() {
  const [searchParams] = useSearchParams();
  const initialDestId = searchParams.get('destination_id') || '';
  const initialPkgId = searchParams.get('package_id') || '';

  const { user } = useAuth();
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [hotels, setHotels] = useState([]);

  const [selectedDestId, setSelectedDestId] = useState(initialDestId);
  const [selectedPkgId, setSelectedPkgId] = useState(initialPkgId);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextWeekStr);
  const [numTravelers, setNumTravelers] = useState(2);
  const [numRooms, setNumRooms] = useState(1);

  // Simulated Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState(user ? user.name : 'JOHN DOE');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const dests = await destinationsAPI.getAll();
        setDestinations(dests);

        let targetDestId = initialDestId;
        if (!targetDestId && initialPkgId) {
          try {
            const pkgDetail = await packagesAPI.getById(initialPkgId);
            if (pkgDetail && pkgDetail.destination_id) {
              targetDestId = pkgDetail.destination_id.toString();
            }
          } catch (e) {
            // fallback
          }
        }

        if (!targetDestId && dests.length > 0) {
          targetDestId = dests[0].id.toString();
        }

        if (targetDestId) {
          setSelectedDestId(targetDestId);
        }
      } catch (err) {
        setError('Failed to initialize booking options.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialDestId, initialPkgId]);

  // When selected destination changes, load corresponding packages & hotels
  useEffect(() => {
    if (!selectedDestId) return;

    async function loadDestOptions() {
      try {
        const pkgs = await packagesAPI.getAll(selectedDestId);
        const htls = await hotelsAPI.getAll(selectedDestId);
        setPackages(pkgs);
        setHotels(htls);

        if (pkgs.length > 0) {
          const matchPkg = pkgs.find(p => p.id.toString() === initialPkgId);
          setSelectedPkgId(matchPkg ? matchPkg.id.toString() : pkgs[0].id.toString());
        } else {
          setSelectedPkgId('');
        }

        if (htls.length > 0) {
          setSelectedHotelId(htls[0].id.toString());
        } else {
          setSelectedHotelId('');
        }
      } catch (err) {
        console.error('Error fetching package/hotel options:', err);
      }
    }
    loadDestOptions();
  }, [selectedDestId, initialPkgId]);

  const activePackage = useMemo(() => {
    return packages.find(p => p.id.toString() === selectedPkgId) || null;
  }, [packages, selectedPkgId]);

  const activeHotel = useMemo(() => {
    return hotels.find(h => h.id.toString() === selectedHotelId) || null;
  }, [hotels, selectedHotelId]);

  // Price Calculation formula
  const priceBreakdown = useMemo(() => {
    if (!activePackage || !activeHotel || !startDate || !endDate) {
      return { packageTotal: 0, hotelTotal: 0, numNights: 1, grandTotal: 0 };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const numNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const pkgPrice = parseFloat(activePackage.price_per_person || 0);
    const htlPrice = parseFloat(activeHotel.price_per_night || 0);

    const packageTotal = pkgPrice * parseInt(numTravelers || 1);
    const hotelTotal = htlPrice * parseInt(numRooms || 1) * numNights;
    const grandTotal = packageTotal + hotelTotal;

    return { packageTotal, hotelTotal, numNights, grandTotal };
  }, [activePackage, activeHotel, startDate, endDate, numTravelers, numRooms]);

  const handleOpenPaymentModal = (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate('/login?redirect=/book');
      return;
    }

    // Validations
    if (!selectedDestId || !selectedPkgId || !selectedHotelId) {
      setError('Please select a valid destination, package, and hotel.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setError('Travel start date cannot be in the past.');
      return;
    }

    if (end <= start) {
      setError('Return date must be after travel start date.');
      return;
    }

    if (parseInt(numTravelers) < 1) {
      setError('Number of travelers must be at least 1.');
      return;
    }

    if (parseInt(numRooms) < 1) {
      setError('Number of rooms must be at least 1.');
      return;
    }

    if (activePackage && numTravelers > activePackage.max_travelers) {
      setError(`Number of travelers exceeds maximum limit for this package (${activePackage.max_travelers} max).`);
      return;
    }

    setShowPaymentModal(true);
  };

  const handleConfirmBookingAndPay = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        destination_id: parseInt(selectedDestId),
        package_id: parseInt(selectedPkgId),
        hotel_id: parseInt(selectedHotelId),
        start_date: startDate,
        end_date: endDate,
        num_travelers: parseInt(numTravelers),
        num_rooms: parseInt(numRooms)
      };

      const result = await bookingsAPI.create(payload);
      setShowPaymentModal(false);
      navigate(`/booking-confirmation/${result.booking_id}`);
    } catch (err) {
      setError(err.message || 'Failed to complete booking process.');
      setShowPaymentModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading booking options...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="card-header bg-primary text-white p-4">
              <h3 className="fw-bold mb-1"><i className="bi bi-journal-plus me-2"></i> Book Your Vacation</h3>
              <p className="mb-0 text-white-80">Select dates, hotel options, and calculate live trip costs.</p>
            </div>
            
            <div className="card-body p-4 p-md-5">
              {error && (
                <div className="alert alert-danger rounded-3 mb-4" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
                </div>
              )}

              <form onSubmit={handleOpenPaymentModal}>
                <div className="row g-4 mb-4">
                  {/* Step 1: Select Destination */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold"><i className="bi bi-geo-alt text-primary me-1"></i> 1. Destination</label>
                    <select
                      className="form-select form-select-lg rounded-3"
                      value={selectedDestId}
                      onChange={(e) => setSelectedDestId(e.target.value)}
                      required
                    >
                      {destinations.map(d => (
                        <option key={d.id} value={d.id}>{d.name}, {d.country}</option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: Select Package */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold"><i className="bi bi-box-seam text-primary me-1"></i> 2. Travel Package</label>
                    <select
                      className="form-select form-select-lg rounded-3"
                      value={selectedPkgId}
                      onChange={(e) => setSelectedPkgId(e.target.value)}
                      required
                    >
                      {packages.map(p => (
                        <option key={p.id} value={p.id}>{p.title} (${p.price_per_person}/person)</option>
                      ))}
                    </select>
                  </div>

                  {/* Step 3: Select Dates */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold"><i className="bi bi-calendar-event text-primary me-1"></i> Start Date</label>
                    <input
                      type="date"
                      className="form-control form-control-lg rounded-3"
                      value={startDate}
                      min={todayStr}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-bold"><i className="bi bi-calendar-check text-primary me-1"></i> Return Date</label>
                    <input
                      type="date"
                      className="form-control form-control-lg rounded-3"
                      value={endDate}
                      min={startDate || todayStr}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>

                  {/* Step 4: Select Hotel */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold"><i className="bi bi-building text-primary me-1"></i> 3. Select Hotel Partner</label>
                    <select
                      className="form-select form-select-lg rounded-3"
                      value={selectedHotelId}
                      onChange={(e) => setSelectedHotelId(e.target.value)}
                      required
                    >
                      {hotels.map(h => (
                        <option key={h.id} value={h.id}>{h.name} (${h.price_per_night}/night - ★{h.rating})</option>
                      ))}
                    </select>
                  </div>

                  {/* Step 5: Travelers & Rooms */}
                  <div className="col-md-3 col-6">
                    <label className="form-label fw-bold"><i className="bi bi-people text-primary me-1"></i> Travelers</label>
                    <input
                      type="number"
                      className="form-control form-control-lg rounded-3"
                      min="1"
                      max={activePackage ? activePackage.max_travelers : 10}
                      value={numTravelers}
                      onChange={(e) => setNumTravelers(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-3 col-6">
                    <label className="form-label fw-bold"><i className="bi bi-door-open text-primary me-1"></i> Rooms</label>
                    <input
                      type="number"
                      className="form-control form-control-lg rounded-3"
                      min="1"
                      max="5"
                      value={numRooms}
                      onChange={(e) => setNumRooms(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Price Breakdown Calculation Card */}
                <div className="card bg-light border-0 rounded-4 p-4 mb-4">
                  <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-calculator text-success me-2"></i> Price Breakdown Summary</h5>
                  <div className="row g-2 small mb-3">
                    <div className="col-8 text-muted">Package: {activePackage?.title} (${activePackage?.price_per_person} × {numTravelers} travelers)</div>
                    <div className="col-4 text-end fw-bold">${priceBreakdown.packageTotal.toFixed(2)}</div>
                    <div className="col-8 text-muted">Hotel: {activeHotel?.name} (${activeHotel?.price_per_night} × {numRooms} rooms × {priceBreakdown.numNights} nights)</div>
                    <div className="col-4 text-end fw-bold">${priceBreakdown.hotelTotal.toFixed(2)}</div>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between align-items-center pt-2">
                    <span className="fw-bold fs-5 text-dark">Grand Total Price:</span>
                    <h3 className="fw-extrabold text-success mb-0">${priceBreakdown.grandTotal.toFixed(2)}</h3>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <Link to="/packages" className="btn btn-outline-secondary rounded-pill px-4">
                    Back to Packages
                  </Link>
                  <button type="submit" className="btn btn-warning text-dark fw-bold rounded-pill px-5 btn-lg shadow-sm">
                    Proceed to Payment Simulation <i className="bi bi-credit-card ms-1"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Payment Modal */}
      {showPaymentModal && (
        <div className="modal show d-block bg-dark bg-opacity-50 tab-index-modal" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-primary text-white border-0 py-3">
                <h5 className="modal-title fw-bold"><i className="bi bi-shield-lock me-2"></i> Simulated Payment Step</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPaymentModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="alert alert-info small rounded-3 mb-3">
                  <i className="bi bi-info-circle-fill me-1"></i> <strong>Demo Payment Simulation:</strong> No actual financial transaction will take place. This simulates real-time booking confirmation.
                </div>
                <div className="card bg-dark text-white rounded-3 p-3 mb-3 shadow">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className="fw-bold text-warning fs-5">TravelEase Pay</span>
                    <i className="bi bi-credit-card-2-front fs-3"></i>
                  </div>
                  <div className="fs-5 tracking-widest font-monospace mb-3">{cardNumber}</div>
                  <div className="d-flex justify-content-between small text-white-50">
                    <div>
                      <div>CARDHOLDER</div>
                      <div className="fw-bold text-white text-uppercase">{cardHolder}</div>
                    </div>
                    <div>
                      <div>EXPIRES</div>
                      <div className="fw-bold text-white">{cardExpiry}</div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Card Number</label>
                  <input type="text" className="form-control" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold">Expiry Date</label>
                    <input type="text" className="form-control" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">CVV Code</label>
                    <input type="password" className="form-control" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} maxLength="4" />
                  </div>
                </div>

                <div className="text-center border-top pt-3">
                  <span className="text-muted small">Amount to Pay:</span>
                  <h3 className="fw-bold text-success">${priceBreakdown.grandTotal.toFixed(2)}</h3>
                </div>
              </div>
              <div className="modal-footer border-0 p-3 bg-light">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success rounded-pill px-5 fw-bold"
                  onClick={handleConfirmBookingAndPay}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Processing...
                    </>
                  ) : (
                    'Confirm & Pay Now'
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
