const express = require('express');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const flash = require('express-flash');
const Swal = require('sweetalert2');
require('dotenv').config();

const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const productsRouter = require('./routes/products');
const userProfile = require('./routes/profile');
const cart = require('./routes/cart');
const couponRouter = require('./routes/coupon');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const oneday = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: oneday },
  })
);

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB is connected");

    // Set up view engine and static files
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/uploads', express.static("uploads"));

    // Routes
    app.use('/', userRouter);
    app.use('/admin', adminRouter);
    app.use('/products', productsRouter);
    app.use('/profile', userProfile);
    app.use('/cart', cart);
    app.use('/coupon', couponRouter);

    // Error handling middleware
    // app.use((req, res, next) => {
    //   next(createError(404)); // Forward to the error handler
    // });
    // app.use((err, req, res, next) => {
    //   res.locals.message = err.message;
    //   res.locals.error = req.app.get('env') === 'development' ? err : {};
    //   res.status(err.status || 500);
    //   res.render('errorPage/404error');
    // });

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

startServer();
