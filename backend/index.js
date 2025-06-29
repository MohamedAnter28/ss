const express = require('express');
const cors = require('cors');
const basicAuth = require('basic-auth');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const upload = multer();
const { v4: uuidv4 } = require('uuid');
const app = express();
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const Sentry = require('@sentry/node');
const { Parser } = require('json2csv');
app.use(cors());
app.use(express.json());
const PORT = 5000;

// Supabase setup
const supabaseUrl = 'https://zukdqnadjkvuibkbxwbm.supabase.co';
const supabaseServiceRoleKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1a2RxbmFkamt2dWlia2J4d2JtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTE0ODQzMSwiZXhwIjoyMDY2NzI0NDMxfQ.rn0-rC3rrvMfoFtH96O_9F3IdMeSsxLe9LUeQHPO3io';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Sentry setup (replace with your real DSN)
Sentry.init({ dsn: 'YOUR_SENTRY_DSN' });
app.use(Sentry.Handlers.requestHandler());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Joi schema for order validation
const orderSchema = Joi.object({
  customer: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{11}$/)
    .required(),
  address: Joi.string().min(5).required(),
  items: Joi.array()
    .items(
      Joi.object({
        id: Joi.number().required(),
        name: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().min(0).required(),
      })
    )
    .min(1)
    .required(),
  total: Joi.number().min(0).required(),
  payment: Joi.string().required(),
  notes: Joi.string().allow('').optional(),
  createdAt: Joi.string().optional(),
  transaction_image: Joi.string().allow('').optional(),
  coupon: Joi.string().allow('').optional(),
  government: Joi.string().allow('').optional(),
  country: Joi.string().allow('').optional(),
  mobile2: Joi.string().allow('').optional(),
});

// Simple API key middleware for delivery company
const DELIVERY_API_KEY = 'your-delivery-company-api-key';
function deliveryAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (apiKey === DELIVERY_API_KEY) return next();
  return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
}

function adminAuth(req, res, next) {
  const user = basicAuth(req);
  if (user && user.name === 'admin' && user.pass === 'yourpassword') {
    return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
  return res.status(401).send('Authentication required.');
}

app.get('/', (req, res) => {
  res.send('API is running...');
});

// GET orders (admin only)
app.get('/orders', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Failed to fetch orders', details: err.message });
  }
});

// GET active coupons
app.get('/coupons', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('code, discount')
      .eq('active', true);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Failed to fetch coupons', details: err.message });
  }
});

// POST: Upload transaction image to Supabase Storage
app.post(
  '/upload-transaction-image',
  upload.single('image'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `transaction_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('transaction-images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });
    if (error) {
      return res
        .status(500)
        .json({ error: 'Failed to upload image', details: error.message });
    }
    const { publicUrl } = supabase.storage
      .from('transaction-images')
      .getPublicUrl(fileName).data;
    res.json({ url: publicUrl });
  }
);

// POST order (public)
app.post('/orders', async (req, res) => {
  const { error: validationError } = orderSchema.validate(req.body);
  if (validationError)
    return res.status(400).json({ error: validationError.details[0].message });
  try {
    let order = req.body;
    // Set status based on payment method
    if (order.payment === 'cod') {
      order.status = 'New Order';
    } else if (order.payment === 'instapay' || order.payment === 'vodafone') {
      order.status = 'Pending';
    }
    // Generate unique tracker code
    order.tracker_code = uuidv4().split('-')[0].toUpperCase();
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(400).json({ error: 'Invalid order data', details: err.message });
  }
});

// GET order by tracker code (public)
app.get('/orders/track/:tracker_code', async (req, res) => {
  const { tracker_code } = req.params;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('tracker_code', tracker_code)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: 'Order not found', details: err.message });
  }
});

// PATCH order (admin only)
app.patch('/orders/:id', adminAuth, async (req, res) => {
  let { status } = req.body;
  const { id } = req.params;
  try {
    // Fetch current order to check its status
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;
    // If admin is approving a pending order, set to 'New Order'
    if (
      currentOrder &&
      currentOrder.status === 'Pending' &&
      status === 'Approved'
    ) {
      status = 'New Order';
    }
    // Add to status_history
    const newHistory = [
      ...(currentOrder.status_history || []),
      { status, changedAt: new Date().toISOString() },
    ];
    const { data, error } = await supabase
      .from('orders')
      .update({ status, status_history: newHistory })
      .eq('id', id)
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res
      .status(400)
      .json({ error: 'Failed to update order', details: err.message });
  }
});

// PATCH: Delivery company updates order status by tracker_code
app.patch(
  '/orders/update-status/:tracker_code',
  deliveryAuth,
  async (req, res) => {
    const { tracker_code } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    try {
      // Fetch current order
      const { data: currentOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('tracker_code', tracker_code)
        .single();
      if (fetchError) throw fetchError;
      // Add to status_history
      const newHistory = [
        ...(currentOrder.status_history || []),
        { status, changedAt: new Date().toISOString() },
      ];
      const { data, error } = await supabase
        .from('orders')
        .update({ status, status_history: newHistory })
        .eq('tracker_code', tracker_code)
        .select();
      if (error) throw error;
      if (!data || !data.length)
        return res.status(404).json({ error: 'Order not found' });
      res.json(data[0]);
    } catch (err) {
      res
        .status(400)
        .json({ error: 'Failed to update status', details: err.message });
    }
  }
);

// MOCK: Simulate delivery company status update (for testing)
app.post('/company-api/update-order', async (req, res) => {
  // This simulates the delivery company calling your API
  // Expects: { tracker_code, status, apiKey }
  const { tracker_code, status, apiKey } = req.body;
  if (apiKey !== DELIVERY_API_KEY)
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  if (!tracker_code || !status)
    return res
      .status(400)
      .json({ error: 'tracker_code and status are required' });
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('tracker_code', tracker_code)
      .select();
    if (error) throw error;
    if (!data || !data.length)
      return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order status updated by company', order: data[0] });
  } catch (err) {
    res
      .status(400)
      .json({ error: 'Failed to update status', details: err.message });
  }
});

// POST a new rating
app.post('/ratings', async (req, res) => {
  const { product_name, customer_name, rating, comment } = req.body;
  if (!product_name || !customer_name || !rating || !comment) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const { data, error } = await supabase
    .from('ratings')
    .insert([
      {
        product_name,
        customer_name,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      },
    ])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
});

// GET all ratings for a product by name
app.get('/ratings/:product_name', async (req, res) => {
  const { product_name } = req.params;
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('product_name', product_name)
    .order('createdAt', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET order history by email or phone
app.get('/orders/history', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Query is required.' });
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('createdAt', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Failed to fetch order history', details: err.message });
  }
});

// GET all ratings (admin only)
app.get('/ratings/all', adminAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .order('createdAt', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Export orders as CSV (admin only)
app.get('/orders/export-csv', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('orders').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const parser = new Parser();
  const csv = parser.parse(data);
  res.header('Content-Type', 'text/csv');
  res.attachment('orders.csv');
  res.send(csv);
});

// Export ratings as CSV (admin only)
app.get('/ratings/export-csv', adminAuth, async (req, res) => {
  const { data, error } = await supabase.from('ratings').select('*');
  if (error) return res.status(500).json({ error: error.message });
  const parser = new Parser();
  const csv = parser.parse(data);
  res.header('Content-Type', 'text/csv');
  res.attachment('ratings.csv');
  res.send(csv);
});

app.use(Sentry.Handlers.errorHandler());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
