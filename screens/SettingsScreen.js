import React, { useContext } from 'react';
import { View, Text, Switch, Button, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { AppContext } from '../AppContext';

export default function SettingsScreen() {
  const { showButtons, setShowButtons, setVideoFiles } = useContext(AppContext);

  const pickFolder = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'video/mp4', multiple: true });
      if (res.assets) {
        const files = res.assets.map((file) => ({
          uri: file.uri,
          title: file.name.replace('.mp4', ''),
        }));
        setVideoFiles(files);
      }
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de charger les vidéos');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Afficher les boutons ❤️ ⭐</Text>
      <Switch
        value={showButtons}
        onValueChange={(val) => setShowButtons(val)}
        trackColor={{ true: '#6F130A' }}
      />
      <View style={{ marginTop: 30 }}>
        <Button title="Importer des vidéos" onPress={pickFolder} color="#6F130A" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  label: { fontSize: 18, marginBottom: 10, color: '#6F130A' },
});
