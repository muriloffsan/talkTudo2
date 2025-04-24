//Murilo Ferreira Faria Santana e Pedro Zocatelli
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, Alert // Adicionado Alert
} from 'react-native';
import { db, auth } from '../../../firebase';
import {
  collection, addDoc, onSnapshot, orderBy, query, doc, getDoc, deleteDoc // Adicionado deleteDoc
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

export default function Post({ post, onLike }) {
  const { userName, content, createdAt, likes, id: postId, userId } = post;
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const currentUser = auth.currentUser; 

  useEffect(() => {
    let unsubscribe = () => {}; 
    if (showComments && postId) { 
      const commentsCollectionRef = collection(db, 'posts', postId, 'comments');
      const q = query(commentsCollectionRef, orderBy('createdAt', 'asc'));

      unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setComments(data);
      }, (error) => {
        console.error("Erro ao buscar comentários: ", error);

      });
    } else {
      setComments([]); 
    }

    return () => unsubscribe();
  }, [showComments, postId]); 

  const sendComment = async () => {
    if (!commentText.trim() || !currentUser) {
      if (!currentUser) {
        Alert.alert("Erro", "Você precisa estar logado para comentar.");
      }
      return;
    }

    let commenterName = 'Usuário'; // Nome padrão
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      commenterName = userDoc.exists() ? userDoc.data().nome : 'Usuário';
    } catch (error) {
      console.error("Erro ao buscar nome do usuário:", error);
      // Continua com o nome padrão mesmo se houver erro
    }

    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        userId: currentUser.uid,
        userName: commenterName,
        text: commentText.trim(),
        createdAt: new Date() // Considere usar serverTimestamp()
      });
      setCommentText('');
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      Alert.alert("Erro", "Não foi possível enviar o comentário.");
    }
  };

  // Função para deletar o post
  const handleDeletePost = async () => {
    // Confirmação antes de excluir
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'posts', postId));
              // Opcional: Adicionar feedback visual ou navegação após deletar
            } catch (error) {
              console.error("Erro ao deletar post:", error);
              Alert.alert("Erro", "Não foi possível excluir o post.");
            }
          }
        }
      ]
    );
  };

  // Função para deletar um comentário
  const handleDeleteComment = async (commentId) => {

     Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este comentário?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
            } catch (error) {
              console.error("Erro ao deletar comentário:", error);
              Alert.alert("Erro", "Não foi possível excluir o comentário.");
            }
          }
        }
      ]
    );
  };
  const renderCommentItem = ({ item }) => (
    <View style={styles.comment}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentName}>{item.userName || 'Usuário'}</Text>
        {currentUser?.uid === item.userId && (
          <TouchableOpacity onPress={() => handleDeleteComment(item.id)} style={styles.deleteCommentButton}>
            <Text style={styles.deleteText}>🗑</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.commentText}>{item.text}</Text>
      {/* Opcional: Adicionar data do comentário */}
      {item.createdAt?.toDate && (
         <Text style={styles.commentDate}>
           {formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true })}
         </Text>
      )}
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.userName}>{userName || 'Usuário'}</Text>
        {/* Botão de excluir post (condicional) */}
        {currentUser?.uid === userId && (
          <TouchableOpacity onPress={handleDeletePost} style={styles.deletePostButton}>
            <Text style={styles.deleteText}>🗑 Excluir</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.content}>{content}</Text>
      <Text style={styles.timestamp}>
        {createdAt?.toDate ? formatDistanceToNow(createdAt.toDate(), { addSuffix: true }) : 'Agora mesmo'}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Text style={styles.likeText}>❤️ {likes?.length || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => setShowComments(!showComments)}>
          <Text style={styles.commentToggle}>
            {showComments ? '🔽 Esconder' : '💬 Comentários'} ({comments.length})
          </Text>
        </TouchableOpacity>
      </View>


      {showComments && (
        <View style={styles.commentsArea}>
          <FlatList
            data={comments}
            keyExtractor={item => item.id}
            renderItem={renderCommentItem} // Usando a função separada
            ListEmptyComponent={<Text style={styles.noCommentsText}>Nenhum comentário ainda.</Text>} // Mensagem se não houver comentários
          />
          <View style={styles.commentInputArea}>
            <TextInput
              placeholder="Escreva um comentário..."
              value={commentText}
              onChangeText={setCommentText}
              style={styles.input}
              placeholderTextColor="#888" // Cor mais suave
              multiline
            />
            <TouchableOpacity onPress={sendComment} disabled={!commentText.trim()} style={styles.sendButton}>
              <Text style={styles.sendBtnText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: 10, // Reduzido margin
    padding: 15,
    borderRadius: 8, // Bordas levemente menos arredondadas
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1, // Sombra mais sutil
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontWeight: 'bold',
    color: '#1c1e21', // Cor mais escura para nome
    fontSize: 15,
  },
  deletePostButton: {
    padding: 5, // Área de toque maior
  },
  deleteText: {
    color: '#e74c3c', // Vermelho para exclusão
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1c1e21',
    marginBottom: 8, // Espaço antes do timestamp
  },
  timestamp: {
    fontSize: 12,
    color: '#606770', // Cinza padrão do FB
    marginBottom: 10, // Espaço antes das ações
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribui os botões
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  likeText: {
    color: '#e74c3c', // Vermelho para like
    fontWeight: '500',
    fontSize: 14,
  },
  commentToggle: {
    color: '#1877F2', // Azul para comentários
    fontWeight: '500',
    fontSize: 14,
  },
  commentsArea: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10
  },
  comment: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f2f5', // Fundo padrão FB
    borderRadius: 8
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentName: {
    fontWeight: 'bold',
    color: '#050505', // Preto suave
    fontSize: 14,
  },
  deleteCommentButton: {
    paddingLeft: 10, // Espaço para clicar
    paddingVertical: 5,
  },
  commentText: {
    fontSize: 15,
    color: '#1c1e21',
    lineHeight: 19,
  },
  commentDate: {
    fontSize: 11,
    color: '#606770',
    marginTop: 4,
    textAlign: 'right',
  },
  noCommentsText: {
    textAlign: 'center',
    color: '#606770',
    marginTop: 10,
    marginBottom: 10,
  },
  commentInputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ccd0d5',
    marginRight: 8,
    fontSize: 15,
    maxHeight: 100, 
  },
  sendButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    backgroundColor: '#1877F2',
    borderRadius: 18,
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  }
});
