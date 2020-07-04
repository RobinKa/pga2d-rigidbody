import React, { useCallback, useState, useEffect } from "react"
import { BiVector } from "./pga2d"

type PointElementPGA2DProps = {
    point: BiVector
    radius?: number
    fill?: string
    label?: string
    trailCount?: number
    trailStroke?: string
}

export function PointElementPGA2D(props: PointElementPGA2DProps) {
    const { point, radius, fill, label, trailCount, trailStroke } = props

    const x = point.e01 / point.e12
    const y = point.e02 / point.e12

    const [trail, setTrail] = useState<[number, number][]>([])

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
    
    useEffect(() => {
        updateTrail()
    }, [x, y, updateTrail, trailCount])

    return (
        <g>
            {trail.length > 0 &&
                <polyline fill="none" stroke={trailStroke || "#F37121"}
                    strokeWidth={0.5 * (radius || 1)}
                    points={trail.reduce((a, b) => a + " " + b[0] + " " + b[1], "")} />
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