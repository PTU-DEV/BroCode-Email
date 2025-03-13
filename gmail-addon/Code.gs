/**
 * Builds the add-on's card for the current email.
 * @param {Object} e The event object.
 * @return {Card} The card to show to the user.
 */
function buildAddOn(e) {
  const accessToken = e.messageMetadata.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);
  const messageId = e.messageMetadata.messageId;
  const message = GmailApp.getMessageById(messageId);
  
  // Extract email data
  const emailData = {
    sender: message.getFrom(),
    subject: message.getSubject(),
    content: message.getPlainBody(),
    links: extractLinks(message.getBody()),
    attachments: message.getAttachments().map(att => att.getName())
  };
  
  // Analyze email using our API
  const analysis = analyzeEmail(emailData);
  
  // Build the card
  const card = CardService.newCardBuilder();
  
  // Header
  card.setHeader(CardService.newCardHeader()
    .setTitle('PhishingShield AI')
    .setImageUrl('https://res.cloudinary.com/mcnoble/image/upload/v1731327309/shield_c3wcde.png'));
  
  // Analysis section
  const analysisSection = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph()
      .setText('Threat Analysis Results:'));
  
  const threatLevel = analysis.isPhishing ? 'High Risk' : 'Low Risk';
  const threatColor = analysis.isPhishing ? '#C53030' : '#48BB78';
  
  analysisSection.addWidget(CardService.newTextParagraph()
    .setText(`Threat Level: <font color="${threatColor}"><b>${threatLevel}</b></font>`));
  
  analysisSection.addWidget(CardService.newTextParagraph()
    .setText(`Confidence: ${analysis.confidence}%`));
  
  analysisSection.addWidget(CardService.newTextParagraph()
    .setText(`Analysis: ${analysis.explanation}`));
  
  // Recommendations section
  const recSection = CardService.newCardSection()
    .setHeader('Recommendations');
  
  analysis.recommendations.forEach(rec => {
    recSection.addWidget(CardService.newTextParagraph().setText('• ' + rec));
  });
  
  // Actions section
  const actionSection = CardService.newCardSection();
  
  if (analysis.isPhishing) {
    actionSection.addWidget(CardService.newButtonSet()
      .addButton(CardService.newTextButton()
        .setText('Block Sender')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('blockSender')
          .setParameters({sender: emailData.sender})))
      .addButton(CardService.newTextButton()
        .setText('Report Phishing')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('reportPhishing')
          .setParameters({messageId: messageId}))));
  }
  
  // Add all sections to card
  card.addSection(analysisSection)
     .addSection(recSection)
     .addSection(actionSection);
  
  return card.build();
}

/**
 * Extracts links from HTML content
 * @param {string} html The HTML content
 * @return {Array} Array of links
 */
function extractLinks(html) {
  const links = [];
  const regex = /href=["'](https?:\/\/[^"']+)["']/g;
  let match;
  
  while ((match = regex.exec(html)) !== null) {
    links.push(match[1]);
  }
  
  return links;
}

/**
 * Analyzes email using our API
 * @param {Object} emailData The email data to analyze
 * @return {Object} Analysis results
 */
function analyzeEmail(emailData) {
  // Replace with your deployed API endpoint
  const apiUrl = PropertiesService.getScriptProperties().getProperty('API_ENDPOINT');
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    payload: JSON.stringify(emailData),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(apiUrl, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      return JSON.parse(response.getContentText());
    } else {
      console.error('API Error:', response.getContentText());
      return {
        isPhishing: false,
        confidence: 0,
        explanation: 'Error analyzing email',
        recommendations: ['Unable to complete analysis']
      };
    }
  } catch (error) {
    console.error('API Error:', error);
    return {
      isPhishing: false,
      confidence: 0,
      explanation: 'Error analyzing email',
      recommendations: ['Unable to complete analysis']
    };
  }
}

/**
 * Blocks a sender
 * @param {Object} e The event object
 * @return {ActionResponse} The action response
 */
function blockSender(e) {
  const sender = e.parameters.sender;
  // Implement sender blocking logic
  
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification()
      .setText('Sender blocked successfully'))
    .build();
}

/**
 * Reports a phishing email
 * @param {Object} e The event object
 * @return {ActionResponse} The action response
 */
function reportPhishing(e) {
  const messageId = e.parameters.messageId;
  // Implement phishing reporting logic
  
  return CardService.newActionResponseBuilder()
    .setNotification(CardService.newNotification()
      .setText('Email reported as phishing'))
    .build();
}

/**
 * Shows the settings card
 * @param {Object} e The event object
 * @return {Card} The settings card
 */
function showSettings(e) {
  const card = CardService.newCardBuilder();
  
  card.setHeader(CardService.newCardHeader()
    .setTitle('PhishingShield Settings'));
  
  const section = CardService.newCardSection()
    .addWidget(CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.CHECK_BOX)
      .setFieldName('settings')
      .addItem('Auto-scan all emails', 'autoScan', true)
      .addItem('Show warning banners', 'showWarnings', true)
      .addItem('Block suspicious senders', 'blockSuspicious', false));
  
  card.addSection(section);
  
  return card.build();
}