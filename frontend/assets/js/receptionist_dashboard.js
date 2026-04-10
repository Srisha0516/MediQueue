const token = storage.getToken();
const user = storage.getUser();

if (!token || user.role !== 'receptionist') {
    window.location.href = 'login.html';
}

const SOCKET_URL = API_URL.replace('/api', '');
const socket = io(SOCKET_URL);
socket.on('connect', () => {
    socket.emit('join', `receptionist_${user.id}`);
});

const handleCheckin = async () => {
    // Basic prompt implementation for ease of submission
    const code = prompt('Enter Patient Token Code to Check In:');
    if (!code) return;

    const res = await api.post('/reception/checkin', { tokenCode: code }, token);
    if (res.error) alert(res.error);
    else alert('Successfully Checked in! Position: ' + res.position);
};

const handleAnnouncement = async () => {
    // Simple prompt for global announcements
    const msg = prompt('Enter Global Announcement to Broadcast:');
    if (!msg) return;

    const res = await api.post('/reception/announcement', { message: msg }, token);
    if (res.error) alert(res.error);
    else alert('Announcement sent live to all screens!');
};

document.addEventListener('DOMContentLoaded', () => {
    // Bind the "New Check-in" button
    const checkBtns = document.querySelectorAll('button');
    // First button in the sidebar
    if (checkBtns[0]) checkBtns[0].addEventListener('click', handleCheckin);
    // Second button in the mobile view
    if (checkBtns[1]) checkBtns[1].addEventListener('click', handleCheckin);
});
