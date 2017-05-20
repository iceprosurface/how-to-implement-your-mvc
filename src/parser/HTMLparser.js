/**
 * HTML 编译模块
 * @module Parser
 */

import Element from './../core/compnoment/vdom/vm-dom'

/**
 * 检测输入的元素状态
 * @param {string} el templete字符串
 * @param {int} i index
 * @return {int} 0代表休止标签</，1代表起始标签<，2代表标签结束符,3代表其他字符
 */
export function check(el, i) {
    var curr = el[i]
    if (curr === '<') {
        if (i + 1 <= el.length && i + 1 > 0) {
            let next = el[i + 1]
            if (next === '/') {
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
 * @param {String} html html模板字符串
 * @return {Array} 解析栈，每一个元素都是独立标签
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
export function checkNode(node) {
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
export function TagParser(el) {
    // 第一个开始到第一个空格显然是 tagname
    var endIndex = el.indexOf(' ')
    // 如果不存在空格则说明全部都是字母或者需要的标签
    var name = el.substring(1, endIndex === -1 ? el.length - 1 : endIndex)
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
* 转化为 closeTag 名字
* @param {string} el templete字符串
* @return {string} 结束标签
*/
export function CloseTagParser(el) {
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

export function ElementParser(el, parent, stack, scope) {
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
                    ele.addChild(new Element('text', tag, ele, scope))
                    break
            }
        }
    }
    console.error('[syntax error]expect tag:', name, ',but not found. in \n', el)
    return false
}
