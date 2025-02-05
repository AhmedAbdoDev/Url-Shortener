const express = require("express");
const router = express.Router();
const short = require("./short");
const user = require("./user");

router.use("/", short);
router.use("/auth", user);

module.exports = router;
