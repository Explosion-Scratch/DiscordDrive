const {sendFile, getFile} = require("./files.js")
const {writeFiles, getFiles} = require("./filelist.js");
const {verifyToken, hash} = require("./jwt.js");
let a = new (require("express")).Router();
const fileUpload = require('express-fileupload');

a.use(fileUpload());

a.get("/hash", hash);
a.get("/getFile/:name", verifyToken, async (req, res) => {
	let {buffer, data} = await getFile(req.params.name).catch((e) => {res.status(404).json({error: true, message: "No such file", err: e})});
	res.json({data, file: `data:${data.mime};base64,${buffer.toString("base64")}`});
})

a.get("/download/:name", verifyToken, async (req, res) => {
	try {
		let {buffer} = await getFile(req.params.name);
		res.send(buffer);
	} catch(e){
		res.status(500).json({error: true, message: "No such file", err: e});
	}
})
a.post("/uploadFile", verifyToken, async (req, res) => {
	if (!(req.files && Object.keys(req.files).length && req.files.file)){
		return res.status(400).json({error: true, message: "No files uploaded, none provided."})
	}
	let file = req.files.file;
	let name = toHex(file.name);
	await sendFile(file.data, name, {
		mime: file.mimetype, 
		md5: file.md5, 
		size: file.size, 
		data: JSON.parse(req.body.data || "{}") || {}
	})
	return res.json(getFiles().files.find(i => i.name === name))
});

a.get("/getFiles", verifyToken, (req, res) => {
	res.json(getFiles())
})
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