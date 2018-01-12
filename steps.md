Version 1
*Add landing page
*Add campgrounds page that list all campgrounds

Each campground has:
*Name
*Image


#Layout and Basic Styling
*Create our header and footer partials
*Add in bootstrap


#Creating New Campground
*Setup new campground POST route
*Add in body-parser
*Setup route to show form
*Add basic unstyled form


#Style campgrounds page
*Add a better header / title
*Make a campgrounds display in a grid

#Style the Navbar and Form
*Add a navbar to all templates
*Style the new campground form

#Add Mongoose
*Install and configure mongoose
*Setup campground model
*Use campground model inside of our routes

#Show Page
*Review the RESTful routes we've see so form
*Add description to our campground model
*Show db.collection.drop()
*Add a show route/template

#Refactor Mongoose Code
*Create a models directory
*Use model.exports
*Rquire everything correctly

#Add Seeds File
*Add a seeds.js file
*Run the seeds file every time the server starts

#Add the Comment Model
*Make our errors go away
*Display comments on campground show page

#Comment New/Create
*Discuss nested routes - setup routes on top current routes
*Add the comment new and create routes
*Add the new comment form

#Style Show Page
*Add sidebar to show page
*Display comments nicely

#Add User Model
*Install all packages needed for auth - npm install passport passport-local passport-local-mongoose express-session --save
*Define User model

##Auth pt. 2 - Register
*Configure Passport
*Add register routes
*Add register template

##Auth pt. 3 - Login
*Add login routes
*Add login template

##Auth pt. 4 Logout/Navbar
*Add logout route
*Prevent user from adding a comment if not signed in
*Add links to navbar
*Show/hide auth links correctly

##Auth pt. 5 Show/Hide links
*Show/hide auth links in navbar correctly

##Refactor the routes
*Use Express router to reorangize routes

##Users + Comments
*Associate users and comments
*Save author's name to a comment automatically

##Editing Campgrounds
*Add Method-Override
*Add Edit route for campgrounds
*Add Link to Edit page
*Add update route
*Fix $set problem

##Deleting Campgrounds
*Add Destroy route
*Add Delete button

#Authorization
*User can only edit his/her campgrounds
*User can only delete his/her campgrounds
*Hide/Show edit and delete buttons


##Users + Campgrounds
*Prevent a unauthenicated user from creating a campground
*Save username + id to newly created campground

##Editing Comments
*Add Edit route for comments
*Add edit button
*Add update route

campground edit route <!-- /campgrounds/:id/edit -->
commit edit route  <!-- /campgrounds/:id/comments/:comments_id/edit -->

##Delete Comments
*Add destroy route
*Add delete button

campground delete route <!-- /campgrounds/:id -->
comments delete routre  <!-- /camgroudns/:id/comments/:comments_id -->

##Authorization pt. 2 comments
*User can only edit his / hers comment
*User can only delete his / hers comment
*Hide/show edit and delete buttons
*Refactor middleware

##Adding in Flash
*Demo working version
*Install and configure connect-flash
*Add bootstrap alerts to header