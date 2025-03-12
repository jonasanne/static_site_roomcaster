const urlParams = new URLSearchParams(window.location.search);
const room = urlParams.get('room');
const day = urlParams.get('day');

document.querySelectorAll(".day")[0].innerText = `${day}`;
document.querySelectorAll(".room-title")[0].innerText = `${room.toUpperCase()}`;

function isCurrentTimeBetween(startTime, endTime) {
  const now = new Date();
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHours, startMinutes);
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes);

  return now >= startDate && now <= endDate;
}

function loadSessions() {
  fetch(`../backend/sessions.php?room=${room}&day=${day}`)
    .then(response => response.json())
    .then(data => {
      console.dir(data);
      data.forEach(session => {
        const { start_time, end_time, title } = session;
        if (isCurrentTimeBetween(start_time, end_time)) {
          document.querySelectorAll('.current-session__title')[0].innerText = `${title}`;
          document.querySelectorAll('.current-session__time')[0].innerText = `${start_time} - ${end_time}`;
        }
      });
    })
    .catch(err => console.error("Fout bij laden:", err));
}

// Wissel elke 10 sec tussen views
// let currentView = 0;
// const views = ["#current-session", "#full-schedule"];

// function switchView() {
//   document.querySelectorAll(".view").forEach(v => v.style.display = "none");
//   document.querySelector(views[currentView]).style.display = "block";
//   currentView = (currentView + 1) % views.length;
// }

// setInterval(switchView, 10000);
loadSessions();
setInterval(loadSessions, 60000); // Update data elke 60 sec
