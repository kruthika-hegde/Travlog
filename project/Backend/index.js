const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const travelModel = require("./Models/travel"); // This imports travelModel
const entryModel = require('./Models/entry');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/travel_notes")
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  console.log("Received data:", { name, email, password }); // Debug log
  
  travelModel.create({ name, email, password })
    .then(travel => {
      console.log("Saved document:", travel); // Debug log
      res.status(201).json({
        message: 'User registered successfully',
        user: travel // Include the saved document
      });
    })
    .catch(err => {
      console.error("Error:", err);
      res.status(500).json({ error: err.message });
    });
});

// Add this after your register endpoint in index.js
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  travelModel.findOne({ email: email })
    .then(user => {
      if (user) {
        if (user.password === password) {
          res.status(200).json({ 
            message: 'Login successful',
            user: user
          });
        } else {
          res.status(401).json({ error: 'Incorrect password' });
        }
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

app.post('/save-travel-entry', (req, res) => {
  const { userEmail, title, content } = req.body;

  if (!userEmail || !title || !content) {
    return res.status(400).json({ error: "All fields are required." });
  }

  entryModel.create({ userEmail, title, content })
    .then(entry => {
      res.status(201).json({ message: "Entry saved successfully!", entry });
    })
    .catch(err => {
      console.error("Entry save error:", err);
      res.status(500).json({ error: err.message });
    });
});

app.get('/entries/:userEmail', (req, res) => {
  const { userEmail } = req.params;

  entryModel.find({ userEmail }).sort({ createdAt: -1 })
    .then(entries => res.status(200).json(entries))
    .catch(err => {
      console.error("Error fetching entries:", err);
      res.status(500).json({ error: err.message });
    });
});




app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
