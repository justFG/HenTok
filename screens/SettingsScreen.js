import React, { useContext } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { AppContext } from '../AppContext';

export default function SettingsScreen({ navigation }) {
  const {
    showButtons, setShowButtons,
    videoFiles, setVideoFiles,
    likedVideos, favoriteVideos,
    theme, setTheme
  } = useContext(AppContext);

  const isDark = theme === 'dark';

  const pickFolder = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'video/mp4', multiple: true });
      if (res.assets) {
        const files = res.assets.map((file) => ({
          uri: file.uri,
          title: file.name.replace('.mp4', ''),
        }));
        setVideoFiles(files);
        Alert.alert('Succès', `${files.length} vidéos importées.`);
      }
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les vidéos');
    }
  };

  const clearVideos = () => {
    Alert.alert(
      'Confirmer',
      'Supprimer toutes les vidéos importées ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Oui', onPress: () => setVideoFiles([]) },
      ],
      { cancelable: true }
    );
  };

  const styles = getStyles(isDark);

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
        <Text style={styles.buttonText}>🗑️ Supprimer les vidéos</Text>
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
