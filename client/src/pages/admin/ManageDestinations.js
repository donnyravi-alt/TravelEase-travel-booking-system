import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { destinationsAPI } from '../../services/api';

export default function ManageDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDest, setEditingDest] = useState(null);
  const [destToDelete, setDestToDelete] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    description: '',
    image_url: '',
    featured: false,
    price_starting: 1000
  });

  useEffect(() => {
    loadDestinations();
  }, []);

  async function loadDestinations() {
    setLoading(true);
    try {
      const data = await destinationsAPI.getAll();
      setDestinations(data);
    } catch (err) {
      setFeedback({ type: 'danger', text: err.message || 'Failed to fetch destinations.' });
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAddModal = () => {
    setEditingDest(null);
    setFeedback({ type: '', text: '' });
    setFormData({
      name: '',
      country: '',
      description: '',
      image_url: '',
      featured: false,
      price_starting: 1000
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (dest) => {
    setEditingDest(dest);
    setFeedback({ type: '', text: '' });
    setFormData({
      name: dest.name,
      country: dest.country,
      description: dest.description || '',
      image_url: dest.image_url || '',
      featured: Boolean(dest.featured),
      price_starting: dest.price_starting
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!destToDelete) return;
    try {
      await destinationsAPI.delete(destToDelete.id);
      setFeedback({ type: 'success', text: `Destination "${destToDelete.name}" deleted successfully.` });
      setDestToDelete(null);
      loadDestinations();
    } catch (err) {
      setFeedback({ type: 'danger', text: err.message || 'Failed to delete destination.' });
      setDestToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.country.trim()) {
      setFeedback({ type: 'danger', text: 'Name and Country are required.' });
      return;
    }
    if (Number(formData.price_starting) < 0) {
      setFeedback({ type: 'danger', text: 'Starting price must be non-negative.' });
      return;
    }

    setSaving(true);
    try {
      if (editingDest) {
        await destinationsAPI.update(editingDest.id, formData);
        setFeedback({ type: 'success', text: 'Destination updated successfully!' });
      } else {
        await destinationsAPI.create(formData);
        setFeedback({ type: 'success', text: 'New destination created successfully!' });
      }
      setShowModal(false);
      loadDestinations();
    } catch (err) {
      setFeedback({ type: 'danger', text: err.message || 'Error saving destination.' });
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
          <h2 className="fw-bold mb-0 text-dark">Manage Destinations (CRUD)</h2>
        </div>
        <button className="btn btn-primary rounded-pill fw-bold px-4" onClick={handleOpenAddModal}>
          + Add New Destination
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
            <span className="visually-hidden">Loading destinations...</span>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Country</th>
                  <th>Starting Price</th>
                  <th>Featured</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {destinations.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <img
                        src={d.image_url || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=100&q=80'}
                        alt={d.name}
                        className="rounded-3 object-fit-cover"
                        style={{ width: '60px', height: '40px' }}
                      />
                    </td>
                    <td className="fw-bold">{d.name}</td>
                    <td>{d.country}</td>
                    <td className="fw-bold text-success">${d.price_starting}</td>
                    <td>
                      {d.featured ? (
                        <span className="badge bg-warning text-dark">Yes</span>
                      ) : (
                        <span className="badge bg-light text-muted border">No</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button className="btn btn-outline-primary btn-sm rounded-pill me-2" onClick={() => handleOpenEditModal(d)}>
                        <i className="bi bi-pencil me-1"></i> Edit
                      </button>
                      <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={() => setDestToDelete(d)}>
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
                  {editingDest ? 'Edit Destination' : 'Add New Destination'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Destination Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Country</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Image URL</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Starting Price ($)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={formData.price_starting}
                        onChange={(e) => setFormData({ ...formData, price_starting: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6 d-flex align-items-center pt-4">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="featuredCheck"
                          checked={formData.featured}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        />
                        <label className="form-check-label small fw-bold" htmlFor="featuredCheck">
                          Feature on Homepage
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowModal(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Destination'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {destToDelete && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> Delete Destination
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setDestToDelete(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="mb-1">Are you sure you want to delete the destination <strong>"{destToDelete.name}"</strong>?</p>
                <p className="small text-muted mb-0">This action will remove the destination and associated packages/hotels.</p>
              </div>
              <div className="modal-footer border-0 p-3 bg-light">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setDestToDelete(null)}>
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
