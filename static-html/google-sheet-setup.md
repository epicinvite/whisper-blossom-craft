# Google Sheets RSVP Setup

This project is wired to use your spreadsheet:

`1F9lVoqH-RSYylYAkqpn2LY6ZOhXut5c8CuK75BjhtVI`

The RSVP page posts to a Google Apps Script web app, and the dashboard reads the live sheet through the sheet's CSV export URL.

---

## 1. Prepare the Sheet

Open the spreadsheet and make sure the first tab is named `Sheet1`.

Use this header row in columns A-F:

- `Name`
- `Number of Guest`
- `Phone`
- `Message`
- `I can attend`
- `I cant attend`

If you already have data, keep the same column order.

---

## 2. Add the Apps Script Web App

In Google Sheets, go to `Extensions` -> `Apps Script`, then paste this code into `Code.gs`:

```javascript
const SPREADSHEET_ID = "1F9lVoqH-RSYylYAkqpn2LY6ZOhXut5c8CuK75BjhtVI";
const SHEET_NAME = "Sheet1";

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0];
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizeRow_(row, rowNumber) {
  const canAttend = String(row[4] || "").trim();
  const cantAttend = String(row[5] || "").trim();
  const status = canAttend.toLowerCase() === "yes" ? "attending" : cantAttend.toLowerCase() === "yes" ? "declined" : "attending";

  return {
    rowNumber,
    name: row[0] || "",
    guests: String(row[1] || "0"),
    phone: row[2] || "",
    message: row[3] || "",
    canAttend: canAttend,
    cantAttend: cantAttend,
    status,
  };
}

function listEntries() {
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();
  const entries = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.some((cell) => String(cell || "").trim() !== "")) {
      entries.push(normalizeRow_(row, i + 1));
    }
  }

  return json_({ entries });
}

function submitRsvp(params) {
  const sheet = getSheet_();
  sheet.appendRow([
    params.name || "",
    params.guests || "0",
    params.phone || "",
    params.message || "",
    params.canAttend === "Yes" ? "Yes" : "",
    params.cantAttend === "Yes" ? "Yes" : "",
  ]);

  return json_({
    status: "success",
    message: "RSVP saved.",
    rowNumber: sheet.getLastRow(),
  });
}

function updateGuests(params) {
  const sheet = getSheet_();
  const rowNumber = parseInt(params.rowNumber, 10);

  if (isNaN(rowNumber) || rowNumber < 2 || rowNumber > sheet.getLastRow()) {
    return json_({ error: "Invalid row number." });
  }

  sheet.getRange(rowNumber, 2).setValue(params.guests || "0");
  return json_({ status: "success", message: "Guest count updated." });
}

function saveGuest(params) {
  const sheet = getSheet_();
  sheet.appendRow([
    params.name || "",
    params.guests || "0",
    params.phone || "",
    params.message || "",
    params.canAttend === "Yes" ? "Yes" : "",
    params.cantAttend === "Yes" ? "Yes" : "",
  ]);

  return json_({
    status: "success",
    message: "Guest saved.",
    rowNumber: sheet.getLastRow(),
  });
}

function updateGuest(params) {
  const sheet = getSheet_();
  const rowNumber = parseInt(params.rowNumber, 10);

  if (isNaN(rowNumber) || rowNumber < 2 || rowNumber > sheet.getLastRow()) {
    return json_({ error: "Invalid row number." });
  }

  sheet.getRange(rowNumber, 1, 1, 6).setValues([[
    params.name || "",
    params.guests || "0",
    params.phone || "",
    params.message || "",
    params.canAttend === "Yes" ? "Yes" : "",
    params.cantAttend === "Yes" ? "Yes" : "",
  ]]);

  return json_({ status: "success", message: "Guest updated." });
}

function deleteGuest(params) {
  const sheet = getSheet_();
  const rowNumber = parseInt(params.rowNumber, 10);

  if (isNaN(rowNumber) || rowNumber < 2 || rowNumber > sheet.getLastRow()) {
    return json_({ error: "Invalid row number." });
  }

  sheet.deleteRow(rowNumber);
  return json_({ status: "success", message: "Guest deleted." });
}

function clearAll() {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  return json_({ status: "success", message: "All guest rows cleared." });
}

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || "list").toLowerCase();

  if (action === "list") {
    return listEntries();
  }

  return json_({ error: "Invalid action." });
}

function doPost(e) {
  const action = String((e && e.parameter && e.parameter.action) || "").toLowerCase();

  if (action === "submitrsvp") return submitRsvp(e.parameter);
  if (action === "updateguests") return updateGuests(e.parameter);
  if (action === "saveguest") return saveGuest(e.parameter);
  if (action === "updateguest") return updateGuest(e.parameter);
  if (action === "deleteguest") return deleteGuest(e.parameter);
  if (action === "clearall") return clearAll();

  return json_({ error: "Invalid action." });
}
```

Save the project.

---

## 3. Deploy the Web App

1. Click `Deploy` -> `New deployment`.
2. Choose `Web app`.
3. Set:
   - `Execute as`: `Me`
   - `Who has access`: `Anyone`
4. Deploy and authorize.
5. Copy the Web App URL.

That URL is what the RSVP form uses to write submissions to the sheet.

---

## 4. Keep the Dashboard Live

The dashboard already reads the spreadsheet through this CSV URL format:

`https://docs.google.com/spreadsheets/d/1F9lVoqH-RSYylYAkqpn2LY6ZOhXut5c8CuK75BjhtVI/export?format=csv&gid=0`

If you publish the sheet to the web, that link becomes the live read source for the dashboard.

To finish the connection:

1. Open the RSVP dashboard.
2. Paste the Apps Script Web App URL into `Apps Script Web App URL`.
3. Save settings.

After that:

- New RSVP form submissions write into the spreadsheet.
- The dashboard reloads from the spreadsheet data.
- Guest count edits can also sync to the sheet when the Apps Script URL is set.
