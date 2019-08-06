const  fs = require('fs')
const path = require('path')

let ID = 0

let fileContent = fs.readFileSync('./index.js', 'utf-8');

function getDependencies(str) {
    let reg = /require\(['"](.+?)['"]\)/g;
    let result = null;
    let dependencies = [];
    while(result = reg.exec(str)) {
        dependencies.push(result[1]);
    }
    return dependencies;
}

function createAsset (filename) {
    let fileContent = fs.readFileSync(filename, 'utf-8');
    const id = ID++

    return {
        id: id,
        filename: filename,
        dependencies: getDependencies(fileContent),
        code: `function(require, exports, module) {
            ${fileContent}
        }`
    }
}

function createGraph(filename) {
    let asset = createAsset(filename);
    let queue = [asset];

    for(let asset of queue) {
        const dirname = path.dirname(asset.filename);
        asset.mapping = {};
        asset.dependencies.forEach(relativePath => {
            const absolutePath = path.join(dirname, relativePath);
            const child = createAsset(absolutePath);
            asset.mapping[relativePath] = child.id;
            queue.push(child);
        });
    }
    console.log(queue)
    return queue;
}

function createBundle(graph) {
    let modules = '';
    /*
    0:[function(require, exports, module) { \n        let action = require(\'./action.js\').action;\nlet name = require(\'./name.js\').name;\n\nlet message = `${name} is ${action}`;\nconsole.log( message );\n    },
      { './action.js': 1, './name.js': 2 }
    ],
    1: [
       fnction(){},
       {}
    ],
    2: [],
    3: []
    */
    graph.forEach(mod => {
        modules +=
        `${mod.id}: [
            ${mod.code},
            ${JSON.stringify(mod.mapping)}
        ],`;
    });

    const result =

    `(function(modules){
        function exec(id) {
              let [fn, mapping] = modules[id];
              console.log(fn, mapping)
              let module = { exports: {} };
            
              fn && fn(require, module.exports, module);
            
              function require(path) {
                //根据模块路径，返回模块执行的结果
                return exec(mapping[path]);
              }
            
              return module.exports;
        }
        
        exec(0)
    })({${modules}})`

    fs.writeFileSync('./dist/bundle.js', result);
}


let graph = createGraph('./index.js');
createBundle(graph)