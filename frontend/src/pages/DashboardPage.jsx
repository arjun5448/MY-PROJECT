import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addClient, deleteClient, getClientsByUser, sendReminder, updateClient } from "../api/clientApi";
import ClientForm from "../components/ClientForm";
import ClientTable from "../components/ClientTable";
import CyclePieChart from "../components/CyclePieChart";
import FilterTabs from "../components/FilterTabs";
import StatCard from "../components/StatCard";
import StatusBarChart from "../components/StatusBarChart";
import { extractApiError } from "../utils/errorUtils";
import { enrichClients } from "../utils/premiumUtils";

function DashboardPage() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("licUser");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [clients, setClients] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [editingClient, setEditingClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [remindingId, setRemindingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const loadClients = async () => {
    if (!user?.id) {
      localStorage.removeItem("licUser");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await getClientsByUser(user.id);
      setClients(enrichClients(data));
    } catch (apiError) {
      setError(extractApiError(apiError, "Failed to fetch clients"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const normalizedSearch = deferredSearchTerm.trim().toLowerCase();

  const filteredClients = clients
    .filter((client) => (filter === "all" ? true : client.status === filter))
    .filter((client) => {
      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        client.name,
        client.phone,
        client.policyNumber,
        client.premiumCycle,
        client.status
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    })
    .sort((firstClient, secondClient) => {
      switch (sortBy) {
        case "name-desc":
          return secondClient.name.localeCompare(firstClient.name);
        case "premium-high":
          return Number(secondClient.premiumAmount) - Number(firstClient.premiumAmount);
        case "premium-low":
          return Number(firstClient.premiumAmount) - Number(secondClient.premiumAmount);
        case "due-soon":
          return new Date(firstClient.nextDueDate) - new Date(secondClient.nextDueDate);
        case "due-late":
          return new Date(secondClient.nextDueDate) - new Date(firstClient.nextDueDate);
        case "status":
          return firstClient.status.localeCompare(secondClient.status);
        default:
          return firstClient.name.localeCompare(secondClient.name);
      }
    });

  const stats = {
    total: clients.length,
    due: clients.filter((client) => client.status === "due").length,
    upcoming: clients.filter((client) => client.status === "upcoming").length,
    overdue: clients.filter((client) => client.status === "overdue").length
  };

  const handleLogout = () => {
    localStorage.removeItem("licUser");
    navigate("/login");
  };

  const handleSearchChange = (event) => {
    const { value } = event.target;
    startTransition(() => {
      setSearchTerm(value);
    });
  };

  const handleSubmit = async (payload) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (editingClient) {
        await updateClient(editingClient.id, payload);
      } else {
        await addClient(user.id, payload);
      }
      setEditingClient(null);
      await loadClients();
      setSuccess(editingClient ? "Client updated successfully." : "Client added successfully.");
    } catch (apiError) {
      setError(extractApiError(apiError, "Unable to save client"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (clientId) => {
    const confirmed = window.confirm("Are you sure you want to delete this client?");
    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    try {
      await deleteClient(clientId);
      if (editingClient?.id === clientId) {
        setEditingClient(null);
      }
      await loadClients();
      setSuccess("Client deleted successfully.");
    } catch (apiError) {
      setError(extractApiError(apiError, "Unable to delete client"));
    }
  };

  const handleReminder = async (clientId) => {
    setRemindingId(clientId);
    setError("");
    setSuccess("");
    try {
      const response = await sendReminder(clientId);
      setSuccess(response.message || "Reminder processed successfully.");
    } catch (apiError) {
      setError(extractApiError(apiError, "Unable to send reminder"));
    } finally {
      setRemindingId(null);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Portfolio overview</span>
          <h1>Welcome, {user.username}</h1>
          <p>Monitor policy cycles, spot urgent follow-ups, and update your client book with ease.</p>
        </div>
        <button type="button" className="ghost-button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <section className="stats-grid">
        <StatCard label="Total Clients" value={stats.total} accent="teal" />
        <StatCard label="Due in 7 Days" value={stats.due} accent="amber" />
        <StatCard label="Upcoming" value={stats.upcoming} accent="blue" />
        <StatCard label="Overdue" value={stats.overdue} accent="red" />
      </section>

      <section className="chart-grid">
        <StatusBarChart stats={stats} />
        <CyclePieChart clients={clients} />
      </section>

      <section className="dashboard-grid">
        <ClientForm
          editingClient={editingClient}
          onSubmit={handleSubmit}
          onCancel={() => setEditingClient(null)}
          isSubmitting={saving}
        />

        <div className="panel table-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Client ledger</span>
              <h2>Premium tracking table</h2>
              <p className="panel-copy">A sharper, easier-to-scan view of premium value, next due schedule, and payment health.</p>
            </div>
            <FilterTabs activeFilter={filter} onChange={setFilter} />
          </div>

          <div className="toolbar-panel">
            <label className="toolbar-field search-field">
              <span>Search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by name, phone, policy or status"
              />
            </label>

            <label className="toolbar-field">
              <span>Sort By</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="premium-high">Premium High-Low</option>
                <option value="premium-low">Premium Low-High</option>
                <option value="due-soon">Next Due Soonest</option>
                <option value="due-late">Next Due Latest</option>
                <option value="status">Status</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="empty-state">
              <h3>Loading clients...</h3>
            </div>
          ) : (
            <ClientTable
              clients={filteredClients}
              onEdit={setEditingClient}
              onDelete={handleDelete}
              onRemind={handleReminder}
              remindingId={remindingId}
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
