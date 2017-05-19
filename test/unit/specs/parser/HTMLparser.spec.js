import {check} from 'src/parser/HTMLparser.js'
const assert = require('assert')

describe('HTMLparser', () => {
    describe('check', () => {
        it('check function can distinguish `</div>`', () => {
            assert.deepEqual(check('</div>', 0), 0)
        })
        it('check function can distinguish `<div>`', () => {
            assert.deepEqual(check('<div>', 0), 1)
        })
        it('check function can distinguish `>`', () => {
            assert.deepEqual(check('>', 0), 2)
        })
        it('check function can distinguish `nothing` ', () => {
            assert.deepEqual(check('nothing', 0), 3)
        })
        it('<', () => {
            assert.deepEqual(check('<', 0), 1)
        })
    })
})
