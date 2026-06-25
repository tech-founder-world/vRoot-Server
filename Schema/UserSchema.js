const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // ✅ Profile fields
    username: { type: String, trim: true, default: '' },
    bio: { type: String, default: '' },
    website: { type: String, default: '' },
    gender: { type: String, default: '' },
    profilePic: { type: String, default: '' },
    isPrivate: { type: Boolean, default: false },

    // ✅ Social
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Add these fields to your existing User schema

    // ... your existing fields (username, email, password, name, etc.)

    // ✅ ADD THESE 3 NEW FIELDS
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationOTP: {
        code: String,
        expiresAt: Date,
    },
    resetPasswordOTP: {
        code: String,
        expiresAt: Date,
    },

    // ... rest of your existing fields

}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;