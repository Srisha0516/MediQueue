const token = storage.getToken();
const user = storage.getUser();

if (!token || user.role !== 'patient') {
    window.location.href = 'login.html';
}

const socket = io('http://localhost:5000');
socket.on('connect', () => {
    socket.emit('join', `patient_${user.id}`);
});

socket.on('queue:refresh', () => {
    fetchStatus();
});

const fetchStatus = async () => {
    const status = await api.get('/patient/queue-status', token);
    if (!status.error) {
        // Update UI elements matching patient.html
        const posEl = document.querySelector('.text-6xl');
        if (posEl) posEl.textContent = String(status.position).padStart(2, '0');
        
        const waitEl = document.querySelector('.text-3xl.font-extrabold.font-headline');
        if (waitEl) waitEl.childNodes[0].textContent = status.estimatedWait + ' ';
    }
};

const handleBooking = async (e) => {
    e.preventDefault();
    const doctorId = document.querySelectorAll('select')[1].value;
    const date = document.querySelector('input[type="date"]').value;
    const symptoms = document.querySelector('textarea').value;

    const res = await api.post('/patient/appointments', { doctorId, date, symptoms }, token);
    if (res.error) {
        alert(res.error);
    } else {
        alert('Booked! Token: ' + res.tokenCode);
        const qrImg = document.querySelector('img[alt="Appointment QR Code"]');
        if (qrImg) {
            qrImg.src = res.qrCodeUrl;
            qrImg.classList.remove('opacity-10');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    fetchStatus();
    const btn = document.querySelector('form button');
    if (btn) btn.addEventListener('click', handleBooking);
});
