# webpack简易版-超易懂的造轮子（一） #

1. 目的: 当初搞这个的原因呢是因为webpack看文档看的令人困惑 看完就忘   
2. 导致: 用的时候直接搜索 用完就好几个月不用 关键是面试一定会问webpack一问就抓瞎
3. 直接去 <b>造一个webpack的轮子</b> 万变不离其宗！！！  

## 一. 文件列表 ##

因为是简易版本列表结构当然是越简单越好

![](https://user-gold-cdn.xitu.io/2019/8/6/16c65d6cb175053f?w=321&h=578&f=png&s=12311)

1. index.js是文件入口
![](https://user-gold-cdn.xitu.io/2019/8/6/16c65d9684e68b4c?w=514&h=189&f=png&s=13934)
2. action.js和name.js是作为引入文件其中内容按照名字写作
![](https://user-gold-cdn.xitu.io/2019/8/6/16c65d832482a392?w=498&h=101&f=png&s=5963)
![](https://user-gold-cdn.xitu.io/2019/8/6/16c65d85d7ea6a89?w=513&h=92&f=png&s=5162)
3. step.js为webpack简易版本的藏身之处 hhh
4. dist作为最终打包之后的文件


## 二. 确定打包工具处理之后出现的数据格式 ##

1. 首先打包之后出现的数据格式不能依赖再node.js所以require()这个方法要重写
2. 要获取每个文件内的代码
3. 要对入口文件所require()的文件进行进一步处理形成规律数据
4. 所以我们要把文件处理成这样的数据格式  
```
    
    modules = {
        0: function (require, exports) {
            let action = require('./action.js').action;
            let name = require('./name').name;
    
            let message = `${name} is ${action}`;
            console.log(message);
        },
        1: function (require, exports) {
            let action = 'making webpack';
    
            exports.action = action;
        },
        2: function (require, exports) {
            let name = 'xia';
    
            exports.action = name;
        }
    }
    
    //执行模块，返回结果
    function exec(id) {
        let fn = modules[id];
        let exports = {};
        fn(require, exports);
    
        function require(path) {
            //todo...
            //根据模块路径，返回模块执行的结果
        }
    }
    
    exec(0)

```

5. 然后依靠这样的数据格式进一步进行处理

```
    modules = {
        0: [
            function (require, exports, module) {
                let action = require('./action.js').action;
                let name = require('./name.js').name;
    
                let message = `${action} nihao ${name}`
                console.log(message)
            },
            {
                './action.js': 1,
                './name.js': 2
            }
        ],
    
        1: [
            function (require, exports, module) {
                let action = 'making webpack'
    
                exports.action = action
            },
            {
    
            }
        ],
    
        2: [
            function (require, exports, module) {
                let name = 'xia'
    
                exports.name = name
            },
            {
    
            }
        ]
    }
    
    function exec(id) {
        let [fn, mapping] = modules[id];
    
        let exports = {};
    
        fn && fn(require, exports);
    
        function require(path) {
    
            return exec(mapping[path]);
    
        }
    
        return exports;
    }
    
    exec(0)

```

    代码说明  
        1. 0作为入口文件
        2. 重写require(导入)和exports(导出)他们在浏览器环境下也可以
        3. model是一种便于引用的数据格式
        4. exec函数才是重点  
            首先我们先把里面的函数和对象提取出来fn和mapping
                这两个参数你随意起名字只要是两个就行因为es6的特性对应的默认值  
            然后执行0作为入口的文件函数 他会遇到两个require()
            然后require()执行 根据引用的文件名字查找 文件所属的 id 和里面的内容
            然后id为1和id为2 的函数会将里面的输出的变量挂载在exports上
            于是的到action和name
            之后就是输出啦
    结束

## 三. 自动化处理 ##

有了对应的数据格式和我们需要的函数下一步就是将这个过程自动化  
这就需要一点点node知识很少 下面我会详细讲解



```
const  fs = require('fs')
const path = require('path')

let ID = 0

let fileContent = fs.readFileSync('./index.js', 'utf-8');
```



1. 引入node模块 `require('fs') and require('path')`  这其中一个是作为读取文件的模块另一个是作为理文件路径和目录路径的实用工具
2. readFileSync同步读取index.js内的内容并返回utf-8格式的字符串


```
function getDependencies(str) {
    let reg = /require\(['"](.+?)['"]\)/g;
    let result = null;
    let dependencies = [];
    while(result = reg.exec(str)) {
        dependencies.push(result[1]);
    }
    return dependencies;
}
```



3. 创建getDependencies函数  
4. 作用: 用正则函数循环提取require()内的文件地址并返回


```
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
```



5. createAsset函数作用: 创建具有独特id的特殊对象 对象解析如下



```
{  
    id: 独特标识  
    filename: 文件地址  
    dependencies：文件内部引用的文件地址的集合  
    code: 一个函数里面是文件内容  
}
```


```
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
    return queue;
}

数据格式
{ 
      id: 4,
      filename: 'name.js',
      dependencies: [],
      code:
            'function(require, exports, module) {\n            let  name = \'xia\'\r\n\r\nexports.name = name;\n        }',
      mapping: {}
}
```

6. 循环index.js引用的文件并对数据格式进行整理



```
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

```


7. writeFileSync作用: node中形成最终文件  
8. createBundle函数作用: 对已经整理的函数队形进行拼接


```
let graph = createGraph('./index.js');
createBundle(graph)
```

9. 函数执行 `node step.js`


<br />
<br />
<br />

## 项目[github地址](https://github.com/Xia121/webpackInit.git) ##

https://github.com/Xia121/webpackInit.git


