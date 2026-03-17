// auth.js - логика авторизации для всего сайта

// Ждем загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    
    // === ЧАСТЬ 1: ОБРАБОТКА ФОРМЫ ВХОДА (на странице login.html) ===
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');
            
            // Проверяем, определена ли auth
            if (typeof auth === 'undefined') {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'Ошибка: Firebase Auth не инициализирован';
                console.error('auth is undefined - проверьте firebase-config.js');
                return;
            }
            
            // Очищаем предыдущие сообщения
            messageDiv.className = 'message';
            messageDiv.textContent = 'Вход...';
            
            try {
                // Пытаемся войти
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                
                // Успешный вход
                messageDiv.className = 'message success';
                messageDiv.textContent = 'Вход выполнен! Перенаправление...';
                
                // Проверяем, есть ли сохраненная страница для перенаправления
                const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || 'admin-panel.html';
                sessionStorage.removeItem('redirectAfterLogin'); // Очищаем после использования
                
                // Перенаправляем через 1 секунду
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1000);
                
            } catch (error) {
                // Ошибка входа
                messageDiv.className = 'message error';
                
                // Понятные сообщения об ошибках
                switch(error.code) {
                    case 'auth/user-not-found':
                        messageDiv.textContent = 'Пользователь не найден';
                        break;
                    case 'auth/wrong-password':
                        messageDiv.textContent = 'Неверный пароль';
                        break;
                    case 'auth/invalid-email':
                        messageDiv.textContent = 'Неверный формат email';
                        break;
                    case 'auth/too-many-requests':
                        messageDiv.textContent = 'Слишком много попыток. Попробуйте позже';
                        break;
                    default:
                        messageDiv.textContent = 'Ошибка входа: ' + error.message;
                }
            }
        });
    }
    
    // === ЧАСТЬ 2: ЗАЩИТА СТРАНИЦ (для admin-panel.html и других админ-страниц) ===
    
    // Проверяем, нужно ли защищать эту страницу
    // Список страниц, которые требуют авторизации
    const protectedPages = [
        'admin-panel.html',
        'pod-admin.html',
        'snus-admin.html',
        'zhidk-admin.html',
        'odnoraz-admin.html',
        'rashod-admin.html'
    ];
    
    // Получаем имя текущей страницы
    const currentPage = window.location.pathname.split('/').pop();
    
    // Если текущая страница в списке защищенных
    if (protectedPages.includes(currentPage)) {
        // Проверяем статус авторизации
        if (typeof auth !== 'undefined') {
            auth.onAuthStateChanged(function(user) {
                if (!user) {
                    // Пользователь не авторизован - отправляем на страницу входа
                    // Сохраняем страницу, куда хотел зайти пользователь (чтобы вернуть его после входа)
                    sessionStorage.setItem('redirectAfterLogin', currentPage);
                    window.location.href = 'login.html';
                }
            });
        } else {
            console.error('auth is undefined on protected page');
            // Если auth не определена, все равно отправляем на логин
            window.location.href = 'login.html';
        }
    }
    
    // === ЧАСТЬ 3: ВЫХОД ИЗ СИСТЕМЫ (если на странице есть кнопка выхода) ===
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (typeof auth !== 'undefined') {
                try {
                    await auth.signOut();
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('Ошибка при выходе:', error);
                }
            }
        });
    }
});