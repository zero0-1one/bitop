'use strict'
const LargeNumber = require('../index')
const { its } = require('zo-mocha-ext')
const { assert } = require('chai')

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function slice(str, begin, end, tail = 0) {
  if (begin < 0) begin = 0
  if (end < 0) end = 0
  str = str.slice(begin, end)
  if (tail > 0) str += new Array(tail).fill('0').join('')
  return str.padStart(53, '0').slice(-53)
}

const randomFunctions = [
  () => randomInt(0, Math.pow(2, 16)),
  () => randomInt(0, Math.pow(2, 32)),
  () => randomInt(0, Math.pow(2, 53) - 1),
  () => randomInt(Math.pow(2, 20), Math.pow(2, 40)),
  () => randomInt(Math.pow(2, 32), Math.pow(2, 50)),
  () => randomInt(0, 0)
]

let N = 20000
describe('config', function() {
  its(N, 'constructor', function() {
    for (const func of randomFunctions) {
      let num = func()
      let lnum1 = new LargeNumber(num)
      let lnum2 = new LargeNumber(num)
      let lnum3 = new LargeNumber(lnum1)
      assert.equal(lnum1.val, lnum2.val)
      assert.equal(lnum1.val, lnum3.val)
    }
  })

  its(N, 'val', function() {
    for (const func of randomFunctions) {
      let num = func()
      let lnum = new LargeNumber(num)
      assert.equal(num, lnum.val)
    }
  })

  its(N, '>>  and >>=', function() {
    for (const func of randomFunctions) {
      let n = randomInt(0, 53)
      let num = func()
      let binary = num.toString(2)
      let lnum = new LargeNumber(num)

      assert.equal(slice(binary, 0, binary.length - n), lnum['>>'](n).binary(), `${binary}(${binary.length}) >> ${n}`)
      lnum['>>='](n)
      assert.equal(slice(binary, 0, binary.length - n), lnum.binary(), `${binary}(${binary.length}) >>= ${n}`)
    }
  })

    its(N, '<< and <<=', function() {
      for (const func of randomFunctions) {
        let n = randomInt(0, 53)
        let num = func()
        let binary = num.toString(2)
        let lnum = new LargeNumber(num)

        assert.equal(slice(binary, 0, binary.length, n), lnum['<<'](n).binary(), `${binary}(${binary.length}) << ${n}`)
        lnum['<<='](n)
        assert.equal(slice(binary, 0, binary.length, n), lnum.binary(), `${binary}(${binary.length}) <<= ${n}`)
      }
    })

    its(N, '>>> and >>>=', function() {
      for (const func of randomFunctions) {
        let n = randomInt(0, 53)
        let num = func()
        let binary = num.toString(2)
        let lnum = new LargeNumber(num)

        assert.equal(slice(binary, 0, binary.length - n), lnum['>>>'](n).binary(), `${binary}(${binary.length}) >>> ${n}`)
        lnum['>>>='](n)
        assert.equal(slice(binary, 0, binary.length - n), lnum.binary(), `${binary}(${binary.length}) >>>= ${n}`)
      }
    })

    its(N / 10, '| and |=', function() {
      for (const func1 of randomFunctions) {
        for (const func2 of randomFunctions) {
          let num1 = func1()
          let num2 = func2()

          let binary1 = num1.toString(2).padStart(53, '0')
          let binary2 = num2.toString(2).padStart(53, '0')

          let lnum1 = new LargeNumber(num1)
          let lnum2 = new LargeNumber(num2)
          let binary = ''
          for (let i = 0; i < 53; i++) {
            binary += binary1[i] == '1' || binary2[i] == '1' ? '1' : '0'
          }

          assert.equal(binary, lnum1['|'](num2).binary(), `${binary1}  | ${binary2}`)
          lnum1['|='](num2)
          assert.equal(binary, lnum1.binary(), `${binary1}  |= ${binary2}`)

          lnum1 = new LargeNumber(num1)
          assert.equal(binary, lnum1['|'](lnum2).binary(), `${binary1}  | ${binary2}`)
          lnum1['|='](lnum2)
          assert.equal(binary, lnum1.binary(), `${binary1}  |= ${binary2}`)
        }
      }
    })

    its(N / 10, '& and &=', function() {
      for (const func1 of randomFunctions) {
        for (const func2 of randomFunctions) {
          let num1 = func1()
          let num2 = func2()

          let binary1 = num1.toString(2).padStart(53, '0')
          let binary2 = num2.toString(2).padStart(53, '0')

          let lnum1 = new LargeNumber(num1)
          let lnum2 = new LargeNumber(num2)
          let binary = ''
          for (let i = 0; i < 53; i++) {
            binary += binary1[i] == '1' && binary2[i] == '1' ? '1' : '0'
          }

          assert.equal(binary, lnum1['&'](num2).binary(), `${binary1}  & ${binary2}`)
          lnum1['&='](num2)
          assert.equal(binary, lnum1.binary(), `${binary1}  &= ${binary2}`)

          lnum1 = new LargeNumber(num1)
          assert.equal(binary, lnum1['&'](lnum2).binary(), `${binary1}  & ${binary2}`)
          lnum1['&='](lnum2)
          assert.equal(binary, lnum1.binary(), `${binary1}  &= ${binary2}`)
        }
      }
    })

    its(N / 10, '^ and ^=', function() {
      for (const func1 of randomFunctions) {
        for (const func2 of randomFunctions) {
          let num1 = func1()
          let num2 = func2()

          let binary1 = num1.toString(2).padStart(53, '0')
          let binary2 = num2.toString(2).padStart(53, '0')

          let lnum1 = new LargeNumber(num1)
          let lnum2 = new LargeNumber(num2)
          let binary = ''
          for (let i = 0; i < 53; i++) {
            binary += binary1[i] != binary2[i] ? '1' : '0'
          }
          assert.equal(binary, lnum1['^'](num2).binary(), `${binary1}  ^ ${binary2}`)
          lnum1['^='](num2)
          assert.equal(binary, lnum1.binary(), `${binary1}  ^= ${binary2}`)

          lnum1 = new LargeNumber(num1)
          assert.equal(binary, lnum1['^'](lnum2).binary(), `${binary1}  ^ ${binary2}`)
          lnum1['^='](lnum2)
          assert.equal(binary, lnum1.binary(), `${binary1}  ^= ${binary2}`)
        }
      }
    })

    its(N, 'not and notSelf', function() {
      for (const func1 of randomFunctions) {
        let num1 = func1()

        let binary1 = num1.toString(2).padStart(53, '0')

        let lnum1 = new LargeNumber(num1)
        let binary = ''
        for (let i = 0; i < 53; i++) {
          binary += binary1[i] == '0' ? '1' : '0'
        }

        assert.equal(binary, lnum1.not().binary(), `~= ${binary1}`)
        lnum1.notSelf()
        assert.equal(binary, lnum1.binary(), `~${binary1}`)
      }
    })
})
