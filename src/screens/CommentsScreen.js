//Murilo Ferreira Faria Santana e Pedro Zocatelli
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, FlatList, StyleSheet, Alert 
} from 'react-native';
import {
  addDoc, collection, onSnapshot, query, orderBy, getDoc, doc
} from 'firebase/firestore';
import { db, auth } from '../../firebase'; 

export default function CommentsScreen({ route }) {
  const { postId } = route.params;
  const [text, setText] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const commentsData = await Promise.all(snapshot.docs.map(async (docData) => {
        const comment = { id: docData.id, ...docData.data() };
        if (!comment.userName && comment.userId) {
          try {
            const userRef = doc(db, 'users', comment.userId);
            const userSnap = await getDoc(userRef);
            comment.userName = userSnap.exists() ? userSnap.data().nome : 'Usuário';
          } catch (error) {
            console.error("Erro ao buscar nome do usuário:", error);
            comment.userName = 'Usuário'; // Fallback
          }
        }
        return comment;
      }));
      setComments(commentsData);
    });

    return unsubscribe;
  }, [postId]);

  // Função sendComment atualizada
  const sendComment = async () => {
    if (!text.trim()) return;

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Erro", "Você precisa estar logado para comentar.");
      return;
    }

    let userName = 'Usuário';
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        userName = userSnap.data().nome || 'Usuário';
      }
    } catch (error) {
      console.error("Erro ao buscar nome do usuário para novo comentário:", error);
    }


    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        userId: uid,
        userName,
        text: text.trim(), 
        createdAt: new Date() 
      });
      setText('');
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      Alert.alert("Erro", "Não foi possível enviar o comentário.");
    }
  };

  const renderCommentItem = ({ item }) => (
    <View style={styles.commentBox}>
      <Text style={styles.name}>{item.userName || 'Usuário'}</Text>
      <Text style={styles.text}>{item.text}</Text>
      {item.createdAt?.toDate && (
         <Text style={styles.date}>
           {item.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {item.createdAt.toDate().toLocaleDateString()}
         </Text>
      )}
    </View>
  );


  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={item => item.id}
        renderItem={renderCommentItem}
        contentContainerStyle={styles.listContent} 
      />

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Escreva um comentário..."
          placeholderTextColor="#999"
          value={text}
          onChangeText={setText}
          multiline 
        />
        <Button title="Enviar" onPress={sendComment} disabled={!text.trim()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', 
  },
  listContent: {
    padding: 15,
  },
  commentBox: {
    marginBottom: 12,
    backgroundColor: '#f0f2f5', 
    borderRadius: 10,
    padding: 12, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  name: {
    fontWeight: 'bold',
    color: '#050505', 
    marginBottom: 4
  },
  text: {
    color: '#1c1e21', 
    fontSize: 15, 
    lineHeight: 20, 
  },
   date: {
    fontSize: 11,
    color: '#606770',
    marginTop: 5,
    textAlign: 'right', 
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10, 
    borderTopWidth: 1, 
    borderTopColor: '#ddd',
    backgroundColor: '#fff', 
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccd0d5', 
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 12,
    paddingVertical: 8, 
    borderRadius: 18, 
    marginRight: 8,
    fontSize: 15,
  }
});
