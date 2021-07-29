const path = require('path');
const fs = require('fs-extra');
const parser = require('@babel/parser');
const generate = require("@babel/generator").default;
const traverse = require('@babel/traverse').default;
const template = require('@babel/template').default;
const importModule = require('@babel/helper-module-imports');
const babel = require("@babel/core");
const t = require('@babel/types');


const sourceCode = fs.readFileSync(path.join(__dirname, './source/code.js'), {
	encoding: 'utf-8'
});

const ast = parser.parse(sourceCode, {
	sourceType: 'module'
});

const visitor = {
	Identifier: (path) => {
		// path.node.name = path.node.name.split('').reverse().join('')
	},
	ImportDeclaration: (path) => {
		console.log(path.get('source').node.value);
	},
	'ClassMethod|ArrowFunctionExpression|FunctionExpression|FunctionDeclaration':
		(path, state) => {
			const bodyPath = path.get('body');
			const temp = `log('aaa')`;
			const trackerAST = template.statement(temp)();
			if (bodyPath.isBlockStatement()) { // 有函数体
				bodyPath.node.body.unshift(trackerAST);
			} else { // 没有函数体
				const statement = template.statement(`{${temp};return PREV_BODY;}`)({
					PREV_BODY: bodyPath.node
				});
				bodyPath.replaceWith(statement);
			}
		},
	CallExpression(path, state) {
		const callee = path.get("callee");
		const object = callee.get("object");
		const property = callee.get("property");
		if (t.isMemberExpression(callee) && isGlobalConsoleId(object)) {
			const loc = callee.get("loc");
			const {
				line,
				column
			} = loc.node.start;
			const location = `[line ${line},column ${column}]`;
			path.node.arguments.unshift(t.stringLiteral(location))
		}
	}
};
traverse(ast, visitor);

const transformedCode = generate(ast).code;

fs.writeFileSync('./dist/target.js', transformedCode, 'utf-8');



function isGlobalConsoleId(id) {
	const name = "console";
	return (
		id.isIdentifier({
			name
		}) &&
		!id.scope.getBinding(name) &&
		id.scope.hasGlobal(name)
	);
}