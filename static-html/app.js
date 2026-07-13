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

// 2. Countdown Timer
function initCountdown() {
  const targetDate = new Date('August 22, 2026 18:00:00').getTime();
  
  function updateTimer() {
    const now = new Date().getTime();
    const difference = targetDate - now;
    
    if (difference <= 0) {
      document.getElementById('days').innerText = '00';
      document.getElementById('hours').innerText = '00';
      document.getElementById('minutes').innerText = '00';
      document.getElementById('seconds').innerText = '00';
      clearInterval(timerInterval);
      return;
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    document.getElementById('days').innerText = String(days).padStart(2, '0');
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
  }
  
  updateTimer(); // run once immediately
  const timerInterval = setInterval(updateTimer, 1000);
}

// 3. Toast Notifications
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');
  
  toastMessage.innerText = message;
  toast.className = `toast show ${type}`;
  
  if (type === 'success') {
    toastIcon.className = 'fa-solid fa-circle-check';
  } else {
    toastIcon.className = 'fa-solid fa-triangle-exclamation';
  }
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

// 4. RSVP Form Logic
function initRSVPForm() {
  const rsvpForm = document.getElementById('rsvpForm');
  if (!rsvpForm) return;

  const attendanceBtns = document.querySelectorAll('.attendance-btn');
  const attendingFields = document.getElementById('attendingFields');
  const guestCountInput = document.getElementById('guestCount');
  const guestPhoneInput = document.getElementById('guestPhone');
  let selectedChoice = null; // 'yes' or 'no'

  // Handle Yes/No button toggle
  attendanceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      attendanceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedChoice = btn.getAttribute('data-choice');

      if (selectedChoice === 'yes') {
        attendingFields.style.display = 'block';
        guestCountInput.required = true;
        guestPhoneInput.required = true;
      } else {
        attendingFields.style.display = 'none';
        guestCountInput.required = false;
        guestPhoneInput.required = false;
        // reset fields
        guestCountInput.value = "1";
        guestPhoneInput.value = "";
      }
    });
  });

  // Handle Form Submission
  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedChoice) {
      showToast('Please select if you will be attending or not.', 'error');
      return;
    }

    const name = document.getElementById('guestName').value.trim();
    const guests = selectedChoice === 'yes' ? guestCountInput.value : '0';
    const phone = selectedChoice === 'yes' ? guestPhoneInput.value.trim() : '';
    const message = document.getElementById('guestMessage').value.trim();

    if (!name) {
      showToast('Please fill out your full name.', 'error');
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Submitting response...';

    // Retrieve settings config from localStorage to check if Apps Script URL is set
    const savedConfig = localStorage.getItem('rsvp_celebrant_config');
    let scriptUrl = '';
    
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        scriptUrl = parsed.scriptUrl || '';
      } catch (err) {
        console.error('Error parsing config', err);
      }
    }

    // Prepare sheet columns: Name, Number of Guest, Phone , Message, I can attend, I cant attend
    const rsvpData = {
      name: name,
      guests: guests,
      phone: phone,
      message: message,
      canAttend: selectedChoice === 'yes' ? 'Yes' : '',
      cantAttend: selectedChoice === 'no' ? 'Yes' : ''
    };

    let apiSuccess = false;

    // Send to Google Sheets Apps Script if configured
    if (scriptUrl && scriptUrl.trim() !== '') {
      const formData = new FormData();
      formData.append('action', 'submitRsvp');
      formData.append('name', rsvpData.name);
      formData.append('guests', rsvpData.guests);
      formData.append('phone', rsvpData.phone);
      formData.append('message', rsvpData.message);
      formData.append('canAttend', rsvpData.canAttend);
      formData.append('cantAttend', rsvpData.cantAttend);

      try {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: formData
        });
        apiSuccess = true;
      } catch (error) {
        console.error('Error submitting RSVP to Google Sheet:', error);
        showToast('Sheet submit error, but saved locally!', 'error');
      }
    }

    // Always save to LocalStorage so mock data works immediately
    try {
      const localSubmissions = localStorage.getItem('rsvp_submissions') 
        ? JSON.parse(localStorage.getItem('rsvp_submissions')) 
        : [];
      
      // Mimic sheet row numbers (2-indexed)
      const nextRow = localSubmissions.length + 2;
      
      localSubmissions.push({
        rowNumber: nextRow,
        name: rsvpData.name,
        guests: rsvpData.guests,
        phone: rsvpData.phone,
        message: rsvpData.message,
        canAttend: rsvpData.canAttend,
        cantAttend: rsvpData.cantAttend
      });
      
      localStorage.setItem('rsvp_submissions', JSON.stringify(localSubmissions));
    } catch (err) {
      console.error('Failed to save RSVP locally:', err);
    }

    // Success response handling
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Send RSVP Response';
      
      if (selectedChoice === 'yes') {
        showToast(`Thank you! See you at the Debut, ${name}!`);
      } else {
        showToast(`Thank you for informing us, ${name}. We will miss you!`);
      }

      // Reset form fields
      rsvpForm.reset();
      attendanceBtns.forEach(b => b.classList.remove('active'));
      selectedChoice = null;
      attendingFields.style.display = 'block'; // reset default state
    }, 800);
  });
}

// 5. Initialize Page
document.addEventListener('DOMContentLoaded', () => {
  initStars();
  initCountdown();
  initRSVPForm();
  
  // Custom theme personalization based on saved settings
  const savedConfig = localStorage.getItem('rsvp_celebrant_config');
  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig);
      
      // Update celebrant names and titles dynamically if config exists
      if (parsed.name) {
        const inviteTitle = document.querySelector('.invitation-title');
        const inviteName = document.querySelector('.invitation-header h2');
        const programFlow = document.querySelector('.program-flow');
        const programTitle = (programFlow && programFlow.previousElementSibling) ? programFlow.previousElementSibling.querySelector('h2') : null;
        const programDesc = (programFlow && programFlow.previousElementSibling) ? programFlow.previousElementSibling.querySelector('p') : null;
        const rsvpTitle = document.querySelector('#rsvp h2');
        const rsvpDesc = document.querySelector('#rsvp p');
        const messageInput = document.getElementById('guestMessage');
        
        if (inviteTitle) inviteTitle.innerHTML = `${parsed.name} @ 18`;
        if (inviteName) inviteName.innerHTML = `${parsed.name} Alexandra Castillo`;
        if (programTitle) programTitle.innerHTML = `The Debut Program`;
        if (programDesc) programDesc.innerHTML = `Honoring the key participants in ${parsed.name}'s milestone celebrations.`;
        if (rsvpTitle) rsvpTitle.innerHTML = `Kindly RSVP`;
        if (rsvpDesc) rsvpDesc.innerHTML = `Please fill out the form below by October 1st, 2026 to confirm your attendance.`;
        if (messageInput) messageInput.placeholder = `Send a heartwarming message to ${parsed.name}...`;
      }
      
      if (parsed.monogram) {
        const monogramEl = document.querySelector('.invitation-logo span');
        if (monogramEl) monogramEl.innerText = parsed.monogram;
      }
    } catch (err) {
      console.warn('Error reading dynamic invitation configuration:', err);
    }
  }
});
