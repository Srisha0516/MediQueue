const supabase = require('../config/supabase');
const { triageSymptoms } = require('../services/aiService');
const QRCode = require('qrcode');

const getDepartments = async (req, res) => {
  try {
    const { data, error } = await supabase.from('departments').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDoctors = async (req, res) => {
  const { departmentId } = req.query;
  try {
    let query = supabase.from('doctors').select('*, users(name)').eq('users.role', 'doctor');
    if (departmentId) query = query.eq('department_id', departmentId);
    
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const bookAppointment = async (req, res) => {
  const { doctorId, date, symptoms } = req.body;
  const patientId = req.user.id;

  try {
    // 1. Triage with AI
    const aiSuggestion = await triageSymptoms(symptoms);

    // 2. Prevent double booking (simplified: check if patient already has an active appointment for this doctor on this day)
    const { data: existing } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .not('status', 'eq', 'done');

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'You already have an appointment booked for this doctor on this day.' });
    }

    // 3. Generate Token Code
    const tokenCode = `MQ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const qrCodeUrl = await QRCode.toDataURL(tokenCode);

    // 4. Create Appointment
    const { data: appointment, error: appError } = await supabase
      .from('appointments')
      .insert([{ 
        patient_id: patientId, 
        doctor_id: doctorId, 
        appointment_date: date, 
        symptoms, 
        ai_suggestion: aiSuggestion,
        token_code: tokenCode,
        qr_code_url: qrCodeUrl
      }])
      .select()
      .single();

    if (appError) throw appError;

    res.status(201).json({
      appointmentId: appointment.id,
      aiSuggestion,
      qrCodeUrl,
      tokenCode
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getQueueStatus = async (req, res) => {
  const patientId = req.user.id;
  try {
    const { data, error } = await supabase
      .from('queue_entries')
      .select('*, appointments!inner(*), doctors!inner(*, users(name))')
      .eq('appointments.patient_id', patientId)
      .eq('status', 'waiting')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'No active queue entry found' });
    }

    res.json({
      tokenNumber: data.token_number,
      position: data.position,
      estimatedWait: data.position * 15, // Mock: 15 mins per patient
      doctorName: data.doctors.users.name
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getDepartments, getDoctors, bookAppointment, getQueueStatus };
