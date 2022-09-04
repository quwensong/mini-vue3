const args = require('minimist')(process.argv.slice(2)) // node scripts/dev.js reactivity -f global
const { build } = require('esbuild');
const { resolve } = require('path');

// console.log(args)  { _: [ 'reactivity' ], f: 'global' }
const target = args._[0] || 'reactivity';
const format = args.f || 'global';

// 开发环境只打包某一个
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`)); 

// iife 立即执行函数 (function(){})()
// cjs node中的模块 module.exports
// esm 浏览器中的esModule模块 import

const outpuFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm';

const outfile = resolve(__dirname,`../packages/${target}/dist/${target}.${format}.js`);

build({
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile,
    bundle:true,//把所有的包打在一起
    sourcemap:true,
    format:outpuFormat,//输出的格式
    globalName:pkg.buildOptions?.name,//打包的全局的名字
    platform:format === 'cjs' ? 'node':'browser',
    watch:{
        onRebuild(err){
            if(!err){
                console.log('重新构建中......');
            }
        }
    }
}).then(() => {
    console.log('watching......')
})