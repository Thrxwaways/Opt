// firebase-config.js
// Подключение Firebase ко всем страницам сайта

// Конфигурация Firebase (ваши данные)
const firebaseConfig = {
  apiKey: "AIzaSyBP_-nExVHutZ7PY3PMInyBlwPnaAmRBIQ",
  authDomain: "vapeopt-1eee8.firebaseapp.com",
  projectId: "vapeopt-1eee8",
  storageBucket: "vapeopt-1eee8.firebasestorage.app",
  messagingSenderId: "475642466652",
  appId: "1:475642466652:web:ad709ec2be07ca25083199",
  measurementId: "G-F1CXVZE2MM"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Разрешаем использовать базу данных в тестовом режиме
db.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// Включаем офлайн-режим для лучшей производительности
db.enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log('Несколько вкладок открыто - persistence работает только в одной');
    } else if (err.code == 'unimplemented') {
      console.log('Браузер не поддерживает офлайн-режим');
    }
  });

// Утилиты для работы с Firestore
const FirestoreService = {
  // Получить все документы из коллекции
  async getCollection(collectionName) {
    try {
      const snapshot = await db.collection(collectionName).get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Ошибка получения ${collectionName}:`, error);
      return [];
    }
  },

  // Получить один документ
  async getDocument(collectionName, docId) {
    try {
      const doc = await db.collection(collectionName).doc(docId).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      console.error(`Ошибка получения документа:`, error);
      return null;
    }
  },

  // Сохранить документ
  async saveDocument(collectionName, data, docId = null) {
    try {
      if (docId) {
        await db.collection(collectionName).doc(docId).set(data, { merge: true });
        return docId;
      } else {
        const docRef = await db.collection(collectionName).add(data);
        return docRef.id;
      }
    } catch (error) {
      console.error(`Ошибка сохранения:`, error);
      throw error;
    }
  },

  // Удалить документ
  async deleteDocument(collectionName, docId) {
    try {
      await db.collection(collectionName).doc(docId).delete();
      return true;
    } catch (error) {
      console.error(`Ошибка удаления:`, error);
      return false;
    }
  },

  // Обновить весь список (заменить все документы)
  async replaceCollection(collectionName, items) {
    try {
      const batch = db.batch();
      
      // Удаляем все старые документы
      const snapshot = await db.collection(collectionName).get();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Добавляем новые
      items.forEach(item => {
        const docRef = db.collection(collectionName).doc();
        batch.set(docRef, item);
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error(`Ошибка замены коллекции:`, error);
      return false;
    }
  },

  // Подписка на изменения коллекции в реальном времени
  subscribeToCollection(collectionName, callback) {
    return db.collection(collectionName).onSnapshot((snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(items);
    }, (error) => {
      console.error(`Ошибка подписки:`, error);
    });
  }
};

// Делаем сервис глобально доступным
window.FirestoreService = FirestoreService;
window.db = db;