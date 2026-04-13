# Bitcoin Events

A Bitcoin events directory hosted at [francismars.com/events](https://francismars.com/events). Lists upcoming and past Bitcoin conferences, meetups, workshops, and hackathons worldwide.

## Features

- Upcoming and past events with search and filtering by type
- Interactive map (Leaflet) showing event locations globally
- Monthly calendar view
- Individual event detail pages for SEO (`/events/pages/`)
- Community event submission form
- Lightning donation via Nostr zap

## File Structure

```
events/
├── index.html          # Main page (also contains statically rendered event cards for SEO)
├── events-data.js      # All event data
├── events.js           # Rendering, filtering, calendar, map, forms, navigation
├── style.css           # Events styles (imports root ../style.css)
├── pages/              # Static per-event HTML pages (~172 files, auto-generated)
├── sitemap.xml         # Auto-generated sitemap
├── .htaccess           # URL rewrites for /events/<slug>/ → pages/<slug>.html
└── robots.txt
```

## Adding Events

Edit `events-data.js`:

```javascript
{
  id: 123,
  name: "Event Name",
  date: "2026-06-01",
  endDate: "2026-06-03",
  type: "conference", // conference, meetup, workshop, hackathon, other
  location: "City, Country",
  coordinates: { lat: 0.0, lng: 0.0 },
  description: "Event description.",
  website: "https://eventwebsite.com",
  x: "",
  nostr: "",
  featured: false
}
```

Then regenerate static pages and sitemap:

```bash
node scripts/generate-events-pages.mjs
```

## Event Submission Form

Community members can submit events via the form on the page. Submissions currently show a success message but are not stored — backend integration pending.
