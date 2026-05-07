
document.addEventListener('DOMContentLoaded', () => {
    if (!location.pathname.includes('profile.html')) return;
    initProfileMenu();
    loadProfileData();
    document.getElementById('profileForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProfileData();
        showNotification('Данные сохранены', 'success');
    });
});

function initProfileMenu() {
    const links = document.querySelectorAll('.profile__menu-link[data-section]');
    const sections = document.querySelectorAll('.profile__section');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(sectionId + '-section')?.classList.add('active');
        });
    });
}

function loadProfileData() {
    const data = JSON.parse(localStorage.getItem('profileData') || '{}');
    if (data.firstName) document.getElementById('firstName').value = data.firstName;
    if (data.lastName) document.getElementById('lastName').value = data.lastName;
    if (data.email) document.getElementById('email').value = data.email;
    if (data.phone) document.getElementById('phone').value = data.phone;
    if (data.address) document.getElementById('address').value = data.address;
    updateCard(data);
}

function saveProfileData() {
    const data = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };
    localStorage.setItem('profileData', JSON.stringify(data));
    updateCard(data);
}

function updateCard(data) {
    document.getElementById('userName').textContent = `${data.firstName || 'Имя'} ${data.lastName || ''}`;
    document.getElementById('userEmail').textContent = data.email || '';
}

function showNotification(msg, type) {
    const el = document.getElementById('notification');
    if (!el) return;
    el.textContent = msg;
    el.className = `notification notification--${type} active`;
    setTimeout(() => el.className = 'notification', 3000);
}