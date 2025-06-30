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
    const amount = 3000000
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

async function handleNostrZap(event) {
  event.preventDefault();
  const message = document.getElementById('contact-message').value;
  const submitButton = event.target.querySelector('button');
  const originalButtonText = submitButton.textContent;

  if (message.length > 200) {
    alert('Message too long!');
    return false;
  }
  
  submitButton.textContent = 'Preparing Zap...';
  submitButton.disabled = true;

  const relays = [
    "wss://relay.damus.io",
    "wss://relay.primal.net",
    "wss://relay.nostr.band/",
    "wss://relay.nostr.nu/",
  ];
  const recipientNpub = 'npub1t5atsakzq63h45asjn3qhlpeg80nlgs6zkkgafmddyvywdufv6dqxfahcl';
  const zapAmountMilliSats = 21 * 1000;

  try {
    const pool = new NostrTools.SimplePool();
    const { type, data: recipientHexPubkey } = NostrTools.nip19.decode(recipientNpub);
    if (type !== 'npub') throw new Error('Invalid recipient npub.');

    console.log('Fetching recipient profile...');
    const userEvent = await pool.get(relays, { kinds: [0], authors: [recipientHexPubkey] });
    if (!userEvent) throw new Error('Recipient profile not found on specified relays.');
    
    const metadata = JSON.parse(userEvent.content);
    const lud16 = metadata.lud16 || metadata.lud06;
    if (!lud16) throw new Error('Lightning address not found in recipient profile.');
    
    console.log(`Found Lightning Address: ${lud16}`);
    let zapEndpoint;
    if (lud16) {
      const [name, domain] = lud16.split('@');
      zapEndpoint = `https://${domain}/.well-known/lnurlp/${name}`;
    } else {
      throw new Error('No lud16 found in profile (lud06 not supported in this demo).');
    }
    
    console.log('Zap endpoint:', zapEndpoint);
    
    // 2. Create the unsigned zap request event
    const unsignedZapRequest = NostrTools.nip57.makeZapRequest({
      profile: recipientHexPubkey,
      amount: zapAmountMilliSats,
      comment: message,
      relays,
    });

    // 3. Generate a random keypair and sign the zap request
    const randomPrivKey = NostrTools.generateSecretKey();
    const randomPubKey = NostrTools.getPublicKey(randomPrivKey);
    const signedZapRequest = NostrTools.finalizeEvent(
      { ...unsignedZapRequest, pubkey: randomPubKey },
      randomPrivKey
    );

    // 4. Use signedZapRequest.id in your subscription filter
    const zapRequestString = encodeURIComponent(JSON.stringify(signedZapRequest));
    const res = await fetch(`${zapEndpoint}?amount=${zapAmountMilliSats}&nostr=${zapRequestString}&comment=${encodeURIComponent(message)}`);
    const { pr: invoice } = await res.json();
    
    if (!invoice) throw new Error('Failed to fetch invoice from zap endpoint.');

    console.log('Invoice fetched:', invoice);
    
    document.getElementById('invoice-section').style.display = 'block';
    document.getElementById('invoice-string').textContent = invoice;
    const qrContainer = document.getElementById('invoice-qr');
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
        text: invoice.toUpperCase(),
        width: 250,
        height: 250,
    });

    submitButton.textContent = 'Zap Created! Waiting for payment...';

    // Listen for zap receipt (robust: subscribe to all zap receipts for this pubkey, filter in JS)
    console.log('Listening for zap receipt...');
    const sub = pool.subscribe(
      relays,
      [{ kinds: [9735], '#p': [recipientHexPubkey] }],
      {
        onevent(event) {
          console.log("Zap event received", event)
          // Find the #e tag in the event
          const eTag = event.tags.find(tag => tag[0] === 'e');
          if (eTag && eTag[1] === signedZapRequest.id) {
            console.log('Zap receipt received for our zap!', event);
            document.getElementById('invoice-section').style.display = 'none';
            submitButton.textContent = 'Zap Confirmed! Thank you!';
            submitButton.style.backgroundColor = '#22c55e';
            setTimeout(() => {
              submitButton.textContent = originalButtonText;
              submitButton.disabled = false;
              submitButton.style.backgroundColor = '';
              document.getElementById('contact-message').value = '';
            }, 5000);
            sub.close();
            pool.close(relays);
          } else {
            // Not our zap, ignore (but you can log for debugging)
            console.log('Received unrelated zap receipt', event);
          }
        }
      }
    );

    document.getElementById('close-invoice').addEventListener('click', function() {
      document.getElementById('invoice-section').style.display = 'none';
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
      document.getElementById('contact-message').value = '';
      sub.close();
      pool.close(relays);
    }, { once: true });
    
  } catch (error) {
    console.error('Zap process failed:', error);
    alert(`Error: ${error.message}`);
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
  }
  return false;
}

document.addEventListener('DOMContentLoaded', function() {
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

  document.querySelectorAll('#navbar-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (links.classList.contains('open')) {
        links.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  let showAllProjects = false;

  function renderProjects() {
    if (typeof projects === 'undefined') return;
    const container = document.getElementById('projects-list');
    if (!container) return;
    container.innerHTML = '';
    const toShow = showAllProjects ? projects : projects.slice(0, 2);
    toShow.forEach(project => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-header">
          <span><strong>${project.name} <span class="tag">${project.type}</span></strong></span>
          <span class="project-links">
            ${project.github !== '#' ? `<a href="${project.github}" target="_blank" title="GitHub"><img src="images/github.jpg" alt="GitHub" /></a>` : ''}
            ${project.website !== '#' ? `<a href="${project.website}" target="_blank" title="Website"><img src="images/www.png" alt="Website" class="invert-icon" /></a>` : ''}
          </span>
        </div>
        <p style="color:var(--muted-text);">${project.description}</p>
        ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      `;
      container.appendChild(card);
    });

    const toggleBtn = document.getElementById('toggle-projects');
    if (toggleBtn) {
      if (projects.length > 2) {
        toggleBtn.style.display = 'block';
        toggleBtn.textContent = showAllProjects ? 'Show less' : 'Show more';
      } else {
        toggleBtn.style.display = 'none';
      }
    }
  }

  const onProjectsToggleReady = () => {
    const toggleBtn = document.getElementById('toggle-projects');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        showAllProjects = !showAllProjects;
        renderProjects();
      });
    }
    renderProjects();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onProjectsToggleReady);
  } else {
    onProjectsToggleReady();
  }

  let showAllContributions = false;

  function renderContributions() {
    if (typeof contributions === 'undefined') return;
    const container = document.getElementById('contributions-list');
    if (!container) return;
    container.innerHTML = '';
    const toShow = showAllContributions ? contributions : contributions.slice(0, 2);
    toShow.forEach(contribution => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-header">
          <span><strong>${contribution.name} <span class="tag">${contribution.type}</span></strong></span>
          <span class="project-links">
            ${contribution.github !== '#' ? `<a href="${contribution.github}" target="_blank" title="GitHub"><img src="images/github.jpg" alt="GitHub" /></a>` : ''}
            ${contribution.website !== '#' ? `<a href="${contribution.website}" target="_blank" title="Website"><img src="images/www.png" alt="Website" class="invert-icon" /></a>` : ''}
          </span>
        </div>
        <p style="color:var(--muted-text);">${contribution.description}</p>
        ${contribution.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      `;
      container.appendChild(card);
    });

    const toggleBtn = document.getElementById('toggle-contributions');
    if (toggleBtn) {
      if (contributions.length > 2) {
        toggleBtn.style.display = 'block';
        toggleBtn.textContent = showAllContributions ? 'Show less' : 'Show more';
      } else {
        toggleBtn.style.display = 'none';
      }
    }
  }

  const onContributionsToggleReady = () => {
    const toggleBtn = document.getElementById('toggle-contributions');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        showAllContributions = !showAllContributions;
        renderContributions();
      });
    }
    renderContributions();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onContributionsToggleReady);
  } else {
    onContributionsToggleReady();
  }

  let showAllVideos = false;

  function renderVideos() {
    if (typeof videos === 'undefined') return;
    const container = document.getElementById('videos-list');
    if (!container) return;
    container.innerHTML = '';
    const toShow = showAllVideos ? videos : videos.slice(0, 2);
    toShow.forEach(video => {
      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${video.embedId}" allowfullscreen title="${video.title}"></iframe>
          <div style="margin-top:0.7em; color:var(--muted-text); font-size:1rem;">${video.description}</div>
      `;
      container.appendChild(card);
    });

    const toggleBtn = document.getElementById('toggle-videos');
    if (toggleBtn) {
      if (videos.length > 2) {
        toggleBtn.style.display = 'block';
        toggleBtn.textContent = showAllVideos ? 'Show less' : 'Show more';
      } else {
        toggleBtn.style.display = 'none';
      }
    }
  }

  const onVideosToggleReady = () => {
    const toggleBtn = document.getElementById('toggle-videos');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        showAllVideos = !showAllVideos;
        renderVideos();
      });
    }
    renderVideos();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onVideosToggleReady);
  } else {
    onVideosToggleReady();
  }

  document.getElementById('copy-invoice').addEventListener('click', function() {
    const invoiceText = document.getElementById('invoice-string').textContent;
    navigator.clipboard.writeText(invoiceText).then(() => {
      const copyBtn = document.getElementById('copy-invoice');
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      copyBtn.style.background = '#22c55e';
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = 'var(--accent)';
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy invoice. Please copy it manually.');
    });
  });
}); 