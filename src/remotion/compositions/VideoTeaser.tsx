import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { Hook } from '../components/Hook';
import { Scene } from '../components/Scene';
import { CTA } from '../components/CTA';

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  likesCount: number;
}

interface SceneType {
  postIndex: number;
  duration: number;
  caption: string;
  animation: 'zoom-in' | 'zoom-out' | 'slide-up' | 'fade';
}

interface Script {
  hook: string;
  scenes: SceneType[];
  cta: string;
  brandHandle: string;
  colorPalette: { primary: string; secondary: string; text: string };
  audioMood: string;
}

interface VideoTeaserProps {
  posts: Post[];
  script: Script;
}

export const VideoTeaser: React.FC<VideoTeaserProps> = ({ posts, script }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  let currentFrame = 0;

  const hookDuration = 2 * fps;
  const hookStart = currentFrame;
  currentFrame += hookDuration;

  const sceneSequences = script.scenes.map((scene) => {
    const start = currentFrame;
    const duration = scene.duration * fps;
    currentFrame += duration;
    return { ...scene, start, duration };
  });

  const ctaDuration = 2 * fps;
  const ctaStart = currentFrame;
  currentFrame += ctaDuration;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Sequence from={hookStart} durationInFrames={hookDuration}>
        <Hook text={script.hook} colorPalette={script.colorPalette} />
      </Sequence>

      {sceneSequences.map((scene, index) => (
        <Sequence key={index} from={scene.start} durationInFrames={scene.duration}>
          <Scene
            post={posts[scene.postIndex]}
            caption={scene.caption}
            animation={scene.animation}
            colorPalette={script.colorPalette}
          />
        </Sequence>
      ))}

      <Sequence from={ctaStart} durationInFrames={ctaDuration}>
        <CTA text={script.cta} brandHandle={script.brandHandle} colorPalette={script.colorPalette} />
      </Sequence>
    </AbsoluteFill>
  );
};