const { Client } = require("discord.js");
const {encrypt, decrypt} = require("../encryption.js");
const fs = require("fs");
const ALMOST_EIGHT_MB = 1_048_576 * 7.9;
const fetch = require("cross-fetch");
const User = require("../schemas/User.js");

let client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

client.on("ready", () => {
	console.log("Bot ready");
});

class FileClient {
	constructor({channelID, userID, password}) {
		let result = (async () => {
			if (!(channelID && userID && password)){
				return {error: true, message: "Channel ID, user ID and password required"};
			}
			this.password = password;
			this.USER_ID = userID;
			this.user = await User.findOne({discordId: userID}).exec();
			if (!this.user){
				return {error: true, message: `User with ID ${userID} not found`};
			}
			this.channel = client.channels.cache.get(channelID);
			if (!this.channel) {
				return {
					error: true,
					message: `Channel with an ID of ${channelID} not found`,
				};
			}
			return this;
		})();
		return new Promise(r => result.then(r));
	}
	async getFile(name) {
		let parts = (await this.getFiles())?.files?.find((i) => i.name === name)?.parts;
		if (!parts) {
			throw new Error("File not found");
		}
		let promises = [];
		for (let [_, { url }] of parts) {
			promises.push(fetch(url).then((r) => r.json()));
		}
		let bits = await Promise.all(promises);
		let otherData = {};
		bits.forEach((i) => {
			otherData = { ...otherData, ...i.other };
		});
		bits = Buffer.from(bits.map((i) => i.data).join(""), "base64");
		return { data: otherData, buffer: bits };
	}
	async sendFile(file, name, data) {
		let date = Date.now();
		let b64 = file.toString("base64");
		let parts = [];
		if (b64.length < ALMOST_EIGHT_MB) {
			parts = [b64];
		} else {
			parts = this.chunk(b64, ALMOST_EIGHT_MB);
		}
		let files = await this.getFiles();
		let attachments = [];
		parts.forEach((part, idx) => {
			let buffer = Buffer.from(
				JSON.stringify({
					partNum: idx,
					other: data,
					total: parts.length,
					fileName: name,
					dateUploaded: date,
					data: part,
				})
			);
			attachments.push({
				attachment: buffer,
				name: `${name}_${idx + 1}_of_${parts.length}.json`,
			});
		});
		let item = {
			name,
			dateUploaded: date,
			totalParts: parts.length,
			other: data,
			realName: this.fromHex(name),
			parts: [],
		};

		for (let attachment_list of this.groupArr(attachments, 3)) {
			let msg = await this.channel.send({
				files: attachment_list,
			});
			item.parts.push(...msg.attachments);
		}
		files.files.push(item);
		await this.writeFiles(files);
	}
	async getFiles(){
		this.user = await User.findOne({discordId: this.USER_ID}).exec();
		if (!this.user){
			throw new Error("User not found");
		}
		let decrypted = decrypt(this.user.data, this.password);
		return decrypted;
	}
	async writeFiles(files){
		await User.findOneAndUpdate({discordId: this.USER_ID}, {
			data: encrypt(files, this.password)
		});
		return files;
	}
	toHex(str, hex) {
		try {
			hex = unescape(encodeURIComponent(str))
				.split("")
				.map(function (v) {
					return v.charCodeAt(0).toString(16);
				})
				.join("");
		} catch (e) {
			hex = str;
			console.log("invalid text input: " + str);
		}
		return hex;
	}
	groupArr(data, n) {
		var group = [];
		for (var i = 0, j = 0; i < data.length; i++) {
			if (i >= n && i % n === 0) j++;
			group[j] = group[j] || [];
			group[j].push(data[i]);
		}
		return group;
	}
	fromHex(hex, str) {
		try {
			str = decodeURIComponent(hex.replace(/(..)/g, "%$1"));
		} catch (e) {
			str = hex;
			console.log("invalid hex input: " + hex);
		}
		return str;
	}
	chunk(str, size) {
		const numChunks = Math.ceil(str.length / size);
		const chunks = new Array(numChunks);

		for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
			chunks[i] = str.substr(o, size);
		}

		return chunks;
	}
	async getMessages(channel, limit = 100) {
		let out = [];
		if (limit <= 100) {
			let messages = await channel.messages.fetch({ limit: limit });
			out.push(...messages.array());
		} else {
			let rounds = limit / 100 + (limit % 100 ? 1 : 0);
			let last_id = "";
			for (let x = 0; x < rounds; x++) {
				const options = {
					limit: 100,
				};
				if (last_id.length > 0) {
					options.before = last_id;
				}
				const messages = await channel.messages.fetch(options);
				out.push(...messages.array());
				last_id = messages.array()[messages.array().length - 1].id;
			}
		}
		return out;
	}
}

client.login(process.env.DISCORD_BOT_TOKEN);


module.exports = FileClient;