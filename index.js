const express = require("express");
const app = express();

app.use("/auth", require("./auth.js"))

app.listen(3000)