// ProfileScreen.js
// Murilo Ferreira Faria Santana e Pedro Zocatelli
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Button, // Pode ser substituído por TouchableOpacity para mais estilo
  FlatList,
  StyleSheet,
  Alert,
  ScrollView, // Import ScrollView
  TouchableOpacity, // Import TouchableOpacity
  ActivityIndicator, // Import ActivityIndicator
  SafeAreaView // Import SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { auth, db } from '../../firebase';
import {
  doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy // Adicionado orderBy
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns'; // Para formatar data dos posts
import { ptBR } from 'date-fns/locale';

export default function ProfileScreen() {
  const [nome, setNome] = useState('');
  const [bio, setBio] = useState('');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Estado de carregamento
  const [isSaving, setIsSaving] = useState(false); // Estado para salvar
  const navigation = useNavigation(); // Hook de navegação
  const uid = auth.currentUser?.uid;

  // Função para carregar dados, usando useCallback para otimização
  const carregarDados = useCallback(async () => {
    if (!uid) {
        setIsLoading(false);
        Alert.alert("Erro", "Usuário não encontrado.");
        navigation.goBack(); // Volta se não houver UID
        return;
    }
    setIsLoading(true);
    try {
      // Carregar dados do usuário
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setNome(data.nome || '');
        setBio(data.bio || '');
      } else {
        console.warn("Documento do usuário não encontrado:", uid);
        // Pode definir valores padrão ou tratar o caso
      }

      // Carregar posts do usuário, ordenados pelos mais recentes
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc') // Ordena os posts
      );
      const postsSnap = await getDocs(postsQuery);
      const meusPosts = postsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(meusPosts);

    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      Alert.alert("Erro", "Não foi possível carregar os dados do perfil.");
    } finally {
      setIsLoading(false); // Finaliza o carregamento
    }
  }, [uid, navigation]); // Dependências do useCallback

  useEffect(() => {
    carregarDados();
  }, [carregarDados]); // Executa ao montar e quando carregarDados mudar

  const salvarAlteracoes = async () => {
    if (!uid) return;
    if (!nome.trim()) {
        Alert.alert("Atenção", "O nome não pode ficar em branco.");
        return;
    }

    setIsSaving(true); // Inicia o estado de salvar
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        nome: nome.trim(),
        bio: bio.trim() // Permite bio vazia, mas remove espaços extras
      });
      Alert.alert("Sucesso", "Dados atualizados com sucesso!");
      // Opcional: Atualizar nome em posts antigos? (Complexo, geralmente não feito)
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      Alert.alert("Erro", "Não foi possível atualizar seu perfil.");
    } finally {
        setIsSaving(false); // Finaliza o estado de salvar
    }
  };

  // Renderiza cada item da lista de posts
  const renderPostItem = ({ item }) => (
    <View style={styles.postItem}>
      <Text style={styles.postText}>{item.content}</Text>
      {item.createdAt?.toDate && (
        <Text style={styles.postDate}>
          {formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true, locale: ptBR })}
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1877F2" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Botão Voltar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'< Voltar'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Seu Perfil</Text>
        {/* Espaço reservado para alinhar o título ou adicionar outro botão */}
        <View style={{ width: 50 }} />
      </View>

      {/* ScrollView para o conteúdo editável */}
      <ScrollView
         contentContainerStyle={styles.scrollContainer}
         keyboardShouldPersistTaps="handled" // Ajuda a fechar teclado ao tocar fora
      >
        <View style={styles.profileSection}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
                style={styles.input}
                placeholder="Como você quer ser chamado?"
                placeholderTextColor="#999"
                value={nome}
                onChangeText={setNome}
            />

            <Text style={styles.label}>Bio</Text>
            <TextInput
                style={[styles.input, styles.bioInput]} // Estilo adicional para bio
                placeholder="Fale um pouco sobre você..."
                placeholderTextColor="#999"
                value={bio}
                onChangeText={setBio}
                multiline
                maxLength={150} // Limite de caracteres para bio
            />

            {/* Botão Salvar com indicador de atividade */}
            <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={salvarAlteracoes}
                disabled={isSaving}
            >
                {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                )}
            </TouchableOpacity>
        </View>

        {/* Seção de Posts (fora do ScrollView principal ou dentro com ajustes) */}
        <View style={styles.postsSection}>
            <Text style={styles.subtitle}>Seus Posts</Text>
            <FlatList
                data={posts}
                keyExtractor={item => item.id}
                renderItem={renderPostItem}
                ListEmptyComponent={<Text style={styles.emptyText}>Você ainda não criou nenhum post.</Text>}
                // Se a FlatList estiver DENTRO do ScrollView, descomente a linha abaixo
                // nestedScrollEnabled={true}
                // Adicione um estilo para limitar a altura se estiver dentro do ScrollView
                // style={{ maxHeight: 400 }} // Exemplo
            />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Cor de fundo consistente
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Espaça os itens
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff', // Fundo branco para o header
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 5, // Área de toque
  },
  backButtonText: {
    fontSize: 16,
    color: '#1877F2', // Azul padrão
    fontWeight: '500',
  },
  title: {
    fontSize: 20, // Tamanho ajustado
    fontWeight: 'bold',
    color: '#1c1e21', // Cor escura
    textAlign: 'center', // Centraliza se não houver botões laterais iguais
  },
  scrollContainer: {
    paddingBottom: 20, // Espaço no final do scroll
  },
  profileSection: {
      backgroundColor: '#fff',
      padding: 20,
      margin: 10, // Margem em volta da seção
      borderRadius: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1.5,
      elevation: 2,
  },
  label: {
      fontSize: 14,
      color: '#606770',
      marginBottom: 5,
      fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccd0d5', // Cinza claro
    backgroundColor: '#f5f6f7', // Fundo levemente acinzentado
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    borderRadius: 6, // Bordas levemente arredondadas
    fontSize: 16,
    color: '#1c1e21',
  },
  bioInput: {
    height: 100, // Altura maior para bio
    textAlignVertical: 'top', // Alinha texto no topo em Android
  },
  saveButton: {
    backgroundColor: '#1877F2', // Azul
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#a4c6f5', // Azul claro quando desabilitado
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postsSection: {
      marginTop: 10, // Espaço acima da seção de posts
      paddingHorizontal: 10, // Padding lateral para a lista
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c1e21',
    marginBottom: 10, 
    paddingHorizontal: 10, 
  },
  postItem: {
    backgroundColor: '#fff', // Fundo branco para cada post
    padding: 15,
    borderRadius: 8,
    marginBottom: 10, // Espaço entre os posts
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1.0,
    elevation: 1,
  },
  postText: {
    fontSize: 15,
    color: '#1c1e21',
    marginBottom: 5, 
  },
  postDate: {
    fontSize: 11,
    color: '#606770',
    textAlign: 'right', 
  },
  emptyText: { 
    fontStyle: 'italic',
    color: '#606770',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  }
});
