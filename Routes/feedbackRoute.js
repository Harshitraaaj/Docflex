
const express = require('express');
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const Feedback = require("../models/feedback");
const user =require("../models/user")
const mongoose=require("mongoose");



router.get('/',authenticate,(req,res)=>{
    const name = req.user.name;
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    res.render('feedback.ejs',{  name, successMessage, errorMessage });
})

router.post('/',authenticate,(req,res)=>{
        const  message = req.body.feedback;
        const user = req.user._id;

        console.log("id and message ", message,user);
        console.log(req.body);
    
    const newfeedback = new Feedback({ message,user})
    newfeedback.save();
    res.redirect("/");

});

router.delete('/delete/:id',async(req,res)=>{
    try{
        
    const feedbackId = req.params.id;
    const userId = req.user;

        // Find the feedback by ID
        const feedback = await Feedback.findById(feedbackId);
        console.log(feedback);
        if (!feedback) {
            return res.status(404).json({ error: "Feedback not found" });
        }

        // Check if the logged-in user is the owner of the feedback
        if (feedback.user.toString() !== userId._id.toString()) {
            return res.status(403).json({ error: "Unauthorized! You can only delete your own feedback." });
        }
        
        // Delete the feedback
        await Feedback.findByIdAndDelete(feedbackId);
        console.log("deleted successfull");
        res.status(200).redirect('/');
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }

});


module.exports = router;