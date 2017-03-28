'use strict';

const importer = require('anytv-node-importer');

module.exports = (router) => {
	const __ = importer.dirloadSync(__dirname + '/../controller');

	router.del = router.delete;

	router.get('/', __.controller.hello);
	router.post('/preprocess', __.controller.preprocess_all);

	return router;
}