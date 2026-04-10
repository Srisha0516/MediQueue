const token = storage.getToken();
const user = storage.getUser();

if (!token || user.role !== 'patient') {
    window.location.href = 'login.html';
}

const SOCKET_URL = API_URL.replace('/api', '');
const socket = io(SOCKET_URL);
socket.on('connect', () => {
    socket.emit('join', `patient_${user.id}`);
});

socket.on('queue:refresh', () => {
    fetchStatus();
});

const loadFormOptions = async () => {
    const docRes = await api.get('/patient/doctors', token);
    const doctorSelect = document.querySelectorAll('select')[1];
    if (doctorSelect && !docRes.error && Array.isArray(docRes)) {
        doctorSelect.innerHTML = '<option value="">Select Doctor</option>' + 
            docRes.map(d => `<option value="${d.id}">${d.user ? d.user.name : d.id}</option>`).join('');
    }
};

const fetchStatus = async () => {
    const status = await api.get('/patient/queue-status', token);
    if (!status.error) {
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
    const btn = e.target;

    if (!doctorId) {
        alert("Please select a doctor.");
        return;
    }
    
    btn.textContent = "Booking...";
    btn.disabled = true;

    try {
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
            fetchStatus();
        }
    } catch(err) {
        alert('Booking failed');
    } finally {
        btn.textContent = "Confirm Appointment";
        btn.disabled = false;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadFormOptions();
    fetchStatus();
    const btn = document.querySelector('form button');
    if (btn) btn.addEventListener('click', handleBooking);
});

// Sidebar Mockup Handling
document.querySelectorAll('aside nav a').forEach(link => { link.addEventListener('click', (e) => { e.preventDefault(); alert('This module will be available in Phase 2 of the MediQueue deployment. Please stick to Dashboard and Queue flows for this demo.'); }); });
