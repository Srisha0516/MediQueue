const token = storage.getToken();
const user = storage.getUser();

if (!token || user.role !== 'doctor') {
    window.location.href = 'login.html';
}

const SOCKET_URL = API_URL.replace('/api', '');
const socket = io(SOCKET_URL);
socket.on('connect', () => {
    socket.emit('join', `doctor_${user.id}`);
});

socket.on('queue:update', () => {
    fetchQueue();
});

const fetchQueue = async () => {
    const queue = await api.get('/doctor/queue', token);
    const container = document.querySelector('.space-y-3');
    
    if (!container) return; // Wait for DOM if error

    if (queue.error) {
        console.error("Failed to fetch queue", queue.error);
        return;
    }

    // Update Stats
    const totalPatientsEl = document.querySelectorAll('.text-5xl.font-black')[0];
    if (totalPatientsEl) totalPatientsEl.textContent = queue.length;

    let inConsultation = queue.find(q => q.status === 'in_consultation');
    const currentNameEl = document.querySelector('.text-3xl.font-black');
    const currentTokenEl = document.querySelector('.text-4xl.font-black');
    
    if (inConsultation) {
        if(currentNameEl) currentNameEl.textContent = inConsultation.patientName;
        if(currentTokenEl) currentTokenEl.textContent = '#' + String(inConsultation.tokenNumber).padStart(3, '0');
    } else {
        if(currentNameEl) currentNameEl.textContent = "No Active Patient";
        if(currentTokenEl) currentTokenEl.textContent = "---";
    }

    // Render Queue Items
    container.innerHTML = queue.map(q => {
        const isCurrent = q.status === 'in_consultation';
        return `
        <div class="bg-surface-container-lowest p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${isCurrent ? 'border-2 border-primary/20 shadow-sm' : 'hover:bg-surface-container-low transition-colors group'}">
            <div class="flex items-center gap-5">
                <div class="w-14 h-14 rounded-full ${isCurrent ? 'bg-primary-fixed text-primary' : 'bg-surface-container-high text-on-surface-variant'} flex items-center justify-center font-black text-xl font-headline">
                    ${q.tokenNumber}
                </div>
                <div>
                    <h4 class="text-lg font-bold text-on-surface leading-tight">${q.patientName}</h4>
                    <div class="flex items-center gap-3 mt-1">
                        <span class="text-xs font-medium text-on-surface-variant flex items-center gap-1">
                            <span class="material-symbols-outlined text-xs">vaccines</span> General Checkup
                        </span>
                        <span class="px-3 py-1 rounded-full ${isCurrent ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary-fixed text-on-primary-fixed'} text-[10px] font-black uppercase tracking-wider">${q.status.replace('_', ' ')}</span>
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-3">
                ${isCurrent 
                    ? `<button onclick="completePatient('${q.queueEntryId}')" class="flex-1 md:flex-none px-6 py-3 rounded-xl bg-surface-container-highest text-on-surface font-bold text-sm hover:bg-surface-container-high transition-all">Mark as Done</button>`
                    : `<button onclick="startPatient('${q.queueEntryId}')" class="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-sm shadow-md shadow-primary/20 hover:scale-[1.02] transition-all">Start Consultation</button>`
                }
            </div>
        </div>`;
    }).join('') || '<p class="text-on-surface-variant font-medium">No patients in queue today.</p>';
};

window.startPatient = async (id) => {
    await api.post('/doctor/start', { queueEntryId: id }, token);
    fetchQueue();
};

window.completePatient = async (id) => {
    await api.post('/doctor/complete', { queueEntryId: id }, token);
    fetchQueue();
};

document.addEventListener('DOMContentLoaded', fetchQueue);

// Sidebar Mockup Handling
document.querySelectorAll('aside nav a').forEach(link => { link.addEventListener('click', (e) => { e.preventDefault(); alert('This module will be available in Phase 2 of the MediQueue deployment. Please stick to Dashboard and Queue flows for this demo.'); }); });
