/* Personal workout log. No network requests: all entries stay in this browser. */
(() => {
  "use strict";
  const { $, el, showToast, downloadText, closeOnBackdrop } = window.FORM;
  const KEY = "form-workout-log-v1";
  const dateKey = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  const parseDate = (key) => new Date(key + "T12:00:00");
  const shiftDate = (key, days) => { const d = parseDate(key); d.setDate(d.getDate() + days); return dateKey(d); };
  const validDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= "1900-01-01" && value <= "9999-12-31" && dateKey(parseDate(value)) === value;
  const uid = () => crypto.randomUUID();
  const blankSet = () => ({ id: uid(), reps: "", weight: "", done: false });
  const fresh = () => ({ version: 1, sessions: [] });
  let data = fresh(), selectedDate = dateKey(new Date()), selectedId = null, editingId = null, copyingId = null;
  let blockedStorage = false;
  function validate(value) {
    const text = (v, max) => typeof v === "string" && v.length <= max;
    const number = (v, max, integer = false) => v === "" || (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max && (!integer || Number.isInteger(v)));
    const ids = new Set();
    const id = (v) => { if (!text(v, 100) || !v || ids.has(v)) return false; ids.add(v); return true; };
    if (!value || value.version !== 1 || !Array.isArray(value.sessions) || value.sessions.length > 5000) return false;
    return value.sessions.every(s => s && id(s.id) && text(s.title, 80) && s.title.trim() && validDate(s.date) && ["kg", "lb"].includes(s.unit) && text(s.notes, 1500) && typeof s.completed === "boolean" && Array.isArray(s.exercises) && s.exercises.length <= 100 && s.exercises.every(e => e && id(e.id) && text(e.name, 100) && Array.isArray(e.sets) && e.sets.length > 0 && e.sets.length <= 100 && e.sets.every(t => t && id(t.id) && number(t.reps, 10000, true) && number(t.weight, 100000) && typeof t.done === "boolean")));
  }
  function status(message) { $("#save-state").textContent = message; }
  try {
    const stored = localStorage.getItem(KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (!validate(parsed)) throw new Error("Invalid saved log");
      data = parsed;
    }
  } catch {
    blockedStorage = true;
    status("Saved log unavailable");
    showToast("Your saved log could not be read. Restore a backup or enable browser storage. Existing data has not been replaced.");
  }
  function save() {
    if (blockedStorage) { status("Changes are not saved — download a backup"); return; }
    try { localStorage.setItem(KEY, JSON.stringify(data)); status("Saved on this browser"); }
    catch { status("Changes are not saved — download a backup"); showToast("Browser storage is unavailable or full. Download a backup to keep these changes."); }
  }
  const current = () => data.sessions.find(s => s.id === selectedId);
  function button(label, action, cls = "quiet") {
    const b = el("button", { type: "button", className: cls, textContent: label });
    b.addEventListener("click", action);
    return b;
  }
  function chooseDate(date) {
    if (!validDate(date)) return;
    selectedDate = date; selectedId = null; render();
  }
  function renderCalendar() {
    const d = parseDate(selectedDate);
    const monday = shiftDate(selectedDate, -((d.getDay() + 6) % 7));
    const last = shiftDate(monday, 6);
    const fmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
    $("#week-label").textContent = fmt.format(parseDate(monday)) + " – " + fmt.format(parseDate(last)) + ", " + parseDate(last).getFullYear();
    $("#jump-date").value = selectedDate;
    $("#week-days").replaceChildren();
    for (let i = 0; i < 7; i++) {
      const key = shiftDate(monday, i), day = parseDate(key);
      const sessions = data.sessions.filter(s => s.date === key);
      const b = button("", () => chooseDate(key), "day-button" + (key === dateKey(new Date()) ? " today" : ""));
      b.setAttribute("aria-pressed", String(key === selectedDate));
      b.setAttribute("aria-label", day.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) + ", " + sessions.length + (sessions.length === 1 ? " session" : " sessions"));
      b.append(el("span", { textContent: day.toLocaleDateString("en", { weekday: "short" }) }), el("span", { className: "day-number", textContent: day.getDate() }), el("span", { className: "day-count", textContent: sessions.length ? sessions.length + (sessions.length === 1 ? " session" : " sessions") : "—" }));
      $("#week-days").append(b);
    }
  }
  function render() {
    renderCalendar();
    const sessions = data.sessions.filter(s => s.date === selectedDate);
    if (!sessions.some(s => s.id === selectedId)) selectedId = sessions[0]?.id || null;
    $("#day-label").textContent = parseDate(selectedDate).toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" });
    $("#session-list").replaceChildren();
    if (!sessions.length) $("#session-list").append(el("p", { className: "exercise-hint", textContent: "A little room for your next workout." }));
    sessions.forEach(s => {
      const b = button("", () => { selectedId = s.id; render(); }, "session-choice");
      b.setAttribute("aria-pressed", String(s.id === selectedId));
      b.append(el("strong", { textContent: s.title }), el("span", { textContent: (s.completed ? "✓ Completed" : "Planned") + " · " + s.exercises.length + (s.exercises.length === 1 ? " exercise" : " exercises") }));
      $("#session-list").append(b);
    });
    renderSession();
  }
  function renderSession() {
    const panel = $("#session-panel"), s = current();
    panel.replaceChildren();
    if (!s) {
      const empty = el("div", { className: "empty-log" }, el("span", { className: "empty-mark", textContent: "↗", ariaHidden: "true" }), el("h2", { textContent: "Your next strong start." }), el("p", { textContent: "Plan a session for this day, add your exercises, then log the reps and weight for each set as you train." }), button("Plan a workout ＋", () => openSession(), "button"));
      panel.append(empty); return;
    }
    const completed = el("input", { type: "checkbox", checked: s.completed });
    completed.addEventListener("change", () => { s.completed = completed.checked; save(); render(); });
    panel.append(el("div", { className: "workout-heading" }, el("div", {}, el("div", { className: "eyebrow", textContent: "YOUR WORKOUT / " + s.unit.toUpperCase() }), el("h2", { textContent: s.title })), el("label", { className: "completion" }, completed, "Session complete")));
    if (s.notes) panel.append(el("p", { className: "session-notes", textContent: s.notes }));
    panel.append(el("div", { className: "workout-actions" }, button("Edit / move", () => openSession(s)), button("Repeat session", () => openSession(s, true)), button("Delete", () => confirmAction("Delete session?", "Delete “" + s.title + "” and all its logged sets? This cannot be undone.", "Delete session", () => { data.sessions = data.sessions.filter(item => item.id !== s.id); save(); render(); }), "quiet danger")));
    if (!s.exercises.length) panel.append(el("p", { className: "exercise-hint", textContent: "Add your first exercise. You can use any movement or machine name and add as many sets as you need." }));
    s.exercises.forEach((exercise, index) => {
      const card = el("article", { className: "exercise-card" });
      const name = el("input", { value: exercise.name, placeholder: "e.g. Bench press", maxLength: 100, required: true });
      name.dataset.exerciseName = exercise.id;
      name.addEventListener("input", () => { exercise.name = name.value; save(); });
      card.append(el("div", { className: "exercise-heading" }, el("label", { className: "exercise-name", textContent: "EXERCISE " + String(index + 1).padStart(2, "0") }, name), button("Remove", () => confirmAction("Remove exercise?", "Remove this exercise and its sets?", "Remove exercise", () => { s.exercises = s.exercises.filter(e => e.id !== exercise.id); save(); render(); }), "quiet remove-exercise")));
      card.append(el("div", { className: "set-labels", ariaHidden: "true" }, el("span", { textContent: "SET" }), el("span", { textContent: "REPS" }), el("span", { textContent: "WEIGHT (" + s.unit.toUpperCase() + ")" }), el("span", { textContent: "DONE" }), el("span")));
      exercise.sets.forEach((set, setIndex) => {
        const row = el("div", { className: "set-row" + (set.done ? " done" : "") });
        row.append(el("span", { textContent: String(setIndex + 1) }));
        ["reps", "weight"].forEach(field => {
          const input = el("input", { type: "number", min: "0", max: field === "reps" ? "10000" : "100000", step: field === "reps" ? "1" : "any", value: set[field], placeholder: "—" });
          input.setAttribute("aria-label", (exercise.name || "Exercise " + (index + 1)) + ", set " + (setIndex + 1) + ", " + field + (field === "weight" ? " in " + s.unit : ""));
          input.inputMode = field === "weight" ? "decimal" : "numeric";
          input.addEventListener("input", () => {
            if (!input.validity.valid) { input.setAttribute("aria-invalid", "true"); return; }
            input.removeAttribute("aria-invalid"); set[field] = input.value === "" ? "" : Number(input.value); save();
          });
          input.addEventListener("blur", () => { if (!input.validity.valid) { input.reportValidity(); input.value = set[field]; input.removeAttribute("aria-invalid"); } });
          row.append(input);
        });
        const done = el("input", { type: "checkbox", checked: set.done });
        done.setAttribute("aria-label", "Mark set " + (setIndex + 1) + " complete for " + (exercise.name || "exercise " + (index + 1)));
        done.addEventListener("change", () => { set.done = done.checked; row.classList.toggle("done", set.done); save(); });
        const remove = button("×", () => { exercise.sets = exercise.sets.filter(t => t.id !== set.id); save(); renderSession(); });
        remove.setAttribute("aria-label", "Remove set " + (setIndex + 1));
        remove.disabled = exercise.sets.length === 1;
        row.append(done, remove); card.append(row);
      });
      card.append(button("＋ Add set", () => {
        if (exercise.sets.length >= 100) { showToast("An exercise can have up to 100 sets."); return; }
        const previous = exercise.sets.at(-1);
        exercise.sets.push({ ...blankSet(), reps: previous.reps, weight: previous.weight });
        save(); renderSession();
      }));
      panel.append(card);
    });
    panel.append(button("Add an exercise ＋", () => {
      if (s.exercises.length >= 100) { showToast("A session can have up to 100 exercises."); return; }
      const exercise = { id: uid(), name: "", sets: [blankSet()] };
      s.exercises.push(exercise); save(); render();
      document.querySelector('[data-exercise-name="' + exercise.id + '"]').focus();
    }, "button add-exercise"));
  }
  const form = $("#session-form"), dialog = $("#session-dialog");
  function openSession(s = null, copy = false) {
    editingId = s && !copy ? s.id : null; copyingId = copy ? s.id : null;
    form.reset();
    form.elements.title.value = s ? s.title : "";
    form.elements.date.value = copy ? shiftDate(s.date, 7) : s ? s.date : selectedDate;
    form.elements.date.min = "1900-01-01"; form.elements.date.max = "9999-12-31";
    form.elements.unit.value = s ? s.unit : "kg";
    form.elements.notes.value = s ? s.notes : "";
    $("#session-dialog-title").textContent = copy ? "Repeat your workout." : s ? "Edit your workout." : "Plan a workout.";
    dialog.showModal();
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    const title = form.elements.title.value.trim(), date = form.elements.date.value;
    if (!title || !validDate(date)) { showToast("Enter a session name and a valid date."); return; }
    const unit = form.elements.unit.value;
    let s = data.sessions.find(item => item.id === editingId);
    if (s) {
      if (unit !== s.unit) {
        const factor = unit === "lb" ? 2.2046226218 : 1 / 2.2046226218;
        const weights = s.exercises.flatMap(e => e.sets).filter(t => t.weight !== "");
        if (weights.some(t => t.weight * factor > 100000)) { showToast("A converted weight exceeds the supported limit. Adjust the weight first."); return; }
        weights.forEach(t => { t.weight = Math.round(t.weight * factor * 100) / 100; });
      }
    } else {
      if (data.sessions.length >= 5000) { showToast("Your log is full. Download a backup and remove old sessions."); return; }
      const source = data.sessions.find(item => item.id === copyingId);
      const factor = source && source.unit !== unit ? (unit === "lb" ? 2.2046226218 : 1 / 2.2046226218) : 1;
      s = { id: uid(), completed: false, exercises: source ? source.exercises.map(e => ({ id: uid(), name: e.name, sets: e.sets.map(t => ({ ...t, id: uid(), done: false, weight: t.weight === "" ? "" : Math.round(t.weight * factor * 100) / 100 })) })) : [] };
      if (s.exercises.some(e => e.sets.some(t => t.weight > 100000))) { showToast("A converted weight exceeds the supported limit."); return; }
      data.sessions.push(s);
    }
    Object.assign(s, { title, date, unit, notes: form.elements.notes.value.trim() });
    selectedDate = date; selectedId = s.id; save(); dialog.close(); render();
    showToast(copyingId ? "Session repeated. Set completion has been reset." : "Session updated.");
  });
  let confirmedAction = null;
  function confirmAction(title, message, label, action) {
    $("#confirm-title").textContent = title; $("#confirm-message").textContent = message;
    $("#confirm-yes").textContent = label; confirmedAction = action; $("#confirm-dialog").showModal();
    $("#confirm-cancel").focus();
  }
  $("#confirm-yes").addEventListener("click", () => { $("#confirm-dialog").close(); const action = confirmedAction; confirmedAction = null; action?.(); });
  $("#confirm-cancel").addEventListener("click", () => $("#confirm-dialog").close());
  $("[data-close]").addEventListener("click", () => dialog.close());
  document.querySelectorAll("dialog").forEach(d => d.addEventListener("click", closeOnBackdrop));
  $("#new-session").addEventListener("click", () => openSession());
  $("#add-session").addEventListener("click", () => openSession());
  $("#prev-week").addEventListener("click", () => chooseDate(shiftDate(selectedDate, -7)));
  $("#next-week").addEventListener("click", () => chooseDate(shiftDate(selectedDate, 7)));
  $("#today").addEventListener("click", () => chooseDate(dateKey(new Date())));
  $("#jump-date").min = "1900-01-01"; $("#jump-date").max = "9999-12-31";
  $("#jump-date").addEventListener("input", event => chooseDate(event.target.value));
  $("#export").addEventListener("click", () => { downloadText("form-workouts-" + dateKey(new Date()) + ".json", JSON.stringify(data, null, 2)); showToast("Backup downloaded."); });
  $("#import").addEventListener("change", async event => {
    const file = event.target.files[0]; event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error("Too large");
      const restored = JSON.parse(await file.text());
      if (!validate(restored)) throw new Error("Invalid backup");
      confirmAction("Restore backup?", "This replaces the log in this browser with " + restored.sessions.length + " sessions. Download your current backup first if you want to keep it.", "Restore backup", () => {
        data = restored; blockedStorage = false; selectedId = null;
        if (data.sessions.length) selectedDate = [...data.sessions].sort((a,b) => b.date.localeCompare(a.date))[0].date;
        save(); render(); showToast("Backup restored.");
      });
    } catch { showToast("This file is not a valid FORM workout backup (maximum 10 MB). Your log has not changed."); }
  });
  // Avoid silently overwriting changes made in another tab.
  window.addEventListener("storage", event => {
    if (event.key !== KEY) return;
    blockedStorage = true;
    status("Log changed in another tab — reload before editing");
    showToast("Another tab changed your workout log. Download a backup of any unsaved changes, then reload this page.");
  });
  render();
})();
