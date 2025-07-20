const express = require("express");
const { Login } = require("../Controller/Login");

const router = express.Router();
router.route("/").post(Login);
module.exports = router;
