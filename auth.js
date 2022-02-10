let a = new (require("express").Router)();

// ROUTES:
a.get("/", (req, res) => res.send("yay"))

// MONGODB
const connect = require("./auth/db.js");
connect()
// PASSPORT
// const passport = require("passport");
// var DiscordStrategy = require('passport-discord').Strategy;
// var scopes = ['identify', 'email', 'guilds', 'guilds.join'];

// passport.use(new DiscordStrategy({
//     clientID: 'id',
//     clientSecret: 'secret',
//     callbackURL: `https://DiscordDrive.explosionscratc.repl.co/auth/callback`,
//     scope: scopes
// },
// function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ discordId: profile.id }, function(err, user) {
//         return cb(err, user);
//     });
// }));

// app.get("/auth/login", passport.authenticate("discord"))

module.exports = a;