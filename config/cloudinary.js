const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔍 TEMPORARY DEBUG — yeh confirm karega ki keys load hui ya nahi
// Isse server start karte hi terminal mein dikhega
console.log('🔍 Cloudinary Config Check:');
console.log('   cloud_name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Loaded' : '❌ MISSING');
console.log('   api_key:   ', process.env.CLOUDINARY_API_KEY ? '✅ Loaded' : '❌ MISSING');
console.log('   api_secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Loaded' : '❌ MISSING');

module.exports = cloudinary;