module.exports = (req, res, next) => {
	let pw = pass(req);
	if (pw){
		req.password = pw;
		next();
	} else {
		return res.json({error: true, message: "No password given"});
	}
	function pass(req) {
		if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
				return req.headers.authorization.split(' ')[1];
		} else if (req.query && req.query.password) {
				return req.query.password;
		}
		return req.body.password || null;
	}
}