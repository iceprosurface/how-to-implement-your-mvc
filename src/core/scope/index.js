import { update } from '../compnoment/update'

export function buildScope(scope) {
    var $data = {}
    for (var i in scope.$data) {
        buildOb($data, i, scope.$data[i])
    }
    return {
        $data,
        methods: scope.methods
    }
}

function buildOb(data, key, value) {
    // 暂不考虑数组方法
    if (value && typeof value !== 'string' && typeof value !== 'boolean' && typeof value !== 'number') {
        var buildTmpValue = {}
        for (var i in value) {
            buildOb(buildTmpValue, i, value[i])
        }
        value = buildTmpValue
    }
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function () { return value },
        set: function (newVal) {
            value = newVal
            update()
        }
    })
}
