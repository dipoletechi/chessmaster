import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface SplashVideoProps {
  onFinish: () => void;
  videoSource: any;
}

export function SplashVideo({ onFinish, videoSource }: SplashVideoProps) {
  const videoRef = useRef<Video>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ensure native splash is hidden
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (status.didJustFinish) {
        // Video finished, hide splash and show app
        onFinish();
      }
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={videoSource}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onLoad={() => setIsReady(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

