import React, { useContext } from 'react';
import { View, FlatList, Text, StyleSheet, Dimensions } from 'react-native';
import { AppContext } from '../AppContext';
import VideoPlayerItem from '../components/VideoPlayerItem';

const { height: screenHeight } = Dimensions.get('window');

export default function VideoFeedScreen() {
  const { videoFiles, showButtons } = useContext(AppContext);

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
      renderItem={({ item }) => (
        <VideoPlayerItem uri={item.uri} title={item.title} showButtons={showButtons} />
      )}
      keyExtractor={(item, index) => index.toString()}
      pagingEnabled
      snapToInterval={screenHeight}
      snapToAlignment="start"
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
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
