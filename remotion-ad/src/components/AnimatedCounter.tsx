import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion'

interface Props {
  from: number
  to: number
  startFrame?: number
  durationFrames?: number
  prefix?: string
  suffix?: string
  style?: React.CSSProperties
}

export const AnimatedCounter: React.FC<Props> = ({
  from,
  to,
  startFrame = 0,
  durationFrames = 40,
  prefix = '',
  suffix = '',
  style,
}) => {
  const frame = useCurrentFrame()
  const { fps: _fps } = useVideoConfig()

  const localFrame = Math.max(0, frame - startFrame)

  const value = interpolate(localFrame, [0, durationFrames], [from, to], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
    easing: Easing.out(Easing.cubic),
  })

  const displayed = Number.isInteger(to)
    ? Math.floor(value).toString()
    : value.toFixed(1)

  return (
    <span style={style}>
      {prefix}{displayed}{suffix}
    </span>
  )
}
