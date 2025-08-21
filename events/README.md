# Bitcoin Events Subdomain

This is a subdomain for listing Bitcoin events throughout the year. The events page provides a comprehensive view of upcoming and past Bitcoin conferences, meetups, workshops, and hackathons.

## Features

- **Upcoming Events**: Display of future Bitcoin events with filtering by type
- **Past Events**: Archive of completed events
- **Interactive Calendar**: Monthly calendar view showing events
- **Event Submission Form**: Allow community members to submit new events
- **Responsive Design**: Mobile-friendly interface
- **Event Categories**: Conference, Meetup, Workshop, Hackathon, Other
- **Featured Events**: Highlight important events with special styling

## File Structure

```
events/
├── index.html          # Main events page
├── events-data.js      # Events data and helper functions
├── events.js          # Main JavaScript functionality
├── style.css          # Events-specific styles
└── README.md          # This file
```

## Setup Instructions

### 1. DNS Configuration

To set up the subdomain, you'll need to configure your DNS settings:

- **Subdomain**: `events.yourdomain.com`
- **Type**: CNAME or A record pointing to your main domain
- **Value**: `yourdomain.com` (for CNAME) or your server IP (for A record)

### 2. Web Server Configuration

#### Apache (.htaccess)
```apache
RewriteEngine On
RewriteCond %{HTTP_HOST} ^events\.yourdomain\.com$ [NC]
RewriteRule ^(.*)$ /events/$1 [L]
```

#### Nginx
```nginx
server {
    listen 80;
    server_name events.yourdomain.com;
    
    location / {
        root /path/to/your/website/events;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. GitHub Pages (Alternative)

If you're using GitHub Pages, you can create a separate repository for the events subdomain:

1. Create a new repository named `events.yourdomain.com`
2. Push the events files to this repository
3. Enable GitHub Pages for the repository
4. Configure your DNS to point to the GitHub Pages URL

## Customization

### Adding New Events

Edit `events-data.js` to add new events:

```javascript
{
  id: 11,
  name: "Your Event Name",
  date: "2025-12-01",
  endDate: "2025-12-03", // Optional for multi-day events
  type: "conference", // conference, meetup, workshop, hackathon, other
  location: "City, Country",
  description: "Event description...",
  website: "https://eventwebsite.com",
  contact: "contact@event.com",
  featured: false // Set to true for featured events
}
```

### Styling

- Modify `style.css` to change colors, fonts, and layout
- Update CSS variables in the main `style.css` for consistent theming
- Customize event card animations and hover effects

### Event Types

The system supports these event types:
- **Conference**: Large-scale events with multiple speakers
- **Meetup**: Local community gatherings
- **Workshop**: Hands-on learning sessions
- **Hackathon**: Coding competitions
- **Other**: Miscellaneous events

## Event Submission Form

The form allows community members to submit new events. Currently, it shows a success message but doesn't actually store the data. To implement full functionality:

1. **Backend Integration**: Connect to a database or CMS
2. **Email Notifications**: Send submissions to administrators
3. **Moderation**: Review and approve submitted events
4. **Auto-publishing**: Automatically add approved events to the list

## Calendar Integration

The calendar view shows events on their respective dates. Events with multiple days are highlighted across their entire duration.

## Mobile Responsiveness

The events page is fully responsive and works well on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Performance

- Lazy loading of event cards
- Optimized CSS animations
- Minimal JavaScript dependencies
- Fast page load times

## Security Considerations

- Form validation on both client and server side
- Sanitize user inputs
- Implement rate limiting for form submissions
- Use HTTPS for all communications

## Future Enhancements

- **Event Search**: Add search functionality
- **Event Categories**: More detailed categorization
- **User Accounts**: Allow users to save favorite events
- **Notifications**: Email/calendar reminders for events
- **Social Sharing**: Easy sharing on social media
- **Event Maps**: Geographic visualization of events
- **Integration**: Connect with external event platforms

## Support

For questions or issues with the events subdomain, please contact the main website administrator.

## License

This events subdomain follows the same license as the main website.
