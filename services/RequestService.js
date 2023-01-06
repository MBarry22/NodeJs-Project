"use strict";

class RequestService {
  // Constructor
  RequestService() {}

  reqHelper(req, permittedRoles = []) {
    // restrict permissions by default
    let rolePermitted = false;

    // check for our colour cookie
    let colour;
    // if (req.cookies && req.cookies["colour"]) {
    //   colour = req.cookies["colour"];
    // }
    // check for colour in session instead of cookie
    if (req.session && req.session.colour) {
      colour = req.session.colour;
    }

    // Send username and login status to view if authenticated.
    if (req.isAuthenticated()) {
      if (req.session.roles) {
        // check if the user's roles matches any of the permitted roles for this resource
        let matchingRoles = req.session.roles?.filter((role) =>
          permittedRoles.includes(role)
        );
        if (matchingRoles.length > 0) {
          rolePermitted = true;
        }
      } else {
        req.session.roles = [];
      }
      return {
        authenticated: true,
        username: req.user.username,
        colour: colour,
        roles: req.session.roles,
        rolePermitted: rolePermitted,
      };
    }
    // Send logged out status to form if not authenticated.
    else {
      return { authenticated: false, colour: colour };
    }
  }
}

module.exports = new RequestService();
