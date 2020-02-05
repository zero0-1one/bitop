'use strict'

const BITS = 53
const LOW_BITS = 28
const HIGH_BITS = BITS - LOW_BITS //必须比LITTLE_BITS小 (因为位移算法实现中只考虑了小的情况)
const MULT = 1 << LOW_BITS
const MASK_HIGH = (1 << HIGH_BITS) - 1
const MASK_LOW = (1 << LOW_BITS) - 1

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
      this._high = num._high
      this._low = num._low
      return
    }
    /* istanbul ignore if */
    if (num < 0) throw new Error('Negative numbers are not currently supported') //目前只考虑 正数情况
    /* istanbul ignore if */
    if (!Number.isSafeInteger(num)) throw new Error('Number is not a safe integer :' + num)

    //分成高低两份 其实只会用 53位
    this._high = Math.floor(num / MULT)
    this._low = num % MULT
  }

  get val() {
    return this._high * MULT + this._low //每次计算完都使用了 MASK, 所以这里不用使用 MASK了
    // return (this._high & MASK_HIGH) * MULT + (this._low & MASK_LOW)
  }

  binary(len = BITS) {
    return this.val.toString(2).padStart(len, '0')
  }

  '<<='(n) {
    if (n >= LOW_BITS) {
      this._high = (this._low << (n - LOW_BITS)) & MASK_HIGH
      this._low = 0
    } else {
      this._high = ((this._high << n) | (this._low >> (LOW_BITS - n))) & MASK_HIGH
      this._low = (this._low << n) & MASK_LOW
    }
    return this
  }

  '>>='(n) {
    if (n >= LOW_BITS) {
      this._low = this._high >> (n - LOW_BITS)
      this._high = 0
    } else {
      this._low = ((this._high << (LOW_BITS - n)) & MASK_LOW) | (this._low >> n)
      this._high >>= n
    }
    return this
  }

  '>>>='(n) {
    return this['>>='](n) //目前只考虑正数, 与'>>'运算相同
  }

  '&='(num) {
    if (!(num instanceof LargeNumber)) num = new LargeNumber(num)
    this._high &= num._high
    this._low &= num._low
    return this
  }

  '|='(num) {
    if (!(num instanceof LargeNumber)) num = new LargeNumber(num)
    this._high |= num._high
    this._low |= num._low
    return this
  }

  '^='(num) {
    if (!(num instanceof LargeNumber)) num = new LargeNumber(num)
    this._high ^= num._high
    this._low ^= num._low
    return this
  }

  notSelf() {
    this._high = ~this._high & MASK_HIGH
    this._low = ~this._low & MASK_LOW
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
    return this._count(this._high) + this._count(this._low)
  }

  _slice(v, begin, end) {
    let mask = ((1 << begin) - 1) ^ ((1 << end) - 1)
    return (v & mask) >> begin
  }

  //从低位到高位  包含 begin 位,不包含 end 位
  slice(begin, end) {
    if (begin >= LOW_BITS) {
      return this._slice(this._high, begin - LOW_BITS, end - LOW_BITS)
    } else if (end <= LOW_BITS) {
      return this._slice(this._low, begin, end)
    } else {
      let low = this._slice(this._low, begin, LOW_BITS)
      let high = this._slice(this._high, 0, end - LOW_BITS)
      return high * (1 << (LOW_BITS - begin)) + low  //不能直接用 high 位移, 此时可能会超出 2^32, 所以使用乘法
    }
  }
}

module.exports = function (num) {
  return new LargeNumber(num)
}
