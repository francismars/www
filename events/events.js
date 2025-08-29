// Events Page JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Initialize the page
  initializeEventsPage();
  
  // Set header text directly
  const text = "Bitcoin | Lightning | Nostr";
  const typedMain = document.getElementById("typed-main");
  if (typedMain) {
    typedMain.textContent = text;
  }
});

function initializeEventsPage() {
  // Render events
  renderUpcomingEvents();
  renderPastEvents();
  
  // Initialize calendar
  initializeCalendar();
  
  // Initialize map
  initializeMap();
  
  // Initialize filters
  initializeFilters();
  
  // Initialize form submission
  initializeEventForm();
  
  // Initialize donation form with a small delay to ensure DOM is ready
  setTimeout(() => {
    initializeDonationForm();
  }, 100);
  
  // Initialize navigation
  initializeNavigation();
}

function renderUpcomingEvents() {
  const container = document.getElementById("upcoming-events-list");
  if (!container) return;
  
  container.innerHTML = "";
  
  // Filter upcoming events and sort by date (earliest first)
  const currentDate = getCurrentDate();
  const upcomingEvents = eventsData.filter(event => event.date >= currentDate);
  const sortedEvents = upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  sortedEvents.forEach(event => {
    const eventCard = createEventCard(event);
    container.appendChild(eventCard);
  });
}

function renderPastEvents() {
  const container = document.getElementById("past-events-list");
  if (!container) return;
  
  container.innerHTML = "";
  
  // Filter past events and sort by date (most recent first)
  const currentDate = getCurrentDate();
  const pastEvents = eventsData.filter(event => event.date < currentDate);
  const sortedEvents = pastEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  sortedEvents.forEach(event => {
    const eventCard = createEventCard(event, true);
    container.appendChild(eventCard);
  });
}

function createEventCard(event, isPast = false) {
  const card = document.createElement("div");
  card.className = `event-card ${event.type} ${event.featured ? 'featured' : ''} ${isPast ? 'past' : ''}`;
  card.style.cursor = 'pointer';
  
  const dateRange = event.endDate 
    ? `${formatDate(event.date)} - ${formatDate(event.endDate)}`
    : formatDate(event.date);
  
  card.innerHTML = `
    <div class="event-header">
      <div class="event-type-badge ${event.type}">${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</div>
      ${event.featured ? '<div class="featured-badge">Featured</div>' : ''}
    </div>

    <h3 class="event-title">${event.name}</h3>
    <div class="event-date">${dateRange}</div>
    <div class="event-location">📍 ${event.location}</div>
    <div class="event-preview">
      <p class="event-description-preview">${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}</p>
    </div>
    <div class="event-actions">
      <span class="click-hint">Click for details</span>
    </div>
  `;
  
  // Add click event to show full event details
  card.addEventListener('click', () => {
    showEventDetails(event);
  });
  
  return card;
}

function initializeFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const eventsList = document.getElementById('upcoming-events-list');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      const filter = this.getAttribute('data-filter');
      filterEvents(filter);
    });
  });
}

function filterEvents(filter) {
  const eventsList = document.getElementById('upcoming-events-list');
  const events = eventsList.querySelectorAll('.event-card');
  
  events.forEach(event => {
    if (filter === 'all' || event.classList.contains(filter)) {
      event.style.display = 'block';
    } else {
      event.style.display = 'none';
    }
  });
}

function initializeCalendar() {
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();
  
  function renderCalendar() {
    const monthDisplay = document.getElementById('current-month');
    const calendarGrid = document.getElementById('calendar-grid');
    
    monthDisplay.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
    calendarGrid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-day-header';
      dayHeader.textContent = day;
      calendarGrid.appendChild(dayHeader);
    });
    
    // Get calendar data
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day empty';
      calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'calendar-day';
      dayCell.textContent = day;
      
      // Check if there are events on this day
      const eventsOnDay = getEventsOnDay(currentYear, currentMonth, day);
      if (eventsOnDay.length > 0) {
        dayCell.classList.add('has-events');
        
        // Create detailed tooltip with event names
        const eventNames = eventsOnDay.map(event => event.name).join('\n');
        dayCell.title = `${eventsOnDay.length} event(s):\n${eventNames}`;
        
        // Add click event to show event details (only once)
        dayCell.addEventListener('click', function() {
          // Prevent multiple modals from opening
          if (document.querySelector('.calendar-event-modal')) {
            return;
          }
          showEventsForDay(eventsOnDay, currentYear, currentMonth, day);
        });
      }
      
      calendarGrid.appendChild(dayCell);
    }
  }
  
  // Navigation buttons
  document.getElementById('prev-month').addEventListener('click', function() {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });
  
  document.getElementById('next-month').addEventListener('click', function() {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });
  
  // Initial render
  renderCalendar();
}

function getEventsOnDay(year, month, day) {
  const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const events = [];
  const eventIds = new Set(); // Track event IDs to prevent duplicates
  
  // Check all events
  eventsData.forEach(event => {
    // Check if date falls within range (including start and end dates)
    if (event.date <= dateString && (!event.endDate || event.endDate >= dateString)) {
      // Only add if we haven't seen this event before
      if (!eventIds.has(event.id)) {
        events.push(event);
        eventIds.add(event.id);
      }
    }
  });
  
  return events;
}

function initializeMap() {
  // Initialize Leaflet map
  const map = L.map('events-map').setView([20, 0], 2);
  
  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);
  
  // Store markers by type for toggling visibility
  window.mapMarkers = {
    map: map,
    upcoming: [],
    past: [],
    featured: []
  };
  
  // Add event markers
  eventsData.forEach(event => {
    const marker = createEventMarker(event, map);
    if (marker) {
      marker.addTo(map);
      
      // Categorize marker by type
      const currentDate = getCurrentDate();
      const isUpcoming = event.date >= currentDate;
      const isFeatured = event.featured;
      
      if (isFeatured) {
        window.mapMarkers.featured.push(marker);
      } else if (isUpcoming) {
        window.mapMarkers.upcoming.push(marker);
      } else {
        window.mapMarkers.past.push(marker);
      }
    }
  });
  
  // Initialize legend click handlers
  initializeMapLegend();
  
  // Initialize donation form with a small delay to ensure DOM is ready
  setTimeout(() => {
    initializeDonationForm();
  }, 100);
  

}

function initializeMapLegend() {
  const legendItems = document.querySelectorAll('.legend-item');
  
  legendItems.forEach(item => {
    item.addEventListener('click', function() {
      const eventType = this.getAttribute('data-event-type');
      toggleMapLayer(eventType, this);
    });
  });
}

function toggleMapLayer(eventType, legendItem) {
  const markers = window.mapMarkers[eventType];
  if (!markers) return;
  
  const isVisible = !legendItem.classList.contains('disabled');
  
  if (isVisible) {
    // Hide markers
    markers.forEach(marker => {
      marker.remove();
    });
    legendItem.classList.add('disabled');
  } else {
    // Show markers
    markers.forEach(marker => {
      marker.addTo(window.mapMarkers.map);
    });
    legendItem.classList.remove('disabled');
  }
}

// Donation form functionality
function initializeDonationForm() {
  console.log('🔧 Initializing donation form...');
  
  // Get form elements
  const amountButtons = document.querySelectorAll('.amount-btn');
  const customAmountInput = document.getElementById('custom-amount-input');
  const selectedAmountSpan = document.getElementById('selected-amount');
  const submitBtn = document.getElementById('donation-submit-btn');
  
  console.log('🔍 Found elements:', {
    amountButtons: amountButtons.length,
    customAmountInput: !!customAmountInput,
    selectedAmountSpan: !!selectedAmountSpan,
    submitBtn: !!submitBtn
  });
  
  // Check if elements exist
  if (!amountButtons.length || !selectedAmountSpan || !submitBtn) {
    console.error('❌ Required donation form elements not found');
    return;
  }
  
  let selectedAmount = 1000; // Default amount
  
  // Amount button click handlers
  amountButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active class from all buttons
      amountButtons.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      selectedAmount = parseInt(this.getAttribute('data-amount'));
      if (selectedAmountSpan) {
        selectedAmountSpan.textContent = selectedAmount.toLocaleString();
      }
      
      // Clear custom amount input
      if (customAmountInput) {
        customAmountInput.value = '';
      }
    });
  });
  
  // Custom amount input handler
  if (customAmountInput) {
    customAmountInput.addEventListener('input', function() {
      const customAmount = parseInt(this.value);
      if (customAmount >= 100) {
        selectedAmount = customAmount;
        if (selectedAmountSpan) {
          selectedAmountSpan.textContent = customAmount.toLocaleString();
        }
        
        // Remove active class from all buttons
        amountButtons.forEach(b => b.classList.remove('active'));
      }
    });
  }
  
  // Set first button as active by default
  if (amountButtons.length > 0) {
    amountButtons[0].classList.add('active');
  }
  
  // Add form submit event listener
  const donationForm = document.getElementById('donation-form');
  if (donationForm) {
    donationForm.addEventListener('submit', handleDonation);
  }
}

// Handle donation form submission
async function handleDonation(event) {
  event.preventDefault();
  console.log('🎯 Donation form submitted');
  
  // Check if all required elements exist
  const nameInput = document.getElementById('donation-name');
  const emailInput = document.getElementById('donation-email');
  const messageInput = document.getElementById('donation-message');
  const selectedAmountSpan = document.getElementById('selected-amount');
  
  console.log('🔍 Form elements found:', {
    nameInput: !!nameInput,
    emailInput: !!emailInput,
    messageInput: !!messageInput,
    selectedAmountSpan: !!selectedAmountSpan
  });
  
  if (!nameInput || !emailInput || !messageInput || !selectedAmountSpan) {
    console.error('❌ Required donation form elements not found');
    return false;
  }
  
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const message = messageInput.value.trim();
  const amount = parseInt(selectedAmountSpan.textContent.replace(/,/g, ''));
  
  if (amount < 100) {
    alert('Please select a valid donation amount (minimum 100 sats)');
    return false;
  }
  
  const submitButton = event.target.querySelector('#donation-submit-btn');
  if (!submitButton) {
    console.error('Submit button not found');
    return false;
  }
  
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = 'Processing Donation...';
  submitButton.disabled = true;
  
  // Prepare message for zap
  let fullMessage = message;
  if (email) fullMessage = `email: ${email}\n` + fullMessage;
  if (name) fullMessage = `name: ${name}\n` + fullMessage;
  
  if (fullMessage.length > 200) {
    alert("Message too long! (including name/email)");
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
    return false;
  }
  
  const relays = [
    "wss://relay.damus.io",
    "wss://relay.primal.net",
    "wss://relay.nostr.band/",
    "wss://relay.nostr.nu/",
  ];
  const recipientNpub = "npub1t5atsakzq63h45asjn3qhlpeg80nlgs6zkkgafmddyvywdufv6dqxfahcl";
  const zapAmountMilliSats = amount * 1000;
  
  try {
    const pool = new NostrTools.SimplePool();
    const { type, data: recipientHexPubkey } = NostrTools.nip19.decode(recipientNpub);
    if (type !== "npub") throw new Error("Invalid recipient npub.");
    
    console.log("Fetching recipient profile...");
    const userEvent = await pool.get(relays, {
      kinds: [0],
      authors: [recipientHexPubkey],
    });
    if (!userEvent)
      throw new Error("Recipient profile not found on specified relays.");
    
    const metadata = JSON.parse(userEvent.content);
    const lud16 = metadata.lud16 || metadata.lud06;
    if (!lud16)
      throw new Error("Lightning address not found in recipient profile.");
    
    console.log(`Found Lightning Address: ${lud16}`);
    let zapEndpoint;
    if (lud16) {
      const [name, domain] = lud16.split("@");
      zapEndpoint = `https://${domain}/.well-known/lnurlp/${name}`;
    } else {
      throw new Error("No lud16 found in profile (lud06 not supported in this demo).");
    }
    
         console.log("Zap endpoint:", zapEndpoint);
    console.log("recipientHexPubkey:", recipientHexPubkey)
     // Create the zap request event manually since makeZapRequest has different parameters
     const unsignedZapRequest = NostrTools.nip57.makeZapRequest({
      pubkey: recipientHexPubkey,
      amount: zapAmountMilliSats,
      relays,
    });
     
     //console.log("Zap request event:", unsignedZapRequest);
     
     // Generate a random keypair and sign the zap request
     const randomPrivKey = NostrTools.generateSecretKey();
     const randomPubKey = NostrTools.getPublicKey(randomPrivKey);
     
     //console.log("Random pubkey:", randomPubKey);
     //console.log("Recipient hex pubkey:", recipientHexPubkey);
     
     const signedZapRequest = NostrTools.finalizeEvent(
       { ...unsignedZapRequest, pubkey: randomPubKey },
       randomPrivKey
     );
     
     //console.log("Signed zap request:", signedZapRequest);
     
     // Use signedZapRequest.id in your subscription filter
     const zapRequestString = encodeURIComponent(JSON.stringify(signedZapRequest));
     
     // Create the callback URL with the zap request
     const callbackUrl = `${zapEndpoint}?amount=${zapAmountMilliSats}&comment=${encodeURIComponent(fullMessage)}&nostr=${zapRequestString}`;
     
     //console.log("Callback URL:", callbackUrl);
    
    // Fetch the invoice
    const invoiceRes = await fetch(callbackUrl);
    if (!invoiceRes.ok) {
      throw new Error(`HTTP error! status: ${invoiceRes.status}`);
    }
    
    const invoiceData = await invoiceRes.json();
    //console.log("Invoice response:", invoiceData);
    
    if (invoiceData.pr) {
      // Show donation invoice section
      document.getElementById('donation-invoice-section').style.display = 'block';
      document.getElementById('donation-invoice-string').textContent = invoiceData.pr;
      
      // Generate QR code if QRCode library is available
      if (window.QRCode) {
        document.getElementById('donation-invoice-qr').innerHTML = '';
        new QRCode(document.getElementById('donation-invoice-qr'), {
          text: invoiceData.pr,
          width: 250,
          height: 250,
          colorDark: "#000000",
          colorLight: "#FFFFFF",
          correctLevel: QRCode.CorrectLevel.H,
        });
      }
      
      // Add event listeners for close and copy buttons
      document.getElementById('close-donation-invoice').addEventListener('click', function() {
        const invoiceSection = document.getElementById('donation-invoice-section');
        if (invoiceSection) {
          invoiceSection.style.display = 'none';
        }
        
        // Reset button states
        const amountButtons = document.querySelectorAll('.amount-btn');
        if (amountButtons.length > 0) {
          amountButtons.forEach(b => b.classList.remove('active'));
          amountButtons[0].classList.add('active');
        }
        
        // Reset selected amount display
        const selectedAmountSpan = document.getElementById('selected-amount');
        if (selectedAmountSpan) {
          selectedAmountSpan.textContent = '1,000';
        }
        
        // Clear form inputs but keep the form structure
        const nameInput = document.getElementById('donation-name');
        const emailInput = document.getElementById('donation-email');
        const messageInput = document.getElementById('donation-message');
        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        if (messageInput) messageInput.value = '';
      });
      
      document.getElementById('copy-donation-invoice').addEventListener('click', function() {
        const invoiceText = document.getElementById('donation-invoice-string').textContent;
        navigator.clipboard.writeText(invoiceText)
          .then(function() {
            const copyBtn = document.getElementById('copy-donation-invoice');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.background = '#22c55e';
            setTimeout(function() {
              copyBtn.textContent = originalText;
              copyBtn.style.background = 'var(--accent)';
            }, 2000);
          })
          .catch(function(err) {
            console.error('Failed to copy: ', err);
            alert('Failed to copy invoice. Please copy it manually.');
          });
      });
      
      console.log("Donation zap request created successfully");
      
      // Start monitoring for zap completion
      monitorZapCompletion(signedZapRequest.id);
    } else {
      alert("Failed to generate invoice. Please try again.");
      console.error("No invoice in response:", invoiceData);
    }
  } catch (err) {
    alert("Error creating zap request: " + err.message);
    console.error("Error details:", err);
  } finally {
    // Reset button if it still exists
    if (submitButton) {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  }
  
  return false;
}

// Show zap success message
function showZapSuccess() {
  console.log("🚀 showZapSuccess function started");
  
  // Create a temporary success message
  const successMsg = document.createElement('div');
  successMsg.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #22c55e;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideInRight 0.3s ease;
  `;
  successMsg.textContent = '🎉 Donation received! Thank you for your support.';
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(successMsg);
  console.log("✅ Success message added to DOM");
  
  // Remove after 5 seconds
  setTimeout(() => {
    successMsg.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      if (successMsg.parentNode) {
        successMsg.parentNode.removeChild(successMsg);
      }
    }, 300);
  }, 5000);
  
  // Add slide out animation
  const slideOutStyle = document.createElement('style');
  slideOutStyle.textContent = `
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(slideOutStyle);
}

// Monitor zap completion and automatically close the invoice section
function monitorZapCompletion(zapRequestId) {
  console.log("Starting zap monitoring for request ID:", zapRequestId);
  const recipientNpub = "npub1t5atsakzq63h45asjn3qhlpeg80nlgs6zkkgafmddyvywdufv6dqxfahcl";

  const { type, data: recipientHexPubkey } = NostrTools.nip19.decode(recipientNpub);
  //console.log("Monitoring for zaps to hex pubkey:", recipientHexPubkey);

  // Create a new pool for monitoring
  const monitorPool = new NostrTools.SimplePool();
  
  // Test the subscription by also listening for any kind 9735 events
  //console.log("Setting up subscription for zap events...");

    // Now listen for zap events specifically to our zap request
  const subscription = monitorPool.subscribeMany(
    [
      "wss://relay.damus.io",
      "wss://relay.primal.net", 
      "wss://relay.nostr.band/",
      "wss://relay.nostr.nu/",
    ],
    [
      {
        kinds: [9735], // Zap event kind
        "#p": [recipientHexPubkey], // Filter for events to our pubkey
      },
    ],
    {
      onevent(zapEvent) {
        try {
          // Check if this zap event references our zap request
          const eventTags = zapEvent.tags;
          const descriptionTag = eventTags.find(tag => tag[0] === 'description');
          
          //console.log("Looking for description tag with zap request ID:", zapRequestId);
          //console.log("Found description tag:", descriptionTag);
          
          if (descriptionTag && descriptionTag[1]) {
            // Parse the description tag which contains the kind 9734 zap request
            const zapRequestData = JSON.parse(descriptionTag[1]);
            //console.log("Parsed zap request data:", zapRequestData);
            
            // Check if the zap request ID matches our expected ID
                         if (zapRequestData.id === zapRequestId) {
               console.log("✅ MATCH FOUND! This zap event references our zap request!");
               
               // Check for bolt11 tag which contains the invoice
               const bolt11Tag = eventTags.find(tag => tag[0] === 'bolt11');
               console.log("Bolt11 tag:", bolt11Tag);
               
               if (bolt11Tag && bolt11Tag[1]) {
                 console.log("🎉 Zap completed! Invoice:", bolt11Tag[1]);
                 
                                   // Automatically close the invoice section
                  const invoiceSection = document.getElementById('donation-invoice-section');
                  if (invoiceSection) {
                    invoiceSection.style.display = 'none';
                  }
                  

                  
                  // Reset button states
                  const amountButtons = document.querySelectorAll('.amount-btn');
                  if (amountButtons.length > 0) {
                    amountButtons.forEach(b => b.classList.remove('active'));
                    amountButtons[0].classList.add('active');
                  }
                  
                  // Reset selected amount display
                  const selectedAmountSpan = document.getElementById('selected-amount');
                  if (selectedAmountSpan) {
                    selectedAmountSpan.textContent = '1,000';
                  }
                  
                  // Clear form inputs but keep the form structure
                  const nameInput = document.getElementById('donation-name');
                  const emailInput = document.getElementById('donation-email');
                  const messageInput = document.getElementById('donation-message');
                  if (nameInput) nameInput.value = '';
                  if (emailInput) emailInput.value = '';
                  if (messageInput) messageInput.value = '';
                  

                  
                  // Show success message
                  console.log("🎯 About to call showZapSuccess()...");
                  showZapSuccess();
                  console.log("🎯 showZapSuccess() called!");
                  
                  // Close the subscription if it has a close method
                  if (subscription && typeof subscription.close === 'function') {
                    console.log("📡 Closing Subscription with close()");
                    subscription.close();
                  } else if (subscription && typeof subscription.unsubscribe === 'function') {
                   console.log("📡 Closing Subscription with unsubscribe()");
                    subscription.unsubscribe();
                  } else {
                    console.log("📡 Subscription object:", subscription);
                    console.log("📡 No close/unsubscribe method found, subscription will remain active");
                  }
               } else {
                 console.log("❌ No bolt11 tag found in zap event");
                 console.log("Available tags:", eventTags.map(tag => `${tag[0]}: ${tag[1]}`));
               }
            } else {
               //console.log("❌ No match - zap request ID doesn't match");
            }
          } else {
            console.log("❌ No description tag found in zap event");
          }
        } catch (error) {
          console.error("Error parsing zap event:", error);
        }
      },
      oneose() {
        console.log("📡 EOS for zap monitoring subscription");
      },
      onclosed() {
        console.log("📡 Zap monitoring subscription closed");
      }
    }
  );
    
  // Set a timeout to stop monitoring after 10 minutes
  setTimeout(() => {
    console.log("Zap monitoring timeout reached");
    // Close the subscription if it has a close method
    if (subscription && typeof subscription.close === 'function') {
      subscription.close();
    } else if (subscription && typeof subscription.unsubscribe === 'function') {
      subscription.unsubscribe();
    } else {
      console.log("📡 Timeout reached but no close/unsubscribe method found");
    }
  }, 10 * 60 * 1000);
}

function createEventMarker(event, map) {
  // Get coordinates from event data
  const coords = event.coordinates;
  if (!coords) return null;
  
  const currentDate = getCurrentDate();
  const isUpcoming = event.date >= currentDate;
  const isFeatured = event.featured;
  
  // Determine marker color
  let markerColor = '#6b7280'; // past events
  if (isFeatured) {
    markerColor = '#f59e0b'; // featured events
  } else if (isUpcoming) {
    markerColor = '#2563eb'; // upcoming events (using a blue that works well on maps)
  }
  
  // Create custom icon for the marker
  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 16px; 
      height: 16px; 
      background: ${markerColor}; 
      border: 2px solid white; 
      border-radius: 50%; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: pointer;
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
  
  // Create Leaflet marker
  const marker = L.marker([coords.lat, coords.lng], { icon: customIcon });
  
  // Create popup content
  const popupContent = `
    <div style="min-width: 200px;">
      <h4 style="margin: 0 0 8px 0; color: var(--text-color);">${event.name}</h4>
      <p style="margin: 0 0 8px 0; color: var(--muted-text); font-size: 0.9rem;">
        📅 ${event.date}${event.endDate ? ` - ${event.endDate}` : ''}
      </p>
      <p style="margin: 0 0 8px 0; color: var(--muted-text); font-size: 0.9rem;">
        📍 ${event.location}
      </p>
      <p style="margin: 0 0 12px 0; color: var(--muted-text); font-size: 0.9rem; line-height: 1.4;">
        ${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}
      </p>
      <div style="display: flex; gap: 8px;">
        ${event.website ? `<a href="${event.website}" target="_blank" style="
          background: var(--accent); 
          color: white; 
          padding: 6px 12px; 
          border-radius: 6px; 
          text-decoration: none; 
          font-size: 0.8rem;
          font-weight: 500;
        ">Website</a>` : ''}
        <button onclick="showEventDetails(${JSON.stringify(event).replace(/"/g, '&quot;')})" style="
          background: transparent; 
          color: var(--accent); 
          border: 1px solid var(--accent); 
          padding: 6px 12px; 
          border-radius: 6px; 
          cursor: pointer; 
          font-size: 0.8rem;
          font-weight: 500;
        ">Details</button>
      </div>
    </div>
  `;
  
  marker.bindPopup(popupContent);
  
  // Remove the duplicate click event - now only the popup will show
  // Users can click the "Details" button in the popup to see full event details
  
  return marker;
}

// Coordinates are now stored directly in each event object

function showEventDetails(event) {
  // Prevent multiple modals from opening
  if (document.querySelector('.event-details-modal')) {
    return;
  }
  
  const dateRange = event.endDate 
    ? `${formatDate(event.date)} - ${formatDate(event.endDate)}`
    : formatDate(event.date);
  
  // Create modal for event details
  const modal = document.createElement('div');
  modal.className = 'event-details-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <div class="event-header-info">
          <div class="event-type-badge ${event.type}">${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</div>
          ${event.featured ? '<div class="featured-badge">Featured</div>' : ''}
        </div>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        <h2 class="event-title">${event.name}</h2>
        <div class="event-meta">
          <div class="event-date">📅 ${dateRange}</div>
          <div class="event-location">📍 ${event.location}</div>
        </div>
        <div class="event-description-full">
          <p>${event.description}</p>
        </div>
        <div class="event-links">
          ${event.website ? `<a href="${event.website}" target="_blank" class="event-link website">Visit Website</a>` : ''}
          ${event.contact ? `<a href="mailto:${event.contact}" class="event-link contact">Contact Organizer</a>` : ''}
        </div>
      </div>
    </div>
  `;
  
  // Add close functionality
  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // Close when clicking outside modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
  
  // Add to page
  document.body.appendChild(modal);
}

function showEventsForDay(events, year, month, day) {
  // Prevent multiple modals from opening
  if (document.querySelector('.calendar-event-modal')) {
    return;
  }
  
  const dateString = `${getMonthName(month)} ${day}, ${year}`;
  
  // Create modal or popup to show events
  const modal = document.createElement('div');
  modal.className = 'calendar-event-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Events on ${dateString}</h3>
        <button class="modal-close">&times;</button>
      </div>
      <div class="modal-body">
        ${events.map(event => `
          <div class="modal-event-item">
            <h4>${event.name}</h4>
            <p class="event-location">📍 ${event.location}</p>
            <p class="event-description">${event.description}</p>
            ${event.website ? `<a href="${event.website}" target="_blank" class="event-link website">Website</a>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // Add close functionality
  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // Close when clicking outside modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
  
  // Add to page
  document.body.appendChild(modal);
}

function initializeEventForm() {
  const form = document.getElementById('event-submit-form');
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const eventData = {
      name: formData.get('event-name'),
      date: formData.get('event-date'),
      type: formData.get('event-type'),
      location: formData.get('event-location'),
      description: formData.get('event-description'),
      website: formData.get('event-website'),
      contact: formData.get('event-contact')
    };
    
    // Here you would typically send the data to a server
    // For now, we'll just show a success message
    showFormSuccess();
    form.reset();
  });
}

function showFormSuccess() {
  const form = document.getElementById('event-submit-form');
  const submitBtn = form.querySelector('.submit-btn');
  const originalText = submitBtn.textContent;
  
  submitBtn.textContent = 'Event Submitted!';
  submitBtn.style.backgroundColor = '#22c55e';
  
  setTimeout(() => {
    submitBtn.textContent = originalText;
    submitBtn.style.backgroundColor = '';
  }, 3000);
}

function initializeNavigation() {
  const sections = ['upcoming', 'past', 'calendar', 'map', 'submit', 'support'];
  const navLinks = Array.from(document.querySelectorAll('.navbar a'));
  
  // Add click event to navbar profile name to scroll to top
  const profileName = document.getElementById('navbar-profile-name');
  if (profileName) {
    profileName.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    profileName.style.cursor = 'pointer';
  }
  
  // Initialize collapsible sections
  initializeCollapsibleSections();
  
  function onScroll() {
    let scrollPos = window.scrollY + 120;
    let active = null;
    
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollPos) active = id;
    }
    
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        link.classList.toggle('active', href === '#' + active);
      }
    });
  }
  
  window.addEventListener('scroll', onScroll);
  onScroll();
  
  // Mobile navigation
  const burger = document.querySelector('.navbar-burger');
  const links = document.getElementById('navbar-links');
  
  if (burger && links) {
    burger.addEventListener('click', function() {
      const expanded = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', !expanded);
      links.classList.toggle('open');
      burger.classList.toggle('open');
    });
  }
  
  // Close mobile menu when clicking on links
  document.querySelectorAll('#navbar-links a').forEach((link) => {
    link.addEventListener('click', () => {
      if (links.classList.contains('open')) {
        links.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

function initializeCollapsibleSections() {
  // Add click events to section headers
  document.querySelectorAll('.section-header').forEach(header => {
    const section = header.closest('.section');
    const collapseBtn = header.querySelector('.collapse-btn');
    const sectionId = section.id;
    
    // Check if section was previously collapsed or should start collapsed by default
    const wasCollapsed = localStorage.getItem(`section_${sectionId}_collapsed`);
    const shouldStartCollapsed = wasCollapsed === 'true' || 
                                                                 (wasCollapsed === null && (sectionId === 'past' || sectionId === 'submit' || sectionId === 'support'));
    
    if (shouldStartCollapsed) {
      section.classList.add('collapsed');
      const icon = collapseBtn.querySelector('.collapse-icon');
      icon.textContent = '+';
      // Save the collapsed state for sections that start collapsed by default
      if (wasCollapsed === null) {
        localStorage.setItem(`section_${sectionId}_collapsed`, 'true');
      }
    }
    
    // Header click toggles section
    header.addEventListener('click', (e) => {
      // Don't toggle if clicking the collapse button directly
      if (e.target.closest('.collapse-btn')) return;
      
      toggleSection(section, collapseBtn);
    });
    
    // Collapse button click
    collapseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSection(section, collapseBtn);
    });
  });
}

function toggleSection(section, collapseBtn) {
  const sectionId = section.id;
  const icon = collapseBtn.querySelector('.collapse-icon');
  const isCollapsed = section.classList.contains('collapsed');
  
  if (isCollapsed) {
    // Expand section
    section.classList.remove('collapsed');
    icon.textContent = '−';
    localStorage.setItem(`section_${sectionId}_collapsed`, 'false');
  } else {
    // Collapse section
    section.classList.add('collapsed');
    icon.textContent = '+';
    localStorage.setItem(`section_${sectionId}_collapsed`, 'true');
  }
}

// Helper functions for date handling
function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getMonthName(monthIndex) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}


