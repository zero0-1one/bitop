'use strict'

const LITTLE_BITS = 27
const BIG_BITS = 53 - LITTLE_BITS //必须比LITTLE_BITS小 (实现只考虑了小的情况)
const MULT = 1 << LITTLE_BITS
const MASK_0 = (1 << BIG_BITS) - 1
const MASK_1 = (1 << LITTLE_BITS) - 1

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
}

module.exports = function(num) {
  return new LargeNumber(num)
}
