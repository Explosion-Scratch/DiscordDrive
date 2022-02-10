let a = new (require("express").Router)();
const token = require("./middleware/refreshToken.js");
const login = require("./middleware/requireLogin.js");
const password = require("./middleware/getPassword.js");
const {encrypt} = require("./encryption.js");

const User = require("./schemas/User.js");

a.get("/dashboard", login, send("dashboard"));
a.get("/setup", login, send("setup"));

a.get("/", (req, res, next) => {
	if (req.user){
		res.redirect("/dashboard");
	} else {next()}
}, send("homepage"))

a.get("/login", (req, res, next) => {
	if (req.user){
		return res.redirect("/dashboard");
	} else {
		next()
	}
}, send("login"))

a.post("/setup", login, password, async (req, res) => {
	if (!req.body){
		return res.status(400).json({error: true, message: "No request body"})
	};
	if (!(req.body.channelId && req.password)){
		return res.status(400).json({error: true, message: "No channel ID or password given"});
	}
	await User.findOneAndUpdate({discordId: req.user.discordId}, {
		channelId: req.body.channelId,
		//init with empty files
		data: encrypt({files: []}, req.password),
	});
	res.json({error: false, message: "Success"});
})

function send(file){
	return (req, res, next) => {
		res.sendFile(`${__dirname}/routes/${file}.html`);
	}
}

module.exports = a;