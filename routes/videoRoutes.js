const express = require("express");
const auth    = require('../middleware/auth');
const multer  = require('multer');
const { videoStorage } = require('../config/Cloudinarystorage');
const {
  uploadVideo, getReels, getLongVideos,
  exploreVideos, getUserVideos,
  toggleLike, toggleSave, addComment, getSavedReels
} = require('../controllers/videoController');

const router = express.Router();

// ✅ Cloudinary storage — videos/reels seedha Cloudinary jaayenge
const upload = multer({ storage: videoStorage });

router.post('/upload',             auth, upload.single('video'), uploadVideo);
router.get('/reels',               getReels);
router.get('/long',                getLongVideos);
router.get('/explore',             exploreVideos);
router.get('/user/:userId',        getUserVideos);
router.get('/saved',               auth, getSavedReels);        // ✅ saved reels
router.post('/:videoId/like',      auth, toggleLike);           // ✅ like
router.post('/:videoId/save',      auth, toggleSave);           // ✅ save
router.post('/:videoId/comment',   auth, addComment);           // ✅ comment

module.exports = router;