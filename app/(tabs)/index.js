import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, FlatList, Image, 
  Switch, StatusBar, SafeAreaView, Modal, TextInput, Alert 
} from 'react-native';

// Початкові дані
const INITIAL_DATA = Array.from({ length: 5 }, (_, i) => ({
  id: Date.now().toString() + i,
  title: `Командний квіз №${i + 1}`,
  description: 'Натисніть, щоб розпочати тестування з командою',
  details: 'Це детальна інформація про квіз. Тут можуть бути правила, кількість питань та час на проходження.',
  image: `https://picsum.photos/200?random=${i}`, 
}));

export default function App() {
  // Стани
  const [activeTab, setActiveTab] = useState('list');
  const [quizzes, setQuizzes] = useState(INITIAL_DATA);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);
  const [showNavMenu, setShowNavMenu] = useState(false); // Для кастомного меню

  // Стани для модального вікна деталей
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Стани для нового елемента (Екран 3)
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Функції
  const addItem = () => {
    if (!newTitle.trim()) return Alert.alert("Помилка", "Введіть назву");
    const newItem = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDesc || 'Без опису',
      details: 'Додаткова інформація для власного квізу',
      image: `https://picsum.photos/200?random=${Math.random()}`,
    };
    setQuizzes([newItem, ...quizzes]);
    setNewTitle('');
    setNewDesc('');
    setActiveTab('list');
  };

  const deleteItem = (id) => {
    setQuizzes(quizzes.filter(item => item.id !== id));
    setDetailModalVisible(false);
  };

  // Компонент елемента списку
  const QuizItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, isDarkMode ? styles.darkCard : styles.lightCard]}
      onPress={() => { setSelectedItem(item); setDetailModalVisible(true); }}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { fontSize: 17 * fontSizeMultiplier }, isDarkMode ? styles.darkText : styles.lightText]}>
          {item.title}
        </Text>
        <Text style={[{ fontSize: 14 * fontSizeMultiplier }, isDarkMode ? styles.darkTextSub : styles.lightTextSub]}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* 5. Перероблена навігація (Кастомне меню) */}
      <View style={[styles.header, isDarkMode ? styles.darkTabBar : styles.lightTabBar]}>
        <Text style={[styles.headerTitle, isDarkMode ? styles.darkText : styles.lightText]}>QuizApp</Text>
        <TouchableOpacity style={styles.menuTrigger} onPress={() => setShowNavMenu(!showNavMenu)}>
          <Text style={{color: '#007AFF', fontWeight: 'bold'}}>МЕНЮ ☰</Text>
        </TouchableOpacity>
      </View>

      {showNavMenu && (
        <View style={[styles.dropdown, isDarkMode ? styles.darkCard : styles.lightCard]}>
          {['list', 'settings', 'add'].map((tab) => (
            <TouchableOpacity key={tab} style={styles.dropdownItem} onPress={() => { setActiveTab(tab); setShowNavMenu(false); }}>
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'list' ? '📚 Список' : tab === 'settings' ? '⚙️ Налаштування' : '➕ Додати новий'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.content}>
        {/* Екран 1: Список */}
        {activeTab === 'list' && (
          <FlatList
            data={quizzes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <QuizItem item={item} />}
            ListEmptyComponent={<Text style={styles.emptyText}>Список порожній</Text>}
          />
        )}

        {/* Екран 2: Налаштування (Пункт 4: TextInput) */}
        {activeTab === 'settings' && (
          <View style={styles.settingsScreen}>
            <Text style={[styles.settingsTitle, { fontSize: 26 * fontSizeMultiplier }, isDarkMode ? styles.darkText : styles.lightText]}>Налаштування</Text>
            
            <View style={[styles.settingRow, isDarkMode ? styles.darkCard : styles.lightCard]}>
              <Text style={[styles.settingLabel, isDarkMode ? styles.darkText : styles.lightText]}>Нічний режим</Text>
              <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
            </View>

            <View style={[styles.settingRow, isDarkMode ? styles.darkCard : styles.lightCard, {marginTop: 15}]}>
              <Text style={[styles.settingLabel, isDarkMode ? styles.darkText : styles.lightText]}>Ім'я профілю</Text>
              <TextInput 
                style={[styles.input, {borderColor: isDarkMode ? '#444' : '#ddd', color: isDarkMode ? '#fff' : '#000'}]} 
                placeholder="Введіть нікнейм..."
                placeholderTextColor="#888"
              />
            </View>
          </View>
        )}

        {/* Екран 3: Додавання (Пункт 2) */}
        {activeTab === 'add' && (
          <View style={styles.settingsScreen}>
            <Text style={[styles.settingsTitle, isDarkMode ? styles.darkText : styles.lightText]}>Новий елемент</Text>
            <TextInput 
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} 
              placeholder="Назва квізу"
              value={newTitle}
              onChangeText={setNewTitle}
              placeholderTextColor="#888"
            />
            <TextInput 
              style={[styles.input, isDarkMode ? styles.darkInput : styles.lightInput]} 
              placeholder="Опис"
              value={newDesc}
              onChangeText={setNewDesc}
              placeholderTextColor="#888"
            />
            <TouchableOpacity style={styles.addButton} onPress={addItem}>
              <Text style={styles.addButtonText}>Зберегти</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 6. Модальне вікно деталей */}
      <Modal visible={detailModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode ? styles.darkCard : styles.lightCard]}>
            {selectedItem && (
              <>
                <Text style={[styles.modalTitle, isDarkMode ? styles.darkText : styles.lightText]}>{selectedItem.title}</Text>
                <Text style={[styles.modalDetails, isDarkMode ? styles.darkTextSub : styles.lightTextSub]}>{selectedItem.details}</Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setDetailModalVisible(false)}>
                    <Text style={{color: '#fff'}}>Закрити</Text>
                  </TouchableOpacity>
                  {/* 3. Можливість видаляти (Пункт 3) */}
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
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: '#ecf7ff' },
  darkContainer: { backgroundColor: '#121212' },
  content: { flex: 1, paddingHorizontal: 15 },
  
  // Header & Dropdown
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center', elevation: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  dropdown: { position: 'absolute', top: 60, right: 15, zIndex: 1000, width: 200, borderRadius: 10, elevation: 10, padding: 10 },
  dropdownItem: { paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#ccc' },
  
  // Cards
  card: { flexDirection: 'row', marginVertical: 8, borderRadius: 15, padding: 12, alignItems: 'center', elevation: 3 },
  lightCard: { backgroundColor: '#fff' },
  darkCard: { backgroundColor: '#2c2c2e' },
  cardImage: { width: 60, height: 60, borderRadius: 10 },
  cardContent: { marginLeft: 15, flex: 1 },
  cardTitle: { fontWeight: '700' },
  lightText: { color: '#000' },
  darkText: { color: '#fff' },
  lightTextSub: { color: '#666' },
  darkTextSub: { color: '#aaa' },

  // Inputs & Buttons
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 15, fontSize: 16 },
  lightInput: { borderColor: '#ddd', backgroundColor: '#fff' },
  darkInput: { borderColor: '#444', backgroundColor: '#1e1e1e', color: '#fff' },
  addButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 20, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  modalDetails: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 15 },
  closeButton: { backgroundColor: '#888', padding: 12, borderRadius: 10 },
  deleteButton: { backgroundColor: '#ff3b30', padding: 12, borderRadius: 10 },

  settingsScreen: { flex: 1, paddingTop: 20 },
  settingsTitle: { fontSize: 26, fontWeight: '800', marginBottom: 20 },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, justifyContent: 'space-between' },
  tabText: { fontSize: 16, color: '#555' },
  activeTabText: { color: '#007AFF', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' }
});