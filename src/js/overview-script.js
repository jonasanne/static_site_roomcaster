const DEBUG = false; // Set to `false` for production
const debugTime = new Date("2025-04-15T14:00:00Z"); // Custom debug time
const urlParams = new URLSearchParams(window.location.search);

const day = urlParams.get('day') || getCurrentDay();

// Cache DOM elements
const elements = {
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
    sessionsContainer: document.querySelector(".js-content-block"),
    sessionTemplate: document.querySelector(".js-content-block-item-template"),
    error: document.querySelector(".js-error"),
    sponsorLogo: document.querySelector(".js-sponsor-logo"),
};

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
// Check if a session is upcoming
function isUpcomingSession(startTime) {
    const now = DEBUG ? debugTime : new Date();
    const [startHours, startMinutes] = startTime.split(":").map(Number);

    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours, startMinutes);
    return now < startDate;
}
// Load sessions from the backend
function loadSessions() {
    fetch(`../backend/sessions.php?day=${day}`)
        .then((response) => response.json())
        .then((data) => {
            if (data["Calibrate Room"].length > 0) {
                remainingSessionsCali = data['Calibrate Room'].filter((session) => isUpcomingSession(session.start_time));
                populateSessions("calibrate", remainingSessionsCali);
            }
            if (data["Dropsolid Room"].length > 0) {
                remainingSessionsDS = data['Dropsolid Room'].filter((session) => isUpcomingSession(session.start_time));
                populateSessions("dropsolid", remainingSessionsDS);
            }
            if (data["Student Track"].length > 0) {
                remainingSessionsST = data['Student Track'].filter((session) => isUpcomingSession(session.start_time));
                populateSessions("student", remainingSessionsST);
            }
        })
        .catch((err) => {
            console.error("Error loading sessions:", err);
            setTimeout(() => location.reload(), 30000); // Retry after 30 seconds
        });
}
// Function to populate sessions
function populateSessions(roomName, roomData) {
    const roomElement = document.querySelector(`.js-${roomName.toLowerCase().replace(/\s+/g, '')}`);

    if (!roomElement) return;

    const contentBlock = roomElement.querySelector('.js-content-block');
    const template = document.querySelector('.js-content-block-item-template');

    roomData.forEach(session => {
        if (!session.title) return; // Skip if session title is empty
        const sessionElement = template.cloneNode(true);
        sessionElement.classList.remove('hidden'); // Unhide the template
        sessionElement.querySelector('.content_block-item-title p').innerText = session.title || 'No Title';
        sessionElement.querySelector('.content_block-item-time span').innerText = `${session.start_time} - ${session.end_time}`;
        if (!session.speaker) {
            sessionElement.querySelector('.content_block-item-speaker').classList.add('hidden');
        }
        sessionElement.querySelector('.content_block-item-speaker span').innerText = session.speaker || 'No Speaker';

        // Append the session element to the content block
        contentBlock.appendChild(sessionElement);
    });
}

// Initialize the application
function init() {
    loadSessions(); // Initial call to load sessions
    setInterval(() => {
        loadSessions();
    }, 60000); // Update sessions every 60 seconds
}

init();