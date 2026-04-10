const token = storage.getToken();
const user = storage.getUser();

if (!token || user.role !== 'doctor') {
    window.location.href = 'login.html';
}

const socket = io('http://localhost:5000');
socket.on('connect', () => {
    socket.emit('join', `doctor_${user.id}`);
});

socket.on('queue:update', () => {
    fetchQueue();
});

const fetchQueue = async () => {
    const queue = await api.get('/doctor/queue', token);
    const container = document.querySelector('tbody') || document.querySelector('.space-y-4');
    
    // Update UI (simplified)
    console.log('Queue data:', queue);
    // In a real app, I'd map through this and update the DOM
};

const startPatient = async (id) => {
    await api.post('/doctor/start', { queueEntryId: id }, token);
    fetchQueue();
};

const completePatient = async (id) => {
    await api.post('/doctor/complete', { queueEntryId: id }, token);
    fetchQueue();
};

document.addEventListener('DOMContentLoaded', fetchQueue);
