const {verifyToken} = require("./jwt");

const api = require("./api.js")
const express = require("express");
const app = express();
require("./filelist.js")
app.use("/api", api);
//Magic
app.set("json spaces", 2);
app.listen(3000, () => {
	console.log("Listening on port 3000")
});