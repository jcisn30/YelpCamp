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
    seedDB                  = require("./seeds");
    
mongoose.Promise = global.Promise;
//requiring routes
var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds"),
    indexRoutes          = require("./routes/index");

// mongoose.connect("mongodb://localhost/yelp_camp", {useMongoClient: true});
mongoose.connect("mongodb://yelpsa:N3bM3x!!@ds135747.mlab.com:35747/yelpcampnebmex", {useMongoClient: true});

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
        

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB(); //seed the database

//moment
app.locals.moment = require('moment');

//Passport Configurations
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

//middleware for current user
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/", indexRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("yelpcamp server has started");
});