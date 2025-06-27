// Decode Lightning Address to LNURL-pay endpoint
function lightningAddressToLnurlpEndpoint(address) {
  const [name, domain] = address.split('@');
  return `https://${domain}/.well-known/lnurlp/${name}`;
}

// LNURL-pay contact form handler
async function handleLNURLContact(event) {
  event.preventDefault();
  const message = document.getElementById('contact-message').value;
  if (message.length > 200) {
    alert('Message too long!');
    return false;
  }

  // Get the Lightning Address from your config or input
  const lightningAddress = "francis@walletofsatoshi.com"; // <-- Replace with your Lightning Address
  const lnurlpEndpoint = lightningAddressToLnurlpEndpoint(lightningAddress);
  
  try {
    // Step 1: Fetch LNURL-pay parameters
    console.log('Fetching LNURL-pay parameters...');
    const res = await fetch(lnurlpEndpoint);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const lnurlp = await res.json();
    console.log('LNURL-pay response:', lnurlp);

    // Step 2: Prepare callback URL
    const amount = 5000000; // 10,000 sats in millisats
    const callbackUrl = `${lnurlp.callback}?amount=${amount}&comment=${encodeURIComponent(message)}`;
    console.log('Callback URL:', callbackUrl);

    // Step 3: Fetch invoice
    console.log('Fetching invoice...');
    const invoiceRes = await fetch(callbackUrl);
    
    if (!invoiceRes.ok) {
      throw new Error(`HTTP error! status: ${invoiceRes.status}`);
    }
    
    const invoiceData = await invoiceRes.json();
    console.log('Invoice response:', invoiceData);

    if (invoiceData.pr) {
      document.getElementById('invoice-section').style.display = 'block';
      document.getElementById('invoice-string').textContent = invoiceData.pr;
      if (window.QRCode) {
        document.getElementById('invoice-qr').innerHTML = '';
        new QRCode(document.getElementById('invoice-qr'), {
          text: invoiceData.pr,
          width: 250,
          height: 250,
          colorDark: "#000000",
          colorLight: "#FFFFFF",
          correctLevel: QRCode.CorrectLevel.H
        });
      }
      
      // Add event listeners for close and copy buttons
      document.getElementById('close-invoice').addEventListener('click', function() {
        document.getElementById('invoice-section').style.display = 'none';
        document.getElementById('contact-message').value = '';
      });
      
      document.getElementById('copy-invoice').addEventListener('click', function() {
        const invoiceText = document.getElementById('invoice-string').textContent;
        navigator.clipboard.writeText(invoiceText).then(function() {
          const copyBtn = document.getElementById('copy-invoice');
          const originalText = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          copyBtn.style.background = '#22c55e';
          setTimeout(function() {
            copyBtn.textContent = originalText;
            copyBtn.style.background = 'var(--accent)';
          }, 2000);
        }).catch(function(err) {
          console.error('Failed to copy: ', err);
          alert('Failed to copy invoice. Please copy it manually.');
        });
      });
      
      console.log('QR code generated successfully');
    } else {
      alert('Failed to generate invoice. Please try again.');
      console.error('No invoice in response:', invoiceData);
    }
  } catch (err) {
    alert('Error contacting LNURL-pay endpoint: ' + err.message);
    console.error('Error details:', err);
  }
  return false;
}

// Typing effect for the header
// Fun animated typing effect for the header
// (from index.html)
document.addEventListener('DOMContentLoaded', function() {
  // Typing effect
  const text = "Software Engineer | Bitcoin | Lightning";
  let i = 0;
  function type() {
    if (i <= text.length) {
      document.getElementById('typed').textContent = text.slice(0, i);
      i++;
      setTimeout(type, 60);
    }
  }
  type();

  // Highlight active nav link on scroll
  const sections = ['about', 'projects', 'contributions', 'videos', 'education', 'skills', 'contact'];
  const navLinks = Array.from(document.querySelectorAll('.navbar a'));
  function onScroll() {
    let scrollPos = window.scrollY + 120;
    let active = null;
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= scrollPos) active = id;
    }
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + active);
    });
  }
  window.addEventListener('scroll', onScroll);
  onScroll();

  // Hamburger menu toggle
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

  // Dynamically render projects
  function renderProjects() {
    if (typeof projects === 'undefined') return;
    const container = document.getElementById('projects-list');
    if (!container) return;
    container.innerHTML = '';
    projects.forEach(project => {
      const githubLink = project.github !== '#' ? `<a href="${project.github}" target="_blank" title="GitHub">
              <img src="images/github.jpg" alt="GitHub" />
            </a>` : '';
      const websiteLink = project.website !== '#' ? `<a href="${project.website}" target="_blank" title="Website">
              <img src="images/www.png" alt="Website" class="invert-icon" />
            </a>` : '';
      
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-header">
          <span><strong>${project.name} <span class="tag">${project.type}</span></strong></span>
          <span class="project-links">
            ${githubLink}
            ${websiteLink}
          </span>
        </div>
        <p style="color:var(--muted-text);">${project.description}</p>
        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      `;
      container.appendChild(card);
    });
  }

  renderProjects();

  // Dynamically render contributions
  function renderContributions() {
    if (typeof contributions === 'undefined') return;
    const container = document.getElementById('contributions-list');
    if (!container) return;
    container.innerHTML = '';
    contributions.forEach(contribution => {
      const githubLink = contribution.github !== '#' ? `<a href="${contribution.github}" target="_blank" title="GitHub">
              <img src="images/github.jpg" alt="GitHub" />
            </a>` : '';
      const websiteLink = contribution.website !== '#' ? `<a href="${contribution.website}" target="_blank" title="Website">
              <img src="images/www.png" alt="Website" class="invert-icon" />
            </a>` : '';
      
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-header">
          <span><strong>${contribution.name} <span class="tag">${contribution.type}</span></strong></span>
          <span class="project-links">
            ${githubLink}
            ${websiteLink}
          </span>
        </div>
        <p style="color:var(--muted-text);">${contribution.description}</p>
        ${contribution.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      `;
      container.appendChild(card);
    });
  }

  renderContributions();

  // Dynamically render videos
  function renderVideos() {
    if (typeof videos === 'undefined') return;
    const container = document.getElementById('videos-list');
    if (!container) return;
    container.innerHTML = '';
    videos.forEach(video => {
      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${video.embedId}" allowfullscreen title="${video.title}"></iframe>
        <div style="margin-top:0.7em; color:var(--muted-text); font-size:1rem;">${video.description}</div>
      `;
      container.appendChild(card);
    });
  }

  renderVideos();
}); 