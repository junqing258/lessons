const madge = require('madge');
const path = require('path');

let filePath = path.join(__dirname, '../src/index.js');

madge(filePath).then((res) => {
	console.log(res.obj());
});