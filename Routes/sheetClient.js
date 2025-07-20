const express = require("express");
const authenticateToken = require("../Auth/jwtAuth");
const {
  retrieveSites,
  getSiteInfo,
  getMonthlyInfo,
  updateSiteInfor,
  test,
} = require("../Controller/sheetClient");
const router = express.Router();
router.use(authenticateToken);
router.route("/AllSites").get(retrieveSites);
router.route("/getSiteInfo/:siteName/:month").get(getSiteInfo);
router.route("/getInfo/Monthly").get(getMonthlyInfo);
router.route("/getInfo/Daily").get(getMonthlyInfo);
router.route("/getInfo/test").post(updateSiteInfor);
// router.route("/getInfo/test").get(test);

module.exports = router;
