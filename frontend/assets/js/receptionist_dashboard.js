const token = storage.getToken();
const user = storage.getUser();

if (!token || user.role !== 'receptionist') {
    window.location.href = 'login.html';
}

const handleCheckin = async () => {
    const code = prompt('Enter Patient Token Code:');
    if (!code) return;

    const res = await api.post('/reception/checkin', { tokenCode: code }, token);
    if (res.error) alert(res.error);
    else alert('Checked in! Position: ' + res.position);
};

const handleAnnouncement = async () => {
    const msg = prompt('Enter Announcement Message:');
    if (!msg) return;

    const res = await api.post('/reception/announcement', { message: msg }, token);
    if (res.error) alert(res.error);
    else alert('Announcement sent!');
};

document.addEventListener('DOMContentLoaded', () => {
    const checkinBtn = document.querySelector('button:contains("Check-in")') || document.querySelector('.bg-primary');
    if (checkinBtn) checkinBtn.addEventListener('click', handleCheckin);
    
    // Add logic for walk-ins and reordering as needed
});
