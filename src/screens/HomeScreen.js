// HomeScreen.js
// Murilo Ferreira Faria Santana e Pedro Zocatelli
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
  Platform,
  SafeAreaView, // Mantenha SafeAreaView
  ActivityIndicator,
  Keyboard // Import Keyboard
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
  arrayRemove,
  getDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import Post from '../screens/components/Post'; // Verifique o caminho

export default function HomeScreen() {
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  const currentUser = auth.currentUser;

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
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

  const createPost = async () => {
    if (!postText.trim()) {
      Alert.alert("Atenção", "Escreva algo para postar!");
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
      } else {
        console.warn("Documento do usuário não encontrado:", uid);
      }
    } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
    }

    try {
      await addDoc(collection(db, 'posts'), {
        userId: uid,
        userName: nome,
        content: postText.trim(),
        likes: [],
        createdAt: serverTimestamp()
      });
      setPostText('');
      Keyboard.dismiss(); // Fecha o teclado após postar
    } catch (error) {
      console.error("Erro ao criar post:", error);
      Alert.alert("Erro", "Não foi possível criar o post. Tente novamente.");
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

  // A função handleDelete pode permanecer no Post.js se preferir
  // ou ser passada como prop se necessário controle aqui.

  return (
    // SafeAreaView garante que o conteúdo não fique sob notches ou barras de status
    <SafeAreaView style={styles.safeArea}>
        {/* KeyboardAvoidingView ajusta a tela quando o teclado aparece */}
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            // O offset pode precisar de ajuste dependendo do header, se houver
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
            {/* Botão de Perfil movido para dentro do container principal */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                    <Text style={styles.profileButtonText}>
                        👤 Meu Perfil
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Conteúdo principal (Lista ou Loading) */}
            <View style={styles.contentArea}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#1877F2" style={styles.loadingIndicator} />
                ) : (
                    <FlatList
                        data={posts}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <Post
                                post={item}
                                onLike={() => handleLike(item.id, item.likes)}
                                // onDelete é tratado dentro do Post.js
                                navigation={navigation} // Passa navigation se Post precisar
                            />
                        )}
                        contentContainerStyle={styles.listContentContainer}
                        ListEmptyComponent={<Text style={styles.emptyListText}>Nenhum post ainda. Seja o primeiro!</Text>}
                        // Inverter a lista pode ser uma opção se quiser o input no topo
                        // inverted
                    />
                )}
            </View>

            {/* Área de Input fixa na parte inferior */}
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
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Cor de fundo geral
  },
  container: {
    flex: 1, // Ocupa todo o espaço da SafeAreaView
    // backgroundColor: '#f0f2f5', // Cor de fundo já está na safeArea
  },
  header: {
    paddingHorizontal: 15,
    paddingTop: 10, // Espaçamento superior
    paddingBottom: 5, // Espaçamento inferior
    // backgroundColor: '#fff', // Se quiser um fundo branco para o header
    // borderBottomWidth: 1,
    // borderBottomColor: '#ddd',
  },
  profileButtonText: {
    textAlign: 'right',
    color: '#1877F2',
    fontSize: 16,
    fontWeight: '500',
  },
  contentArea: {
      flex: 1, // Faz a lista ocupar o espaço disponível entre header e input
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10, // Reduzido para dar espaço ao input
  },
  // Renomeado de inputArea para inputContainer para clareza
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff', // Fundo branco para destacar a área de input
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8, // Ajuste para padding vertical
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f8f8f8',
    fontSize: 16,
    maxHeight: 100,
  },
  button: {
    backgroundColor: '#1877F2',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a4c6f5',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  }
});
