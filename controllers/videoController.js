
const Video = require('../Schema/VideoSchema');

// ── Upload ────────────────────────────────────
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No video uploaded" });

    const userId = req.user?.id || req.body.userId;

    const video = new Video({
      title:       req.body.title,
      description: req.body.description,
      category:    req.body.category,
      tags:        req.body.tags,
      isPublic:    req.body.isPublic !== 'false',
      type:        req.body.type,
      userId,
    // videoController.js
videoUrl: req.file.path    // pehle: `/uploads/${req.file.filename}`
    });

    await video.save();

    // ✅ populate karo taaki userId.name aaye
    const populated = await Video.findById(video._id)
      .populate('userId', 'name username profilePic');

    res.status(201).json({ success: true, video: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};

// ── Get Reels ✅ populate userId ──────────────
exports.getReels = async (req, res) => {
  try {
    const reels = await Video.find({ type: 'reel', isPublic: true })
      .populate('userId', 'name username profilePic') // ✅ username milega
      .populate('comments.userId', 'name username profilePic')
      .sort({ createdAt: -1 });

    res.json({ success: true, videos: reels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Explore ────────────────────────────────────
exports.exploreVideos = async (req, res) => {
  try {
    const { search = '', category = '' } = req.query;
    const query = {
      isPublic: true,
      title: { $regex: search, $options: 'i' }
    };
    if (category && category !== 'All') query.category = category;

    const videos = await Video.find(query)
      .populate('userId', 'name username profilePic')
      .sort({ createdAt: -1 })
      .limit(40);

    res.json({ success: true, videos });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ── User ke reels (profile pe) ─────────────────
exports.getUserVideos = async (req, res) => {
  try {
    const { userId } = req.params;
    const reels = await Video.find({ userId, type: 'reel' })
      .populate('userId', 'name username profilePic')
      .sort({ createdAt: -1 });

    res.json({ success: true, reels, longVideos: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch user videos" });
  }
};

// ── Like / Unlike ──────────────────────────────
exports.toggleLike = async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ success: false });

    const userId = req.user.id;
    const liked  = video.likes.map(String).includes(String(userId));

    if (liked) video.likes.pull(userId);
    else       video.likes.push(userId);

    await video.save();
    res.json({ success: true, liked: !liked, likeCount: video.likes.length });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ── Save / Unsave ──────────────────────────────
exports.toggleSave = async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ success: false });

    const userId = req.user.id;
    const saved  = video.savedBy.map(String).includes(String(userId));

    if (saved) video.savedBy.pull(userId);
    else       video.savedBy.push(userId);

    await video.save();
    res.json({ success: true, saved: !saved });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ── Add Comment ────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ success: false });

    video.comments.push({ userId: req.user.id, text: req.body.text });
    await video.save();

    const updated = await Video.findById(req.params.videoId)
      .populate('comments.userId', 'name username profilePic');

    res.json({ success: true, comments: updated.comments });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ── Saved reels (profile pe) ───────────────────
exports.getSavedReels = async (req, res) => {
  try {
    const reels = await Video.find({ savedBy: req.user.id, type: 'reel' })
      .populate('userId', 'name username profilePic')
      .sort({ createdAt: -1 });

    res.json({ success: true, reels });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ── Long Videos ────────────────────────────────
exports.getLongVideos = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip  = (page - 1) * limit;
    const videos = await Video.aggregate([
      { $match: { type: 'long' } },
      { $sample: { size: 100 } },
      { $skip: skip },
      { $limit: limit }
    ]);
    res.json({ success: true, videos, page });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};