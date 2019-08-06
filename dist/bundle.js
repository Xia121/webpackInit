(function(modules){
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
    })({0: [
            function(require, exports, module) {
            // modules = {
//     0: [
//         function (require, exports, module) {
//             let action = require('./action.js').action;
//             let name = require('./name.js').name;
//
//             let message = `${action} nihao ${name}`
//             console.log(message)
//         },
//         {
//             './action.js': 1,
//             './name.js': 2
//         }
//     ],
//
//     1: [
//         function (require, exports, module) {
//             let action = 'making webpack'
//
//             exports.action = action
//         },
//         {
//
//         }
//     ],
//
//     2: [
//         function (require, exports, module) {
//             let name = 'xia'
//
//             exports.name = name
//         },
//         {
//
//         }
//     ]
// }
//
// function exec(id) {
//     let [fn, mapping] = modules[id];
//
//     let exports = {};
//
//     fn && fn(require, exports);
//
//     function require(path) {
//
//         return exec(mapping[path]);
//
//     }
//
//     return exports;
// }
//
// exec(0)

//
let action = require('./action.js').action;
let name = require('./name.js').name;

let message = `${name} is ${action}`;
console.log(message);


        },
            {"./action.js":3,"./name.js":4}
        ],1: [
            function(require, exports, module) {
            let action = 'making webpack';

exports.action = action;
        },
            {}
        ],2: [
            function(require, exports, module) {
            let  name = 'xia'

exports.name = name;
        },
            {}
        ],3: [
            function(require, exports, module) {
            let action = 'making webpack';

exports.action = action;
        },
            {}
        ],4: [
            function(require, exports, module) {
            let  name = 'xia'

exports.name = name;
        },
            {}
        ],})