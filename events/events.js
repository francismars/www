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

function createEventMarker(event, map) {
  // Get coordinates based on location
  const coords = getLocationCoordinates(event.location);
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

function getLocationCoordinates(location) {
  // Real latitude/longitude coordinates for major cities
  const coordinates = {
    'Medellin, Colombia': { lat: 6.2476, lng: -75.5658 },
    'Cape Town, South Africa': { lat: -33.9249, lng: 18.4241 },
    'San Salvador, El Salvador': { lat: 13.7942, lng: -88.8965 },
    'Florianopolis, Brasil': { lat: -27.5969, lng: -48.5495 },
    'Uvita, Costa Rica': { lat: 9.1499, lng: -83.7534 },
    'Dubai, UAE': { lat: 25.2048, lng: 55.2708 },
    'Dallas, Texas, USA': { lat: 32.7767, lng: -96.7970 },
    'Bedford, UK': { lat: 52.1354, lng: -0.4666 },
    'Switzerland': { lat: 46.8182, lng: 8.2275 },
    'Viareggio, Italy': { lat: 43.8731, lng: 10.2338 },
    'Austin, Texas, USA': { lat: 30.2672, lng: -97.7431 },
    'Warsaw, Poland': { lat: 52.2297, lng: 21.0122 },
    'Oslo, Norway': { lat: 59.9139, lng: 10.7522 },
    'Las Vegas, Nevada, USA': { lat: 36.1699, lng: -115.1398 },
    'Barcelona, Spain': { lat: 41.3851, lng: 2.1734 },
    'Prague, Czech Republic': { lat: 50.0755, lng: 14.4378 },
    'Calgary, Alberta, Canada': { lat: 51.0447, lng: -114.0719 },
    'Juneau, Alaska, USA': { lat: 58.3019, lng: -134.4197 },
    'Mallorca, Spain': { lat: 39.6953, lng: 3.0176 },
    'Riga, Latvia': { lat: 56.9496, lng: 24.1052 },
    'Helsinki, Finland': { lat: 60.1699, lng: 24.9384 },
    'Istanbul, Turkey': { lat: 41.0082, lng: 28.9784 },
    'Berlin, Germany': { lat: 52.5200, lng: 13.4050 },
    'Bayern, Germany': { lat: 48.7904, lng: 11.4979 },
    'Sofia, Bulgaria': { lat: 42.6977, lng: 23.3219 },
    'Lugano, Switzerland': { lat: 46.0037, lng: 8.9511 },
    'Sao Paulo, Brazil': { lat: -23.5505, lng: -46.6333 },
    'Amsterdam, Netherlands': { lat: 52.3676, lng: 4.9041 },
    'El Salvador': { lat: 13.7942, lng: -88.8965 },
    'Manchester, UK': { lat: 53.4808, lng: -2.2426 },
    'Buenos Aires, Argentina': { lat: -34.6118, lng: -58.3960 },
    'Madrid, Spain': { lat: 40.4168, lng: -3.7038 }
  };
  
  return coordinates[location] || null;
}

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
  const sections = ['upcoming', 'past', 'calendar', 'map', 'submit'];
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
                                (wasCollapsed === null && (sectionId === 'past' || sectionId === 'submit'));
    
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
