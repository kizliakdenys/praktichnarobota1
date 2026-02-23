import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, Switch, StatusBar, SafeAreaView } from 'react-native';

// 5. Список з 20+ елементів (Пункт 5 завдання)
const QUIZ_DATA = Array.from({ length: 25 }, (_, i) => ({
  id: i.toString(),
  title: `Командний квіз №${i + 1}`,
  description: 'Натисніть, щоб розпочати тестування з командою',
  image: `https://picsum.photos/200?random=${i}`, 
}));

export default function App() {
  // 3. Стан для перемикання екранів (Пункт 3 завдання)
  const [activeTab, setActiveTab] = useState('list');
  
  // 6. Стан для налаштувань теми (Пункт 6 завдання)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1);

  // 7. Окремий компонент для елемента списку (Props) (Пункт 7 завдання)
  const QuizItem = ({ title, desc, img }) => (
    <View style={[styles.card, isDarkMode ? styles.darkCard : styles.lightCard]}>
      <Image source={{ uri: img }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { fontSize: 17 * fontSizeMultiplier }, isDarkMode ? styles.darkText : styles.lightText]}>{title}</Text>
        <Text style={[{ fontSize: 14 * fontSizeMultiplier }, isDarkMode ? styles.darkTextSub : styles.lightTextSub]}>{desc}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* 4. Навігаційні кнопки з індикатором активності (Пункт 4 завдання) */}
      <View style={[styles.tabBar, isDarkMode ? styles.darkTabBar : styles.lightTabBar]}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'list' && styles.activeTab]} 
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabText, activeTab === 'list' && styles.activeTabText]}>Тести</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'settings' && styles.activeTab]} 
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>Налаштування</Text>
        </TouchableOpacity>
      </View>

      {/* Основний контейнер для зміни контенту (Пункт 3) */}
      <View style={styles.content}>
        {activeTab === 'list' ? (
          <FlatList
            data={QUIZ_DATA}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <QuizItem title={item.title} desc={item.description} img={item.image} />
            )}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.settingsScreen}>
            <Text style={[styles.settingsTitle, { fontSize: 26 * fontSizeMultiplier }, isDarkMode ? styles.darkText : styles.lightText]}>Налаштування</Text>
            
            <View style={[styles.settingRow, isDarkMode ? styles.darkCard : styles.lightCard]}>
              <Text style={[styles.settingLabel, { fontSize: 18 * fontSizeMultiplier }, isDarkMode ? styles.darkText : styles.lightText]}>Нічний режим</Text>
              <Switch 
                value={isDarkMode} 
                onValueChange={(value) => setIsDarkMode(value)} 
                trackColor={{ false: "#cccccc", true: "#9c0303" }}
                thumbColor={isDarkMode ? "#ffffff" : "#747171"}
              />
            </View>

            <View style={[styles.settingRow, isDarkMode ? styles.darkCard : styles.lightCard, { marginTop: 15 }]}>
              <Text style={[styles.settingLabel, { fontSize: 18 * fontSizeMultiplier }, isDarkMode ? styles.darkText : styles.lightText]}>Розмір шрифту</Text>
              <View style={styles.fontSizeButtons}>
                <TouchableOpacity 
                  style={[styles.fontButton, fontSizeMultiplier === 0.85 && styles.fontButtonActive]}
                  onPress={() => setFontSizeMultiplier(0.85)}
                >
                  <Text style={[styles.fontButtonText, fontSizeMultiplier === 0.85 && styles.fontButtonTextActive]}>A</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.fontButton, fontSizeMultiplier === 1 && styles.fontButtonActive]}
                  onPress={() => setFontSizeMultiplier(1)}
                >
                  <Text style={[styles.fontButtonText, { fontSize: 18 }, fontSizeMultiplier === 1 && styles.fontButtonTextActive]}>A</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.fontButton, fontSizeMultiplier === 1.15 && styles.fontButtonActive]}
                  onPress={() => setFontSizeMultiplier(1.15)}
                >
                  <Text style={[styles.fontButtonText, { fontSize: 22 }, fontSizeMultiplier === 1.15 && styles.fontButtonTextActive]}>A</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  lightContainer: { backgroundColor: '#ecf7ff' },
  darkContainer: { backgroundColor: '#121212' },
  
  content: { flex: 1, paddingHorizontal: 15 },

  tabBar: { flexDirection: 'row', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  lightTabBar: { backgroundColor: '#ffffff' },
  darkTabBar: { backgroundColor: '#1e1e1e' },
  
  tabButton: { flex: 1, paddingVertical: 18, alignItems: 'center' },
  activeTab: { borderBottomWidth: 4, borderBottomColor: '#007AFF' }, // Індикатор активного екрану
  tabText: { color: '#8e8e93', fontWeight: 'bold', fontSize: 16 },
  activeTabText: { color: '#007AFF' },

  card: { 
    flexDirection: 'row', 
    marginVertical: 8, 
    borderRadius: 15, 
    padding: 12,
    alignItems: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  lightCard: { backgroundColor: '#fff' },
  darkCard: { backgroundColor: '#2c2c2e' },
  
  cardImage: { width: 65, height: 65, borderRadius: 12 },
  cardContent: { marginLeft: 15, flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  
  lightText: { color: '#000' },
  darkText: { color: '#fff' },
  lightTextSub: { color: '#636366', fontSize: 14 },
  darkTextSub: { color: '#aeaeb2', fontSize: 14 },

  settingsScreen: { flex: 1, paddingTop: 40 },
  settingsTitle: { fontSize: 26, fontWeight: '800', marginBottom: 30, textAlign: 'left' },
  settingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    borderRadius: 18, 
    justifyContent: 'space-between' 
  },
  settingLabel: { fontSize: 18, fontWeight: '500' },
  
  fontSizeButtons: { flexDirection: 'row', gap: 10 },
  fontButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 2, borderColor: '#d0d0d0' },
  fontButtonActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  fontButtonText: { fontSize: 14, color: '#666', fontWeight: '600' },
  fontButtonTextActive: { color: '#fff' }
});