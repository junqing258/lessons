// bundler.js
const fs = require('fs-extra');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const babel = require('@babel/core');

let rootDir = './';

// 入口文件模块分析
const moduleAnalyse = filename => {
	if (!/.*\.\w+$/.test(filename)) {
		filename += '.js';
	}

	if (!/.*\.(js|ts|css)$/.test(filename)) return;

	const content = fs.readFileSync(filename, 'utf-8');
	// 得到抽象语法树
	const ast = parser.parse(content, {
		sourceType: 'module',
	});
	// 找到该文件的依赖
	const dependencies = {};
	traverse(ast, {
		ImportDeclaration({
			node
		}) {
			const dirname = path.dirname(filename);
			// node.source.value就是获取到的模块路径名，带有相对于当前文件的路径
			// 比如import sleep from './utils/sleep.js'里面的'./utils/sleep.js'
			dependencies[node.source.value] = `${path.join(dirname, node.source.value)}`;
		},
	});
	// babel翻译AST为浏览器可以识别的代码
	const {
		code
	} = babel.transformFromAst(ast, null, {
		presets: ['@babel/preset-env'],
	});
	return {
		filename: path.relative(rootDir, filename),
		dependencies,
		code,
	};
};

const makeDependenciesGraph = entry => {
	// 先拿到入口文件的模块分析对象
	rootDir = path.dirname(entry);
	const entryModule = moduleAnalyse(entry);

	// 将通过递归遍历，把所有的模块依赖收集到这里
	const graphArray = [entryModule];
	for (let i = 0; i < graphArray.length; i++) {
		const item = graphArray[i];
		const {
			dependencies
		} = item;
		// 判断dependencies对象是否为空，即item是否还有依赖
		if (Object.keys(dependencies).length > 0) {
			for (let j in dependencies) {
				// 把得到的子依赖添加进graphArray，长度发生变化，for循环继续，形成了递归
				const dep = moduleAnalyse(dependencies[j]);
				dep && graphArray.push(dep);
			}
		}
	}
	// 数组转换为对象  方便后续操作
	const graph = {};
	graphArray.forEach(item => {
		graph[item.filename] = {
			dependencies: item.dependencies,
			// code: item.code,
		};
	});

	return graph;
};

const entryFile = path.join(__dirname, '../src/index.js');
const graphInfo = makeDependenciesGraph(entryFile);
console.log('graphInfo', graphInfo);

