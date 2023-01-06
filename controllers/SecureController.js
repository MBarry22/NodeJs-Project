const RequestService = require("../services/RequestService");

exports.Index = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req);
  if (reqInfo.authenticated) {
    return res.render("secure/secure-area", { reqInfo: reqInfo });
  } else {
    res.redirect(
      "/user/login?errorMessage=You must be logged in to view this page."
    );
  }
};

exports.SetColour = async function (req, res) {
  let reqInfo = RequestService.reqHelper(req);
  if (reqInfo.authenticated) {
    // extract the color from form data attached to req.body
    let colour = req.body.favouriteColour;
    if (colour && colour.trim()) {
      //set our cookie
      // res.cookie("colour", colour, { maxAge: 600000 });
      // store our colour in session instead of cookie
      const sessionData = req.session;
      sessionData.colour = colour;
      // also attach it as a property to reqInfo so we see the result immediately
      reqInfo.colour = colour;
    }

    return res.render("secure/secure-area", { reqInfo: reqInfo });
  } else {
    res.redirect(
      "/user/login?errorMessage=You must be logged in to view this page."
    );
  }
};
