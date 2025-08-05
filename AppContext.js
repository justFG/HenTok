import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [showButtons, setShowButtons] = useState(true);
  const [videoFiles, setVideoFiles] = useState([]); // liste des vidéos
  const [theme, setTheme] = useState('dark'); // 'light' ou 'dark'
  const [likedVideos, setLikedVideos] = useState([]);
  const [favoriteVideos, setFavoriteVideos] = useState([]);

  const toggleLike = (uri) => {
    setLikedVideos((prev) =>
      prev.includes(uri) ? prev.filter((item) => item !== uri) : [...prev, uri]
    );
  };

  const toggleFavorite = (uri) => {
    setFavoriteVideos((prev) =>
      prev.includes(uri) ? prev.filter((item) => item !== uri) : [...prev, uri]
    );
  };

  return (
    <AppContext.Provider value={{
    showButtons, setShowButtons,
    videoFiles, setVideoFiles,
    likedVideos, setLikedVideos,
    favoriteVideos, setFavoriteVideos,
    theme, setTheme,
}}>

      {children}
    </AppContext.Provider>
  );
};
