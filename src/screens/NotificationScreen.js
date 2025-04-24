// Murilo Ferreira Faria Santana e Pedro Zocatelli
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../../firebase';
import {
  collection, onSnapshot, query, orderBy, addDoc, serverTimestamp
} from 'firebase/firestore';
async function sendNotification(userId, type, referenceId, senderName) {
  if (!userId || userId === auth.currentUser?.uid) return;
  const ref = collection(db, 'notifications', userId, 'items');
  try {
    await addDoc(ref, {
      type,
      referenceId,
      senderName,
      createdAt: serverTimestamp(),
      seen: false
    });
    console.log('Notificação enviada para:', userId); // Feedback ao enviar
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
  }
}

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) {
      console.warn('UID não encontrado!');
      setLoading(false); // Importante setar loading para false em caso de erro
      return;
    }

    console.log('UID atual:', uid);

    const q = query(
      collection(db, 'notifications', uid, 'items'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Notificações recebidas:', data); // DEBUG
      setNotifications(data);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar notificações:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [uid]);

  const renderItem = ({ item }) => (
    <View style={styles.notification}>
      <Text style={styles.message}>
        🔔 {item.senderName || 'Alguém'} {getNotificationText(item.type)}
      </Text>
      <Text style={styles.time}>
        {item.createdAt?.toDate?.().toLocaleString() || 'Agora mesmo'}
      </Text>
    </View>
  );

  const getNotificationText = (type) => {
    switch (type) {
      case 'like': return 'curtiu seu post.';
      case 'comment': return 'comentou em seu post.';
      case 'message': return 'enviou uma mensagem.';
      default: return 'fez uma ação.';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔔 Notificações</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1877F2" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Você ainda não possui notificações.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    backgroundColor: '#e3e3e3',
    borderRadius: 6
  },
  backButtonText: {
    color: '#1877F2',
    fontWeight: 'bold'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1e21'
  },
  notification: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    margin: 10
  },
  message: {
    fontSize: 16,
    color: '#333'
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginTop: 4
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    marginTop: 30
  }
});

export { sendNotification };