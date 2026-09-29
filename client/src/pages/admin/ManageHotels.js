import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hotelsAPI, destinationsAPI } from '../../services/api';

export default function ManageHotels() {
  const [hotels, setHotels] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [hotelToDelete, setHotelToDelete] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    destination_id: '',
    name: '',
    rating: 4.5,
    price_per_night: 200,
    amenities: 'Free WiFi, Spa, Breakfast',
    image_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const htls = await hotelsAPI.getAll();
      const dests = await destinationsAPI.getAll();
      setHotels(htls);
      setDestinations(dests);
      if (dests.length > 0 && !formData.destination_id) {
        setFormData(prev => ({ ...prev, destination_id: dests[0].id }));
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: err.message || 'Failed to fetch hotels.' });
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAddModal = () => {
    setEditingHotel(null);
    setFeedback({ type: '', text: '' });
    setFormData({
      destination_id: destinations.length > 0 ? destinations[0].id : '',
      name: '',
      rating: 4.5,
      price_per_night: 200,
      amenities: 'Free WiFi, Spa, Breakfast',
      image_url: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (hotel) => {
    setEditingHotel(hotel);
    setFeedback({ type: '', text: '' });
    setFormData({
      destination_id: hotel.destination_id,
      name: hotel.name,
      rating: hotel.rating,
      price_per_night: hotel.price_per_night,
      amenities: hotel.amenities || '',
      image_url: hotel.image_url || ''
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!hotelToDelete) return;
    try {
      await hotelsAPI.delete(hotelToDelete.id);
      setFeedback({ type: 'success', text: `Hotel "${hotelToDelete.name}" deleted successfully.` });
      setHotelToDelete(null);
      loadData();
    } catch (err) {
      setFeedback({ type: 'danger', text: err.message || 'Failed to delete hotel.' });
      setHotelToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.destination_id || !formData.name.trim()) {
      setFeedback({ type: 'danger', text: 'Destination and Hotel Name are required.' });
      return;
    }
    const ratingNum = Number(formData.rating);
    if (ratingNum < 1 || ratingNum > 5) {
      setFeedback({ type: 'danger', text: 'Hotel rating must be between 1.0 and 5.0.' });
      return;
    }
    if (Number(formData.price_per_night) <= 0) {
      setFeedback({ type: 'danger', text: 'Price per night must be a positive number.' });
      return;
    }

    setSaving(true);
    try {
      if (editingHotel) {
        await hotelsAPI.update(editingHotel.id, formData);
        setFeedback({ type: 'success', text: 'Hotel updated successfully!' });
      } else {
        await hotelsAPI.create(formData);
        setFeedback({ type: 'success', text: 'New hotel created successfully!' });
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setFeedback({ type: 'danger', text: err.message || 'Error saving hotel.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link to="/admin/dashboard" className="text-decoration-none small text-muted">
            <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
          </Link>
          <h2 className="fw-bold mb-0 text-dark">Manage Hotels (CRUD)</h2>
        </div>
        <button className="btn btn-primary rounded-pill fw-bold px-4" onClick={handleOpenAddModal}>
          + Add New Hotel
        </button>
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
            <span className="visually-hidden">Loading hotels...</span>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Hotel Name</th>
                  <th>Destination</th>
                  <th>Rating</th>
                  <th>Nightly Price</th>
                  <th>Amenities</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((h) => (
                  <tr key={h.id}>
                    <td className="fw-bold">{h.name}</td>
                    <td>{h.destination_name}</td>
                    <td><span className="badge bg-warning text-dark">★ {h.rating}</span></td>
                    <td className="fw-bold text-primary">${h.price_per_night}</td>
                    <td className="small text-muted">{h.amenities}</td>
                    <td className="text-end">
                      <button className="btn btn-outline-primary btn-sm rounded-pill me-2" onClick={() => handleOpenEditModal(h)}>
                        <i className="bi bi-pencil me-1"></i> Edit
                      </button>
                      <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={() => setHotelToDelete(h)}>
                        <i className="bi bi-trash me-1"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Destination</label>
                    <select
                      className="form-select"
                      value={formData.destination_id}
                      onChange={(e) => setFormData({ ...formData, destination_id: e.target.value })}
                      required
                    >
                      {destinations.map(d => (
                        <option key={d.id} value={d.id}>{d.name}, {d.country}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Hotel Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Star Rating (1-5)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        className="form-control"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Price Per Night ($)</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={formData.price_per_night}
                        onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Amenities</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.amenities}
                      onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Image URL</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowModal(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Hotel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {hotelToDelete && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> Delete Hotel
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setHotelToDelete(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="mb-1">Are you sure you want to delete the hotel <strong>"{hotelToDelete.name}"</strong>?</p>
                <p className="small text-muted mb-0">This hotel will no longer be available for customer bookings.</p>
              </div>
              <div className="modal-footer border-0 p-3 bg-light">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setHotelToDelete(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger rounded-pill px-4 fw-bold" onClick={confirmDelete}>
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
