// import { update } from '../compnoment/update'
const invalidData = [ '$data', 'methods', 'components', '_list' ]
export function buildScope(scope) {
    if (!scope) {
        return {
            $data: {},
            methods: {},
            components: []
        }
    }
    var $data = new Observer()
    var methods = scope.methods ? scope.methods : {}
    var components = scope.components ? scope.components : []
    for (var i in scope.$data) {
        buildOb($data, $data, i, scope.$data[i])
    }
    // scope 对象
    var scopes = {
        $data,
        methods,
        components 
    }
    // 映射所有可见内容到scope
    for (var data in $data) {
        if (invalidData.indexOf(data) === -1) {
            var getFn = GetFn($data, data)
            var setFn = SetFn($data, data)
            Object.defineProperty(scopes, data, {
                enumerable: true,
                configurable: true,
                get: getFn,
                set: setFn
            })
        }
    }
    for (var method in methods) {
        if (invalidData.indexOf(method) === -1) {
            var getFn = GetFn(methods, method)
            var setFn = SetFn(methods, method)
            Object.defineProperty(scopes, method, {
                enumerable: true,
                configurable: true,
                get: function () { return methods[method] },
                set: function (newVal) { methods[method] = newVal } 
            })
        }
    }
    return scopes
}

function GetFn ($data, data) {
    return function () { return $data[data] }
}

function SetFn ($data, data) {
    return function($data, data){
        return function (newVal) { $data[data] = newVal } 
    }
}

class Observer {
    constructor () {
        this._list = {}
    }
    on (name, element) {
        if (!this._list[name]) {
            this._list[name] = []
        }
        if (this._list[name].indexOf(element) === -1) {
            this._list[name].push(element)
        }
    }
    off (name, element) {
        var index = -1
        if (!this._list[name]) {
            return
        } else {
            index = this._list[name].indexOf(element)
        }
        if (index !== -1) {
            this._list[name].splice(index, 1)
        }
    }
    emit (name, callback) {
        if (!this._list[name]) {
            return
        }
        var noneList = []
        this._list[name].forEach(function(element, index) {
            if (element) {
                callback(element)
            } else {
                noneList.push(index)
            }
        }, this)
    }
}

/**
 * 创建一个观察者模型
 * @param {Object} data 用来放置被绑定元素的对象
 * @param {String} key 键
 * @param {any} value 具体的值
 */
function buildOb(root, data, key, value, parentKey) {
    // 首个元素之间使用key
    var event = parentKey ? parentKey + '.' + key : key
    if (value && typeof value !== 'string' && typeof value !== 'boolean' && typeof value !== 'number') {
        var buildTmpValue = {}
        if (Object.prototype.toString.call(value).toLowerCase() === '[object array]') {
            buildTmpValue = []
        }
        for (var i in value) {
            buildOb(root, buildTmpValue, i, value[i], key)
        }
        value = buildTmpValue
    }
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function () { return value },
        set: function (newVal) {
            value = newVal
            root.emit(event, _ => _.update())
            // update()
        }
    })
}
