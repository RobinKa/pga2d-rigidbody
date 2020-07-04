import * as pga from "./pga2d"

export type RigidBody2D = {
    motor: pga.MultiVector,
    velocity: pga.MultiVector
}

export const makeRigidBody2D = (motor: pga.OptionalMultiVector, velocity: pga.OptionalMultiVector) => {
    return {
        motor: pga.makeMultiVector(motor),
        velocity: pga.makeMultiVector(velocity)
    }
}

export const updateRigidBody2D = (rb: RigidBody2D, force: pga.MultiVector, dt: number) => {
    const dMotor = pga.geometricProduct(rb.motor, rb.velocity)
    const dVelocity = pga.multiply(
        pga.dual(pga.add(
            force,
            pga.commutatorProduct(pga.dual(rb.velocity), rb.velocity)
        )), 2
    )

    const motor = pga.add(rb.motor, pga.multiply(dMotor, dt))
    const velocity = pga.add(rb.velocity, pga.multiply(dVelocity, dt))

    return {
        motor: pga.div(motor, pga.geometricProduct(motor, pga.reversion(motor)).scalar),
        velocity: velocity
    }
}
