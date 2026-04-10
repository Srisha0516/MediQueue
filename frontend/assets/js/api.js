const API_URL = 'http://localhost:5000/api';

const api = {
    async get(endpoint, token) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    },

    async post(endpoint, data, token) {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        return response.json();
    }
};

const storage = {
    setToken(token) { localStorage.setItem('mq_token', token); },
    getToken() { return localStorage.getItem('mq_token'); },
    setUser(user) { localStorage.setItem('mq_user', JSON.stringify(user)); },
    getUser() { return JSON.parse(localStorage.getItem('mq_user')); },
    logout() {
        localStorage.removeItem('mq_token');
        localStorage.removeItem('mq_user');
        window.location.href = 'login.html';
    }
};
