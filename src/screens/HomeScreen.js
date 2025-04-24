// Criado por Jake 👾
import React, { useEffect, useState } from 'react';
import {
  View, FlatList, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView
} from 'react-native';
import { db, auth } from '../../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import Post from '../screens/components/Post';

export default function HomeScreen() {
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(data);
    });
    return unsubscribe;
  }, []);

  const createPost = async () => {
    if (!postText.trim()) return;
    await addDoc(collection(db, 'posts'), {
      userId: auth.currentUser.uid,
      content: postText,
      likes: [],
      createdAt: new Date()
    });
    setPostText('');
  };

  const handleLike = async (postId, currentLikes) => {
    const postRef = doc(db, 'posts', postId);
    if (!currentLikes.includes(auth.currentUser.uid)) {
      await updateDoc(postRef, {
        likes: arrayUnion(auth.currentUser.uid)
      });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Post
            post={item}
            onLike={() => handleLike(item.id, item.likes || [])}
          />
        )}
        contentContainerStyle={{ padding: 15 }}
      />
      <View style={styles.inputArea}>
        <TextInput
          placeholder="O que você está pensando?"
          value={postText}
          onChangeText={setPostText}
          style={styles.input}
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
    backgroundColor: '#ecf0f1'
  },
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    marginRight: 10
  },
  button: {
    backgroundColor: '#1877F2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
