# AS&S Flight Scheduler

Helicopter-first flight scheduling for AS&S (Cullman). Replaces FlightCircle.

**Status:** working test build. Every screen and button works and saves, using the real clock. Data is saved in the browser you're using only, so it isn't shared between devices until the database is connected.

## Pages
- `index.html`: main console (Owner, Pilot, Operations)
- `student.html`: student app (phone and desktop)
- `tours.html`: tour desk (also embedded in the console)
- `demo.js`: shared demo data and saving; this is the file that gets replaced by the real database

## Next
1. Host on GitHub Pages
2. Supabase database, logins and live updates
3. Connect screens to real data
4. Test alongside FlightCircle
