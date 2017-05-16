/**
 * vdom
 * @module vdom
 */
import { buildSyntax } from '../../../parser/syntax'

/**
 * 创建一个 Imit dom对象
 * @param {String} tag 标签名称
 * @param {Object} option 额外内容，包括作用域，属性/属性列表
 * @returns {domElement} 返回的是一个已经绑定完所有内容的dom对象 
 */
export function createImitElement(tag, option) {
    if (tag === 'text') {
        return TextElement(option.props, option.scope)
    } else {
        return NodeElement(tag, option.propsData, option.scope)
    }
}

function NodeElement (tag, propsData) {
    var el = document.createElement(tag)
    propsData.bindProps(el)
    return el
}

function TextElement(props, scope) {
    var temReg = /{{.*?}}/g
    var temStr = props
    var temMatchResult = temStr.match(temReg)
    if (temMatchResult) {
        temMatchResult.forEach((val) => {
            // 首先要对遍历出的目标作出修正，首先是取出括号，随后去掉前后空格
            var value = buildSyntax(scope, val.substring(2, val.length - 2).trim())()
            temStr = temStr.replace(val, value)
        })
    }
    return document.createTextNode(temStr)
}
