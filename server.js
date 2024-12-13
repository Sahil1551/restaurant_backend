const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { validateEmail, validateNumberOfGuests } = require('./validationUtils'); // Import custom validation functions
const dotenv=require('dotenv')
  dotenv.config()
const nodemailer=require('nodemailer')

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
const tranporter=nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.gmail,
        pass: process.env.password
    }
})
tranporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log('Server is ready to take our messages');
    }
});
// MongoDB connection (replace with your actual MongoDB URI)
mongoose.connect(process.env.mongodb_uri, { useNewUrlParser: true, useUnifiedTopology: true })
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
    const sendBookingConfirmationEmail = (newbooking, bookingDetails) => {
      
    
      const mailOptions = {
        from:process.env.gmail ,
        to: newbooking.email,
        subject: 'Table Booking Confirmation',
        html: `
          <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <h1 style="text-align: center; color: #4CAF50; font-size: 24px; margin-bottom: 20px;">🎉 Booking Confirmation 🎉</h1>
            <p style="font-size: 16px; color: #333;">Hello <strong>${newbooking.username}</strong>,</p>
            <p style="font-size: 16px; color: #333;">Thank you for choosing Bliss Bakers! We are excited to confirm your table booking. Here are your booking details:</p>
            
            <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
              <p style="font-size: 16px; color: #333;"><strong>Booking ID:</strong> ${bookingDetails._id}</p>
              <p style="font-size: 16px; color: #333;"><strong>Date:</strong> ${bookingDetails.date}</p>
              <p style="font-size: 16px; color: #333;"><strong>Time:</strong> ${bookingDetails.time}</p>
              <p style="font-size: 16px; color: #333;"><strong>Guests:</strong> ${bookingDetails.guests}</p>
            </div>
            
            
            <p style="font-size: 14px; color: #666;">If you need to make any changes to your booking, please don't hesitate to contact us.</p>
            <p style="font-size: 14px; color: #666;">Best regards,</p>
            <p style="font-size: 14px; color: #666;"><strong>Bliss Bakers Team</strong></p>
          </div>
    
          <script>
            document.querySelector('a').addEventListener('mouseover', function() {
              this.style.backgroundColor = '#45a049';
              this.style.transform = 'scale(1.05)';
            });
            document.querySelector('a').addEventListener('mouseout', function() {
              this.style.backgroundColor = '#4CAF50';
              this.style.transform = 'scale(1)';
            });
          </script>
        `,
      };
    
      tranporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Booking confirmation email sent: %s', info.response);
      });
    };
    
    const bookingDetails = {
      _id: "12345",
      date: "2024-12-15",
      time: "19:00",
      guests: 4,
    };
    
    sendBookingConfirmationEmail(newBooking, bookingDetails);
    
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
