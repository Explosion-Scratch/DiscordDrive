const refresh = require('passport-oauth2-refresh');

module.exports = (req, res, next) => {
	refresh.requestNewAccessToken('discord', req.user.refreshToken, function(err, accessToken, refreshToken) {
	    if (err){
				return res.status(500).json({error: true, message: "Refresh token error"});
			}
	    req.token = accessToken;
			next();
	});
}