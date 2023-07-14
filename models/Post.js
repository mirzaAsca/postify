const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: String,
    date: { type: Date, default: Date.now },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: String,
    comments: [{ body: String, date: Date, author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }]
});

module.exports = mongoose.model('Post', PostSchema);
