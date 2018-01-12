//----------------------------------------------------------------------------//
//------------------------- Dependencies For App Start -----------------------//
//----------------------------------------------------------------------------//

var express                 = require("express"),
    app                     = express(),
    bodyParser              = require("body-parser"),
    mongoose                = require("mongoose"),
    flash                   = require("connect-flash"),
    passport                = require("passport"),
    localStrategy           = require("passport-local"),
    methodOverride          = require("method-override"),
    Campground              = require("./models/campground"),
    Comment                 = require("./models/comment"),
    User                    = require("./models/user"),
    seedDB                  = require("./seeds"),
    contactRoutes           = require("./routes/contact"),
    cors                    = require('cors'),
    multipart               = require('connect-multiparty');
    
   
//----------------------------------------------------------------------------//
//------------------------- ENV Config File Call -----------------------------//
//----------------------------------------------------------------------------//   
   
require('dotenv').config()

//----------------------------------------------------------------------------//
//-------------------------- Mongooose Promise -------------------------------//
//----------------------------------------------------------------------------//
    
mongoose.Promise = global.Promise;


//----------------------------------------------------------------------------//
//-------------------------------- Required Routes ---------------------------//
//----------------------------------------------------------------------------//

var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds"),
    indexRoutes          = require("./routes/index"),
    userRoutes          = require("./routes/users"),
    contactRoutes       = require("./routes/contact");


//----------------------------------------------------------------------------//
//------------------------- Database & Gmail Connection ----------------------//
//----------------------------------------------------------------------------//

var URL = process.env.DATABASEURL;
mongoose.connect(URL);
mongoose.connect(process.env.GMMAILPW);

//----------------------------------------------------------------------------//
//----------------------------- Body Parser ----------------------------------//
//----------------------------------------------------------------------------//

app.use(bodyParser.urlencoded({extended: true}));


//SCHEMA SETUP
// var campgroundSchema = new mongoose.Schema({
//     name: String,
//     image: String,
//     description: String
// });

// var Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create(
//     {
//         name: "Granite Hill", 
//         image: "https://farm4.staticflickr.com/3741/9586943706_b22f00e403.jpg",
//         description:"This is a huge granite hill. No water, no bathroom, just you and the great outdoors!"
        
//     }, function(err, campground){
//         if(err){
//             console.log(err);
//         } else {
//             console.log("campground has been created: ");
//             console.log(campground);
//         }
    
// });

// var campgrounds = [ //array
//             {name: "Salmon Creek", image: "https://farm7.staticflickr.com/6130/6012809980_039b1fdfca.jpg"}, //objects
//             {name: "Granite Hill", image: "https://farm4.staticflickr.com/3741/9586943706_b22f00e403.jpg"},
//             {name: "Mountain Goat Lake", image: "https://farm5.staticflickr.com/4383/37386589826_0218e35baa.jpg"}
//         ];
        
//----------------------------------------------------------------------------//
//------------------------------ View Engine ---------------------------------//
//----------------------------------------------------------------------------//

app.set("view engine", "ejs");

//----------------------------------------------------------------------------//
//------------------------- Public Directiory --------------------------------//
//----------------------------------------------------------------------------//
app.use(express.static(__dirname + "/public"));

//----------------------------------------------------------------------------//
//------------------------- Method Overide & Flash Messages ------------------//
//----------------------------------------------------------------------------//

app.use(methodOverride("_method"));
app.use(flash());


//seedDB(); //seed the database

//----------------------------------------------------------------------------//
//------------------------- Moments NPM --------------------------------------//
//----------------------------------------------------------------------------//

app.locals.moment = require('moment');

//----------------------------------------------------------------------------//
//------------------------- Passport Configuration ---------------------------//
//----------------------------------------------------------------------------//

app.use(require("express-session")({
    secret: "one love",
    resave: false,
    saveUninitialized: false
    }));
    
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//----------------------------------------------------------------------------//
//-------------------------- Current User Middleware -------------------------//
//----------------------------------------------------------------------------//


app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//----------------------------------------------------------------------------//
//----------------------------- Required Routes Paths ------------------------//
//----------------------------------------------------------------------------//

app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/", indexRoutes);
app.use("/contact", contactRoutes);
app.use("/users", userRoutes);


//----------------------------------------------------------------------------//
//------------------------------ Show 404 Page -------------------------------//
//----------------------------------------------------------------------------//

app.get("*", function(req,res) {
      res.render("404");    
});


//----------------------------------------------------------------------------//
//------------------------- Cloud9 Port and IP Start -------------------------//
//----------------------------------------------------------------------------//

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("yelpcamp server has started");
});