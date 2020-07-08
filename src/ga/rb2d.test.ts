import * as rb from "./rb2d"

test("boxes overlap", () => {
    for (let offsetX = -3; offsetX <= 3; offsetX += 0.1) {
        // Square at origin with extent 2
        const bodyA = rb.makeRigidBody2D(
            { scalar: 1, e01: 0, e02: 0, e12: 0 },
            { scalar: 0, e01: 0, e02: 0, e12: 0 },
            [
                { e01: -1, e02: -1, e12: 1 },
                { e01: -1, e02: 1, e12: 1 },
                { e01: 1, e02: 1, e12: 1 },
                { e01: 1, e02: -1, e12: 1 }
            ]
        )

        // Square at x=0.5 with extent 2
        const bodyB = rb.makeRigidBody2D(
            { scalar: 1, e01: offsetX / 2, e02: 0, e12: 0 },
            { scalar: 0, e01: 0, e02: 0, e12: 0 },
            [
                { e01: -1, e02: -1, e12: 1 },
                { e01: -1, e02: 1, e12: 1 },
                { e01: 1, e02: 1, e12: 1 },
                { e01: 1, e02: -1, e12: 1 }
            ]
        )

        const results = rb.satCheck(bodyA, bodyB)

        if (offsetX <= 2 && offsetX >= -2) {
            expect(results.overlaps).toBeTruthy()
            expect(results.depth).toBeCloseTo(2 - Math.abs(offsetX))
        } else {
            expect(results.overlaps).toBeFalsy()
        }
    }
})