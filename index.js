console.clear()
const express = require("express");
const app = express();
const passport = require("passport");
const middleware = require("./middleware/index.js");

middleware(app);

app.use("/auth", require("./auth.js"))
app.use(require("./routes.js"))
app.use("/api", require("./api.js"));


app.listen(3000)