require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const seedAdmin = require('./config/seedAdmin');
const authRoutes = require('./routes/authRoutes');
const milkRoutes = require('./routes/milkRoutes');
const curdRoutes = require('./routes/curdRoutes');
const reportRoutes = require('./routes/reportRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', authRoutes);
app.use('/api/milk', milkRoutes);
app.use('/api/curd', curdRoutes);
app.use('/api', reportRoutes);
app.use('/api', buyerRoutes);

app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  await seedAdmin();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
