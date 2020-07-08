import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import './App.css'
import * as pga from "./ga/ga_zpp"
import * as rb from "./ga/rb2d"
import * as viz from './ga/viz2d'


const useInterval = (callback: () => void, ms: number) => {
    const callbackRef = useRef(callback)

    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    useEffect(() => {
        const timerHandle = setInterval(() => callbackRef.current(), ms)
        return () => clearInterval(timerHandle)
    }, [ms])
}

function App() {
    const dt = 0.001
    const timeDilation = 1

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
        pga.makeMultiVector({ scalar: 1, e01: 10 }),
        pga.makeMultiVector({}),
        [
            pga.makeMultiVector({ e01: -1, e02: -1, e12: 1 }),
            pga.makeMultiVector({ e01: -1, e02: 1, e12: 1 }),
            pga.makeMultiVector({ e01: 1, e02: 1, e12: 1 }),
            pga.makeMultiVector({ e01: 1, e02: -1, e12: 1 })
        ]
    ))

    const [floor, setFloor] = useState(rb.makeRigidBody2D(
        pga.makeMultiVector({ scalar: 1, e02: -5, e12: 0.2 }),
        pga.makeMultiVector({}),
        [
            pga.makeMultiVector({ e01: -2, e02: -20, e12: 1 }),
            pga.makeMultiVector({ e01: -2, e02: 20, e12: 1 }),
            pga.makeMultiVector({ e01: 2, e02: 20, e12: 1 }),
            pga.makeMultiVector({ e01: 2, e02: -20, e12: 1 })
        ]
    ))

    const bodies = useMemo<rb.RigidBody2D[]>(() => {
        return [body1, body2, floor]
    }, [body1, body2, floor])

    const [lastCollInfo, setLastCollInfo] = useState<rb.SatCheckResults>({ line: pga.makeMultiVector({}), depth: 0, overlaps: false })
    const [contactPointsWorld, setContactPointsWorld] = useState<pga.BiVector[]>([])
    const [body1Force, setBody1Force] = useState<pga.Vector | null>(null)

    const scene = useMemo<viz.Scene>(() => {
        return {
            rigidBodies: bodies.map((body, i) => {
                return {
                    rigidBody: body,
                    label: i.toString(),
                    radius: 0.2
                }
            }),
            points: contactPointsWorld.map(p => {
                return {
                    point: p,
                    label: "",
                    radius: 0.2,
                    fill: "#C7003999"
                }
            }),
            lines: (lastCollInfo.overlaps ? [{
                line: lastCollInfo.line!,
                label: "",
                stroke: "#CCFFFF99",
                width: 0.2
            }] : []).concat([{
                line: body1Force || pga.makeMultiVector({ e0: 1, e1: 1, e2: 1 }),
                label: "Force",
                stroke: "#FF00FF55",
                width: 0.2
            }]),
            infos: [
                `t: ${time.toFixed(3)}`,
                //`P0: ${pga.repr(pga.sandwichProduct(pga.makeMultiVector({ e12: 1 }), bodies[0].motor))}`,
                //`V0: ${pga.repr(bodies[0].velocity)}`,
                //`P1: ${pga.repr(pga.sandwichProduct(pga.makeMultiVector({ e12: 1 }), bodies[1].motor))}`,
                //`V1: ${pga.repr(bodies[1].velocity)}`,
                `Coll depth: ${lastCollInfo.depth!.toFixed(5)}`
            ]
        }
    }, [bodies, lastCollInfo, contactPointsWorld, body1Force, time])

    const gravity = useMemo(() => {
        return pga.makeMultiVector({
            e0: 0,
            e1: 20
        })
    }, [])

    const update = useCallback(() => {
        if (time > 3) return;

        setTime(time + timeDilation * dt)

        let newBody1 = body1
        let newBody2 = body2

        let force1 = pga.sandwichProduct(gravity, pga.reversion(body1.motor))
        force1.e0 = 0

        const coll = rb.satCheck(newBody1, floor)
        if (coll.overlaps && coll.depth !== undefined && coll.line !== undefined && !body1.sleeping) {
            setLastCollInfo(coll)

            const lineLength = Math.sqrt(coll.line.e1 * coll.line.e1 + coll.line.e2 * coll.line.e2)

            const tangentDir = pga.makeMultiVector({
                e01: -coll.line.e1 / lineLength,
                e02: coll.line.e2 / lineLength
            })

            console.log("tangent:", tangentDir)

            const rotor = pga.add(pga.makeMultiVector({ scalar: 1 }), pga.multiply(tangentDir, -coll.depth)) //pga.exponential(pga.multiply(tangent, coll.depth/2))
            console.log("rotor:", rotor)
            newBody1.motor = pga.geometricProduct(rotor, newBody1.motor)

            const contactPoint = rb.closestRigidBodyPointToLine(newBody1, coll.line)!

            const normalLine = pga.innerProduct(pga.div(coll.line, lineLength), contactPoint)
            const normalLineBody = pga.sandwichProduct(normalLine, pga.reversion(newBody1.motor))
            console.log("Normal line world:", normalLine)
            console.log("Tangent line:", coll.line)
            console.log("Normal line body:", normalLineBody)
            console.log("Vel:", newBody1.velocity)

            const normalVelocityBody = pga.geometricProduct(pga.innerProduct(newBody1.velocity, normalLineBody), normalLineBody)

            const velLength = Math.sqrt(newBody1.velocity.e01 * newBody1.velocity.e01 + newBody1.velocity.e02 * newBody1.velocity.e02)

            let newContactPoints = contactPointsWorld.concat(contactPoint)
            if (newContactPoints.length > 10) {
                newContactPoints.splice(0, 1)
            }
            setContactPointsWorld(newContactPoints)

            console.log("Contact point world:", contactPoint)
            const contactPointBody = pga.sandwichProduct(contactPoint, pga.reversion(newBody1.motor))
            console.log("Contact point body:", contactPointBody)

            const collForce = pga.multiply(
                normalLineBody, 1.2 * velLength
            )

            newBody1.velocity = pga.sub(newBody1.velocity, pga.dual(collForce))

            setBody1Force(pga.sandwichProduct(collForce, body1.motor))
            console.log("Coll force:", collForce)

            //setTime(10)
        }

        newBody1 = body1.sleeping ? body1 : rb.updatePointParticle2D(body1, force1, timeDilation * dt)
        newBody2 = rb.updatePointParticle2D(body2, gravity, timeDilation * dt)

        setBody1(newBody1)
        setBody2(newBody2)
    }, [gravity, body1, body2, floor, time, contactPointsWorld])

    useInterval(update, 1000 * dt)

    return <viz.SceneView scene={scene} />
}

export default App
