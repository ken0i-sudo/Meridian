const API_URL = 'http://localhost:5000/api';

(async function() {
    'use strict';

    // 1. Check if user is logged in
    try {
        const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
        if (!res.ok) {
            window.location.href = 'index.html'; // Redirect if not logged in
            return;
        }
    } catch (err) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Setup Logout Button
    const navAuth = document.getElementById('navAuth');
    navAuth.innerHTML = `<button id="logoutBtn" class="btn btn-ghost">Logout</button>`;
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
        window.location.href = 'index.html';
    });

    // 3. Fetch Contact Data
    try {
        const res = await fetch(`${API_URL}/contact`, { credentials: 'include' });
        const data = await res.json();
        
        const tbody = document.getElementById('contactsTableBody');
        if (data.data && data.data.length > 0) {
            tbody.innerHTML = data.data.map(c => `
                <tr>
                    <td>${c.name}</td>
                    <td>${c.email}</td>
                    <td>${c.message.substring(0, 50)}...</td>
                    <td><span class="status-badge">${c.status}</span></td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="4">No contacts found.</td></tr>';
        }
    } catch (err) {
        console.error('Failed to load contacts', err);
    }
})();
