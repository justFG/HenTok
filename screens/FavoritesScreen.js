import React, { useContext } from 'react';
import { FlatList, View, Dimensions, StyleSheet } from 'react-native';
import VideoPlayerItem from '../components/VideoPlayerItem';
import { AppContext } from '../AppContext';

const screenHeight = Dimensions.get('window').height;

export default function VideoFeedScreen() {
  const { videos, showButtons } = useContext(AppContext);

  return (
    <FlatList
      data={videos}
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
