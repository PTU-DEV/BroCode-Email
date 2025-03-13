import { analyzeEmail } from '../src/services/gemini';

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Configure as needed
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  }

  try {
    // Parse the request body
    const emailData = JSON.parse(event.body);

    // Analyze the email
    const result = await analyzeEmail(emailData);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Configure as needed
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  } catch (error) {
    console.error('Error analyzing email:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Analysis failed',
        isPhishing: false,
        confidence: 0,
        explanation: 'Unable to analyze email',
        recommendations: ['Please try again later'],
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Configure as needed
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  }
};