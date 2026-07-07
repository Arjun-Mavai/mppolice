import { NextResponse } from 'next/server';
import { saveIncomingMessage, saveOutgoingMessage } from '@/actions/support-inbox-actions';
import { sendTelegramNotification } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const BOT_TOKEN = process.env.TELEGRAM_CONVERSATION_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

    if (!BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN not found');
      return new NextResponse('OK', { status: 200 }); // Return 200 so Telegram stops retrying
    }

    const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    let chatId = null;
    let responseText = '';
    let inlineKeyboard = null;
    
    // For DB tracking
    let incomingText = '';
    let guestName = 'Telegram User';
    let callbackData = null;
    let isCommandOrText = false;

    // 1. Extract Info First
    if (body.message && body.message.text) {
      chatId = body.message.chat.id;
      incomingText = body.message.text;
      isCommandOrText = true;
      if (body.message.from && body.message.from.first_name) {
        guestName = body.message.from.first_name + (body.message.from.last_name ? ' ' + body.message.from.last_name : '');
      }
    } else if (body.callback_query) {
      chatId = body.callback_query.message.chat.id;
      callbackData = body.callback_query.data;
      incomingText = `[Button Clicked: ${callbackData}]`;
      if (body.callback_query.from && body.callback_query.from.first_name) {
        guestName = body.callback_query.from.first_name;
      }
    }

    if (!chatId || !incomingText) {
      return new NextResponse('OK', { status: 200 });
    }

    // 2. DB: Save Incoming Message
    let convId = null;
    let humanActive = false;
    const res = await saveIncomingMessage({
      platform: 'telegram',
      guestPhone: chatId.toString(), // Using chatId as phone equivalent
      guestName: guestName,
      text: incomingText,
    });
    convId = res.conversationId;
    humanActive = !!res.humanActive;

    // 3. Bot Suppression (if Human is Active)
    if (humanActive && !callbackData?.startsWith('FDBK_')) {
      return new NextResponse('OK', { status: 200 }); // Skip bot processing entirely
    }

    // 4. Generate Bot Response
    if (isCommandOrText) {
      const text = incomingText.trim().toLowerCase();

      if (text === '/start' || text === '/help') {
        responseText = `🎉 *Welcome to MP Police Constable Hub*\n\n` +
          `क्या आप MP Police Constable परीक्षा की तैयारी कर रहे हैं?\n` +
          `हम आपकी तैयारी को और भी बेहतर बनाने के लिए यहाँ हैं।\n\n` +
          `कृपया नीचे दिए गए विकल्पों में से चुनें: 👇`;
        inlineKeyboard = {
          inline_keyboard: [
            [{ text: '👮 MP Constable क्या है?', callback_data: 'INFO_EXAM' }],
            [{ text: '🎁 हम क्या प्रदान कर रहे हैं?', callback_data: 'INFO_PROVIDE' }],
            [{ text: '💬 Support Desk (Chat with us)', callback_data: 'SUPPORT' }]
          ]
        };
      } else {
        responseText = `🎉 *Welcome to MP Police Constable Hub*\n\n` +
          `कृपया नीचे दिए गए विकल्पों में से चुनें: 👇`;
        inlineKeyboard = {
          inline_keyboard: [
            [{ text: '👮 MP Constable क्या है?', callback_data: 'INFO_EXAM' }],
            [{ text: '🎁 हम क्या प्रदान कर रहे हैं?', callback_data: 'INFO_PROVIDE' }],
            [{ text: '💬 Support Desk (Chat with us)', callback_data: 'SUPPORT' }]
          ]
        };
      }
    } 
    else if (callbackData) {
      const data = callbackData;

      if (data === 'INFO_EXAM') {
        responseText = `👮 *MP Police Constable Exam*\n\n` +
          `MP Police Constable परीक्षा मध्य प्रदेश व्यावसायिक परीक्षा मंडल (MPPEB) द्वारा आयोजित की जाती है।\n` +
          `यह राज्य पुलिस बल में कांस्टेबल (GD और Radio) के पदों पर भर्ती के लिए एक बहुत ही लोकप्रिय परीक्षा है।\n\n` +
          `*चयन प्रक्रिया:*\n` +
          `1️⃣ लिखित परीक्षा (Computer Based Test)\n` +
          `2️⃣ शारीरिक दक्षता परीक्षा (Physical Proficiency Test)\n` +
          `3️⃣ मेडिकल टेस्ट\n\n` +
          `अधिक जानकारी के लिए मुख्य मेनू पर लौटें 👇`;

        inlineKeyboard = {
          inline_keyboard: [
            [{ text: '🔙 Main Menu', callback_data: 'MAIN_MENU' }]
          ]
        };
      } 
      else if (data === 'INFO_PROVIDE') {
        responseText = `🎁 *हम क्या प्रदान कर रहे हैं?*\n\n` +
          `MP Police Constable परीक्षा के लिए हम आपको सबसे बेहतरीन और स्मार्ट अध्ययन सामग्री प्रदान करते हैं:\n\n` +
          `🎯 *टॉपिक-वाइज़ अभ्यास* (GK, रीज़निंग, विज्ञान, गणित, हिंदी)\n` +
          `🧠 *शिक्षक जैसी स्मार्ट व्याख्या*\n` +
          `🔥 *1000+ MPGK स्मार्ट वन-लाइनर्स*\n` +
          `⚡ *इंस्टंट रिवीज़न मोड और एनालिटिक्स*\n\n` +
          `रटने वाले नोट्स नहीं, बल्कि स्मार्ट तैयारी करें!\n\n` +
          `क्या आपको कोई समस्या आ रही है? 👇`;
        
        inlineKeyboard = {
          inline_keyboard: [
            [{ text: '💬 Support Desk', callback_data: 'SUPPORT' }],
            [{ text: '🔙 Main Menu', callback_data: 'MAIN_MENU' }]
          ]
        };
      }
      else if (data === 'MAIN_MENU') {
        responseText = `🎉 *Welcome to MP Police Constable Hub*\n\n` +
          `कृपया नीचे दिए गए विकल्पों में से चुनें: 👇`;
        inlineKeyboard = {
          inline_keyboard: [
            [{ text: '👮 MP Constable क्या है?', callback_data: 'INFO_EXAM' }],
            [{ text: '🎁 हम क्या प्रदान कर रहे हैं?', callback_data: 'INFO_PROVIDE' }],
            [{ text: '💬 Support Desk (Chat with us)', callback_data: 'SUPPORT' }]
          ]
        };
      }
      else if (data === 'SUPPORT') {
        responseText = `🔧 *Support Desk*\nआपको किस प्रकार की सहायता की आवश्यकता है? 👇`;
        inlineKeyboard = {
          inline_keyboard: [
            [{ text: '💳 Payment Issue', callback_data: 'ISSUE_PAY' }],
            [{ text: '🔐 Login Issue', callback_data: 'ISSUE_LOG' }],
            [{ text: '💬 Other Query', callback_data: 'ISSUE_OTH' }]
          ]
        };
      }
      else if (data && data.startsWith('ISSUE_')) {
        let issueType = "Other Query";
        if (data.includes('_PAY')) issueType = "Payment Issue";
        if (data.includes('_LOG')) issueType = "Login Issue";
        
        responseText = `🎫 *Support Request Received*\n\n` +
          `आपकी क्वेरी (${issueType}) हमारे पास पहुँच गई है।\n` +
          `हमारी टीम जल्द ही आपकी सहायता करने की कोशिश करेगी।\n\n` +
          `कृपया अपनी समस्या या प्रश्न नीचे विस्तार से लिखें। 👇`;
        
        const timeOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' };
        const formattedTime = new Date().toLocaleString('en-IN', timeOptions);

        // Alert Admin via NEW Support Telegram Bot
        const alertMsg = `🚨 *Human Support Requested!* (MP Police) 🚨\n\n` +
          `👤 *Student:* ${guestName}\n` +
          `💬 *Chat ID:* ${chatId}\n` +
          `🔵 *Platform:* Telegram Bot\n` +
          `📌 *Issue Type:* ${issueType}\n` +
          `⏰ *Time:* ${formattedTime}\n\n` +
          `⚡ _Please reply via the Admin Support Inbox._`;
        
        await sendTelegramNotification(alertMsg);
      }
      else {
        responseText = "We've received your request! A human agent will reply to you shortly.";
      }
    }

    // 5. Send Response to Telegram
    if (chatId && responseText) {
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: responseText,
          parse_mode: 'Markdown',
          reply_markup: inlineKeyboard ? inlineKeyboard : undefined
        }),
      });

      // DB: Save Outgoing Bot Message
      if (convId) {
        await saveOutgoingMessage(convId, responseText, 'bot');
      }
    }

    // Always return 200 OK so Telegram doesn't retry
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
