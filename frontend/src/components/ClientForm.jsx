import { useEffect, useState } from "react";

const initialForm = {
  name: "",
  phone: "",
  policyNumber: "",
  premiumAmount: "",
  premiumCycle: "MONTHLY",
  lastPaidDate: ""
};

function ClientForm({ editingClient, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (editingClient) {
      setFormData({
        name: editingClient.name,
        phone: editingClient.phone,
        policyNumber: editingClient.policyNumber,
        premiumAmount: editingClient.premiumAmount,
        premiumCycle: editingClient.premiumCycle,
        lastPaidDate: editingClient.lastPaidDate
      });
    } else {
      setFormData(initialForm);
    }
  }, [editingClient]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...formData,
      premiumAmount: Number(formData.premiumAmount)
    });
  };

  return (
    <div className="panel form-panel">
      <div className="panel-header">
        <div>
          <span className="eyebrow">{editingClient ? "Update policy" : "New policy"}</span>
          <h2>{editingClient ? "Edit client" : "Add client"}</h2>
        </div>
        {editingClient && (
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>

      <form className="client-form" onSubmit={handleSubmit}>
        <label>
          Client Name
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter client name"
            required
          />
        </label>
        <label>
          Phone Number
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            required
          />
        </label>
        <label>
          Policy Number
          <input
            type="text"
            name="policyNumber"
            value={formData.policyNumber}
            onChange={handleChange}
            placeholder="Enter policy number"
            required
          />
        </label>
        <label>
          Premium Amount
          <input
            type="number"
            name="premiumAmount"
            value={formData.premiumAmount}
            onChange={handleChange}
            placeholder="Enter premium amount"
            min="1"
            step="0.01"
            required
          />
        </label>
        <label>
          Premium Cycle
          <select name="premiumCycle" value={formData.premiumCycle} onChange={handleChange}>
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="HALF_YEARLY">Half-Yearly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </label>
        <label>
          Last Paid Date
          <input
            type="date"
            name="lastPaidDate"
            value={formData.lastPaidDate}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : editingClient ? "Update Client" : "Add Client"}
        </button>
      </form>
    </div>
  );
}

export default ClientForm;
