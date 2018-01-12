//----------------------------------------------------------------------------//
//------------------------- Dependencies For Route ---------------------------//
//----------------------------------------------------------------------------//

var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//----------------------------------------------------------------------------//
//-------------------------- Create New Comment Form -------------------------//
//----------------------------------------------------------------------------//

router.get("/new", middleware.isLoggedIn, function(req, res){
    //find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    });
     
});

//----------------------------------------------------------------------------//
//-------------------------- Create New Comment ------------------------------//
//----------------------------------------------------------------------------//

router.post("/", middleware.isLoggedIn, function(req, res){
    //lookup campground using id
    Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
           //create new comment
           Comment.create(req.body.comment, function(err, comment){
              if(err){
                  req.flash("error", "Something went wrong");
                  
                  console.log(err);
              } else {
                  //add username and id to comment
                  comment.author.id = req.user._id;
                  comment.author.username = req.user.username;
                  //save comment
                  comment.save();
                  //connect new comment to campground
                  campground.comments.push(comment);
                  campground.save();
                  //redirect to campground show page
                  console.log(comment);
                  req.flash("success", "Successfully added comment!");
                  res.redirect("/campgrounds/" + campground._id);
              }
           });
       }
    });
    
    
    
});

//----------------------------------------------------------------------------//
//-------------------------- Edit Comment ------------------------------------//
//----------------------------------------------------------------------------//

router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
       if(err){
           res.redirect("back");
       } else {
           res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
       }
    });
    });
    
    
});

//----------------------------------------------------------------------------//
//-------------------------- Update Comment ----------------------------------//
//----------------------------------------------------------------------------//

router.put("/:comment_id", function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, upatedComment){
       if(err){
           res.redirect("back");
       } else {
           res.redirect("/campgrounds/" + req.params.id);
       }
   });
});


//comment destroy route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   //findByIdAndRemocve
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
            req.flash("success", "Comment deteted!");
           res.redirect("/campgrounds/" + req.params.id);
       }
   })
});


// middle ware for user logged
// function isLoggedIn(req, res, next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     res.redirect("/login");
// }

// function checkCommentOwnership(req, res, next){
//     if(req.isAuthenticated()){
//             Comment.findById(req.params.comment_id, function(err, foundComment){
//         if(err){
//             res.redirect("back");
//         } else {
//             //does the user own campground?
//             if(foundComment.author.id.equals(req.user._id)) {
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