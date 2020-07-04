import * as rb from "./rb2d"
import * as pga from "./pga2d"

test("boxes overlap", () => {
    for (let offsetX = -3; offsetX <= 3; offsetX += 0.1) {
        // Square at origin with extent 2
        const bodyA = rb.makeRigidBody2D(
            pga.makeMultiVector({ scalar: 1 }),
            pga.makeMultiVector({}),
            [
                pga.makeMultiVector({ e01: -1, e02: -1, e12: 1 }),
                pga.makeMultiVector({ e01: -1, e02: 1, e12: 1 }),
                pga.makeMultiVector({ e01: 1, e02: 1, e12: 1 }),
                pga.makeMultiVector({ e01: 1, e02: -1, e12: 1 })
            ]
        )

        // Square at x=0.5 with extent 2
        const bodyB = rb.makeRigidBody2D(
            pga.makeMultiVector({ scalar: 1, e01: offsetX / 2 }),
            pga.makeMultiVector({}),
            [
                pga.makeMultiVector({ e01: -1, e02: -1, e12: 1 }),
                pga.makeMultiVector({ e01: -1, e02: 1, e12: 1 }),
                pga.makeMultiVector({ e01: 1, e02: 1, e12: 1 }),
                pga.makeMultiVector({ e01: 1, e02: -1, e12: 1 })
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
});