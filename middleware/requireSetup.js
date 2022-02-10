//Makes sure that everything's set up for the user, if not redirects them

module.exports = (req, res, next) => {
	let setup = isSetup(req);
	const path = req.originalUrl.replace(/\?.*$/, '');
	if (setup.error){
		if (path.startsWith("/api")){
			return res.status(401).json({...setup})
		} else {
			console.log(path, setup)
			return res.redirect("/setup");
		}
	} else {
		return next();
	}
	function isSetup(req){
		if (!req.user){
			return {error: true, message: "Not logged in (no user)"};
		};
		if (!req.user.data){
			return {error: true, message: "No user data"}
		};
		if (!req.user.data.iv){
			return {error: true, message: "User data doesn't have iv key"}
		};
		if (!req.user.channelId){
			return {error: true, message: "No channel ID"}
		};
		return true;
	}
}