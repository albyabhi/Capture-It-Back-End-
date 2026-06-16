const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const RoomRoutes = require('./routes/RoomRoutes');
const UserRoutes = require('./routes/UserRoutes');
const ImageRoutes = require('./routes/ImageRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize the app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/room', RoomRoutes);
app.use('/user', UserRoutes);
app.use('/image', ImageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// ============================================================
// PURPOSE: The main entry point - starts the entire backend server.
// HOW IT WORKS:
//   1. Loads environment variables from .env (PORT, MONGO_URI, secrets).
//   2. Connects to MongoDB via config/db.js.
//   3. Creates an Express app and configures middleware:
//      - CORS: Allows the frontend to make requests to this server.
//      - JSON parser: Reads JSON bodies up to 10MB.
//      - URL encoder: Reads form data from requests.
//   4. Mounts route groups:
//      - /room  -> RoomRoutes.js  (create/check rooms)
//      - /user  -> UserRoutes.js  (login/auth users)
//      - /image -> ImageRoutes.js (upload/fetch images)
//   5. Provides a /health endpoint to check if the server is alive.
//   6. Starts listening on PORT 5000 (or the port set in .env).
//
//   Data flow: Frontend -> Express (this file) -> routes -> models -> MongoDB
//                                          \-> Cloudinary (for images)
// ============================================================
