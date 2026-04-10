const supabase = require('../config/supabase');
const { sendTurnNotification } = require('./smsService');

const updatePositions = async (doctorId, io) => {
  try {
    // 1. Get all waiting entries for the doctor
    const { data: entries, error } = await supabase
      .from('queue_entries')
      .select('*, appointments(users(name, phone))')
      .eq('doctor_id', doctorId)
      .eq('status', 'waiting')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // 2. Update positions and check for SMS triggers
    for (let i = 0; i < entries.length; i++) {
        const newPosition = i + 1;
        const entry = entries[i];

        if (entry.position !== newPosition) {
            await supabase
                .from('queue_entries')
                .update({ position: newPosition })
                .eq('id', entry.id);
            
            // Trigger SMS if position is 3
            if (newPosition === 3) {
                const user = entry.appointments.users;
                await sendTurnNotification(user.phone, user.name);
            }
        }
    }

    // 3. Notify sockets
    if (io) {
        io.to(`doctor_${doctorId}`).emit('queue:update');
        io.emit('queue:refresh');
    }
  } catch (err) {
    console.error('Queue Service Error:', err);
  }
};

module.exports = { updatePositions };
