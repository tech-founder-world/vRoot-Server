const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const User    = require('../Schema/UserSchema');
const router  = express.Router();
const auth    = require('../middleware/auth');
const multer  = require('multer');
const { profileStorage } = require('../config/Cloudinarystorage');

// ✅ Cloudinary storage — profile pics seedha Cloudinary jaayengi
const upload = multer({ storage: profileStorage });

// ── REGISTER ──────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields required' });
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    await new User({ name, email, password: hashed }).save();
    res.status(201).json({ success: true, message: 'Account created' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── LOGIN ─────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Wrong password' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true, token,
      user: {
        _id: user._id, name: user.name, email: user.email,
        username: user.username, bio: user.bio, website: user.website,
        profilePic: user.profilePic, isPrivate: user.isPrivate,
        followers: user.followers, following: user.following,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ── GET MY PROFILE ────────────────────────────
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ── UPDATE PROFILE ────────────────────────────
// ✅ req.file.path = Cloudinary ka secure_url (full https link)
router.put('/profile', auth, upload.single('profilePic'), async (req, res) => {
  try {
    const { name, username, bio, website, gender, isPrivate } = req.body;
    const updateData = { name, username, bio, website, gender, isPrivate: isPrivate === 'true' };

    // ✅ Ab yeh poora Cloudinary URL hai, local path nahi
    if (req.file) updateData.profilePic = req.file.path;

    const updated = await User.findByIdAndUpdate(req.user.id, { $set: updateData }, { new: true }).select('-password');
    res.json({ success: true, user: updated });
  } catch (err) {
    console.log('Profile update error:', err.message);
    res.status(500).json({ success: false });
  }
});

// ── SEARCH USERS ✅ ───────────────────────────
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const users = await User.find({
      $or: [
        { name:     { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
      ]
    }).select('-password').limit(20);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ── FOLLOW / UNFOLLOW ─────────────────────────
router.post('/follow/:targetId', auth, async (req, res) => {
  try {
    const myId     = req.user.id;
    const targetId = req.params.targetId;
    if (String(myId) === String(targetId))
      return res.status(400).json({ success: false, message: "Can't follow yourself" });

    const me     = await User.findById(myId);
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ success: false });

    const alreadyFollowing = me.following.map(String).includes(String(targetId));
    if (alreadyFollowing) {
      me.following.pull(targetId);
      target.followers.pull(myId);
    } else {
      me.following.push(targetId);
      target.followers.push(myId);
    }
    await me.save();
    await target.save();
    res.json({ success: true, following: !alreadyFollowing });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ── UNFOLLOW ──────────────────────────────────
router.post('/unfollow/:targetId', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id,          { $pull: { following: req.params.targetId } });
    await User.findByIdAndUpdate(req.params.targetId,  { $pull: { followers: req.user.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ── FOLLOWERS LIST ────────────────────────────
router.get('/followers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('followers', 'name username profilePic followers');
    res.json({ success: true, followers: user.followers });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ── FOLLOWING LIST ────────────────────────────
router.get('/following', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('following', 'name username profilePic followers');
    res.json({ success: true, following: user.following });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ── OTHER USER PROFILE ────────────────────────
router.get('/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ success: false });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ── ALL USERS ─────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── LOGOUT ────────────────────────────────────
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

module.exports = router;