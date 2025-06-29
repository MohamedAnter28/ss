import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import ProductList from './components/ProductList';
import React, { createContext, useContext, useState } from 'react';
import { FiShoppingCart, FiSearch, FiX } from 'react-icons/fi';
import products from './products';
import './App.css';
import ProductDetails from './pages/ProductDetails';
import RateOrder from './pages/RateOrder';
import AdminDashboard from './pages/AdminDashboard';
import OrderForm from './components/OrderForm';
import OrderTracker from './pages/OrderTracker';
import CompanyDashboard from './pages/CompanyDashboard';
import OrderHistory from './pages/OrderHistory';

export const CartContext = createContext();

const NAV_LINKS = [
  { name: 'Notepads', to: '/products?category=Notepads' },
  { name: 'Planners', to: '/products?category=Planners' },
  { name: 'Stickers', to: '/products?category=Stickers' },
  { name: 'Digital Planner', to: '/products?category=Digital%20Planner' },
];

function App() {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id);
      if (found) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  // Persist cart to localStorage
  React.useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue('');
    }
  };

  return (
    <CartContext.Provider value={{ cart, setCart }}>
      <div className="min-h-screen bg-background font-sans text-text">
        <Header
          cartCount={cart.reduce((sum, item) => sum + item.qty, 0)}
          onCartClick={() => setCartOpen(true)}
          onSearchClick={() => setSearchOpen((v) => !v)}
          isAdmin={location.pathname.startsWith('/admin')}
        />
        {/* Search Modal/Input */}
        {searchOpen && !location.pathname.startsWith('/admin') && (
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center bg-black bg-opacity-30"
            onClick={() => setSearchOpen(false)}
          >
            <form
              className="mt-32 bg-white rounded-xl shadow-lg flex items-center gap-2 px-4 py-2 w-full max-w-md"
              onSubmit={handleSearch}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                autoFocus
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchOpen(false);
                }}
                placeholder="Search for products..."
                className="flex-1 px-3 py-2 rounded-md border border-gray-200 focus:border-branding focus:ring-branding outline-none text-lg"
              />
              <button
                type="submit"
                className="text-branding text-2xl px-2"
                aria-label="Search"
              >
                <FiSearch />
              </button>
            </form>
          </div>
        )}
        <main className="pt-24">
          <Routes>
            <Route path="/" element={<Home onAddToCart={addToCart} />} />
            <Route
              path="/products"
              element={<ProductList onAddToCart={addToCart} />}
            />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/rate" element={<RateOrder />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/track/:trackerCode" element={<OrderTracker />} />
            <Route path="/company" element={<CompanyDashboard />} />
            <Route path="/order-history" element={<OrderHistory />} />
          </Routes>
        </main>
        {!location.pathname.startsWith('/admin') && (
          <CartDrawer
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            cart={cart}
            setCart={setCart}
            onCheckout={() => {
              setCartOpen(false);
              navigate('/checkout');
            }}
          />
        )}
        {!location.pathname.startsWith('/admin') && (
          <a
            href="https://wa.me/201234567890" // Replace with your WhatsApp number
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-[100] bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all duration-200 animate-fade-in"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
            title="Contact us on WhatsApp"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              width="36"
              height="36"
              fill="currentColor"
            >
              <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.37L4 29l7.824-2.05A11.94 11.94 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 21.917c-1.89 0-3.73-.497-5.34-1.44l-.382-.225-4.646 1.217 1.24-4.527-.248-.393A9.93 9.93 0 0 1 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.29-7.6c-.29-.145-1.71-.844-1.974-.94-.265-.097-.458-.145-.652.146-.194.29-.748.94-.917 1.134-.168.194-.338.218-.627.073-.29-.145-1.225-.452-2.334-1.44-.863-.77-1.445-1.72-1.616-2.01-.168-.29-.018-.447.127-.592.13-.13.29-.338.436-.507.145-.17.194-.29.29-.484.097-.194.048-.364-.024-.51-.073-.145-.652-1.574-.893-2.16-.235-.566-.474-.49-.652-.5-.168-.007-.364-.009-.56-.009a1.08 1.08 0 0 0-.784.364c-.27.29-1.03 1.007-1.03 2.453 0 1.446 1.055 2.846 1.202 3.042.145.194 2.08 3.18 5.04 4.334.705.304 1.255.485 1.684.62.707.225 1.35.193 1.86.117.567-.085 1.71-.698 1.953-1.372.24-.673.24-1.25.168-1.372-.073-.12-.265-.194-.56-.338z" />
            </svg>
          </a>
        )}
      </div>
    </CartContext.Provider>
  );
}

function Header({ cartCount, onCartClick, onSearchClick, isAdmin }) {
  const navigate = useNavigate();
  return (
    <header className="fixed top-0 left-0 w-full bg-card shadow z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate(isAdmin ? '/admin' : '/')}
        >
          <img
            src="https://placehold.co/40x40/FAF8F5/1C3D37?text=L"
            alt="Logo"
            className="rounded-full w-10 h-10"
          />
          <span className="font-bold text-xl text-branding tracking-tight">
            Pledge
          </span>
        </div>
        {!isAdmin && (
          <nav className="hidden md:flex gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                className="text-branding hover:text-discount font-semibold transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        )}
        {!isAdmin && (
          <div className="flex items-center gap-4">
            <button
              className="relative"
              onClick={onCartClick}
              aria-label="Cart"
            >
              <span className="inline-block align-middle">
                <svg
                  aria-hidden="true"
                  focusable="false"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="12 11 16 18"
                  fill="currentColor"
                  className="w-6 h-6 text-branding"
                >
                  <path
                    d="m15.75 11.8h-3.16l-.77 11.6a5 5 0 0 0 4.99 5.34h7.38a5 5 0 0 0 4.99-5.33l-.78-11.61zm0 1h-2.22l-.71 10.67a4 4 0 0 0 3.99 4.27h7.38a4 4 0 0 0 4-4.27l-.72-10.67h-2.22v.63a4.75 4.75 0 1 1 -9.5 0zm8.5 0h-7.5v.63a3.75 3.75 0 1 0 7.5 0z"
                    fill="currentColor"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-discount text-white text-xs rounded-full px-1.5 py-0.5">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="ml-2"
              aria-label="Search"
              onClick={onSearchClick}
            >
              <FiSearch className="text-2xl text-branding" />
            </button>
          </div>
        )}
      </div>
      {!isAdmin && (
        <nav className="flex md:hidden gap-4 px-4 pb-2 pt-1 bg-card border-t border-oldprice">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className="text-branding hover:text-discount font-semibold text-sm transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function Home({ onAddToCart }) {
  return (
    <section className="max-w-6xl mx-auto px-4">
      {/* Banner */}
      <div className="relative flex flex-col items-center justify-center text-center py-10 mb-10 rounded-2xl overflow-hidden bg-gradient-to-br from-[#f8f6f2] to-[#f3e9dd] shadow-lg">
        <img
          src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80"
          alt="Banner background"
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none select-none"
        />
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-3xl md:text-5xl font-bold text-branding mb-2 drop-shadow">
            Welcome to Pledge
          </h1>
          <p className="text-lg md:text-2xl text-gray-700 mb-4 max-w-xl drop-shadow">
            Supercharge Your Style ⚡
          </p>
          <a
            href="/products"
            className="inline-block bg-branding text-white px-8 py-3 rounded-lg font-semibold shadow hover:bg-discount transition text-lg"
          >
            Shop Now
          </a>
        </div>
      </div>
      {/* Categories Section */}
      <CategoriesSection />
      {/* Best Seller Section */}
      <BestSellerSection onAddToCart={onAddToCart} />
    </section>
  );
}

function CategoriesSection() {
  const categories = [
    {
      name: 'Notepads',
      img: 'https://placehold.co/120x120/FAF8F5/1C3D37?text=Notepads',
    },
    {
      name: 'Planners',
      img: 'https://placehold.co/120x120/FAF8F5/1C3D37?text=Planners',
    },
    {
      name: 'Stickers',
      img: 'https://placehold.co/120x120/FAF8F5/1C3D37?text=Stickers',
    },
    {
      name: 'Digital Planner',
      img: 'https://placehold.co/120x120/FAF8F5/1C3D37?text=Digital',
    },
  ];
  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-branding mb-4">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            to={`/products?category=${encodeURIComponent(cat.name)}`}
            className="flex flex-col items-center bg-card rounded-xl shadow hover:shadow-md transition p-4"
          >
            <img
              src={cat.img}
              alt={cat.name}
              className="w-20 h-20 object-cover rounded-full mb-2"
            />
            <span className="text-branding font-semibold">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function BestSellerSection({ onAddToCart }) {
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 6);
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-branding mb-4">Best Sellers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {bestSellers.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="bg-card rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col items-center cursor-pointer group focus:outline-none focus:ring-0"
            style={{ textDecoration: 'none' }}
          >
            <img
              src={product.image}
              alt={product.title}
              className="w-32 h-32 object-cover rounded-lg mb-2 group-hover:opacity-80"
            />
            <div className="text-branding font-bold text-lg mb-1 ">
              {product.title}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-price font-bold text-lg">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-oldprice line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product);
              }}
              className="bg-branding text-white rounded px-4 py-2 font-semibold hover:bg-discount transition"
            >
              Add to Cart
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Checkout() {
  const { cart, setCart } = useContext(CartContext);
  const shipping = 60;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + (cart.length > 0 ? shipping : 0);
  const [submitted, setSubmitted] = React.useState(false);
  if (cart.length === 0 && !submitted) {
    return (
      <section className="py-12 text-center">
        <h2 className="text-branding text-2xl font-bold mb-2">Checkout</h2>
        <p>Your cart is empty.</p>
      </section>
    );
  }
  if (submitted) {
    return (
      <section className="py-12 text-center">
        <h2 className="text-branding text-2xl font-bold mb-2">
          Thank you for your order!
        </h2>
        <p>We will contact you soon.</p>
      </section>
    );
  }
  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <h2 className="text-branding text-2xl font-bold mb-8 text-center">
        Checkout
      </h2>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Order Summary */}
        <aside className="flex-1 md:max-w-xs md:sticky md:top-28 h-fit bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-branding mb-4">
            Order Summary
          </h3>
          <div className="flex flex-col gap-4 mb-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 border-b pb-3 last:border-b-0"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-14 h-14 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <div className="font-bold text-branding text-base">
                    {item.title}
                  </div>
                  <div className="text-sm text-gray-500">{item.price} EGP</div>
                  <div className="text-xs text-gray-400">Qty: {item.qty}</div>
                </div>
                <div className="font-bold text-branding">
                  {item.price * item.qty} EGP
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Product Total</span>
            <span>{subtotal} EGP</span>
          </div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Shipping Cost</span>
            <span>{cart.length > 0 ? shipping : 0} EGP</span>
          </div>
          <div className="flex items-center justify-between text-base font-bold border-t pt-2 mt-2">
            <span>Total</span>
            <span>{total} EGP</span>
          </div>
        </aside>
        {/* Right: Order Form */}
        <div className="flex-1">
          <OrderForm
            items={cart.map((item) => ({
              name: item.title,
              quantity: item.qty,
              price: item.price,
            }))}
            total={total}
            shipping={shipping}
            showCoupon={true}
            onSuccess={() => {
              setSubmitted(true);
              setCart([]);
            }}
          />
        </div>
      </div>
    </section>
  );
}

function CartDrawer({ open, onClose, cart, setCart, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, qty: Math.max(1, item.qty + delta) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-50 transition-opacity duration-300 ${
          open
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 max-w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ minWidth: 320 }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <h2 className="text-lg font-bold text-branding">Cart</h2>
            <button
              onClick={onClose}
              className="text-2xl text-gray-400 hover:text-branding"
            >
              <FiX />
            </button>
          </div>
          <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center space-y-2 justify-center h-full py-12">
                <div style={{ height: 120 }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 120 120"
                    width="120"
                    height="120"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <defs>
                      <clipPath id="__lottie_element_24">
                        <rect width="120" height="120" x="0" y="0"></rect>
                      </clipPath>
                    </defs>
                    <g clipPath="url(#__lottie_element_24)">
                      <g
                        transform="matrix(1,0,0,1,0,0)"
                        opacity="1"
                        style={{ display: 'block' }}
                      >
                        <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                          <g
                            opacity="1"
                            transform="matrix(1,0,0,1,60,83.33000183105469)"
                          >
                            <path
                              fill="#ccd1d9"
                              fillOpacity="1"
                              d=" M-32.143001556396484,-24.17099952697754 C-32.143001556396484,-24.17099952697754 -32.143001556396484,11.310999870300293 -32.143001556396484,11.310999870300293 C-32.143001556396484,11.310999870300293 -0.0010000000474974513,24.17099952697754 -0.0010000000474974513,24.17099952697754 C-0.0010000000474974513,24.17099952697754 32.14400100708008,11.310999870300293 32.14400100708008,11.310999870300293 C32.14400100708008,11.310999870300293 32.14400100708008,-24.17099952697754 32.14400100708008,-24.17099952697754 C32.14400100708008,-24.17099952697754 -32.143001556396484,-24.17099952697754 -32.143001556396484,-24.17099952697754z"
                            ></path>
                          </g>
                          <g
                            opacity="1"
                            transform="matrix(1,0,0,1,76.0719985961914,83.33000183105469)"
                          >
                            <path
                              fill="#e6e9ec"
                              fillOpacity="1"
                              d=" M-16.07200050354004,24.17099952697754 C-16.07200050354004,24.17099952697754 16.07200050354004,11.312000274658203 16.07200050354004,11.312000274658203 C16.07200050354004,11.312000274658203 16.07200050354004,-24.17099952697754 16.07200050354004,-24.17099952697754 C16.07200050354004,-24.17099952697754 -16.07200050354004,-24.17099952697754 -16.07200050354004,-24.17099952697754 C-16.07200050354004,-24.17099952697754 -16.07200050354004,24.17099952697754 -16.07200050354004,24.17099952697754z"
                            ></path>
                          </g>
                          <g
                            opacity="1"
                            transform="matrix(1,0,0,1,60,55.74800109863281)"
                          >
                            <path
                              fill="#f4f4f4"
                              fillOpacity="1"
                              d=" M12.855999946594238,-23.249000549316406 C12.855999946594238,-23.249000549316406 0,-16.604999542236328 0,-16.604999542236328 C0,-16.604999542236328 -12.857000350952148,-23.249000549316406 -12.857000350952148,-23.249000549316406 C-12.857000350952148,-23.249000549316406 -45,-6.640999794006348 -45,-6.640999794006348 C-45,-6.640999794006348 -32.14400100708008,0.0010000000474974513 -32.14400100708008,0.0010000000474974513 C-32.14400100708008,0.0010000000474974513 -45,6.644999980926514 -45,6.644999980926514 C-45,6.644999980926514 -12.857000350952148,23.249000549316406 -12.857000350952148,23.249000549316406 C-12.857000350952148,23.249000549316406 0,16.608999252319336 0,16.608999252319336 C0,16.608999252319336 12.855999946594238,23.249000549316406 12.855999946594238,23.249000549316406 C12.855999946594238,23.249000549316406 45,6.644999980926514 45,6.644999980926514 C45,6.644999980926514 32.143001556396484,0.0010000000474974513 32.143001556396484,0.0010000000474974513 C32.143001556396484,0.0010000000474974513 45,-6.640999794006348 45,-6.640999794006348 C45,-6.640999794006348 12.855999946594238,-23.249000549316406 12.855999946594238,-23.249000549316406z"
                            ></path>
                          </g>
                          <g opacity="1" transform="matrix(1,0,0,1,60,55.75)">
                            <path
                              fill="#ccd1d9"
                              fillOpacity="1"
                              d=" M-0.0010000000474974513,-16.60700035095215 C-0.0010000000474974513,-16.60700035095215 -32.143001556396484,-0.0020000000949949026 -32.143001556396484,-0.0020000000949949026 C-32.143001556396484,-0.0020000000949949026 -0.0010000000474974513,16.60700035095215 -0.0010000000474974513,16.60700035095215 C-0.0010000000474974513,16.60700035095215 32.14400100708008,-0.0020000000949949026 32.14400100708008,-0.0020000000949949026 C32.14400100708008,-0.0020000000949949026 -0.0010000000474974513,-16.60700035095215 -0.0010000000474974513,-16.60700035095215z"
                            ></path>
                          </g>
                        </g>
                      </g>
                      <g
                        transform="matrix(1,0,0,1,-0.75,-0.75)"
                        opacity="1"
                        style={{ display: 'block' }}
                      >
                        <g
                          opacity="1"
                          transform="matrix(1,0,0,1,67.87000274658203,37.63100051879883)"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fillOpacity="0"
                            strokeDasharray="2.028 2.028"
                            strokeDashoffset="0"
                            stroke="#9f9f9f"
                            strokeOpacity="1"
                            strokeWidth="1"
                            d=" M-7.382999897003174,24.760000228881836 C-11.086000442504883,21.489999771118164 -17.440000534057617,14.64900016784668 -13.005999565124512,9.324999809265137"
                          ></path>
                        </g>
                      </g>
                      <g
                        transform="matrix(1,0,0,1,-5.883602142333984,32.27805709838867)"
                        opacity="1"
                        style={{ display: 'block' }}
                      >
                        <g opacity="1" transform="matrix(1,0,0,1,0,0)">
                          <g
                            opacity="1"
                            transform="matrix(1,0,0,1,57.957000732421875,10.552000045776367)"
                          >
                            <path
                              fill="#fff"
                              fillOpacity="1"
                              d=" M0,-3.614000082015991 C1.996000051498413,-3.614000082015991 3.614000082015991,-1.996000051498413 3.614000082015991,0 C3.614000082015991,1.996000051498413 1.996000051498413,3.614000082015991 0,3.614000082015991 C-1.996000051498413,3.614000082015991 -3.614000082015991,1.996000051498413 -3.614000082015991,0 C-3.614000082015991,-1.996000051498413 -1.996000051498413,-3.614000082015991 0,-3.614000082015991z"
                            ></path>
                            <path
                              strokeLinecap="butt"
                              strokeLinejoin="miter"
                              fillOpacity="0"
                              strokeMiterlimit="10"
                              stroke="#868686"
                              strokeOpacity="1"
                              strokeWidth="0.7"
                              d=" M0,-3.614000082015991 C1.996000051498413,-3.614000082015991 3.614000082015991,-1.996000051498413 3.614000082015991,0 C3.614000082015991,1.996000051498413 1.996000051498413,3.614000082015991 0,3.614000082015991 C-1.996000051498413,3.614000082015991 -3.614000082015991,1.996000051498413 -3.614000082015991,0 C-3.614000082015991,-1.996000051498413 -1.996000051498413,-3.614000082015991 0,-3.614000082015991z"
                            ></path>
                          </g>
                          <g
                            opacity="1"
                            transform="matrix(1,0,0,1,64.1449966430664,9.605999946594238)"
                          >
                            <path
                              fill="#fff"
                              fillOpacity="1"
                              d=" M0.0010000000474974513,-2.5739998817443848 C1.4220000505447388,-2.5739998817443848 2.5739998817443848,-1.4220000505447388 2.5739998817443848,0 C2.5739998817443848,1.4220000505447388 1.4220000505447388,2.5739998817443848 0.0010000000474974513,2.5739998817443848 C-1.4210000038146973,2.5739998817443848 -2.5739998817443848,1.4220000505447388 -2.5739998817443848,0 C-2.5739998817443848,-1.4220000505447388 -1.4210000038146973,-2.5739998817443848 0.0010000000474974513,-2.5739998817443848z"
                            ></path>
                            <path
                              strokeLinecap="butt"
                              strokeLinejoin="miter"
                              fillOpacity="0"
                              strokeMiterlimit="10"
                              stroke="#868686"
                              strokeOpacity="1"
                              strokeWidth="0.7"
                              d=" M0.0010000000474974513,-2.5739998817443848 C1.4220000505447388,-2.5739998817443848 2.5739998817443848,-1.4220000505447388 2.5739998817443848,0 C2.5739998817443848,1.4220000505447388 1.4220000505447388,2.5739998817443848 0.0010000000474974513,2.5739998817443848 C-1.4210000038146973,2.5739998817443848 -2.5739998817443848,1.4220000505447388 -2.5739998817443848,0 C-2.5739998817443848,-1.4220000505447388 -1.4210000038146973,-2.5739998817443848 0.0010000000474974513,-2.5739998817443848z"
                            ></path>
                          </g>
                          <g
                            opacity="1"
                            transform="matrix(1,0,0,1,62.400001525878906,13.144000053405762)"
                          >
                            <path
                              fill="#868686"
                              fillOpacity="1"
                              d=" M-0.0010000000474974513,-1.8009999990463257 C0.9940000176429749,-1.8009999990463257 1.8009999990463257,-0.9950000047683716 1.8009999990463257,-0.0010000000474974513 C1.8009999990463257,0.9929999709129333 0.9940000176429749,1.8009999990463257 -0.0010000000474974513,1.8009999990463257 C-0.9950000047683716,1.8009999990463257 -1.8009999990463257,0.9929999709129333 -1.8009999990463257,-0.0010000000474974513 C-1.8009999990463257,-0.9950000047683716 -0.9950000047683716,-1.8009999990463257 -0.0010000000474974513,-1.8009999990463257z"
                            ></path>
                          </g>
                        </g>
                      </g>
                    </g>
                  </svg>
                </div>
                <h1 className="text-4xl font-bold">Empty Cart</h1>
                <p className="text-gray-500">You have no items in your cart</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border-b pb-3 last:border-b-0"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-14 h-14 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-branding text-base">
                      {item.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.price} EGP
                    </div>
                    <div className="flex items-center gap-1 mt-1 cart-item-quantity-counter">
                      <button
                        className="rounded-md border p-1.5 font-medium"
                        onClick={() => updateQty(item.id, -1)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                          className="h-4 w-4 text-gray-900"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.75 12a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </button>
                      <p className="m-0 w-10 self-center text-center">
                        {item.qty}
                      </p>
                      <button
                        className="rounded-md border p-1.5 font-medium"
                        onClick={() => updateQty(item.id, 1)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                          className="h-4 w-4 text-gray-900"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="font-medium ms-2"
                        onClick={() =>
                          setCart(cart.filter((i) => i.id !== item.id))
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                          className="h-5 w-5 text-red-600"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {cart.length > 0 && (
            <div className="p-4 border-t flex flex-col gap-2 flex-shrink-0 bg-white">
              <div className="flex items-center justify-between font-bold text-lg">
                <span>Total</span>
                <span>{total} EGP</span>
              </div>
              <button
                className="w-full bg-branding text-white rounded-lg py-2 font-semibold hover:bg-discount transition disabled:opacity-50"
                disabled={cart.length === 0}
                onClick={onCheckout}
              >
                Buy now
              </button>
              <button
                className="w-full mt-1 border border-branding text-branding rounded-lg py-2 font-semibold hover:bg-branding hover:text-white transition"
                onClick={onClose}
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default App;
