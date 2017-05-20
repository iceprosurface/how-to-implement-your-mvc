import {check, CloseTagParser} from 'src/parser/HTMLparser.js'
const assert = require('assert')

describe('HTMLparser', () => {
    // base
    describe('function check', () => {
        it('can be able to distinguish `</div>`', () => {
            assert.deepEqual(check('</div>', 0), 0)
        })
        it('can be able to distinguish `<div>`', () => {
            assert.deepEqual(check('<div>', 0), 1)
        })
        it('can be able to distinguish `>`', () => {
            assert.deepEqual(check('>', 0), 2)
        })
        it('can be able to distinguish `nothing` ', () => {
            assert.deepEqual(check('nothing', 0), 3)
        })
        it('can be able to distinguish `<`', () => {
            assert.deepEqual(check('<', 0), 1)
        })
    })
    describe('function CloseTagParser', () => {
        it('can be able to parse `</div>`', () => {
            assert.strictEqual(CloseTagParser('</div>'), 'div')
        })
        // it('can be able to warning if input `</div>>>`', () => {
        //    assert.deepEqual(CloseTagParser('<'), 'div')
        // })
    })


    // main feature
})
