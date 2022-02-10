const mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate')

const Schema = mongoose.Schema;
const UserSchema = new Schema({
	accessToken: {
		type: String,
		required: true,
	},
	refreshToken: {
		type: String,
		required: true,
	},
	channelId: {
		type: String,
	},
	discordId: {
		type: String,
		required: true,
	},
	profile: {
		type: Object,
		required: true,
	},
	data: {
		type: Object,
		required: true,
	}
});

UserSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', UserSchema);