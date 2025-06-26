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
  const sections = ['about', 'projects', 'contributions', 'videos', 'education', 'skills'];
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