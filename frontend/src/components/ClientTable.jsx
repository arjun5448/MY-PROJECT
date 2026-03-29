function ClientTable({ clients, onEdit, onDelete, onRemind, remindingId }) {
  if (clients.length === 0) {
    return (
      <div className="empty-state">
        <h3>No clients found</h3>
        <p>Add a client or change the filter to see more records.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="client-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Premium</th>
            <th>Schedule</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td data-label="Name">
                <div className="ledger-primary">
                  <strong>{client.name}</strong>
                  <span>Policy #{client.policyNumber}</span>
                </div>
              </td>
              <td data-label="Contact">
                <div className="ledger-secondary">
                  <strong>{client.phone}</strong>
                  <span>Primary contact</span>
                </div>
              </td>
              <td data-label="Premium">
                <div className="ledger-secondary">
                  <strong>Rs. {Number(client.premiumAmount).toLocaleString()}</strong>
                  <span>{client.premiumCycle.replaceAll("_", " ")}</span>
                </div>
              </td>
              <td data-label="Schedule">
                <div className="ledger-secondary">
                  <strong>{client.nextDueDate}</strong>
                  <span>Last paid {client.lastPaidDate}</span>
                </div>
              </td>
              <td data-label="Status">
                <span className={`status-badge ${client.status}`}>{client.status}</span>
              </td>
              <td data-label="Payment">
                <span className={`payment-badge ${client.paymentStatus}`}>{client.paymentStatus}</span>
              </td>
              <td data-label="Actions">
                <div className="table-actions">
                  <button type="button" className="edit-button" onClick={() => onEdit(client)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="remind-button"
                    onClick={() => onRemind(client.id)}
                    disabled={remindingId === client.id}
                  >
                    {remindingId === client.id ? "Sending..." : "Remind"}
                  </button>
                  <button type="button" className="delete-button" onClick={() => onDelete(client.id)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientTable;
