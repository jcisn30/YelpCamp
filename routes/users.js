//----------------------------------------------------------------------------//
//------------------------- Dependencies For Route ---------------------------//
//----------------------------------------------------------------------------//

var express  = require("express");
var router   = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var middleware = require("../middleware");

//----------------------------------------------------------------------------//
//--------------------------- Show User Profile ------------------------------//
//----------------------------------------------------------------------------//

router.get("/:id", function(req, res) {
   User.findById(req.params.id, function(err, foundUser){
       if(err || !foundUser)
       { 
           req.flash("error", "Specificed User not found!");
           return res.redirect("/campgrounds");   
       }
       Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
           if(err || !campgrounds)
       {req.flash("error", "Something went wrong");
        res.redirect("back");   
       }
       res.render("users/show", {user: foundUser, campgrounds: campgrounds, page: 'user'});
       });
   });
});

//----------------------------------------------------------------------------//
//---------------------------- Edit User Profile -----------------------------//
//----------------------------------------------------------------------------//

router.get("/:id/edit", middleware.checkUserOwnership, function(req, res) {
     User.findById(req.params.id, function(err, foundUser)
     { if(err || !foundUser)
        {
           req.flash("error", "Specificed User not found!"); 
           res.redirect("back");
        } else {
        res.render("users/edit", {user: foundUser, page: 'user'});
        }
     });
});

//----------------------------------------------------------------------------//
//---------------------------- Update User Profile ---------------------------//
//----------------------------------------------------------------------------//

router.put("/:id", function(req, res){
     var newData = {firstName: req.body.user.firstName, lastName: req.body.user.lastName, email: req.body.user.email, adminCode: req.body.user.adminCode};
  User.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, user){
     if(err || !user){
         res.redirect("back");
     } else{
         req.flash("success","Profile Updated!");
         res.redirect("/users/" + user._id);
     }
  });
});

//----------------------------------------------------------------------------//
//------------------------------- Exports Data -------------------------------//
//----------------------------------------------------------------------------//

module.exports = router;