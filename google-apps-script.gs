/**
 * Google Apps Script — RSVP Sheet Integration
 * =============================================
 *
 * Deploy this as a Web App linked to your RSVP Google Sheet:
 *   1. Open the sheet: https://docs.google.com/spreadsheets/d/1F9lVoqH-RSYylYAkqpn2LY6ZOhXut5c8CuK75BjhtVI/edit
 *   2. Extensions → Apps Script
 *   3. Paste this file
 *   4. Deploy → New deployment → Type: Web App
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   5. Copy the Web App URL
 *   6. Paste it into the /dashboard settings page (Apps Script URL field)
 *   7. Save
 *
 * Sheet columns (Row 1 = headers):
 *   A: Timestamp    B: Name    C: Number of Guest    D: Phone
 *   E: Message    F: I can attend    G: I can't attend
 */

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok", message: "RSVP Apps Script is running." })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const params = e.parameter;
    const action = params.action || "";

    if (action === "submitRsvp") {
      return handleSubmitRsvp(params);
    } else if (action === "updateGuest") {
      return handleUpdateGuest(params);
    } else if (action === "deleteGuest") {
      return handleDeleteGuest(params);
    } else {
      return jsonError("Unknown action: " + action);
    }
  } catch (err) {
    return jsonError(err.message);
  }
}

/**
 * Submit a new RSVP response.
 * POST params: name, guests, phone, message, canAttend, cantAttend
 */
function handleSubmitRsvp(params) {
  const sheet = getSheet();
  const timestamp = new Date();

  sheet.appendRow([
    timestamp,
    params.name || "",
    params.guests || "1",
    params.phone || "",
    params.message || "",
    params.canAttend || "",
    params.cantAttend || "",
  ]);

  return jsonSuccess("RSVP submitted. Row: " + sheet.getLastRow());
}

/**
 * Update an existing guest row by row number.
 * POST params: rowNumber, name?, guests?, phone?, message?, canAttend?, cantAttend?
 */
function handleUpdateGuest(params) {
  const sheet = getSheet();
  const row = parseInt(params.rowNumber, 10);

  if (!row || row < 2) {
    return jsonError("Invalid row number: " + params.rowNumber);
  }

  if (params.name !== undefined) sheet.getRange(row, 2).setValue(params.name);
  if (params.guests !== undefined) sheet.getRange(row, 3).setValue(params.guests);
  if (params.phone !== undefined) sheet.getRange(row, 4).setValue(params.phone);
  if (params.message !== undefined) sheet.getRange(row, 5).setValue(params.message);
  if (params.canAttend !== undefined) sheet.getRange(row, 6).setValue(params.canAttend);
  if (params.cantAttend !== undefined) sheet.getRange(row, 7).setValue(params.cantAttend);

  return jsonSuccess("Row " + row + " updated.");
}

/**
 * Delete a guest row.
 * POST params: rowNumber
 */
function handleDeleteGuest(params) {
  const sheet = getSheet();
  const row = parseInt(params.rowNumber, 10);

  if (!row || row < 2) {
    return jsonError("Invalid row number: " + params.rowNumber);
  }

  sheet.deleteRow(row);
  return jsonSuccess("Row " + row + " deleted.");
}

/**
 * Get the active sheet (first sheet in the spreadsheet).
 */
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheets()[0];
}

function jsonSuccess(msg) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok", message: msg })
  ).setMimeType(ContentService.MimeType.JSON);
}

function jsonError(msg) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "error", message: msg })
  ).setMimeType(ContentService.MimeType.JSON);
}
