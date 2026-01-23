# 🎓 Campus Sync

> **Bridging the Gap Between Administration & Students.** > *An Intelligent Campus Notification & Scheduling System powered by Google Gemini 2.5 Flash Lite.*

## The Problem
- **Information Overload:** Critical updates get lost in spammy WhatsApp groups and cluttered emails.
- **Manual Friction:** Admins waste time manually typing event details.
- **Missed Opportunities:** Students often forget deadlines because notices aren't synced to their personal tools.

## The Solution
**Campus Sync** is a Progressive Web App (PWA) that centralizes campus communication. It uses **Generative AI** to convert static posters into structured events and syncs them directly to students' **Google Calendars**.

---

## Key Features

### 1. AI-Powered "Zero-Type" Upload
- **Admins** simply upload a raw poster image.
- **Google Gemini 2.5 Flash** scans the image and automatically extracts:
  - Event Title
  - Date & Time
  - Venue
  - Description
- **Result:** Data entry reduced from 5 minutes to 10 seconds.

### 2. One-Click Google Calendar Sync
- Deep integration with the **Google Calendar API**.
- Students can add events to their personal schedule with a single tap.
- Includes automated reminders (e.g., "Hackathon starts in 1 hour").

### 3. Student Dashboard
- **USN-Based Login:** Customizes the feed based on Branch and Year.
- **4 Dedicated Pillars:**
  1. **Academic:** Official exams & schedules.
  2. **Clubs:** Recruitment, seminars, cultural meets.
  3. **Competitions:** Hackathons & inter-college contests.
  4. **Placements:** Job drives & internship alerts.

---

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React.js, Vite, Tailwind CSS |
| **Backend / DB** | Firebase Firestore (Real-time NoSQL) |
| **Authentication** | Firebase Auth (Custom USN Logic) |
| **AI Engine** | **Google Gemini 2.5 Flash API** |
| **Integrations** | Google Calendar API |
| **Hosting** | Firebase Hosting |

---

## How to Run Locally

Follow these steps to set up the project on your local machine.

### Prerequisites
- Node.js installed
- A Firebase project set up
- A Google Cloud API Key (for Gemini)

