# Google Sheets & Google Apps Script Setup Guide

Follow this guide to connect your RSVP Form and Celebrant Console to a live Google Spreadsheet for real-time tracking, database synchronization, and guest count updates.

---

## Step 1: Create Your Google Spreadsheet

1. Open [Google Sheets](https://sheets.google.com) and create a **Blank Spreadsheet**.
2. Rename the spreadsheet to **Sophia's Debut RSVP** (or your chosen title).
3. Name the first sheet tab **Sheet1** (which is the default).
4. Add the following exact headers to Row 1 (Columns A through F):
   * **Column A**: `Name`
   * **Column B**: `Number of Guest`
   * **Column C**: `Phone`
   * **Column D**: `Message`
   * **Column E**: `I can attend`
   * **Column F**: `I cant attend`

---

## Step 2: Publish Your Spreadsheet as a CSV

To allow your Celebrant Console to fetch your live guest data, you need to publish the sheet to the web:

1. Click on **File** in the top menu bar.
2. Select **Share** > **Publish to web**.
3. Under the *Link* tab:
   * Change the first dropdown from "Entire Document" to **Sheet1**.
   * Change the second dropdown from "Web page" to **Comma-separated values (.csv)**.
4. Click **Publish** and confirm by clicking **OK**.
5. Copy the generated link. This is your **Google Sheet published CSV URL**.
   * *Example Format:* `https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv&gid=0&single=true`

---

## Step 3: Set Up and Deploy Google Apps Script Web App

To enable writing RSVP entries to the sheet and editing guest counts inline from the console, add a background Apps Script web app:

1. In your spreadsheet, click **Extensions** in the top menu and select **Apps Script**.
2. Delete any default code in the editor (`Code.gs`) and paste the following Google Apps Script:

```javascript
/**
 * Google Apps Script Web App for RSVP Registry
 * Supports listing entries, submitting RSVPs, and updating guest counts.
 */

function doGet(e) {
  var action = e.parameter.action;
  
  if (action === 'list') {
    return listEntries();
  }
  
  return ContentService.createTextOutput(JSON.stringify({error: "Invalid action or parameters."}))
                       .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var action = e.parameter.action;
  
  if (action === 'submitRsvp') {
    return submitRsvp(e.parameter);
  } else if (action === 'updateGuests') {
    return updateGuests(e.parameter);
  }
  
  return ContentService.createTextOutput(JSON.stringify({error: "Invalid action or parameters."}))
                       .setMimeType(ContentService.MimeType.JSON);
}

// 1. Fetch all sheet submissions as JSON
function listEntries() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var entries = [];
  
  // Start loop at 1 to skip header row
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (row[0] || row[1] || row[2] || row[3] || row[4] || row[5]) {
      entries.push({
        rowNumber: i + 1,
        name: row[0],
        guests: String(row[1]),
        phone: row[2],
        message: row[3],
        canAttend: row[4],
        cantAttend: row[5]
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ entries: entries }))
                       .setMimeType(ContentService.MimeType.JSON);
}

// 2. Submit a new RSVP entry
function submitRsvp(params) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow([
    params.name,
    params.guests,
    params.phone,
    params.message,
    params.canAttend,
    params.cantAttend
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "RSVP saved." }))
                       .setMimeType(ContentService.MimeType.JSON);
}

// 3. Edit existing guests count inline
function updateGuests(params) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rowNumber = parseInt(params.rowNumber, 10);
  var guests = params.guests;
  
  if (!isNaN(rowNumber) && rowNumber >= 2 && rowNumber <= sheet.getLastRow()) {
    // Column 2 represents 'Number of Guest'
    sheet.getRange(rowNumber, 2).setValue(guests);
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Guest count updated." }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: "Invalid row number: " + rowNumber }))
                       .setMimeType(ContentService.MimeType.JSON);
}
```

3. Save the project by clicking the disk icon (or pressing `Ctrl + S`).
4. Click the blue **Deploy** button at the top right, and choose **New deployment**.
5. Click the gear icon next to "Select type" and select **Web app**.
6. Configure the deployment settings:
   * **Description**: `Sophia Debut RSVP Web App`
   * **Execute as**: **Me (your-email@gmail.com)**
   * **Who has access**: **Anyone** *(Crucial: This must be set to 'Anyone' so the website can post RSVPs without requiring guests to login with their Google Accounts).*
7. Click **Deploy**.
8. If prompted, click **Authorize access**, select your Google account, click **Advanced** (at the bottom), and choose **Go to Untitled project (unsafe)**. Allow all requested permissions.
9. Under the "Web app" section in the deployment success window, copy the **URL**. This is your **Google Apps Script Web App URL**.
   * *Example Format:* `https://script.google.com/macros/s/AKfycb.../exec`

---

## Step 4: Configure Your Website

Once you have your two URLs, you can connect them seamlessly:

1. Open your Celebrant Console page (`dashboard.html`) in your browser.
2. Sign in using the default PIN (Username: `SHEINTEL`, Password: `082226`).
3. Click the **Sheet Config** button in the header.
4. Paste your URLs into the form fields:
   * **Google Sheet published CSV URL**
   * **Google Apps Script Web App URL**
5. Adjust other settings if needed (Total prepared seats capacity, base VIP reserved seats, name, pin, etc.)
6. Click **Save Configurations**.

The dashboard will refresh and load the live spreadsheet data. The invitation page (`index.html`) will also now send submissions straight to your Google Sheet!
