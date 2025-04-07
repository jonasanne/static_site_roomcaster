const urlParams = new URLSearchParams(window.location.search);
const room = urlParams.get('room');
const day = urlParams.get('day');
let remainingSessions = [];
let test = new Date("2025-03-14T12:00:00Z");

document.querySelectorAll(".js-room")[0].innerText = `${room.toUpperCase()}`;

function updateTime() {
  let now = new Date();
  now = now.toLocaleTimeString();
  document.querySelectorAll(".js-time")[0].innerText = `${now}`;
}

function updateErrorTime() {
  document.querySelectorAll(".js-retry")[0].innerText = `${now}`;
}

function isCurrentTimeBetween(startTime, endTime) {
  //test
  const now = test;
  // const now = new Date();
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours, startMinutes);
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes);

  return now >= startDate && now <= endDate;
}

function isUpcomingSession(startTime) {
  //test
  const now = test;
  // const now = new Date();

  const [startHours, startMinutes] = startTime.split(':').map(Number);

  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours,
    startMinutes);

  return now < startDate;
}

function setNextSession(session, data, index) {
  //check if there is a speaker
  if (!session.speaker) {
    document.querySelectorAll('.js-curent-speaker')[0].classList.toggle("hidden");
  }
  //upcoming session:
  let next_session = data[index + 1];

  if (next_session) {
    document.querySelectorAll('.js-next-title')[0].innerText = next_session.title ? `${next_session.title}` : "Loading...";
    document.querySelectorAll('.js-next-time')[0].innerText = next_session.start_time ? `${next_session.start_time} - ${next_session.end_time}` : "Loading...";
    document.querySelectorAll('.js-next-speaker .speaker-js')[0].innerText = next_session.speaker ? `${next_session.speaker}` : "Loading...";

    //check if there is a speaker
    if (!next_session.speaker) {
      document.querySelectorAll('.js-next-speaker')[0].classList.toggle("hidden");
    }

  }
}
function loadSessions() {
  fetch(`../backend/sessions.php?room=${room}&day=${day}`)
    .then(response => response.json())
    .then(data => {
      remainingSessions = data.filter(session => isUpcomingSession(session.start_time));
      let currentSessionFound = false;

      data.forEach(session => {
        let index = data.findIndex((a) => a.end_time === session.end_time);
        const { start_time, end_time, title } = session;
        if (isCurrentTimeBetween(start_time, end_time)) {
          currentSessionFound = true;
          document.querySelectorAll('.js-current-card')[0].classList.remove('hidden');
          document.querySelectorAll('.js-current-title')[0].innerText = title ? `${title}` : "Loading...";
          document.querySelectorAll('.js-current-time')[0].innerText = start_time ? `${start_time} - ${end_time}` : "Loading...";
          document.querySelectorAll('.js-curent-speaker .speaker-js')[0].innerText = session.speaker ? `${session.speaker}` : "Loading";

          setNextSession(session, data, index);

        }

      });
      if (!currentSessionFound && remainingSessions.length > 0) {
        const firstSession = remainingSessions[0]; // Remove the first session from remainingSessions

        document.querySelectorAll('.js-next-title')[0].innerText = firstSession.title ? `${firstSession.title}` : "Loading...";
        document.querySelectorAll('.js-next-time')[0].innerText = firstSession.start_time ? `${firstSession.start_time} - ${firstSession.end_time}` : "Loading...";
        document.querySelectorAll('.js-next-speaker .speaker-js')[0].innerText = firstSession.speaker ? `${firstSession.speaker}` : "Loading...";

        //check if there is a speaker
        if (!firstSession.speaker) {
          document.querySelectorAll('.js-next-speaker')[0].classList.toggle("hidden");
        }
      }
      const sessionsContainer = document.querySelector('.js-sessions-container');
      sessionsContainer.innerHTML = ''; // Clear previous sessions
      remainingSessions.forEach(session => {
        const template = document.querySelector('.js-session-template');
        const clone = template.cloneNode(true);
        clone.classList.remove('hidden');
        clone.querySelector('.js-session-title').innerText = session.title;
        clone.querySelector('.js-session-time').innerText = `${session.start_time} - ${session.end_time}`;
        clone.querySelector('.js-session-speaker').innerText = session.speaker || 'TBA';
        sessionsContainer.appendChild(clone);
      })
    })
    .catch(err => {
      document.querySelectorAll('.js-error')[0].classList.remove("hidden");
      console.error("Fout bij laden:", err);
      setTimeout(() => {
        location.reload();
      }, 1000);
    });
}


updateTime();
loadSessions();
setInterval(loadSessions, 60000); // Update data elke 60 sec
setInterval(updateTime, 1000); // Update data elke sec

