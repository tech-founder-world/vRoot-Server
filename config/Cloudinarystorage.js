const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

// ── Profile pictures ───────────────────────────
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'vroot/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
    public_id: (req, file) => `profile_${req.user.id}_${Date.now()}`,
  },
});

// ── Post images ────────────────────────────────
const postStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'vroot/posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1080, crop: 'limit' }],
    public_id: (req, file) => `post_${req.user.id}_${Date.now()}`,
  },
});

// ── Reels / videos ─────────────────────────────
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'vroot/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    public_id: (req, file) => `video_${req.user.id}_${Date.now()}`,
  },
});

module.exports = { profileStorage, postStorage, videoStorage };