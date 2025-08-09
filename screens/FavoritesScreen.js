// screens/FavoritesScreen.js
import React, { useContext } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { AppContext } from '../AppContext';
import VideoPlayerItem from '../components/VideoPlayerItem';

export default function FavoritesScreen() {
  const { videoFiles, favoriteVideos, showButtons } = useContext(AppContext);

  const favFiles = videoFiles.filter(v => favoriteVideos.includes(v.uri));

  if (favFiles.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Aucun favori pour le moment</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favFiles}
      renderItem={({ item }) => (
        <VideoPlayerItem
          uri={item.uri}
          title={item.title}
          showButtons={showButtons}
          shouldPlay={false} // don't auto play inside favorites list; paging could be added later
        />
      )}
      keyExtractor={(item) => item.uri}
      pagingEnabled
      snapToInterval={styles.fullHeight}
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
