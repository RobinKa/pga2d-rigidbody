

// 1
// e0 e1 e2
// e01 e02 e12
// e012

export type Scalar = {
    scalar: number
}

export type Vector = {
    e0: number
    e1: number
    e2: number
}

export type BiVector = {
    e01: number
    e02: number
    e12: number
}

export type PseudoScalar = {
    e012: number
}

export type MultiVector = Scalar & Vector & BiVector & PseudoScalar

export type OptionalMultiVector = {
    scalar?: number
    e0?: number
    e1?: number
    e2?: number
    e01?: number
    e02?: number
    e12?: number
    e012?: number
}

export const makeMultiVector = (mv: OptionalMultiVector) => {
    return {
        scalar: mv.scalar || 0,
        e0: mv.e0 || 0,
        e1: mv.e1 || 0,
        e2: mv.e2 || 0,
        e01: mv.e01 || 0,
        e02: mv.e02 || 0,
        e12: mv.e12 || 0,
        e012: mv.e012 || 0
    }
}

export const add = (a: MultiVector, b: MultiVector): MultiVector => {
    return {
        scalar: a.scalar + b.scalar,
        e0: a.e0 + b.e0,
        e1: a.e1 + b.e1,
        e2: a.e2 + b.e2,
        e01: a.e01 + b.e01,
        e02: a.e02 + b.e02,
        e12: a.e12 + b.e12,
        e012: a.e012 + b.e012
    }
}

export const sub = (a: MultiVector, b: MultiVector): MultiVector => {
    return {
        scalar: a.scalar - b.scalar,
        e0: a.e0 - b.e0,
        e1: a.e1 - b.e1,
        e2: a.e2 - b.e2,
        e01: a.e01 - b.e01,
        e02: a.e02 - b.e02,
        e12: a.e12 - b.e12,
        e012: a.e012 - b.e012
    }
}

export const div = (a: MultiVector, b: number): MultiVector => {
    return {
        scalar: a.scalar / b,
        e0: a.e0 / b,
        e1: a.e1 / b,
        e2: a.e2 / b,
        e01: a.e01 / b,
        e02: a.e02 / b,
        e12: a.e12 / b,
        e012: a.e012 / b
    }
}

export const geometricProduct = (a: MultiVector, b: MultiVector): MultiVector => {
    return {
        scalar: a.scalar * b.scalar + a.e1 * b.e1 + a.e2 * b.e2 - a.e12 * b.e12,
        e0: a.scalar * b.e0 + a.e0 * b.scalar + a.e01 * b.e1 - a.e1 * b.e01 + a.e02 * b.e2 - a.e2 * b.e02 - a.e012 * b.e12 - a.e12 * b.e012,
        e1: a.scalar * b.e1 + a.e1 * b.scalar + a.e12 * b.e2 - a.e2 * b.e12,
        e2: a.scalar * b.e2 + a.e2 * b.scalar - a.e12 * b.e1 + a.e1 * b.e12,
        e01: a.scalar * b.e01 + a.e01 * b.scalar + a.e0 * b.e1 - a.e1 * b.e0 + a.e012 * b.e2 + a.e2 * b.e012 - a.e02 * b.e12 + a.e12 * b.e02,
        e02: a.scalar * b.e02 + a.e02 * b.scalar + a.e0 * b.e2 - a.e2 * b.e0 - a.e012 * b.e1 - a.e1 * b.e012 + a.e01 * b.e12 - a.e12 * b.e01,
        e12: a.scalar * b.e12 + a.e12 * b.scalar + a.e1 * b.e2 - a.e2 * b.e1,
        e012: a.scalar * b.e012 + a.e012 * b.scalar + a.e0 * b.e12 + a.e12 * b.e0 + a.e01 * b.e2 + a.e2 * b.e01 - a.e02 * b.e1 - a.e1 * b.e02
    }
}

export const innerProduct = (a: MultiVector, b: MultiVector): MultiVector => {
    return {
        scalar: a.scalar * b.scalar + a.e1 * b.e1 + a.e2 * b.e2 - a.e12 * b.e12,
        e0: a.scalar * b.e0 + a.e0 * b.scalar + a.e01 * b.e1 - a.e1 * b.e01 + a.e02 * b.e2 - a.e2 * b.e02 - a.e012 * b.e12 - a.e12 * b.e012,
        e1: a.scalar * b.e1 + a.e1 * b.scalar + a.e12 * b.e2 - a.e2 * b.e12,
        e2: a.scalar * b.e2 + a.e2 * b.scalar - a.e12 * b.e1 + a.e1 * b.e12,
        e01: a.scalar * b.e01 + a.e01 * b.scalar + a.e012 * b.e2 + a.e2 * b.e012,
        e02: a.scalar * b.e02 + a.e02 * b.scalar - a.e012 * b.e1 - a.e1 * b.e012,
        e12: a.scalar * b.e12 + a.e12 * b.scalar,
        e012: a.scalar * b.e012 + a.e012 * b.scalar
    }
}

export const exteriorProduct = (a: MultiVector, b: MultiVector): MultiVector => {
    return {
        scalar: a.scalar * b.scalar,
        e0: a.scalar * b.e0 + a.e0 * b.scalar,
        e1: a.scalar * b.e1 + a.e1 * b.scalar,
        e2: a.scalar * b.e2 + a.e2 * b.scalar,
        e01: a.scalar * b.e01 + a.e01 * b.scalar + a.e0 * b.e1 - a.e1 * b.e0,
        e02: a.scalar * b.e02 + a.e02 * b.scalar + a.e0 * b.e2 - a.e2 * b.e0,
        e12: a.scalar * b.e12 + a.e12 * b.scalar + a.e1 * b.e2 - a.e2 * b.e1,
        e012: a.scalar * b.e012 + a.e012 * b.scalar + a.e0 * b.e12 + a.e12 * b.e0 + a.e01 * b.e2 + a.e2 * b.e01 - a.e02 * b.e1 - a.e1 * b.e02
    }
}

export const multiply = (a: MultiVector, b: number): MultiVector => {
    return {
        scalar: a.scalar * b,
        e0: a.e0 * b,
        e1: a.e1 * b,
        e2: a.e2 * b,
        e01: a.e01 * b,
        e02: a.e02 * b,
        e12: a.e12 * b,
        e012: a.e012 * b
    }
}

export const commutatorProduct = (a: MultiVector, b: MultiVector): MultiVector =>
    multiply(sub(geometricProduct(a, b), geometricProduct(b, a)), 0.5)

export const dual = (a: MultiVector): MultiVector => {
    return {
        scalar: a.e012,
        e0: a.e12,
        e1: -a.e02,
        e2: a.e01,
        e01: a.e2,
        e02: -a.e1,
        e12: a.e0,
        e012: a.scalar
    }
}

export const reversion = (a: MultiVector): MultiVector => {
    return {
        scalar: a.scalar,
        e0: a.e0,
        e1: a.e1,
        e2: a.e2,
        e01: -a.e01,
        e02: -a.e02,
        e12: -a.e12,
        e012: -a.e012
    }
}

export const regressiveProduct = (a: MultiVector, b: MultiVector): MultiVector =>
    dual(exteriorProduct(dual(a), dual(b)))


export const sandwichProduct = (a: MultiVector, b: MultiVector): MultiVector =>
    geometricProduct(b, geometricProduct(a, reversion(b)))

export const exponential = (a: MultiVector): MultiVector => {
    const s = geometricProduct(a, a).scalar

    // TODO: Assert s is pure scalar

    if (s < -0.1) {
        const rootS = Math.sign(s) * Math.sqrt(Math.abs(s))
        return add(makeMultiVector({ scalar: Math.cos(rootS) }), multiply(div(a, rootS), Math.sin(rootS) / rootS))
    } else if (s > 0.1) {
        const rootS = Math.sign(s) * Math.sqrt(Math.abs(s))
        return add(makeMultiVector({ scalar: Math.cosh(rootS) }), multiply(div(a, rootS), Math.sinh(rootS) / rootS))
    } else {
        return add(makeMultiVector({ scalar: 1 }), a)
    }
}

export const repr = (a: MultiVector, digits?: number): string => {
    digits = digits || 3
    return `s: ${a.scalar.toFixed(digits)}, e0: ${a.e0.toFixed(digits)}, e1: ${a.e1.toFixed(digits)}, e2: ${a.e2.toFixed(digits)}, e01: ${a.e01.toFixed(digits)}, e02: ${a.e02.toFixed(digits)}, e12: ${a.e12.toFixed(digits)}, e012: ${a.e012.toFixed(digits)}`
}

export const pointCoordinates = (a: BiVector): [number, number] => {
    const magInv = 1 / a.e12
    return [-a.e02 * magInv, a.e01 * magInv]
}