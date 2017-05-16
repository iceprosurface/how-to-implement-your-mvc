// 用于递归取出合适的object对象
// function canGetO(o, arr) {
//     if (arr.length > 0) {
//         var n = arr.shift()
//         if (o[n]) {
//             // 数组存在继续遍历
//             return canGetO(o[n], arr)
//         } else {
//             // 数组存在,但是没有内容,0,false,或者其他为非情况
//             return false
//         }
//     } else {
//         return o
//     }
// }

// export function buildSyntac(obj, str) {
//     var o = str.split(/[\.\[\]]\.?/)
//     var content = canGetO(obj, o)
//     if (content !== false) {
//         // 说明字段存在,返回字段
//         return content
//     } else {
//         console.warn('[parser error]:can`t get obj,while finding ', str, '\'')
//         return false
//     }
// }

export function buildSyntax (scope, template) {
    if (!/[\n;]/.test(template)) {
        template = 'return (' + template + ')'
    }
    var fn = new Function(...Object.keys(scope), template)
    return fn.bind(scope, ...Object.keys(scope).map(_ => {
        if (Object.prototype.toString.call(scope[_]).toLowerCase() === '[object function]') {
            return scope[_].bind(scope)
        } else { 
            return scope[_]
        }
    }))
}
