import { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID; 
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

export const useGoogleCalendar = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const start = () => {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
      }).then(() => {
        setIsInitialized(true);
      }).catch(err => console.error("GAPI Init Error:", err));
    };
    gapi.load('client:auth2', start);
  }, []);

  const saveToCalendar = async (title, date, description) => {
    if (!isInitialized) {
        alert("Calendar API not ready yet. Please refresh.");
        return;
    }

    try {
      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

      const event = {
        'summary': title,
        'description': description || "Event from Campus Sync",
        'start': {
          'date': date, 
          'timeZone': 'Asia/Kolkata'
        },
        'end': {
          'date': date, 
          'timeZone': 'Asia/Kolkata'
        }
      };

      await gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
      });

      alert("📅 Event added to your Google Calendar!");
      return true;
    } catch (error) {
      console.error("Calendar Error:", error);
      alert("Failed to add to calendar. Check console.");
      return false;
    }
  };

  return { saveToCalendar };
};