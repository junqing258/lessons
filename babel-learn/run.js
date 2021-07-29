const path = require('path');
const fs = require('fs-extra');
const parser = require('@babel/parser');
const generate = require("@babel/generator").default;
const traverse = require('@babel/traverse').default;
const template = require('@babel/template').default;
const importModule = require('@babel/helper-module-imports');
const t = require('@babel/types');


const sourceCode = fs.readFileSync(path.join(__dirname, './source/code.js'), {
	encoding: 'utf-8'
});

const ast = parser.parse(sourceCode, {
	sourceType: 'module',
});
const visitor = {
	Identifier(path) {
		// path.node.name = path.node.name.split('').reverse().join('')
	},
	ImportDeclaration(path) {
		console.log(path.node.source.value);
	},
	FunctionDeclaration(path) {
			
	}
};
traverse(ast, visitor);

const transformedCode = generate(ast).code;

fs.writeFileSync('./dist/target.js', transformedCode, 'utf-8');