import React, { useCallback, useState, useEffect, useMemo } from "react"
import * as pga from "./ga_zpp"
import * as rb from "./rb2d"

export type PointElementPGA2DProps = {
    point: pga.BiVector
    radius?: number
    fill?: string
    label?: string
    trailCount?: number
    trailStroke?: string
}

const getPolyLinePoints = (points: [number, number][]): string =>
    points.flat().join(" ")


export function PointElementPGA2D(props: PointElementPGA2DProps) {
    const { point, radius, fill, label, trailCount, trailStroke } = props

    const x = -point.e02 / point.e12
    const y = point.e01 / point.e12

    const [trail, setTrail] = useState<[number, number][]>([])

    const trailPolyPoints = useMemo(() => getPolyLinePoints(trail), [trail])

    const updateTrail = useCallback(() => {
        if (trailCount) {
            if (trail.length === 0 || (trail[trail.length - 1][0] !== x || trail[trail.length - 1][1] !== y)) {
                let newTrail = [...trail]
                if (newTrail.length > trailCount) {
                    newTrail = newTrail.slice(1)
                }
                newTrail.push([x, y])
                setTrail(newTrail)
            }
        } else {
            setTrail([])
        }
    }, [x, y, trail, trailCount])

    useEffect(updateTrail, [x, y])

    return (
        <g>
            {trail.length > 0 &&
                <polyline fill="none" stroke={trailStroke || "#F37121"}
                    strokeWidth={0.5 * (radius || 1)}
                    points={trailPolyPoints} />
            }

            <circle cx={x} cy={y} r={radius || 1} fill={fill || "#F37121"} />

            {label &&
                <text x={x} y={y} dominantBaseline="middle"
                    fontWeight="800"
                    textAnchor="middle" fontSize={radius || 1}>
                    {label}
                </text>
            }
        </g>
    )
}

export type LineElementPGA2DProps = {
    line: pga.Vector
    width?: number
    stroke?: string
    label?: string
}

export function LineElementPGA2D(props: LineElementPGA2DProps) {
    let { line, width, stroke, label } = props

    const lineCoords = useMemo(() => {
        if (Math.abs(line.e2) > Math.abs(line.e1)) {
            const startX = -50
            const endX = 50
            const startY = -(line.e1 * startX + line.e0) / line.e2
            const endY = -(line.e1 * endX + line.e0) / line.e2
            return [startX, startY, endX, endY]
        } else {
            const startY = -50
            const endY = 50
            const startX = -(line.e2 * startY + line.e0) / line.e1
            const endX = -(line.e2 * endY + line.e0) / line.e1
            return [startX, startY, endX, endY]
        }
    }, [line])

    return (
        <g>
            <line x1={lineCoords[0]} y1={lineCoords[1]} x2={lineCoords[2]} y2={lineCoords[3]}
                strokeWidth={width || 1} stroke={stroke || "#F37121"} />

            <circle cx={lineCoords[0]} cy={lineCoords[1]} r={50} fill="#12345633" />

            {label &&
                <text x={(lineCoords[0] + lineCoords[2]) / 2} y={(lineCoords[1] + lineCoords[3]) / 2}
                    dominantBaseline="middle" fontWeight="800"
                    textAnchor="middle" fontSize={1}>
                    {label}
                </text>
            }
        </g>
    )
}

export type RigidBody2DElementProps = {
    rigidBody: rb.RigidBody2D
    radius?: number
    label?: string
}

export function RigidBody2DElement(props: RigidBody2DElementProps) {
    const { rigidBody, radius, label } = props

    const rbPos = useMemo(() => {
        return pga.pointCoordinates(
            pga.sandwichProduct(
                { e12: 1 },
                rigidBody.motor
            )
        )
    }, [rigidBody])

    const rbPolyPoints = useMemo(
        () => {
            if (rigidBody.points.length === 0) {
                return ""
            }

            // BiVector to xy coordinates
            const rbPoints = rigidBody.points
                .map(p => pga.sandwichProduct(p, rigidBody.motor))
                .map(pga.pointCoordinates)

            // Append first point so we get a closed loop
            return getPolyLinePoints(rbPoints.concat(rbPoints.slice(0, 1)))
        },
        [rigidBody]
    )

    return (
        <g>
            <polyline fill="#F37121" fillOpacity={0.5} stroke={"#F37121"}
                strokeWidth={0.5 * (radius || 1)}
                points={rbPolyPoints} />

            {label &&
                <text x={rbPos[0]} y={rbPos[1]} dominantBaseline="middle"
                    fontWeight="800"
                    textAnchor="middle" fontSize={1}>
                    {label}
                </text>
            }
        </g>
    )
}

export type Scene = {
    rigidBodies?: RigidBody2DElementProps[]
    points?: PointElementPGA2DProps[]
    lines?: LineElementPGA2DProps[]
    infos?: string[]
}

export type SceneViewProps = {
    scene: Scene
}

export function SceneView(props: SceneViewProps) {
    const { scene } = props

    return (
        <svg viewBox="0 0 100 100" style={{ top: 0, left: 0, bottom: 0, right: 0, position: "fixed" }}>
            <rect fill="#111D5E" width="100%" height="100%" />

            <g transform="translate(50 20) scale(1)">
                {scene.rigidBodies && scene.rigidBodies.map((r, i) =>
                    <RigidBody2DElement {...r} key={i} />
                )}

                {scene.lines && scene.lines.map((l, i) =>
                    <LineElementPGA2D {...l} key={i} />
                )}

                {scene.points && scene.points.map((p, i) =>
                    <PointElementPGA2D {...p} key={i} />
                )}
            </g>

            {scene.infos && scene.infos.map((info, i) => {
                return (
                    <text key={i} fontWeight="100" x="0" y={1 + i} fontSize="1" fill="#F37121">
                        {info}
                    </text>
                )
            })}
        </svg>
    )
}