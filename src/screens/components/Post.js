//Murilo Ferreira Faria Santana e Pedro Zocatelli
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatDistanceToNow } from 'date-fns';

export default function Post({ post, onLike }) {
  const { content, createdAt, likes } = post;

  return (
    <View style={styles.card}>
      <Text style={styles.content}>{content}</Text>
      <Text style={styles.timestamp}>
        {createdAt ? formatDistanceToNow(createdAt.toDate(), { addSuffix: true }) : 'Agora mesmo'}
      </Text>
      <TouchableOpacity style={styles.likeButton} onPress={onLike}>
        <Text style={styles.likeText}>❤️ {likes?.length || 0}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 3
  },
  content: {
    fontSize: 16,
    color: '#333'
  },
  timestamp: {
    marginTop: 5,
    color: 'gray',
    fontSize: 12
  },
  likeButton: {
    marginTop: 10,
    alignSelf: 'flex-start'
  },
  likeText: {
    color: '#e74c3c',
    fontWeight: 'bold'
  }
});
