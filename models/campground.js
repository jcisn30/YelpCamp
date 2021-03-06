var mongoose = require("mongoose");

//----------------------------------------------------------------------------//
//---------------------- Campground Schema Setup -----------------------------//
//----------------------------------------------------------------------------//

var campgroundSchema = new mongoose.Schema({
    price: String,
    name: String,
    image: String,
    location: String,
    lat: Number,
    lng: Number,
    createdAt: {type: Date, default: Date.now},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    description: String,
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
        
        ]
});

module.exports = mongoose.model("Campground", campgroundSchema);