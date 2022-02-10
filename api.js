let a = new (require("express").Router)();
const password = require("./middleware/getPassword.js");
const login = require("./middleware/requireLogin.js");
const setup = require("./middleware/requireSetup.js");
const fileUpload = require('express-fileupload');
const FileClient = require("./bot/bot.js");

a.use(fileUpload());
a.use(login);
a.use(setup);

console.log("Started API");

a.get("/getFiles", password, async (req, res) => {
	let c = await new FileClient({
		channelID: req.user.channelId,
		userID: req.user.discordId,
		password: req.password,
	});
	if (c.error){return res.status(500).json(c)}
	c.getFiles().then((f) => res.json(f));
});
a.get("/download/:name", password, async (req, res) => {
	try {
		let c = await new FileClient({
			channelID: req.user.channelId,
			userID: req.user.discordId,
			password: req.password,
		})
		let {buffer, data} = await c.getFile(req.params.name);
		console.log(data);
		res.set({
			"Content-Disposition": `attachment; filename="${Buffer.from(req.params.name, "hex")}"`
		})
		res.send(buffer);
	} catch(e){
		res.status(500).json({error: true, message: "No such file", err: e});
	}
})
a.post("/uploadFile", password, async (req, res) => {
	console.log("POST uploadFile")
	console.log(req.files)
	let c = await new FileClient({
		channelID: req.user.channelId,
		userID: req.user.discordId,
		password: req.password,
	});
	if (c.error){return res.status(500).json(c)}
	console.log('Created file client');
	if (!(req.files && Object.keys(req.files).length && req.files.file)) {
		return res
			.status(400)
			.json({ error: true, message: "No files uploaded, none provided." });
	}
	let file = req.files.file;
	let name = toHex(file.name);
	console.log("Sending file")
	await c.sendFile(file.data, name, {
		mime: file.mimetype,
		md5: file.md5,
		size: file.size,
		realName: file.name,
		data: JSON.parse(req.body.data || "{}") || {},
	});
	console.log("Sent file")
	return res.json((await c.getFiles()).files.filter(i => i.name === name));
});

module.exports = a;

function toHex(str,hex){
  try{
    hex = unescape(encodeURIComponent(str))
    .split('').map(function(v){
      return v.charCodeAt(0).toString(16)
    }).join('')
  }
  catch(e){
    hex = str
    console.log('invalid text input: ' + str)
  }
  return hex
}