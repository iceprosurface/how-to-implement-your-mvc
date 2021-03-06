/**
 * vdom
 * @module vdom
 */

import { Porps } from '../props'
import { createImitElement } from './createElement'
import { createComponent } from './createComponent'
/**
 * @class Element
 * @prop {String} tag 标签名
 * @prop {Array} props 属性列表
 * @prop {Props} propsData 生成后的属性值
 * @prop {Object} scope 作用域
 * @prop {Element} parent 父元素
 * @prop {DomElement} $el 实体dom元素
 */
class Element {
    constructor(tag, props, parent, scope) {
        this.props = props
        if (Object.keys(scope.components).indexOf(tag) !== -1) {
            // 当不等于-1的情况下，说明是一个子组件，调用createComponent创建dom
            return createComponent(scope.components[tag], parent)
        }
        if (tag === 'text') {
            // text 元素
            this.propsData = new Porps([], scope, this)
            var temReg = /{{.*?}}/g
            var temStr = props
            var temMatchResult = temStr.match(temReg)
            if (temMatchResult) {
                temMatchResult.forEach((val) => {
                    // 首先要对遍历出的目标作出修正，首先是取出括号，随后去掉前后空格
                    scope.$data.on(val.substring(2, val.length - 2).trim(), this)
                })
            }         
        } else {
            this.propsData = new Porps(props, scope, this)
        }
        this.tag = tag
        this.parent = parent
        this.scope = scope
        this.children = []
        this.$el = null
    }
    /**
     * 添加子元素
     * @param {Element} ele 子元素
     */
    addChild(ele) {
        if (!this.isComponent) {
            this.children.push(ele)
        }
    }
    //深度优先算法
    //参考至 http://code.tutsplus.com/articles/data-structures-with-javascript-tree--cms-23393

    /**
     * 深度遍历回调函数
     * @callback Element~traverseDFCallback
     * @param {Element} currentNode 当前节点
     * @param {Element} parent 父亲节点
     */

    /**
     * 深度遍历元素
     * @param {Element~traverseDFCallback} callback 回调函数，每次遍历到元素时触发
     */
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
    /**
     * 创建元素
     */
    create () {
        this.$el = this.render()
        // 先挂载
        this.mount()
        
        this.children.forEach(function (_) {
            // 创建子元素
            _.create()
            // 挂载子子元素
            // _.mount()
        })
    }
    /**
     * 挂载元素
     */
    mount () {
        if (this.parent && this.parent.$el) {
            this.parent.$el.appendChild(this.$el)
        }
    }
    /**
     * 更新组件
     */
    update (scope) {
        // TODO：判断是否是组件！
        // 替换组件
        var newEl = this.render()
        this.parent.$el.replaceChild(newEl, this.$el)
        this.$el = newEl
    }
    render () {
        var option = {
            props: this.props,
            propsData: this.propsData,
            scope: this.scope,
            _this: this
        }
        return createImitElement(this.tag, option)
    }
    /**
     * 销毁组件或元素
     */
    destroy () {
        this.children.forEach(function (element) {
            element.destroy()
        })
        // 从scope中清除本对象的挂载
        // this.scope.off(this)
        // 其他清理工作
        this.$el.parentNode.removeChild(this.$el)
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
    /**
     * 广度遍历回调函数
     * @callback Element~traverseBFCallback
     * @param {Element} currentNode 当前节点
     * @param {Element} parent 父亲节点
     */

    /**
     * 广度遍历元素
     * @param {Element~traverseBFCallback} callback 回调函数，每次遍历到元素时触发
     */
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

export default Element
