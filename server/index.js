'use strict'

const config 		= require(__dirname + '/config/config');
const body_parser 	= require('body-parser');
const express 		= require('express');
const https			= require('https');
const fs			= require('fs');
const app 			= express();

const options = {
	key: fs.readFileSync('/etc/apache2/ssl/localhost.key'),
	cert: fs.readFileSync('/etc/apache2/ssl/localhost.crt'),
	passphrase: 'onedoesnotsimply',
	requestCert: false,
	rejectUnauthorized: false
}

app.set('case sensitive routing', true);
app.set('x-powered-by', false);

app.use(require('method-override')());
app.use(body_parser.urlencoded({limit: '5mb', extended: false}));
app.use(body_parser.json());
app.use(require(__dirname + '/config/router')(express.Router()));

https.createServer(options, app).listen(config.PORT, () => {
	console.log('Server now listening on port: ' + config.PORT);
	console.log('Twitch chat emoticons from twitchemotes.com');
});