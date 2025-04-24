// Murilo Ferreira Faria Santana e Pedro Zocatelli
import React, { useEffect, useState } from 'react';
import {
  View, FlatList, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, arrayUnion, getDoc } from 'firebase/firestore';
import Post from '../screens/components/Post'; 

export default function HomeScreen() {
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(data);
    }, (error) => {
      console.error("Erro ao buscar posts: ", error);
      Alert.alert("Erro", "Não foi possível carregar os posts.");
    });
    return unsubscribe;
  }, []);

  const createPost = async () => {
    if (!postText.trim()) {
      Alert.alert("Atenção", "Escreva algo para postar!");
      return;
    }

    if (!auth.currentUser) {
        Alert.alert("Erro", "Você precisa estar logado para postar.");
        return;
    }

    const uid = auth.currentUser.uid;
    let nome = 'Usuário Anônimo';

    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        nome = userDocSnap.data()?.nome || nome;
      } else {
        console.log("Documento do usuário não encontrado no Firestore!");
      }
    } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
    }

    try {
      await addDoc(collection(db, 'posts'), {
        userId: uid,
        userName: nome,
        content: postText,
        likes: [],
        createdAt: new Date()
      });
      setPostText('');
    } catch (error) {
      console.error("Erro ao criar post:", error);
      Alert.alert("Erro", "Não foi possível criar o post. Tente novamente.");
    }
  };

  const handleLike = async (postId, currentLikes) => {
    if (!auth.currentUser) {
        Alert.alert("Erro", "Você precisa estar logado para curtir.");
        return;
    }
    const postRef = doc(db, 'posts', postId);
    const userId = auth.currentUser.uid;

    const likesArray = Array.isArray(currentLikes) ? currentLikes : [];

    if (!likesArray.includes(userId)) {
      try {
        await updateDoc(postRef, {
          likes: arrayUnion(userId)
        });
      } catch (error) {
        console.error("Erro ao curtir post:", error);
        Alert.alert("Erro", "Não foi possível curtir o post.");
      }
    } else {
      console.log("Usuário já curtiu este post.");
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={80}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Post
            post={item}
            onLike={() => handleLike(item.id, item.likes || [])}
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

// ... (styles continuam iguais)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5'
  },
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: '#f8f8f8'
  },
  button: {
    backgroundColor: '#1877F2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666'
  }
});
