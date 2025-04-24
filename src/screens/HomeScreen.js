// Murilo Ferreira Faria Santana e Pedro Zocatelli
import React, { useEffect, useState } from 'react';
import {
  View, FlatList, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../../firebase';
import {
  collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, arrayUnion, getDoc, deleteDoc // Importar deleteDoc
} from 'firebase/firestore';
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
        userId: uid, // Certifique-se de que o userId está sendo salvo
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
      // Opcional: Implementar descurtir (remover userId do array)
      console.log("Usuário já curtiu este post.");
      // Exemplo de como descurtir (precisa importar arrayRemove):
      // await updateDoc(postRef, { likes: arrayRemove(userId) });
    }
  };

  // --- INÍCIO: Nova função para deletar post ---
  const handleDelete = async (postId, postUserId) => {
    if (!auth.currentUser) {
      Alert.alert("Erro", "Você precisa estar logado para deletar posts.");
      return;
    }

    // Verifica se o usuário logado é o autor do post
    if (auth.currentUser.uid !== postUserId) {
      Alert.alert("Permissão Negada", "Você só pode deletar seus próprios posts.");
      return;
    }

    // Confirmação antes de deletar
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Deletar",
          onPress: async () => {
            try {
              const postRef = doc(db, 'posts', postId);
              await deleteDoc(postRef);
              // O post será removido automaticamente da lista devido ao onSnapshot
              // Alert.alert("Sucesso", "Post deletado."); // Opcional: feedback visual
            } catch (error) {
              console.error("Erro ao deletar post:", error);
              Alert.alert("Erro", "Não foi possível deletar o post.");
            }
          },
          style: "destructive"
        }
      ]
    );
  };
  // --- FIM: Nova função para deletar post ---

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={80}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Post
            post={item}
            onLike={() => handleLike(item.id, item.likes || [])}
            // --- INÍCIO: Passar a função handleDelete e o userId do post ---
            onDelete={() => handleDelete(item.id, item.userId)}
            currentUserId={auth.currentUser?.uid} // Passa o ID do usuário logado para o Post
            // --- FIM: Passar a função handleDelete e o userId do post ---
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
