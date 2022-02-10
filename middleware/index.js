module.exports = (app) => {
	const MongoStore = require('connect-mongo');
	const express = require("express");
	const passport = require("passport")
	app.use(require('express-session')({
		secret: 'keyboard cat', 
		resave: true, 
		saveUninitialized: true,
		store: MongoStore.create({mongoUrl: process.env.MONGO_URI})
	}));
	app.use(require('cookie-parser')());
	app.use(express.urlencoded({extended:true, type: "application/x-www-form-urlencoded"}));
	app.use(express.json({type: ["*/json", "text/plain"]}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(express.static("static"));
}