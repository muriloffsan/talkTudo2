import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
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

  const logout = () => {
    auth.signOut();
    navigation.replace('Login');
  };

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(data);
      },
      (error) => {
        console.error('Erro ao buscar posts: ', error);
        Alert.alert('Erro', 'Não foi possível carregar os posts.');
      }
    );
    return unsubscribe;
  }, []);

  const createPost = async () => {
    if (!postText.trim()) {
      Alert.alert('Atenção', 'Escreva algo para postar!');
      return;
    }

    if (!auth.currentUser) {
      Alert.alert('Erro', 'Você precisa estar logado para postar.');
      return;
    }

    const uid = auth.currentUser.uid;
    let nome = 'Usuário Anônimo';

    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        nome = userDocSnap.data()?.nome || nome;
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }

    try {
      await addDoc(collection(db, 'posts'), {
        userId: uid,
        userName: nome,
        content: postText,
        likes: [],
        createdAt: new Date(),
      });
      setPostText('');
    } catch (error) {
      console.error('Erro ao criar post:', error);
      Alert.alert('Erro', 'Não foi possível criar o post. Tente novamente.');
    }
  };

  const handleLike = async (postId, currentLikes) => {
    if (!auth.currentUser) {
      Alert.alert('Erro', 'Você precisa estar logado para curtir.');
      return;
    }

    const postRef = doc(db, 'posts', postId);
    const userId = auth.currentUser.uid;
    const likesArray = Array.isArray(currentLikes) ? currentLikes : [];

    if (!likesArray.includes(userId)) {
      try {
        await updateDoc(postRef, {
          likes: arrayUnion(userId),
        });
      } catch (error) {
        console.error('Erro ao curtir post:', error);
        Alert.alert('Erro', 'Não foi possível curtir o post.');
      }
    } else {
      console.log('Usuário já curtiu este post.');
    }
  };

  const handleDelete = async (postId, postUserId) => {
    if (!auth.currentUser) {
      Alert.alert('Erro', 'Você precisa estar logado para deletar posts.');
      return;
    }

    if (auth.currentUser.uid !== postUserId) {
      Alert.alert('Permissão Negada', 'Você só pode deletar seus próprios posts.');
      return;
    }

    Alert.alert('Confirmar Exclusão', 'Tem certeza que deseja deletar este post?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Deletar',
        onPress: async () => {
          try {
            const postRef = doc(db, 'posts', postId);
            await deleteDoc(postRef);
          } catch (error) {
            console.error('Erro ao deletar post:', error);
            Alert.alert('Erro', 'Não foi possível deletar o post.');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={80}>
      <Text style={styles.title}>Bem-vindo ao Talk Tudo 👋</Text>
      <Text style={styles.subtitle}>Usuário: {user?.email}</Text>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>

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
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={<Text style={styles.emptyListText}>Nenhum post ainda. Seja o primeiro!</Text>}
      />

      <View style={styles.inputArea}>
        <TextInput
          placeholder="O que você está pensando?"
          value={postText}
          onChangeText={setPostText}
          style={styles.input}
          placeholderTextColor="#888"
        />
        <TouchableOpacity onPress={createPost} style={styles.button}>
          <Text style={styles.buttonText}>Postar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0d47a1',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#1e88e5',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#0d47a1',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
  },
});
