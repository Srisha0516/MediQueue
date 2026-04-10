const supabase = require('../config/supabase');
const { updatePositions } = require('../services/queueService');

const getQueue = async (req, res) => {
  const doctorId = req.user.id; // Correctly this should be the doctor record ID, not user ID.
  try {
    // First, find the doctor record associated with this user
    const { data: doctor } = await supabase.from('doctors').select('id').eq('user_id', doctorId).single();
    if (!doctor) return res.status(404).json({ error: 'Doctor profile not found' });

    const { data, error } = await supabase
      .from('queue_entries')
      .select('*, appointments(patient_id, users(name))')
      .eq('doctor_id', doctor.id)
      .neq('status', 'done')
      .order('position', { ascending: true });

    if (error) throw error;

    const formattedQueue = data.map(entry => ({
      queueEntryId: entry.id,
      patientName: entry.appointments.users.name,
      tokenNumber: entry.token_number,
      status: entry.status,
      position: entry.position
    }));

    res.json(formattedQueue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const startConsultation = async (req, res) => {
  const { queueEntryId } = req.body;
  try {
    const { data, error } = await supabase
      .from('queue_entries')
      .update({ status: 'in_consultation' })
      .eq('id', queueEntryId)
      .select();

    if (error) throw error;
    res.json({ message: 'Consultation started', entry: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const completeConsultation = async (req, res) => {
  const { queueEntryId } = req.body;
  const io = req.app.get('io');

  try {
    // 1. Mark as done
    const { data: completedEntry, error } = await supabase
      .from('queue_entries')
      .update({ status: 'done' })
      .eq('id', queueEntryId)
      .select('doctor_id')
      .single();

    if (error) throw error;

    // 2. Automatically reorder remaining queue using central service
    await updatePositions(completedEntry.doctor_id, io);

    res.json({ message: 'Consultation completed and queue updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSummary = async (req, res) => {
  const userId = req.user.id;
  try {
    const { data: doctor } = await supabase.from('doctors').select('id').eq('user_id', userId).single();
    
    const { data: donePatients } = await supabase
      .from('queue_entries')
      .select('count', { count: 'exact' })
      .eq('doctor_id', doctor.id)
      .eq('status', 'done');

    res.json({
      totalPatients: donePatients.length,
      avgConsultTime: 12, // Mocked
      noShows: 2 // Mocked
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getQueue, startConsultation, completeConsultation, getSummary };
