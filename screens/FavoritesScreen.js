import React, { useContext } from 'react';
import { FlatList, Dimensions } from 'react-native';
import VideoPlayerItem from '../components/VideoPlayerItem';
import { AppContext } from '../AppContext';

const screenHeight = Dimensions.get('window').height;

export default function FavoritesScreen() {
  const { videoFiles, favoriteVideos, showButtons } = useContext(AppContext);

  const favorites = videoFiles.filter((video) => favoriteVideos.includes(video.uri));

  return (
    <FlatList
      data={favorites}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <VideoPlayerItem
          uri={item.uri}
          title={item.title}
          showButtons={showButtons}
        />
      )}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToAlignment="start"
      decelerationRate="fast"
      snapToInterval={screenHeight}
      scrollEventThrottle={16}
    />
  );
}
