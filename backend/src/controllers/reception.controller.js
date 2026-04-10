const supabase = require('../config/supabase');
const { updatePositions } = require('../services/queueService');

const checkin = async (req, res) => {
  const { tokenCode } = req.body;
  const io = req.app.get('io');

  try {
    // 1. Find appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select('id, doctor_id, patient_id')
      .eq('token_code', tokenCode)
      .single();

    if (error || !appointment) return res.status(404).json({ error: 'Invalid token code' });

    // 2. Mark as checked_in
    await supabase.from('appointments').update({ status: 'checked_in' }).eq('id', appointment.id);

    // 3. Add to queue_entries
    const { data: lastEntry } = await supabase
      .from('queue_entries')
      .select('position, token_number')
      .eq('doctor_id', appointment.doctor_id)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const nextPosition = (lastEntry?.position || 0) + 1;
    const nextTokenNumber = (lastEntry?.token_number || 0) + 1;

    await supabase.from('queue_entries').insert([{
      appointment_id: appointment.id,
      doctor_id: appointment.doctor_id,
      token_number: nextTokenNumber,
      position: nextPosition,
      status: 'waiting'
    }]);

    await updatePositions(appointment.doctor_id, io);
    res.json({ message: 'Patient checked in successfully', position: nextPosition });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const walkin = async (req, res) => {
  const { name, phone, doctorId } = req.body;
  const io = req.app.get('io');

  try {
    // 1. Create a placeholder patient user if not exists or just handle it as a guest
    // For simplicity, we'll assume the receptionist creates a temporary patient
    const tempEmail = `walkin_${Date.now()}@mediqueue.tmp`;
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{ name, email: tempEmail, phone, password_hash: 'walkin', role: 'patient' }])
      .select()
      .single();

    if (userError) throw userError;

    // 2. Create appointment
    const tokenCode = `WK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const { data: appointment } = await supabase
      .from('appointments')
      .insert([{ 
        patient_id: user.id, 
        doctor_id: doctorId, 
        appointment_date: new Date().toISOString().split('T')[0], 
        status: 'checked_in', 
        token_code: tokenCode 
      }])
      .select()
      .single();

    // 3. Add to queue
    const { data: lastEntry } = await supabase
      .from('queue_entries')
      .select('position, token_number')
      .eq('doctor_id', doctorId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const nextPosition = (lastEntry?.position || 0) + 1;
    const nextTokenNumber = (lastEntry?.token_number || 0) + 1;

    await supabase.from('queue_entries').insert([{
      appointment_id: appointment.id,
      doctor_id: doctorId,
      token_number: nextTokenNumber,
      position: nextPosition,
      status: 'waiting'
    }]);

    await updatePositions(doctorId, io);
    res.json({ message: 'Walk-in added', tokenCode, position: nextPosition });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const reorder = async (req, res) => {
  const { doctorId, updatedQueue } = req.body; 
  // updatedQueue: [{id: 'entry_id', position: 1}, ...]
  const io = req.app.get('io');

  try {
    for (const item of updatedQueue) {
      await supabase
        .from('queue_entries')
        .update({ position: item.position })
        .eq('id', item.id);
    }
    io.to(`doctor_${doctorId}`).emit('queue:update');
    res.json({ message: 'Queue reordered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const announcement = async (req, res) => {
  const { message } = req.body;
  const io = req.app.get('io');

  try {
    await supabase.from('announcements').insert([{ message, sender_id: req.user.id }]);
    io.emit('announcement:new', { message, timestamp: new Date() });
    res.json({ message: 'Announcement broadcasted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { checkin, walkin, reorder, announcement };
