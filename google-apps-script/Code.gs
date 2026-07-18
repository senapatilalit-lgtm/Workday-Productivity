/**
 * The Workday Study — Google Sheets backend
 * -------------------------------------------------------------------------
 * Paste this whole file into the Apps Script editor attached to your
 * response spreadsheet (Extensions > Apps Script). It accepts POSTed
 * survey answers from the frontend and appends one row per response to
 * a sheet called "Responses" (created automatically on first submission).
 *
 * See GOOGLE_SHEETS_SETUP.md for the full step-by-step deployment guide.
 */

// Column order for the sheet. This also defines what gets written —
// anything sent from the frontend under a key NOT listed here is ignored,
// and any key listed here with no matching data is written as blank.
var HEADERS = [
  "Timestamp",
  "A1", "A2", "A2_Other", "A3", "A4", "A5", "A6",
  "B1", "B2", "B3", "B4",
  "C1", "C2", "C3", "C4",
  "D1", "D2", "D3", "D3_Other", "D4",
  "E1", "E2", "E_AC", "E3", "E4", "E5", "E6",
  "F1", "F2", "F2_Email"
];

var SHEET_NAME = "Responses";

function doPost(e) {
  try {
    var sheet = getOrCreateSheet_();
    var data = JSON.parse(e.postData.contents);

    var row = HEADERS.map(function (key) {
      if (key === "Timestamp") return new Date();
      var value = data[key];
      if (value === undefined || value === null) return "";
      return value;
    });

    // Lock briefly so concurrent submissions never clobber each other.
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Lets you sanity-check the deployment URL by opening it directly in a
// browser — you should see {"status":"ready"} rather than an error page.
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ready" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
