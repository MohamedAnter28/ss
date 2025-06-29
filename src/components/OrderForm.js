import React, { useState, useRef, forwardRef } from 'react';

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

const OrderForm = forwardRef(function OrderForm(
  {
    items = [],
    total = 0,
    onSuccess,
    showCoupon = false,
    showQuantity = false,
    initialForm = {},
    shipping = 60,
    productTitle = '',
    quantity = 1,
    setQuantity,
  },
  ref
) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    government: 'Alexandria',
    country: '',
    address: '',
    phone2: '',
    notes: '',
    payment: 'cod',
    transaction: null,
    coupon: '',
    ...initialForm,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputErrors, setInputErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponMessageColor, setCouponMessageColor] = useState('');
  const [trackerCode, setTrackerCode] = useState('');
  const formRef = useRef(null);

  // Fetch coupons from backend
  React.useEffect(() => {
    fetch('http://localhost:5000/coupons')
      .then((res) => res.json())
      .then((data) => setCoupons(data))
      .catch(() => setCoupons([]));
  }, []);

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === 'transaction' && files && files[0]) {
      const file = files[0];
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
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else if (name === 'coupon') {
      setForm((f) => ({ ...f, coupon: value.toUpperCase() }));
    } else {
      setForm((f) => ({ ...f, [name]: files ? files[0] : value }));
    }
  }

  function validateForm() {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Full name is required.';
    // Phone 1 validation
    if (!form.phone.trim()) {
      errors.phone = 'Mobile number is required.';
    } else if (!/^01[0-9]{9}$/.test(form.phone.trim())) {
      errors.phone = 'Mobile number must be 11 digits and start with 01.';
    }
    // Phone 2 validation (optional, but if filled must be valid)
    if (
      form.phone2 &&
      form.phone2.trim() &&
      !/^01[0-9]{9}$/.test(form.phone2.trim())
    ) {
      errors.phone2 = 'Mobile number 2 must be 11 digits and start with 01.';
    }
    // Email validation
    if (!form.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    // Government validation
    if (!form.government || !form.government.trim()) {
      errors.government = 'Government is required.';
    }
    // Country validation
    if (!form.country || !form.country.trim()) {
      errors.country = 'Country is required.';
    }
    // Address validation
    if (!form.address.trim()) errors.address = 'Address is required.';
    // Payment proof validation
    if (
      (form.payment === 'instapay' || form.payment === 'vodafone') &&
      !form.transaction
    ) {
      errors.transaction = 'Proof of payment is required.';
    }
    return errors;
  }

  function handleApplyCoupon() {
    const found = coupons.find(
      (c) => c.code === form.coupon.trim().toUpperCase()
    );
    if (found) {
      setDiscount(found.discount);
      setAppliedCoupon(found.code);
      setCouponMessage(`Coupon applied! You got ${found.discount}% off.`);
      setCouponMessageColor('green');
    } else {
      setDiscount(0);
      setAppliedCoupon('');
      setCouponMessage('Invalid coupon code. Please check and try again.');
      setCouponMessageColor('red');
    }
  }

  // Calculate discounted total
  const discountedTotal =
    discount > 0 ? Math.round(total * (1 - discount / 100)) : total;

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
    if (
      (form.payment === 'instapay' || form.payment === 'vodafone') &&
      form.transaction
    ) {
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
      phone: form.phone,
      phone2: form.phone2,
      government: form.government,
      address: `${form.address}, ${form.government}, ${form.country}`,
      items:
        items.length > 0
          ? items
          : [
              {
                id:
                  (typeof window !== 'undefined' && window.productId) ||
                  undefined,
                name: productTitle,
                quantity: quantity,
                price: total - shipping,
              },
            ],
      total: discountedTotal,
      payment: form.payment,
      notes: form.notes,
      createdAt: new Date().toISOString(),
      transaction_image: transactionImage,
      coupon: form.coupon,
    };

    try {
      const response = await fetch('http://localhost:5000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Order could not be submitted.');
        setLoading(false);
        return;
      }
      const data = await response.json();
      setTrackerCode(data.tracker_code);
      setSubmitted(true);
      setForm({
        name: '',
        email: '',
        phone: '',
        government: 'Alexandria',
        country: '',
        address: '',
        phone2: '',
        notes: '',
        payment: 'cod',
        transaction: null,
        coupon: '',
      });
      setImagePreview(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('A network or server error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
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
        <br />
        {trackerCode && (
          <div className="mt-4 text-base text-branding font-bold">
            Track your order here:{' '}
            <a
              href={`/track/${trackerCode}`}
              className="underline text-branding"
            >
              /track/{trackerCode}
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <form
      ref={ref ? ref : formRef}
      className="order_form_checkout border-2 border-dashed shadow-2xl border-branding rounded-xl p-4 max-w-md mx-auto"
      onSubmit={handleSubmit}
    >
      <p className="text-lg font-bold mb-4">
        Please fill your information to complete the order
      </p>
      {/* Full Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Full name
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-branding focus:ring-branding text-[1rem] leading-6 px-4 py-2"
          required
        />
        {inputErrors.name && (
          <div className="text-red-600 text-xs mt-1">{inputErrors.name}</div>
        )}
      </div>
      {/* Email */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-branding focus:ring-branding text-[1rem] leading-6 px-4 py-2"
        />
        {inputErrors.email && (
          <div className="text-red-600 text-xs mt-1">{inputErrors.email}</div>
        )}
      </div>
      {/* Mobile Number */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Mobile number
        </label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-branding focus:ring-branding text-[1rem] leading-6 px-4 py-2"
          required
        />
        {inputErrors.phone && (
          <div className="text-red-600 text-xs mt-1">{inputErrors.phone}</div>
        )}
      </div>
      {/* Government */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Government
        </label>
        <select
          name="government"
          value={form.government}
          onChange={handleChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-branding focus:ring-branding text-[1rem] leading-6 px-4 py-2"
        >
          {GOVERNMENTS.map((gov) => (
            <option key={gov} value={gov}>
              {gov}
            </option>
          ))}
        </select>
        {inputErrors.government && (
          <div className="text-red-600 text-xs mt-1">
            {inputErrors.government}
          </div>
        )}
      </div>
      {/* Country */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Country
        </label>
        <input
          type="text"
          name="country"
          value={form.country}
          onChange={handleChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-branding focus:ring-branding text-[1rem] leading-6 px-4 py-2"
        />
        {inputErrors.country && (
          <div className="text-red-600 text-xs mt-1">{inputErrors.country}</div>
        )}
      </div>
      {/* Address */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Detailed address (apartment & building)
        </label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          rows={2}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-branding focus:ring-branding text-[1rem] leading-6 px-4 py-2"
        />
        {inputErrors.address && (
          <div className="text-red-600 text-xs mt-1">{inputErrors.address}</div>
        )}
      </div>
      {/* Mobile 2 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Mobile number 2
        </label>
        <input
          type="tel"
          name="phone2"
          value={form.phone2}
          onChange={handleChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-branding focus:ring-branding text-[1rem] leading-6 px-4 py-2"
        />
        {inputErrors.phone2 && (
          <div className="text-red-600 text-xs mt-1">{inputErrors.phone2}</div>
        )}
      </div>
      {/* Notes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={2}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-branding focus:ring-branding text-[1rem] leading-6 px-4 py-2"
        />
      </div>
      {/* Coupon */}
      {showCoupon && (
        <div className="mt-2 flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Enter Coupon Code
            </label>
            <input
              type="text"
              name="coupon"
              value={form.coupon}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-branding focus:ring-branding text-[1rem] leading-6 px-4 py-2"
              style={{ textTransform: 'uppercase' }}
            />
            {couponMessage && (
              <div
                className={`mt-1 text-sm font-medium ${
                  couponMessageColor === 'green'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {couponMessage}
              </div>
            )}
          </div>
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-2 px-4 text-base font-medium transition-colors duration-200 ease-in-out focus:outline-none border border-branding bg-white hover:bg-gray-50 active:bg-gray-100 text-branding rounded-md mt-6"
            onClick={handleApplyCoupon}
          >
            Apply
          </button>
        </div>
      )}
      {/* Payment Methods */}
      <div className="mb-4">
        <span className="text-lg font-bold text-gray-700">
          Choose Payment Method
        </span>
        <div className="payments_container mt-2 flex flex-col space-y-2">
          {['cod', 'instapay', 'vodafone'].map((method) => (
            <label
              key={method}
              className={`payment_card flex cursor-pointer items-center p-2 transition duration-300 ease-in-out rounded-md border-2 ${
                form.payment === method ? 'border-branding' : 'border-gray-200'
              } hover:border-branding`}
            >
              <input
                type="radio"
                name="payment"
                value={method}
                checked={form.payment === method}
                onChange={handleChange}
                className="hidden"
              />
              <div
                className={`radio_container flex h-6 w-6 items-center justify-center rounded-full border ${
                  form.payment === method
                    ? 'border-branding'
                    : 'border-gray-200'
                } me-2`}
              >
                <div
                  className={`radio_circle h-4 w-4 rounded-full transition-colors duration-300 ease-in-out ${
                    form.payment === method ? 'bg-branding' : 'bg-gray-200'
                  }`}
                ></div>
              </div>
              <div className="flex w-full flex-col justify-center">
                <div className="payment_card_content flex w-full flex-col">
                  <span className="payment_card_name text-base font-bold text-gray-600 capitalize">
                    {method === 'cod'
                      ? 'Cash on delivery'
                      : method === 'instapay'
                      ? 'Instapay'
                      : 'Vodafone Cash'}
                  </span>
                  <span className="payment_card_description text-sm text-gray-500">
                    {method === 'cod'
                      ? 'Cash on delivery'
                      : method === 'instapay'
                      ? 'Transfer to Instapay'
                      : 'Transfer to Vodafone Cash'}
                  </span>
                </div>
              </div>
            </label>
          ))}
        </div>
        {(form.payment === 'instapay' || form.payment === 'vodafone') && (
          <div className="col-span-2 mt-2">
            <label className="block text-xs font-bold mb-1">
              Upload transaction screenshot
            </label>
            <input
              type="file"
              name="transaction"
              accept="image/*"
              onChange={handleChange}
              className="w-full"
            />
            <div className="text-xs text-oldprice mt-1">
              We will contact you to confirm the order after verifying your
              payment.
            </div>
            {inputErrors.transaction && (
              <div className="text-red-600 text-xs mt-1">
                {inputErrors.transaction}
              </div>
            )}
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-32 rounded border"
                />
              </div>
            )}
          </div>
        )}
      </div>
      {/* Shipping Cost */}
      <div className="shipping_cost_container mt-2 flex items-center justify-between">
        <dt className="text-gray-600">Shipping Cost</dt>
        <dd className="shipping_cost font-bold flex items-center gap-0.5">
          {shipping}
          <span className="font-[inherit]">EGP</span>
        </dd>
      </div>
      {/* Total */}
      <div className="total_price_container mt-4 flex items-center justify-between">
        <dt className="text-gray-600">Total</dt>
        <dd className="total_price font-bold flex items-center gap-0.5">
          {discount > 0 ? (
            <>
              <span className="line-through text-gray-400">{total} EGP</span>
              <span className="text-branding font-extrabold ms-2">
                {discountedTotal} EGP
              </span>
            </>
          ) : (
            <span>{total} EGP</span>
          )}
        </dd>
      </div>
      {/* Buy/Add to Cart Buttons */}
      <div className="mt-4 flex flex-col gap-2 lg:flex-row">
        <button
          type="submit"
          className="flex items-center justify-center gap-2 py-3 px-8 text-base font-medium transition-colors duration-200 ease-in-out focus:outline-none w-full border border-transparent bg-branding hover:bg-branding hover:bg-opacity-80 active:bg-opacity-90 text-white rounded-md"
          disabled={loading}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="Wallet">
              <g>
                <path d="M19.435,4.065H4.565a2.5,2.5,0,0,0-2.5,2.5v10.87a2.5,2.5,0,0,0,2.5,2.5h14.87a2.5,2.5,0,0,0,2.5-2.5V6.565A2.5,2.5,0,0,0,19.435,4.065Zm1.5,9.93h-6.42a2,2,0,0,1,0-4h6.42Zm-6.42-5a3,3,0,0,0,0,6h6.42v2.44a1.5,1.5,0,0,1-1.5,1.5H4.565a1.5,1.5,0,0,1-1.5-1.5V6.565a1.5,1.5,0,0,1,1.5-1.5h14.87a1.5,1.5,0,0,1,1.5,1.5v2.43Z"></path>
                <circle cx="14.519" cy="11.996" r="1"></circle>
              </g>
            </g>
          </svg>
          {loading ? 'Submitting...' : 'Submit Order'}
        </button>
      </div>
      {loading && (
        <div className="mb-4 text-branding font-semibold flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-branding"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          Processing...
        </div>
      )}
      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
    </form>
  );
});

export default OrderForm;
