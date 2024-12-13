const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { validateEmail, validateNumberOfGuests } = require('./validationUtils'); // Import custom validation functions

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection (replace with your actual MongoDB URI)
mongoose.connect('mongodb+srv://sahilchhabra1551:v83T6YtW11Eg2oGo@cluster0.ga9vhez.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Define a Booking schema and model
const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true },
});

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
});

const Booking = mongoose.model('Booking', bookingSchema);
const Contact = mongoose.model('Contact', contactSchema);

// POST route for creating a booking
app.post('/api/book', async (req, res) => {
  try {
    const { name, email, date, time, guests } = req.body;

    // Validate required fields
    if (!name || !email || !date || !time || !guests) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Validate number of guests
    if (!validateNumberOfGuests(guests)) {
      return res.status(400).json({ message: 'Guests must be between 1 and 100.' });
    }

    // Create new booking
    const newBooking = new Booking({
      name,
      email,
      date,
      time,
      guests,
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booking successfully created' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error });
  }
});

// POST route for creating a contact message
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Create new contact message
    const newContact = new Contact({
      name,
      email,
      message,
    });

    await newContact.save();
    res.status(201).json({ message: 'Contact successfully created' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating contact', error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
