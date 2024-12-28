function inputDataOrder(data) {
  try {
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(dataOrderSheetName);

    // Baris awal data
    const startRow = 3;
    const lastRow = sheet.getLastRow();
    const row = lastRow >= startRow ? lastRow + 1 : startRow; // Mulai dari baris 3 jika kosong

    // Tentukan nomor urut
    const number = row - (startRow - 1);
    const today = new Date();
    const tanggalMasuk = formatDate(today);
    const jamMasuk = formatTime(today);

    // Insert data ke dalam sheet
    sheet.getRange(`A${row}`).setValue(number); // Kolom A: Nomor
    sheet.getRange(`B${row}`).setValue(tanggalMasuk); // Kolom B: Tanggal Masuk
    sheet.getRange(`C${row}`).setValue(jamMasuk); // Kolom C: Jam Masuk
    sheet.getRange(`D${row}`).setValue(data.noPlat); // Kolom D: No Plat
    sheet.getRange(`E${row}`).setValue(data.customer); // Kolom E: Customers
    sheet.getRange(`F${row}`).setValue(data.product); // Kolom F: Products
    sheet.getRange(`G${row}`).setValue('Sedang diproses'); // Kolom G: Status
    sheet.getRange(`H${row}`).setValue(''); // Kolom H: Tanggal dan Jam keluar (kosong)

    return number; // Kembalikan nomor urut
  } catch (err) {
    log(err);
    return false;
  }
}
