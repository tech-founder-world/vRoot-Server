require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const bodyParser = require('body-parser');
const path       = require('path');
const fs         = require('fs');

const userRoutes  = require('./routes/userRoutes');
const videoRoutes = require('./routes/videoRoutes');
const postRoutes  = require('./routes/postRoutes'); // ✅ New

const app = express();

// ── Auto create upload folders ──
['uploads', 'uploads/posts', 'uploads/profiles'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Middleware ──
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Database ──
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// ── Routes ──
app.use('/api/users', userRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/posts', postRoutes); // ✅ New
// Add this test endpoint
app.get('/test-email', async (req, res) => {
  try {
    const { sendVerificationEmail } = require('./src/services/emailService');
    
    await sendVerificationEmail(
      'your-email@gmail.com',  // Your email to receive test
      'TestUser',              // Username
      '123456'                 // OTP
    );
    
    res.json({ 
      success: true, 
      message: '✅ Email sent successfully! Check your inbox.' 
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.json({ 
      success: false, 
      error: error.message 
    });
  }
});
const PORT = process.env.PORT || 9091;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));