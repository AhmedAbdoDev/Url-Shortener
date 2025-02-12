const express = require("express");
const app = express();
const bodyParser = require("body-parser");

require("dotenv").config();
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(express.json());
app.use(limiter);
app.use(bodyParser.json());
app.use(cors());
const api = require("./routes");
app.use("/api", api);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log("app is running"));
