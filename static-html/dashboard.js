// 1. Starry sky background generator
function initStars() {
  const container = document.getElementById('starsContainer');
  if (!container) return;
  
  const starCount = 60;
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    // Random sizes and positions
    const size = Math.random() * 2.5 + 0.8;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${x}%`;
    star.style.top = `${y}%`;
    
    // Random animation delay and duration
    const delay = Math.random() * 5;
    const duration = Math.random() * 4 + 3;
    star.style.setProperty('--duration', `${duration}s`);
    star.style.animationDelay = `${delay}s`;
    
    container.appendChild(star);
  }
}

// 2. Global State & Configurations
let CONFIG = {
  name: "Sheintel",
  monogram: "S",
  username: "SHEINTEL",
  password: "082226",
  capacity: 150,
  baseSeats: 10,
  csvUrl: "",
  scriptUrl: ""
};

let allSubmissions = [];
let filteredSubmissions = [];

const DEFAULT_MOCK_DATA = [
  { rowNumber: 2, name: "Jojo Catalan", guests: "3", phone: "+63 992 314 9921", message: "Jojo Catalan, Erica Catalan, Erin Jade", canAttend: "Yes", cantAttend: "" },
  { rowNumber: 3, name: "Maricon Duave", guests: "2", phone: "+63 929 756 8396", message: "So excited to celebrate Sheintel's grand milestone! 💖", canAttend: "Yes", cantAttend: "" },
  { rowNumber: 4, name: "Maricel Ambat", guests: "4", phone: "+63 930 367 7489", message: "Thank you for inviting our family! 💓", canAttend: "Yes", cantAttend: "" },
  { rowNumber: 5, name: "Rea M. Rejas", guests: "2", phone: "+63 948 181 4467", message: "See you there Sheintel!", canAttend: "Yes", cantAttend: "" },
  { rowNumber: 6, name: "Vanessa Nosis", guests: "4", phone: "+63 928 265 3708", message: "Happy 18th birthday Sheintel! Enjoy your special night! 🎂", canAttend: "Yes", cantAttend: "" },
  { rowNumber: 7, name: "Tinny John Arzaga", guests: "0", phone: "+63 991 458 8318", message: "Sorry I can't attend due to conflict schedule. Have fun!", canAttend: "", cantAttend: "Yes" },
  { rowNumber: 8, name: "Francis Sietereales", guests: "2", phone: "+63 921 834 6340", message: "", canAttend: "Yes", cantAttend: "" },
  { rowNumber: 9, name: "Margarette Bautista", guests: "1", phone: "+63 994 371 1462", message: "Can't wait to see you shine! ✨", canAttend: "Yes", cantAttend: "" }
];

// Load configurations from LocalStorage
function loadConfig() {
  const saved = localStorage.getItem('rsvp_celebrant_config');
  if (saved) {
    try {
      CONFIG = { ...CONFIG, ...JSON.parse(saved) };
      // Migrate old default credentials if they are still set
      if ((CONFIG.username === "Sheintel" || CONFIG.username === "Sophia") && CONFIG.password === "1818") {
        CONFIG.username = "SHEINTEL";
        CONFIG.password = "082226";
        localStorage.setItem('rsvp_celebrant_config', JSON.stringify(CONFIG));
      }
    } catch (e) {
      console.error("Failed to parse config", e);
    }
  } else {
    // Save defaults to LocalStorage
    localStorage.setItem('rsvp_celebrant_config', JSON.stringify(CONFIG));
  }
  
  // Populate config fields in UI
  document.getElementById('configCelebrantName').value = CONFIG.name;
  document.getElementById('configMonogram').value = CONFIG.monogram;
  document.getElementById('configAdminUsername').value = CONFIG.username;
  document.getElementById('configAdminPassword').value = CONFIG.password;
  document.getElementById('configCapacity').value = CONFIG.capacity;
  document.getElementById('configBaseSeats').value = CONFIG.baseSeats;
  document.getElementById('configCsvUrl').value = CONFIG.csvUrl;
  document.getElementById('configScriptUrl').value = CONFIG.scriptUrl;
  
  // Update dashboard titles
  document.getElementById('dashboardTitleName').innerText = CONFIG.name;
}

// 3. Toast Notifications
function showToast(message, type = 'success') {
  const toast = document.getElementById('dashToast');
  const toastMessage = document.getElementById('dashToastMessage');
  const toastIcon = document.getElementById('dashToastIcon');
  
  toastMessage.innerText = message;
  toast.className = `toast show ${type}`;
  
  if (type === 'success') {
    toastIcon.className = 'fa-solid fa-circle-check';
  } else {
    toastIcon.className = 'fa-solid fa-triangle-exclamation';
  }
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// 4. CSV Parser
function parseCSV(text) {
  let rows = [];
  let row = [];
  let entry = "";
  let insideQuote = false;
  
  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    let nextChar = text[i+1];
    
    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        entry += '"';
        i++; // skip next quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      row.push(entry);
      entry = "";
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(entry);
      if (row.length > 1 || row[0] !== "") {
        rows.push(row);
      }
      row = [];
      entry = "";
    } else {
      entry += char;
    }
  }
  
  if (entry || row.length) {
    row.push(entry);
    rows.push(row);
  }
  
  return rows;
}

// 5. Data Handler
async function loadRSVPData() {
  const loadingEl = document.getElementById('tableLoading');
  const emptyEl = document.getElementById('tableEmpty');
  const wrapperEl = document.getElementById('tableWrapper');
  
  loadingEl.classList.remove('hidden');
  emptyEl.classList.add('hidden');
  wrapperEl.classList.add('hidden');
  
  try {
    if (CONFIG.csvUrl && CONFIG.csvUrl.trim() !== "") {
      // Fetch from Google Sheet published CSV URL
      const response = await fetch(CONFIG.csvUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("Could not fetch CSV published url");
      const csvText = await response.text();
      const rows = parseCSV(csvText);
      
      // Assume header: Name, Number of Guest, Phone, Message, I can attend, I cant attend
      if (rows.length > 1) {
        allSubmissions = rows.slice(1).map((row, idx) => ({
          rowNumber: idx + 2,
          name: row[0] || "",
          guests: row[1] || "0",
          phone: row[2] || "",
          message: row[3] || "",
          canAttend: (row[4] || "").trim().toLowerCase() === 'yes' ? 'Yes' : '',
          cantAttend: (row[5] || "").trim().toLowerCase() === 'yes' ? 'Yes' : ''
        })).filter(entry => entry.name.trim() !== "");
      } else {
        allSubmissions = [];
      }
      showToast("Live data fetched from Google Sheets.");
    } else {
      // Use LocalStorage mock data
      const stored = localStorage.getItem('rsvp_submissions');
      if (stored) {
        allSubmissions = JSON.parse(stored);
      } else {
        // Prepopulate LocalStorage with default mock records
        allSubmissions = [...DEFAULT_MOCK_DATA];
        localStorage.setItem('rsvp_submissions', JSON.stringify(allSubmissions));
      }
      showToast("Displaying offline database. Connect to Google Sheets via Config.");
    }
    
    processAndRender();
  } catch (err) {
    console.error("Error loading RSVP data", err);
    showToast("Failed to fetch live sheet. Loading local fallback database.", "error");
    // Fallback to local storage database
    const stored = localStorage.getItem('rsvp_submissions');
    allSubmissions = stored ? JSON.parse(stored) : [...DEFAULT_MOCK_DATA];
    processAndRender();
  }
}

// Compute Stats & Render Views
function processAndRender() {
  const loadingEl = document.getElementById('tableLoading');
  const searchVal = document.getElementById('tableSearch').value.toLowerCase().trim();
  const filterVal = document.getElementById('tableFilter').value;
  
  loadingEl.classList.add('hidden');
  
  // Calculate Stats
  const totalSubmissions = allSubmissions.length;
  const attendingSubmissions = allSubmissions.filter(s => s.canAttend === 'Yes');
  const attendingCount = attendingSubmissions.length;
  
  const totalGuests = attendingSubmissions.reduce((sum, s) => {
    const num = parseInt(s.guests);
    return sum + (isNaN(num) || num <= 0 ? 1 : num);
  }, 0);
  
  const capacity = parseInt(CONFIG.capacity) || 150;
  const baseSeats = parseInt(CONFIG.baseSeats) || 10;
  
  const committedSeats = Math.min(capacity, baseSeats + totalGuests);
  const committedPercentage = Math.round((committedSeats / capacity) * 100);
  
  // Update stats cards in DOM
  document.getElementById('statSubmissions').innerText = totalSubmissions;
  document.getElementById('statAttending').innerText = attendingCount;
  document.getElementById('statGuestCount').innerText = totalGuests;
  
  // Update Seat progress meter
  document.getElementById('progressLabel').innerText = `${committedSeats} / ${capacity}`;
  document.getElementById('progressPercent').innerText = `(${committedPercentage}%)`;
  document.getElementById('progressFill').style.width = `${committedPercentage}%`;
  
  document.getElementById('progressCaption').innerHTML = 
    `Of the total <strong>${capacity} seats</strong> prepared, <strong>${baseSeats}</strong> are reserved for VIP/family, and <strong>${totalGuests}</strong> seats are filled by confirmed guest reservations.`;
  
  // Filter & Search Table Rows
  filteredSubmissions = allSubmissions.filter(s => {
    // Filter
    if (filterVal === 'yes' && s.canAttend !== 'Yes') return false;
    if (filterVal === 'no' && s.cantAttend !== 'Yes') return false;
    
    // Search
    if (searchVal !== "") {
      const matchName = s.name.toLowerCase().includes(searchVal);
      const matchPhone = s.phone.toLowerCase().includes(searchVal);
      const matchMessage = s.message.toLowerCase().includes(searchVal);
      return matchName || matchPhone || matchMessage;
    }
    return true;
  });
  
  renderTable();
}

// Render Table Rows
function renderTable() {
  const tableBody = document.getElementById('tableBody');
  const emptyEl = document.getElementById('tableEmpty');
  const wrapperEl = document.getElementById('tableWrapper');
  
  tableBody.innerHTML = "";
  
  if (filteredSubmissions.length === 0) {
    emptyEl.classList.remove('hidden');
    wrapperEl.classList.add('hidden');
    return;
  }
  
  emptyEl.classList.add('hidden');
  wrapperEl.classList.remove('hidden');
  
  filteredSubmissions.forEach(entry => {
    const row = document.createElement('tr');
    
    // Name
    const tdName = document.createElement('td');
    tdName.innerText = entry.name;
    row.appendChild(tdName);
    
    // Guest dropdown (only if attending)
    const tdGuests = document.createElement('td');
    if (entry.canAttend === 'Yes') {
      const currentCount = parseInt(entry.guests) || 1;
      const select = document.createElement('select');
      select.className = 'table-guest-select';
      select.setAttribute('data-row', entry.rowNumber);
      select.setAttribute('data-prev', currentCount);
      
      // Populate select values 1 to 10
      for (let i = 1; i <= 10; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.innerText = `${i} Guest${i > 1 ? 's' : ''}`;
        if (i === currentCount) option.selected = true;
        select.appendChild(option);
      }
      
      select.addEventListener('change', (e) => handleGuestChange(e.target));
      tdGuests.appendChild(select);
    } else {
      tdGuests.innerHTML = `<span style="color: var(--text-muted); font-size: 0.85rem;">-</span>`;
    }
    row.appendChild(tdGuests);
    
    // Phone
    const tdPhone = document.createElement('td');
    tdPhone.innerText = entry.phone || '-';
    row.appendChild(tdPhone);
    
    // Message
    const tdMessage = document.createElement('td');
    tdMessage.style.fontSize = '0.85rem';
    tdMessage.style.color = entry.message ? 'var(--text-light)' : 'var(--text-muted)';
    tdMessage.innerText = entry.message || 'No message';
    row.appendChild(tdMessage);
    
    // Status Pill
    const tdStatus = document.createElement('td');
    if (entry.canAttend === 'Yes') {
      tdStatus.innerHTML = `<span class="status-pill attending">Attending</span>`;
    } else if (entry.cantAttend === 'Yes') {
      tdStatus.innerHTML = `<span class="status-pill declined">Declined</span>`;
    } else {
      tdStatus.innerHTML = `<span class="status-pill unmarked">Unmarked</span>`;
    }
    row.appendChild(tdStatus);
    
    tableBody.appendChild(row);
  });
}

// Inline guest count change event handler
async function handleGuestChange(selectElement) {
  const rowNumber = selectElement.getAttribute('data-row');
  const prevValue = selectElement.getAttribute('data-prev');
  const newValue = selectElement.value;
  
  selectElement.disabled = true;
  selectElement.classList.add('saving');
  
  let success = false;
  
  if (CONFIG.scriptUrl && CONFIG.scriptUrl.trim() !== "") {
    // Send update request to Google Sheet Apps Script
    const formData = new FormData();
    formData.append('action', 'updateGuests');
    formData.append('rowNumber', rowNumber);
    formData.append('guests', newValue);
    
    try {
      await fetch(CONFIG.scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });
      success = true;
    } catch (err) {
      console.error("Failed to update guest count in Google Sheet", err);
      showToast("Sheet Sync failed, but updated local console database.", "error");
    }
  }
  
  // Synchronize local states
  allSubmissions = allSubmissions.map(item => {
    if (String(item.rowNumber) === String(rowNumber)) {
      item.guests = newValue;
    }
    return item;
  });
  
  // Save locally in case we're offline
  localStorage.setItem('rsvp_submissions', JSON.stringify(allSubmissions));
  
  selectElement.setAttribute('data-prev', newValue);
  selectElement.disabled = false;
  selectElement.classList.remove('saving');
  
  processAndRender();
  showToast(`Updated row ${rowNumber} to ${newValue} guests.`);
}

// 6. Modal Settings
function initSettingsModal() {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsModal = document.getElementById('settingsModal');
  const settingsCloseBtn = document.getElementById('settingsCloseBtn');
  const settingsForm = document.getElementById('settingsForm');
  
  settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('show');
  });
  
  const closeModal = () => settingsModal.classList.remove('show');
  settingsCloseBtn.addEventListener('click', closeModal);
  
  // Click outside to close
  window.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeModal();
  });
  
  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newConfig = {
      name: document.getElementById('configCelebrantName').value.trim(),
      monogram: document.getElementById('configMonogram').value.trim(),
      username: document.getElementById('configAdminUsername').value.trim(),
      password: document.getElementById('configAdminPassword').value.trim(),
      capacity: parseInt(document.getElementById('configCapacity').value) || 150,
      baseSeats: parseInt(document.getElementById('configBaseSeats').value) || 10,
      csvUrl: document.getElementById('configCsvUrl').value.trim(),
      scriptUrl: document.getElementById('configScriptUrl').value.trim()
    };
    
    localStorage.setItem('rsvp_celebrant_config', JSON.stringify(newConfig));
    CONFIG = newConfig;
    
    // Update dashboard Title Name immediately
    document.getElementById('dashboardTitleName').innerText = CONFIG.name;
    
    closeModal();
    showToast("Configurations updated successfully!");
    loadRSVPData(); // reload based on new URL settings
  });
}

// 7. Authentication Controller
function initAuth() {
  const loginOverlay = document.getElementById('loginOverlay');
  const dashboardScreen = document.getElementById('dashboardScreen');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  
  // Check if session is already unlocked
  if (sessionStorage.getItem('rsvp_console_unlocked') === 'true') {
    loginOverlay.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    loadRSVPData();
  }
  
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value;
    
    if (user.toLowerCase() === CONFIG.username.toLowerCase() && pass === CONFIG.password) {
      sessionStorage.setItem('rsvp_console_unlocked', 'true');
      loginError.classList.add('hidden');
      
      // Hide login and show dashboard with slide animation
      loginOverlay.style.opacity = '0';
      setTimeout(() => {
        loginOverlay.classList.add('hidden');
        dashboardScreen.classList.remove('hidden');
        loadRSVPData();
      }, 300);
    } else {
      loginError.classList.remove('hidden');
      document.getElementById('password').value = ""; // clear password field
    }
  });
  
  // Logout handler
  document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('rsvp_console_unlocked');
    document.getElementById('password').value = "";
    dashboardScreen.classList.add('hidden');
    loginOverlay.style.opacity = '1';
    loginOverlay.classList.remove('hidden');
    showToast("Console locked. Logged out successfully.");
  });
}

// 8. Search and Filter Event Listeners
function initTableControls() {
  document.getElementById('tableSearch').addEventListener('input', processAndRender);
  document.getElementById('tableFilter').addEventListener('change', processAndRender);
  document.getElementById('refreshBtn').addEventListener('click', loadRSVPData);
}

// 9. Document Entry Point
document.addEventListener('DOMContentLoaded', () => {
  initStars();
  loadConfig();
  initAuth();
  initSettingsModal();
  initTableControls();
});
