
import {buildSyntac} from '../../parser/syntax'

export class Porps {
    constructor(props, scope) {
        var attributes = []
        var propAttributes = []
        var events = []
        var preMethods = []
        var methods = scope.methods
        var $data = scope.$data
        props.forEach((prop) => {
            var key = prop.key
            // 去掉头就是第一位啦！！
            var keyStr = key.substring(1, key.length)
            var value = prop.value
            // 属性绑定
            if (key.startsWith(':')) {
                var result = buildSyntac.bind(this, $data, value)
                if (!result) {
                    console.error('[method error] can`t find ', keyStr)
                    return
                }
                propAttributes.push({key: keyStr, value: result})
            } else if (key.startsWith('@')) {
                // 方法绑定      
                if (!methods.hasOwnProperty(value)) {
                    console.error('[method error] can`t find ', value)
                    return
                }
                events.push({key: keyStr, value: methods[value].bind($data)})
            } else if (key.startsWith('i-')) {
                // TODO: 未来需要添加一些诸如 i-for,i-if等等的功能就在这里实现啦
                
            } else {
                attributes.push({key, value})
            }
        })
        this.propAttributes = propAttributes
        this.attributes = attributes
        this.events = events
        this.preMethods = preMethods
    }
    bindProps(el) {
        this.propAttributes.forEach(_ => el.setAttribute(_.key, _.value()))
        this.attributes.forEach(_ => el.setAttribute(_.key, _.value))
        this.events.forEach(_ => el.addEventListener(_.key, _.value))
    }
}
