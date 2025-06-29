import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import products from '../products';
import { CartContext } from '../App';
import OrderForm from '../components/OrderForm';

const reviews = [];

const GOVERNMENTS = [
  'Cairo',
  'Alexandria',
  'Giza',
  'Dakahlia',
  'Red Sea',
  'Beheira',
  'Fayoum',
  'Gharbiya',
  'Ismailia',
  'Menofia',
  'Minya',
  'Qaliubiya',
  'New Valley',
  'Suez',
  'Aswan',
  'Assiut',
  'Beni Suef',
  'Port Said',
  'Damietta',
  'Sharkia',
  'South Sinai',
  'Kafr Al sheikh',
  'Matrouh',
  'Luxor',
  'Qena',
  'North Sinai',
  'Sohag',
];

export default function ProductDetails() {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));
  const [count, setCount] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    government: 'Alexandria',
    country: '',
    address: '',
    mobile2: '',
    notes: '',
    coupon: '',
    payment: 'cod',
    transaction: null,
  });
  const [showRating, setShowRating] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const shipping = 60;
  const total = product ? product.price * count + shipping : 0;
  const [mainImg, setMainImg] = useState(
    product?.images?.[0] || product?.image
  );
  const [userComment, setUserComment] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [ratingsError, setRatingsError] = useState('');
  const navigate = useNavigate();
  const [inputErrors, setInputErrors] = useState({});
  const { setCart } = useContext(CartContext);
  const [cartSuccess, setCartSuccess] = useState(false);
  const formRef = useRef(null);
  const orderFormRef = useRef(null);
  const [zoomImg, setZoomImg] = useState(null);

  useEffect(() => {
    async function fetchRatings() {
      setRatingsLoading(true);
      setRatingsError('');
      try {
        const res = await fetch(
          `http://localhost:5000/ratings/${encodeURIComponent(product.title)}`
        );
        const data = await res.json();
        setRatings(data);
      } catch (err) {
        setRatingsError('Failed to load ratings.');
      } finally {
        setRatingsLoading(false);
      }
    }
    if (product?.title) fetchRatings();
  }, [product?.title]);

  const avgRating =
    ratings.length > 0
      ? (
          ratings.reduce((sum, r) => sum + Number(r.rating), 0) / ratings.length
        ).toFixed(1)
      : null;

  if (!product)
    return <div className="p-8 text-center">Product not found.</div>;

  function handleFormChange(e) {
    const { name, value, files } = e.target;
    if (name === 'transaction' && files && files[0]) {
      const file = files[0];
      // Only allow image files and max 5MB
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.');
        setForm((f) => ({ ...f, transaction: null }));
        setImagePreview(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB.');
        setForm((f) => ({ ...f, transaction: null }));
        setImagePreview(null);
        return;
      }
      setForm((f) => ({ ...f, transaction: file }));
      setError('');
      // Show preview
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setForm((f) => ({ ...f, [name]: files ? files[0] : value }));
    }
  }

  function validateForm() {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Full name is required.';
    if (!form.mobile.trim()) errors.mobile = 'Mobile number is required.';
    if (!form.address.trim()) errors.address = 'Address is required.';
    // Add more validation as needed
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(false);
    setError('');
    const errors = validateForm();
    setInputErrors(errors);
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }
    setLoading(true);

    let transactionImage = '';
    if (form.transaction) {
      // Upload image to imgbb
      const formData = new FormData();
      formData.append('image', form.transaction);
      try {
        const res = await fetch(
          'https://api.imgbb.com/1/upload?key=a79dedf9c8e53b8207786a56e64aed1c',
          {
            method: 'POST',
            body: formData,
          }
        );
        const data = await res.json();
        if (data && data.data && data.data.url) {
          transactionImage = data.data.url;
        } else {
          setError('Failed to upload transaction image.');
          setLoading(false);
          return;
        }
      } catch (err) {
        setError('Failed to upload transaction image.');
        setLoading(false);
        return;
      }
    }

    // Prepare order data
    const orderData = {
      customer: form.name,
      email: form.email,
      phone: form.mobile,
      address: `${form.address}, ${form.government}, ${form.country}`,
      items: [
        {
          id: product.id,
          name: product.title,
          quantity: count,
          price: product.price,
        },
      ],
      total: total,
      status: 'Pending',
      notes: form.notes,
      createdAt: new Date().toISOString(),
      transaction_image: transactionImage,
    };

    try {
      const res = await fetch('http://localhost:5000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Order could not be submitted.');
        setLoading(false);
        return;
      }
      setSubmitted(true);
      setForm({
        name: '',
        email: '',
        mobile: '',
        government: 'Alexandria',
        country: '',
        address: '',
        mobile2: '',
        notes: '',
        coupon: '',
        payment: 'cod',
        transaction: null,
      });
      setImagePreview(null);
    } catch (err) {
      setError('A network or server error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleReviewSubmit(e) {
    e.preventDefault();
    // Handle review submission
    setShowRating(false);
  }

  // Add a handler for the top Buy Now button
  function handleTopBuyNow(e) {
    e.preventDefault();
    if (orderFormRef.current) {
      orderFormRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      setTimeout(() => {
        orderFormRef.current.dispatchEvent(
          new Event('submit', { cancelable: true, bubbles: true })
        );
      }, 400); // Wait for scroll to finish
    }
  }

  function handleAddToCart() {
    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id);
      if (found) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + count } : item
        );
      }
      return [...prev, { ...product, qty: count }];
    });
    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 1500);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Product Image Gallery and below: Reviews, Related Products */}
        <div className="flex-1 flex flex-col items-center md:items-start">
          <img
            src={mainImg}
            alt={product.title}
            className="w-72 h-72 object-cover rounded-xl mb-4 cursor-zoom-in"
            onClick={() => setZoomImg(mainImg)}
          />
          {zoomImg && (
            <div
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in"
              onClick={() => setZoomImg(null)}
              style={{ cursor: 'zoom-out' }}
            >
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <img
                  src={zoomImg}
                  alt="Zoomed"
                  className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-2xl border-4 border-white"
                  style={{ objectFit: 'contain' }}
                />
                <button
                  className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 transition"
                  onClick={() => setZoomImg(null)}
                  aria-label="Close zoom"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 text-gray-700"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            {(product.images || [product.image]).slice(0, 3).map((img, i) => (
              <img
                key={i}
                src={img}
                alt={product.title + ' ' + (i + 1)}
                className={`w-16 h-16 object-cover rounded cursor-pointer border ${
                  mainImg === img ? 'border-branding' : 'border-transparent'
                }`}
                onClick={() => setMainImg(img)}
              />
            ))}
          </div>
          {/* Users Reviews */}
          <div className="mt-10 w-full">
            <h3 className="text-lg font-bold mb-2">Users Reviews</h3>
            {ratingsLoading && (
              <div className="text-oldprice text-sm">Loading reviews...</div>
            )}
            {ratingsError && (
              <div className="text-red-600 text-sm">{ratingsError}</div>
            )}
            {!ratingsLoading && !ratingsError && ratings.length === 0 && (
              <div className="mb-2 text-sm text-oldprice">No Reviews</div>
            )}
            {!ratingsLoading && !ratingsError && ratings.length > 0 && (
              <>
                <div className="mb-2 text-sm text-oldprice">
                  {avgRating} out of 5 stars ({ratings.length} review
                  {ratings.length > 1 ? 's' : ''})
                </div>
                {ratings.map((r, i) => (
                  <div
                    key={i}
                    className="mb-4 p-3 bg-background rounded border border-oldprice"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-discount">
                        {'★'.repeat(Number(r.rating))}
                        {'☆'.repeat(5 - Number(r.rating))}
                      </span>
                      <span className="text-xs text-oldprice">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString()
                          : ''}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-branding">
                      {r.customer_name}
                    </div>
                    <div className="text-sm">{r.comment}</div>
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="my-8 border-t border-gray-200 w-full" />
          {/* Related Products */}
          <div className="mt-10 w-full">
            <h3 className="text-lg font-bold mb-4">Related Products</h3>
            {(() => {
              let related = products
                .filter(
                  (p) => p.id !== product.id && p.category === product.category
                )
                .slice(0, 4);
              if (related.length === 0) {
                // If no related, show any 4 products (excluding current)
                related = products
                  .filter((p) => p.id !== product.id)
                  .slice(0, 4);
              }
              return (
                <>
                  {/* First two side by side */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {related.slice(0, 2).map((rp) => (
                      <div
                        key={rp.id}
                        className="bg-white rounded-2xl shadow-md p-5 flex flex-col items-center cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl border border-transparent hover:border-branding group"
                        style={{ textDecoration: 'none' }}
                        onClick={() => navigate(`/product/${rp.id}`)}
                      >
                        <img
                          src={rp.image}
                          alt={rp.title}
                          className="w-28 h-28 object-cover rounded-xl mb-3 group-hover:opacity-90"
                        />
                        <div className="text-branding font-bold mb-1 text-center text-base group-hover:text-branding">
                          {rp.title}
                        </div>
                        <div className="text-price font-bold text-lg">
                          {rp.price} EGP
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Remaining related products in a single row */}
                  <div className="flex gap-6 justify-between">
                    {related.slice(2, 4).map((rp) => (
                      <div
                        key={rp.id}
                        className="bg-white rounded-2xl shadow-md p-5 flex-1 min-w-0 flex flex-col items-center cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl border border-transparent hover:border-branding group"
                        style={{ textDecoration: 'none' }}
                        onClick={() => navigate(`/product/${rp.id}`)}
                      >
                        <img
                          src={rp.image}
                          alt={rp.title}
                          className="w-28 h-28 object-cover rounded-xl mb-3 group-hover:opacity-90"
                        />
                        <div className="text-branding font-bold mb-1 text-center text-base group-hover:text-branding">
                          {rp.title}
                        </div>
                        <div className="text-price font-bold text-lg">
                          {rp.price} EGP
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
        {/* Right: Details and Order Form */}
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-branding">{product.title}</h2>
          <div className="flex items-center gap-4">
            <span className="text-price text-2xl font-bold">
              {product.price} EGP
            </span>
            {product.originalPrice && (
              <span className="text-oldprice line-through text-lg">
                {product.originalPrice} EGP
              </span>
            )}
            <span className="text-xs text-oldprice">0 From 5 Stars</span>
          </div>
          {/* Quantity Selector */}
          <div className="flex items-center gap-2 mt-4">
            <button
              className="p-2 bg-gray-50 border rounded-md active:bg-gray-200 hover:bg-gray-100"
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              type="button"
              aria-label="Decrease quantity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-gray-900"
              >
                <path
                  fillRule="evenodd"
                  d="M3.75 12a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
            <span className="font-bold text-lg w-8 text-center">{count}</span>
            <button
              className="p-2 bg-gray-50 border rounded-md active:bg-gray-200 hover:bg-gray-100"
              onClick={() => setCount((c) => c + 1)}
              type="button"
              aria-label="Increase quantity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-gray-900"
              >
                <path
                  fillRule="evenodd"
                  d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className="bg-branding text-white px-6 py-2 rounded font-bold hover:bg-discount transition"
              onClick={handleTopBuyNow}
              type="button"
            >
              Buy now
            </button>
            <button
              className="bg-background text-branding border border-branding px-6 py-2 rounded font-bold hover:bg-branding hover:text-white transition"
              type="button"
              onClick={handleAddToCart}
            >
              Add to cart
            </button>
          </div>
          {cartSuccess && (
            <div className="text-green-600 text-xs mt-2">Added to cart!</div>
          )}
          <div className="bg-background rounded-lg p-4 mt-4 text-sm">
            <div className="mb-2 font-semibold">
              📢 Your Content, Organized & On Point! 🎯
            </div>
            <div className="mb-2">
              Struggling to stay consistent? Our Content Planner helps you map
              out posts, brainstorm ideas, and track engagement—so you can
              create with confidence! 🚀
            </div>
            <ul className="list-disc pl-5 space-y-1">
              <li>✔ Define your content goals</li>
              <li>✔ Plan formats, hashtags & mentions</li>
              <li>✔ Draft captions effortlessly</li>
              <li>✔ Stay organized & stress-free</li>
            </ul>
            <div className="mt-2">
              🛒 Get yours now & start creating smarter! ✍️📖
            </div>
          </div>
          {/* Order Form */}
          {submitted ? (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl shadow-lg p-6 mt-4 text-center text-lg font-semibold max-w-md mx-auto">
              <svg
                className="mx-auto mb-2"
                width="32"
                height="32"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="12" fill="#22c55e" />
                <path
                  d="M7 13l3 3 7-7"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Thank you! We received your order and will contact you to confirm.
            </div>
          ) : (
            <OrderForm
              ref={orderFormRef}
              items={[]}
              total={total}
              productTitle={product.title}
              quantity={count}
              setQuantity={setCount}
              showCoupon={true}
              shipping={shipping}
              onSuccess={() => setSubmitted(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
