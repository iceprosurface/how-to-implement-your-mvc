import { HTMLParser, HTMLCompnonentParser } from './../../../parser/HTMLparser'
import { buildScope } from './../../scope'
export function createComponent (component, parent) {
    var vmDom = HTMLCompnonentParser(buildScope(component.scope), HTMLParser(component.templete), parent)
    //设定对象为组件
    vmDom.isComponent = true
    return vmDom
}
