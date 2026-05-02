import React, { useEffect, useState } from "react";
import {
  addAddressApi,
  deleteAddressApi,
  getMyAddressesApi,
  setDefaultAddressApi,
  updateAddressApi,
} from "../services/authService";
import "./Address.css";
const initialForm = {
  fullName: "",
  mobile: "",
  pincode: "",
  state: "",
  city: "",
  houseNo: "",
  area: "",
  landmark: "",
  addressType: "Home",
  isDefault: false,
};

const Address = () => {
  const [form, setForm] = useState(initialForm);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getMyAddressesApi();
      setAddresses(res?.data?.data || []);
    } catch (err) {
      console.error("Fetch addresses error:", err);
      setError(err?.response?.data?.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      if (editingId) {
        const res = await updateAddressApi(editingId, form);
        setMessage(res?.data?.message || "Address updated successfully");
      } else {
        const res = await addAddressApi(form);
        setMessage(res?.data?.message || "Address added successfully");
      }

      resetForm();
      fetchAddresses();
    } catch (err) {
      console.error("Save address error:", err);
      setError(err?.response?.data?.message || "Failed to save address");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (address) => {
    setEditingId(address._id);
    setForm({
      fullName: address.fullName || "",
      mobile: address.mobile || "",
      pincode: address.pincode || "",
      state: address.state || "",
      city: address.city || "",
      houseNo: address.houseNo || "",
      area: address.area || "",
      landmark: address.landmark || "",
      addressType: address.addressType || "Home",
      isDefault: !!address.isDefault,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const res = await deleteAddressApi(id);
      setMessage(res?.data?.message || "Address deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      fetchAddresses();
    } catch (err) {
      console.error("Delete address error:", err);
      setError(err?.response?.data?.message || "Failed to delete address");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const res = await setDefaultAddressApi(id);
      setMessage(res?.data?.message || "Default address updated");

      setAddresses((prev) =>
        prev.map((address) => ({
          ...address,
          isDefault: address._id === id,
        }))
      );

      if (editingId === id) {
        setForm((prev) => ({
          ...prev,
          isDefault: true,
        }));
      }
    } catch (err) {
      console.error("Set default address error:", err);
      setError(err?.response?.data?.message || "Failed to set default address");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="addressPage">
      <div className="addressContainer">
        <div className="addressFormCard">
          <h1>{editingId ? "Update Address" : "Add New Address"}</h1>
          <p>Save delivery details for checkout.</p>

          {message && <div className="addressSuccess">{message}</div>}
          {error && <div className="addressError">{error}</div>}

          <form className="addressForm" onSubmit={handleSubmit}>
            <div className="addressGrid">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
                autoComplete="off"
                required
              />
              <input
                type="text"
                name="mobile"
                placeholder="Mobile Number"
                value={form.mobile}
                onChange={handleChange}
                autoComplete="off"
                required
              />
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={form.pincode}
                autoComplete="off"
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={form.state}
                autoComplete="off"
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={form.city}
                autoComplete="off"
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="houseNo"
                placeholder="House No / Flat / Building"
                value={form.houseNo}
                autoComplete="off"
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="area"
                placeholder="Area / Street / Locality"
                value={form.area}
                autoComplete="off"
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="landmark"
                placeholder="Landmark"
                value={form.landmark}
                autoComplete="off"
                onChange={handleChange}
              />

              <select
                name="addressType"
                value={form.addressType}
                onChange={handleChange}
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>

              <label className="defaultCheck">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={handleChange}
                />
                Set as default address
              </label>
            </div>

            <div className="addressBtnRow">
              <button type="submit" className="saveAddressBtn" disabled={actionLoading}>
                {actionLoading
                  ? "Saving..."
                  : editingId
                  ? "Update Address"
                  : "Save Address"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancelAddressBtn"
                  onClick={resetForm}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="savedAddressCard">
          <h2>My Saved Addresses</h2>

          {loading ? (
            <div className="addressLoading">Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="addressEmpty">No saved addresses found.</div>
          ) : (
            <div className="addressList">
              {addresses.map((address) => (
                <div className="addressItemCard" key={address._id}>
                  <div className="addressTopRow">
                    <div>
                      <h3>
                        {address.fullName}
                        {address.isDefault && (
                          <span className="defaultBadge">Default</span>
                        )}
                      </h3>
                      <p>{address.mobile}</p>
                    </div>

                    <span className="addressTypeBadge">{address.addressType}</span>
                  </div>

                  <p className="addressText">
                    {address.houseNo}, {address.area}, {address.city}, {address.state} -{" "}
                    {address.pincode}
                  </p>

                  {address.landmark && (
                    <p className="addressLandmark">Landmark: {address.landmark}</p>
                  )}

                  <div className="addressActionRow">
                    <button
                      className="addressActionBtn"
                      onClick={() => handleEdit(address)}
                      disabled={actionLoading}
                    >
                      Edit
                    </button>

                    <button
                      className="addressActionBtn"
                      onClick={() => handleDelete(address._id)}
                      disabled={actionLoading}
                    >
                      Delete
                    </button>

                    {!address.isDefault && (
                      <button
                        className="addressActionBtn primaryAction"
                        onClick={() => handleSetDefault(address._id)}
                        disabled={actionLoading}
                      >
                        Set Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Address;