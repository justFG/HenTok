import React, { useContext, useRef, useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, Dimensions } from 'react-native';
import { AppContext } from '../AppContext';
import VideoPlayerItem from '../components/VideoPlayerItem';
import { useIsFocused } from '@react-navigation/native';

const { height: screenHeight } = Dimensions.get('window');

export default function VideoFeedScreen() {
  const { videoFiles, showButtons } = useContext(AppContext);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [pauseAll, setPauseAll] = useState(false);
  const isFocused = useIsFocused();

  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setVisibleIndex(viewableItems[0].index);
    }
  }).current;

  useEffect(() => {
    if (!isFocused) {
      setPauseAll(true);
    } else {
      setPauseAll(false);
    }
  }, [isFocused]);

  if (videoFiles.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Aucune vidéo trouvée</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={videoFiles}
      renderItem={({ item, index }) => (
        <VideoPlayerItem
          uri={item.uri}
          title={item.title}
          showButtons={showButtons}
          isVisible={index === visibleIndex}
          shouldPauseAll={pauseAll}
        />
      )}
      keyExtractor={(item, index) => index.toString()}
      pagingEnabled
      snapToInterval={screenHeight}
      snapToAlignment="start"
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  emptyText: {
    color: '#6F130A',
    fontSize: 20,
  },
});
