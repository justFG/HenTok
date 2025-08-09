// components/VideoPlayerItem.js
import React, { useRef, useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Video, Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { AppContext } from '../AppContext';

const { width, height } = Dimensions.get('window');

export default function VideoPlayerItem({ uri, title, showButtons = true, shouldPlay = false }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [status, setStatus] = useState({ isLoaded: false });

  const {
    likedVideos,
    favoriteVideos,
    toggleLike,
    toggleFavorite,
  } = useContext(AppContext);

  const isLiked = likedVideos.includes(uri);
  const isFavorited = favoriteVideos.includes(uri);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  // control playback via shouldPlay
  useEffect(() => {
    let mounted = true;
    const control = async () => {
      if (!videoRef.current || !mounted) return;
      try {
        const s = await videoRef.current.getStatusAsync();
        // if not loaded yet, try to call play/pause after load through status callback
        if (shouldPlay) {
          if (s.isLoaded && !s.isPlaying) {
            await videoRef.current.playAsync();
            setIsPlaying(true);
          }
        } else {
          if (s.isLoaded && s.isPlaying) {
            await videoRef.current.pauseAsync();
            setIsPlaying(false);
          }
        }
      } catch (e) {
        // ignore
      }
    };
    control();
    return () => { mounted = false; };
  }, [shouldPlay]);

  const onPlaybackStatusUpdate = (s) => {
    if (!s) return;
    setStatus(s);
    setIsPlaying(!!s.isPlaying);
  };

  const handlePress = async () => {
    if (!videoRef.current) return;
    try {
      const s = await videoRef.current.getStatusAsync();
      if (s.isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.current.playAsync();
        setIsPlaying(true);
      }
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 600);
    } catch (e) {}
  };

  const enterFullscreen = () => {
    if (videoRef.current && videoRef.current.presentFullscreenPlayer) {
      videoRef.current.presentFullscreenPlayer();
    }
  };

  const durationSec = status.durationMillis ? Math.floor(status.durationMillis / 1000) : 0;
  const posSec = status.positionMillis ? Math.floor(status.positionMillis / 1000) : 0;

  const onSeekComplete = async (value) => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.setPositionAsync(value * 1000);
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={styles.videoWrapper}>
          <Video
            ref={videoRef}
            source={{ uri }}
            style={styles.video}
            resizeMode="contain"
            isLooping
            isMuted={false}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
            shouldPlay={false} // controlled by shouldPlay effect
          />
          {showPlayIcon && (
            <View style={styles.centerIcon}>
              <AntDesign
                name={isPlaying ? 'pausecircle' : 'playcircleo'}
                size={64}
                color="white"
              />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      <View style={styles.bottomLeft}>
        <Text style={styles.username}>@user</Text>
        <Text style={styles.description}>{title}</Text>
      </View>

      {status && status.isLoaded && (
        <View style={styles.sliderContainer}>
          <Text style={styles.timeText}>{formatTime(posSec)}</Text>
          <Slider
            style={{ flex: 1 }}
            minimumValue={0}
            maximumValue={durationSec}
            value={posSec}
            onSlidingComplete={onSeekComplete}
            step={1}
          />
          <Text style={styles.timeText}>{formatTime(durationSec)}</Text>
        </View>
      )}

      {showButtons && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.button} onPress={() => toggleLike(uri)}>
            <AntDesign name="heart" size={28} color={isLiked ? 'red' : 'white'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => toggleFavorite(uri)}>
            <FontAwesome name="bookmark" size={26} color={isFavorited ? 'gold' : 'white'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={enterFullscreen}>
            <AntDesign name="arrowsalt" size={26} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const styles = StyleSheet.create({
  container: {
    height,
    width,
    backgroundColor: 'black',
    position: 'relative',
  },
  videoWrapper: {
    width,
    height,
    position: 'relative',
  },
  video: {
    width,
    height,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerIcon: {
    position: 'absolute',
    top: '45%',
    left: '45%',
    zIndex: 10,
    opacity: 0.8,
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 80,
    left: 10,
    width: width * 0.7,
  },
  username: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    color: '#FFF',
    fontSize: 14,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  overlay: {
    position: 'absolute',
    right: 15,
    bottom: 100,
    alignItems: 'center',
  },
  button: {
    marginVertical: 12,
    backgroundColor: '#6F130A',
    borderRadius: 30,
    padding: 14,
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 40,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#FFF',
    width: 48,
    textAlign: 'center',
  },
});
