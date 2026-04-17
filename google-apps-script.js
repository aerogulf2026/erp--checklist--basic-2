// ═══════════════════════════════════════════════════════════════
// AEROGULF ERP — Google Apps Script
// Paste into: Google Sheet → Extensions → Apps Script
// Then: Deploy → New deployment → Web App → Anyone
//
// COLUMNS STORED (exactly as requested):
//   Timestamp (UTC) | Timestamp (UAE) | Action | Role |
//   Task | Details | Employee ID | Task ID |
//   Checklist ID | Checklist Name | Session ID
// ═══════════════════════════════════════════════════════════════

function doPost(e) {
  try {
    var data  = JSON.parse(e.postData.contents);
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('ERP Log');

    // ── Create sheet with headers on first run ──────────────
    if (!sheet) {
      sheet = ss.insertSheet('ERP Log');

      var headers = [
        'Timestamp (UTC)',
        'Timestamp (UAE)',
        'Action',
        'Role',
        'Task',
        'Details',
        'Employee ID',
        'Task ID',
        'Checklist ID',
        'Checklist Name',
        'Session ID'
      ];

      sheet.appendRow(headers);

      // Style the header row
      var hRange = sheet.getRange(1, 1, 1, headers.length);
      hRange.setBackground('#003399');
      hRange.setFontColor('#ffffff');
      hRange.setFontWeight('bold');
      hRange.setFontSize(11);
      hRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);

      // Column widths
      sheet.setColumnWidth(1, 170);  // Timestamp UTC
      sheet.setColumnWidth(2, 170);  // Timestamp UAE
      sheet.setColumnWidth(3, 130);  // Action
      sheet.setColumnWidth(4, 230);  // Role
      sheet.setColumnWidth(5, 380);  // Task
      sheet.setColumnWidth(6, 300);  // Details
      sheet.setColumnWidth(7, 100);  // Employee ID
      sheet.setColumnWidth(8, 80);   // Task ID
      sheet.setColumnWidth(9, 90);   // Checklist ID
      sheet.setColumnWidth(10, 250); // Checklist Name
      sheet.setColumnWidth(11, 320); // Session ID
    }

    // ── Write the data row ──────────────────────────────────
    sheet.appendRow([
      data['Timestamp (UTC)']  || new Date().toISOString(),
      data['Timestamp (UAE)']  || '',
      data['Action']           || '',
      data['Role']             || '',
      data['Task']             || '',
      data['Details']          || '',
      data['Employee ID']      || '',
      data['Task ID']          || '',
      data['Checklist ID']     || '',
      data['Checklist Name']   || '',
      data['Session ID']       || '',
    ]);

    // ── Colour-code the Action cell ─────────────────────────
    var lastRow  = sheet.getLastRow();
    var actCell  = sheet.getRange(lastRow, 3); // column C = Action
    var empCell  = sheet.getRange(lastRow, 7); // column G = Employee ID
    var action   = (data['Action'] || '').toLowerCase();

    if (action === 'task completed') {
      actCell.setBackground('#c8e6c9'); actCell.setFontColor('#1b5e20');
    } else if (action === 'task undone') {
      actCell.setBackground('#fff9c4'); actCell.setFontColor('#f57f17');
    } else if (action === 'login') {
      actCell.setBackground('#e3f2fd'); actCell.setFontColor('#0d47a1');
    } else if (action === 'checklist started') {
      actCell.setBackground('#ede7f6'); actCell.setFontColor('#4a148c');
    } else if (action === 'note added') {
      actCell.setBackground('#fff8e1'); actCell.setFontColor('#e65100');
    }

    // Bold the Employee ID for easy scanning
    empCell.setFontWeight('bold');

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', row: lastRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── GET: returns last 100 rows as JSON (for Power BI) ──────────
function doGet(e) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('ERP Log');
    if (!sheet) return ContentService.createTextOutput('[]').setMimeType(ContentService.MimeType.JSON);

    var all     = sheet.getDataRange().getValues();
    var headers = all[0];
    var rows    = all.slice(1).slice(-100).reverse();
    var result  = rows.map(function(row) {
      var obj = {};
      headers.forEach(function(h, i) { obj[h] = row[i]; });
      return obj;
    });
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput('[]').setMimeType(ContentService.MimeType.JSON);
  }
}
