const express = require("express");
const { signup, login, logout } = require("../controller/authcontroller");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get('/signup',(req,res)=>{
    res.render("signup");
})

router.post("/signup", signup);

router.get('/login',(req,res)=>{
    res.render("login");
})
router.post("/login", login);
router.post("/logout",authenticate, logout);



module.exports = router;
