import React, { useState } from 'react';

const STATUS_OPTIONS = [
  'New Order',
  'Order Being Prepared',
  'Order Ready',
  'Out for Delivery',
  'Order Delivered',
  'Completed',
  'Cancelled',
  'Rejected',
];

export default function CompanyDashboard() {
  const [trackerCode, setTrackerCode] = useState('');
  const [status, setStatus] = useState('Order Being Prepared');
  const [apiKey, setApiKey] = useState('your-delivery-company-api-key');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleUpdate(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const res = await fetch(
        `http://localhost:5000/orders/update-status/${trackerCode}`,
        {
          method: 'PATCH',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold text-branding mb-6 text-center">
        🚚 Company Order Status Updater
      </h2>
      <form
        onSubmit={handleUpdate}
        className="space-y-4 bg-white rounded-xl shadow p-6 animate-fade-in"
      >
        <div>
          <label className="block font-semibold mb-1">Tracker Code</label>
          <input
            type="text"
            value={trackerCode}
            onChange={(e) => setTrackerCode(e.target.value.toUpperCase())}
            className="w-full border rounded px-4 py-2 font-mono tracking-widest text-lg"
            required
            style={{ textTransform: 'uppercase' }}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">New Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded px-4 py-2 text-lg"
            required
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">API Key</label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full border rounded px-4 py-2 text-lg"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-branding text-white rounded py-2 font-bold text-lg hover:bg-branding/90 transition"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Status'}
        </button>
      </form>
      {error && (
        <div className="mt-4 text-red-600 font-semibold animate-bounce">
          {error}
        </div>
      )}
      {result && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-800 rounded-xl shadow p-4 animate-fade-in-up">
          <div className="font-bold mb-2">Order Updated!</div>
          <div>
            <b>Status:</b> {result.status}
          </div>
          <div>
            <b>Customer:</b> {result.customer}
          </div>
          <div>
            <b>Tracker Code:</b> {result.tracker_code}
          </div>
        </div>
      )}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,2,.6,1) both; }
        .animate-fade-in-up { animation: fade-in-up 0.7s cubic-bezier(.4,2,.6,1) both; }
      `}</style>
    </div>
  );
}
