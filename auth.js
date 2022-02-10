let a = new (require("express").Router)();

// ROUTES:
a.get("/", (req, res) => res.send("yay"))

// MONGODB
const connect = require("./auth/db.js");
const User = require("./schemas/User.js")
connect()

// PASSPORT
const passport = require("passport");
const refresh = require('passport-oauth2-refresh');

// Serialization - Prevent "Failed to serialize user into session"
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Discord auth
var DiscordStrategy = require('passport-discord').Strategy;
var scopes = ['identify', 'email'];

let strategy = new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: `https://DiscordDrive.explosionscratc.repl.co/auth/discord/callback`,
    scope: scopes
},
function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate(
			{ discordId: profile.id },
			{accessToken, refreshToken, profile, data: {}}, 
			function(err, user) {
        return cb(err, user);
			}
		);
});

passport.use(strategy);
refresh.use(strategy);

// Routes
a.get("/discord/login", passport.authenticate("discord"))

a.get("/discord/callback", passport.authenticate("discord", {
	failureRedirect: '/'
}), (req, res) => {
	res.redirect("/dashboard");
})

module.exports = a;