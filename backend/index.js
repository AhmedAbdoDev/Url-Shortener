const express = require("express");
const app = express();
const api = require("./routes");
require("dotenv").config();
app.use(express.json());
app.use("/api", api);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log("app is running"));
