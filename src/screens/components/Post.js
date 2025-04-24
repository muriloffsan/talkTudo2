//Murilo Ferreira Faria Santana e Pedro Zocatelli
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Post({ post, onLike }) {
  const formatDate = (date) => {
    if (!date) return '';
    return date.toDate ? date.toDate().toLocaleDateString() : 'Data inválida';
  };
  

  return (
    <View style={styles.postContainer}>
      <Text style={styles.userName}>{post.userName || 'Usuário'}</Text>

      <Text style={styles.content}>{post.content}</Text>

      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
        <TouchableOpacity onPress={onLike} style={styles.likeButton}>
          <Text style={styles.likeText}>Like ({post.likes?.length || 0})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000", 
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 15, 
    color: '#333', 
    marginBottom: 8, 
  },
  content: {
    fontSize: 16,
    lineHeight: 22, 
    color: '#1c1e21', 
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1, 
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  date: {
    fontSize: 12,
    color: '#606770', 
  },
  likeButton: {
   
  },
  likeText: {
    color: '#1877F2', 
    fontSize: 14,
    fontWeight: '500',
  }
});
