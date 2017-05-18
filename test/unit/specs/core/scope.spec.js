var assert = require('assert')
import {buildScope} from 'src/core/scope'
describe('scope', () => {
    it('null of scope is {$data: {},methods: {},components: []}', () => {
        var nullScope = buildScope(null)
        assert.deepEqual({}, nullScope.$data)
        assert.deepEqual({}, nullScope.methods)
        assert.deepEqual([], nullScope.components)
    })

    it('default components=[],methods={} when only input $data', () => {
        var defaultScope = buildScope({$data: {}})
        assert.deepEqual([], defaultScope.components)
        assert.deepEqual({}, defaultScope.methods)
    })

    var scope = buildScope({
        $data: {
            a: 1,
            deepScope: {
                deep1: [1, 2, 3]
            },
            $data: '$data',
            methods: 'methods',
            components: 'components'
        },
        methods: {
            getThis(){
                return this
            },
            $data() {
                return '$data'
            },
            methods() {
                return 'methods'
            },
            components() {
                return 'components'
            },
        }
    })

    describe('scope $data should be always on scope', () => {

        it('scope.a must equal 1', () => {
            assert.equal(1, scope.a)
        })

        it('$data.a must equal a', () => {
            assert.strictEqual(scope.a, scope.$data.a)
            assert.strictEqual(scope.deepScope, scope.$data.deepScope)
        })

        it('set scope.a = 2, $data.a must be 2', () => {
            scope.a = 2
            assert.equal(2, scope.$data.a)
            assert.equal(2, scope.a)
        })

        it('$data.deepScope must be [1,2,3]', () => {
            // only need assert deepEqual
            assert.deepEqual([1, 2, 3], scope.deepScope.deep1)
        })

        it('set scope.a = 2, $data.a must be 2', () => {
            scope.a = 2
            assert.equal(2, scope.$data.a)
            assert.equal(2, scope.a)
        })

        it('the root of scope never maps $data,methods,components and _list,', () => {
            assert.equal('$data', scope.$data.$data)
            assert.equal('methods', scope.$data.methods)
            assert.equal('components', scope.$data.components)
            assert.equal('$data', scope.methods.$data())
            assert.equal('methods', scope.methods.methods())
            assert.equal('components', scope.methods.components())
            assert.ok(scope.$data._list)
            assert.notEqual(scope.$data, scope.$data.$data)
            assert.notEqual(scope.methods, scope.$data.methods)
            assert.notEqual(scope.components, scope.$data.components)
            assert.equal(undefined, scope._list)
        })

        it('scope`s method should be always on scope,and method`s scope must be `scope`', () => {
            let fnScope = scope.getThis
            assert.strictEqual(scope, scope.getThis())
            assert.strictEqual(scope.methods.getThis, fnScope)
        })
    })
    var el_flg_1 = false
    var el_flg_2 = false
    var el_flg_3 = false
    var el_flg_4 = false
    
    // create a object element for test
    var element_1 = {
        update () {
            el_flg_1 = true
        }
    }
    var element_2 = {
        update () {
            el_flg_2 = true
        }
    }
    var element_3 = {
        update () {
            el_flg_3 = true
        }
    }
    var element_4 = {
        update () {
            el_flg_4 = true
        }
    }
    var Observer = scope.$data
    Observer.on('a', element_1)
    Observer.on('a', element_2)
    Observer.on("deepScope", element_3)
    Observer.on("deleteScope", element_4)
    describe('Observer should have on,off,emit', () => {
        describe('function on', () => {
            it('when Observer.on("a",element_1),Observer.on("a", element_2),answer is [element_1, element_2]', () => {
                assert.deepEqual([element_1, element_2], Observer._list.a)
            })
        })
        describe('function emit before off', () => {
            it('when Observer.emit("deepScope"),el_flg_3 is true', () => {
                Observer.emit("deepScope",  _ => _.update())
                assert.strictEqual(true, el_flg_3)
            })
            it('when Observer.emit("a"),el_flg_1 and el_flg_1 is true', () => {
                Observer.emit("a",  _ => _.update())
                assert.strictEqual(true, el_flg_1)
                assert.strictEqual(true, el_flg_2)
            })
        })
        describe('function off', () => {
            beforeEach(function () {
                // 如果是空就加载内容
                if (Observer._list.deleteScop) {
                    Observer.on("deleteScope", element_4)
                }
            })

            it('before Observer.off("deleteScope",element_4),Observer._list.deleteScope is [element_4]', () => {
                assert.deepEqual([element_4], Observer._list.deleteScope)
            })

            it('when off unknow name/element, nothing happen', () => {
                var result = Observer.off("deleteScope", element_3)
                assert.deepEqual([element_4], Observer._list.deleteScope)
            })

            it('when Observer.off("deleteScope",element_4)Observer._list.a is []', () => {
                Observer.off("deleteScope", element_4)
                assert.deepEqual([], Observer._list.deleteScope)
            })

        })
    })

    // reset
    describe('Observer should respond changes when scope.$data changed', () => {

        it('when newVal is equal to old, nothing change', () => {
            el_flg_1 = false
            el_flg_2 = false
            Observer.a = Observer.a
            assert.strictEqual(false, el_flg_1)
            assert.strictEqual(false, el_flg_2)
        })
        it('when newVal has been changed, flag will be true', () => {
            Observer.a = 1        
            assert.strictEqual(true, el_flg_1)
            assert.strictEqual(true, el_flg_2)
        })
    })
    
})
