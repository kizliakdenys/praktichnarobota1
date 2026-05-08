import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, FlatList, Image, 
  StatusBar, SafeAreaView, Modal, TextInput, Alert, ScrollView, Switch, ActivityIndicator 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Calendar from 'expo-calendar';
import * as ImagePicker from 'expo-image-picker';

// --- 1. ГЛОБАЛЬНИЙ МЕНЕДЖЕР СТАНУ (Zustand + AsyncStorage) ---
const useStore = create(
  persist(
    (set) => ({
      user: null,
      isDarkMode: false,
      isSessionOnly: false,
      items: [
        { id: '1', title: 'React Native API', details: 'Вивчення запитів та нативних модулів.' },
        { id: '2', title: 'Zustand State', details: 'Глобальне управління даними.' },
      ],
      setUser: (user) => set({ user }),
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setSessionMode: (val) => set({ isSessionOnly: val }),
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
    }),
    {
      name: 'quiz-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Реалізація пункту 4: якщо ввімкнено "Лише сесія", поле items не зберігається в пам'ять пристрою
      partialize: (state) => {
        if (state.isSessionOnly) {
          const { items, ...rest } = state; 
          return rest; 
        }
        return state;
      },
    }
  )
);

const queryClient = new QueryClient();

// --- 2. КОМПОНЕНТИ ТА ЕКРАНИ ---

// Екран Логіну (Пункт 2a - Auth)
const LoginScreen = () => {
  const [email, setEmail] = useState('eve.holt@reqres.in');
  const [pass, setPass] = useState('cityslicka');
  const [loading, setLoading] = useState(false);
  const setUser = useStore((state) => state.setUser);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post('https://reqres.in/api/login', { email, password: pass });
      setUser({ email, token: res.data.token });
    } catch (e) {
      if (pass === '123' || pass === 'cityslicka') {
        setUser({ email, token: 'offline-token' });
      } else {
        Alert.alert("Помилка", "Невірні дані. Спробуйте пароль 123");
      }
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.authTitle}>QuizApp System</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" placeholder="Email" />
      <TextInput style={styles.input} value={pass} onChangeText={setPass} secureTextEntry placeholder="Password" />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Увійти через API</Text>}
      </TouchableOpacity>
    </View>
  );
};

// Екран Списку (Пункт 2c - Управління списком)
const ListScreen = ({ navigation }) => {
  const { items, removeItem, isDarkMode, addItem } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const addNewItem = () => {
    if (newTitle.trim()) {
      addItem({ id: Date.now().toString(), title: newTitle, details: 'Новий опис ресурсу' });
      setNewTitle('');
    }
  };

  return (
    <SafeAreaView style={[styles.content, isDarkMode && styles.darkBg]}>
      <View style={styles.addItemBox}>
        <TextInput 
          style={[styles.input, {flex: 1, marginBottom: 0}]} 
          placeholder="Назва нового квізу" 
          value={newTitle}
          onChangeText={setNewTitle}
        />
        <TouchableOpacity style={[styles.button, {marginLeft: 10}]} onPress={addNewItem}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, isDarkMode && {backgroundColor: '#444'}]}>
            <TouchableOpacity style={{flex: 1}} onPress={() => { setSelected(item); setModalVisible(true); }}>
              <Text style={[styles.cardTitle, isDarkMode && {color: '#fff'}]}>{item.title}</Text>
              <Text style={{color: '#888'}}>Натисніть для деталей</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeItem(item.id)}>
              <Text style={{color: 'red', fontWeight: 'bold'}}>Видалити</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selected?.title}</Text>
            <Text style={{textAlign: 'center', marginBottom: 20}}>{selected?.details}</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => { setModalVisible(false); navigation.navigate('Details', { item: selected }); }}
            >
              <Text style={styles.buttonText}>Детальніше (Нативні функції)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{marginTop: 15}}>
              <Text style={{color: '#007AFF'}}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Екран Постів (Пункт 3 - API + Кешування)
const ApiPostsScreen = () => {
  const { isDarkMode } = useStore();
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await axios.get('https://jsonplaceholder.typicode.com/posts?_limit=10');
      return res.data;
    }
  });

  if (isLoading) return <ActivityIndicator style={{marginTop: 50}} size="large" />;

  return (
    <View style={[styles.content, isDarkMode && styles.darkBg]}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, isDarkMode && {backgroundColor: '#444'}]}>
            <Text style={[styles.cardTitle, isDarkMode && {color: '#fff'}]}>{item.title}</Text>
            <Text style={{color: '#666'}}>{item.body.substring(0, 50)}...</Text>
          </View>
        )}
      />
    </View>
  );
};

// Екран Деталей (Пункт 6 - Календар та Фото)
const DetailsScreen = ({ route }) => {
  const { item } = route.params;
  const { isDarkMode } = useStore();
  const [image, setImage] = useState(null);

  const handleCalendar = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(c => c.allowsModifications) || calendars[0];
      await Calendar.createEventAsync(defaultCalendar.id, {
        title: `Квіз: ${item.title}`,
        startDate: new Date(),
        endDate: new Date(Date.now() + 3600000),
        timeZone: 'GMT+3',
      });
      Alert.alert("Успіх", "Подію додано в календар!");
    }
  };

  const handlePhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  return (
    <ScrollView contentContainerStyle={[styles.center, isDarkMode && styles.darkBg, {flex: 1}]}>
      <Text style={[styles.modalTitle, isDarkMode && {color: '#fff'}]}>{item.title}</Text>
      <Text style={[isDarkMode && {color: '#ccc'}, {marginBottom: 30}]}>{item.details}</Text>
      
      <TouchableOpacity style={[styles.button, {backgroundColor: '#34C759', width: '80%'}]} onPress={handleCalendar}>
        <Text style={styles.buttonText}>📅 Додати нагадування</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, {backgroundColor: '#5856D6', width: '80%', marginTop: 10}]} onPress={handlePhoto}>
        <Text style={styles.buttonText}>🖼️ Прикріпити зображення</Text>
      </TouchableOpacity>

      {image && <Image source={{uri: image}} style={styles.detailImage} />}
    </ScrollView>
  );
};

// Екран Налаштувань (Пункт 2b, 4 - Глобальні налаштування)
const SettingsScreen = () => {
  const { user, setUser, isDarkMode, toggleTheme, isSessionOnly, setSessionMode } = useStore();

  return (
    <View style={[styles.content, isDarkMode && styles.darkBg]}>
      <Text style={[styles.cardTitle, isDarkMode && {color: '#fff'}, {marginBottom: 20}]}>Профіль: {user?.email}</Text>
      
      <View style={styles.settingRow}>
        <Text>Темна тема (Глобально)</Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>

      <View style={styles.settingRow}>
        <View style={{flex: 1, marginRight: 10}}>
          <Text>Режим "Тільки сесія"</Text>
          <Text style={{fontSize: 10, color: '#888'}}>Дані списку не збережуться після виходу</Text>
        </View>
        <Switch value={isSessionOnly} onValueChange={setSessionMode} />
      </View>

      <TouchableOpacity style={[styles.button, {backgroundColor: '#FF3B30', marginTop: 30}]} onPress={() => setUser(null)}>
        <Text style={styles.buttonText}>Вийти з акаунту</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- 3. НАВІГАЦІЙНА КОНСТРУКЦІЯ ---
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Список" component={ListScreen} />
    <Tab.Screen name="API Пости" component={ApiPostsScreen} />
    <Tab.Screen name="Налаштування" component={SettingsScreen} />
  </Tab.Navigator>
);

export default function App() {
  const user = useStore((state) => state.user);

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar barStyle={useStore.getState().isDarkMode ? "light-content" : "dark-content"} />
        <Stack.Navigator>
          {!user ? (
            <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
          ) : (
            <>
              <Stack.Screen name="Home" component={MainTabs} options={{headerShown: false}} />
              <Stack.Screen name="Details" component={DetailsScreen} options={{title: 'Деталі ресурсу'}} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}

// --- 4. СТИЛІ ---
const styles = StyleSheet.create({
  authContainer: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#f0f8ff' },
  authTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#007AFF' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, marginBottom: 15, backgroundColor: '#fff' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  content: { flex: 1, padding: 15, backgroundColor: '#f9f9f9' },
  darkBg: { backgroundColor: '#222' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  addItemBox: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#eee', borderRadius: 12, marginVertical: 8 },
  center: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  detailImage: { width: 250, height: 250, borderRadius: 15, marginTop: 20 }
});