// import { update } from '../compnoment/update'

export function buildScope(scope) {
    var $data = new Observer()
    for (var i in scope.$data) {
        buildOb($data, $data, i, scope.$data[i])
    }
    return {
        $data,
        methods: scope.methods,
        components: []
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
    // 暂不考虑数组方法
    if (value && typeof value !== 'string' && typeof value !== 'boolean' && typeof value !== 'number') {
        var buildTmpValue = {}
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
