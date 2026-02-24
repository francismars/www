import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const SITE_URL = "https://francismars.com";
const EVENTS_BASE_PATH = "/events";
const ROOT_DIR = path.resolve(process.cwd());
const EVENTS_DIR = path.join(ROOT_DIR, "events");
const DATA_FILE = path.join(EVENTS_DIR, "events-data.js");
const INDEX_FILE = path.join(EVENTS_DIR, "index.html");
const SITEMAP_FILE = path.join(EVENTS_DIR, "sitemap.xml");
const EVENT_PAGES_DIR = path.join(EVENTS_DIR, "pages");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

let eventSlugStats = { baseCounts: new Map(), baseYearCounts: new Map() };

function buildSlugStats(events) {
  const baseCounts = new Map();
  const baseYearCounts = new Map();

  events.forEach((event) => {
    const base = slugify(event.name);
    const year = String(event.date || "").slice(0, 4);
    baseCounts.set(base, (baseCounts.get(base) || 0) + 1);
    const baseYearKey = `${base}__${year}`;
    baseYearCounts.set(baseYearKey, (baseYearCounts.get(baseYearKey) || 0) + 1);
  });

  return { baseCounts, baseYearCounts };
}

function buildEventSlug(event) {
  const base = slugify(event.name);
  const year = String(event.date || "").slice(0, 4);

  if ((eventSlugStats.baseCounts.get(base) || 0) <= 1) {
    return base;
  }

  const baseYearKey = `${base}__${year}`;
  if (year && (eventSlugStats.baseYearCounts.get(baseYearKey) || 0) <= 1) {
    return `${base}-${year}`;
  }

  const uniquePart = event.id != null ? String(event.id) : slugify(event.location || "event");
  return year ? `${base}-${year}-${uniquePart}` : `${base}-${uniquePart}`;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatTypeLabel(type) {
  const value = String(type || "").trim();
  if (!value) return "Other";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function loadEventsData(source) {
  const context = vm.createContext({});
  const script = new vm.Script(`${source}\n;globalThis.__EVENTS_DATA__ = eventsData;`);
  script.runInContext(context);
  const eventsData = context.__EVENTS_DATA__;
  if (!Array.isArray(eventsData)) {
    throw new Error("events-data.js did not expose an eventsData array.");
  }
  return eventsData;
}

function replaceBlock(content, startMarker, endMarker, replacement) {
  const pattern = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
  if (!pattern.test(content)) {
    throw new Error(`Missing marker block: ${startMarker} ... ${endMarker}`);
  }
  return content.replace(pattern, `${startMarker}\n${replacement}\n${endMarker}`);
}

function renderIndexCards(events) {
  return events
    .map((event) => {
      const slug = buildEventSlug(event);
      const detailPath = `pages/${slug}.html`;
      const isPast = event.date < todayIso();
      const classes = ["event-card", event.type, event.featured ? "featured" : "", isPast ? "past" : ""]
        .filter(Boolean)
        .join(" ");

      const dateRange = event.endDate && event.endDate !== event.date
        ? `${formatDate(event.date)} - ${formatDate(event.endDate)}`
        : formatDate(event.date);

      const descriptionPreview =
        event.description.length > 140
          ? `${event.description.slice(0, 140)}...`
          : event.description;

      return [
        `<article class="${classes}">`,
        `  <div class="event-header">`,
        `    <div class="event-type-badge ${escapeHtml(event.type)}">${escapeHtml(event.type)}</div>`,
        event.featured ? `    <div class="featured-badge">Featured</div>` : "",
        `  </div>`,
        `  <h3 class="event-title"><a href="${detailPath}" class="event-title-link">${escapeHtml(event.name)}</a></h3>`,
        `  <div class="event-date">${escapeHtml(dateRange)}</div>`,
        `  <div class="event-location">📍 ${escapeHtml(event.location)}</div>`,
        `  <p class="event-description-preview">${escapeHtml(descriptionPreview)}</p>`,
        `  <div class="event-actions"><a href="${detailPath}" class="click-hint">Open event page</a></div>`,
        `</article>`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");
}

function renderItemListSchema(events) {
  const payload = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Bitcoin Events Directory",
    description: "Upcoming Bitcoin events around the world",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: events.length,
    itemListElement: events.map((event, index) => {
      const slug = buildEventSlug(event);
      return {
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}${EVENTS_BASE_PATH}/${slug}/`,
        name: event.name,
      };
    }),
  };

  return `<script type="application/ld+json">\n${JSON.stringify(payload, null, 2)}\n</script>`;
}

function renderEventPage(event) {
  const slug = buildEventSlug(event);
  const detailPath = `${EVENTS_BASE_PATH}/${slug}/`;
  const canonical = `${SITE_URL}${detailPath}`;
  const eventsIndexPath = "../index.html";
  const dateRange = event.endDate && event.endDate !== event.date
    ? `${formatDate(event.date)} - ${formatDate(event.endDate)}`
    : formatDate(event.date);
  const title = `${event.name} | Bitcoin Event`;
  const typeLabel = formatTypeLabel(event.type);
  const description = event.description;
  const imageUrl = `${SITE_URL}/images/events.png`;
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Events",
        item: `${SITE_URL}${EVENTS_BASE_PATH}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: event.name,
        item: canonical,
      },
    ],
  };
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    startDate: event.date,
    endDate: event.endDate || event.date,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus:
      event.date < todayIso()
        ? "https://schema.org/EventCompleted"
        : "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.location,
    },
    description: event.description,
    organizer: {
      "@type": "Organization",
      name: "Bitcoin Community",
    },
    url: canonical,
  };

  if (event.website) eventSchema.offers = { "@type": "Offer", url: event.website };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${imageUrl}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${imageUrl}">
  <link rel="stylesheet" href="../style.css">
  <script data-goatcounter="https://events.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
  <style>
    .event-page-shell {
      max-width: 900px;
      margin: 0 auto;
      margin-top: 1rem;
    }
    .event-meta-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .event-meta-main {
      display: grid;
      gap: 0.55rem;
    }
    .event-meta-item {
      color: var(--muted-text);
      font-size: 0.95rem;
      margin: 0;
    }
    .event-meta-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: flex-end;
    }
    .event-page-title {
      margin: 0 0 1rem;
      font-size: clamp(2rem, 3.8vw, 3rem);
      line-height: 1.2;
      text-wrap: balance;
    }
    .event-back-link {
      margin: 0 0 1rem 0;
    }
    .event-back-link a {
      color: var(--muted-text);
      text-decoration: none;
      font-size: 0.9rem;
    }
    .event-back-link a:hover {
      color: var(--accent);
    }
    .event-page-shell .event-description {
      font-size: 1rem;
      line-height: 1.62;
      margin: 0 0 1.5rem;
    }
    @media (max-width: 768px) {
      .event-page-shell {
        margin-top: 0.75rem;
      }
      .event-back-link a {
        font-size: 0.9rem;
      }
      .event-page-title {
        font-size: 2rem;
        margin-bottom: 1rem;
      }
      .event-page-shell .event-description {
        font-size: 0.95rem;
        line-height: 1.62;
      }
      .event-meta-top {
        flex-direction: column;
        gap: 0.7rem;
      }
      .event-meta-badges {
        justify-content: flex-start;
      }
      .event-meta-item {
        font-size: 0.9rem;
      }
    }
  </style>
  <script type="application/ld+json">${JSON.stringify(eventSchema, null, 2)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema, null, 2)}</script>
</head>
<body>
  <div id="main-content">
    <nav class="navbar" aria-label="Main Navigation">
      <a href="${eventsIndexPath}" class="navbar-profile" aria-label="Back to events directory">
        <img src="../../images/bitcoin-logo.png" alt="Bitcoin Logo" class="navbar-profile-pic" width="48" height="48" decoding="async" />
        <span class="navbar-profile-name">Events</span>
      </a>
    </nav>
    <main class="section event-page-shell">
      <p class="event-back-link"><a href="${eventsIndexPath}">← Back to all events</a></p>
      <header>
        <h1 class="glow event-page-title">${escapeHtml(event.name)}</h1>
      </header>
      <article class="event-card ${escapeHtml(event.type)} ${event.featured ? "featured" : ""}">
        <div class="event-meta-top">
          <div class="event-meta-main">
            <p class="event-meta-item">📅 ${escapeHtml(dateRange)}</p>
            <p class="event-meta-item">📍 ${escapeHtml(event.location)}</p>
          </div>
          <div class="event-meta-badges">
            <span class="event-type-badge ${escapeHtml(event.type)}">${escapeHtml(typeLabel)}</span>
            ${event.featured ? '<span class="featured-badge">Featured</span>' : ""}
          </div>
        </div>
        <p class="event-description">${escapeHtml(event.description)}</p>
        <div class="event-links">
          ${event.website ? `<a href="${escapeHtml(event.website)}" target="_blank" rel="noopener noreferrer" class="event-link website">Official Website</a>` : ""}
          ${event.x ? `<a href="${escapeHtml(event.x)}" target="_blank" rel="noopener noreferrer" class="event-link social x">X</a>` : ""}
          ${event.nostr ? `<a href="${escapeHtml(event.nostr)}" target="_blank" rel="noopener noreferrer" class="event-link social nostr">Nostr</a>` : ""}
        </div>
      </article>
    </main>
  </div>
</body>
</html>`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function main() {
  const dataSource = await fs.readFile(DATA_FILE, "utf8");
  const indexSource = await fs.readFile(INDEX_FILE, "utf8");
  const allEvents = loadEventsData(dataSource)
    .filter((event) => event && event.name && event.date && event.location)
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));

  eventSlugStats = buildSlugStats(allEvents);

  const upcomingEvents = allEvents.filter((event) => event.date >= todayIso());
  const eventsForIndex = (upcomingEvents.length ? upcomingEvents : allEvents).slice(0, 120);

  const renderedCards = renderIndexCards(eventsForIndex);
  const renderedSchema = renderItemListSchema(eventsForIndex);

  let updatedIndex = replaceBlock(
    indexSource,
    "<!-- GENERATED_EVENTS_LIST_START -->",
    "<!-- GENERATED_EVENTS_LIST_END -->",
    renderedCards
  );
  updatedIndex = replaceBlock(
    updatedIndex,
    "<!-- GENERATED_ITEMLIST_SCHEMA_START -->",
    "<!-- GENERATED_ITEMLIST_SCHEMA_END -->",
    renderedSchema
  );
  await fs.writeFile(INDEX_FILE, updatedIndex, "utf8");

  // Remove old generated slug directories from previous runs
  const eventEntries = await fs.readdir(EVENTS_DIR, { withFileTypes: true });
  for (const entry of eventEntries) {
    if (!entry.isDirectory()) continue;
    const markerPath = path.join(EVENTS_DIR, entry.name, ".generated-event-page");
    try {
      await fs.access(markerPath);
      await fs.rm(path.join(EVENTS_DIR, entry.name), { recursive: true, force: true });
    } catch {
      // Ignore non-generated directories.
    }
  }
  // Remove legacy generated directories after migration.
  await fs.rm(path.join(EVENTS_DIR, "event"), { recursive: true, force: true });
  await fs.rm(EVENT_PAGES_DIR, { recursive: true, force: true });
  await fs.mkdir(EVENT_PAGES_DIR, { recursive: true });

  for (const event of allEvents) {
    const slug = buildEventSlug(event);
    await fs.writeFile(path.join(EVENT_PAGES_DIR, `${slug}.html`), renderEventPage(event), "utf8");
  }

  const lastmod = todayIso();
  const urls = [
    `${SITE_URL}${EVENTS_BASE_PATH}/`,
    ...allEvents.map((event) => `${SITE_URL}${EVENTS_BASE_PATH}/${buildEventSlug(event)}/`),
  ];
  const urlEntries = urls
    .map((url) => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${url.endsWith("/events/") ? "1.0" : "0.7"}</priority>\n  </url>`)
    .join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;
  await fs.writeFile(SITEMAP_FILE, sitemap, "utf8");

  console.log(`Generated ${allEvents.length} event pages, updated index fallback and sitemap.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
