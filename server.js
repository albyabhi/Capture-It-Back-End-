const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const RoomRoutes = require('./routes/RoomRoutes');
const UserRoutes = require('./routes/UserRoutes');
const ImageRoutes = require('./routes/ImageRoutes')

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize the app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use('/room', RoomRoutes);
app.use('/user', UserRoutes);
app.use('/image', ImageRoutes);




// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
