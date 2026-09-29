import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { packagesAPI, destinationsAPI } from '../../services/api';

export default function ManagePackages() {
  const [packages, setPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgToDelete, setPkgToDelete] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    destination_id: '',
    title: '',
    description: '',
    duration_days: 5,
    price_per_person: 1000,
    max_travelers: 10,
    inclusions: 'Guided Tours, Meals, Hotel',
    image_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const pkgs = await packagesAPI.getAll();
      const dests = await destinationsAPI.getAll();
      setPackages(pkgs);
      setDestinations(dests);
      if (dests.length > 0 && !formData.destination_id) {
        setFormData(prev => ({ ...prev, destination_id: dests[0].id }));
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: err.message || 'Failed to fetch packages.' });
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAddModal = () => {
    setEditingPkg(null);
    setFeedback({ type: '', text: '' });
    setFormData({
      destination_id: destinations.length > 0 ? destinations[0].id : '',
      title: '',
      description: '',
      duration_days: 5,
      price_per_person: 1000,
      max_travelers: 10,
      inclusions: 'Guided Tours, Meals, Hotel',
      image_url: ''
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (pkg) => {
    setEditingPkg(pkg);
    setFeedback({ type: '', text: '' });
    setFormData({
      destination_id: pkg.destination_id,
      title: pkg.title,
      description: pkg.description || '',
      duration_days: pkg.duration_days,
      price_per_person: pkg.price_per_person,
      max_travelers: pkg.max_travelers || 10,
      inclusions: pkg.inclusions || '',
      image_url: pkg.image_url || ''
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!pkgToDelete) return;
    try {
      await packagesAPI.delete(pkgToDelete.id);
      setFeedback({ type: 'success', text: `Package "${pkgToDelete.title}" deleted successfully.` });
      setPkgToDelete(null);
      loadData();
    } catch (err) {
      setFeedback({ type: 'danger', text: err.message || 'Failed to delete package.' });
      setPkgToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.destination_id || !formData.title.trim()) {
      setFeedback({ type: 'danger', text: 'Destination and Package Title are required.' });
      return;
    }
    if (Number(formData.duration_days) <= 0 || Number(formData.price_per_person) <= 0 || Number(formData.max_travelers) <= 0) {
      setFeedback({ type: 'danger', text: 'Duration, Price per Person, and Max Travelers must be positive numbers.' });
      return;
    }

    setSaving(true);
    try {
      if (editingPkg) {
        await packagesAPI.update(editingPkg.id, formData);
        setFeedback({ type: 'success', text: 'Package updated successfully!' });
      } else {
        await packagesAPI.create(formData);
        setFeedback({ type: 'success', text: 'New package created successfully!' });
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      setFeedback({ type: 'danger', text: err.message || 'Error saving package.' });
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
          <h2 className="fw-bold mb-0 text-dark">Manage Travel Packages (CRUD)</h2>
        </div>
        <button className="btn btn-primary rounded-pill fw-bold px-4" onClick={handleOpenAddModal}>
          + Add New Package
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
            <span className="visually-hidden">Loading packages...</span>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Destination</th>
                  <th>Duration</th>
                  <th>Price/Person</th>
                  <th>Max Limit</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-bold">{p.title}</td>
                    <td>{p.destination_name}</td>
                    <td>{p.duration_days} Days</td>
                    <td className="fw-bold text-success">${p.price_per_person}</td>
                    <td>{p.max_travelers} Persons</td>
                    <td className="text-end">
                      <button className="btn btn-outline-primary btn-sm rounded-pill me-2" onClick={() => handleOpenEditModal(p)}>
                        <i className="bi bi-pencil me-1"></i> Edit
                      </button>
                      <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={() => setPkgToDelete(p)}>
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
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  {editingPkg ? 'Edit Package' : 'Add New Package'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
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

                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Package Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">Description</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Duration (Days)</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={formData.duration_days}
                        onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Price Per Person ($)</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={formData.price_per_person}
                        onChange={(e) => setFormData({ ...formData, price_per_person: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Max Travelers Limit</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={formData.max_travelers}
                        onChange={(e) => setFormData({ ...formData, max_travelers: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">Inclusions</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Flights, Breakfast, Guided Tours..."
                        value={formData.inclusions}
                        onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold">Image URL</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowModal(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Package'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {pkgToDelete && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> Delete Package
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setPkgToDelete(null)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="mb-1">Are you sure you want to delete the package <strong>"{pkgToDelete.title}"</strong>?</p>
                <p className="small text-muted mb-0">This package will no longer be available for customer bookings.</p>
              </div>
              <div className="modal-footer border-0 p-3 bg-light">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setPkgToDelete(null)}>
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
