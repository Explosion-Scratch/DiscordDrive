module.exports = {encrypt, decrypt, getKey};
const crypto = require("crypto");

function encrypt(text, key) {
	text = JSON.stringify(text);
	key = getKey(key);
	let iv = crypto.randomBytes(16);
	let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return {
		iv: iv.toString("hex"),
		encryptedData: encrypted.toString("hex"),
	};
}

function decrypt(text, key) {
	key = getKey(key);
	let iv = Buffer.from(text.iv, "hex");
	let encryptedText = Buffer.from(text.encryptedData, "hex");
	let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return JSON.parse(decrypted.toString());
}

function getKey(str) {
	return crypto.scryptSync(
		Buffer.from(str),
		//Salt doesn't have to be secret, and likely nobody else will use this salt, so it won't be in rainbow tables
		Buffer.from(
			`Talent is cheaper than table salt. Any man worth his salt will stick up for what he believes right, but it takes a slightly better man to acknowledge instantly and without reservation that he is in error. `
		),
		32
	);
}
