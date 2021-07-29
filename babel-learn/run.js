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
	sourceType: 'module',
	// presets: ["@babel/preset-env"],  
});
// const { code } = babel.transformFromAst(ast, null, {
//   presets: ["@babel/preset-env"],     //es5模块类型
// });

// https://mp.weixin.qq.com/s/oxUF3XzpvEEDjmn5b8BhtA
// https://juejin.cn/post/6855129007982772237

const visitor = {
	Identifier: (path) => {
		// path.node.name = path.node.name.split('').reverse().join('')
	},
	ImportDeclaration: (path) => {
		console.log(path.get('source').node.value);
	},
	'ClassMethod|ArrowFunctionExpression|FunctionExpression|FunctionDeclaration': (path, state) => {
		const bodyPath = path.get('body');
		const temp = `console.log('aaa')`;
		const trackerAST = template.statement(temp)();
		if (bodyPath.isBlockStatement()) { // 有函数体
			bodyPath.node.body.unshift(trackerAST);
		} else { // 没有函数体
			const astNode = template.statement(`{${temp};return PREV_BODY;}`)({
				PREV_BODY: bodyPath.node
			});
			bodyPath.replaceWith(astNode);
		}
	}
};
traverse(ast, visitor);

const transformedCode = generate(ast).code;

fs.writeFileSync('./dist/target.js', transformedCode, 'utf-8');