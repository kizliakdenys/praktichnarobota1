import React, { useState, createContext, useContext } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, FlatList, Image, 
  Switch, StatusBar, SafeAreaView, Modal, TextInput, Alert 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// --- КОНТЕКСТ ТА ДАНІ ---

const AuthContext = createContext();

const USERS = [
  { id: '1', username: 'admin', password: '123', name: 'Олександр (Admin)' },
  { id: '2', username: 'user', password: 'password', name: 'Іван Користувач' }
];

const INITIAL_DATA = Array.from({ length: 5 }, (_, i) => ({
  id: Date.now().toString() + i,
  title: `Командний квіз №${i + 1}`,
  description: 'Натисніть, щоб розпочати тестування',
  details: 'Детальна інформація про правила квізу та час проходження.',
  image: `https://picsum.photos/200?random=${i}`, 
}));

// --- ЕКРАНИ ---

// 3. Екран авторизації (Пункт 3)
const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useContext(AuthContext);

  const handleLogin = () => {
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) {
      signIn(user);
    } else {
      Alert.alert("Помилка", "Невірний логін або пароль");
    }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.authTitle}>Вхід у QuizApp</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Логін (admin)" 
        value={username}
        onChangeText={setUsername}
      />
      <TextInput 
        style={styles.input} 
        placeholder="Пароль (123)" 
        secureTextEntry 
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleLogin}>
        <Text style={styles.addButtonText}>Увійти</Text>
      </TouchableOpacity>
    </View>
  );
};

// Екран списку (Екран 1)
const ListScreen = () => {
  const [quizzes, setQuizzes] = useState(INITIAL_DATA);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const deleteItem = (id) => {
    setQuizzes(quizzes.filter(item => item.id !== id));
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.content}>
      <FlatList
        data={quizzes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => { setSelectedItem(item); setModalVisible(true); }}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.lightTextSub}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                <Text style={styles.modalDetails}>{selectedItem.details}</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                    <Text style={{color: '#fff'}}>Закрити</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => deleteItem(selectedItem.id)}>
                    <Text style={{color: '#fff'}}>Видалити</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Екран додавання (Екран 3)
const AddScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  return (
    <View style={styles.settingsScreen}>
      <Text style={styles.settingsTitle}>Новий елемент</Text>
      <TextInput style={styles.input} placeholder="Назва" value={title} onChangeText={setTitle} />
      <TouchableOpacity style={styles.addButton} onPress={() => { Alert.alert("Успіх", "Додано!"); navigation.navigate('Список'); }}>
        <Text style={styles.addButtonText}>Зберегти</Text>
      </TouchableOpacity>
    </View>
  );
};

// Екран налаштувань (Пункт 6)
const SettingsScreen = () => {
  const { user, signOut } = useContext(AuthContext);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <View style={styles.settingsScreen}>
      <Text style={styles.settingsTitle}>Налаштування</Text>
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Користувач: {user?.name}</Text>
      </View>
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Нічний режим</Text>
        <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
      </View>
      <TouchableOpacity style={[styles.deleteButton, {marginTop: 20}]} onPress={signOut}>
        <Text style={{color: '#fff', fontWeight: 'bold'}}>Вийти з акаунту</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- НАВІГАТОРИ ---

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 4. Tab Navigator після авторизації
const MainTabs = () => (
  <Tab.Navigator screenOptions={{ 
    tabBarActiveTintColor: '#007AFF',
    headerStyle: { backgroundColor: '#fff' },
  }}>
    <Tab.Screen name="Список" component={ListScreen} options={{ tabBarLabel: '📚 Тести' }} />
    <Tab.Screen name="Додати" component={AddScreen} options={{ tabBarLabel: '➕ Створити' }} />
    <Tab.Screen name="Профіль" component={SettingsScreen} options={{ tabBarLabel: '⚙️ Налаштування' }} />
  </Tab.Navigator>
);

export default function App() {
  const [user, setUser] = useState(null);

  const authContext = {
    user,
    signIn: (userData) => setUser(userData),
    signOut: () => setUser(null),
  };

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user == null ? (
            // 3. Екран авторизації першим
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            // 4. Основна навігація після входу
            <Stack.Screen name="Home" component={MainTabs} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

// --- СТИЛІ ---

const styles = StyleSheet.create({
  authContainer: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#ecf7ff' },
  authTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#007AFF' },
  content: { flex: 1, paddingHorizontal: 15 },
  card: { flexDirection: 'row', marginVertical: 8, borderRadius: 15, padding: 12, alignItems: 'center', backgroundColor: '#fff', elevation: 3 },
  cardImage: { width: 60, height: 60, borderRadius: 10 },
  cardContent: { marginLeft: 15, flex: 1 },
  cardTitle: { fontWeight: '700', fontSize: 16 },
  lightTextSub: { color: '#666' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 15, backgroundColor: '#fff' },
  addButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  settingsScreen: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  settingsTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 },
  settingLabel: { fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  modalDetails: { textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 15 },
  closeButton: { backgroundColor: '#888', padding: 12, borderRadius: 10 },
  deleteButton: { backgroundColor: '#ff3b30', padding: 12, borderRadius: 10, alignItems: 'center' },
});