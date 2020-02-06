'use strict'
const LN = require('../index')
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

describe('Large number Class', function () {
  its(N, 'constructor', function () {
    for (const func of randomFunctions) {
      let num = func()
      let lnum1 = new LN(num)
      let lnum2 = new LN(num)
      let lnum3 = new LN(lnum1)
      assert.equal(lnum1.val, lnum2.val)
      assert.equal(lnum1.val, lnum3.val)
    }
  })

  its(N, 'val', function () {
    for (const func of randomFunctions) {
      let num = func()
      let lnum = new LN(num)
      assert.equal(num, lnum.val)
    }
  })

  its(N, '>>  and >>=', function () {
    for (const func of randomFunctions) {
      let n = randomInt(0, 53)
      let num = func()
      let binary = num.toString(2)
      let lnum = new LN(num)

      assert.equal(slice(binary, 0, binary.length - n), lnum['>>'](n).binary(), `${binary}(${binary.length}) >> ${n}`)
      lnum['>>='](n)
      assert.equal(slice(binary, 0, binary.length - n), lnum.binary(), `${binary}(${binary.length}) >>= ${n}`)
    }
  })

  its(N, '<< and <<=', function () {
    for (const func of randomFunctions) {
      let n = randomInt(0, 53)
      let num = func()
      let binary = num.toString(2)
      let lnum = new LN(num)

      assert.equal(slice(binary, 0, binary.length, n), lnum['<<'](n).binary(), `${binary}(${binary.length}) << ${n}`)
      lnum['<<='](n)
      assert.equal(slice(binary, 0, binary.length, n), lnum.binary(), `${binary}(${binary.length}) <<= ${n}`)
    }
  })

  its(N, '>>> and >>>=', function () {
    for (const func of randomFunctions) {
      let n = randomInt(0, 53)
      let num = func()
      let binary = num.toString(2)
      let lnum = new LN(num)

      assert.equal(slice(binary, 0, binary.length - n), lnum['>>>'](n).binary(), `${binary}(${binary.length}) >>> ${n}`)
      lnum['>>>='](n)
      assert.equal(slice(binary, 0, binary.length - n), lnum.binary(), `${binary}(${binary.length}) >>>= ${n}`)
    }
  })

  its(N / 10, '| and |=', function () {
    for (const func1 of randomFunctions) {
      for (const func2 of randomFunctions) {
        let num1 = func1()
        let num2 = func2()

        let binary1 = num1.toString(2).padStart(53, '0')
        let binary2 = num2.toString(2).padStart(53, '0')

        let lnum1 = new LN(num1)
        let lnum2 = new LN(num2)
        let binary = ''
        for (let i = 0; i < 53; i++) {
          binary += binary1[i] == '1' || binary2[i] == '1' ? '1' : '0'
        }

        assert.equal(binary, lnum1['|'](num2).binary(), `${binary1}  | ${binary2}`)
        lnum1['|='](num2)
        assert.equal(binary, lnum1.binary(), `${binary1}  |= ${binary2}`)

        lnum1 = new LN(num1)
        assert.equal(binary, lnum1['|'](lnum2).binary(), `${binary1}  | ${binary2}`)
        lnum1['|='](lnum2)
        assert.equal(binary, lnum1.binary(), `${binary1}  |= ${binary2}`)
      }
    }
  })

  its(N / 10, '& and &=', function () {
    for (const func1 of randomFunctions) {
      for (const func2 of randomFunctions) {
        let num1 = func1()
        let num2 = func2()

        let binary1 = num1.toString(2).padStart(53, '0')
        let binary2 = num2.toString(2).padStart(53, '0')

        let lnum1 = new LN(num1)
        let lnum2 = new LN(num2)
        let binary = ''
        for (let i = 0; i < 53; i++) {
          binary += binary1[i] == '1' && binary2[i] == '1' ? '1' : '0'
        }

        assert.equal(binary, lnum1['&'](num2).binary(), `${binary1}  & ${binary2}`)
        lnum1['&='](num2)
        assert.equal(binary, lnum1.binary(), `${binary1}  &= ${binary2}`)

        lnum1 = new LN(num1)
        assert.equal(binary, lnum1['&'](lnum2).binary(), `${binary1}  & ${binary2}`)
        lnum1['&='](lnum2)
        assert.equal(binary, lnum1.binary(), `${binary1}  &= ${binary2}`)
      }
    }
  })

  its(N / 10, '^ and ^=', function () {
    for (const func1 of randomFunctions) {
      for (const func2 of randomFunctions) {
        let num1 = func1()
        let num2 = func2()

        let binary1 = num1.toString(2).padStart(53, '0')
        let binary2 = num2.toString(2).padStart(53, '0')

        let lnum1 = new LN(num1)
        let lnum2 = new LN(num2)
        let binary = ''
        for (let i = 0; i < 53; i++) {
          binary += binary1[i] != binary2[i] ? '1' : '0'
        }
        assert.equal(binary, lnum1['^'](num2).binary(), `${binary1}  ^ ${binary2}`)
        lnum1['^='](num2)
        assert.equal(binary, lnum1.binary(), `${binary1}  ^= ${binary2}`)

        lnum1 = new LN(num1)
        assert.equal(binary, lnum1['^'](lnum2).binary(), `${binary1}  ^ ${binary2}`)
        lnum1['^='](lnum2)
        assert.equal(binary, lnum1.binary(), `${binary1}  ^= ${binary2}`)
      }
    }
  })

  its(N, 'not and notSelf', function () {
    for (const func1 of randomFunctions) {
      let num1 = func1()

      let binary1 = num1.toString(2).padStart(53, '0')

      let lnum1 = new LN(num1)
      let binary = ''
      for (let i = 0; i < 53; i++) {
        binary += binary1[i] == '0' ? '1' : '0'
      }

      assert.equal(binary, lnum1.not().binary(), `~= ${binary1}`)
      lnum1.notSelf()
      assert.equal(binary, lnum1.binary(), `~${binary1}`)
    }
  })


  its(N, 'count', function () {
    for (const func1 of randomFunctions) {
      let num1 = func1()

      let binary1 = num1.toString(2).padStart(53, '0')

      let lnum1 = new LN(num1)
      let n = 0
      for (let i = 0; i < 53; i++) {
        if (binary1[i] == '1') n++
      }

      assert.equal(n, lnum1.count(), `count: ${binary1}`)
    }
  })


  its(N, 'slice', function () {
    for (const func1 of randomFunctions) {
      let num1 = func1()
      let binary1 = num1.toString(2).padStart(53, '0')
      let lnum1 = new LN(num1)
      let range = [
        [0, 0], [16, 16], [53, 53], [0, 5], [0, 53], [3, 18], [16, 48], [36, 49], [45, 53]
      ]
      for (const [begin, end] of range) {
        let n = begin == end ? 0 : parseInt(binary1.slice(53 - end, 53 - begin), 2)
        assert.equal(n, lnum1.slice(begin, end), `slice(${begin},${end}): ${binary1}`)
      }
    }
  })
})




describe('Large number Function', function () {
  it('static Functions: small number', function () {
    assert.equal(LN.countS(0b100101001), 4)
    assert.equal(LN.countS(0b0011110111), 7)

    assert.equal(LN.sliceS(0b100101001, 3, 6), 0b101)
    assert.equal(LN.sliceS(0b0011110111, 5, 5), 0)
  })

  it('static Functions', function () {
    assert.equal(LN.count(0b100101001), 4)
    assert.equal(LN.count(0b0011110111), 7)
    assert.equal(LN.count(0b111111110000000011111111000000001111111100000000), 24)

    assert.equal(LN.slice(0b100101001, 3, 6), 0b101)
    assert.equal(LN.slice(0b0011110111, 5, 5), 0)
    assert.equal(LN.slice(0b111111110000000011111111000000001111111100000000, 12, 28), 0b1111000000001111)
  })


  its(N / 100, 'member Functions', function () {
    let memberFunctions = ['<<', '<<=', '>>', '>>=', '>>>', '>>>=', '|', '|=', '&', '&=', '^', '^=', 'not', 'notSelf']
    for (const op of memberFunctions) {
      for (const func1 of randomFunctions) {
        for (const func2 of randomFunctions) {
          let num1 = func1()
          let num2 = func2()
          assert.equal(LN(num1, op, num2).val, new LN(num1)[op](num2).val)
        }
      }
    }
  })
})
