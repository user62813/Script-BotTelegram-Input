// Kredensial
const spreadsheetId      = ''; // Masukkan ID Spreadsheet Anda
const dataOrderSheetName = 'Data Order';
const logSheetName       = 'Log';

const botHandle      = ''; // Masukkan username bot Telegram Anda (tanpa @)
const botToken       = ''; // Masukkan token API Telegram Anda
const appsScriptUrl  = ''; // Masukkan URL Apps Script (webhook)
const telegramApiUrl = `https://api.telegram.org/bot${botToken}`;

// Fungsi untuk mencatat log
function log(logMessage = '') {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(logSheetName);
  const lastRow = sheet.getLastRow();
  const row = lastRow + 1;

  const today = new Date();

  sheet.insertRowAfter(lastRow);
  sheet.getRange(`A${row}`).setValue(today);
  sheet.getRange(`B${row}`).setValue(logMessage);
}

// Format tanggal dan waktu
function formatDate(date) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
}

function formatTime(date) {
  const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
  return date.toLocaleTimeString('id-ID', options);
}

// Fungsi untuk mengirim pesan Telegram
function sendTelegramMessage(chatId, replyToMessageId, textMessage) {
  const url = `${telegramApiUrl}/sendMessage`;
  const data = {
    parse_mode: 'HTML',
    chat_id: chatId,
    reply_to_message_id: replyToMessageId,
    text: textMessage,
    disable_web_page_preview: true,
  };
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(data),
  };
  return UrlFetchApp.fetch(url, options).getContentText();
}

// Parse pesan dari pengguna
function parseMessage(message = '') {
  const splitted = message.split('\n');
  let noPlat = '';
  let customer = '';
  let product = '';

  splitted.forEach(el => {
    noPlat = el.includes('No Plat:') ? el.split(':')[1].trim() : noPlat;
    customer = el.includes('Customer:') ? el.split(':')[1].trim() : customer;
    product = el.includes('Product:') ? el.split(':')[1].trim() : product;
  });

  const result = { noPlat, customer, product };
  const isEmpty = noPlat === '' && customer === '' && product === '';
  return isEmpty ? false : result;
}

// Fungsi untuk menyimpan data order ke Google Sheets
function inputDataOrder(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(dataOrderSheetName);
    const lastRow = sheet.getLastRow();
    const row = lastRow + 1;

    const number = lastRow;
    const today = new Date();
    const tanggalMasuk = formatDate(today);
    const jamMasuk = formatTime(today);

    sheet.insertRowAfter(lastRow);
    sheet.getRange(`A${row}`).setValue(number);
    sheet.getRange(`B${row}`).setValue(tanggalMasuk);
    sheet.getRange(`C${row}`).setValue(jamMasuk);
    sheet.getRange(`D${row}`).setValue(data.noPlat);
    sheet.getRange(`E${row}`).setValue(data.customer);
    sheet.getRange(`F${row}`).setValue(data.product);
    sheet.getRange(`G${row}`).setValue('Sedang diproses');
    sheet.getRange(`H${row}`).setValue('');

    return number;
  } catch (err) {
    log(err);
    return false;
  }
}

// Fungsi untuk menangani webhook Telegram
function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const chatId = contents.message.chat.id;
    const receivedTextMessage = contents.message.text.replace(botHandle, '').trim();
    const messageId = contents.message.message_id;

    let messageReply = '';

    if (receivedTextMessage.toLowerCase() === '/start') {
      messageReply = `Halo! Bot aktif. Gunakan perintah /format untuk melihat format pesan.`;
    } else if (receivedTextMessage.startsWith('/input')) {
      const parsedMessage = parseMessage(receivedTextMessage);
      if (parsedMessage) {
        const idOrder = inputDataOrder(parsedMessage);
        messageReply = idOrder ? `Data berhasil disimpan dengan nomor urut <b>${idOrder}</b>` : 'Data gagal disimpan.';
      } else {
        messageReply = 'Data tidak lengkap.';
      }
    } else if (receivedTextMessage.toLowerCase() === '/format') {
      messageReply = `Gunakan format berikut:\n\n/input\nNo Plat: [nomor plat]\nCustomer: [nama pelanggan]\nProduct: [produk yang dipesan]`;
    } else {
      messageReply = 'Perintah tidak dikenal. Gunakan /format untuk bantuan.';
    }

    sendTelegramMessage(chatId, messageId, messageReply);
  } catch (err) {
    log(err.message);
  }
}

// Fungsi untuk mengatur webhook Telegram
function setWebhook() {
  const url = `${telegramApiUrl}/setWebhook?url=${appsScriptUrl}`;
  const response = UrlFetchApp.fetch(url).getContentText();
  Logger.log(response);
}
