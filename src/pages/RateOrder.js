import React, { useState } from 'react';

const statusEmojis = {
  'New Order': '🟢',
  Pending: '⏳',
  Approved: '✅',
  Rejected: '❌',
  Cancelled: '🚫',
  Delivered: '📦',
  Shipped: '🚚',
  Completed: '🎉',
};

export default function RateOrder() {
  const [trackerCode, setTrackerCode] = useState('');
  const [step, setStep] = useState(1);
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({
    rating: 0,
    comment: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleTrackerSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setOrder(null);
    setSuccess(false);
    try {
      const res = await fetch(
        `http://localhost:5000/orders/track/${trackerCode}`
      );
      if (!res.ok)
        throw new Error('Order not found. Please check your tracker code.');
      const data = await res.json();
      setOrder(data);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      let product_name = null;
      if (order.items && order.items[0] && order.items[0].name) {
        product_name = order.items[0].name;
      }
      if (!product_name) {
        setError('Product name not found.');
        setLoading(false);
        return;
      }
      const customer_name = order.customer;
      const rating = Number(form.rating);
      const comment = form.comment;
      if (!customer_name || !rating || !comment) {
        setError('Please fill all fields.');
        setLoading(false);
        return;
      }
      const res = await fetch('http://localhost:5000/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name, customer_name, rating, comment }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to submit rating.');
        setLoading(false);
        return;
      }
      setSuccess(true);
      setForm({ rating: 0, comment: '' });
      setStep(1);
      setTrackerCode('');
    } catch (err) {
      setError('Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const statusColor =
    order?.status === 'New Order'
      ? 'bg-green-100 text-green-800 border-green-300'
      : order?.status === 'Pending'
      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
      : order?.status === 'Approved'
      ? 'bg-blue-100 text-blue-800 border-blue-300'
      : order?.status === 'Rejected' || order?.status === 'Cancelled'
      ? 'bg-red-100 text-red-800 border-red-300'
      : order?.status === 'Delivered'
      ? 'bg-purple-100 text-purple-800 border-purple-300'
      : order?.status === 'Shipped'
      ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
      : order?.status === 'Completed'
      ? 'bg-branding/10 text-branding border-branding/30'
      : 'bg-gray-100 text-gray-800 border-gray-300';

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-extrabold text-branding mb-6 text-center tracking-tight animate-fade-in">
        ⭐ Rate Your Order
      </h2>
      {success && (
        <div className="mb-4 text-green-700 font-semibold animate-fade-in-up">
          Thank you for your rating! 🎉
        </div>
      )}
      {error && (
        <div className="mb-4 text-red-600 font-semibold animate-bounce">
          {error}
        </div>
      )}
      {step === 1 && (
        <form
          onSubmit={handleTrackerSubmit}
          className="space-y-4 animate-fade-in-up"
        >
          <label className="block font-semibold text-lg">
            Enter your Tracker Code
          </label>
          <input
            type="text"
            value={trackerCode}
            onChange={(e) => setTrackerCode(e.target.value.toUpperCase())}
            className="w-full border rounded px-4 py-2 text-xl tracking-widest text-center font-mono"
            required
            style={{ textTransform: 'uppercase' }}
          />
          <button
            type="submit"
            className="w-full bg-branding text-white rounded py-2 font-bold mt-2 text-lg hover:bg-branding/90 transition"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Find Order'}
          </button>
        </form>
      )}
      {step === 2 && order && (
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: '0.2s', animationDuration: '0.7s' }}
        >
          <div className="flex flex-col items-center mb-6">
            <div
              className={`rounded-full px-4 py-2 border text-lg font-bold shadow-sm mt-2 ${statusColor} flex items-center gap-2`}
              style={{ transition: 'all 0.4s cubic-bezier(.4,2,.6,1)' }}
            >
              <span className="text-2xl">
                {statusEmojis[order.status] || '🔔'}
              </span>
              {order.status}
            </div>
          </div>
          <div
            className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fade-in-up"
            style={{ animationDelay: '0.3s', animationDuration: '0.7s' }}
          >
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">
              👤 Customer:{' '}
              <span className="font-normal text-gray-700">
                {order.customer}
              </span>
            </div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">
              📧 Email:{' '}
              <span className="font-normal text-gray-700">{order.email}</span>
            </div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">
              📱 Phone:{' '}
              <span className="font-normal text-gray-700">{order.phone}</span>
            </div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">
              🏠 Address:{' '}
              <span className="font-normal text-gray-700">{order.address}</span>
            </div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">
              💳 Payment:{' '}
              <span className="font-normal text-gray-700">{order.payment}</span>
            </div>
            {order.notes && (
              <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">
                📝 Notes:{' '}
                <span className="font-normal text-gray-700">{order.notes}</span>
              </div>
            )}
            {order.coupon && (
              <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">
                🏷️ Coupon:{' '}
                <span className="font-normal text-gray-700">
                  {order.coupon}
                </span>
              </div>
            )}
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">
              💰 Total:{' '}
              <span className="font-normal text-gray-700">
                {order.total} EGP
              </span>
            </div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">
              ⏰ Created At:{' '}
              <span className="font-normal text-gray-700">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">
              🔑 Tracker Code:{' '}
              <span className="font-mono text-lg text-branding font-bold bg-branding/10 px-2 py-1 rounded">
                {order.tracker_code}
              </span>
            </div>
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">
              🛒 Items:
            </div>
            <ul
              className="list-disc ml-8 mb-4 animate-fade-in-up"
              style={{ animationDelay: '0.4s', animationDuration: '0.7s' }}
            >
              {order.items &&
                order.items.map((item, idx) => (
                  <li key={idx} className="text-gray-700 text-base mb-1">
                    {item.name}{' '}
                    <span className="text-gray-400">(x{item.quantity})</span> -{' '}
                    <span className="text-branding font-bold">
                      {item.price} EGP
                    </span>
                  </li>
                ))}
            </ul>
            {order.transaction_image && (
              <div
                className="mb-2 animate-fade-in-up"
                style={{ animationDelay: '0.6s', animationDuration: '0.7s' }}
              >
                <b className="text-branding">🖼️ Transaction Image:</b>
                <br />
                <img
                  src={order.transaction_image}
                  alt="Transaction"
                  className="max-w-xs rounded border mt-2 shadow"
                />
              </div>
            )}
          </div>
          {['Delivered', 'Completed'].includes(order.status) ? (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 animate-fade-in-up"
              style={{ animationDelay: '0.7s', animationDuration: '0.7s' }}
            >
              <div>
                <label className="block font-semibold text-lg">
                  Your Rating{' '}
                  <span className="text-2xl">
                    {form.rating > 0 ? '⭐'.repeat(form.rating) : ''}
                  </span>
                </label>
                <select
                  name="rating"
                  value={form.rating}
                  onChange={handleFormChange}
                  className="w-full border rounded px-4 py-2 text-lg"
                  required
                >
                  <option value={0}>Select...</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} Star{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-lg">
                  Your Comment
                </label>
                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={handleFormChange}
                  className="w-full border rounded px-4 py-2 text-lg"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-branding text-white rounded py-2 font-bold mt-2 text-lg hover:bg-branding/90 transition"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Rating'}
              </button>
            </form>
          ) : (
            <div className="text-center text-lg text-yellow-600 font-semibold animate-fade-in-up mt-4">
              ⭐ You can only rate your order after it has been delivered.
              <br />
              Current status: <span className="font-bold">{order.status}</span>
            </div>
          )}
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
