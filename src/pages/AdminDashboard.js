import React, { useEffect, useState } from 'react';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Shipped: 'bg-blue-100 text-blue-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  'New Order': 'bg-gray-100 text-gray-800',
};

const statusOptions = [
  'All',
  'New Order',
  'Pending',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1a2RxbmFkamt2dWlia2J4d2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDg0MzEsImV4cCI6MjA2NjcyNDQzMX0.wHLlaus4ifuy_IZ51A62_mWTF-Wu7hfbpFqD0GCQoyE';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState([]); // for bulk actions
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    avgRating: 0,
    totalRatings: 0,
  });

  useEffect(() => {
    fetch('http://localhost:5000/orders', {
      headers: {
        Authorization: 'Basic ' + btoa('admin:yourpassword'),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const resOrders = await fetch('http://localhost:5000/orders', {
          headers: {
            Authorization: 'Basic ' + btoa('admin:yourpassword'),
          },
        });
        const orders = await resOrders.json();
        const totalSales = orders.reduce((sum, o) => sum + Number(o.total), 0);
        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
        // Fetch all ratings
        const resRatings = await fetch('http://localhost:5000/ratings/all', {
          headers: {
            Authorization: 'Basic ' + btoa('admin:yourpassword'),
          },
        });
        const ratings = await resRatings.json();
        const totalRatings = ratings.length;
        const avgRating =
          totalRatings > 0
            ? ratings.reduce((sum, r) => sum + Number(r.rating), 0) /
              totalRatings
            : 0;
        setAnalytics({
          totalSales,
          totalOrders,
          avgOrderValue,
          avgRating,
          totalRatings,
        });
      } catch (err) {
        // ignore analytics errors
      }
    }
    fetchAnalytics();
  }, []);

  // Filtering and search
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === 'All' ? true : order.status === statusFilter;
    const matchesSearch =
      order.customer?.toLowerCase().includes(search.toLowerCase()) ||
      order.email?.toLowerCase().includes(search.toLowerCase()) ||
      order.phone?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && (!search || matchesSearch);
  });

  // Sorting
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (sortBy === 'total') {
      valA = Number(valA);
      valB = Number(valB);
    }
    if (sortBy === 'createdAt') {
      valA = new Date(valA);
      valB = new Date(valB);
    }
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Bulk selection
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };
  const selectAll = () => {
    if (selected.length === sortedOrders.length) setSelected([]);
    else setSelected(sortedOrders.map((o) => o.id));
  };

  if (loading)
    return <div className="text-center py-10 text-lg">Loading orders...</div>;
  if (error)
    return <div className="text-center py-10 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-branding text-center">
        Admin Dashboard - Orders
      </h2>
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-branding">
            {analytics.totalSales.toLocaleString()} EGP
          </div>
          <div className="text-gray-500 text-sm mt-1">Total Sales</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-branding">
            {analytics.totalOrders}
          </div>
          <div className="text-gray-500 text-sm mt-1">Total Orders</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-branding">
            {analytics.avgOrderValue.toFixed(2)} EGP
          </div>
          <div className="text-gray-500 text-sm mt-1">Avg. Order Value</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <div className="text-2xl font-bold text-branding">
            {analytics.avgRating.toFixed(2)} / 5
          </div>
          <div className="text-gray-500 text-sm mt-1">
            Avg. Rating ({analytics.totalRatings})
          </div>
        </div>
      </div>
      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="flex gap-2 items-center">
          <label className="font-semibold">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <input
          type="text"
          placeholder="Search by customer, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-1 w-full md:w-64"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="py-3 px-2 text-left">
                <input
                  type="checkbox"
                  checked={
                    selected.length === sortedOrders.length &&
                    sortedOrders.length > 0
                  }
                  onChange={selectAll}
                />
              </th>
              <th
                className="py-3 px-4 text-left font-semibold text-gray-700 cursor-pointer"
                onClick={() => {
                  setSortBy('id');
                  setSortDir(
                    sortBy === 'id' && sortDir === 'asc' ? 'desc' : 'asc'
                  );
                }}
              >
                ID {sortBy === 'id' && (sortDir === 'asc' ? '▲' : '▼')}
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">
                Customer
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">
                Phone
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">
                Email
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">
                Address
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">
                Items
              </th>
              <th
                className="py-3 px-4 text-left font-semibold text-gray-700 cursor-pointer"
                onClick={() => {
                  setSortBy('total');
                  setSortDir(
                    sortBy === 'total' && sortDir === 'asc' ? 'desc' : 'asc'
                  );
                }}
              >
                Total {sortBy === 'total' && (sortDir === 'asc' ? '▲' : '▼')}
              </th>
              <th
                className="py-3 px-4 text-left font-semibold text-gray-700 cursor-pointer"
                onClick={() => {
                  setSortBy('status');
                  setSortDir(
                    sortBy === 'status' && sortDir === 'asc' ? 'desc' : 'asc'
                  );
                }}
              >
                Status {sortBy === 'status' && (sortDir === 'asc' ? '▲' : '▼')}
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">
                Notes
              </th>
              <th
                className="py-3 px-4 text-left font-semibold text-gray-700 cursor-pointer"
                onClick={() => {
                  setSortBy('createdAt');
                  setSortDir(
                    sortBy === 'createdAt' && sortDir === 'asc' ? 'desc' : 'asc'
                  );
                }}
              >
                Created At{' '}
                {sortBy === 'createdAt' && (sortDir === 'asc' ? '▲' : '▼')}
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">
                Transaction Image
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">
                Contact
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order) => (
              <tr
                key={order.id}
                className={`border-b hover:bg-gray-50 transition ${
                  selected.includes(order.id) ? 'bg-blue-50' : ''
                }`}
                // onClick={() => setModalOrder(order)} // for modal, to be added
              >
                <td className="py-2 px-2">
                  <input
                    type="checkbox"
                    checked={selected.includes(order.id)}
                    onChange={() => toggleSelect(order.id)}
                  />
                </td>
                <td className="py-2 px-4">{order.id}</td>
                <td className="py-2 px-4">{order.customer}</td>
                <td className="py-2 px-4">{order.phone}</td>
                <td className="py-2 px-4">{order.email}</td>
                <td className="py-2 px-4">{order.address}</td>
                <td className="py-2 px-4">
                  <ul className="list-disc pl-5">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        <span className="font-medium">{item.name}</span> (x
                        {item.quantity}) -{' '}
                        <span className="text-gray-500">{item.price} EGP</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="py-2 px-4 font-semibold">{order.total} EGP</td>
                <td className="py-2 px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      statusColors[order.status] || 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {order.status}
                  </span>
                  {order.status_history && order.status_history.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      <div className="font-semibold mb-1">Timeline:</div>
                      <ul className="space-y-1">
                        {order.status_history.map((h, idx) => (
                          <li key={idx}>
                            <span className="font-bold">{h.status}</span>{' '}
                            &mdash;{' '}
                            <span>
                              {new Date(h.changedAt).toLocaleString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </td>
                <td className="py-2 px-4">{order.notes || '-'}</td>
                <td className="py-2 px-4 whitespace-nowrap">
                  {order.createdAt}
                </td>
                <td className="py-2 px-4">
                  {order.transaction_image ? (
                    <a
                      href={order.transaction_image}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={order.transaction_image}
                        alt="Transaction"
                        style={{ maxWidth: 60, maxHeight: 60, borderRadius: 8 }}
                      />
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-2 px-4 text-center">
                  {order.phone ? (
                    <a
                      href={`https://wa.me/${order.phone.replace(
                        /[^\d]/g,
                        ''
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Contact via WhatsApp"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 transition"
                    >
                      <img
                        src="https://www.freepnglogos.com/uploads/whatsapp-logo-png-hd-2.png"
                        alt="WhatsApp Logo"
                        width="24"
                        height="24"
                        style={{ objectFit: 'contain' }}
                      />
                    </a>
                  ) : (
                    <span
                      className="inline-block w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400"
                      title="No phone"
                    >
                      <svg
                        viewBox="0 0 32 32"
                        width="20"
                        height="20"
                        fill="currentColor"
                      >
                        <circle cx="16" cy="16" r="14" />
                      </svg>
                    </span>
                  )}
                  {(order.status === 'Pending' ||
                    order.status === 'New Order') && (
                    <div className="flex flex-col gap-2 mt-2">
                      {order.status === 'Pending' && (
                        <button
                          onClick={async () => {
                            if (
                              !window.confirm(
                                'Are you sure you want to approve this order?'
                              )
                            )
                              return;
                            await fetch(
                              `http://localhost:5000/orders/${order.id}`,
                              {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization:
                                    'Basic ' + btoa('admin:yourpassword'),
                                },
                                body: JSON.stringify({ status: 'Approved' }),
                              }
                            );
                            // Refresh orders
                            const res = await fetch(
                              'http://localhost:5000/orders',
                              {
                                headers: {
                                  Authorization:
                                    'Basic ' + btoa('admin:yourpassword'),
                                },
                              }
                            );
                            const data = await res.json();
                            setOrders(data);
                          }}
                          className="mb-1 px-3 py-1 rounded bg-green-500 text-white font-bold hover:bg-green-600 transition"
                        >
                          Approve
                        </button>
                      )}
                      {order.status === 'New Order' && (
                        <button
                          onClick={async () => {
                            if (
                              !window.confirm(
                                'Are you sure you want to cancel this order?'
                              )
                            )
                              return;
                            await fetch(
                              `http://localhost:5000/orders/${order.id}`,
                              {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization:
                                    'Basic ' + btoa('admin:yourpassword'),
                                },
                                body: JSON.stringify({ status: 'Cancelled' }),
                              }
                            );
                            // Refresh orders
                            const res = await fetch(
                              'http://localhost:5000/orders',
                              {
                                headers: {
                                  Authorization:
                                    'Basic ' + btoa('admin:yourpassword'),
                                },
                              }
                            );
                            const data = await res.json();
                            setOrders(data);
                          }}
                          className="px-3 py-1 rounded bg-red-500 text-white font-bold hover:bg-red-600 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Bulk actions and modal to be added here */}
    </div>
  );
};

export default AdminDashboard;
