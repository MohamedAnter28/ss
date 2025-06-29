import React, { useState } from 'react';

export default function OrderHistory() {
  const [input, setInput] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrders([]);
    setSubmitted(false);
    try {
      const res = await fetch(
        `http://localhost:5000/orders/history?query=${encodeURIComponent(
          input
        )}`
      );
      if (!res.ok) throw new Error('No orders found for this email or phone.');
      const data = await res.json();
      setOrders(data);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold text-branding mb-6 text-center">
        Order History
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your email or phone number"
          className="border rounded px-4 py-2 w-full md:w-80 text-lg"
          required
        />
        <button
          type="submit"
          className="bg-branding text-white rounded px-6 py-2 font-bold text-lg hover:bg-discount transition"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Find Orders'}
        </button>
      </form>
      {error && <div className="text-red-600 text-center mb-4">{error}</div>}
      {submitted && orders.length === 0 && !loading && !error && (
        <div className="text-center text-oldprice">No orders found.</div>
      )}
      {orders.length > 0 && (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow p-4 border border-gray-200"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                <div>
                  <span className="font-bold text-branding">
                    Order #{order.id}
                  </span>{' '}
                  <span className="text-xs text-gray-500">
                    ({new Date(order.createdAt).toLocaleString()})
                  </span>
                </div>
                <div className="text-sm text-branding font-semibold">
                  Status: {order.status}
                </div>
              </div>
              <div className="mb-2 text-sm text-gray-700">
                Total: <span className="font-bold">{order.total} EGP</span>
              </div>
              <div className="mb-2 text-sm text-gray-700">
                Items:
                <ul className="list-disc ml-6">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} (x{item.quantity})
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={`/track/${order.tracker_code}`}
                className="inline-block mt-2 text-white bg-branding hover:bg-discount rounded px-4 py-2 text-sm font-bold transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                Track Order
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
