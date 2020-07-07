import * as pga from "./pga2d"

export type PointParticle2D = {
    motor: pga.MultiVector
    velocity: pga.MultiVector
}

export type RigidBody2D = {
    points: pga.MultiVector[]
    sleeping: boolean
} & PointParticle2D

export const makePointParticle2D = (motor: pga.OptionalMultiVector, velocity: pga.OptionalMultiVector) => {
    return {
        motor: pga.makeMultiVector(motor),
        velocity: pga.makeMultiVector(velocity)
    }
}

export const makeRigidBody2D = (motor: pga.OptionalMultiVector, velocity: pga.OptionalMultiVector, points: pga.OptionalMultiVector[]) => {
    return {
        ...makePointParticle2D(motor, velocity),
        points: points.map(pga.makeMultiVector),
        sleeping: false
    }
}

export const getEdgesFromPoints = (points: pga.MultiVector[]): pga.MultiVector[] => {
    const lines = []
    for (let i = 0; i < points.length; i++) {
        lines.push(pga.regressiveProduct(
            points[i],
            points[(i + 1) % points.length]
        ))
    }
    return lines
}

const pointsMinMaxDistanceToLine = (points: pga.MultiVector[], line: pga.MultiVector): [number, number] => {
    let minDist = Number.POSITIVE_INFINITY
    let maxDist = Number.NEGATIVE_INFINITY
    for (const point of points) {
        const pointNormalized = pga.div(point, point.e12)
        const lineNormalized = pga.div(line, Math.sqrt(line.e1 * line.e1 + line.e2 * line.e2))

        const dist = pga.exteriorProduct(
            pointNormalized,
            lineNormalized
        ).e012

        minDist = Math.min(dist, minDist)
        maxDist = Math.max(dist, maxDist)
    }

    return [minDist, maxDist]
}

export const closestPointToLine = (points: pga.MultiVector[], line: pga.MultiVector): pga.MultiVector | undefined => {
    let minDist = Number.POSITIVE_INFINITY
    let minPoint: pga.MultiVector | undefined = undefined

    for (const point of points) {
        const pointNormalized = pga.div(point, point.e12)
        const lineNormalized = pga.div(line, Math.sqrt(line.e1 * line.e1 + line.e2 * line.e2))

        const dist = Math.abs(pga.exteriorProduct(
            pointNormalized,
            lineNormalized
        ).e012)

        if (dist < minDist) {
            minDist = dist
            minPoint = point
        }
    }

    return minPoint
}

export const closestRigidBodyPointToLine = (rb: RigidBody2D, line: pga.MultiVector): pga.MultiVector | undefined => {
    const worldPoints = rb.points.map(p => pga.sandwichProduct(p, rb.motor))
    return closestPointToLine(worldPoints, line)
}

export type SatCheckResults = {
    overlaps: boolean
    depth?: number
    line?: pga.MultiVector
}

export const satCheck = (rb1: RigidBody2D, rb2: RigidBody2D): SatCheckResults => {
    const worldPoints1 = rb1.points.map(p => pga.sandwichProduct(p, rb1.motor))
    const worldPoints2 = rb2.points.map(p => pga.sandwichProduct(p, rb2.motor))

    const edgeLines = getEdgesFromPoints(worldPoints1).concat(getEdgesFromPoints(worldPoints2))

    let minDepth = Number.POSITIVE_INFINITY
    let minDepthEdgeLine: pga.MultiVector | undefined = undefined

    for (const edgeLine of edgeLines) {
        const [minDist1, maxDist1] = pointsMinMaxDistanceToLine(
            worldPoints1, edgeLine
        )

        const [minDist2, maxDist2] = pointsMinMaxDistanceToLine(
            worldPoints2, edgeLine
        )

        if (minDist1 > maxDist2 || minDist2 > maxDist1) {
            return {
                overlaps: false
            }
        } else {
            const depth = Math.min(maxDist2 - minDist1, maxDist1 - minDist2)
            if (depth < minDepth) {
                minDepth = depth
                minDepthEdgeLine = edgeLine
            }
        }
    }

    return {
        overlaps: true,
        depth: minDepth,
        line: minDepthEdgeLine
    }
}

export const updatePointParticle2D = <T extends PointParticle2D>(particle: T, force: pga.MultiVector, dt: number) => {
    const dMotor = pga.multiply(pga.geometricProduct(particle.motor, particle.velocity), 0.5)
    const dVelocity = pga.dual(pga.add(
        force,
        pga.commutatorProduct(pga.dual(particle.velocity), particle.velocity)
    ))

    const motor = pga.add(particle.motor, pga.multiply(dMotor, dt))
    const velocity = pga.add(particle.velocity, pga.multiply(dVelocity, dt))

    return {
        ...particle,
        motor: pga.div(motor, pga.geometricProduct(motor, pga.reversion(motor)).scalar),
        velocity: velocity
    }
}
