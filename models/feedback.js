const { Schema, model } = require('mongoose');
const mongoose = require("mongoose");


const feedbackSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", required: true
    }, // Link to User
    message: {
        type: String,
        required: true
    },
    createdAt: { 
        type: Date, default: Date.now }
},
    
);




const Feedback = model("Feedback", feedbackSchema);

module.exports = Feedback;