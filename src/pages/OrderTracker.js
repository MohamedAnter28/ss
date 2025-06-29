import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const statusEmojis = {
  'New Order': '🟢',
  'Pending': '⏳',
  'Approved': '✅',
  'Rejected': '❌',
  'Cancelled': '🚫',
  'Delivered': '📦',
  'Shipped': '🚚',
  'Completed': '🎉',
};

export default function OrderTracker() {
  const { trackerCode } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/orders/track/${trackerCode}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [trackerCode]);

  if (loading) return <div className="text-center py-16 animate-pulse text-branding text-xl font-bold">🔎 Loading your order...</div>;
  if (error) return <div className="text-center py-16 text-red-600 text-xl font-bold animate-bounce">❌ {error}</div>;
  if (!order) return null;

  const statusColor =
    order.status === 'New Order' ? 'bg-green-100 text-green-800 border-green-300' :
    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
    order.status === 'Approved' ? 'bg-blue-100 text-blue-800 border-blue-300' :
    order.status === 'Rejected' || order.status === 'Cancelled' ? 'bg-red-100 text-red-800 border-red-300' :
    order.status === 'Delivered' ? 'bg-purple-100 text-purple-800 border-purple-300' :
    order.status === 'Shipped' ? 'bg-cyan-100 text-cyan-800 border-cyan-300' :
    order.status === 'Completed' ? 'bg-branding/10 text-branding border-branding/30' :
    'bg-gray-100 text-gray-800 border-gray-300';

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="flex flex-col items-center mb-6 animate-fade-in">
        <span className="text-4xl mb-2">📦</span>
        <h2 className="text-3xl font-extrabold text-branding mb-1 tracking-tight">Order Tracker</h2>
        <div className={`rounded-full px-4 py-2 border text-lg font-bold shadow-sm mt-2 ${statusColor} flex items-center gap-2`}
          style={{ transition: 'all 0.4s cubic-bezier(.4,2,.6,1)' }}>
          <span className="text-2xl">{statusEmojis[order.status] || '🔔'}</span>
          {order.status}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in-up" style={{ animationDelay: '0.2s', animationDuration: '0.7s' }}>
        <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">👤 Customer: <span className="font-normal text-gray-700">{order.customer}</span></div>
        <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">📧 Email: <span className="font-normal text-gray-700">{order.email}</span></div>
        <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">📱 Phone: <span className="font-normal text-gray-700">{order.phone}</span></div>
        <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">🏠 Address: <span className="font-normal text-gray-700">{order.address}</span></div>
        <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">💳 Payment: <span className="font-normal text-gray-700">{order.payment}</span></div>
        {order.notes && <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">📝 Notes: <span className="font-normal text-gray-700">{order.notes}</span></div>}
        {order.coupon && <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">🏷️ Coupon: <span className="font-normal text-gray-700">{order.coupon}</span></div>}
        <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">💰 Total: <span className="font-normal text-gray-700">{order.total} EGP</span></div>
        <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">⏰ Created At: <span className="font-normal text-gray-700">{new Date(order.createdAt).toLocaleString()}</span></div>
        <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">🔑 Tracker Code: <span className="font-mono text-lg text-branding font-bold bg-branding/10 px-2 py-1 rounded">{order.tracker_code}</span></div>
        <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-branding">🛒 Items:</div>
        <ul className="list-disc ml-8 mb-4 animate-fade-in-up" style={{ animationDelay: '0.4s', animationDuration: '0.7s' }}>
          {order.items && order.items.map((item, idx) => (
            <li key={idx} className="text-gray-700 text-base mb-1">{item.name} <span className="text-gray-400">(x{item.quantity})</span> - <span className="text-branding font-bold">{item.price} EGP</span></li>
          ))}
        </ul>
        {order.transaction_image && (
          <div className="mb-2 animate-fade-in-up" style={{ animationDelay: '0.6s', animationDuration: '0.7s' }}>
            <b className="text-branding">🖼️ Transaction Image:</b><br />
            <img src={order.transaction_image} alt="Transaction" className="max-w-xs rounded border mt-2 shadow" />
          </div>
        )}
        {order.status_history && order.status_history.length > 0 && (
          <div className="mt-8 bg-gray-50 rounded-xl p-4 border border-gray-200 animate-fade-in-up">
            <div className="font-bold text-branding mb-2 text-lg">Order Status Timeline</div>
            <ul className="space-y-2">
              {order.status_history.map((h, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <span className="font-bold">{h.status}</span>
                  <span className="text-gray-500">&mdash; {new Date(h.changedAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
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
