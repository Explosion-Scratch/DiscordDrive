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
	// name should be hex for url stuff
	// name = toHex(name);
	let parts = getFiles()?.files?.find(i => i.name === name)?.parts;
	if (!parts){
		throw new Error("File not found");
	}
	let promises = [];
	for (let [_, {url}] of parts){
		promises.push(fetch(url).then(r => r.json()));
	}
	let bits = await Promise.all(promises);
	let otherData = {}
	bits.forEach((i) => {
		otherData = {...otherData, ...i.other};
	})
	bits = Buffer.from(bits.map(i => i.data).join(""), "base64");
	return {data: otherData, buffer: bits};
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
//TODO: Add sending extra data
async function sendFile(file, name, data){
	let date = Date.now();
	let b64 = file.toString("base64");
	let parts = [];
	if (b64.length < ALMOST_EIGHT_MB){
		parts = [b64];
	} else {
		parts = chunk(b64, ALMOST_EIGHT_MB);
	}
	let files = getFiles();
	let attachments = [];
	parts.forEach((part, idx) => {
		let buffer = Buffer.from(JSON.stringify({
			partNum: idx,
			other: data,
			total: parts.length,
			fileName: name,
			dateUploaded: date,
			data: part,
		}));
		attachments.push({attachment: buffer, name: `${name}_${idx + 1}_of_${parts.length}.json`});
	})
	let item = {
		name,
		dateUploaded: date,
		totalParts: parts.length,
		other: data,
		realName: fromHex(name),
		parts: []
	};
	
	for (let attachment_list of groupArr(attachments, 3)){
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
function fromHex(hex,str){
  try{
    str = decodeURIComponent(hex.replace(/(..)/g,'%$1'))
  }
  catch(e){
    str = hex
    console.log('invalid hex input: ' + hex)
  }
  return str
}

client.login(process.env.DISCORD_BOT_TOKEN)

module.exports = {sendFile, getFile};

function chunk(str, size) {
  const numChunks = Math.ceil(str.length / size)
  const chunks = new Array(numChunks)

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size)
  }

  return chunks
}