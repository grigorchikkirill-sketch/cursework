
document.addEventListener('catalogLoaded', () => {
  if (!location.pathname.includes('favorites.html')) return;
  loadFavorites();
});

function loadFavorites() {
  const ids = JSON.parse(localStorage.getItem('favorites') || '[]');
  const grid = document.getElementById('favoritesGrid');
  const empty = document.getElementById('favoritesEmpty');
  const countEl = document.getElementById('favoritesCount');
  if (!grid) return;

  const products = (window.catalogData?.products || []).filter(p => ids.includes(String(p.id)));
  countEl.textContent = `${products.length} товаров`;

  if (products.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'block';
    return;
  }
  grid.style.display = 'grid';
  empty.style.display = 'none';

  // Используем общую функцию рендера, если она доступна, иначе создаём карточки сами
  if (typeof renderProductGrid === 'function') {
    renderProductGrid(products, 'favoritesGrid');
  } else {
    grid.innerHTML = products.map(p => `
      <div class="products__card" data-id="${p.id}" onclick="location.href='product.html?id=${p.id}'">
        <div class="products__image"><img src="images/${p.image}" alt="${p.name}"></div>
        <h3 class="products__name">${p.name}</h3>
        <p class="products__price">${p.price.toLocaleString()} р.</p>
        <div class="products__actions">
          <button class="products__btn products__btn--primary" onclick="event.stopPropagation(); addToCart('${p.id}')">В корзину</button>
        </div>
      </div>
    `).join('');
  }
}