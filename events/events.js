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
  
  // Sort upcoming events by date (earliest first)
  const sortedEvents = [...eventsData.upcoming].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  sortedEvents.forEach(event => {
    const eventCard = createEventCard(event);
    container.appendChild(eventCard);
  });
}

function renderPastEvents() {
  const container = document.getElementById("past-events-list");
  if (!container) return;
  
  container.innerHTML = "";
  
  // Sort past events by date (most recent first)
  const sortedEvents = [...eventsData.past].sort((a, b) => new Date(b.date) - new Date(a.date));
  
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
  
  // Check upcoming events
  eventsData.upcoming.forEach(event => {
    // Check if date falls within range (including start and end dates)
    if (event.date <= dateString && (!event.endDate || event.endDate >= dateString)) {
      // Only add if we haven't seen this event before
      if (!eventIds.has(event.id)) {
        events.push(event);
        eventIds.add(event.id);
      }
    }
  });
  
  // Check past events
  eventsData.past.forEach(event => {
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
  const sections = ['upcoming', 'past', 'calendar', 'submit'];
  const navLinks = Array.from(document.querySelectorAll('.navbar a'));
  
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
