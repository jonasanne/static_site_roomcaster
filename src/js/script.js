const DEBUG = false; // Set to `false` for production
const debugTime = new Date("2025-04-09T06:00:00Z"); // Custom debug time

const urlParams = new URLSearchParams(window.location.search);
const room = urlParams.get('room');
const day = urlParams.get('day') || getCurrentDay();
const testDate = DEBUG ? debugTime : new Date(); // Use debugTime if DEBUG is true
let remainingSessions = [];

// Cache DOM elements
const elements = {
  room: document.querySelector(".js-room"),
  time: document.querySelector(".js-time"),
  retry: document.querySelector(".js-retry"),
  currentCard: document.querySelector(".js-current-card"),
  currentTitle: document.querySelector(".js-current-title"),
  currentTime: document.querySelector(".js-current-time"),
  currentSpeaker: document.querySelector(".js-curent-speaker .speaker-js"),
  nextTitle: document.querySelector(".js-next-title"),
  nextTime: document.querySelector(".js-next-time"),
  nextSpeaker: document.querySelector(".js-next-speaker .speaker-js"),
  nextSpeakerContainer: document.querySelector(".js-next-speaker"),
  sessionsContainer: document.querySelector(".js-sessions-container"),
  sessionTemplate: document.querySelector(".js-session-template"),
  error: document.querySelector(".js-error"),
  sponsorLogo: document.querySelector(".js-sponsor-logo"),
};

// Function to set the sponsor logo based on the room
function setSponsorLogo(room) {
  const sponsorLogos = {
    "calibrate room": "src/assets/img/calibrate-logo.png",
    "dropsolid room": "src/assets/img/dropsolid-logo.png",
  };

if (elements.sponsorLogo && sponsorLogos[room]) {
    elements.sponsorLogo.src = sponsorLogos[room];
    elements.sponsorLogo.alt = `${room} logo`;
  }
}

// Initialize room name
if (room) {
  elements.room.innerText = room.toUpperCase();
  setSponsorLogo(room.toLowerCase());

}

// Get the current day as a string
function getCurrentDay() {
  const today = DEBUG ? debugTime : new Date();
  return today.toLocaleDateString("en-EN", { weekday: "long" });
}

// Update the current time in the UI
function updateTime() {
  const now = DEBUG ? debugTime.toLocaleTimeString() : new Date().toLocaleTimeString();
  elements.time.innerText = now;
}

// Check if the current time is between two times
function isCurrentTimeBetween(startTime, endTime) {
  const now = DEBUG ? debugTime : new Date();
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours, startMinutes);
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes);

  return now >= startDate && now <= endDate;
}

// Check if a session is upcoming
function isUpcomingSession(startTime) {
  const now = DEBUG ? debugTime : new Date();
  const [startHours, startMinutes] = startTime.split(":").map(Number);

  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours, startMinutes);
  return now < startDate;
}

// Set the next session details in the UI
function setNextSession(session, data, index) {
  const nextSession = data[index + 1];
  if (nextSession) {
    elements.nextTitle.innerText = nextSession.title || "Loading...";
    elements.nextTime.innerText = `${nextSession.start_time} - ${nextSession.end_time}` || "Loading...";
    elements.nextSpeaker.innerText = nextSession.speaker || "Loading...";

    if (!nextSession.speaker) {
      elements.nextSpeakerContainer.classList.add("hidden");
    } else {
      elements.nextSpeakerContainer.classList.remove("hidden");
    }
  }
}

// Render the list of upcoming sessions
function renderSessions(sessions) {
  elements.sessionsContainer.innerHTML = ""; // Clear previous sessions
  sessions.forEach((session) => {
    const clone = elements.sessionTemplate.cloneNode(true);
    clone.classList.remove("hidden");
    clone.querySelector(".js-session-title").innerText = session.title;
    clone.querySelector(".js-session-time").innerText = `${session.start_time} - ${session.end_time}`;
    const speakerElement = clone.querySelector(".js-session-speaker");
    if (session.speaker) {
      speakerElement.innerText = session.speaker;
      speakerElement.parentElement.classList.remove("hidden");
    } else {
      speakerElement.parentElement.classList.add("hidden");
    }
    elements.sessionsContainer.appendChild(clone);
  });
}

// Load sessions from the backend
function loadSessions() {
  fetch(`../backend/sessions.php?room=${room}&day=${day}`)
    .then((response) => response.json())
    .then((data) => {
      remainingSessions = data.filter((session) => isUpcomingSession(session.start_time));
      let currentSessionFound = false;

      data.forEach((session, index) => {
        if (isCurrentTimeBetween(session.start_time, session.end_time)) {
          currentSessionFound = true;
          elements.currentCard.classList.remove("hidden");
          elements.currentTitle.innerText = session.title || "Loading...";
          elements.currentTime.innerText = `${session.start_time} - ${session.end_time}` || "Loading...";
            if (!session.speaker) {
            elements.currentSpeaker.parentElement.classList.add("hidden");
            } else {
            elements.currentSpeaker.parentElement.classList.remove("hidden");
            elements.currentSpeaker.innerText = session.speaker;
            }
          setNextSession(session, data, index);
        }
      });

      if (!currentSessionFound && remainingSessions.length > 0) {
        const firstSession = remainingSessions[0];
        elements.nextTitle.innerText = firstSession.title || "Loading...";
        elements.nextTime.innerText = `${firstSession.start_time} - ${firstSession.end_time}` || "Loading...";
        elements.nextSpeaker.innerText = firstSession.speaker || "Loading...";

        if (!firstSession.speaker) {
          elements.nextSpeakerContainer.classList.add("hidden");
        } else {
          elements.nextSpeakerContainer.classList.remove("hidden");
        }
      }

      renderSessions(remainingSessions);
    })
    .catch((err) => {
      elements.error.classList.remove("hidden");
      console.error("Error loading sessions:", err);
      setTimeout(() => location.reload(), 30000); // Retry after 30 seconds
    });
}

// Initialize the application
function init() {
  updateTime();
  loadSessions(); // Initial call to load sessions
  setInterval(() => {
    loadSessions();
  }, 60000); // Update sessions every 60 seconds
  setInterval(() => {
    updateTime();
  }, 1000); // Update time every second
}

init();