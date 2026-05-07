// Глобальные данные и состояние
const parser = new DOMParser();
let catalogData = null;
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

// Встроенный каталог (используется как фолбэк)
const embeddedCatalog = [
    { id: "101", name: "Samsung UE55TU8000", category: "Телевизоры", price: 1599, description: "55-дюймовый 4K UHD Smart TV с HDR и Crystal Display — яркое изображение и умные функции", image: "Sumsung8000.jpg", stock: 15 },
    { id: "102", name: "LG 55UP8100", category: "Телевизоры", price: 1499, description: "55-дюймовый 4K UHD телевизор с WebOS и AI ThinQ — умный дом в вашем доме", image: "LG 55UP8100.jpg", stock: 8 },
    { id: "103", name: "Samsung RB37A554", category: "Холодильники", price: 1799, description: "Холодильник No Frost объёмом 375 л с инверторным компрессором — экономия энергии и свежесть продуктов", image: "Samsung RB37A52N0SAWT.jpg", stock: 12 },
    { id: "104", name: "Indesit DF5180W", category: "Холодильники", price: 1199, description: "Холодильник No Frost объёмом 310 л, энергоэффективность класса A+ — надёжность и экономия", image: "Indesit DF5180W.jpg", stock: 20 },
    { id: "105", name: "Samsung WW80T4020EE", category: "Стиральные машины", price: 999, description: "Стиральная машина 8 кг, 1400 об/мин, функция AddWash — добавляйте бельё даже после старта", image: "Samsung WW80T4020EE.png", stock: 10 },
    { id: "106", name: "LG F2V5VYP2T", category: "Стиральные машины", price: 1299, description: "Стиральная машина 9 кг, 1400 об/мин, технология AI DD — умная забота о вашем бельё", image: "LG F2V5VYP2T.png", stock: 7 },
    { id: "107", name: "Dyson V12 Detect", category: "Пылесосы", price: 1599, description: "Беспроводной пылесос с лазерным датчиком пыли — видите каждую частичку грязи", image: "Dyson V12 Detect.jpg", stock: 5 },
    { id: "108", name: "Samsung VC18M2120", category: "Пылесосы", price: 329, description: "Мешковый пылесос 1800 Вт с фильтром HEPA — мощная очистка воздуха", image: "Samsung VC18M2120.jpg", stock: 25 },
    { id: "109", name: "LG MB-3244J", category: "Микроволновые печи", price: 499, description: "Микроволновая печь 32 л, 1000 Вт, с грилем — готовьте с удовольствием", image: "LG MB-3244J.png", stock: 18 },
    { id: "110", name: "Samsung ME88SUT", category: "Микроволновые печи", price: 399, description: "Микроволновая печь 23 л, 800 Вт, соло — компактность и мощность", image: "Samsung ME88SUT.jpg", stock: 30 },
    { id: "111", name: "Сплит-система AC Electric ACEH-09HN1", category: "Климатическая техника", price: 99, description: "Настенная сплит-система для охлаждения и обогрева, обслуживаемая площадь до 25 м², страна manufacture — Китай, гарантия 36 месяцев", image: "cond.jpg", stock: 7 },
    { id: "112", name: "Blender Philips HR2032/90", category: "Кухонная техника", price: 199, description: "Блендер мощностью 1000 Вт с объёмом чаши 1.5 л и 8 скоростями — для смузи, супов и соусов", image: "Blender Philips HR203290.png", stock: 20 },
    { id: "113", name: "Чайник Bosch TWK3A011ST", category: "Кухонная техника", price: 149, description: "Электрический чайник Bosch 2200 Вт, объём 1.7 л, с автоматическим отключением — безопасность и скорость", image: "Charger Bosch TWK3A011ST.png", stock: 35 },
    { id: "114", name: "Тостер Tefal TT355E11", category: "Кухонная техника", price: 179, description: "Тостер 1600 Вт с двумя независимыми уровнями поджарки и функцией разморозки — идеальный завтрак каждый день", image: "Toaster Tefal TT355E11.png", stock: 15 }
];

async function loadCatalog() {
    try {
        const response = await fetch('data/catalog.xml');
        if (!response.ok) throw new Error('XML not available');
        const xmlText = await response.text();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        catalogData = {
            products: [...xmlDoc.querySelectorAll('product')].map(prod => ({
                id: prod.getAttribute('id'),
                name: prod.querySelector('name').textContent,
                category: prod.querySelector('category').textContent,
                price: +prod.querySelector('price').textContent,
                description: prod.querySelector('description').textContent,
                image: prod.querySelector('image').textContent,
                stock: +prod.querySelector('stock').textContent
            }))
        };
    } catch (e) {
        catalogData = { products: embeddedCatalog };
    }
    window.catalogData = catalogData;
    window.catalogReady = true;
    document.dispatchEvent(new Event('catalogLoaded'));
}

// Отрисовка товаров в сетке
function renderProductGrid(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = products.map(product => `
    <div class="products__card" data-id="${product.id}">
      <div class="products__image">
        <img src="images/${product.image}" alt="${product.name}" onerror="this.style.display='none'">
      </div>
      <h3 class="products__name">${product.name}</h3>
      <p class="products__description">${product.description}</p>
      <div class="products__price">${product.price.toLocaleString()} р.</div>
      <div class="products__actions">
        <button class="products__btn products__btn--primary" data-action="addToCart" data-id="${product.id}">В корзину</button>
        <button class="products__btn products__btn--secondary" data-action="toggleFavorite" data-id="${product.id}">
          ${favorites.includes(String(product.id)) ? '★' : '☆'}
        </button>
      </div>
    </div>
  `).join('');
    // Делегирование событий
    container.onclick = (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) {
            const card = e.target.closest('.products__card');
            if (card) window.location.href = `product.html?id=${card.dataset.id}`;
            return;
        }
        const id = btn.dataset.id;
        if (btn.dataset.action === 'addToCart') addToCart(id);
        if (btn.dataset.action === 'toggleFavorite') toggleFavorite(id);
    };
}

// Категории в навигации, футере и фильтре
function renderCategories() {
    if (!catalogData) return;
    const categories = [...new Set(catalogData.products.map(p => p.category))];
    const navList = document.getElementById('categoryNav');
    const footerList = document.getElementById('footerCategories');
    const catGrid = document.getElementById('categoriesGrid');
    const filterList = document.getElementById('categoryFilters');
    const mobileNavList = document.getElementById('mobileNavList');
    const currentCategory = new URLSearchParams(window.location.search).get('category');

    // Рендер фильтра в сайдбаре
    if (filterList) {
        const counts = {};
        catalogData.products.forEach(p => counts[p.category] = (counts[p.category] || 0) + 1);
        filterList.innerHTML = `
            <li><a href="catalog.html" class="filter__link ${!currentCategory ? 'filter__link--active' : ''}">Все товары</a></li>
            ${categories.map(cat => {
            const isActive = currentCategory === cat;
            return `<li><a href="catalog.html?category=${encodeURIComponent(cat)}" class="filter__link ${isActive ? 'filter__link--active' : ''}">${cat} (${counts[cat] || 0})</a></li>`;
        }).join('')}
        `;
    }

    if (navList) navList.innerHTML = `<li class="header__nav-item"><a href="catalog.html" class="header__nav-link">Все товары</a></li>` +
        categories.map(cat => `<li class="header__nav-item"><a href="catalog.html?category=${encodeURIComponent(cat)}" class="header__nav-link">${cat}</a></li>`).join('');
    if (footerList) footerList.innerHTML = categories.map(cat => `<li><a href="catalog.html?category=${encodeURIComponent(cat)}">${cat}</a></li>`).join('');
     if (mobileNavList) mobileNavList.innerHTML = `<li><a href="catalog.html" class="header__mobile-link">Все товары</a></li>` +
         categories.map(cat => `<li><a href="catalog.html?category=${encodeURIComponent(cat)}" class="header__mobile-link">${cat}</a></li>`).join('');
    if (catGrid) {
        const counts = {};
        catalogData.products.forEach(p => counts[p.category] = (counts[p.category] || 0) + 1);
        catGrid.innerHTML = categories.map(cat => `
      <a href="catalog.html?category=${encodeURIComponent(cat)}" class="categories__card">
        <h3 class="categories__name">${cat}</h3>
        <p class="categories__count">${counts[cat] || 0} товаров</p>
      </a>
    `).join('');
    }
}

// Работа с корзиной
function addToCart(productId) {
    const product = catalogData.products.find(p => p.id == productId);
    if (!product) return;
    const id = String(productId);
    const existing = cart.find(item => item.id === id);
    existing ? existing.quantity++ : cart.push({ id, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Товар добавлен в корзину', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== String(productId));
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

function updateCartQuantity(productId, delta) {
    const item = cart.find(i => i.id === String(productId));
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) removeFromCart(productId);
    else {
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
        updateCartCount();
    }
}

function updateCartCount() {
    const total = cart.reduce((sum, i) => sum + i.quantity, 0);
    document.querySelectorAll('#cartCount').forEach(el => el.textContent = total);
}

function renderCart() {
    const itemsContainer = document.getElementById('cartItems');
    const content = document.getElementById('cartContent');
    const summary = document.getElementById('cartSummary');
    if (!itemsContainer) return;

    if (cart.length === 0) {
        itemsContainer.innerHTML = `<div class="cart__empty"><h3>Корзина пуста</h3><p>Добавьте товары для оформления заказа</p><a href="index.html" class="cart__empty-btn">Продолжить покупки</a></div>`;
        content.classList.add('cart__content--empty');
        if (summary) summary.style.display = 'none';
        return;
    }
    content.classList.remove('cart__content--empty');
    if (summary) summary.style.display = 'block';

    let total = 0, count = 0;
    itemsContainer.innerHTML = cart.map(item => {
        const product = catalogData.products.find(p => p.id == item.id);
        if (!product) return '';
        total += product.price * item.quantity;
        count += item.quantity;
        return `
      <div class="cart__item">
        <div class="cart__item-image"><img src="images/${product.image}" alt="${product.name}"></div>
        <div class="cart__item-info">
          <h3 class="cart__item-name">${product.name}</h3>
          <p class="cart__item-price">${product.price.toLocaleString()} р.</p>
        </div>
        <div class="cart__item-actions">
          <button class="cart__item-remove" onclick="removeFromCart(${product.id})">&times;</button>
          <div class="cart__quantity">
            <button class="cart__quantity-btn" onclick="updateCartQuantity(${product.id}, -1)">-</button>
            <span class="cart__quantity-value">${item.quantity}</span>
            <button class="cart__quantity-btn" onclick="updateCartQuantity(${product.id}, 1)">+</button>
          </div>
        </div>
      </div>
    `;
    }).join('');

    document.getElementById('cartItemsCount').textContent = count;
    document.getElementById('cartTotal').textContent = `${total.toLocaleString()} р.`;
    document.getElementById('cartGrandTotal').textContent = `${total.toLocaleString()} р.`;
}

// Избранное
function toggleFavorite(productId) {
    const id = String(productId);
    if (favorites.includes(id)) {
        favorites = favorites.filter(f => f !== id);
        showNotification('Удалено из избранного', 'error');
    } else {
        favorites.push(id);
        showNotification('Добавлено в избранное', 'success');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    // Перерисовать текущую сетку, если есть
    const grid = document.getElementById('productsGrid');
    if (grid) renderProductGrid(getCurrentProducts(), 'productsGrid');
}

// Вспомогательные функции
function showNotification(message, type = 'info') {
    const el = document.getElementById('notification');
    if (!el) return;
    el.textContent = message;
    el.className = `notification notification--${type} active`;
    setTimeout(() => el.className = 'notification', 3000);
}

function getCurrentProducts() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const query = urlParams.get('q');
    let products = catalogData.products;
    if (category) products = products.filter(p => p.category === category);
    if (query) products = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    return products;
}

// Поиск
function initSearch() {
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('searchBtn');
    if (!input || !btn) return;
    btn.addEventListener('click', () => {
        const q = input.value.trim();
        if (q) window.location.href = `catalog.html?q=${encodeURIComponent(q)}`;
    });
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') btn.click(); });
}

// Отображение страницы товара
function renderProductDetail() {
    const container = document.getElementById('productContent');
    const breadcrumb = document.getElementById('breadcrumbProduct');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (!productId) {
        container.innerHTML = `<div class="product-page__empty"><h3>Товар не найден</h3><p>Попробуйте выбрать товар из каталога</p><a href="catalog.html" class="products__btn products__btn--primary">Перейти в каталог</a></div>`;
        return;
    }

    const product = catalogData.products.find(p => p.id == productId);
    if (!product) {
        container.innerHTML = `<div class="product-page__empty"><h3>Товар не найден</h3><p>Такого товара нет в каталоге</p><a href="catalog.html" class="products__btn products__btn--primary">Перейти в каталог</a></div>`;
        return;
    }

    if (breadcrumb) breadcrumb.textContent = product.name;

    container.innerHTML = `
        <div class="product-page__gallery">
            <img src="images/${product.image}" alt="${product.name}" onerror="this.style.display='none'">
        </div>
        <div class="product-page__info">
            <h1 class="product-page__title">${product.name}</h1>
            <div class="product-page__price">${product.price.toLocaleString()} р.</div>
            <p class="product-page__description">${product.description}</p>
            <div class="product-page__stock" style="margin-bottom: 20px; color: ${product.stock > 0 ? '#2ecc71' : '#e74c3c'}; font-weight: 600;">
                ${product.stock > 0 ? `В наличии (${product.stock} шт.)` : 'Нет в наличии'}
            </div>
            <div class="product-page__actions">
                <button class="products__btn products__btn--primary" 
                    data-action="addToCart" data-id="${product.id}" 
                    ${product.stock <= 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                    В корзину
                </button>
                <button class="products__btn products__btn--secondary" 
                    data-action="toggleFavorite" data-id="${product.id}">
                    ${favorites.includes(String(product.id)) ? '★ В избранном' : '☆ В избранное'}
                </button>
            </div>
        </div>
    `;

    // Делегирование событий для кнопок
    const actions = container.querySelectorAll('[data-action]');
    actions.forEach(btn => {
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === 'addToCart') btn.onclick = () => addToCart(id);
        if (action === 'toggleFavorite') btn.onclick = () => {
            toggleFavorite(id);
            setTimeout(() => {
                const newState = favorites.includes(String(id));
                btn.textContent = newState ? '★ В избранном' : '☆ В избранное';
            }, 0);
        };
    });
}

// Инициализация приложения
async function init() {
    await loadCatalog();
    renderCategories();
    updateCartCount();
    initSearch();
    initBurgerMenu();

    // Страница каталога/главная: показываем товары
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) renderProductGrid(getCurrentProducts(), 'productsGrid');

    // Страница корзины
    if (location.pathname.includes('cart.html')) renderCart();

    // Страница товара
    if (location.pathname.includes('product.html')) renderProductDetail();

    // Оформление заказа
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) showNotification('Корзина пуста', 'error');
        else {
            showNotification('Заказ оформлен! Спасибо!', 'success');
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
            updateCartCount();
        }
    });
}

// Бургер-меню для мобильной версии
function initBurgerMenu() {
    const burgerBtn = document.getElementById('burgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (!burgerBtn || !mobileMenu) return;
    
    // Создаем overlay
    let overlay = document.querySelector('.header__mobile-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'header__mobile-overlay';
        document.body.appendChild(overlay);
    }
    
    function toggleMenu() {
        const isActive = burgerBtn.classList.contains('active');
        burgerBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = isActive ? '' : 'hidden';
    }
    
    burgerBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    
    // Закрываем меню при клике на ссылку
    mobileMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') toggleMenu();
    });
}

document.addEventListener('DOMContentLoaded', init);
