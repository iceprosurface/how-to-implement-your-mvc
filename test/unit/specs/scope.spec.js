var assert = require('assert')
import {buildScope} from './../../../src/core/scope'
describe('scope', () => {
    it('null of scope is null', () => {
        assert.equal(undefined, buildScope(null).$data.x)
    })
})
