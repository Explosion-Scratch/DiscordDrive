const {sendFile, getFile} = require("./files.js")
const {verifyToken, getToken, hash} = require("./jwt.js");
let a = new (require("express")).Router();
const fileUpload = require('express-fileupload');

a.use(fileUpload());

a.get("/getToken", getToken);
a.get("/hash", hash);
a.get("/getFile/:name", verifyToken, async (req, res) => {
	let buffer = await getFile(req.params.name).catch((e) => {res.status(404).json({error: true, message: "No such file", err: e})});
	res.send(buffer);
})
a.post("/uploadFile", verifyToken, async (req, res) => {
	if (!(req.files && Object.keys(req.files).length && req.files.file)){
		return res.status(400).json({error: true, message: "No files uploaded, none provided."})
	}
	let file = req.files.file;
	await sendFile(file.data, file.name, {mime: file.mimetype, md5: file.md5, size: file.size})
	return res.json(require("./files.json").files.find(i => i.name === file.name))
});

a.get("/getFiles", verifyToken, (req, res) => {
	res.json(require("./files.json"))
})
module.exports = a;