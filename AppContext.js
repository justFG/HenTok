// AppContext.js
import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [videoFiles, setVideoFiles] = useState([]); // { uri, title }
  const [showButtons, setShowButtons] = useState(true);
  const [likedVideos, setLikedVideos] = useState([]);
  const [favoriteVideos, setFavoriteVideos] = useState([]);
  const [theme, setTheme] = useState('dark');

  // load persisted state
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('HENTOK_STATE_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.videoFiles) setVideoFiles(parsed.videoFiles);
          if (typeof parsed.showButtons === 'boolean') setShowButtons(parsed.showButtons);
          if (parsed.likedVideos) setLikedVideos(parsed.likedVideos);
          if (parsed.favoriteVideos) setFavoriteVideos(parsed.favoriteVideos);
          if (parsed.theme) setTheme(parsed.theme);
        }
      } catch (e) { /* ignore */ }
    })();
  }, []);

  // persist on changes
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem('HENTOK_STATE_v1', JSON.stringify({
          videoFiles, showButtons, likedVideos, favoriteVideos, theme
        }));
      } catch (e) { /* ignore */ }
    })();
  }, [videoFiles, showButtons, likedVideos, favoriteVideos, theme]);

  const toggleLike = (uri) => {
    setLikedVideos(prev => (prev.includes(uri) ? prev.filter(u => u !== uri) : [...prev, uri]));
  };

  const toggleFavorite = (uri) => {
    setFavoriteVideos(prev => (prev.includes(uri) ? prev.filter(u => u !== uri) : [...prev, uri]));
  };

  // If a video is removed (soft delete), also remove it from liked/favorites
  const removeVideosByUris = (uris) => {
    setVideoFiles(prev => prev.filter(v => !uris.includes(v.uri)));
    setLikedVideos(prev => prev.filter(u => !uris.includes(u)));
    setFavoriteVideos(prev => prev.filter(u => !uris.includes(u)));
  };

  return (
    <AppContext.Provider value={{
      videoFiles, setVideoFiles,
      showButtons, setShowButtons,
      likedVideos, favoriteVideos,
      toggleLike, toggleFavorite,
      theme, setTheme,
      removeVideosByUris,
    }}>
      {children}
    </AppContext.Provider>
  );
}
