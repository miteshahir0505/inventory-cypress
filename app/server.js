const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const seed = () => [
  { id: 1, name: 'Laptop', sku: 'LAP-001', price: 999, quantity: 10 },
  { id: 2, name: 'Mouse', sku: 'MOU-001', price: 25, quantity: 50 },
  { id: 3, name: 'Keyboard', sku: 'KEY-001', price: 75, quantity: 30 },
];
let products = seed();
let nextId = 4;

function isValid(b) {
  return (
    b &&
    typeof b.name === 'string' && b.name.trim() !== '' &&
    typeof b.sku === 'string' && b.sku.trim() !== '' &&
    Number.isFinite(Number(b.price)) && Number(b.price) >= 0 &&
    Number.isInteger(Number(b.quantity)) && Number(b.quantity) >= 0
  );
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === 'admin' && password === 'secret123') {
    return res.json({ token: 'fake-jwt-token' });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/products', (req, res) => res.json(products));

app.post('/api/products', (req, res) => {
  if (!isValid(req.body)) return res.status(400).json({ error: 'Invalid product data' });
  if (products.some((p) => p.sku === req.body.sku)) {
    return res.status(409).json({ error: 'SKU already exists' });
  }
  const product = {
    id: nextId++,
    name: req.body.name.trim(),
    sku: req.body.sku.trim(),
    price: Number(req.body.price),
    quantity: Number(req.body.quantity),
  };
  products.push(product);
  res.status(201).json(product);
});

app.put('/api/products/:id', (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Not found' });
  if (!isValid(req.body)) return res.status(400).json({ error: 'Invalid product data' });
  if (products.some((p) => p.sku === req.body.sku && p.id !== product.id)) {
    return res.status(409).json({ error: 'SKU already exists' });
  }
  Object.assign(product, {
    name: req.body.name.trim(),
    sku: req.body.sku.trim(),
    price: Number(req.body.price),
    quantity: Number(req.body.quantity),
  });
  res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
  const before = products.length;
  products = products.filter((p) => p.id !== Number(req.params.id));
  if (products.length === before) return res.status(404).json({ error: 'Not found' });
  res.status(204).end();
});

app.post('/api/reset', (req, res) => {
  products = seed();
  nextId = 4;
  res.status(204).end();
});

app.listen(3000, () => console.log('App running at http://localhost:3000'));