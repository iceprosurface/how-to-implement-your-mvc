// 用于递归取出合适的object对象
function canGetO(o, arr) {
    if (arr.length > 0) {
        var n = arr.shift()
        if (o[n]) {
            // 数组存在继续遍历
            return canGetO(o[n], arr)
        } else {
            // 数组存在,但是没有内容,0,false,或者其他为非情况
            return false
        }
    } else {
        return o
    }
}

export function buildSyntac(obj, str) {
    var o = str.split(/[\.\[\]]\.?/)
    var content = canGetO(obj, o)
    if (content !== false) {
        // 说明字段存在,返回字段
        return content
    } else {
        console.warn('[parser error]:can`t get obj,while finding ', str, '\'')
        return false
    }
}
