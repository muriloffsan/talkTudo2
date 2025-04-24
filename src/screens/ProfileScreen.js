// Murilo Ferreira Faria Santana e Pedro Zocatelli

import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Alert, ScrollView, ActivityIndicator, SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../../firebase';
import {
  doc, getDoc, updateDoc, collection, query, where, orderBy, onSnapshot
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProfileScreen() {
  const [nome, setNome] = useState('');
  const [bio, setBio] = useState('');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigation = useNavigation();
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) {
      Alert.alert("Erro", "Usuário não encontrado.");
      navigation.goBack();
      return;
    }

    console.log("UID do usuário:", uid); // 🧠 DEBUG UID

    const carregarPerfil = async () => {
      try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setNome(data.nome || '');
          setBio(data.bio || '');
        } else {
          console.warn("Usuário não encontrado no Firestore");
        }

      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        Alert.alert("Erro", "Não foi possível carregar o perfil.");
      }
    };

    const q = query(
      collection(db, 'posts'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const meusPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log("Posts recebidos:", meusPosts); // 🧠 DEBUG POSTS
      setPosts(meusPosts);
      setIsLoading(false);
    }, (error) => {
      console.error("Erro ao carregar posts:", error);
      Alert.alert("Erro", "Não foi possível carregar os posts.");
      setIsLoading(false);
    });

    carregarPerfil();

    return unsubscribe;
  }, [uid, navigation]);

  const salvarAlteracoes = async () => {
    if (!uid) return;
    if (!nome.trim()) {
      Alert.alert("Atenção", "O nome não pode ficar em branco.");
      return;
    }

    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        nome: nome.trim(),
        bio: bio.trim()
      });
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      Alert.alert("Erro", "Não foi possível salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderPostItem = ({ item }) => (
    <View style={styles.postItem}>
      <Text style={styles.postText}>{item.content}</Text>
      {item.createdAt?.toDate && (
        <Text style={styles.postDate}>
          {formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true, locale: ptBR })}
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1877F2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'< Voltar'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Seu Perfil</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.profileSection}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Como você quer ser chamado?"
            placeholderTextColor="#999"
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Fale um pouco sobre você..."
            placeholderTextColor="#999"
            value={bio}
            onChangeText={setBio}
            multiline
            maxLength={150}
          />

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={salvarAlteracoes}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.postsSection}>
          <Text style={styles.subtitle}>Seus Posts</Text>
          <FlatList
            data={posts}
            keyExtractor={item => item.id}
            renderItem={renderPostItem}
            ListEmptyComponent={<Text style={styles.emptyText}>Você ainda não criou nenhum post.</Text>}
            nestedScrollEnabled={true}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd'
  },
  backButton: { padding: 5 },
  backButtonText: { fontSize: 16, color: '#1877F2', fontWeight: '500' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1c1e21' },
  scrollContainer: { paddingBottom: 30 },
  profileSection: {
    backgroundColor: '#fff', padding: 20, margin: 10, borderRadius: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1,
    shadowRadius: 1.5, elevation: 2
  },
  label: { fontSize: 14, color: '#606770', marginBottom: 5, fontWeight: '500' },
  input: {
    borderWidth: 1, borderColor: '#ccd0d5', backgroundColor: '#f5f6f7',
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 15,
    borderRadius: 6, fontSize: 16, color: '#1c1e21'
  },
  bioInput: { height: 100, textAlignVertical: 'top' },
  saveButton: {
    backgroundColor: '#1877F2', paddingVertical: 12,
    borderRadius: 6, alignItems: 'center', marginTop: 10
  },
  saveButtonDisabled: { backgroundColor: '#a4c6f5' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  postsSection: { marginTop: 10, paddingHorizontal: 10 },
  subtitle: { fontSize: 18, fontWeight: 'bold', color: '#1c1e21', marginBottom: 10 },
  postItem: {
    backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 1.0, elevation: 1
  },
  postText: { fontSize: 15, color: '#1c1e21', marginBottom: 5 },
  postDate: { fontSize: 11, color: '#606770', textAlign: 'right' },
  emptyText: {
    fontStyle: 'italic', color: '#606770',
    textAlign: 'center', marginTop: 20, paddingHorizontal: 10
  }
});
