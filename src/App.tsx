import React, { useState, useEffect, useCallback, useMemo } from 'react'
import './App.css'
import * as pga from "./ga/pga2d"
import * as rb from "./ga/rb2d"
import * as viz from './ga/viz2d'


const useInterval = (callback: () => void, ms: number) => {
    useEffect(() => {
        const timerHandle = setInterval(callback, ms)
        return () => clearInterval(timerHandle)
    }, [callback, ms])
}

function AppGravityParticles() {
    const dt = 0.03
    const grav = 20

    const [time, setTime] = useState(0)

    const [particle1, setParticle1] = useState(rb.makePointParticle2D({ scalar: 1, e01: 5 }, { e02: 1 }))
    const [particle2, setParticle2] = useState(rb.makePointParticle2D({ scalar: 1 }, { e02: -1 }))

    const bodyPos = useMemo(() => {
        return pga.sandwichProduct(pga.makeMultiVector({ e12: 1 }), particle1.motor)
    }, [particle1])

    const bodyPos2 = useMemo(() => {
        return pga.sandwichProduct(pga.makeMultiVector({ e12: 1 }), particle2.motor)
    }, [particle2])

    const particles = useMemo(() => {
        return [particle1, particle2]
    }, [particle1, particle2])

    const getKineticEnergy = useCallback((particle: rb.PointParticle2D) => {
        return pga.regressiveProduct(pga.dual(particle.velocity), particle.velocity)
    }, [])

    const getPotentialEnergy = useCallback((particle: rb.PointParticle2D) => {
        // Transform origin with body motors to get space frame positions
        const pos = pga.sandwichProduct(pga.makeMultiVector({ e12: 1 }), particle.motor)

        let potential = 0
        for (const otherParticle of particles) {
            if (particle !== otherParticle) {
                const otherPos = pga.sandwichProduct(pga.makeMultiVector({ e12: 1 }), otherParticle.motor)

                // Line through space frame positions
                const line = pga.regressiveProduct(pos, otherPos)
                const lineLength = Math.sqrt(line.e1 * line.e1 + line.e2 * line.e2)

                potential += -grav / lineLength
            }
        }

        return potential
    }, [particles])

    const t1 = useMemo(() => getKineticEnergy(particle1), [particle1, getKineticEnergy])
    const t2 = useMemo(() => getKineticEnergy(particle2), [particle2, getKineticEnergy])
    const v1 = useMemo(() => getPotentialEnergy(particle1), [particle1, getPotentialEnergy])
    const v2 = useMemo(() => getPotentialEnergy(particle2), [particle2, getPotentialEnergy])

    const calcForce = useCallback((p1: rb.PointParticle2D, p2: rb.PointParticle2D) => {
        // Transform origin with body motors to get space frame positions
        const pos1 = pga.sandwichProduct(pga.makeMultiVector({ e12: 1 }), p1.motor)
        const pos2 = pga.sandwichProduct(pga.makeMultiVector({ e12: 1 }), p2.motor)

        // Line through space frame positions
        const line = pga.regressiveProduct(pos1, pos2)
        const lineLengthSq = line.e1 * line.e1 + line.e2 * line.e2
        const lineNormalized = pga.div(line, Math.sqrt(lineLengthSq))

        // Calculate gravitational force in space frame
        const force = pga.multiply(lineNormalized, -grav / lineLengthSq)

        // Return force in body frame
        return pga.sandwichProduct(force, pga.reversion(p1.motor))
    }, [])

    const updateParticles = useCallback(() => {
        const force = calcForce(particle1, particle2)
        const force2 = calcForce(particle2, particle1)

        setParticle1(rb.updatePointParticle2D(particle1, force, dt))
        setParticle2(rb.updatePointParticle2D(particle2, force2, dt))

        setTime(time + dt)
    }, [particle1, particle2, calcForce, time])

    useInterval(updateParticles, 1000 * dt)

    const scene = useMemo<viz.Scene>(() => {
        return {
            points: [
                {
                    point: bodyPos,
                    radius: 0.5,
                    label: "A",
                    trailCount: 1000,
                    fill: "#FFBD69",
                    trailStroke: "#FFBD69"
                },
                {
                    point: bodyPos2,
                    radius: 0.5,
                    label: "B",
                    trailCount: 1000,
                    fill: "#C70039",
                    trailStroke: "#C70039"
                }
            ],
            infos: [
                `T1: ${t1.scalar.toFixed(3)}`,
                `T2: ${t2.scalar.toFixed(3)}`,
                `V1: ${v1.toFixed(3)}`,
                `V2: ${v2.toFixed(3)}`,
                `H: ${(v1 + v2 + t1.scalar + t2.scalar).toFixed(3)}`
            ]
        }
    }, [bodyPos, bodyPos2, t1, t2, v1, v2])

    return <viz.SceneView scene={scene} />
}

function App() {
    const dt = 0.03

    const [time, setTime] = useState(0)

    const [body1, setBody1] = useState(rb.makeRigidBody2D(
        pga.makeMultiVector({ scalar: 1 }),
        pga.makeMultiVector({}),
        [
            pga.makeMultiVector({ e01: -1, e02: -1, e12: 1 }),
            pga.makeMultiVector({ e01: -1, e02: 1, e12: 1 }),
            pga.makeMultiVector({ e01: 1, e02: 1, e12: 1 }),
            pga.makeMultiVector({ e01: 1, e02: -1, e12: 1 })
        ]
    ))

    const [body2, setBody2] = useState(rb.makeRigidBody2D(
        pga.makeMultiVector({ scalar: 1, e01: 3 }),
        pga.makeMultiVector({}),
        [
            pga.makeMultiVector({ e01: -1, e02: -1, e12: 1 }),
            pga.makeMultiVector({ e01: -1, e02: 1, e12: 1 }),
            pga.makeMultiVector({ e01: 1, e02: 1, e12: 1 }),
            pga.makeMultiVector({ e01: 1, e02: -1, e12: 1 })
        ]
    ))

    const [floor, setFloor] = useState(rb.makeRigidBody2D(
        pga.makeMultiVector({ scalar: 1, e01: 10 }),
        pga.makeMultiVector({}),
        [
            pga.makeMultiVector({ e01: -10, e02: -1, e12: 1 }),
            pga.makeMultiVector({ e01: -10, e02: 1, e12: 1 }),
            pga.makeMultiVector({ e01: 10, e02: 1, e12: 1 }),
            pga.makeMultiVector({ e01: 10, e02: -1, e12: 1 })
        ]
    ))

    const bodies = useMemo<rb.RigidBody2D[]>(() => {
        return [body1, body2, floor]
    }, [body1, body2, floor])

    const scene = useMemo<viz.Scene>(() => {
        return {
            rigidBodies: bodies.map((body, i) => {
                return {
                    rigidBody: body,
                    label: i.toString(),
                    radius: 0.2
                }
            }),
            infos: [
                pga.repr(bodies[0].velocity)
            ]
        }
    }, [bodies])

    const gravity = useMemo(() => {
        return pga.makeMultiVector({
            e0: 0,
            e2: 20
        })
    }, [])

    const update = useCallback(() => {
        const newBody1 = body1.sleeping ? body1 : rb.updatePointParticle2D(body1, gravity, dt)
        const newBody2 = rb.updatePointParticle2D(body2, gravity, dt)

        const coll = rb.satCheck(newBody1, floor)
        if (coll.overlaps && coll.depth !== undefined && !body1.sleeping) {
            newBody1.motor = pga.add(
                newBody1.motor,
                pga.makeMultiVector({
                    e01: -1.001 * coll.depth
                })
            )

            if (Math.abs(newBody1.velocity.e01) > 10) {
                newBody1.velocity.e01 = -0.5 * newBody1.velocity.e01
            } else {
                newBody1.velocity.e01 = 0
                newBody1.sleeping = true
            }
        }

        setBody1(newBody1)
        setBody2(newBody2)

        setTime(time + dt)
    }, [gravity, body1, body2, floor, time])

    useInterval(update, 1000 * dt)

    return <viz.SceneView scene={scene} />
}

export default App
