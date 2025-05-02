const jwt = require("jsonwebtoken");
const User = require("../models/user")


// Middleware 1: Only checks if user is logged in (No blocking)
exports.verifyUser = async (req, res, next) => {
    const token = req.cookies.jwt;
    console.log(token);

    if (!token) {
        req.isLoggedIn = false;
        req.user = null;
        res.locals.LoggedIn = false;  // Make it available in EJS
        res.locals.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ _id: decoded.id, "tokens.token": token });

        
        if (user) {
            req.isLoggedIn = true;
            req.user = user;
            res.locals.LoggedIn = true;  // Store in `res.locals`
            res.locals.user = user._id.toString();
        } else {
            req.isLoggedIn = false;
            req.user = null;
            res.locals.LoggedIn = false;
            res.locals.user = null;
        }
    } catch (error) {
        req.isLoggedIn = false;
        req.user = null;
        res.locals.LoggedIn = false;
        res.locals.user = null;
    }

    next();
};


exports.authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.jwt

        if (!token) {
            return res.redirect("/login"); // Redirect if no token
        }

        // Verify JWT
        const verifyuser = jwt.verify(token, process.env.JWT_SECRET); //If token is verified then it return a object where different options present

        const user = await User.findOne({ _id: verifyuser.id })//finding user in the DB and 

        req.user = user;
        req.token = token;//storing this in req.user so that we can use in different page

        res.locals.LoggedIn = true;
        res.locals.user = user._id.toString();
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.redirect("/login"); // ✅ Redirect on token expiry
        } else {
            return res.status(401).json({ error: "Unauthorized access" });
        }
    }

};
