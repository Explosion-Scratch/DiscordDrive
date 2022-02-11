let a = new (require("express").Router)();
const token = require("./middleware/refreshToken.js");
const login = require("./middleware/requireLogin.js");
const password = require("./middleware/getPassword.js");
const {encrypt} = require("./encryption.js");
const setup = require("./middleware/requireSetup.js")
const User = require("./schemas/User.js");

a.get("/dashboard", login, setup, send("dashboard"));
a.get("/setup", login, (req, res, next) => {
	if (isSetup(req) === true){
		return res.redirect("/dashboard");
	}
	next()
}, send("setup"));
a.get("/api/addBot", (req, res) => {
	res.redirect("https://discord.com/api/oauth2/authorize?client_id=940312489114087494&permissions=100352&scope=bot");
})
a.get("/", (req, res, next) => {
	if (req.user){
		res.cookie('loggedin', 'true');
		next();
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
	if (isSetup(req) === true){
		return res.status(400).json({error: true, message: "Already set up"})
	}
	if (!req.body){
		return res.status(400).json({error: true, message: "No request body"})
	};
	if (!(req.body.channelId && req.password)){
		return res.status(400).json({error: true, message: "No channel ID or password given"});
	}
	let channelId = req.body.channelId;
	let data = encrypt({files: []}, req.password);
	await User.findOneAndUpdate({discordId: req.user.discordId}, {
		channelId,
		//init with empty files
		data,
	});
	req.session.passport.user.data = data;
	req.session.passport.user.channelId = channelId;
	// res.json({error: false, message: "Success"});
	setTimeout(() => res.redirect("/dashboard"), 500);
})

function send(file){
	return (req, res, next) => {
		res.sendFile(`${__dirname}/routes/${file}.html`);
	}
}

module.exports = a;

function isSetup(req){
		if (!req.user){
			return {error: true, message: "Not logged in (no user)"};
		};
		if (!req.user.data){
			return {error: true, message: "No user data"}
		};
		if (!req.user.data.iv){
			return {error: true, message: "User data doesn't have iv key"}
		};
		if (!req.user.channelId){
			return {error: true, message: "No channel ID"}
		};
		return true;
	}