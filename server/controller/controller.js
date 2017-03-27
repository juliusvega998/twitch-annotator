'use strict';

const config = require(__dirname + '/../config/config');

exports.hello = (req, res, next) => {
	return res.send({message: "Hello World!"});
}

