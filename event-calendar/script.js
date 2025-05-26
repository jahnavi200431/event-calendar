
const calendarEl = document.getElementById("calendar");
const monthYearEl = document.getElementById("month-year");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");

const eventModal = document.getElementById("event-modal");
const eventForm = document.getElementById("event-form");
const deleteEventBtn = document.getElementById("delete-event");
const closeModalBtn = document.getElementById("close-modal");

const titleInput = document.getElementById("event-title");
const descriptionInput = document.getElementById("event-description");
const datetimeInput = document.getElementById("event-datetime");
const categoryInput = document.getElementById("event-category");
const recurrenceInput = document.getElementById("event-recurrence");

const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");

const themeSwitch = document.getElementById("theme-switch");

let currentDate = new Date();
let events = [];
let editEventId = null;


function loadEvents() {
  const data = localStorage.getItem("calendarEvents");
  if (data) {
    events = JSON.parse(data);
  }
}

function saveEvents() {
  localStorage.setItem("calendarEvents", JSON.stringify(events));
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function renderCalendar() {
  calendarEl.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYearEl.textContent = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1);
  const startingDay = firstDay.getDay();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < startingDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("day", "empty");
    calendarEl.appendChild(emptyCell);
  }

  const searchText = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value.toLowerCase();

  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(year, month, day);

    const dayEl = document.createElement("div");
    dayEl.classList.add("day");
    dayEl.dataset.date = formatDate(dayDate);

    const today = new Date();
    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayEl.classList.add("today");
    }

    const dayNumber = document.createElement("div");
    dayNumber.textContent = day;
    dayEl.appendChild(dayNumber);

    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.datetime);
      const matchesDate =
        eventDate.getFullYear() === dayDate.getFullYear() &&
        eventDate.getMonth() === dayDate.getMonth() &&
        eventDate.getDate() === dayDate.getDate();

      const matchesSearch =
        event.title.toLowerCase().includes(searchText) ||
        (event.description &&
          event.description.toLowerCase().includes(searchText));

      const eventCat = event.category ? event.category.toLowerCase() : "";
      const matchesCategory =
        selectedCategory === "all" || eventCat === selectedCategory;

      return matchesDate && matchesSearch && matchesCategory;
    });

    dayEvents.forEach((event) => {
      const eventEl = document.createElement("div");
      eventEl.classList.add("event", event.category);
      eventEl.textContent = event.title;
      eventEl.title = `${event.title}\n${event.description || ""}\n${new Date(
        event.datetime
      ).toLocaleString()}`;
      eventEl.dataset.id = event.id;

      eventEl.addEventListener("click", (e) => {
        e.stopPropagation(); 
        openEditModal(event.id);
      });

      dayEl.appendChild(eventEl);
    });

    dayEl.addEventListener("click", () => {
      openAddModal(dayDate);
    });

    calendarEl.appendChild(dayEl);
  }
}

function openAddModal(date) {
  editEventId = null;
  eventForm.reset();
  deleteEventBtn.classList.add("hidden");
  document.getElementById("form-title").textContent = "Add Event";

  const localDateTime = date.toISOString().slice(0, 16);
  datetimeInput.value = localDateTime;

  showModal();
}

function openEditModal(id) {
  editEventId = id;
  const event = events.find((e) => e.id === id);
  if (!event) return;

  document.getElementById("form-title").textContent = "Edit Event";
  titleInput.value = event.title;
  descriptionInput.value = event.description || "";
  datetimeInput.value = new Date(event.datetime).toISOString().slice(0, 16);
  categoryInput.value = event.category || "meeting";
  recurrenceInput.value = event.recurrence || "none";

  deleteEventBtn.classList.remove("hidden");

  showModal();
}

function showModal() {
  eventModal.classList.remove("hidden");
}

function closeModal() {
  eventModal.classList.add("hidden");
}

function generateId() {
  return Date.now().toString() + Math.random().toString(16).slice(2);
}

eventForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  if (!title) return alert("Title is required!");

  const datetime = datetimeInput.value;
  if (!datetime) return alert("Date and time required!");

  const category = categoryInput.value.toLowerCase();
  const description = descriptionInput.value.trim();
  const recurrence = recurrenceInput.value;

  if (editEventId) {
  
    const idx = events.findIndex((e) => e.id === editEventId);
    if (idx !== -1) {
      events[idx] = {
        ...events[idx],
        title,
        description,
        datetime,
        category,
        recurrence,
      };
    }
  } else {
    
    const newEvent = {
      id: generateId(),
      title,
      description,
      datetime,
      category,
      recurrence,
    };
    events.push(newEvent);
  }

  saveEvents();
  renderCalendar();
  closeModal();
});


deleteEventBtn.addEventListener("click", () => {
  if (!editEventId) return;
  if (!confirm("Are you sure you want to delete this event?")) return;

  events = events.filter((e) => e.id !== editEventId);
  saveEvents();
  renderCalendar();
  closeModal();
});

closeModalBtn.addEventListener("click", () => {
  closeModal();
});

prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});
nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

searchInput.addEventListener("input", renderCalendar);
categoryFilter.addEventListener("change", renderCalendar);

function loadTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.body.classList.add("dark");
    themeSwitch.checked = true;
  } else {
    document.body.classList.remove("dark");
    themeSwitch.checked = false;
  }
}

themeSwitch.addEventListener("change", () => {
  if (themeSwitch.checked) {
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
});

loadEvents();
loadTheme();
renderCalendar();
