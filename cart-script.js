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
    `;
    document.head.appendChild(style);
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
function initCartScript() {
    addNotificationStyles();
    addCartIconStyles();
    loadCart();
    
    window.addEventListener('storage', function(e) {
        if (e.key === 'vapeopt_cart') {
            cart = JSON.parse(e.newValue || '[]');
            updateCartIcon();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartScript);
} else {
    initCartScript();
}