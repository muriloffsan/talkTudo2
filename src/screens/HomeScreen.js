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
  ScrollView,
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
} from 'firebase/firestore';
import Post from '../screens/components/Post';

export default function HomeScreen({ navigation }) {
  const user = auth.currentUser;
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(data);
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

    const uid = auth.currentUser?.uid;
    let nome = 'Usuário Anônimo';

    try {
      const userDocSnap = await getDoc(doc(db, 'users', uid));
      if (userDocSnap.exists()) {
        nome = userDocSnap.data().nome || nome;
      }

      await addDoc(collection(db, 'posts'), {
        userId: uid,
        userName: nome,
        content: postText,
        likes: [],
        createdAt: new Date(),
      });

      setPostText('');
    } catch (error) {
      Alert.alert('Erro', 'Erro ao criar post');
      console.error(error);
    }
  };

  const handleLike = async (postId, likes) => {
    const userId = auth.currentUser?.uid;
    if (!likes.includes(userId)) {
      await updateDoc(doc(db, 'posts', postId), {
        likes: arrayUnion(userId),
      });
    }
  };

  const handleDelete = async (postId, userId) => {
    if (auth.currentUser?.uid !== userId) {
      return Alert.alert('Ação não permitida');
    }

    await deleteDoc(doc(db, 'posts', postId));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Talk Tudo 👋</Text>
              <Text style={styles.subtitle}>Usuário: {user?.email}</Text>
              <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                <Text style={styles.logoutText}>Sair</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Post
                  post={item}
                  onLike={() => handleLike(item.id, item.likes || [])}
                  onDelete={() => handleDelete(item.id, item.userId)}
                  currentUserId={auth.currentUser?.uid}
                  navigation={navigation}
                />
              )}
              style={styles.list}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          </ScrollView>

          <View style={styles.inputArea}>
            <TextInput
              placeholder="Escreva algo..."
              style={styles.input}
              value={postText}
              onChangeText={setPostText}
            />
            <TouchableOpacity onPress={createPost} style={styles.sendBtn}>
              <Text style={styles.sendText}>Postar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#e3f2fd',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 15,
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
  list: {
    flex: 1,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    height: 40,
  },
  sendBtn: {
    backgroundColor: '#0d47a1',
    padding: 10,
    borderRadius: 8,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});