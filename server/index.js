'use strict'

const config 		= require(__dirname + '/config/config');
const body_parser 	= require('body-parser');
const express 		= require('express');
const app 			= express();

app.set('case sensitive routing', true);
app.set('x-powered-by', false);

app.use(require('method-override')());
app.use(body_parser.urlencoded({extended: false}));
app.use(body_parser.json());
//app.use(require(__dirname + '/lib/parser.js'));
app.use(require(__dirname + '/config/router')(express.Router()));

console.log('Server now listening on port: ' + config.PORT);

app.listen(config.PORT, config.IP);