var mongoose        = require("mongoose");
var Campground      = require("./models/campground");
var Comment         = require("./models/comment");

var data = [
    {
        name: "Clouds Rest",
        image: "https://farm3.staticflickr.com/2551/3803274198_74e2e4c870.jpg",
        description: "Mattis duis rutrum ipsum quis arcu in duis vulputate et eu neque ultrices dictumst at. Erat dui aliquam. Ut consectetuer volutpat phasellus a id urna nascetur quis. Mauris orci diam vestibulum mollis fusce est non pellentesque. Nulla aliquam consequat. Ut nulla nulla neque ultrices elit. Parturient neque magna. Lorem metus vitae ipsum lorem odio. Tellus dolor fringilla. Lacus interdum justo. Et nibh faucibus libero consequat velit vel donec et pulvinar in aliquam curabitur pulvinar natoque nunc sit a vitae at neque. Amet duis at consequat con vel. Praesent tincidunt nisl. Facilisis eu lorem odio suscipit ut. Non ac erat. Pharetra ante ultricies. Donec aenean elit. Vitae sed ut nec nisl ultrices. Augue massa cras. Orci molestie scelerisque massa tincidunt sapien."
    },
    {
        name: "Desert Mesa",
        image: "https://farm5.staticflickr.com/4514/36822417253_1d7f340b3a.jpg",
        description: "Mattis duis rutrum ipsum quis arcu in duis vulputate et eu neque ultrices dictumst at. Erat dui aliquam. Ut consectetuer volutpat phasellus a id urna nascetur quis. Mauris orci diam vestibulum mollis fusce est non pellentesque. Nulla aliquam consequat. Ut nulla nulla neque ultrices elit. Parturient neque magna. Lorem metus vitae ipsum lorem odio. Tellus dolor fringilla. Lacus interdum justo. Et nibh faucibus libero consequat velit vel donec et pulvinar in aliquam curabitur pulvinar natoque nunc sit a vitae at neque. Amet duis at consequat con vel. Praesent tincidunt nisl. Facilisis eu lorem odio suscipit ut. Non ac erat. Pharetra ante ultricies. Donec aenean elit. Vitae sed ut nec nisl ultrices. Augue massa cras. Orci molestie scelerisque massa tincidunt sapien."
    },
    {
        name: "Canyon Floor",
        image: "https://farm8.staticflickr.com/7296/14059204725_7610d2cbb2.jpg",
        description: "Mattis duis rutrum ipsum quis arcu in duis vulputate et eu neque ultrices dictumst at. Erat dui aliquam. Ut consectetuer volutpat phasellus a id urna nascetur quis. Mauris orci diam vestibulum mollis fusce est non pellentesque. Nulla aliquam consequat. Ut nulla nulla neque ultrices elit. Parturient neque magna. Lorem metus vitae ipsum lorem odio. Tellus dolor fringilla. Lacus interdum justo. Et nibh faucibus libero consequat velit vel donec et pulvinar in aliquam curabitur pulvinar natoque nunc sit a vitae at neque. Amet duis at consequat con vel. Praesent tincidunt nisl. Facilisis eu lorem odio suscipit ut. Non ac erat. Pharetra ante ultricies. Donec aenean elit. Vitae sed ut nec nisl ultrices. Augue massa cras. Orci molestie scelerisque massa tincidunt sapien."
    }
    
    ]

function seedDB(){
Campground.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("remove campgrounds!");
                  //add a few campgrounds
            data.forEach(function(seed){
                Campground.create(seed, function(err, campground){
                if(err){
                    console.log(err);
                } else {
                    console.log("added a campground");
                    //create comment
                    Comment.create(
                        {
                            text: "This place is great but I wish there was internet",
                            author: "Homer"
                        }, function(err, comment){
                            if(err){
                                console.log(err);
                            } else{
                              campground.comments.push(comment);
                              campground.save();
                              console.log("Created new comment");
                            }
                            
                        });
                    
                }
            });
        });
    });
    
  
    
}

module.exports = seedDB;