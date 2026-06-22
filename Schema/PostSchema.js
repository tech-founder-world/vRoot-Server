const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  caption:  { type: String, default: '' },
  location: { type: String, default: '' },

  likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text:    { type: String },
    createdAt: { type: Date, default: Date.now }
  }],

  savedBy:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPublic: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);