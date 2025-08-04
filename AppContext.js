import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [showButtons, setShowButtons] = useState(true);
  const [videoFiles, setVideoFiles] = useState([]); // liste des chemins vidéos

  return (
    <AppContext.Provider value={{ showButtons, setShowButtons, videoFiles, setVideoFiles }}>
      {children}
    </AppContext.Provider>
  );
};
