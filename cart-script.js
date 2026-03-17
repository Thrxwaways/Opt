// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let cart = [];

// ==================== ФУНКЦИИ РАБОТЫ С УВЕДОМЛЕНИЯМИ ====================
function showNotification(message, type = 'warning') {
    let notification = document.getElementById('notification');
    let notificationIcon = document.getElementById('notificationIcon');
    let notificationMessage = document.getElementById('notificationMessage');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        notification.id = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon" id="notificationIcon">⚡</span>
                <span id="notificationMessage"></span>
            </div>
        `;
        document.body.appendChild(notification);
        notificationIcon = document.getElementById('notificationIcon');
        notificationMessage = document.getElementById('notificationMessage');
    }
    
    notification.className = 'notification show ' + type;
    notificationIcon.textContent = type === 'warning' ? '⚠️' : type === 'error' ? '❌' : '✅';
    notificationMessage.textContent = message;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ==================== ФУНКЦИИ РАБОТЫ С КОРЗИНОЙ ====================
function loadCart() {
    try {
        const savedCart = localStorage.getItem('vapeopt_cart');
        cart = savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
        cart = [];
    }
    updateCartIcon();
}

function saveCart() {
    localStorage.setItem('vapeopt_cart', JSON.stringify(cart));
    updateCartIcon();
    
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'vapeopt_cart',
        newValue: JSON.stringify(cart)
    }));
}

function updateCartIcon() {
    const cartIcon = document.getElementById('cartIcon');
    const cartCount = document.getElementById('cartCount');
    
    if (!cartIcon || !cartCount) return;
    
    if (cart.length > 0) {
        cartIcon.classList.remove('hidden');
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCount.textContent = totalItems;
    } else {
        cartIcon.classList.add('hidden');
    }
}

// Функция для создания уникального ключа товара (для объединения одинаковых)
function getItemKey(item) {
    if (item.type === 'liquid') {
        return `${item.type}_${item.productId}_${item.flavorIndex}_${item.strength}`;
    } else if (item.type === 'consumable') {
        return `${item.type}_${item.productId}_${item.itemIndex}_${item.resistance}`;
    } else if (item.type === 'pod') {
        return `${item.type}_${item.productId}_${item.itemIndex}`;
    } else if (item.type === 'disposable') {
        return `${item.type}_${item.productId}_${item.itemIndex}_${item.strength}`;
    } else if (item.type === 'snus') {
        return `${item.type}_${item.productId}_${item.itemIndex}_${item.strength}`;
    }
    return `${item.type}_${item.productId}_${Date.now()}`;
}

// Функция для объединения товаров в корзине
function mergeCartItems() {
    const mergedItems = [];
    const itemMap = new Map();
    
    cart.forEach(item => {
        const key = getItemKey(item);
        if (itemMap.has(key)) {
            // Если товар уже есть, увеличиваем количество
            const existingItem = itemMap.get(key);
            existingItem.quantity += item.quantity;
        } else {
            // Иначе добавляем новый товар
            const itemCopy = { ...item };
            itemMap.set(key, itemCopy);
        }
    });
    
    cart = Array.from(itemMap.values());
}

// ==================== ФУНКЦИИ ДЛЯ СТРАНИЦ КАТАЛОГА ====================

// Для жидкостей
window.addLiquidToCart = function(product, flavor, quantity) {
    if (!flavor || flavor.inStock === false) {
        showNotification('Этот вкус недоступен', 'error');
        return false;
    }
    
    const cartItem = {
        id: Date.now() + Math.random(),
        productId: product.id,
        flavorIndex: flavor.id || 0,
        name: product.name,
        flavorName: flavor.name,
        strength: flavor.strength,
        strengthText: getStrengthText(flavor.strength),
        volume: flavor.volume || 30,
        tag: flavor.tag,
        price: product.price,
        quantity: quantity || 1,
        image: product.image,
        type: 'liquid'
    };
    
    cart.push(cartItem);
    mergeCartItems(); // Объединяем одинаковые товары
    saveCart();
    showNotification('Товар добавлен в корзину', 'success');
    return true;
};

// Для расходников
window.addConsumableToCart = function(product, item, quantity) {
    if (!item || item.inStock === false) {
        showNotification('Этот товар недоступен', 'error');
        return false;
    }
    
    const cartItem = {
        id: Date.now() + Math.random(),
        productId: product.id,
        itemIndex: item.id || 0,
        name: product.name,
        itemName: item.name,
        resistance: item.resistance,
        volume: item.volume || 30,
        price: product.price,
        quantity: quantity || 1,
        image: product.image,
        type: 'consumable'
    };
    
    cart.push(cartItem);
    mergeCartItems(); // Объединяем одинаковые товары
    saveCart();
    showNotification('Товар добавлен в корзину', 'success');
    return true;
};

// Для POD систем
window.addPodToCart = function(product, item, quantity) {
    if (!item || item.inStock === false) {
        showNotification('Этот товар недоступен', 'error');
        return false;
    }
    
    const cartItem = {
        id: Date.now() + Math.random(),
        productId: product.id,
        itemIndex: item.id || 0,
        name: product.name,
        itemName: item.name,
        price: product.price,
        quantity: quantity || 1,
        image: product.image,
        type: 'pod'
    };
    
    cart.push(cartItem);
    mergeCartItems(); // Объединяем одинаковые товары
    saveCart();
    showNotification('Товар добавлен в корзину', 'success');
    return true;
};

// Для одноразок
window.addDisposableToCart = function(product, item, quantity) {
    if (!item || item.inStock === false) {
        showNotification('Этот товар недоступен', 'error');
        return false;
    }
    
    const cartItem = {
        id: Date.now() + Math.random(),
        productId: product.id,
        itemIndex: item.id || 0,
        name: product.name,
        itemName: item.name,
        strength: item.strength,
        puffs: item.puffs,
        price: product.price,
        quantity: quantity || 1,
        image: product.image,
        type: 'disposable'
    };
    
    cart.push(cartItem);
    mergeCartItems(); // Объединяем одинаковые товары
    saveCart();
    showNotification('Товар добавлен в корзину', 'success');
    return true;
};

// Для снюса
window.addSnusToCart = function(product, item, quantity) {
    if (!item || item.inStock === false) {
        showNotification('Этот товар недоступен', 'error');
        return false;
    }
    
    const cartItem = {
        id: Date.now() + Math.random(),
        productId: product.id,
        itemIndex: item.id || 0,
        name: product.name,
        itemName: item.name,
        strength: item.strength,
        price: product.price,
        quantity: quantity || 1,
        image: product.image,
        type: 'snus'
    };
    
    cart.push(cartItem);
    mergeCartItems(); // Объединяем одинаковые товары
    saveCart();
    showNotification('Товар добавлен в корзину', 'success');
    return true;
};

// Вспомогательная функция для получения текста крепости жидкостей
function getStrengthText(strength) {
    switch(parseInt(strength)) {
        case 1: return '0';
        case 2: return '20';
        case 3: return '50';
        case 4: return '70';
        default: return '0';
    }
}

// Функция для удаления товара из корзины по индексу
window.removeFromCart = function(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCart();
        updateCartDisplay();
        showNotification('Товар удален из корзины', 'success');
    }
};

// Функция для обновления количества товара
window.updateCartItemQuantity = function(index, newQuantity) {
    if (index >= 0 && index < cart.length) {
        if (newQuantity <= 0) {
            cart.splice(index, 1);
        } else {
            cart[index].quantity = newQuantity;
        }
        saveCart();
        updateCartDisplay();
    }
};

// ==================== ФУНКЦИИ ДЛЯ ОТОБРАЖЕНИЯ КОРЗИНЫ ====================
window.openCart = function() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.classList.add('show');
        updateCartDisplay();
    } else {
        window.location.href = 'index.html#cart';
    }
};

function updateCartDisplay() {
    const cartItemsGrid = document.getElementById('cartItemsGrid');
    const summaryItems = document.getElementById('summaryItems');
    const summaryPrice = document.getElementById('summaryPrice');
    
    if (!cartItemsGrid) return;

    if (cart.length === 0) {
        cartItemsGrid.innerHTML = '<div class="cart-empty">🛒 КОРЗИНА ПУСТА</div>';
        if (summaryItems) summaryItems.textContent = '0';
        if (summaryPrice) summaryPrice.textContent = '0';
        return;
    }

    let html = '';
    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach((item, index) => {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;

        let itemDetails = '';

        if (item.flavorName) {
            itemDetails = `${item.flavorName} • ${item.strengthText || '0'} мг • ${item.volume || 30} мл`;
        } else if (item.resistance) {
            itemDetails = `${item.itemName} • ${item.resistance} Ом • ${item.volume || 30} мл`;
        } else if (item.type === 'pod') {
            itemDetails = `${item.itemName}`;
        } else if (item.strength && item.puffs) {
            itemDetails = `${item.itemName} • ${item.strength}% • ${item.puffs} тяг`;
        } else if (item.type === 'snus') {
            itemDetails = `${item.itemName} • ${item.strength} мг`;
        }

        html += `
            <div class="cart-item-card">
                <img src="${item.image || 'https://via.placeholder.com/70x70/10213f/3e7bff?text=' + encodeURIComponent(item.name.substring(0, 3))}" 
                     class="cart-item-image"
                     onerror="this.src='https://via.placeholder.com/70x70/10213f/3e7bff?text=Нет+фото'">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-details">${itemDetails}</div>
                <div class="cart-item-price-block">
                    <span class="cart-item-price">${item.price} Br</span>
                    <span class="cart-item-quantity">${item.quantity} шт</span>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})" title="Удалить товар">
                    ✕
                </button>
            </div>
        `;
    });

    cartItemsGrid.innerHTML = html;
    if (summaryItems) summaryItems.textContent = totalItems;
    if (summaryPrice) summaryPrice.textContent = totalPrice;
}

// ==================== СТИЛИ ДЛЯ УВЕДОМЛЕНИЙ ====================
function addNotificationStyles() {
    const existingStyles = document.querySelector('style[data-notification-styles]');
    if (existingStyles) return;
    
    const style = document.createElement('style');
    style.setAttribute('data-notification-styles', 'true');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(8, 20, 40, 0.95);
            border: 2px solid;
            border-radius: 12px;
            padding: 12px 20px;
            color: #fff;
            font-size: 0.9rem;
            font-weight: 500;
            backdrop-filter: blur(10px);
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
            transform: translateX(400px);
            transition: transform 0.3s ease;
            z-index: 2000;
            max-width: 300px;
            border-left-width: 4px;
        }

        .notification.show {
            transform: translateX(0);
        }

        .notification.warning {
            border-color: #f39c12;
            background: rgba(243, 156, 18, 0.15);
            color: #f39c12;
        }

        .notification.error {
            border-color: #e74c3c;
            background: rgba(231, 76, 60, 0.15);
            color: #e74c3c;
        }

        .notification.success {
            border-color: #2ecc71;
            background: rgba(46, 204, 113, 0.15);
            color: #2ecc71;
        }

        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .notification-icon {
            font-size: 1.2rem;
        }
    `;
    document.head.appendChild(style);
}

// ==================== СТИЛИ ДЛЯ ИКОНКИ КОРЗИНЫ ====================
function addCartIconStyles() {
    const existingStyles = document.querySelector('style[data-cart-styles]');
    if (existingStyles) return;
    
    const style = document.createElement('style');
    style.setAttribute('data-cart-styles', 'true');
    style.textContent = `
        .cart-icon {
            position: relative;
            background: #10213f;
            border: 2px solid #3e7bff;
            color: #8fb8ff;
            width: 45px;
            height: 45px;
            border-radius: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            text-decoration: none;
            box-shadow: 0 0 20px #3e7bff;
            transition: 0.2s;
            cursor: pointer;
        }

        .cart-icon:hover {
            background: #3e7bff;
            color: black;
            transform: scale(1.1);
        }

        .cart-icon.hidden {
            display: none;
        }

        .cart-count {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #e74c3c;
            color: white;
            font-size: 0.7rem;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #3e7bff;
            box-shadow: 0 0 10px #e74c3c;
        }
        
        /* Стили для кнопки удаления в корзине */
        .cart-item-card {
            position: relative;
        }
        
        .cart-item-remove {
            position: absolute;
            top: 5px;
            right: 5px;
            width: 24px;
            height: 24px;
            border-radius: 12px;
            background: rgba(231, 76, 60, 0.2);
            border: 1px solid #e74c3c;
            color: #e74c3c;
            font-size: 1rem;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            z-index: 5;
        }
        
        .cart-item-remove:hover {
            background: #e74c3c;
            color: white;
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
function initCartScript() {
    addNotificationStyles();
    addCartIconStyles();
    loadCart();
    mergeCartItems(); // Объединяем товары при загрузке
    
    // Добавляем обработчик для иконки корзины
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.openCart();
        });
    }
    
    window.addEventListener('storage', function(e) {
        if (e.key === 'vapeopt_cart') {
            cart = JSON.parse(e.newValue || '[]');
            mergeCartItems(); // Объединяем товары при изменении
            updateCartIcon();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartScript);
} else {
    initCartScript();
}