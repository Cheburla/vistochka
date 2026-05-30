/**
 * Code.gs — Google Apps Script web app that receives RSVP submissions
 * from the static invitation and appends them as rows to a Google Sheet.
 *
 * SETUP
 * 1. Create a Google Sheet. Note its name of the first tab (default "Sheet1").
 * 2. Extensions -> Apps Script. Paste this file. Set SHEET_NAME below if needed.
 * 3. Deploy -> New deployment -> type "Web app".
 *      Execute as: Me
 *      Who has access: Anyone
 *    Copy the Web app URL.
 * 4. Paste that URL into content.json -> rsvp.appsScriptUrl
 *    (or via editor.html field "URL Google Apps Script").
 *
 * NOTE on CORS: web apps do not return CORS headers for cross-origin
 * reads, so the site posts with mode:"no-cors" (fire-and-forget). The row
 * is still written. Verify submissions by opening the Sheet, not the
 * browser network response.
 */

var SHEET_NAME = "Sheet1";
var HEADERS = ["Час відправки", "Імʼя", "Присутність", "Гостей", "Побажання", "Сторінка"];

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    var p = (e && e.parameter) || {};
    var attending = p.attending === "yes" ? "Так" : (p.attending === "no" ? "Ні" : p.attending || "");

    sheet.appendRow([
      new Date(),
      p.name || "",
      attending,
      p.guests || "",
      p.notes || "",
      p.page || ""
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

// Lightweight GET for a health check in the browser.
function doGet() {
  return json({ ok: true, service: "wedding-rsvp" });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
