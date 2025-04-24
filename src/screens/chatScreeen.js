//Murilo Ferreira Faria Santana e Pedro Zocatelli
import React, { useState, useEffect } from 'react';
import {
  View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet
} from 'react-native';
import { db, auth } from '../../firebase';
import {
  collection, addDoc, query, onSnapshot, orderBy, serverTimestamp
} from 'firebase/firestore';

export default function ChatScreen({ route }) {
  const { conversationId, receiverId, receiverName } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const currentUser = auth.currentUser;

  useEffect(() => {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return unsubscribe;
  }, [conversationId]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
      senderId: currentUser.uid,
      text: text.trim(),
      createdAt: serverTimestamp()
    });

    setText('');

    // Notifica o outro usuário
    await addDoc(collection(db, 'notifications', receiverId, 'items'), {
      type: 'message',
      referenceId: conversationId,
      senderName: currentUser.displayName || 'Alguém',
      createdAt: serverTimestamp(),
      seen: false
    });
  };

  const renderItem = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.senderId === currentUser.uid ? styles.self : styles.other
    ]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 10 }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={styles.input}
          placeholder="Digite uma mensagem..."
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  messageBubble: {
    padding: 10, borderRadius: 6, marginVertical: 5, maxWidth: '70%'
  },
  self: { backgroundColor: '#dcf8c6', alignSelf: 'flex-end' },
  other: { backgroundColor: '#eee', alignSelf: 'flex-start' },
  messageText: { fontSize: 16 },
  inputContainer: {
    flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#ccc'
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#ccc',
    borderRadius: 20, paddingHorizontal: 15
  },
  sendButton: {
    backgroundColor: '#1877F2', marginLeft: 8,
    borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16
  },
  sendText: { color: '#fff', fontWeight: 'bold' }
});
