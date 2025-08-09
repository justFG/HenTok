// screens/VideoFeedScreen.js
import React, { useContext, useRef, useState } from 'react';
import { View, FlatList, Text, StyleSheet, Dimensions } from 'react-native';
import { AppContext } from '../AppContext';
import VideoPlayerItem from '../components/VideoPlayerItem';
import { useIsFocused } from '@react-navigation/native';

const { height: screenHeight } = Dimensions.get('window');

export default function VideoFeedScreen() {
  const { videoFiles, showButtons } = useContext(AppContext);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };
  const isFocused = useIsFocused();

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setVisibleIndex(viewableItems[0].index);
    }
  }).current;

  if (!videoFiles || videoFiles.length === 0) {
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
          shouldPlay={isFocused && index === visibleIndex}
        />
      )}
      keyExtractor={(item, index) => item.uri || index.toString()}
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
