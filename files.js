const {Client} = require("discord.js");
const {writeFiles, getFiles} = require("./filelist.js");
const fs = require("fs");
const ALMOST_EIGHT_MB = 1_048_576 * 7.9;
const fetch = require("cross-fetch");
let CHANNEL;

let client = new Client({intents: ["GUILDS", "GUILD_MESSAGES"]})

client.on("ready", () => {
	console.log("Bot ready")
	CHANNEL = client.channels.cache.get(process.env.CHANNEL_ID);
})

async function getFile(name){
	name = toHex(name);
	let parts = getFiles()?.files?.find(i => i.name === name)?.parts;
	if (!parts){
		throw new Error("File not found");
	}
	let promises = [];
	for (let [_, {url}] of parts){
		promises.push(fetch(url).then(r => r.json()));
	}
	let bits = await Promise.all(promises);
	bits = Buffer.from(bits.map(i => i.data).join(""), "base64");
	return bits;
}

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
async function sendFile(file, name){
	let date = Date.now();
	let b64 = file.toString("base64");
	if (b64.length < ALMOST_EIGHT_MB){
		parts = [b64];
	} else {
		let parts = b64.match(new RegExp(`.{1,${ALMOST_EIGHT_MB}}`, "g"));
	}
	let files = getFiles();
	let attachments = [];
	parts.forEach((part, idx) => {
		let buffer = Buffer.from(JSON.stringify({
			partNum: idx,
			total: parts.length,
			data: part,
			fileName: name,
			dateUploaded: date,
		}));
		attachments.push({attachment: buffer, name: `${name}_${idx}_of_${parts.length}.json`});
	})
	let item = {
		name,
		dateUploaded: date,
		totalParts: parts.length,
		parts: []
	};
	for (let attachment_list of groupArr(attachments, 10)){
		let msg = await CHANNEL.send({
			files: attachment_list,
		})
		item.parts.push(...msg.attachments)
	}
	files.files.push(item);
	writeFiles(files);
}

function groupArr(data, n) {
    var group = [];
    for (var i = 0, j = 0; i < data.length; i++) {
        if (i >= n && i % n === 0)
            j++;
        group[j] = group[j] || [];
        group[j].push(data[i])
    }
    return group;
}

client.login(process.env.DISCORD_BOT_TOKEN)

module.exports = {sendFile, getFile};