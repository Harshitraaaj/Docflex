const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookie = require('cookie-parser');
const Feedback = require('../models/feedback');
const User = require('../models/user')
const express = require('express');
const app = express();

// SIGNUP
exports.signup = async (req, res) => {
    try {

       
        const { name, email, password } = req.body;

       // Check if email already exists
       const existingUser = await User.findOne({ email: email });
       if (existingUser) {
           req.flash('error', 'Email already exists.');
           return res.status(400).redirect('/signup');
       }


        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword });

        // Generate JWT
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '8h'
        });

        user.tokens.push({ token }); 
        await user.save();
        

        //store jwt in cookie
        res.cookie('jwt', token);
        console.log(user);


        req.flash('success', 'Signup successful! Welcome.');

        const successMessage = req.flash('success');
        const errorMessage = req.flash('error');
        

        res.render("feedback",{LoggedIn:true ,successMessage, errorMessage,  name: user.name });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong during signup.');
        res.redirect('/signup');
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });


        if (!user){
            req.flash('error', 'Invalid email or password.');
             return res.status(401).redirect('/login');
            
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            req.flash('error', 'Invalid email or password.');
             return res.status(401).redirect('/login');
        }



        // Generate JWT
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '8h'
        });

        //saves token in mongodb
        // Append the new token to the user's token array
        user.tokens.push({ token });
        await user.save();

        //store jwt in cookie
        res.cookie('jwt', token);

        req.flash('success', 'Logged in successfully.');
        res.redirect('/feedback');




    } catch (error) {
        console.error(error);
    req.flash('error', 'Server error. Try again.');
    res.redirect('/login');
    }
};

// LOGOUT
exports.logout = async (req, res) => {
    try {

        req.user.tokens = req.user.tokens.filter((currElem) => {
            return currElem.token !== req.token;
        })

        res.clearCookie("jwt");
        await req.user.save();

        // ✅ Clear login state manually
        req.isLoggedIn = false;
        req.user = null;
        res.locals.LoggedIn = false;
        res.locals.user = null;

        console.log("logout successfull");

        const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(10).populate("user"); 

        // Set flash message before redirect
        req.flash('success', 'You have been logged out successfully.');

        
        res.render("index.ejs", { feedbacks, successMessage: req.flash('success'), errorMessage: req.flash('error') });
    } catch (err) {
        req.flash('error', 'Server error. Try again.');
        res.status(500).send(err);
    }
};
