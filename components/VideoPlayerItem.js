import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { Video, Audio } from 'expo-av';
import { AntDesign, FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function VideoPlayerItem({ uri, title, showButtons }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayIcon, setShowPlayIcon] = useState(false);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  const handlePress = async () => {
    if (videoRef.current) {
      const status = await videoRef.current.getStatusAsync();
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.current.playAsync();
        setIsPlaying(true);
      }

      // Show central icon briefly
      setShowPlayIcon(true);
      setTimeout(() => setShowPlayIcon(false), 600);
    }
  };

  const enterFullscreen = () => {
    if (videoRef.current) {
      videoRef.current.presentFullscreenPlayer();
    }
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
            shouldPlay
            isLooping
            isMuted={false}
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

      {/* Titre façon TikTok */}
      <View style={styles.bottomLeft}>
        <Text style={styles.username}>@user</Text>
        <Text style={styles.description}>{title}</Text>
      </View>

      {/* Boutons à droite */}
      {showButtons && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.button}>
            <AntDesign name="heart" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <FontAwesome name="bookmark" size={26} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={enterFullscreen}>
            <AntDesign name="arrowsalt" size={26} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
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
});
