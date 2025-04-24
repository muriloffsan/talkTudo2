import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Keyboard,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../../firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  arrayUnion,
  getDoc,
  deleteDoc,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import Post from '../screens/components/Post';

export default function HomeScreen({ navigation }) {
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const nav = useNavigation();
  const currentUser = auth.currentUser;

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Erro ao buscar posts: ", error);
      Alert.alert("Erro", "Não foi possível carregar os posts.");
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = () => {
    auth.signOut();
    navigation.replace('Login');
  };

  const createPost = async () => {
    if (!postText.trim()) {
      Alert.alert('Atenção', 'Escreva algo para postar!');
      return;
    }

    if (!currentUser) {
      Alert.alert("Erro", "Você precisa estar logado para postar.");
      return;
    }

    const uid = currentUser.uid;
    let nome = 'Usuário Anônimo';

    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        nome = userDocSnap.data()?.nome || nome;
      }

      await addDoc(collection(db, 'posts'), {
        userId: uid,
        userName: nome,
        content: postText.trim(),
        likes: [],
        createdAt: serverTimestamp()
      });

      setPostText('');
      Keyboard.dismiss();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao criar post');
      console.error(error);
    }
  };

  const handleLike = async (postId, currentLikes) => {
    if (!currentUser) {
      Alert.alert("Erro", "Você precisa estar logado para curtir.");
      return;
    }

    const postRef = doc(db, 'posts', postId);
    const userId = currentUser.uid;
    const likesArray = Array.isArray(currentLikes) ? currentLikes : [];

    try {
      if (!likesArray.includes(userId)) {
        await updateDoc(postRef, { likes: arrayUnion(userId) });
      } else {
        await updateDoc(postRef, { likes: arrayRemove(userId) });
      }
    } catch (error) {
      console.error("Erro ao curtir/descurtir post:", error);
      Alert.alert("Erro", "Não foi possível atualizar a curtida.");
    }
  };

  const handleDelete = async (postId, userId) => {
    if (currentUser?.uid !== userId) {
      return Alert.alert('Ação não permitida');
    }

    await deleteDoc(doc(db, 'posts', postId));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Botão para abrir a barra lateral */}
        <TouchableOpacity onPress={() => setSidebarVisible(true)} style={styles.menuBtn}>
          <Text style={styles.menuText}>☰</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Talk Tudo 👋</Text>
          <Text style={styles.subtitle}>Usuário: {currentUser?.email}</Text>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentArea}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#1877F2" style={styles.loadingIndicator} />
          ) : (
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Post
                  post={item}
                  onLike={() => handleLike(item.id, item.likes || [])}
                  onDelete={() => handleDelete(item.id, item.userId)}
                  currentUserId={currentUser?.uid}
                  navigation={navigation}
                />
              )}
              contentContainerStyle={styles.listContentContainer}
              ListEmptyComponent={<Text style={styles.emptyListText}>Nenhum post ainda. Seja o primeiro!</Text>}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="O que você está pensando?"
            value={postText}
            onChangeText={setPostText}
            style={styles.input}
            placeholderTextColor="#888"
            multiline
          />
          <TouchableOpacity
            onPress={createPost}
            style={[styles.button, !postText.trim() && styles.buttonDisabled]}
            disabled={!postText.trim()}
          >
            <Text style={styles.buttonText}>Postar</Text>
          </TouchableOpacity>
        </View>

        {/* Modal da barra lateral */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={sidebarVisible}
          onRequestClose={() => setSidebarVisible(false)}
        >
          <TouchableOpacity
            style={styles.sidebarOverlay}
            onPress={() => setSidebarVisible(false)}
            activeOpacity={1}
          >
            <View style={styles.sidebar}>
              <Text style={styles.sidebarTitle}>Menu</Text>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  setSidebarVisible(false);
                  nav.navigate('Profile');
                }}
              >
                <Text style={styles.sidebarText}>👤 Perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {
                  setSidebarVisible(false);
                  nav.navigate('Notifications'); 
                }}
              >
                <Text style={styles.sidebarText}>🔔 Notificações</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d47a1',
  },
  subtitle: {
    fontSize: 16,
    color: '#1e88e5',
  },
  logoutBtn: {
    backgroundColor: '#0d47a1',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  contentArea: {
    flex: 1,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
  },
  listContentContainer: {
    paddingBottom: 100,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#0d47a1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  menuBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    padding: 10,
  },
  menuText: {
    fontSize: 28,
    color: '#0d47a1',
  },
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#fff',
    padding: 20,
    elevation: 5,
  },
  sidebarTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sidebarItem: {
    marginVertical: 10,
  },
  sidebarText: {
    fontSize: 18,
  },
});
