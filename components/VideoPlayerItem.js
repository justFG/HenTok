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

export default function VideoPlayerItem({ uri, title, showButtons, isVisible, shouldPauseAll }) {
  const videoRef = useRef(null);
  const {
    videoPlaybackStates,
    updateVideoPlaybackState,
    likedVideos,
    favoriteVideos,
    toggleLike,
    toggleFavorite,
  } = useContext(AppContext);

  const savedState = videoPlaybackStates[uri] || { position: 0, isPaused: false };

  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [position, setPosition] = useState(savedState.position || 0);
  const [duration, setDuration] = useState(0);
  const [isManuallyPaused, setIsManuallyPaused] = useState(savedState.isPaused || false);

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

  // Charge la position sauvegardée au montage
  useEffect(() => {
    async function loadPosition() {
      if (videoRef.current && savedState.position > 0) {
        try {
          await videoRef.current.setPositionAsync(savedState.position * 1000);
        } catch (e) {}
      }
    }
    loadPosition();
  }, []);

  // Mise à jour du status de la vidéo, sauvegarde position + pause
  useEffect(() => {
    const onPlaybackStatusUpdate = (status) => {
      if (!status.isLoaded) return;

      setPosition(status.positionMillis / 1000);
      setDuration(status.durationMillis / 1000);
      setIsPlaying(status.isPlaying);

      updateVideoPlaybackState(uri, {
        position: status.positionMillis / 1000,
        isPaused: !status.isPlaying,
      });
    };

    videoRef.current?.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);

    return () => {
      if (videoRef.current) videoRef.current.setOnPlaybackStatusUpdate(null);
    };
  }, []);

  // Gestion lecture selon visibilité, pause manuelle et pause générale
  useEffect(() => {
  async function controlPlayback() {
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();

    if (shouldPauseAll) {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
        setIsManuallyPaused(true); // On garde manuel pause true
      }
      return;
    }

    if (isVisible) {
      if (!status.isPlaying && !isManuallyPaused) {
        await videoRef.current.playAsync();
        setIsPlaying(true);
        setShowPlayIcon(false);
      }
      // Si manuellement pausé, on reste en pause, on ne lance rien.
    } else {
      // La vidéo devient invisible => reset manuel pause et pause la vidéo
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      }
      setIsPlaying(false);
      setIsManuallyPaused(false);  // <<< reset manuel pause ici
      setShowPlayIcon(false);
    }
  }
  controlPlayback();
}, [isVisible, isManuallyPaused, shouldPauseAll]);
useEffect(() => {
  async function resetPositionIfVisible() {
    if (isVisible && videoRef.current) {
      await videoRef.current.setPositionAsync(0);
      setPosition(0);
      setIsManuallyPaused(false); // relance automatique possible
    }
  }
  resetPositionIfVisible();
}, [isVisible]);

  // Play/pause manuel
  const handlePress = async () => {
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();

    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
      setIsPlaying(false);
      setIsManuallyPaused(true);
    } else {
      await videoRef.current.playAsync();
      setIsPlaying(true);
      setIsManuallyPaused(false);
    }
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 600);
  };

  // Slider seek
  const handleSlidingComplete = async (value) => {
    if (!videoRef.current) return;
    await videoRef.current.setPositionAsync(value * 1000);
    setPosition(value);
    setIsManuallyPaused(true);
    setIsPlaying(false);
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 600);
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

        {!isPlaying && duration > 0 && (
          <Slider
            style={{ width: '90%', height: 40, marginTop: 10 }}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            minimumTrackTintColor="#6F130A"
            maximumTrackTintColor="#fff"
            onSlidingComplete={handleSlidingComplete}
          />
        )}
      </View>

      {showButtons && (
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.button} onPress={() => toggleLike(uri)}>
            <AntDesign name="heart" size={28} color={isLiked ? 'red' : 'white'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => toggleFavorite(uri)}>
            <FontAwesome name="bookmark" size={26} color={isFavorited ? 'gold' : 'white'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => videoRef.current?.presentFullscreenPlayer()}>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
    borderRadius: 8,
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
