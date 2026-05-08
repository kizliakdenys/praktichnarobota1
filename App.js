import React, { useState, createContext, useContext } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, FlatList, Image, 
  StatusBar, SafeAreaView, Modal, TextInput, Alert, ScrollView, ActivityIndicator 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import * as Calendar from 'expo-calendar';
import * as ImagePicker from 'expo-image-picker';

const queryClient = new QueryClient();
const AuthContext = createContext();

// --- ЕКРАНИ ---

const LoginScreen = () => {
  const [email, setEmail] = useState('eve.holt@reqres.in'); 
  const [password, setPassword] = useState('cityslicka');
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Спроба входу через реальний API
      const response = await axios.post('https://reqres.in/api/login', { 
        email: email.trim(), 
        password: password.trim() 
      });
      
      if (response.data.token) {
        signIn({ email, token: response.data.token });
      }
    } catch (error) {
      console.log("API Error:", error);
      
      // ЗАПАСНИЙ ВАРІАНТ: якщо API лежить або помилка, 
      // але пароль "123" або "cityslicka" — пускаємо локально
      if (password === 'cityslicka' || password === '123') {
        Alert.alert("API Offline", "Увійшли через локальний режим (запасний)");
        signIn({ email, token: 'local-fake-token' });
      } else {
        Alert.alert("Помилка", "Невірні дані або немає інтернету");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.authTitle}>QuizApp API Login</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none" 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword} 
      />
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: loading ? '#ccc' : '#007AFF' }]} 
        onPress={handleLogin} 
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addButtonText}>Увійти через API</Text>}
      </TouchableOpacity>
      <Text style={{ textAlign: 'center', marginTop: 15, color: '#888' }}>
        Пароль для входу: cityslicka або 123
      </Text>
    </View>
  );
};

const PostsScreen = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await axios.get('https://jsonplaceholder.typicode.com/posts?_limit=10');
      return res.data;
    }
  });

  if (isLoading) return <ActivityIndicator style={styles.centerText} size="large" />;
  if (error) return <Text style={styles.centerText}>Помилка завантаження даних</Text>;

  return (
    <View style={styles.content}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.lightTextSub}>{item.body}</Text>
          </View>
        )}
      />
    </View>
  );
};

const ListScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);

  const items = [
    { id: '1', title: 'React Native Експерт', details: 'Поглиблений курс по API та нативним модулям. Натисніть "Детальніше", щоб додати подію в календар або прикріпити фото.' }
  ];

  return (
    <View style={styles.content}>
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => { setSelected(item); setModalVisible(true); }}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.lightTextSub}>Натисніть для перегляду деталей</Text>
          </TouchableOpacity>
        )}
      />
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selected?.title}</Text>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => { setModalVisible(false); navigation.navigate('Details', { item: selected }); }}
            >
              <Text style={styles.addButtonText}>Детальніше</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{marginTop: 15}}><Text style={{color: '#007AFF'}}>Закрити</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const DetailsScreen = ({ route }) => {
  const { item } = route.params;
  const [image, setImage] = useState(null);

  const addToCalendar = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(c => c.allowsModifications) || calendars[0];
      
      try {
        await Calendar.createEventAsync(defaultCalendar.id, {
          title: `Квіз: ${item.title}`,
          startDate: new Date(),
          endDate: new Date(Date.now() + 3600000),
          timeZone: 'GMT+3',
        });
        Alert.alert("Успіх", "Подію додано!");
      } catch (e) {
        Alert.alert("Помилка", "Не вдалося додати подію.");
      }
    } else {
      Alert.alert("Доступ заборонено", "Надайте дозвіл календарю в налаштуваннях.");
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  return (
    <ScrollView contentContainerStyle={styles.settingsScreen}>
      <Text style={styles.settingsTitle}>{item.title}</Text>
      <Text style={styles.modalDetails}>{item.details}</Text>
      
      <TouchableOpacity style={[styles.addButton, {backgroundColor: '#34C759', width: '100%'}]} onPress={addToCalendar}>
        <Text style={styles.addButtonText}>📅 Нагадати в календарі</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.addButton, {marginTop: 10, backgroundColor: '#5856D6', width: '100%'}]} onPress={pickImage}>
        <Text style={styles.addButtonText}>🖼️ Прикріпити зображення</Text>
      </TouchableOpacity>

      {image && (
        <View style={{alignItems: 'center'}}>
          <Image source={{ uri: image }} style={styles.selectedImage} />
          <TouchableOpacity onPress={() => setImage(null)}><Text style={{color: 'red', marginTop: 10}}>Видалити фото</Text></TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

// --- НАВІГАЦІЯ ТА КОНТЕКСТ ---

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
    <Tab.Screen name="Квізи" component={ListScreen} />
    <Tab.Screen name="API Пости" component={PostsScreen} />
    <Tab.Screen name="Профіль" component={SettingsScreen} />
  </Tab.Navigator>
);

const SettingsScreen = () => {
  const { user, signOut } = useContext(AuthContext);
  return (
    <View style={styles.center}>
      <Text style={{fontSize: 18}}>Ви увійшли як:</Text>
      <Text style={{fontWeight: 'bold', marginBottom: 20}}>{user?.email}</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={signOut}>
        <Text style={{color:'#fff', fontWeight: 'bold'}}>Вийти з акаунту</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, signIn: (u) => setUser(u), signOut: () => setUser(null) }}>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          <Stack.Navigator>
            {user == null ? (
              <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
            ) : (
              <>
                <Stack.Screen name="Home" component={MainTabs} options={{headerShown: false}} />
                <Stack.Screen name="Details" component={DetailsScreen} options={{title: 'Деталі ресурсу'}} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

// --- СТИЛІ ---
const styles = StyleSheet.create({
  authContainer: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#f0f8ff' },
  authTitle: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#007AFF' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, marginBottom: 15, backgroundColor: '#fff' },
  addButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center', minWidth: 150 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  content: { flex: 1, padding: 15, backgroundColor: '#f9f9f9' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  lightTextSub: { color: '#666', lineHeight: 20 },
  centerText: { textAlign: 'center', marginTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  settingsScreen: { padding: 20, alignItems: 'center', backgroundColor: '#fff', flexGrow: 1 },
  settingsTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalDetails: { textAlign: 'center', marginBottom: 25, color: '#444', fontSize: 16, lineHeight: 24 },
  selectedImage: { width: 300, height: 300, borderRadius: 15, marginTop: 20 },
  deleteButton: { backgroundColor: '#FF3B30', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 10 }
});