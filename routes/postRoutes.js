const express = require('express');
const auth    = require('../middleware/auth');
const multer  = require('multer');
const { postStorage } = require('../config/Cloudinarystorage');
const {
  uploadPost, getFeed, searchPosts,
  toggleLike, addComment, toggleSave,
  getUserPosts, getSavedPosts
} = require('../controllers/postController');

const router = express.Router();

// ✅ Cloudinary storage — post images seedha Cloudinary jaayengi
const upload = multer({ storage: postStorage });

router.get('/feed',             getFeed);
router.get('/search',           searchPosts);          // ✅ search
router.get('/saved',            auth, getSavedPosts);
router.get('/user/:userId',     getUserPosts);
router.post('/upload',          auth, upload.single('image'), uploadPost);
router.post('/:postId/like',    auth, toggleLike);
router.post('/:postId/comment', auth, addComment);
router.post('/:postId/save',    auth, toggleSave);

module.exports = router;