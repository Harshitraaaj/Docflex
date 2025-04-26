const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookie = require('cookie-parser');
const User = require('../models/user')
const express = require('express');
const app = express();
// **SIGNUP**
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        // Generate JWT
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '8h'
        });

        //saves token in mongodb
        await user.save();

        //store jwt in cookie
        res.cookie('jwt', token);
        console.log(user);

        req.flash('success', 'Signup successful! Welcome.');

        res.status(201).redirect("/feedback");
    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong during signup.');
        res.redirect('/signup');
    }
};

// **LOGIN**
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

        console.log("logout successfull");

        await req.user.save();
        res.redirect("/");
    } catch (err) {
        res.status(500).send(err);
    }
};
