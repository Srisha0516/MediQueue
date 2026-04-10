const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder_key',
});

const triageSymptoms = async (symptoms) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return "Based on your symptoms, we recommend visiting the General Medicine department. (AI Mock Response)";
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      system: "You are a medical triage assistant. Analyze symptoms and suggest the most appropriate hospital department (e.g., Cardiology, Dermatology, Pediatrics, General Medicine). Keep it concise.",
      messages: [{ role: "user", content: `Symptoms: ${symptoms}` }],
    });

    return response.content[0].text;
  } catch (err) {
    console.error('Claude API Error:', err);
    return "Difficulty processing triage. Please proceed to General Consultation.";
  }
};

module.exports = { triageSymptoms };
