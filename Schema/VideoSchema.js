// const mongoose = require("mongoose");

// const videoSchema = new mongoose.Schema({
//   title: { type: String },
//   description: { type: String },
//   videoUrl: { type: String, required: true },

//   category: String,
//   tags: String,

//   type: { 
//     type: String, 
//     enum: ['reel', 'long'], 
//     required: true 
//   },

//   isPublic: { type: Boolean, default: true },

//   userId: String,

//   views: { type: Number, default: 0 },
//   likes: { type: Number, default: 0 },

// }, { timestamps: true });

// module.exports = mongoose.model("Video", videoSchema);


const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title:       { type: String },
  description: { type: String },
  videoUrl:    { type: String, required: true },
  category:    { type: String },
  tags:        { type: String },

  type: {
    type: String,
    enum: ['reel', 'long'],
    required: true
  },

  isPublic: { type: Boolean, default: true },

  // ✅ ObjectId ref — populate ke liye
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  views:   { type: Number, default: 0 },
  likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // ✅ save feature

  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text:   { type: String },
    createdAt: { type: Date, default: Date.now }
  }],

}, { timestamps: true });

module.exports = mongoose.model("Video", videoSchema);