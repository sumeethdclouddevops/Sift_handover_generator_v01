# ARE Handover Generator

Professional shift handover documentation tool designed for seamless team communication and task management across shifts.

## Features

### 1. **Database-Like Agent Selection**
- Pre-configured dropdown lists with Agent 1 through Agent 11
- Consistent agent selection across all form sections

### 2. **Shift Management**
- **Shift 1**: 5:30 AM to 3:00 PM IST
- **Shift 2**: 2:30 PM to 11:00 PM IST  
- **Shift 3**: 9:00 AM to 5:30 PM PST
- Automatic shift detection based on system time
- Manual shift override option

### 3. **Smart Form Sections**

#### Generator Information
- Select which agent is generating the handover

#### Shift Selection
- Auto-detects current shift from system time
- Option to manually override shift selection
- Daylight Saving Time (DST) toggle for accurate time calculations

#### Tasks from Previous Shift
- Automatically displays previous shift timings
- Add multiple tasks with:
  - Task description
  - Ticket numbers (with prefix options: HOA, CBLT, ISBN)
  - Status tracking (Open, In Progress, Pending, Resolved, On Hold)
  - Notes and issues

#### Current Shift
- Display current shift details with timings
- Manage current shift tasks
- Issue tracking with detailed information:
  - Issue type and description
  - Tracking ticket number
  - Resolution actions
  - Assigned agent
- Additional notes and numbered points

#### Handover to Next Shift
- Automatic next shift determination
- Select receiving agent
- Add handover tasks with same structure as current shift

#### Shift Details
- Toggle to include team member details in output
- Assign multiple agents to each shift
- Professional team roster display

### 4. **Professional Output Format**
- Clean HTML table format compatible with:
  - Microsoft Teams
  - Outlook Mail
  - Web browsers
- Professional styling with:
  - Bold and enlarged shift/agent names
  - Serial numbered tickets and tasks
  - Color-coded sections
  - Responsive design

### 5. **Theme Customization**
- **Dark/Light Mode Toggle**: Switch between dark and light themes
- Settings persist in browser local storage
- Professional color scheme optimized for readability

### 6. **Daylight Saving Time**
- Toggle DST on/off for accurate shift time calculations
- Particularly useful when shifts span DST change periods
- Settings persist across sessions

### 7. **Smart Output Generation**
- Only includes sections with data (empty sections are skipped)
- Professional footer with generation timestamp
- Shareable page link for team access
- Copy to clipboard functionality for easy sharing

## How to Use

### 1. **Initial Setup**
- Open the `index.html` file in your web browser
- Or deploy to GitHub Pages for cloud access

### 2. **Configure Preferences**
- Use the header controls to set:
  - Dark/Light theme preference
  - Daylight Saving Time status

### 3. **Fill Form Information**
- Select the agent generating the handover
- Verify/adjust current shift
- Select previous shift agent
- Add tasks and issues as needed
- Select agent for next shift

### 4. **Generate Report**
- Click "Generate Handover Report"
- Review the formatted output
- Copy HTML or share the page link

### 5. **Share with Team**
- Copy the page link from the output section
- Share via Teams, Email, or messaging
- Team members can view the professional report

## Technical Details

### No GitHub Actions Required
- Pure static HTML, CSS, and JavaScript
- No build process needed
- Deploy directly to GitHub Pages

### Browser Compatibility
- Works in all modern browsers
- Responsive design for mobile and desktop
- Local storage for preferences

### Data Privacy
- All data processed locally in browser
- No server uploads
- No external dependencies

## Shift Timing Reference

| Shift | Time (IST) | Notes |
|-------|-----------|-------|
| Shift 1 | 5:30 AM - 3:00 PM | Morning/Midday |
| Shift 2 | 2:30 PM - 11:00 PM | Afternoon/Evening |
| Shift 3 | 9:00 AM - 5:30 PM PST | Pacific Time |

## Ticket Number Prefixes

- **HOA**: Hand Over Assignment
- **CBLT**: Client Business Level Ticket
- **ISBN**: Internal Support Booking Number

## Tips for Best Results

1. **Consistency**: Use the same agent names across all entries
2. **Completeness**: Fill in all relevant details for clear handovers
3. **Timeliness**: Generate reports at shift change times
4. **Organization**: Use the DST toggle when applicable
5. **Sharing**: Always include the page link for future reference

## Support

For issues or feature requests, please contact your team administrator or the handover process coordinator.

---

**ARE Handover Generator** - Making shift handovers professional, efficient, and transparent.
