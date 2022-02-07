const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const config = process.env;

const verifyToken = (req, res, next) => {
  const token =
    req?.body?.token || req?.query?.token || req?.headers["x-access-token"];

  if (!token) {
    return res.status(403).json({error: true, message: "A token is required for authentication"});
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send({error: true, message: "Invalid Token"});
  }
  return next();
};

const getToken = async (req, res, next) => {
	const password =
    req?.body?.password || req?.query?.password || req?.headers["x-password"];
	if (!password){
		return res.status(401).json({error: true, message: "No password given"});
	}
	let result = await new Promise(res => bcrypt.compare(password, process.env.HASHED_PASSWORD, (_, r) => res(r)));
	if (result !== true){
		return res.status(401).json({error: true, message: "Password incorrect"});
	}
	const token = jwt.sign(
		{ timeCreated: Date.now() },
		process.env.JWT_TOKEN,
		{
			expiresIn: "2h",
		}
	);
	res.json({token});
}

const hash = (req, res, next) => {
	bcrypt.hash(req.query.string || req.body.string, saltRounds, function(err, hash) {
	  res.json({hash});
	});
	return;
}

module.exports = {verifyToken, getToken, hash};