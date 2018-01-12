var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

//----------------------------------------------------------------------------//
//---------------------- User Schema Setup -----------------------------------//
//----------------------------------------------------------------------------//

var UserSchema = new mongoose.Schema({
   username: {type:String, unique: true, required: true},
   password: String,
   avatar: String,
   firstName: String,
   lastName: String,
   email: {type:String, unique: true, required: true},
   resetPasswordToken: String,
   resetPasswordExpires: Date,
   isAdmin: {type: Boolean, default: false},
   author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
  
});

UserSchema.plugin(passportLocalMongoose);



module.exports = mongoose.model("User", UserSchema);