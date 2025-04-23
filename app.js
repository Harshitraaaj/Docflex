const express = require("express");
const app = express();
require('dotenv').config();
const ejsMate = require("ejs-mate");
const multer = require("multer");
const cors = require("cors");
const convertRoutes = require("./Routes/convertRoutes");
const authRoute = require("./Routes/authRoute");
const aboutus = require("./Routes/AboutusRoute");
const path = require('path');
const fs = require('fs');
const feedbackRoute = require('./Routes/feedbackRoute');
const userSchema = require('./models/user')
const mongoose = require('mongoose');
const session = require("express-session");
const cookieParser = require("cookie-parser");
const Feedback = require("./models/feedback")
const User = require("./models/user")
const methodOverride = require("method-override");
const { verifyUser} = require("./middleware/auth");

const MONGODB_URL =  'mongodb://localhost:27017/user';
const Atlas_URL = process.env.ATLAS_URL;
const connectDB = async () => {
  try {
    await mongoose.connect(Atlas_URL);
    console.log(" MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process on failure
  }
};

connectDB();



const PORT = process.env.PORT || 3000;





app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(cors());

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // ✅ Enables JSON body parsing
app.use(cookieParser()); // ✅ Enables req.cookies
app.use(methodOverride("_method"));
app.use(verifyUser);
// app.use(authenticate);

// **Setup Session**
app.use(
  session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true, //temporary set to true at end turn to false
      cookie: { secure: false, maxAge: 60 * 60 * 1000 }, // 1 hour session
  })
);



// //MULTER storage
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       return cb(null, './files')
//     },
//     filename: function (req, file, cb) {
      
//      const filename = `${Date.now()}-${file.originalname}`;
//       return cb(null, filename)
//     },
//   });
  
//   const upload = multer({ storage })


// ROUTES

app.get("/", async(req, res) => {
  try {
    // Fetch latest feedback (max 10)
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(10).populate("user"); 

    res.render("index.ejs", { feedbacks });
} catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).send("Internal Server Error");
}
});

app.get('/env-check', (req, res) => {
  res.json({
    cloudName: process.env.CLOUD_NAME,
    allEnv: process.env
  });
});


  
 
app.use('/', convertRoutes);
app.use('/feedback',feedbackRoute);
app.use('/',authRoute);
app.use('/',aboutus);
app.get('/*',(req,res)=>{
  res.render("404");
})


//Server Start
app.listen(PORT, () => {
  console.log(` Server running on PORT:${PORT}`);
});

