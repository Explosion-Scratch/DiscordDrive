const crypto = require ("crypto");
const fs = require("fs");
module.exports = {getFiles: () => get(), writeFiles: (a) => set(a)};
function get(){
	return JSON.parse(decrypt(fs.readFileSync("files.txt", "utf8"), process.env.FILE_ENCRYPTION_KEY))
}

function set(value){
	value = JSON.stringify(value);
	return fs.writeFileSync("files.txt", encrypt(value, process.env.FILE_ENCRYPTION_KEY))
}
function encrypt(text, key) {
	key = getKey(key);
 let iv = crypto.randomBytes(16);
 let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
 let encrypted = cipher.update(text);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return JSON.stringify({ iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') });
}

function decrypt(text, key) {
	text = JSON.parse(text);
	key = getKey(key);
 let iv = Buffer.from(text.iv, 'hex');
 let encryptedText = Buffer.from(text.encryptedData, 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
 return decrypted.toString();
}

function getKey(str){
	return crypto.scryptSync(Buffer.from(str), Buffer.from(`Talent is cheaper than table salt. Any man worth his salt will stick up for what he believes right, but it takes a slightly better man to acknowledge instantly and without reservation that he is in error. `), 32)
}