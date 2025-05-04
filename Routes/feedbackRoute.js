
const express = require('express');
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const Feedback = require("../models/feedback");




router.get('/',authenticate,(req,res)=>{
    const name = req.user.name;
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    res.render('feedback.ejs',{  name, successMessage, errorMessage });
})

router.post('/', authenticate, (req, res) => {
    const message = req.body.feedback;
    const user = req.user._id;

    const newFeedback = new Feedback({ message, user });
    
    newFeedback.save()
      .then(() => {
          req.flash('success', 'Feedback submitted successfully!');
          res.redirect('/');
      })
      .catch((err) => {
          console.error(err);
          req.flash('error', 'Something went wrong. Please try again.');
          res.redirect('/');
      });
});


router.delete('/delete/:id', async (req, res) => {
    try {
        const feedbackId = req.params.id;
        const userId = req.user;

        // Find the feedback by ID
        const feedback = await Feedback.findById(feedbackId);
        if (!feedback) {
            return res.status(404).json({ error: "Feedback not found" });
        }

        // Check ownership
        if (feedback.user.toString() !== userId._id.toString()) {
            return res.status(403).json({ error: "Unauthorized! You can only delete your own feedback." });
        }

        // Delete the feedback
        await Feedback.findByIdAndDelete(feedbackId);

        // Flash success and redirect
        req.flash('success', 'Feedback deleted successfully!');
        res.redirect('/');
        
    } catch (error) {
        console.error("Error deleting feedback:", error);
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect('/');
    }
});



module.exports = router;