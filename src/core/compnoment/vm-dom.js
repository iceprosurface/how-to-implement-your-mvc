/**
 * vm-dom
 * @module Element
 */

import { buildSyntac } from '../../parser/syntax'
import { Porps } from './props'

function vText(props, scope) {
    var temReg = /{{.*?}}/g
    var temStr = props
    var temMatchResult = temStr.match(temReg)
    if (temMatchResult) {
        temMatchResult.forEach((val) => {
            // 首先要对遍历出的目标作出修正，首先是取出括号，随后去掉前后空格
            var value = buildSyntac(scope.$data, val.substring(2, val.length - 2).trim())
            temStr = temStr.replace(val, value)
        })
    }
    return temStr
}

export default class Element {
    constructor(tag, props, parent, scope) {
        this.props = props
        if (tag === 'text') {
            // text 元素
            this.text = vText(props, scope)
            this.propsData = new Porps([], scope)            
        } else {
            this.propsData = new Porps(props, scope)
        }
        this.tag = tag
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
        function recurse(currentNode, parent) {
            if (currentNode.children) {
                for (var i = 0, length = currentNode.children.length; i < length; i++) {
                    recurse(currentNode.children[i], currentNode)
                }
            }
            callback(currentNode, parent)
        }
        recurse(this, this.parent)
    }
    // build dom 方法，使用递归遍历的方法将下级所有dom节点，并组装返回为树
    buildDom() {
        // TODO：判断是否是组件！
        if (this.tag === 'text') {
            return document.createTextNode(this.text)
        }

        var ele = document.createElement(this.tag)
        this.propsData.bindProps(ele)

        for (var i = 0, length = this.children.length; i < length; i++) {
            ele.appendChild(this.children[i].buildDom())
        }
        return ele
    }
    updateScope() {
        if (this.tag === 'text') {
            // text 元素
            this.text = vText(this.props, this.scope)
            this.propsData = new Porps([], this.scope)            
        } else {
            this.propsData = new Porps(this.props, this.scope)
        }
        // TODO：判断是否是组件！
        if (this.tag === 'text') {
            return document.createTextNode(this.text)
        }

        var ele = document.createElement(this.tag)
        this.propsData.bindProps(ele)

        for (var i = 0, length = this.children.length; i < length; i++) {
            ele.appendChild(this.children[i].updateScope())
        }
        return ele
    }
    //广度优先算法
    //参考至 http://code.tutsplus.com/articles/data-structures-with-javascript-tree--cms-23393
    traverseBF(callback) {
        //先访问本级节点->入栈
        //堆栈->取出最先放入节点->将该节点的孩子放入堆栈->执行操作
        var queue = []
        queue.push(this)
        currentNode = queue.shift()
        while (currentNode) {
            if (currentNode.children) {
                for (var i = 0, length = currentNode.children.length; i < length; i++) {
                    queue.push(currentNode.children[i])
                }
            }
            callback(currentNode)
            currentNode = queue.shift()
        }
    }
}
