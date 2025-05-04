const express = require("express");
const app = express();
require('dotenv').config();
const ejsMate = require("ejs-mate");
const cors = require("cors");
const convertRoutes = require("./Routes/convertRoutes");
const authRoute = require("./Routes/authRoute");
const aboutus = require("./Routes/AboutusRoute");
const path = require('path');
const feedbackRoute = require('./Routes/feedbackRoute');
const mongoose = require('mongoose');
const session = require("express-session");
const flash = require('connect-flash');
const cookieParser = require("cookie-parser");
const Feedback = require("./models/feedback")
const methodOverride = require("method-override");
const { verifyUser} = require("./middleware/auth");

const Atlas_URL = process.env.ATLAS_URL;
const connectDB = async () => {
  try {
    await mongoose.connect(Atlas_URL);
    console.log(" MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); 
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
app.use(express.json()); 

app.use(cookieParser()); 
app.use(methodOverride("_method"));

// setup Session
app.use(
  session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false, 
      cookie: { secure: false, maxAge: 60 * 60 * 1000 }, // 1 hour session
  })
);

app.use(flash());
app.use(verifyUser);



// ROUTES

app.get("/",async(req, res) => {
  try {
    // Fetch latest feedback (max 10)
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(10).populate("user"); 
    res.render("index.ejs", { feedbacks , successMessage: req.flash('success'), errorMessage: req.flash('error') });
} catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).redirect("/"); 
}
});

 
app.use('/', convertRoutes);
app.use('/feedback',feedbackRoute);
app.use('/',authRoute);
app.use('/',aboutus);
app.get('/*',(req,res)=>{
  res.render("404");
})



app.listen(PORT, () => {
  console.log(` Server running on PORT:${PORT}`);
});

