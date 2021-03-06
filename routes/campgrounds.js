//----------------------------------------------------------------------------//
//------------------------- Dependencies For Route ---------------------------//
//----------------------------------------------------------------------------//

var express = require("express");
var router = express.Router();
var app = express();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var geocoder = require("geocoder");
var multer = require('multer');
var cloudinary = require('cloudinary');
var cors = require('cors');
var multipart = require('connect-multiparty');
var bodyParser = require("body-parser");



//----------------------------------------------------------------------------//
//----------------------------- Multer Code ----------------------------------//
//----------------------------------------------------------------------------//

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

//----------------------------------------------------------------------------//
//--------------------------- Moderate Image ---------------------------------//
//----------------------------------------------------------------------------//

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));


//----------------------------------------------------------------------------//
//---------------------------- Cloudinary Code -------------------------------//
//----------------------------------------------------------------------------//

cloudinary.config({ 
  cloud_name: 'dux6bkfas', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


//----------------------------------------------------------------------------//
//--------------------------- Search Function --------------------------------//
//----------------------------------------------------------------------------//

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


//----------------------------------------------------------------------------//
//---------------------- Index Route - Show All Campgrounds ------------------//
//----------------------------------------------------------------------------//

router.get("/", function(req, res){
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.count({name: regex}).exec(function (err, count) {
                if (err || !allCampgrounds) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if(allCampgrounds.length < 1) {
                        noMatch = "No campgrounds match that query, please try again.";
                    }
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: req.query.search
                    });
                }
            });
        });
    } else {
        // get all campgrounds from DB
        Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.count().exec(function (err, count) {
                if (err || !allCampgrounds) {
                    console.log(err);
                } else {
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: false
                    });
                }
            });
        });
    }
});




//----------------------------------------------------------------------------//
//-------------------------- Create New Campground ---------------------------//
//----------------------------------------------------------------------------//

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
    

    //get data from form and add to campground array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image ? req.body.image : "/images/temp.png";
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    
    //Location Code - Geocode Package
    geocoder.geocode(req.body.campground.location, function (err, data) {
    if (err || data.status === 'ZERO_RESULTS') {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    
   
  
    cloudinary.v2.uploader.upload(req.file.path, {moderation: "aws_rek"}, function(err,result) {
        
  // add cloudinary url for the image to the campground object under image property
    req.body.campground.image = result.secure_url;
    
    
    
    
    
     
  // add author to campground
    req.body.campground.author = {
    id: req.user._id,
    username: req.user.username
  }
   //Captures All Objects And Stores Them  
    var newCampground = {name: req.body.campground.name, image: req.body.campground.image, description: req.body.campground.description, price: req.body.campground.price, author: req.body.campground.author, location: location, lat: lat, lng: lng}; 


// Campground.create(req.body.campground, function(err, campground) {
//         if (err) {
//           req.flash('error', err.message);
//           return res.redirect('back');
//         }
//         res.redirect('/campgrounds/' + campground.id);
//       });
//     });
//     });
// });
            //creat new campground and save to database
            // campgrounds.push(newCampground);
            Campground.create(newCampground, function(err, newlyCreated){
                if(err){
                    console.log(err);
                } else{
                     //redirect back to campgrounds page
                    res.redirect("/campgrounds");
                }
            });
        });
    });
 });


//----------------------------------------------------------------------------//
//---------------------------- New Campground Form ---------------------------//
//----------------------------------------------------------------------------//

router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new", {page: "campgrounds"});
});


//----------------------------------------------------------------------------//
//------------------- SHOW ROUTE - Displays Specific Camp --------------------//
//----------------------------------------------------------------------------//


router.get("/:id", function(req, res){
    //find campground with provided id
    // Campground.findById(req.params.id, function(err, foundCampground){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Camground not found");
            res.redirect("/campgrounds");
        } else{
            
              //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
   
  
});



//----------------------------------------------------------------------------//
//-------------------------------- CRUD Routes -------------------------------//
//----------------------------------------------------------------------------//


//----------------------------------------------------------------------------//
//-------------------------- Edit Campground Route ---------------------------//
//----------------------------------------------------------------------------//

router.get("/:id/edit", middleware.checkCampgroundOwnership,  function (req, res){
    // //is user logged in
    //     if(req.isAuthenticated()){
            Campground.findById(req.params.id, function(err, foundCampground){
        // if(err){
        //     res.redirect("/campgrounds");
        // } else {
            //does the user own campground?
            // if(foundCampground.author.id.equals(req.user._id)) {
                res.render("campgrounds/edit", {campground: foundCampground});
            // } else {
                // res.send("You do not have permission");
            // }
             
        // }
    });
        // } else {
        //     console.log("must be logged in to edit");
        //     res.send("must be logged in to edi");
        // }
    
  
});

//Update Campground Route
// router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
//     //find and update the correct campground
//     Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
//       if(err){
//           res.redirect("/campgrounds");
//       } else { //redirect to show page
//           res.redirect("/campgrounds/" + req.params.id);
//       } 
       
//     });
    
// });

//----------------------------------------------------------------------------//
//--------------------------- Campground Update Route ------------------------//
//----------------------------------------------------------------------------//

router.put("/:id", upload.single('campground[image]'),  function(req, res){
  geocoder.geocode(req.body.campground.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    cloudinary.v2.uploader.upload(req.file.path, {moderation: "aws_rek"}, function(err,result) {
        
  // add cloudinary url for the image to the campground object under image property
    req.body.campground.image = result.secure_url;
    
    var newData = {name: req.body.campground.name, image: req.body.campground.image, description: req.body.campground.description, price: req.body.campground.price, location: location, lat: lat, lng: lng};
    Campground.findByIdAndUpdate(req.params.id, {$set: newData},  function(err, campground){
         
         
    
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
           
    
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
        
        });
    });
  });
});


//----------------------------------------------------------------------------//
//-------------------------- Destory Campground Route ------------------------//
//----------------------------------------------------------------------------//

router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/campgrounds");
       } else {
            req.flash("success", "Campground has been deleted!");
           res.redirect("/campgrounds");
       }
    });
});

//middle ware for user logged
// function isLoggedIn(req, res, next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     res.redirect("/login");
// }

// function checkCampgroundOwnership(req, res, next){
//     if(req.isAuthenticated()){
//             Campground.findById(req.params.id, function(err, foundCampground){
//         if(err){
//             res.redirect("back");
//         } else {
//             //does the user own campground?
//             if(foundCampground.author.id.equals(req.user._id)) {
//                 next();
//             } else {
//                 res.redirect("back");
//             }
             
//         }
//     });
//     } else {
//             res.redirect("back");
//         }
    
  
// }



//----------------------------------------------------------------------------//
//------------------------------- Exports Data -------------------------------//
//----------------------------------------------------------------------------//

module.exports = router;