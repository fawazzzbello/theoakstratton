import React from 'react'
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from 'remotion'
import { Scene1Hook } from './components/Scene1Hook'
import { Scene2Stats } from './components/Scene2Stats'
import { Scene3Solution } from './components/Scene3Solution'
import { Scene4CTA } from './components/Scene4CTA'

// Scene timing (frames at 30fps)
const SCENE1_START = 0
const SCENE1_END = 110

const SCENE2_START = 100   // 10-frame crossfade overlap
const SCENE2_END = 270

const SCENE3_START = 260   // 10-frame crossfade overlap
const SCENE3_END = 370

const SCENE4_START = 360   // 10-frame crossfade overlap
const SCENE4_END = 450

export type Platform = 'tiktok' | 'instagram'

interface Props {
  platform?: Platform
}

export const OakstrattonAd: React.FC<Props> = ({ platform: _platform = 'tiktok' }) => {
  const frame = useCurrentFrame()

  // Global watermark fade-in
  const watermarkOpacity = interpolate(frame, [420, 450], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ backgroundColor: '#0D1117', fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}>
      {/* Scene 1: Hook */}
      <Sequence from={SCENE1_START} durationInFrames={SCENE1_END}>
        <Scene1Hook />
      </Sequence>

      {/* Scene 2: Stats */}
      <Sequence from={SCENE2_START} durationInFrames={SCENE2_END - SCENE2_START}>
        <Scene2Stats />
      </Sequence>

      {/* Scene 3: Solution / Brand reveal */}
      <Sequence from={SCENE3_START} durationInFrames={SCENE3_END - SCENE3_START}>
        <Scene3Solution />
      </Sequence>

      {/* Scene 4: Pricing + CTA */}
      <Sequence from={SCENE4_START} durationInFrames={SCENE4_END - SCENE4_START}>
        <Scene4CTA />
      </Sequence>

      {/* Persistent watermark — fades in at the end */}
      <div style={{
        position: 'absolute',
        bottom: 48,
        left: 0,
        right: 0,
        textAlign: 'center',
        opacity: watermarkOpacity,
        fontSize: 28,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: 500,
        letterSpacing: 2,
      }}>
        oakstratton.com
      </div>
    </AbsoluteFill>
  )
}
