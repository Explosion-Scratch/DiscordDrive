const bcrypt = require('bcrypt');
const saltRounds = 10;

const verify = async (req, res, next) => {
	const password =
    req?.body?.password || req?.query?.password || req?.headers["Authorization"]?.split("Bearer ")?.[1] ||req?.headers["x-password"];
	if (!password){
		return res.status(401).json({error: true, message: "No password given"});
	}
	let result = await new Promise(res => bcrypt.compare(password, process.env.HASHED_PASSWORD, (_, r) => res(r)));
	if (result !== true){
		return res.status(401).json({error: true, message: "Password incorrect"});
	}
	next();
}

const hash = (req, res, next) => {
	bcrypt.hash(req.query.string || req.body.string, saltRounds, function(err, hash) {
	  res.json({hash});
	});
	return;
}

module.exports = {verifyToken: verify, hash};