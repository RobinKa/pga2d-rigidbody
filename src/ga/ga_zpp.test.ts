import * as pga from "./ga_zpp"

test("geometric product", () => {
    const a = {
        scalar: 1,
        e0: 2,
        e1: 3,
        e2: 4,
        e01: 5,
        e02: 6,
        e12: 7,
        e012: 8
    }

    const b = {
        scalar: 9,
        e0: 10,
        e1: 11,
        e2: 12,
        e01: 13,
        e02: 14,
        e12: 15,
        e012: 16
    }

    const c = pga.geometricProduct(a, b)

    // −15 − 172e0​ + 62e1 ​ +16e2 ​+ 218e01 ​− 100e02 ​+ 70e12​ + 192e012​
    expect(c.scalar).toBe(-15)
    expect(c.e0).toBe(-172)
    expect(c.e1).toBe(62)
    expect(c.e2).toBe(16)
    expect(c.e01).toBe(218)
    expect(c.e02).toBe(-100)
    expect(c.e12).toBe(70)
    expect(c.e012).toBe(192)
})

test("inner product", () => {
    const a = {
        scalar: 1,
        e0: 2,
        e1: 3,
        e2: 4,
        e01: 5,
        e02: 6,
        e12: 7,
        e012: 8
    }

    const b = {
        scalar: 9,
        e0: 10,
        e1: 11,
        e2: 12,
        e01: 13,
        e02: 14,
        e12: 15,
        e012: 16
    }

    const c = pga.innerProduct(a, b)

    // −15−172e0​+62e1​+16e2​+218e01​−68e02​+78e12​+88e012​
    expect(c.scalar).toBe(-15)
    expect(c.e0).toBe(-172)
    expect(c.e1).toBe(62)
    expect(c.e2).toBe(16)
    expect(c.e01).toBe(218)
    expect(c.e02).toBe(-68)
    expect(c.e12).toBe(78)
    expect(c.e012).toBe(88)
})

test("exterior product", () => {
    const a = {
        scalar: 1,
        e0: 2,
        e1: 3,
        e2: 4,
        e01: 5,
        e02: 6,
        e12: 7,
        e012: 8
    }

    const b = {
        scalar: 9,
        e0: 10,
        e1: 11,
        e2: 12,
        e01: 13,
        e02: 14,
        e12: 15,
        e012: 16
    }

    const c = pga.exteriorProduct(a, b)

    // 9+28e0​+38e1​+48e2​+50e01​+52e02​+70e12​+192e012​
    expect(c.scalar).toBe(9)
    expect(c.e0).toBe(28)
    expect(c.e1).toBe(38)
    expect(c.e2).toBe(48)
    expect(c.e01).toBe(50)
    expect(c.e02).toBe(52)
    expect(c.e12).toBe(70)
    expect(c.e012).toBe(192)
})

test("dual", () => {
    const a = {
        scalar: 1,
        e0: 2,
        e1: 3,
        e2: 4,
        e01: 5,
        e02: 6,
        e12: 7,
        e012: 8
    }

    const c = pga.dual(a)

    // 8+7e0​−6e1​+5e2​+4e01​−3e02​+2e12​+e012​
    expect(c.scalar).toBe(8)
    expect(c.e0).toBe(7)
    expect(c.e1).toBe(-6)
    expect(c.e2).toBe(5)
    expect(c.e01).toBe(4)
    expect(c.e02).toBe(-3)
    expect(c.e12).toBe(2)
    expect(c.e012).toBe(1)
})

test("dual dual equals identity", () => {
    const a = {
        scalar: 1,
        e0: 2,
        e1: 3,
        e2: 4,
        e01: 5,
        e02: 6,
        e12: 7,
        e012: 8
    }

    const c = pga.dual(pga.dual(a))

    expect(c.scalar).toBe(1)
    expect(c.e0).toBe(2)
    expect(c.e1).toBe(3)
    expect(c.e2).toBe(4)
    expect(c.e01).toBe(5)
    expect(c.e02).toBe(6)
    expect(c.e12).toBe(7)
    expect(c.e012).toBe(8)
})

test("join points equals line", () => {
    // X: +1, Y: -1
    const a = {
        e02: -1,
        e01: -1,
        e12: 1,
    }

    // X: +1, Y: +1
    const b = {
        e02: -1,
        e01: 1,
        e12: 1,
    }

    // Line at X=1 <=> 1 e1 - 1 e0 = 0
    const c = pga.regressiveProduct(a, b)

    c.e1 /= c.e0
    c.e2 /= c.e0
    c.e0 /= c.e0

    expect(c.e0).toBeCloseTo(1)
    expect(c.e1).toBeCloseTo(-1)
    expect(c.e2).toBeCloseTo(0)
})