const {verifyToken} = require("./jwt");
const api = require("./api.js")
const express = require("express");
const app = express();

app.use("/api", api);

app.listen(3000, () => {
	console.log("Listening on port 3000")
});