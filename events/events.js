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
  // Load favorites from localStorage
  loadFavorites();
  
  // Display last modified info
  displayLastModifiedInfo();
  
  // Fetch actual last modified date
  fetchLastModifiedDate();
  
  // Initialize search and filtering system
  initializeSearchAndFilters();
  
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
  // This function is now handled by the unified search and filter system
  // The renderFilteredEvents function will handle all events
  renderFilteredEvents();
}

function renderPastEvents() {
  // This function is now handled by the unified search and filter system
  // The renderFilteredEvents function will handle all events
  renderFilteredEvents();
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
  // This function is now handled by the new search and filter system
  // The applyFilters function will handle all filtering logic
  if (filter === 'all') {
    currentFilters.eventType = 'all';
  } else {
    currentFilters.eventType = filter;
  }
  applyFilters();
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
  
  const currentDate = getCurrentDate();
  
  // Add markers in priority order (lowest to highest):
  // 1. Past non-featured markers (lowest priority - added first)
  eventsData.forEach(event => {
    if (!event.featured && event.date < currentDate) {
      const marker = createEventMarker(event, map);
      if (marker) {
        marker.addTo(map);
        window.mapMarkers.past.push(marker);
      }
    }
  });
  
  // 2. Past featured markers
  eventsData.forEach(event => {
    if (event.featured && event.date < currentDate) {
      const marker = createEventMarker(event, map);
      if (marker) {
        marker.addTo(map);
        window.mapMarkers.featured.push(marker);
      }
    }
  });
  
  // 3. Upcoming non-featured markers
  eventsData.forEach(event => {
    if (!event.featured && event.date >= currentDate) {
      const marker = createEventMarker(event, map);
      if (marker) {
        marker.addTo(map);
        window.mapMarkers.upcoming.push(marker);
      }
    }
  });
  
  // 4. Upcoming featured markers (highest priority - added last so they appear on top)
  eventsData.forEach(event => {
    if (event.featured && event.date >= currentDate) {
      const marker = createEventMarker(event, map);
      if (marker) {
        marker.addTo(map);
        window.mapMarkers.featured.push(marker);
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
    // Show markers - maintain priority order: past first, then upcoming, with featured on top
    if (eventType === 'featured') {
      // For featured markers, separate past and upcoming, add past first, then upcoming
      const pastFeatured = [];
      const upcomingFeatured = [];
      
      markers.forEach(marker => {
        if (marker._isUpcoming) {
          upcomingFeatured.push(marker);
        } else {
          pastFeatured.push(marker);
        }
      });
      
      // Add past featured first, then upcoming featured (highest priority)
      pastFeatured.forEach(marker => marker.addTo(window.mapMarkers.map));
      upcomingFeatured.forEach(marker => marker.addTo(window.mapMarkers.map));
    } else if (eventType === 'past') {
      // Past markers should be added first (lowest priority)
      markers.forEach(marker => {
        marker.addTo(window.mapMarkers.map);
      });
    } else if (eventType === 'upcoming') {
      // Upcoming markers should be added after past but before featured
      markers.forEach(marker => {
        marker.addTo(window.mapMarkers.map);
      });
    }
    
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
      z-index: ${isFeatured ? '1000' : '100'};
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
  
  // Create Leaflet marker
  const marker = L.marker([coords.lat, coords.lng], { icon: customIcon });
  
  // Store event metadata on marker for priority ordering
  marker._eventDate = event.date;
  marker._isUpcoming = isUpcoming;
  marker._isFeatured = isFeatured;
  
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
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${event.website ? `<a href="${event.website}" target="_blank" style="
          background: var(--accent); 
          color: white; 
          padding: 6px 12px; 
          border-radius: 6px; 
          text-decoration: none; 
          font-size: 0.8rem;
          font-weight: 500;
        ">Website</a>` : ''}
        ${event.x ? `<a href="${event.x}" target="_blank" style="
          background: #1da1f2; 
          color: white; 
          padding: 6px 12px; 
          border-radius: 6px; 
          text-decoration: none; 
          font-size: 0.8rem;
          font-weight: 500;
        ">X</a>` : ''}
        ${event.nostr ? `<a href="${event.nostr}" target="_blank" style="
          background: #8b5cf6; 
          color: white; 
          padding: 6px 12px; 
          border-radius: 6px; 
          text-decoration: none; 
          font-size: 0.8rem;
          font-weight: 500;
        ">Nostr</a>` : ''}
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
          ${event.x ? `<a href="${event.x}" target="_blank" class="event-link social x">Follow on X</a>` : ''}
          ${event.nostr ? `<a href="${event.nostr}" target="_blank" class="event-link social nostr">Follow on Nostr</a>` : ''}
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
            <div class="modal-event-links">
              ${event.website ? `<a href="${event.website}" target="_blank" class="event-link website">Website</a>` : ''}
              ${event.x ? `<a href="${event.x}" target="_blank" class="event-link social x">X</a>` : ''}
              ${event.nostr ? `<a href="${event.nostr}" target="_blank" class="event-link social nostr">Nostr</a>` : ''}
            </div>
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
      website: formData.get('event-website')
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
  const sections = ['events', 'calendar', 'map', 'submit', 'support'];
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
                                                                 (wasCollapsed === null && (sectionId === 'submit' || sectionId === 'support'));
    
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

// ===== SEARCH AND FILTERING SYSTEM =====

// Global state for search and filters
let currentFilters = {
  search: '',
  eventType: 'all',
  dateFilter: 'upcoming',
  favorites: 'all',
  sortBy: 'date-asc'
};

let filteredEvents = [...eventsData];

// Favorites system
let favoriteEvents = new Set();

// Last modified date for events data (will be fetched dynamically)
let EVENTS_LAST_MODIFIED = "Loading...";

// Load favorites from localStorage
function loadFavorites() {
  const saved = localStorage.getItem('bitcoin-events-favorites');
  if (saved) {
    try {
      const favorites = JSON.parse(saved);
      favoriteEvents = new Set(favorites);
    } catch (e) {
      console.warn('Failed to load favorites:', e);
      favoriteEvents = new Set();
    }
  }
}

// Save favorites to localStorage
function saveFavorites() {
  try {
    localStorage.setItem('bitcoin-events-favorites', JSON.stringify([...favoriteEvents]));
  } catch (e) {
    console.warn('Failed to save favorites:', e);
  }
}

// Toggle favorite status
function toggleFavorite(eventId) {
  if (favoriteEvents.has(eventId)) {
    favoriteEvents.delete(eventId);
  } else {
    favoriteEvents.add(eventId);
  }
  saveFavorites();
  updateFavoriteButtons();
  updateFavoritesCount();
}

// Check if event is favorited
function isFavorited(eventId) {
  return favoriteEvents.has(eventId);
}

// Update all favorite buttons
function updateFavoriteButtons() {
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    const eventId = parseInt(btn.dataset.eventId);
    if (isFavorited(eventId)) {
      btn.classList.add('favorited');
      btn.innerHTML = '⭐';
      btn.title = 'Remove from favorites';
    } else {
      btn.classList.remove('favorited');
      btn.innerHTML = '☆';
      btn.title = 'Add to favorites';
    }
  });
}

// Update favorites count display
function updateFavoritesCount() {
  const countElement = document.getElementById('favorites-count');
  if (countElement) {
    countElement.textContent = favoriteEvents.size;
  }
}

// Fetch last modified date of events-data.js
async function fetchLastModifiedDate() {
  try {
    const response = await fetch('events-data.js?' + Date.now());
    const lastModified = response.headers.get('Last-Modified');
    
    if (lastModified) {
      const date = new Date(lastModified);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      EVENTS_LAST_MODIFIED = `${month} ${year}`;
    } else {
      // Fallback to current date if Last-Modified header is not available
      const now = new Date();
      const month = now.toLocaleString('default', { month: 'long' });
      const year = now.getFullYear();
      EVENTS_LAST_MODIFIED = `${month} ${year}`;
    }
    
    // Update the display if it already exists
    updateLastModifiedDisplay();
  } catch (error) {
    console.warn('Could not fetch last modified date:', error);
    // Fallback to current date
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    EVENTS_LAST_MODIFIED = `${month} ${year}`;
    updateLastModifiedDisplay();
  }
}

// Update the last modified display
function updateLastModifiedDisplay() {
  const lastModifiedText = document.querySelector('.last-modified-text');
  if (lastModifiedText) {
    lastModifiedText.textContent = `Last updated: ${EVENTS_LAST_MODIFIED}`;
  }
}

// Display last modified info
function displayLastModifiedInfo() {
  const eventsSection = document.getElementById('events');
  if (!eventsSection) return;
  
  const sectionHeader = eventsSection.querySelector('.section-header');
  if (!sectionHeader) return;
  
  const titleElement = sectionHeader.querySelector('h2');
  if (!titleElement) return;
  
  // Check if info already exists
  if (titleElement.querySelector('.last-modified-info')) return;
  
  const lastModifiedDiv = document.createElement('span');
  lastModifiedDiv.className = 'last-modified-info';
  lastModifiedDiv.innerHTML = `
    <span class="last-modified-text">Last updated: ${EVENTS_LAST_MODIFIED}</span>
  `;
  
  titleElement.appendChild(lastModifiedDiv);
}

function initializeSearchAndFilters() {
  // Initialize search input
  const searchInput = document.getElementById('event-search');
  const clearSearchBtn = document.getElementById('clear-search');
  
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('keyup', handleSearch);
  }
  
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', clearSearch);
  }
  
  // Initialize filter controls
  const eventTypeFilter = document.getElementById('event-type-filter');
  const dateFilter = document.getElementById('date-filter');
  const favoritesCheckbox = document.getElementById('favorites-checkbox');
  const sortFilter = document.getElementById('sort-filter');
  
  if (eventTypeFilter) {
    eventTypeFilter.addEventListener('change', handleFilterChange);
  }
  
  if (dateFilter) {
    dateFilter.addEventListener('change', handleFilterChange);
  }
  
  if (favoritesCheckbox) {
    favoritesCheckbox.addEventListener('change', handleFilterChange);
  }
  
  if (sortFilter) {
    sortFilter.addEventListener('change', handleSortChange);
  }
  
  
  // Initialize reset button
  const resetBtn = document.getElementById('reset-filters');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetAllFilters);
  }
  
  // Load filters from URL parameters
  loadFiltersFromURL();
  
  // Apply initial filters
  applyFilters();
}

function handleSearch(event) {
  const searchTerm = event.target.value.trim();
  currentFilters.search = searchTerm;
  
  // Show/hide clear button
  const clearBtn = document.getElementById('clear-search');
  if (clearBtn) {
    clearBtn.classList.toggle('hidden', searchTerm === '');
  }
  
  applyFilters();
  updateURL();
}

function clearSearch() {
  const searchInput = document.getElementById('event-search');
  if (searchInput) {
    searchInput.value = '';
    currentFilters.search = '';
    document.getElementById('clear-search').classList.add('hidden');
    applyFilters();
    updateURL();
  }
}

function handleFilterChange(event) {
  const filterId = event.target.id;
  let filterProperty;
  
  // Map filter IDs to the correct property names
  switch (filterId) {
    case 'event-type-filter':
      filterProperty = 'eventType';
      break;
    case 'date-filter':
      filterProperty = 'dateFilter';
      break;
    case 'favorites-checkbox':
      filterProperty = 'favorites';
      break;
    case 'sort-filter':
      filterProperty = 'sortBy';
      break;
    default:
      console.warn('Unknown filter ID:', filterId);
      return;
  }
  
  if (filterProperty === 'favorites') {
    currentFilters[filterProperty] = event.target.checked ? 'favorites' : 'all';
  } else {
    currentFilters[filterProperty] = event.target.value;
  }
  applyFilters();
  updateURL();
}

function handleSortChange(event) {
  currentFilters.sortBy = event.target.value;
  applyFilters();
  updateURL();
}


function updateFilterControls() {
  // Update select controls to match current filters
  const eventTypeFilter = document.getElementById('event-type-filter');
  const dateFilter = document.getElementById('date-filter');
  const favoritesCheckbox = document.getElementById('favorites-checkbox');
  const sortFilter = document.getElementById('sort-filter');
  
  if (eventTypeFilter) {
    eventTypeFilter.value = currentFilters.eventType;
  }
  
  if (dateFilter) {
    dateFilter.value = currentFilters.dateFilter;
  }
  
  if (favoritesCheckbox) {
    favoritesCheckbox.checked = currentFilters.favorites === 'favorites';
  }
  
  if (sortFilter) {
    sortFilter.value = currentFilters.sortBy;
  }
}

function applyFilters() {
  let filtered = [...eventsData];
  
  // Apply search filter
  if (currentFilters.search) {
    const searchTerm = currentFilters.search.toLowerCase();
    filtered = filtered.filter(event => 
      event.name.toLowerCase().includes(searchTerm) ||
      event.location.toLowerCase().includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply event type filter
  if (currentFilters.eventType !== 'all') {
    filtered = filtered.filter(event => event.type === currentFilters.eventType);
  }
  
  // Apply favorites filter
  if (currentFilters.favorites === 'favorites') {
    filtered = filtered.filter(event => isFavorited(event.id));
  }
  
  // Apply date filter
  const currentDate = getCurrentDate();
  if (currentFilters.dateFilter !== 'all') {
    filtered = filtered.filter(event => {
      switch (currentFilters.dateFilter) {
        case 'upcoming':
          return event.date >= currentDate;
        case 'past':
          return event.date < currentDate;
        case 'this-month':
          const thisMonth = new Date().getMonth();
          const thisYear = new Date().getFullYear();
          const eventDate = new Date(event.date);
          return eventDate.getMonth() === thisMonth && eventDate.getFullYear() === thisYear;
        case 'next-month':
          const nextMonth = (new Date().getMonth() + 1) % 12;
          const nextYear = nextMonth === 0 ? new Date().getFullYear() + 1 : new Date().getFullYear();
          const eventDateNext = new Date(event.date);
          return eventDateNext.getMonth() === nextMonth && eventDateNext.getFullYear() === nextYear;
        case 'this-quarter':
          const quarter = Math.floor(new Date().getMonth() / 3);
          const eventDateQuarter = new Date(event.date);
          const eventQuarter = Math.floor(eventDateQuarter.getMonth() / 3);
          return eventQuarter === quarter && eventDateQuarter.getFullYear() === new Date().getFullYear();
        case 'this-year':
          return new Date(event.date).getFullYear() === new Date().getFullYear();
        default:
          return true;
      }
    });
  }
  
  
  // Apply sorting
  filtered = sortEvents(filtered, currentFilters.sortBy);
  
  // Update global filtered events
  filteredEvents = filtered;
  
  // Render filtered events
  renderFilteredEvents();
  
  // Update results count
  updateResultsCount();
  
  // Update favorite buttons
  updateFavoriteButtons();
}

function sortEvents(events, sortBy) {
  return events.sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'location-asc':
        return a.location.localeCompare(b.location);
      case 'featured-first':
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(a.date) - new Date(b.date);
      default:
        return new Date(a.date) - new Date(b.date);
    }
  });
}

function renderFilteredEvents() {
  const eventsContainer = document.getElementById("events-list");
  
  if (!eventsContainer) return;
  
  // Clear container
  eventsContainer.innerHTML = "";
  
  if (filteredEvents.length === 0) {
    renderNoResults();
    return;
  }
  
  // Render all events in a unified list
  filteredEvents.forEach(event => {
    const eventCard = createEventCard(event);
    eventsContainer.appendChild(eventCard);
  });
}

function renderNoResults() {
  const eventsContainer = document.getElementById("events-list");
  
  if (!eventsContainer) return;
  
  const noResultsHTML = `
    <div class="no-results">
      <h3>No events found</h3>
      <p>Try adjusting your search criteria or filters.</p>
      <div class="suggestions">
        <h4>Suggestions:</h4>
        <ul>
          <li>Check your spelling</li>
          <li>Try different keywords</li>
          <li>Remove some filters</li>
          <li>Search for a broader location</li>
        </ul>
      </div>
    </div>
  `;
  
  eventsContainer.innerHTML = noResultsHTML;
}

function updateResultsCount() {
  const resultsCount = document.getElementById('results-count');
  if (!resultsCount) return;
  
  const total = eventsData.length;
  const filtered = filteredEvents.length;
  
  if (filtered === total) {
    resultsCount.textContent = `Showing all ${total} events`;
  } else {
    resultsCount.textContent = `Showing ${filtered} of ${total} events`;
  }
}

function resetAllFilters() {
  // Reset all filter values
  currentFilters = {
    search: '',
    eventType: 'all',
    dateFilter: 'upcoming',
    favorites: 'all',
    sortBy: 'date-asc'
  };
  
  // Reset UI controls
  const searchInput = document.getElementById('event-search');
  if (searchInput) {
    searchInput.value = '';
  }
  
  document.getElementById('clear-search').classList.add('hidden');
  updateFilterControls();
  
  
  // Apply filters
  applyFilters();
  updateURL();
}

function loadFiltersFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.has('search')) {
    currentFilters.search = urlParams.get('search');
    const searchInput = document.getElementById('event-search');
    if (searchInput) {
      searchInput.value = currentFilters.search;
      if (currentFilters.search) {
        document.getElementById('clear-search').classList.remove('hidden');
      }
    }
  }
  
  if (urlParams.has('type')) {
    currentFilters.eventType = urlParams.get('type');
  }
  
  
  if (urlParams.has('date')) {
    currentFilters.dateFilter = urlParams.get('date');
  } else {
    // Keep the default 'upcoming' if no date parameter in URL
    currentFilters.dateFilter = 'upcoming';
  }
  
  if (urlParams.has('favorites')) {
    currentFilters.favorites = urlParams.get('favorites');
  }
  
  if (urlParams.has('sort')) {
    currentFilters.sortBy = urlParams.get('sort');
  }
  
  // Update UI to match URL parameters
  updateFilterControls();
}

function updateURL() {
  const url = new URL(window.location);
  
  // Clear existing parameters
  url.search = '';
  
  // Add non-default parameters
  if (currentFilters.search) {
    url.searchParams.set('search', currentFilters.search);
  }
  
  if (currentFilters.eventType !== 'all') {
    url.searchParams.set('type', currentFilters.eventType);
  }
  
  
  if (currentFilters.dateFilter !== 'upcoming') {
    url.searchParams.set('date', currentFilters.dateFilter);
  }
  
  if (currentFilters.favorites !== 'all') {
    url.searchParams.set('favorites', currentFilters.favorites);
  }
  
  if (currentFilters.sortBy !== 'date-asc') {
    url.searchParams.set('sort', currentFilters.sortBy);
  }
  
  // Update URL without page reload
  window.history.replaceState({}, '', url);
}

// Enhanced createEventCard function with search highlighting and time status
function createEventCard(event) {
  const card = document.createElement("div");
  
  // Determine if event is upcoming or past
  const currentDate = getCurrentDate();
  const isPast = event.date < currentDate;
  
  card.className = `event-card ${event.type} ${event.featured ? 'featured' : ''} ${isPast ? 'past' : ''}`;
  card.style.cursor = 'pointer';
  
  const dateRange = event.endDate 
    ? `${formatDate(event.date)} - ${formatDate(event.endDate)}`
    : formatDate(event.date);
  
  // Apply search highlighting
  const highlightedName = highlightSearchTerm(event.name, currentFilters.search);
  const highlightedLocation = highlightSearchTerm(event.location, currentFilters.search);
  const highlightedDescription = highlightSearchTerm(
    event.description.substring(0, 100) + (event.description.length > 100 ? '...' : ''), 
    currentFilters.search
  );
  
  
  card.innerHTML = `
    <div class="event-header">
      <div class="event-type-badge ${event.type}">${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</div>
      ${event.featured ? '<div class="featured-badge">Featured</div>' : ''}
      <button class="favorite-btn" data-event-id="${event.id}" title="Add to favorites">
        ${isFavorited(event.id) ? '⭐' : '☆'}
      </button>
    </div>

    <h3 class="event-title">${highlightedName}</h3>
    <div class="event-date">${dateRange}</div>
    <div class="event-location">📍 ${highlightedLocation}</div>
    <div class="event-preview">
      <p class="event-description-preview">${highlightedDescription}</p>
    </div>
    <div class="event-actions">
      <span class="click-hint">Click for details</span>
    </div>
  `;
  
  // Add click event to show full event details
  card.addEventListener('click', () => {
    showEventDetails(event);
  });
  
  // Add click event for favorite button (prevent event propagation)
  const favoriteBtn = card.querySelector('.favorite-btn');
  favoriteBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    toggleFavorite(event.id);
  });
  
  return card;
}

function highlightSearchTerm(text, searchTerm) {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
  return text.replace(regex, '<span class="search-highlight">$1</span>');
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


