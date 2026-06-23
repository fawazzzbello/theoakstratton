import React from 'react'
import { Composition } from 'remotion'
import { OakstrattonAd } from './OakstrattonAd'

// 9:16 vertical — works for TikTok, Snapchat, Instagram Reels/Stories
const VERTICAL_WIDTH = 1080
const VERTICAL_HEIGHT = 1920
// 1:1 square — works for Instagram feed
const SQUARE_SIZE = 1080

const FPS = 30
const DURATION_FRAMES = 450 // 15 seconds

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="OakstrattonAd-TikTok"
      component={OakstrattonAd}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={VERTICAL_WIDTH}
      height={VERTICAL_HEIGHT}
      defaultProps={{ platform: 'tiktok' as const }}
    />
    <Composition
      id="OakstrattonAd-Instagram"
      component={OakstrattonAd}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={SQUARE_SIZE}
      height={SQUARE_SIZE}
      defaultProps={{ platform: 'instagram' as const }}
    />
  </>
)
