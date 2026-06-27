// const express = require('express');
// const bcrypt  = require('bcrypt');
// const jwt     = require('jsonwebtoken');
// const User    = require('../Schema/UserSchema');
// const router  = express.Router();
// const auth    = require('../middleware/auth');
// const multer  = require('multer');
// const { profileStorage } = require('../config/Cloudinarystorage');

// // ✅ Cloudinary storage — profile pics seedha Cloudinary jaayengi
// const upload = multer({ storage: profileStorage });



// // ── REGISTER ──────────────────────────────────
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password)
//       return res.status(400).json({ success: false, message: 'All fields required' });
//     if (await User.findOne({ email }))
//       return res.status(400).json({ success: false, message: 'Email already exists' });
//     const hashed = await bcrypt.hash(password, 10);
//     await new User({ name, email, password: hashed }).save();
//     res.status(201).json({ success: true, message: 'Account created' });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // ── LOGIN ─────────────────────────────────────
// router.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password)
//     return res.status(400).json({ success: false, message: 'Email and password required' });
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ success: false, message: 'User not found' });
//     const match = await bcrypt.compare(password, user.password);
//     if (!match) return res.status(401).json({ success: false, message: 'Wrong password' });
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//     res.json({
//       success: true, token,
//       user: {
//         _id: user._id, name: user.name, email: user.email,
//         username: user.username, bio: user.bio, website: user.website,
//         profilePic: user.profilePic, isPrivate: user.isPrivate,
//         followers: user.followers, following: user.following,
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // ── GET MY PROFILE ────────────────────────────
// router.get('/profile', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     if (!user) return res.status(404).json({ success: false });
//     res.json({ success: true, user });
//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// });

// // ── UPDATE PROFILE ────────────────────────────
// // ✅ req.file.path = Cloudinary ka secure_url (full https link)
// router.put('/profile', auth, upload.single('profilePic'), async (req, res) => {
//   try {
//     const { name, username, bio, website, gender, isPrivate } = req.body;
//     const updateData = { name, username, bio, website, gender, isPrivate: isPrivate === 'true' };

//     // ✅ Ab yeh poora Cloudinary URL hai, local path nahi
//     if (req.file) updateData.profilePic = req.file.path;

//     const updated = await User.findByIdAndUpdate(req.user.id, { $set: updateData }, { new: true }).select('-password');
//     res.json({ success: true, user: updated });
//   } catch (err) {
//     console.log('Profile update error:', err.message);
//     res.status(500).json({ success: false });
//   }
// });

// // ── SEARCH USERS ✅ ───────────────────────────
// router.get('/search', async (req, res) => {
//   try {
//     const q = req.query.q || '';
//     const users = await User.find({
//       $or: [
//         { name:     { $regex: q, $options: 'i' } },
//         { username: { $regex: q, $options: 'i' } },
//       ]
//     }).select('-password').limit(20);
//     res.json({ success: true, users });
//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// });

// // ── FOLLOW / UNFOLLOW ─────────────────────────
// router.post('/follow/:targetId', auth, async (req, res) => {
//   try {
//     const myId     = req.user.id;
//     const targetId = req.params.targetId;
//     if (String(myId) === String(targetId))
//       return res.status(400).json({ success: false, message: "Can't follow yourself" });

//     const me     = await User.findById(myId);
//     const target = await User.findById(targetId);
//     if (!target) return res.status(404).json({ success: false });

//     const alreadyFollowing = me.following.map(String).includes(String(targetId));
//     if (alreadyFollowing) {
//       me.following.pull(targetId);
//       target.followers.pull(myId);
//     } else {
//       me.following.push(targetId);
//       target.followers.push(myId);
//     }
//     await me.save();
//     await target.save();
//     res.json({ success: true, following: !alreadyFollowing });
//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// });

// // ── UNFOLLOW ──────────────────────────────────
// router.post('/unfollow/:targetId', auth, async (req, res) => {
//   try {
//     await User.findByIdAndUpdate(req.user.id,          { $pull: { following: req.params.targetId } });
//     await User.findByIdAndUpdate(req.params.targetId,  { $pull: { followers: req.user.id } });
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// });

// // ── FOLLOWERS LIST ────────────────────────────
// router.get('/followers', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).populate('followers', 'name username profilePic followers');
//     res.json({ success: true, followers: user.followers });
//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// });

// // ── FOLLOWING LIST ────────────────────────────
// router.get('/following', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).populate('following', 'name username profilePic followers');
//     res.json({ success: true, following: user.following });
//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// });

// // ── OTHER USER PROFILE ────────────────────────
// router.get('/user/:userId', async (req, res) => {
//   try {
//     const user = await User.findById(req.params.userId).select('-password');
//     if (!user) return res.status(404).json({ success: false });
//     res.json({ success: true, user });
//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// });

// // ── ALL USERS ─────────────────────────────────
// router.get('/', async (req, res) => {
//   try {
//     const users = await User.find().select('-password');
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // ── LOGOUT ────────────────────────────────────
// router.post('/logout', (req, res) => {
//   res.json({ success: true, message: 'Logged out' });
// });

// module.exports = router;


const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../Schema/UserSchema');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const { profileStorage } = require('../config/Cloudinarystorage');
// ✅ IMPORT THESE - Yeh missing the
const { generateOTP } = require('../utils/otpGenerator');
const { sendVerificationEmail, sendResetPasswordOTP } = require('../services/emailService');

// Cloudinary storage — profile pics
const upload = multer({ storage: profileStorage });

// ──────────────────────────────────────────────
// ✅ NEW: REGISTER WITH OTP
// ──────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        console.log('📥 Register request:', { name, email });
        
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields required' 
            });
        }

        // ✅ Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        
        if (existingUser) {
            console.log('⚠️ User already exists:', email);
            
            // Check if already verified
            if (existingUser.isEmailVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists. Please login.',
                    isVerified: true,
                });
            } else {
                // User exists but not verified
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered but not verified. Please verify your email.',
                    isVerified: false,
                    userId: existingUser._id,
                    email: existingUser.email,
                });
            }
        }

        // ✅ Hash password
        const hashed = await bcrypt.hash(password, 10);
        
        // ✅ Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // ✅ Create user
        const user = new User({
            name,
            email: email.toLowerCase(),
            password: hashed,
            isEmailVerified: false,
            emailVerificationOTP: {
                code: otp,
                expiresAt: otpExpiry,
            }
        });

        await user.save();
        console.log('✅ User created:', user._id);

        // ✅ Send email (don't await if it fails - just log)
        try {
            await sendVerificationEmail(email, name, otp);
            console.log('✅ Email sent to:', email);
        } catch (emailError) {
            console.error('❌ Email error:', emailError);
            // Continue even if email fails
        }

        // ✅ Send response
        res.status(201).json({
            success: true,
            message: 'User registered. Please verify your email.',
            userId: user._id,
            email: user.email,
        });
        
    } catch (err) {
        console.error('❌ Register error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error: ' + err.message 
        });
    }
});

// ──────────────────────────────────────────────
// ✅ NEW: VERIFY EMAIL OTP
// ──────────────────────────────────────────────
router.post('/verify-email', async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ success: false, message: 'Email already verified' });
        }

        if (!user.emailVerificationOTP || user.emailVerificationOTP.code !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        if (new Date() > user.emailVerificationOTP.expiresAt) {
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }

        user.isEmailVerified = true;
        user.emailVerificationOTP = undefined;
        await user.save();

        const token = jwt.sign(
            { id: user._id, userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Email verified successfully',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                bio: user.bio,
                website: user.website,
                profilePic: user.profilePic,
                isPrivate: user.isPrivate,
                followers: user.followers,
                following: user.following,
                isEmailVerified: user.isEmailVerified,
            }
        });
    } catch (err) {
        console.error('Verify email error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ──────────────────────────────────────────────
// ✅ NEW: RESEND OTP
// ──────────────────────────────────────────────
router.post('/resend-otp', async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ success: false, message: 'Email already verified' });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        user.emailVerificationOTP = {
            code: otp,
            expiresAt: otpExpiry,
        };

        await user.save();
        await sendVerificationEmail(user.email, user.name, otp);

        res.json({
            success: true,
            message: 'OTP sent successfully',
        });
    } catch (err) {
        console.error('Resend OTP error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ──────────────────────────────────────────────
// ✅ UPDATED: LOGIN WITH EMAIL VERIFICATION CHECK
// ──────────────────────────────────────────────
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ success: false, message: 'Email and password required' });

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // ✅ Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email first',
                userId: user._id,
                email: user.email,
            });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ success: false, message: 'Wrong password' });

        const token = jwt.sign(
            { id: user._id, userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true, token,
            user: {
                _id: user._id, name: user.name, email: user.email,
                username: user.username, bio: user.bio, website: user.website,
                profilePic: user.profilePic, isPrivate: user.isPrivate,
                followers: user.followers, following: user.following,
                isEmailVerified: user.isEmailVerified,
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ──────────────────────────────────────────────
// ✅ NEW: FORGOT PASSWORD
// ──────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email first',
            });
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        user.resetPasswordOTP = {
            code: otp,
            expiresAt: otpExpiry,
        };

        await user.save();
        await sendResetPasswordOTP(email, user.name, otp);

        res.json({
            success: true,
            message: 'OTP sent to your email',
            userId: user._id,
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ──────────────────────────────────────────────
// ✅ NEW: VERIFY RESET OTP
// ──────────────────────────────────────────────
router.post('/verify-reset-otp', async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.resetPasswordOTP || user.resetPasswordOTP.code !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        if (new Date() > user.resetPasswordOTP.expiresAt) {
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }

        res.json({
            success: true,
            message: 'OTP verified successfully',
        });
    } catch (err) {
        console.error('Verify reset OTP error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ──────────────────────────────────────────────
// ✅ NEW: RESET PASSWORD
// ──────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
    try {
        const { userId, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordOTP = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ──────────────────────────────────────────────
// ✅ EXISTING: GET MY PROFILE
// ──────────────────────────────────────────────
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ success: false });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// ──────────────────────────────────────────────
// ✅ EXISTING: UPDATE PROFILE
// ──────────────────────────────────────────────
router.put('/profile', auth, upload.single('profilePic'), async (req, res) => {
    try {
        const { name, username, bio, website, gender, isPrivate } = req.body;
        const updateData = { name, username, bio, website, gender, isPrivate: isPrivate === 'true' };

        if (req.file) updateData.profilePic = req.file.path;

        const updated = await User.findByIdAndUpdate(req.user.id, { $set: updateData }, { new: true }).select('-password');
        res.json({ success: true, user: updated });
    } catch (err) {
        console.log('Profile update error:', err.message);
        res.status(500).json({ success: false });
    }
});

// ──────────────────────────────────────────────
// ✅ EXISTING: SEARCH USERS
// ──────────────────────────────────────────────
router.get('/search', async (req, res) => {
    try {
        const q = req.query.q || '';
        const users = await User.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { username: { $regex: q, $options: 'i' } },
            ]
        }).select('-password').limit(20);
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// ──────────────────────────────────────────────
// ✅ EXISTING: FOLLOW / UNFOLLOW
// ──────────────────────────────────────────────
router.post('/follow/:targetId', auth, async (req, res) => {
    try {
        const myId = req.user.id;
        const targetId = req.params.targetId;
        if (String(myId) === String(targetId))
            return res.status(400).json({ success: false, message: "Can't follow yourself" });

        const me = await User.findById(myId);
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

// ──────────────────────────────────────────────
// ✅ EXISTING: UNFOLLOW
// ──────────────────────────────────────────────
router.post('/unfollow/:targetId', auth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { $pull: { following: req.params.targetId } });
        await User.findByIdAndUpdate(req.params.targetId, { $pull: { followers: req.user.id } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// ──────────────────────────────────────────────
// ✅ EXISTING: FOLLOWERS LIST
// ──────────────────────────────────────────────
router.get('/followers', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('followers', 'name username profilePic followers');
        res.json({ success: true, followers: user.followers });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// ──────────────────────────────────────────────
// ✅ EXISTING: FOLLOWING LIST
// ──────────────────────────────────────────────
router.get('/following', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('following', 'name username profilePic followers');
        res.json({ success: true, following: user.following });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// ──────────────────────────────────────────────
// ✅ EXISTING: OTHER USER PROFILE
// ──────────────────────────────────────────────
router.get('/user/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) return res.status(404).json({ success: false });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// ──────────────────────────────────────────────
// ✅ EXISTING: ALL USERS
// ──────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ──────────────────────────────────────────────
// ✅ EXISTING: LOGOUT
// ──────────────────────────────────────────────
router.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out' });
});




// routes/userRoutes.js
router.post('/change-password', auth, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Get user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ 
            success: true, 
            message: 'Password changed successfully' 
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});


module.exports = router;