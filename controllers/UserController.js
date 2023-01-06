const User = require("../models/User");
const passport = require("passport");
const RequestService = require("../services/RequestService");
const path = require('path');

// import and instantiate our userOps object
const UserOps = require("../data/UserOps");
const { register } = require("../models/User");
const _userOps = new UserOps();


function getFileExtension (filename) {
  return filename.split('.').pop();
};

// Displays registration form.
exports.Register = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req);
  res.render("user/register", { errorMessage: "", user: {}, reqInfo: reqInfo });
};

// Handles 'POST' with registration form submission.
exports.RegisterUser = async function (req, res) {
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;
  var re = /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i;
  let pfp = "default.jpg"
  const profileImage = req.files ? req.files.profilePicture : "";
  

  if(profileImage && re.test(profileImage.name)){
    pfp = Date.now().toString() + "." + getFileExtension(profileImage.name);
    profileImage.mv(path.join(__dirname+ '/../public', 'images/')+ pfp, function(err) {
      if(err){
          response.status(400).send(err);
      }
  })
  }


  if (password == passwordConfirm) {
    // Creates user object with mongoose model.
    // Note that the password is not present.
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      username: req.body.username,
      profilePicture: pfp,
      interests: req.body.interests,
      comments: []
    });

    // Uses passport to register the user.
    // Pass in user object without password
    // and password as next parameter.
    User.register(
      new User(newUser),
      req.body.password,
      function (err, account) {
        // Show registration form with errors if fail.
        if (err) {
          let reqInfo = RequestService.reqHelper(req);
          return res.render("user/register", {
            user: newUser,
            errorMessage: err,
            reqInfo: reqInfo,
          });
        }
        // User registered so authenticate and redirect to profile
        passport.authenticate("local")(req, res, function () {
          res.redirect("/user/profile");
        });
      }
    );
  } else {
    let reqInfo = RequestService.reqHelper(req);
    res.render("user/register", {
      user: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username,
        interests: req.body.interests
      },
      errorMessage: "Passwords do not match.",
      reqInfo: reqInfo,
    });
  }
};

// Shows login form.
exports.Login = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req);
  let errorMessage = req.query.errorMessage;

  return res.render("user/login", {
    user: {},
    errorMessage: errorMessage,
    reqInfo: reqInfo,
  });
};

// Receives login information & user roles, then store roles in session and redirect depending on authentication pass or fail.
exports.LoginUser = async (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/user/profile",
    failureRedirect: "/user/login?errorMessage=Invalid login.",
  })(req, res, next);
};

// Log user out and direct them to the login screen.
exports.Logout = (req, res) => {
  // Use Passports logout function
  req.logout((err) => {
    if (err) {
      console.log("logout error");
      return next(err);
    } else {
      // logged out.  Update the reqInfo and redirect to the login page
      let reqInfo = RequestService.reqHelper(req);

      res.render("user/login", {
        user: {},
        isLoggedIn: false,
        errorMessage: "",
        reqInfo: reqInfo,
      });
    }
  });
};

exports.Profile = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req);
  if (reqInfo.authenticated) {
    let sessionData = req.session;
    let roles = await _userOps.getRolesByUsername(reqInfo.username);
    sessionData.roles = roles;
    reqInfo.roles = roles;

    let profileInfo = await _userOps.getUsers();

    sessionData.profileInfo = profileInfo
    reqInfo.profileInfo = profileInfo

    let comments = await _userOps.getCommentsByUsername(reqInfo.username);
    sessionData.comments = comments;
    reqInfo.comments = comments;

    let userInfo = await _userOps.getUserByUsername(reqInfo.username);
    return res.render("user/profile", {
      reqInfo: reqInfo,
      profileInfo: profileInfo,
      userInfo: userInfo,
    });
  } else {
    res.redirect(
      "/user/login?errorMessage=You must be logged in to view this page."
    );
  }
};
// Get Method For Settings
exports.Settings = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req);
  if(reqInfo.authenticated){

    let sessionData = req.session;
    let userInfo = await _userOps.getUserByUsername(reqInfo.username);

    sessionData.userInfo = userInfo
    reqInfo.userInfo = userInfo
    
    res.render("user/settings", { 
      userInfo: userInfo, 
      reqInfo: reqInfo, 
      errorMessage: "" }); 
  }
};

// Post Method For Settings
exports.SettingsUsers = async function (req, res) {
  let errorMessage = ""
  let reqInfo = RequestService.reqHelper(req);
  let userInfo = await _userOps.getUserByUsername(reqInfo.username);


  if(reqInfo.authenticated){
    if(userInfo.firstName != req.body.firstName){
      _userOps.updateUserFirstName(reqInfo.username, req.body.firstName);
    }
    if(userInfo.lastName != req.body.lastName){
      _userOps.updateLastName(reqInfo.username, req.body.lastName);
    }
    if(userInfo.lastName != req.body.lastName){
      _userOps.updateLastName(reqInfo.username, req.body.lastName);
    }
    if(userInfo.email != req.body.email){
      _userOps.updateEmail(reqInfo.username, req.body.email);
    }
    
    if(userInfo.interests != req.body.interests){
      _userOps.updateInterests(reqInfo.username, req.body.interests);
    }
    if(req.body.password && req.body.passwordConfirm){
      const password = req.body.password;
      const passwordConfirm = req.body.passwordConfirm;
      if(password == passwordConfirm){
        const user = await User.findOne({
          username: req.user.username
        });
        await user.setPassword(req.body.password);
        const updatedUser = await user.save();
      }
      else{
        errorMessage = "Passwords do not match!"
      }
    }
    var re = /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i;
    let pfp = "default.jpg"
    const profileImage = req.files ? req.files.profilePicture : "";
  

    if(profileImage && re.test(profileImage.name)){
      pfp = Date.now().toString() + "." + getFileExtension(profileImage.name);
      profileImage.mv(path.join(__dirname+ '/../public', 'images/')+ pfp, function(err) {
        if(err){
            response.status(400).send(err);
        }
        else{
          _userOps.updateProfilePicture(reqInfo.username, pfp);
        }
      })
    }
    return res.render("user/settings", {
      errorMessage: errorMessage,
      reqInfo: reqInfo,
      userInfo: userInfo,
    });
  }

  
};

// Get Method For Manager Edit 
exports.ManagerEdit = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req);
  const profileUsername = req.params.username;
  if(reqInfo.authenticated){

    let sessionData = req.session;
    let userInfo = await _userOps.getUserByUsername(profileUsername);

    sessionData.userInfo = userInfo
    reqInfo.userInfo = userInfo
    
    res.render("user/edit", { 
      userInfo: userInfo, 
      reqInfo: reqInfo, 
      errorMessage: "" }); 
  }
};

// Post Method For Manager Edit
exports.ManagerEditUser = async function (req, res) {
  let errorMessage = "";
  let userInfo = await _userOps.getUserByUsername(req.body.username);
  let reqInfo = RequestService.reqHelper(req, ["Admin", "Manager"]);

  if (reqInfo.rolePermitted) {
    if(userInfo.firstName != req.body.firstName){
      _userOps.updateUserFirstName(req.body.username, req.body.firstName);
    }
    if(userInfo.lastName != req.body.lastName){
      _userOps.updateLastName(req.body.username, req.body.lastName);
    }
    if(userInfo.email != req.body.email){
      _userOps.updateEmail(req.body.username, req.body.email);
    }
    
    if(userInfo.interests != req.body.interests){
      _userOps.updateInterests(req.body.username, req.body.interests);
    }
    if(req.body.password && req.body.passwordConfirm){
      const password = req.body.password;
      const passwordConfirm = req.body.passwordConfirm;
      if(password == passwordConfirm){
        const user = await User.findOne({
          username: req.user.username
        });
        await user.setPassword(req.body.password);
        const updatedUser = await user.save();
      }
      else{
        errorMessage = "Passwords do not match!"
      }
    }
    var re = /(\.jpg|\.jpeg|\.bmp|\.gif|\.png)$/i;
    let pfp = "default.jpg"
    const profileImage = req.files ? req.files.profilePicture : "";
  

    if(profileImage && re.test(profileImage.name)){
      pfp = Date.now().toString() + "." + getFileExtension(profileImage.name);
      profileImage.mv(path.join(__dirname+ '/../public', 'images/')+ pfp, function(err) {
        if(err){
            response.status(400).send(err);
        }
        else{
          _userOps.updateProfilePicture(req.body.username, pfp);
        }
      })
    }
    let sessionData = req.session;

    sessionData.userInfo = userInfo
    reqInfo.userInfo = userInfo
    
    return res.redirect("edit/" + userInfo.user.username)
  }
  
};
// Get Method For Manager Edit Roles
exports.Roles = async function (req, res) {
  let errorMessage = "";
  const profileUsername = req.params.username;
  let roles = ["Manager", "Admin", "Test1", "Test2"]
  let reqInfo = RequestService.reqHelper(req, ["Admin", "Manager"]);

  if(profileUsername && reqInfo.rolePermitted){
    
    let sessionData = req.session;
    let userInfo = await _userOps.getUserByUsername(profileUsername);
    let getRoles = await _userOps.getRolesByUsername(profileUsername);
    sessionData.userInfo = userInfo
    reqInfo.userInfo = userInfo
    reqInfo.getRoles = getRoles
    reqInfo.roles = roles
    
    res.render("user/roles", { 
      userInfo: userInfo,
      getRoles: getRoles,
      reqInfo: reqInfo,
      roles: roles, 
      errorMessage: "" }); 
  }
}

// Post Method for Manager Edit Roles
exports.EditRoles = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req, ["Admin", "Manager"]);
  let currentRoles = await _userOps.getRolesByUsername(req.body.username);
  let userInfo = await _userOps.getUserByUsername(reqInfo.username);
  if(reqInfo.rolePermitted){
    if(req.body.action == "add"){
      currentRoles.push(req.body.role)
      await _userOps.updateRoles(req.body.username, currentRoles);

    }
    if(req.body.action == "remove"){
      console.log(currentRoles)
      currentRoles = currentRoles.filter(e => e !== req.body.role)
      console.log(currentRoles)
      await _userOps.updateRoles(req.body.username, currentRoles)
    }
    
    
    res.redirect("/user/roles/" + req.body.username)
  }
}




// Get Method For Profile Details /Username
exports.Detail = async function (req, res) {
  const profileUsername = req.params.username;
  let reqInfo = RequestService.reqHelper(req);
  if (reqInfo.authenticated) {
    let sessionData = req.session;
    
    let profileInfo = await _userOps.getUserByUsername(profileUsername);

    let roles = await _userOps.getRolesByUsername(profileUsername);
    sessionData.roles = roles;
    reqInfo.roles = roles;

    let comments = await _userOps.getCommentsByUsername(profileUsername);
    sessionData.comments = comments;
    reqInfo.comments = comments;

    return res.render("user/profile", {
      reqInfo: reqInfo,
      userInfo: profileInfo,
    });
  } else {
    res.redirect(
      "/user/login?errorMessage=You must be logged in to view this page."
    );
  }
};
// Get Method For Profiles List
exports.Profiles = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req);
  let users = null
  let sessionData = req.session;
  let profileInfo = await _userOps.getUsers();
  if (reqInfo.authenticated) {
    if (req.query.search) {
      users = await _userOps.getProfilesByFirstNameSearch(req.query.search);
    }else{
        profileInfo = profileInfo.sort(function(a, b) {
        var textA = a.lastName.toUpperCase();
        var textB = b.lastName.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    users = profileInfo
    }
    sessionData.profileInfo = profileInfo
    reqInfo.profileInfo = profileInfo
    reqInfo.users = users
    sessionData.users = users
    return res.render("user/profiles", {
      reqInfo: reqInfo,
      profileInfo: profileInfo,
      users: users,
      search: req.query.search,
    });
  } else {
    res.redirect(
      "/user/login?errorMessage=You must be logged in to view this page."
    );
  }
};



// Manager Area available to users who belong to Admin and/or Manager role
exports.ManagerArea = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req, ["Admin", "Manager"]);

  if (reqInfo.rolePermitted) {
    let sessionData = req.session;
    let profileInfo = await _userOps.getUsers();

    sessionData.profileInfo = profileInfo
    reqInfo.profileInfo = profileInfo

    res.render("user/manager-area", { errorMessage: "", reqInfo: reqInfo, profileInfo: profileInfo });
  } else {
    res.redirect(
      "/user/login?errorMessage=You must be a manager or admin to access this area."
    );
  }
};

exports.ManagerRoles = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req, ["Admin", "Manager"]);

  if (reqInfo.rolePermitted) {
    let sessionData = req.session;
    let profileInfo = await _userOps.getUsers();

    sessionData.profileInfo = profileInfo
    reqInfo.profileInfo = profileInfo

    res.render("user/manager-roles", { errorMessage: "", reqInfo: reqInfo, profileInfo: profileInfo });
  } else {
    res.redirect(
      "/user/login?errorMessage=You must be a manager or admin to access this area."
    );
  }
};



// Admin Area available to users who belong to Admin role
exports.AdminArea = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req, ["Admin"]);
  let sessionData = req.session;
  let profileInfo = await _userOps.getUsers();

  sessionData.profileInfo = profileInfo
  reqInfo.profileInfo = profileInfo
  if (reqInfo.rolePermitted) {
    res.render("user/admin-area", { errorMessage: "", reqInfo: reqInfo, profileInfo: profileInfo });
  } else {
    res.redirect(
      "/user/login?errorMessage=You must be an admin to access this area."
    );
  }
};

// Admin Delete Method
exports.DeleteProfile = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req, ["Admin"]);
  if (reqInfo.rolePermitted) {
    if(req.body.username){
      let profileUsername = req.body.username

      await _userOps.deleteUserByUsername(profileUsername)
    }
    res.redirect(
      "/user/admin-area"
    );
  }
};

// Add Comment Method
exports.AddComment = async function(req, res) {
  let reqInfo = RequestService.reqHelper(req);
  console.log("Saving a comment for ", req.body.username);
    const comment = {
      commentBody: req.body.comment,
      commentAuthor: reqInfo.username,
    };
    let profileInfo = await _userOps.addCommentToUser(
      comment,
      req.body.username
    );
    return res.redirect('/user/profile/' + req.body.username);


};

