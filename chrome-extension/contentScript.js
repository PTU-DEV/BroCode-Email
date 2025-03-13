// Import Gemini AI library
const script = document.createElement('script');
script.src = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro';
document.head.appendChild(script);

// Initialize Gemini AI using the config
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Inject warning banner styles
const style = document.createElement('style');
style.textContent = `
  .phishing-warning {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #fed7d7;
    color: #c53030;
    padding: 12px;
    text-align: center;
    z-index: 9999;
    font-family: -apple-system, system-ui, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .warning-icon {
    width: 20px;
    height: 20px;
  }

  .warning-actions {
    margin-left: 16px;
  }

  .warning-btn {
    margin-left: 8px;
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  .warning-btn.block {
    background: #c53030;
    color: white;
  }

  .warning-btn.block:hover {
    background: #9b2c2c;
  }

  .warning-btn.trust {
    background: white;
    border: 1px solid #c53030;
    color: #c53030;
  }

  .warning-btn.trust:hover {
    background: #fff5f5;
  }
`;
document.head.appendChild(style);

let settings = {
  enabled: true,
  autoScan: true,
  showWarnings: true
};

// Load settings
chrome.storage.sync.get(['settings'], (result) => {
  if (result.settings) {
    settings = { ...settings, ...result.settings };
  }
});

// Listen for settings changes
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleProtection') {
    settings.enabled = request.enabled;
    sendResponse({ success: true });
    return true;
  }
});

// Extract email data from Gmail interface
function extractEmailData() {
  const emailContainer = document.querySelector('.gs');
  if (!emailContainer) return null;

  const sender = emailContainer.querySelector('.gD')?.getAttribute('email') || '';
  const subject = emailContainer.querySelector('.hP')?.textContent || '';
  const content = emailContainer.querySelector('.a3s')?.textContent || '';
  
  // Extract links
  const links = Array.from(emailContainer.querySelectorAll('a'))
    .map(a => a.href)
    .filter(href => href?.startsWith('http') || false);

  // Extract attachments
  const attachments = Array.from(emailContainer.querySelectorAll('.aZo'))
    .map(att => att.getAttribute('download'))
    .filter(Boolean);

  return {
    sender,
    subject,
    content,
    links,
    attachments
  };
}

// Scan email using Gemini AI
async function scanEmail(emailData) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Analyze this email for phishing indicators:
      From: ${emailData.sender}
      Subject: ${emailData.subject}
      Content: ${emailData.content}
      Links: ${emailData.links.join(', ')}
      Attachments: ${emailData.attachments.join(', ')}

      Provide a detailed analysis including:
      1. Is this likely a phishing attempt?
      2. Confidence level (0-100)
      3. Explanation of findings
      4. Security recommendations
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse AI response
    return {
      isPhishing: text.toLowerCase().includes('phishing'),
      confidence: text.toLowerCase().includes('high confidence') ? 90 : 70,
      explanation: text.split('\n')[0],
      recommendations: text.split('\n').slice(1).filter(Boolean)
    };
  } catch (error) {
    console.error('Error scanning email:', error);
    return null;
  }
}

// Show warning banner
function showWarningBanner(result) {
  const banner = document.createElement('div');
  banner.className = 'phishing-warning';
  banner.innerHTML = `
    <svg class="warning-icon" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
    </svg>
    <span>
      <strong>Warning:</strong> ${result.explanation}
      <br>
      <small>Confidence: ${result.confidence}%</small>
    </span>
    <div class="warning-actions">
      <button class="warning-btn block">Block Sender</button>
      <button class="warning-btn trust">Trust Email</button>
    </div>
  `;
  
  document.body.prepend(banner);
  
  // Handle button clicks
  banner.querySelector('.block').addEventListener('click', () => {
    chrome.runtime.sendMessage({
      action: 'updateStats',
      threatsBlocked: 1
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error updating stats:', chrome.runtime.lastError);
      }
      banner.remove();
    });
  });
  
  banner.querySelector('.trust').addEventListener('click', () => {
    banner.remove();
  });
}

// Monitor for new emails
const observer = new MutationObserver(async (mutations) => {
  if (!settings.enabled || !settings.autoScan) return;
  
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(async node => {
      if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('gs')) {
        const emailData = extractEmailData();
        if (emailData) {
          chrome.runtime.sendMessage({
            action: 'updateStats',
            emailsScanned: 1
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error updating stats:', chrome.runtime.lastError);
            }
          });

          const result = await scanEmail(emailData);
          if (result && result.isPhishing && settings.showWarnings) {
            showWarningBanner(result);
          }
        }
      }
    });
  });
});

// Start observing Gmail interface
observer.observe(document.body, {
  childList: true,
  subtree: true
});