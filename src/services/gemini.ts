// import { GoogleGenerativeAI } from '@google/generative-ai';

// const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// export async function analyzeEmail(emailData: EmailData): Promise<ScanResult> {
//   const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

//   const prompt = `
//     Analyze this email for phishing indicators:
//     From: ${emailData.sender}
//     Subject: ${emailData.subject}
//     Content: ${emailData.content}
//     Links: ${emailData.links.join(', ')}
//     Attachments: ${emailData.attachments.join(', ')}

//     Provide a detailed analysis including:
//     1. Is this likely a phishing attempt?
//     2. Confidence level (0-100)
//     3. Explanation of findings
//     4. Security recommendations
//   `;

//   const result = await model.generateContent(prompt);
//   const response = await result.response;
//   const text = response.text();
//   console.log(text);
//   // Parse the AI response and structure it
//   // This is a simplified example - in production you'd want more robust parsing
//   return {
//     isPhishing: text.toLowerCase().includes('phishing'),
//     confidence: 85, // You'd extract this from the AI response
//     explanation: text.split('\n')[0],
//     recommendations: text.split('\n').slice(1)
//   };
// }

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { EmailData, ScanResult } from '../types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function analyzeEmail(emailData: EmailData): Promise<ScanResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    You are an expert email security analyst. Analyze this email for phishing indicators and provide a detailed security assessment.
    
    EMAIL DETAILS:
    From: ${emailData.sender}
    Subject: ${emailData.subject}
    Content: ${emailData.content}
    Links: ${emailData.links.join(', ')}
    Attachments: ${emailData.attachments.join(', ')}

    Analyze the email and return ONLY a JSON object in this exact format, with no markdown or other text:
    {
      "isPhishing": boolean (true/false based on comprehensive analysis),
      "confidence": number (0-100, based on certainty of assessment),
      "riskFactors": [list of specific risk factors found],
      "explanation": [list of explanation of findings],
      "recommendations": [list of specific security recommendations]
    }

    Consider these factors in your analysis:
    1. Sender legitimacy (domain spoofing, display name tricks)
    2. Urgency or pressure tactics
    3. Grammar and spelling errors
    4. Mismatched or suspicious URLs
    5. Unusual attachment types
    6. Request for sensitive information
    7. Impersonation attempts
    8. Technical indicators (header anomalies, link manipulation)

    Provide high confidence (90-100) only when multiple strong indicators are present.
    Provide medium confidence (60-89) when some indicators are present but not conclusive.
    Provide low confidence (0-59) when few or no indicators are present.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    // Extract JSON from the response by removing any markdown formatting
    const jsonStr = text.replace(/```json\n?|\n?```/gi, '').trim();
    
    // Parse the JSON response
    const analysis = JSON.parse(jsonStr);

     // Validate the response structure
     if (!analysis || typeof analysis.isPhishing !== 'boolean' || 
      !Array.isArray(analysis.riskFactors) || !Array.isArray(analysis.recommendations)) {
    throw new Error('Invalid response format from Gemini');
  }

    return {
      isPhishing: analysis.isPhishing,
      confidence: analysis.confidence,
      explanation: analysis.explanation,
      recommendations: analysis.recommendations,
      riskFactors: analysis.riskFactors
    };
  } catch (error) {
    console.error('Error analyzing email:', error);
    // Provide a fallback response in case of parsing errors
    return {
      isPhishing: false,
      confidence: 0,
      explanation: 'Unable to analyze email due to technical issues.',
      recommendations: ['Please try analyzing the email again.'],
      riskFactors: ['Analysis failed']
    };
  }
}



export async function analyzeWorkload(workloadData: WorkloadData): Promise<ScanResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
    Analyze this cloud workload for security threats:
    IP: ${workloadData.ipAddress}
    Domain: ${workloadData.domain}
    Traffic Pattern: ${workloadData.trafficPattern}
    Payload: ${workloadData.payload}

    Provide a security analysis including:
    1. Is this likely a threat?
    2. Confidence level (0-100)
    3. Detailed explanation
    4. Mitigation recommendations
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return {
    isPhishing: text.toLowerCase().includes('threat'),
    confidence: 90,
    explanation: text.split('\n')[0],
    recommendations: text.split('\n').slice(1)
  };
}
