var assert = require('assert')
import {buildScope} from 'src/core/scope'
describe('scope', () => {
    it('null of scope is {$data: {},methods: {},components: []}', () => {
        var scope = buildScope(null)
        assert.deepEqual({}, scope.$data)
        assert.deepEqual({}, scope.methods)
        assert.deepEqual([], scope.components)
    })
    describe('scope $data should be always on scope', () => {
        var scope = buildScope({
            $data: {
                a: 1,
                deepScope: {
                    deep1: [1, 2, 3]
                }
            }
        })
        console.log(scope.$data.deepScope)
        it('defult components=[],methods={}', () => {
            assert.deepEqual([], scope.components)
            assert.deepEqual({}, scope.methods)
        })
        it('scope.a must equal 1', () => {
            assert.equal(1, scope.a)
        })
        it('$data.a must equal a', () => {
            assert.equal(scope.a, scope.$data.a)
            assert.equal(scope.deepScope, scope.$data.deepScope)
        })

        it('$data.deepScope must be [1,2,3]', () => {
            // only need assert deepEqual
            assert.deepEqual([1, 2, 3], scope.deepScope.deep1)
        })
        

    })
})
