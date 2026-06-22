const Post = require('../Schema/PostSchema');

// ── Upload ───────────────────────────────────
exports.uploadPost = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image uploaded' });
    const post = new Post({
      userId:   req.user.id,
// postController.js
imageUrl: req.file.path,   // pehle: `/uploads/posts/${req.file.filename}`
      caption:  req.body.caption  || '',
      location: req.body.location || '',
      isPublic: req.body.isPublic !== 'false',
    });
    await post.save();
    const populated = await Post.findById(post._id).populate('userId', 'name username profilePic');
    res.status(201).json({ success: true, post: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

// ── Feed ─────────────────────────────────────
exports.getFeed = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const posts = await Post.find({ isPublic: true })
      .populate('userId', 'name username profilePic')
      .populate('comments.userId', 'name username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ── Search posts by caption / location ✅ ────
exports.searchPosts = async (req, res) => {
  try {
    const q = req.query.q || '';
    const posts = await Post.find({
      isPublic: true,
      $or: [
        { caption:  { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
      ]
    })
      .populate('userId', 'name username profilePic')
      .sort({ createdAt: -1 })
      .limit(30);
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ── Like ─────────────────────────────────────
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false });
    const liked = post.likes.map(String).includes(String(req.user.id));
    if (liked) post.likes.pull(req.user.id);
    else       post.likes.push(req.user.id);
    await post.save();
    res.json({ success: true, liked: !liked, likeCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ── Comment ───────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false });
    post.comments.push({ userId: req.user.id, text: req.body.text });
    await post.save();
    const updated = await Post.findById(req.params.postId).populate('comments.userId', 'name username profilePic');
    res.json({ success: true, comments: updated.comments });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ── Save ─────────────────────────────────────
exports.toggleSave = async (req, res) => {
  try {
    const post  = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false });
    const saved = post.savedBy.map(String).includes(String(req.user.id));
    if (saved) post.savedBy.pull(req.user.id);
    else       post.savedBy.push(req.user.id);
    await post.save();
    res.json({ success: true, saved: !saved });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ── User posts ────────────────────────────────
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId, isPublic: true })
      .populate('userId', 'name username profilePic')
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ── Saved posts ───────────────────────────────
exports.getSavedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ savedBy: req.user.id })
      .populate('userId', 'name username profilePic')
      .sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};