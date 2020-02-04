'use strict'

const LITTLE_BITS = 27
const BIG_BITS = 53 - LITTLE_BITS //必须比LITTLE_BITS小 (实现只考虑了小的情况)
const MULT = 1 << LITTLE_BITS
const MASK_0 = (1 << BIG_BITS) - 1
const MASK_1 = (1 << LITTLE_BITS) - 1

/**
const COUNT_TABLE = []
for (let i = 0 i < 256 i++) {
    let count = 0
    for (let j = 0 j < 8 j++) {
        if (i & (1 << j)) {
            count++
        }
    }
    COUNT_TABLE[i] = count
}
*/
const COUNT_TABLE = [
  0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4,
  1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
  1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
  2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
  1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
  2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
  2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
  3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
  1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
  2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
  2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
  3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
  2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
  3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
  3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
  4, 5, 5, 6, 5, 6, 6, 7, 5, 6, 6, 7, 6, 7, 7, 8
]


class LargeNumber {
  constructor(num) {
    if (num instanceof LargeNumber) {
      this._val_0 = num._val_0
      this._val_1 = num._val_1
      return
    }
    /* istanbul ignore if */
    if (num < 0) throw new Error('Negative numbers are not currently supported') //目前只考虑 正数情况
    /* istanbul ignore if */
    if (!Number.isSafeInteger(num)) throw new Error('Number is not a safe integer :' + num)

    //分成两个30位, 其实只会用 53位
    this._val_0 = Math.floor(num / MULT)
    this._val_1 = num % MULT
  }

  get val() {
    return this._val_0 * MULT + this._val_1 //每次计算完都使用了 MASK, 所以这里不用使用 MASK了
    // return (this._val_0 & MASK_0) * MULT + (this._val_1 & MASK_1)
  }

  binary(len = 53) {
    return this.val.toString(2).padStart(len, '0')
  }

  '<<='(n) {
    if (n >= LITTLE_BITS) {
      this._val_0 = (this._val_1 << (n - LITTLE_BITS)) & MASK_0
      this._val_1 = 0
    } else {
      this._val_0 = ((this._val_0 << n) | (this._val_1 >> (LITTLE_BITS - n))) & MASK_0
      this._val_1 = (this._val_1 << n) & MASK_1
    }
    return this
  }

  '>>='(n) {
    if (n >= LITTLE_BITS) {
      this._val_1 = this._val_0 >> (n - LITTLE_BITS)
      this._val_0 = 0
    } else {
      this._val_1 = ((this._val_0 << (LITTLE_BITS - n)) & MASK_1) | (this._val_1 >> n)
      this._val_0 >>= n
    }
    return this
  }

  '>>>='(n) {
    return this['>>='](n) //目前只考虑正数, 与'>>'运算相同
  }

  '&='(num) {
    if (!(num instanceof LargeNumber)) num = new LargeNumber(num)
    this._val_0 &= num._val_0
    this._val_1 &= num._val_1
    return this
  }

  '|='(num) {
    if (!(num instanceof LargeNumber)) num = new LargeNumber(num)
    this._val_0 |= num._val_0
    this._val_1 |= num._val_1
    return this
  }

  '^='(num) {
    if (!(num instanceof LargeNumber)) num = new LargeNumber(num)
    this._val_0 ^= num._val_0
    this._val_1 ^= num._val_1
    return this
  }

  notSelf() {
    this._val_0 = ~this._val_0 & MASK_0
    this._val_1 = ~this._val_1 & MASK_1
    return this
  }

  '<<'(n) {
    return new LargeNumber(this)['<<='](n)
  }

  '>>'(n) {
    return new LargeNumber(this)['>>='](n)
  }

  '>>>'(n) {
    return new LargeNumber(this)['>>>='](n)
  }

  '&'(num) {
    return new LargeNumber(this)['&='](num)
  }

  '|'(num) {
    return new LargeNumber(this)['|='](num)
  }

  '^'(num) {
    return new LargeNumber(this)['^='](num)
  }

  not() {
    let num = new LargeNumber(this)
    return num.notSelf()
  }

  _count(v) {
    return COUNT_TABLE[v & 0xff] + COUNT_TABLE[(v >> 8) & 0xff] + COUNT_TABLE[(v >> 16) & 0xff] + COUNT_TABLE[(v >> 24) & 0xff]
  }

  //二进制位是1的位数
  count() {
    return this._count(this._val_0) + this._count(this._val_1)
  }
}

module.exports = function (num) {
  return new LargeNumber(num)
}
