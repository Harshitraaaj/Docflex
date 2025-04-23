const express = require("express");
const router = express.Router();

router.get('/aboutus',(req,res)=>{
    res.render("Aboutus");
})

module.exports = router;