let a = new (require("express").Router)();
const password = require("./middleware/getPassword.js");
const login = require("./middleware/requireLogin.js");
const setup = require("./middleware/requireSetup.js");

const FileClient = require("./bot/bot.js");

a.use(login);
a.use(setup);

a.get("/getFiles", password, async (req, res) => {
	let c = await new FileClient({
		channelID: req.user.channelId,
		userID: req.user.discordId,
		password: req.password,
	});
	c.getFiles().then((f) => res.json(f));
})

module.exports = a;