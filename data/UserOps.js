const User = require("../models/User");

class UserOps {
  // Constructor
  UserOps() {}

  async getUserByEmail(email) {
    let user = await User.findOne({ email: email });
    if (user) {
      const response = { obj: user, errorMessage: "" };
      return response;
    } else {
      return null;
    }
  }

  async getUserByUsername(username) {
    let user = await User.findOne(
      { username: username },
      { _id: 0, username: 1, email: 1, firstName: 1, lastName: 1, profilePicture: 1, interests: 1 }
    );
    if (user) {
      const response = { user: user, errorMessage: "" };
      return response;
    } else {
      return null;
    }
  }

  async getRolesByUsername(username) {
    let user = await User.findOne({ username: username }, { _id: 0, roles: 1 });
    if (user.roles) {
      return user.roles;
    } else {
      return [];
    }
  }
  async getUsers() {
    let users = await User.find({},{ _id: 0, username: 1, firstName: 1, lastName: 1 });
    if (users) {
      return users;
    } else {
      return [];
    }
  }
  async getCommentsByUsername(username) {
    let user = await User.findOne({ username: username }, { _id: 0, comments: 1 });
    if (user.comments) {
      return user.comments;
    } else {
      return [];
    }
  }

  async addCommentToUser(comment, username) {
    let user = await User.findOne({ username: username });
    if(user)
    {
      user.comments.push(comment);
      try {

        let result = await user.save();
        console.log("updated user: ", result);
        const response = { user: result, errorMessage: "" };
        return response;
      } catch (error) {
        console.log("error saving user: ", result);
        const response = { user: user, errorMessage: error };
        return response;
      }
    }
    else{
      return null;
    }
  }

  
  async getProfilesByFirstNameSearch(search) {
    console.log("searching profiles for: ", search);
    const filter = { firstName: { $regex: search, $options: "i" } };

    let users = await User.find(filter).sort({ firstName: 1 });
    return users;
  }


  async updateUserFirstName(username, firstName){
    await User.updateOne({ username: username }, {
       firstName: firstName 
    })
  }

  async updateLastName(username, lastName){
    await User.updateOne({ username: username }, {
      lastName: lastName
      
    })
  }

  async updateEmail(username, email){
    await User.updateOne({ username: username }, {
      email: email
    });
  }

  async updateProfilePicture(username, profilePicture){
    await User.updateOne({ username: username }, {
      profilePicture: profilePicture
    });
  }

  async updateInterests(username, interests){
    await User.updateOne({ username: username }, {
      interests: interests
    });
  }
  async updateRoles(username, roles){
    await User.updateOne({ username: username }, { 
      roles: roles
    });
  }

  async deleteUserByUsername(username){
    await User.findOneAndDelete({ username: username }, {
    });
  }


}







module.exports = UserOps;
