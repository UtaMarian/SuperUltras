
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Thread = require('../models/Thread');
const Comment = require('../models/Comment');
const User = require('../models/User');

// Create a new thread
router.post('/threads', async (req, res) => {
    try {
        const thread = new Thread({
            user: req.user.id,
            text: req.body.text
        });
        await thread.save();
        res.status(201).json(thread);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Get all threads
router.get('/threads', async (req, res) => {
    try {
        const threads = await Thread.find().populate('user', 'username').populate({path:'comments',populate:{path:"user",select:"username"}}).sort({ createdAt: -1 });
        res.status(200).json(threads);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a thread
router.delete('/threads/:id', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.id);
        if (thread.user.toString() !== req.user.id) {
            return res.status(403).json({ error: "You are not authorized to delete this thread." });
        }
        await Thread.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: "Thread deleted successfully." });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Add a comment to a thread
router.post('/threads/:id/comments', async (req, res) => {
    try {
        const comment = new Comment({
            user: req.user.id,
            text: req.body.text,
            thread: req.params.id
        });
        await comment.save();

        const thread = await Thread.findById(req.params.id);
        thread.comments.push(comment._id);
        await thread.save();

        res.status(201).json(comment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a comment
router.delete('/comments/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ error: "You are not authorized to delete this comment." });
        }
        await  Comment.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: "Comment deleted successfully." });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;