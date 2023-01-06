const express = require("express");
const indexRouter = express.Router();

const IndexController = require("../controllers/IndexController");

indexRouter.get("/", IndexController.Index);

module.exports = indexRouter;
