var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var geocoder = require("geocoder");

//Index Route - show all campgrounds
router.get("/", function(req, res){
    // get all campground for db
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else{
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    })
    // res.render("campgrounds", {campgrounds: campgrounds}); //{name of object: data being passed}
});


//CREATE Route - add a new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    //get data from form and add to campground array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newCampground = {name: name, price: price, image: image, description: desc, author: author, location: location, lat: lat, lng: lng};
    // campgrounds.push(newCampground);
    //creat new campground and save to database
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

//NEW Route - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new", {page: "campgrounds"});
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find campground with provided id
    // Campground.findById(req.params.id, function(err, foundCampground){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Camground not found");
            res.redirect("back");
        } else{
            console.log(foundCampground);
              //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
   
  
});

//Edit Campground Route
router.get("/:id/edit", middleware.checkCampgroundOwnership,function (req, res){
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

router.put("/:id", function(req, res){
  geocoder.geocode(req.body.campground.location, function (err, data) {
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.campground.name, image: req.body.campground.image, description: req.body.campground.description, price: req.body.campground.price, location: location, lat: lat, lng: lng};
    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});


//Destroy Camground Route
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


module.exports = router;