import React, { useState, useEffect, useCallback, useMemo } from 'react'
import './App.css'
import * as pga from "./ga/pga2d"
import * as rb from "./ga/rb2d"
import { PointElementPGA2D } from './ga/viz2d'


function App() {
    const dt = 0.03
    const grav = 20

    const [time, setTime] = useState(0)

    const [body, setBody] = useState(rb.makeRigidBody2D({ scalar: 1, e01: 5 }, { e02: 1 }))
    const [body2, setBody2] = useState(rb.makeRigidBody2D({ scalar: 1 }, { e02: -1 }))

    const bodyPos = useMemo(() => {
        return pga.sandwichProduct(pga.makeMultiVector({ e12: 1 }), body.motor)
    }, [body])

    const bodyPos2 = useMemo(() => {
        return pga.sandwichProduct(pga.makeMultiVector({ e12: 1 }), body2.motor)
    }, [body2])

    const t1 = useMemo(() => {
        return pga.regressiveProduct(pga.dual(body.velocity), body.velocity)
    }, [body])

    const t2 = useMemo(() => {
        return pga.regressiveProduct(pga.dual(body2.velocity), body2.velocity)
    }, [body2])

    const v1 = useMemo(() => {
        // Transform origin with body motors to get space frame positions
        const pos1 = pga.sandwichProduct(pga.makeMultiVector({ e12: 1 }), body2.motor)
        const pos2 = pga.sandwichProduct(pga.makeMultiVector({ e12: 1 }), body.motor)

        // Line through space frame positions
        const line = pga.regressiveProduct(pos1, pos2)
        const lineLength = Math.sqrt(line.e1 * line.e1 + line.e2 * line.e2)

        return -grav / lineLength
    }, [body, body2])

    const v2 = useMemo(() => {
        // Transform origin with body motors to get space frame positions
        const pos1 = pga.sandwichProduct(pga.makeMultiVector({ e12: 1 }), body2.motor)
        const pos2 = pga.sandwichProduct(pga.makeMultiVector({ e12: 1 }), body.motor)

        // Line through space frame positions
        const line = pga.regressiveProduct(pos1, pos2)
        const lineLength = Math.sqrt(line.e1 * line.e1 + line.e2 * line.e2)

        return -grav / lineLength
    }, [body, body2])

    const calcForce = useCallback((b1: rb.RigidBody2D, b2: rb.RigidBody2D) => {
        // Transform origin with body motors to get space frame positions
        const pos1 = pga.sandwichProduct(pga.makeMultiVector({ e12: 1 }), b1.motor)
        const pos2 = pga.sandwichProduct(pga.makeMultiVector({ e12: 1 }), b2.motor)

        // Line through space frame positions
        const line = pga.regressiveProduct(pos1, pos2)
        const lineLengthSq = line.e1 * line.e1 + line.e2 * line.e2
        const lineNormalized = pga.div(line, Math.sqrt(lineLengthSq))

        // Calculate gravitational force in space frame on body1
        const force = pga.multiply(lineNormalized, -grav / lineLengthSq)

        // Return force in body frame
        return pga.sandwichProduct(force, pga.reversion(b1.motor))
    }, [])

    const updateAB = useCallback(() => {
        const force = calcForce(body, body2)
        const force2 = calcForce(body2, body)

        setBody(rb.updateRigidBody2D(body, force, dt))
        setBody2(rb.updateRigidBody2D(body2, force2, dt))

        setTime(time + dt)
    }, [body, body2, calcForce, time])

    useEffect(() => {
        const timerHandle = setInterval(updateAB, 1000 * dt)

        return () => clearInterval(timerHandle)
    }, [updateAB])

    return (
        <svg viewBox="0 0 100 100" style={{ top: 0, left: 0, bottom: 0, right: 0, position: "fixed" }}>
            <rect fill="#111D5E" width="100%" height="100%" />

            <text fontWeight="100" x="1" y="3" fontSize="2" fill="#F37121">T1: {t1.scalar.toFixed(3)}</text>
            <text fontWeight="100" x="1" y="5" fontSize="2" fill="#F37121">T2: {t2.scalar.toFixed(3)}</text>
            <text fontWeight="100" x="1" y="7" fontSize="2" fill="#F37121">V1: {v1.toFixed(3)}</text>
            <text fontWeight="100" x="1" y="9" fontSize="2" fill="#F37121">V2: {v2.toFixed(3)}</text>
            <text fontWeight="100" x="1" y="11" fontSize="2" fill="#F37121">H: {(v1 + v2 + t1.scalar + t2.scalar).toFixed(3)}</text>
            <g transform="translate(50 20) scale(1)">
                <PointElementPGA2D point={bodyPos} radius={0.5} label="A" trailCount={1000} fill="#FFBD69" trailStroke="#FFBD69" />
                <PointElementPGA2D point={bodyPos2} radius={0.5} label="B" trailCount={1000} fill="#C70039" trailStroke="#C70039" />
            </g>
        </svg>
    )
}

export default App
