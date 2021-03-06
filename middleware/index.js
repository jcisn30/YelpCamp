//----------------------------------------------------------------------------//
//------------------------- Middleware Dependencies --------------------------//
//----------------------------------------------------------------------------//

var Campground = require("../models/campground");
var Comment = require("../models/comment");
var User = require("../models/user");
var middlewareObj = {};

//----------------------------------------------------------------------------//
//--------------------- Check Campground User Ownership ----------------------//
//----------------------------------------------------------------------------//

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    
    if(req.isAuthenticated()){
            Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found!");
            res.redirect("/campgrounds");
        } else {
            //does the user own campground?
            if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                req.flash("error", "You don't have permission!");
                res.redirect("back");
            }
             
        }
    });
    } else {
             req.flash("error", "You must login to edit your campground!");
            res.redirect("back");
    }

}

//----------------------------------------------------------------------------//
//----------------------- Check Comment User Ownership -----------------------//
//----------------------------------------------------------------------------//

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
            Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err || !foundComment){
            req.flash("error", "Comment not found");
            res.redirect("back");
        } else {
            //does the user own campground?
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                next();
            } else {
                 req.flash("error", "You don't have permission!");
                res.redirect("back");
            }
             
        }
    });
    } else {
         req.flash("error", "You must login to edit your comment!");
            res.redirect("back");
        }
}

//----------------------------------------------------------------------------//
//----------------------- Check User Profile Ownership -----------------------//
//----------------------------------------------------------------------------//

middlewareObj.checkUserOwnership = function(req, res, next)
{
    if(req.isAuthenticated())
            {
                   User.findById(req.params.id, function(err, foundUser){
                   if(err || !foundUser){
                       req.flash("error", "Specific User not found!");
                       res.redirect("/campgrounds");        
                   } 
                   else {
                     if(foundUser._id.equals(req.user._id) || req.user.isAdmin)
                        { next(); 
                        } 
                     else {
                            // othwerwise, redirect
                            req.flash("error", "You don't have permission to do that!");
                            res.redirect("/campgrounds");
                           }
                   }         
                   });
            } else {
                  // if not, redirect
                  req.flash("error", "You need to be logged in to do that!");
                  res.redirect("/campgrounds");
                   }
};
        
    
//----------------------------------------------------------------------------//
//---------------------- Check If User Is Logged In --------------------------//
//----------------------------------------------------------------------------//

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must login!");
    res.redirect("/login");
}

module.exports = middlewareObj;