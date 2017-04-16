var templete = `
<div class="contacts-wrap flex">
    <a :href='contact.url' class="flex">
      <div class="contacts-number"></div>
      <div class="detailed">{{contact.title}}</div>
      <div class="()=>{return function(){cc}}">{{contact.num}}</div>
    </a>
  <div class="panel-title">实时动态</div>
  <div class="statistics-wrap flex">
    <div class="statistics-detailed">{{item.title}}</div>
    <div class="statistics-number" @click="testClick">{{item.count}}</div>
    <a :href="item.url">立即查看</a>
  </div>
</div>
`

// 用于递归取出合适的object对象
function canGetO(o,arr){
    if(arr.length > 0){
        var n = arr.shift()
        if(o[n])
            // 数组存在继续遍历
            return canGetO(o[n],arr)
        else
            // 数组存在,但是没有内容,0,false,或者其他为非情况
            return false
    }else{
        return o
    }
}
function buildSyntac(obj,str){
  var o = str.split(/[\.\[\]]\.?/)
  var content = canGetO(obj,o)
  if(content !== false){
      // 说明字段存在,返回字段
      return content
  }else{
      return false
      console.warn("[parser error]:can`t get obj,while finding '",str,"'")
  }
}

class element {
  constructor(tag, props, parent, scope) {
    this.tag = tag
    this.props = props
    this.parent = parent
    this.scope = scope
    this.children = []
  }
  addChild(ele) {
    this.children.push(ele)
  }
  //深度优先算法
  //参考至 http://code.tutsplus.com/articles/data-structures-with-javascript-tree--cms-23393
  traverseDF(callback) {
    (function recurse(currentNode,parent) {
      if (currentNode.children) {
        for (var i = 0, length = currentNode.children.length; i < length; i++) {
          recurse(currentNode.children[i],currentNode);
        }
      }
      callback(currentNode,parent);
    })(this,this.parent);
  }
  // build dom 方法，使用递归遍历的方法将下级所有dom节点，并组装返回为树
  buildDom(){
    var methods = this.scope.methods
    var $data = this.scope.$data
    if(this.tag == "text"){
      // text 元素
      var temReg = /{{.*?}}/g
      var temStr = this.props
      var temMatchResult = temStr.match(temReg)
      if(temMatchResult) 
        temMatchResult.forEach((val)=>{
          // 首先要对遍历出的目标作出修正，首先是取出括号，随后去掉前后空格
          var value = buildSyntac($data,val.substring(2,val.length-2).trim())
          temStr = temStr.replace(val,value)
        })
      return document.createTextNode(temStr)
    }
    var ele = document.createElement(this.tag)
    this.props.forEach((prop)=>{
      var key = prop.key
      // 去掉头就是第一位啦！！
      var keyStr = key.substring(1,key.length)
      var value = prop.value
      // 属性绑定
      if(key.startsWith(':')){
        var result = buildSyntac($data,value)
        if(!result){
          console.error("[method error] can`t find ",keyStr)
          return
        }
        ele.setAttribute(keyStr,result)  
      } else if(key.startsWith('@')){
        // 方法绑定      
        if(!methods.hasOwnProperty(value)){
          console.error("[method error] can`t find ",value)
          return
        }
        ele.addEventListener(keyStr,methods[value].bind($data))
      }else{
        ele.setAttribute(key,value)
      }
    })
    for (var i = 0, length = this.children.length; i < length; i++) {
      ele.appendChild(this.children[i].buildDom())
    }
    return ele
  }
  //广度优先算法
  //参考至 http://code.tutsplus.com/articles/data-structures-with-javascript-tree--cms-23393
  traverseBF(callback) {
    //先访问本级节点->入栈
    //堆栈->取出最先放入节点->将该节点的孩子放入堆栈->执行操作
    var queue = [];
    queue.push(this);
    currentNode = queue.shift();
    while (currentNode) {
      if (currentNode.children) {
        for (var i = 0, length = currentNode.children.length; i < length; i++) {
          queue.push(currentNode.children[i]);
        }
      }
      callback(currentNode);
      currentNode = queue.shift();
    }
  }
}


/**
* 检测输入的元素状态
* @param {string} el templete字符串
* @param {int} i index
* @return {int} 0代表休止标签</，1代表起始标签<，2代表标签结束符,3代表其他字符
*/
function check(el, i) {
  var curr = el[i]
  if (curr == "<") {
    if (i + 1 <= el.length && i > 0) {
      let next = el[i + 1]
      if (next == '\\')
        return 0
    }
    return 1
  } else if (curr == ">") {
    return 2
  }
  return 3
}
/**
 * html编译器
 * @param {string} html html模板字符串
 */
function HTMLParser(html) {
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
      case 0, 1:
        // 开头是<
        if (inTask) {
          console.error("[syntax error]on:", html.substr(0, i), ",sq:", sq, ",dq:", dq, ",bl:", bl, ",br:", br)
          return stack
        } else {
          stack.push(html.substring(start, i))
          start = i
          inTask = true
        }
        break
      case 2:
        //结束符号>
        if (!(sq % 2) && !(dq % 2) && br == bl) {
          stack.push(html.substring(start, i + 1))
          start = i + 1
          init()
        }
        break
      case 3:
        // 其他符号累计计数器
        switch (html[i]) {
          case "'":
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

function HTMLCompnonentParser(scope, stack, parent) {
  var root = new element("div", [], parent, scope);
  while (stack.length > 0) {
    var tag = stack.shift().trim()
    if (tag) {
      switch (checkNode(tag)) {
        case 0:
          // root ele 必然没有close tag 如果出现说明出错
          var closeTag = CloseTagParser(tag)
          console.error("[syntax error]unexpect close tag:", closeTag, ".")
          break
        case 1:
          var child = ElementParser(tag, root, stack, scope)
          if (!child) return false
          root.addChild(child)
          break
        case 3:
          root.addChild(new element("text", tag, parent))
          break
      }
    }
  }
  return root
}
/**
* 检测输入的元素状态
* @param {string} node templete字符串
* @return {int} 0代表结束标签，1代表起始标签，3代表其他字符
*/
function checkNode(node) {
  if (node.indexOf("</") == 0) {
    return 0
  } else if (node.indexOf("<") == 0) {
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
  var name = el.substring(1, el.indexOf(" "))
  // 第一个空格开始到最后一个>位置显然是全部的props
  var props = []
  var propstr = el.substring(el.indexOf(" ") + 1, el.lastIndexOf(">"))
  // 针对所有成对出现元素
  var regProp = /([:\@]?\w[\w-]*\=\"[^\"]*?\")|(([:\@]?\w[\w-]*\=\'[^\']*?\'))/g
  // 针对所有单项元素
  var regSingle = /(\s\w+(?=\s+|$))/g
  var matchs = propstr.match(regProp)
  // 这里是可以直接在用一次正则获取的，但算了算还要拼装还是直接用map吧
  if (matchs) props = props.concat(matchs.map((r) => {
    var result = [r.substring(0, r.indexOf('=')), r.substring(r.indexOf('=') + 1, r.length)]
    result[1] = result[1].substring(1, result[1].length - 1)
    return { key: result[0], value: result[1] }
  }))
  matchs = propstr.match(regSingle)
  if (matchs) props = props.concat(matchs.map((r) => {
    return { key: r.trim(), value: true }
  }))
  return { name, props }
}
/**
* 检测输入的元素状态
* @param {string} node templete字符串
* @return {int} 0代表结束标签，1代表起始标签，3代表其他字符
*/
function CloseTagParser(el) {
  return el.substring(el.indexOf("/") + 1, el.lastIndexOf(">"))
}
function ElementParser(el, parent, stack, scope) {
  var { name, props } = TagParser(el)
  var ele = new element(name, props, parent, scope);
  while (stack.length > 0) {
    var tag = stack.shift().trim()
    if ([].indexOf(name) != -1) {

    } else if (tag) {
      switch (checkNode(tag)) {
        case 0:
          var closeTag = CloseTagParser(tag)
          if (closeTag != name) {
            console.error("[syntax error]expect tag:", name, ",but found:", closeTag, ".in \n", el)
            return false
          } else {
            return ele
          }
          break
        case 1:
          var child = ElementParser(tag, ele, stack, scope)
          if (!child) return false
          ele.addChild(child)
          break
        case 3:
          ele.addChild(new element("text", tag, parent, scope))
          break
      }
    }
  }
  console.error("[syntax error]expect tag:", name, ",but not found. in \n", el)
  return false
}

var scope = {
    $data: {
        'item':{
            'title': 'you name',
            'count': 1,
            'url': "www.baidu.com",
        },
        'contact': {
            'url': "www.iceprosurface.com",
            "num": 2
        }
    },
    methods: {
        testClick(){
            console.log("u clicked!")
            console.log("this now is ",this)
            this.item.title = 2222
        }
    }
}
function buildScope (scope){
  var $data = {}
  for(var i in scope.$data){
   	buildOb($data,i,scope.$data[i])
  }
  return {
    $data,
    methods:scope.methods
  }
}
function buildOb(data,key,value){
  // 暂不考虑数组方法
  if(value && typeof value != 'string' && typeof value != 'boolean' && typeof value != 'number'){
    var buildTmpValue = {}
    for(var i in value){
      buildOb(buildTmpValue,i,value[i])
    }
    value = buildTmpValue
  }
	Object.defineProperty(data,key,{
    enumerable: true,
    configurable: true,
		get: function (){return value},
		set: function (newVal){ value = newVal;update()}
	})
}

var vir = HTMLCompnonentParser(buildScope(scope), HTMLParser(templete), null)
console.log(buildScope(scope))

function update(){
  document.getElementById("app").innerHTML = ""
  document.getElementById("app").appendChild(vir.buildDom())
}
  document.getElementById("app").appendChild(vir.buildDom())

// class componment {
//   $mount(){
//     var stack = HTMLParser(this.templete)
//     // 先解析成虚拟dom
//     var virtual = HTMLCompnonentParser(this.data(),stack,null)
//   }
// }

// class helloCompnoment extends componment {
//   get name() {
//     return "hello"
//   }
//   get templete(){
//     return `
//       <div>
//         {{message}}
//       </div>
//     `
//   }
//   data(){
//     return {
//       "message":"hello"
//     }
//   }
// }






//=======test data
// _data = {x:3,y:4}
// data = {}
// for(var i in _data){
// 	build(data,i,_data[i])
// }

// function build(data,key,value){
// 	var deps = []
// 	var value
// 	Object.defineProperty(data,i,{
//         enumerable: true,
//     	configurable: true,
// 		get: function (){return value},
// 		set: function (newVal){ value = newVal;walk(deps,newVal)}
// 	})
// }
// function walk(deps,newVal){console.log(newVal)}

