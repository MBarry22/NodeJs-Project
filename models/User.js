const mongoose = require("mongoose");
const passportLocalmongoose = require("passport-local-mongoose");

// Comment Schema
const commentSchema = mongoose.Schema({
  commentAuthor: String,
  commentBody: String,
});


// User Schema
const userSchema = mongoose.Schema({
  username: {
    type: String,
    index: true,
  },
  email: {
    type: String,
    index: true,
  },
  password: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  roles: {
    type: Array,
  },
  profilePicture: {
    type: String,
    default: "default.jpg"
  },
  interests: {
    type: String,
    
  },
  comments: {
   type: [commentSchema],
   required: true
  }

});

userSchema.plugin(passportLocalmongoose);

// Pass the Schema into Mongoose to use as our model
const User = mongoose.model("User", userSchema);

// Export it so that we can use this model in our App
module.exports = User;
