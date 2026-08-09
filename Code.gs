
// ==========================================
// 1. FUNGSI UNTUK WEB & DASHBOARD ANDROID (doGet)
// ==========================================
function doGet(e) {
  // Jika Android meminta data Dasbor
  if (e && e.parameter.action == "getData") {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("PERHITUNGAN");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({error: "Sheet PERHITUNGAN tidak ditemukan"})).setMimeType(ContentService.MimeType.JSON);
    }
    var data = sheet.getDataRange().getValues();
    var json = JSON.stringify(data);
    return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
  } 
  // Jika dibuka lewat Browser Web
  else {
    return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Sistem Absensi Terpadu')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  }
}

// ==========================================
// 2. FUNGSI UNTUK APLIKASI ANDROID (doPost)
// ==========================================
function doPost(e) {
  var nisn = e.parameter.nisn;
  if (!nisn) {
    return ContentService.createTextOutput("❌ Error: QR Code kosong/tidak terbaca!");
  }

  // Gunakan ID Sheet Anda yang benar
  var ss = SpreadsheetApp.openById("ADD_ADDRESS_ON_YOUR_SHEETS"); 
  var timeZone = "Asia/Jakarta"; 
  var dateObj = new Date();

  var headerDate = Utilities.formatDate(dateObj, timeZone, "dd-MMM-yyyy"); 
  var timeString = Utilities.formatDate(dateObj, timeZone, "HH:mm:ss");    

  var monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  var month = monthNames[dateObj.getMonth()];
  var year = Utilities.formatDate(dateObj, timeZone, "yyyy");
  var sheetName = month + " " + year; 

  var sheet = ss.getSheetByName(sheetName);

  // LOGIKA PEMBUATAN SHEET BULANAN (Jika belum ada)
  if (!sheet) {
    var sheetMaster = ss.getSheetByName("MASTERDATA");
    if (!sheetMaster) {
      return ContentService.createTextOutput("❌ Error: Sheet MASTERDATA tidak ditemukan!");
    }
    
    var dataMaster = sheetMaster.getDataRange().getValues();
    sheet = ss.insertSheet(sheetName); 
    
    var dataAwal = [["NISN", "NAMA SISWA"]];
    
    for (var i = 1; i < dataMaster.length; i++) {
      if (String(dataMaster[i][0]).trim() !== "") {
        dataAwal.push([String(dataMaster[i][0]).trim(), String(dataMaster[i][2]).trim()]);
      }
    }
    
    sheet.getRange(1, 1, dataAwal.length, 2).setValues(dataAwal);
    sheet.getRange("A1:B1").setFontWeight("bold").setBackground("#d9ead3");
    sheet.setFrozenRows(1);
    sheet.setFrozenColumns(2);
  }

  var dataAll = sheet.getDataRange().getValues();
  
  var studentRow = -1;
  var studentName = "";

  for (var i = 1; i < dataAll.length; i++) { 
    if (String(dataAll[i][0]).trim() == String(nisn).trim()) {
      studentRow = i + 1; 
      studentName = dataAll[i][1]; 
      break;
    }
  }

  if (studentRow == -1) {
    return ContentService.createTextOutput("❌ NISN " + nisn + " tidak terdaftar di bulan ini!");
  }

  var headers = dataAll[0];
  var dateCol = -1;

  for (var j = 2; j < headers.length; j++) { 
    var cellHeader = headers[j];
    if (cellHeader instanceof Date) {
      cellHeader = Utilities.formatDate(cellHeader, timeZone, "dd-MMM-yyyy");
    }
    if (String(cellHeader).trim() == headerDate) {
      dateCol = j + 1; 
      break;
    }
  }

  if (dateCol == -1) {
    dateCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, dateCol).setValue("'" + headerDate).setFontWeight("bold").setBackground("#c9daf8");
  }

  var cellRange = sheet.getRange(studentRow, dateCol);
  var cellValue = cellRange.getValue();

  if (cellValue !== "") {
    return ContentService.createTextOutput("⚠️ STOP!\n" + studentName + "\nSudah tercatat: " + cellValue);
  } else {
    cellRange.setValue("Hadir - " + timeString);
    return ContentService.createTextOutput("✅ ABSEN MASUK!\n" + studentName + "\nJam: " + timeString);
  }
}

// ==========================================
// 3. FUNGSI UNTUK PEMINDAI WEB CAMERA (Jika digunakan)
// ==========================================
function rekamAbsensi(nis) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(3000)) {
    return { status: 'error', message: 'Sistem sibuk, silakan scan ulang.' };
  }

  try {
    var ss = SpreadsheetApp.openById("1xve41RwHn5kz9tZlmZQX8uJCwcYi5z7t86YPyQ7nTyc");
    var waktuSekarang = new Date();
    var timeZone = Session.getScriptTimeZone();

    var namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    var stringBulanTahun = namaBulan[waktuSekarang.getMonth()] + " " + waktuSekarang.getFullYear();
    var stringTanggal = Utilities.formatDate(waktuSekarang, timeZone, "dd-MMM-yyyy");
    var stringJam = Utilities.formatDate(waktuSekarang, timeZone, "HH:mm:ss");
    
    var textNis = String(nis).trim();

    var sheetBulan = ss.getSheetByName(stringBulanTahun);
    
    if (!sheetBulan) {
      var sheetMaster = ss.getSheetByName("MASTERDATA");
      if (!sheetMaster) {
        return { status: 'error', message: 'Sheet "MASTERDATA" tidak ditemukan.' };
      }
      var dataMaster = sheetMaster.getDataRange().getValues();

      sheetBulan = ss.insertSheet(stringBulanTahun);
      var dataAwal = [["NISN", "NAMA SISWA"]];
      
      for (var i = 1; i < dataMaster.length; i++) {
        if (String(dataMaster[i][0]).trim() !== "") {
          dataAwal.push([String(dataMaster[i][0]).trim(), String(dataMaster[i][2]).trim()]);
        }
      }
      
      sheetBulan.getRange(1, 1, dataAwal.length, 2).setValues(dataAwal);
      sheetBulan.getRange("A1:B1").setFontWeight("bold").setBackground("#d9ead3");
      sheetBulan.setFrozenRows(1);
      sheetBulan.setFrozenColumns(2);
    }

    var lastCol = sheetBulan.getLastColumn();
    var headers = sheetBulan.getRange(1, 1, 1, lastCol > 0 ? lastCol : 2).getDisplayValues()[0];
    var colIndex = -1;
    
    for (var c = 0; c < headers.length; c++) {
      if (headers[c].trim() === stringTanggal) {
        colIndex = c + 1; 
        break;
      }
    }
    
    if (colIndex === -1) {
      colIndex = lastCol + 1;
      sheetBulan.getRange(1, colIndex).setValue("'" + stringTanggal).setFontWeight("bold").setBackground("#c9daf8");
    }
    
    var lastRow = sheetBulan.getLastRow();
    var dataNISN = sheetBulan.getRange(1, 1, lastRow, 2).getDisplayValues();
    var rowIndex = -1;
    var namaSiswa = "";
    
    for (var r = 1; r < dataNISN.length; r++) { 
      if (dataNISN[r][0].trim() === textNis) {
        rowIndex = r + 1; 
        namaSiswa = dataNISN[r][1].trim();
        break;
      }
    }
    
    if (rowIndex === -1) {
      return { status: 'error', message: 'Ditolak: NISN ' + textNis + ' tidak terdaftar!' };
    }
    
    var cell = sheetBulan.getRange(rowIndex, colIndex);
    
    if (cell.getValue() !== "") {
      return { status: 'error', message: 'DITOLAK: ' + namaSiswa + ' sudah absen hari ini!' };
    }
    
    cell.setValue("Hadir - " + stringJam);
    
    return { status: 'success', message: 'Berhasil! ' + namaSiswa + ' direkam.' };
    
  } catch (error) {
    return { status: 'error', message: 'System Error: ' + error.toString() };
  } finally {
    lock.releaseLock();
  }
}

