// screens/SettingsScreen.js
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { AppContext } from '../AppContext';

export default function SettingsScreen({ navigation }) {
  const {
    showButtons, setShowButtons,
    videoFiles, setVideoFiles,
    likedVideos, favoriteVideos,
    theme, setTheme,
    removeVideosByUris,
  } = useContext(AppContext);

  const isDark = theme === 'dark';
  const styles = getStyles(isDark);

  const [thumbs, setThumbs] = useState({});
  const [selectedUris, setSelectedUris] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const map = {};
      for (const v of videoFiles) {
        try {
          const { uri: thumb } = await VideoThumbnails.getThumbnailAsync(v.uri, { time: 1000 });
          map[v.uri] = thumb;
        } catch (e) {
          map[v.uri] = null;
        }
      }
      if (mounted) setThumbs(map);
    })();
    return () => { mounted = false; };
  }, [videoFiles]);

  const pickFolder = async () => {
  try {
    const res = await DocumentPicker.getDocumentAsync({ type: 'video/*', multiple: true });
    console.log('DocumentPicker result:', res);

    // Normaliser les différentes formes de retour
    let files = [];
    if (res && Array.isArray(res.assets)) {
      files = res.assets; // expo sdk récent (iOS) -> { assets: [...] }
    } else if (Array.isArray(res)) {
      files = res;
    } else if (res && Array.isArray(res.output)) {
      files = res.output;
    } else if (res && res.type === 'success' && res.uri) {
      files = [res];
    } else if (res && (res.type === 'cancel' || res.canceled === true)) {
      Alert.alert('Aucun fichier sélectionné');
      return;
    } else {
      Alert.alert('Aucun fichier sélectionné');
      return;
    }

    if (!files || files.length === 0) {
      Alert.alert('Aucun fichier sélectionné');
      return;
    }

    // Préparer dossier d'app pour stocker les vidéos importées
    const destDir = FileSystem.documentDirectory + 'HenTokVideos/';
    try {
      await FileSystem.makeDirectoryAsync(destDir, { intermediates: true });
    } catch (e) {
      // ignore si existe déjà ou impossible (on continue)
      console.log('makeDirectoryAsync err', e);
    }

    const parsed = [];
    for (const file of files) {
      const origUri = file.uri;
      const name = file.name || (origUri ? origUri.split('/').pop() : `video_${Date.now()}.mp4`);
      const safeName = name.replace(/\s/g, '_');
      const destUri = destDir + safeName;

      // essai de copier le fichier dans documentDirectory pour persistance
      try {
        await FileSystem.copyAsync({ from: origUri, to: destUri });
        parsed.push({ uri: destUri, title: safeName.replace(/\.[^/.]+$/, '') });
      } catch (err) {
        // si copy échoue, fallback sur l'uri d'origine
        console.warn('copy failed, using original uri', err);
        parsed.push({ uri: origUri, title: safeName.replace(/\.[^/.]+$/, '') });
      }
    }

    // merge sans doublons (par uri)
    const merged = [...videoFiles];
    parsed.forEach(p => {
      if (!merged.some(m => m.uri === p.uri)) merged.push(p);
    });

    setVideoFiles(merged);
    Alert.alert('Succès', `${parsed.length} vidéo(s) importée(s).`);
  } catch (err) {
    console.warn('pickFolder error', err);
    Alert.alert('Erreur', 'Impossible de charger les vidéos (voir console).');
  }
};



  const clearVideos = () => {
    Alert.alert(
      'Confirmer',
      'Supprimer toutes les vidéos importées ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Oui', onPress: () => removeVideosByUris(videoFiles.map(v => v.uri)) },
      ],
      { cancelable: true }
    );
  };

  const toggleSelect = (uri) => {
    setSelectedUris(prev => (prev.includes(uri) ? prev.filter(u => u !== uri) : [...prev, uri]));
  };

  const deleteSelected = (hard = false) => {
    if (selectedUris.length === 0) {
      Alert.alert('Aucune sélection');
      return;
    }
    Alert.alert('Supprimer', `Supprimer ${selectedUris.length} vidéo(s) ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          // Soft delete from app state first
          removeVideosByUris(selectedUris);

          if (hard) {
            // Try to delete physical files (may fail on some URIs / platforms)
            for (const uri of selectedUris) {
              try {
                await FileSystem.deleteAsync(uri, { idempotent: true });
              } catch (e) {
                // ignore
              }
            }
          }
          setSelectedUris([]);
          Alert.alert('Terminé');
        },
      },
    ]);
  };

  const renderGalleryItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => toggleSelect(item.uri)}
      style={{ margin: 6, opacity: selectedUris.includes(item.uri) ? 0.6 : 1, alignItems: 'center' }}
    >
      <Image source={{ uri: thumbs[item.uri] || item.uri }} style={{ width: 120, height: 68, backgroundColor: '#222' }} />
      <Text style={{ color: isDark ? '#fff' : '#000', width: 120 }} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Paramètres</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Mode sombre</Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          trackColor={{ true: '#6F130A', false: '#999' }}
          thumbColor={isDark ? '#fff' : '#fff'}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Afficher les boutons ❤️ ⭐</Text>
        <Switch
          value={showButtons}
          onValueChange={setShowButtons}
          trackColor={{ true: '#6F130A', false: '#999' }}
          thumbColor={isDark ? '#fff' : '#fff'}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={pickFolder}>
        <Text style={styles.buttonText}>📂 Importer des vidéos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#8B0000' }]} onPress={clearVideos}>
        <Text style={styles.buttonText}>🗑️ Supprimer toutes les vidéos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#FFD700' }]}
        onPress={() => navigation.navigate('Favoris')}
      >
        <Text style={[styles.buttonText, { color: '#000' }]}>⭐ Voir les favoris</Text>
      </TouchableOpacity>

      <View style={styles.stats}>
        <Text style={styles.statItem}>🎞️ Vidéos importées : {videoFiles.length}</Text>
        <Text style={styles.statItem}>❤️ Likées : {likedVideos.length}</Text>
        <Text style={styles.statItem}>⭐ Favoris : {favoriteVideos.length}</Text>
      </View>

      {/* Galerie */}
      <View style={{ marginTop: 20 }}>
        <Text style={[styles.label, { marginBottom: 8 }]}>Galerie (sélectionne puis supprime)</Text>
        <FlatList
          data={videoFiles}
          renderItem={renderGalleryItem}
          keyExtractor={(i) => i.uri}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingVertical: 6 }}
        />
        <View style={{ flexDirection: 'row', marginTop: 12 }}>
          <TouchableOpacity style={styles.button} onPress={() => deleteSelected(false)}>
            <Text style={styles.buttonText}>Supprimer (soft)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#8B0000', marginLeft: 12 }]} onPress={() => deleteSelected(true)}>
            <Text style={styles.buttonText}>Supprimer fichier (hard)</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.footer}>HenTok v1.0{'\n'}Made with ❤️ by FG</Text>
    </ScrollView>
  );
}

function getStyles(isDark) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0f0e13' : '#fff',
      paddingHorizontal: 20,
      paddingTop: 60,
    },
    title: {
      color: isDark ? '#fff' : '#000',
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 30,
      textAlign: 'center',
    },
    section: {
      marginBottom: 30,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      color: isDark ? '#fff' : '#000',
      fontSize: 18,
    },
    button: {
      backgroundColor: '#6F130A',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginBottom: 20,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    stats: {
      marginTop: 30,
    },
    statItem: {
      color: isDark ? '#ccc' : '#444',
      fontSize: 16,
      marginVertical: 4,
    },
    footer: {
      color: isDark ? '#666' : '#aaa',
      textAlign: 'center',
      marginTop: 40,
      fontSize: 13,
    },
  });
}
