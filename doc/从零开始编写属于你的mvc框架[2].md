##从零开始编写属于你的前端mvc框架[2]

标签（空格分隔）： 编程学习

---

## 项目的工程化与基本架构

## 1. 前言

在前一篇中我们实现了基本的内容并发布了第一个release版本，但是显而易见的，这样一个结构对于长期维护是不太方便的，所以对项目作出一定的调整是必要的。

## 2. 项目工程化

### 2.1 webpack

我们的项目基本和绝大部分 spa 项目一致，只有一个html入口（即使有多个也没关系）

所以使用webpack是一个比较简单且良好的选择，首先我们的项目基本是一个完全的javascript项目，所以事实上，在短期内不太需要对css html的操作，我们只需要实现一个html入口即可。

接下来首先看看我们需要些什么？

1. babel 我们需要代码转义，事实上我们的代码使用了不少es6的特性（甚至我还想用typescript呢），我们需要babel对项目进行转码
2. eslint 没有一个开发者能保证自己的格式不出错，还是程序靠谱
3. mocha 没有单元测试的js不是好js（好吧现在可能确实不太需要）
4. hotload 怎么能没有热加载！难不成还要手动刷新不成!
5. jsdoc 我注释写这么好，自动生成文档吧！

那么基于以上几点先做个基本的配置吧

### 2.2 babel

暂时我们不知道具体会用什么但是一下几个加上总不会出错的

```json
{
  "presets": ["es2015", "stage-2"],
  "plugins": ["transform-runtime"],
  "comments": false
}
```

### 2.3 eslint
```javascript
{
    "extends": "standard",
    "plugins": [
        "standard",
        "promise"
    ],
    "rules": {
        "indent": ["error",4, { "SwitchCase": 1 }],
        "spaced-comment": "off",
        "no-trailing-spaces": "off",
        "space-before-function-paren": "off",
        "new-cap": "warn",
        "comma-dangle": "off",
        "no-undef": "off"
    }
}
```
首先我们从eslint standard继承一份配置过来然后稍稍改一下

1. promise：我们还是需要检测promise的，这里上个plugin
2. indent：缩进必须整整齐齐，上个4位差不多了，switch case就1倍即可
3. spaced-comment：对于comment我们就不检测了吧
4. no-trailing-spaces： 行末尾的空格我对这个需求不大，就去掉吧
5. new-cap： 构造函数大写，这个我不太喜欢，我设定的class都是小写的自然构造函数也是小写的，除非用工厂模式构建的否则显然不可能做到，也去除
6. comma-dangle：行末逗号是非常好用的功能，这得加上
7. no-undef： 提示未定义函数/变量，这个暂时还是去掉吧，有时候还是需要未定义直接使用的比如闭包引入等等

### 2.4 webpack-hot load

这里写个node即可，和官网教程[^1]没啥区别

```javascript
var config = require("./webpack.config.js");
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

config.entry.app.unshift("webpack-dev-server/client?http://localhost:8080/");

var compiler = webpack(config);
var server = new WebpackDevServer(compiler, {
    publicPath: config.output.publicPath,
    stats: {
        colors: true
    }
});
server.listen(8099);
```

最后记得在package.json中加上dev即可
```json
  "scripts": {
    "dev": "node config/dev-server.js"
  },
```
此外还有production环境的设置，这部分暂且停一下吧，等框架写过半自然会用上。

### 2.5 jsdoc

在之前相比都见过我使用的一些注释比如

```

/**
* 检测输入的元素状态
* @param {string} el templete字符串
* @param {int} i index
* @return {int} 0代表休止标签</，1代表起始标签<，2代表标签结束符,3代表其他字符
*/
```

这些注释在jsdoc中都是可以被准确识别，并编译成文档的，具体可以参见：[jsdoc 官方文档](http://www.css88.com/doc/jsdoc/about-configuring-jsdoc.html)

除了jsdoc以外，我们还需要个模板，因为原生的模板讲道理还是有点难看的，我是用的是docstrap ，[github地址](https://github.com/docstrap/docstrap)

按照官方文档进行简单配置以后就可以尝试生成文档啦，下面是效果图。

![image_1bdu5t78h5omqc6mio18huub59.png-90.6kB][1]





## 3. 项目的架构

此前我们是没有设计项目的基本架构的，事实上一个开发中的项目架构难免会发生变动，但是一开始的架构很大程度上限制了整个项目的复杂程度和划分。

对于架构首先需要分析项目的抽象结构是怎么样的。

1. parser类：这一类是用来处理html处理的类，在未来可以升级为
compiler类用来处理所有的模板等等
2. core类： 核心类，通常对于一些重要的实现都放在core类中如compnoment类，utils类等等
3. compnoment类：这一类是用来处理组件的类，此后用户所有的类都会继承自这一个类
4. util类：这一类主要用来存放一些工具，比如bug汇报器等等

大致暂定为这样

随后是项目的结构
```
|-test 项目测试用例
  |-测试对象名称
|-doc 文章存放处，包括一些零散的说明
  |-Api 通过jsdoc生成的项目api文档
|-src 项目源文件
  |-parser
  |-core
    |-util
    |-compnoment
  |-other
|-config 项目的设置文件

```

随后根据现在做出的内容进行修正吧！

## 4. 项目代码整理

### 4.1 模块的拆分

首先我们的main.js现在暂时还需要一边测试一边制作，所以还没有办法单独脱离开index.html。

不过现在为了方便起见，我们先把整个main.js全部拎出来。

### 4.1.1 parser模块

这个模块首先有个index.js,这个模块应该是没有任何类的，这个方法主要的目的是聚合方法，直接export方法即可,随后我们需要建立一个HTMLparser.js这个模块主要用来处理HTMLparser，当然咯这模块类的只是函数处理，不需要太多的功能

大致整合一下可以得出这个结果

```
import Element from '../core/compnoment/vm-dom'

/**
* 检测输入的元素状态
* @param {string} el templete字符串
* @param {int} i index
* @return {int} 0代表休止标签</，1代表起始标签<，2代表标签结束符,3代表其他字符
*/
function check(el, i) {
    var curr = el[i]
    if (curr === '<') {
        if (i + 1 <= el.length && i > 0) {
            let next = el[i + 1]
            if (next === '\\') {
                return 0
            }
        }
        return 1
    } else if (curr === '>') {
        return 2
    }
    return 3
}

/**
 * html编译器
 * @param {string} html html模板字符串
 */
export function HTMLParser(html) {
    var stack = []
    var start = 0
    //Single quotation marks "
    var sq = 0
    //Double quotation marks '
    var dq = 0
    //Brace left {
    var bl = 0
    //Brace right }
    var br = 0
    //IsDoing Task？
    var inTask = false
    /**
     * 初始化函数
     */
    var init = function () {
        inTask = false
        dq = sq = bl = br = 0
    }
    for (let i = 0; i < html.length; i++) {
        switch (check(html, i)) {
            case 0:
            case 1:
                // 开头是<
                if (inTask) {
                    console.error('[syntax error]on:', html.substr(0, i), ',sq:', sq, ',dq:', dq, ',bl:', bl, ',br:', br)
                    return stack
                } else {
                    stack.push(html.substring(start, i))
                    start = i
                    inTask = true
                }
                break
            case 2:
                //结束符号>
                if (!(sq % 2) && !(dq % 2) && br === bl) {
                    stack.push(html.substring(start, i + 1))
                    start = i + 1
                    init()
                }
                break
            case 3:
                // 其他符号累计计数器
                switch (html[i]) {
                    case '\'':
                        sq += 1
                        break
                    case '"':
                        dq += 1
                        break
                    case '{':
                        bl += 1
                        break
                    case '}':
                        br += 1
                        break
                }
        }
    }
    return stack
}

/**
* 检测输入的元素状态
* @param {string} node templete字符串
* @return {int} 0代表结束标签，1代表起始标签，3代表其他字符
*/
function checkNode(node) {
    if (node.indexOf('</') === 0) {
        return 0
    } else if (node.indexOf('<') === 0) {
        return 1
    } else {
        return 3
    }
}

/**
* 将tag解析为合适的数据格式
* @param {string} el templete字符串
* @return {string} name tag name
* @return {string} props 属性字符串，这在将来在做处理
*/
function TagParser(el) {
    // 第一个开始到第一个空格显然是 tagname
    var name = el.substring(1, el.indexOf(' '))
    // 第一个空格开始到最后一个>位置显然是全部的props
    var props = []
    var propstr = el.substring(el.indexOf(' ') + 1, el.lastIndexOf('>'))
    // 针对所有成对出现元素
    var regProp = /([:@]?\w[\w-]*="[^"]*?")|(([:@]?\w[\w-]*='[^']*?'))/g
    // 针对所有单项元素
    var regSingle = /(\s\w+(?=\s+|$))/g
    var matchs = propstr.match(regProp)
    // 这里是可以直接在用一次正则获取的，但算了算还要拼装还是直接用map吧
    if (matchs) {
        props = props.concat(matchs.map((r) => {
            var result = [r.substring(0, r.indexOf('=')), r.substring(r.indexOf('=') + 1, r.length)]
            result[1] = result[1].substring(1, result[1].length - 1)
            return { key: result[0], value: result[1] }
        }))
    }
    matchs = propstr.match(regSingle)
    if (matchs) {
        props = props.concat(matchs.map((r) => {
            return { key: r.trim(), value: true }
        }))
    }
    return { name, props }
}
/**
* 判断是否是闭合标签
*/
function CloseTagParser(el) {
    return el.substring(el.indexOf('/') + 1, el.lastIndexOf('>'))
}

export function HTMLCompnonentParser(scope, stack, parent) {
    var root = new Element('div', [], parent, scope)
    while (stack.length > 0) {
        var tag = stack.shift().trim()
        if (tag) {
            switch (checkNode(tag)) {
                case 0:
                    // root ele 必然没有close tag 如果出现说明出错
                    var closeTag = CloseTagParser(tag)
                    console.error('[syntax error]unexpect close tag:', closeTag, '.')
                    break
                case 1:
                    var child = ElementParser(tag, root, stack, scope)
                    if (!child) return false
                    root.addChild(child)
                    break
                case 3:
                    root.addChild(new Element('text', tag, parent))
                    break
            }
        }
    }
    return root
}

function ElementParser(el, parent, stack, scope) {
    var { name, props } = TagParser(el)
    var ele = new Element(name, props, parent, scope)
    while (stack.length > 0) {
        var tag = stack.shift().trim()
        if ([].indexOf(name) !== -1) {

        } else if (tag) {
            switch (checkNode(tag)) {
                case 0:
                    var closeTag = CloseTagParser(tag)
                    if (closeTag !== name) {
                        console.error('[syntax error]expect tag:', name, ',but found:', closeTag, '.in \n', el)
                        return false
                    } else {
                        return ele
                    }
                case 1:
                    var child = ElementParser(tag, ele, stack, scope)
                    if (!child) {
                        return false
                    }
                    ele.addChild(child)
                    break
                case 3:
                    ele.addChild(new Element('text', tag, parent, scope))
                    break
            }
        }
    }
    console.error('[syntax error]expect tag:', name, ',but not found. in \n', el)
    return false
}

```





[^1]: webpack,WEBPACK DEV SERVER.[http://webpack.github.io/docs/webpack-dev-server.html](http://webpack.github.io/docs/webpack-dev-server.html),2017.


  [1]: http://static.zybuluo.com/iceprosurface/sx40zmxlx8i7qkm3jym14yti/image_1bdu5t78h5omqc6mio18huub59.png
