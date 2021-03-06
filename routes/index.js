//----------------------------------------------------------------------------//
//------------------------- Dependencies For Route ---------------------------//
//----------------------------------------------------------------------------//

var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var middleware = require("../middleware");
var request = require("request");

//----------------------------------------------------------------------------//
//---------------------- Index Route - Show Landing Page ---------------------//
//----------------------------------------------------------------------------//

router.get("/", function(req, res, err){
  
    res.render("landing");
 
    
});

//----------------------------------------------------------------------------//
//---------------------------- User Signup Form ------------------------------//
//----------------------------------------------------------------------------//


router.get("/register", function(req, res){
  res.render("register", {page: "register"});
});

//----------------------------------------------------------------------------//
//---------------------------- Create New User -------------------------------//
//----------------------------------------------------------------------------//


router.post("/register", function(req, res){
  const captcha = req.body["g-recaptcha-response"];
    if (!captcha) {
      console.log(req.body);
      req.flash("error", "Please select captcha");
      return res.redirect("/register");
    }
    // secret key
    // var secretKey = process.env.CAPTCHADEV;
    var secretKey = process.env.CAPTCHA;
    // Verify URL
    var verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}&remoteip=${req.connection.remoteAddress}`;
    // Make request to Verify URL
    request.get(verifyURL, (err, response, body) => {
      // if not successful
      if (body.success !== undefined && !body.success) {
        req.flash("error", "Captcha Failed");
        return res.redirect("/register");
      }
      
    var newUser = new User({
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            avatar: req.body.avatar
            
        });
    if(req.body.adminCode === process.env.ADMINCODE){
        newUser.isAdmin = true;
    }
   User.register(newUser, req.body.password, function(err, user){
       if(err){
           
            req.flash("error", err.message);
           return res.redirect("register");
       }
       passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome to YelpCamp" + " " + user.username);
           res.redirect("/campgrounds");
        });
    });
  });
});

//----------------------------------------------------------------------------//
//---------------------------- User Login Form -------------------------------//
//----------------------------------------------------------------------------//

router.get("/login", function(req, res){
    res.render("login", {page: "login"});
});


//----------------------------------------------------------------------------//
//---------------------------- User Login Handling ---------------------------//
//----------------------------------------------------------------------------//

//app.post("/login", middleware, callback)
router.post("/login", passport.authenticate("local", 
    {
        
        successRedirect: "/campgrounds", 
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: "Welcome to YelpCamp!"
    }), function(req, res){
    
});

//----------------------------------------------------------------------------//
//---------------------------- User Logout Handling --------------------------//
//----------------------------------------------------------------------------//

router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "You are logged out, see you next time!");
    res.redirect("/campgrounds");
});

//----------------------------------------------------------------------------//
//---------------------------- User Forgot Password Form ---------------------//
//----------------------------------------------------------------------------//

router.get('/forgot', function(req, res) {
  res.render('forgot');
});

//----------------------------------------------------------------------------//
//------------------------ User Forgot Password Handling ---------------------//
//----------------------------------------------------------------------------//

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
   
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'cisneros24@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'cisneros24@gmail.com',
        subject: 'YelpCamp Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});



router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});


router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'cisneros24@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'cisneros24@mail.com',
        subject: 'YelpCamp password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/campgrounds');
  });
});



//middle ware for user logged
// function isLoggedIn(req, res, next){
//     if(req.isAuthenticated()){
//         return next();
//     }
//     res.redirect("/login");
// }


//----------------------------------------------------------------------------//
//------------------------------- Exports Data -------------------------------//
//----------------------------------------------------------------------------//

module.exports = router;