const express = require("express");
const { signup, login, logout } = require("../controller/authcontroller");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get('/signup',(req,res)=>{
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    res.render("signup",{successMessage, errorMessage});
})

router.post("/signup", signup);

router.get('/login',(req,res)=>{
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');
    res.render("login",{successMessage, errorMessage});
})
router.post("/login", login);
router.post("/logout",authenticate, logout);



module.exports = router;
