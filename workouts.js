/* Personal workout log. No network requests: all entries stay in this browser. */
(() => {
  "use strict";
  const { $, el, showToast, downloadText, closeOnBackdrop } = window.FORM;
  const LEGACY_KEY = "form-workout-log-v1", USERS_KEY = "form-workout-users-v1", ACTIVE_KEY = "form-workout-active-user";
  let users = [{id:"default",name:"My training"}], activeUser = "default", registryBlocked = false;
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (!Array.isArray(list) || !list.length || list.length>20 || new Set(list.map(u=>u.id)).size!==list.length || !list.every(u=>u&&typeof u.id==="string"&&/^(default|[0-9a-f-]{36})$/.test(u.id)&&typeof u.name==="string"&&u.name.trim()&&u.name.length<=50)) throw new Error("Invalid profiles");
      users = list;
    }
    const active = localStorage.getItem(ACTIVE_KEY);
    if (users.some(u=>u.id===active)) activeUser=active;
  } catch { registryBlocked = true; showToast("Browser profiles could not be read. Your original log is still available."); }
  const KEY = activeUser==="default" ? LEGACY_KEY : LEGACY_KEY+":"+activeUser;
  const dateKey = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  const parseDate = (key) => new Date(key + "T12:00:00");
  const shiftDate = (key, days) => { const d = parseDate(key); d.setDate(d.getDate() + days); return dateKey(d); };
  const validDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= "1900-01-01" && value <= "9999-12-31" && dateKey(parseDate(value)) === value;
  const uid = () => crypto.randomUUID();
  const blankSet = () => ({ id: uid(), reps: "", weight: "", rir: "", done: false });
  const fresh = () => ({ version: 1, sessions: [] });
  let data = fresh(), selectedDate = dateKey(new Date()), selectedId = null, editingId = null, copyingId = null;
  let blockedStorage = false;
  function validate(value) {
    const text = (v, max) => typeof v === "string" && v.length <= max;
    const number = (v, max, integer = false) => v === "" || (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max && (!integer || Number.isInteger(v)));
    const ids = new Set();
    const id = (v) => { if (!text(v, 100) || !v || ids.has(v)) return false; ids.add(v); return true; };
    if (!value || value.version !== 1 || !Array.isArray(value.sessions) || value.sessions.length > 5000 || (value.profile && !window.FORMTraining.validProfile(value.profile))) return false;
    return value.sessions.every(s => s && id(s.id) && text(s.title, 80) && s.title.trim() && validDate(s.date) && ["kg", "lb"].includes(s.unit) && text(s.notes, 1500) && typeof s.completed === "boolean" && (s.readiness === undefined || ["ready","low","pain"].includes(s.readiness)) && Array.isArray(s.exercises) && s.exercises.length <= 100 && s.exercises.every(e => e && id(e.id) && text(e.name, 100) && Array.isArray(e.sets) && e.sets.length > 0 && e.sets.length <= 100 && e.sets.every(t => t && id(t.id) && number(t.reps, 10000, true) && number(t.weight, 100000) && (t.rir === undefined || t.rir === "" || Number.isInteger(t.rir) && t.rir >= 0 && t.rir <= 5) && typeof t.done === "boolean")));
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
    window.dispatchEvent(new CustomEvent("form:log-rendered"));
  }
  function renderSession() {
    const panel = $("#session-panel"), s = current();
    panel.replaceChildren();
    if (!s) {
      const empty = el("div", { className: "empty-log" }, el("span", { className: "empty-mark", textContent: "↗", ariaHidden: "true" }), el("h2", { textContent: "Your next strong start." }), el("p", { textContent: "Plan a session for this day, add your exercises, then log the reps and weight for each set as you train." }), button("Plan a workout ＋", () => openSession(), "button"));
      panel.append(empty);
      window.FORMTrainingUI?.decorateDay(panel, null, data, selectedDate);
      return;
    }
    const completed = el("input", { type: "checkbox", checked: s.completed });
    completed.addEventListener("change", () => { s.completed = completed.checked; save(); render(); });
    panel.append(el("div", { className: "workout-heading" }, el("div", {}, el("div", { className: "eyebrow", textContent: "YOUR WORKOUT / " + s.unit.toUpperCase() }), el("h2", { textContent: s.title })), el("label", { className: "completion" }, completed, "Session complete")));
    if (s.notes) panel.append(el("p", { className: "session-notes", textContent: s.notes }));
    panel.append(el("div", { className: "workout-actions" }, button("Edit / move", () => openSession(s)), button("Repeat session", () => openSession(s, true)), button("Delete", () => confirmAction("Delete session?", "Delete “" + s.title + "” and all its logged sets? This cannot be undone.", "Delete session", () => { data.sessions = data.sessions.filter(item => item.id !== s.id); save(); render(); }), "quiet danger")));
    window.FORMTrainingUI?.decorateDay(panel, s, data, selectedDate);
    if (!s.exercises.length) panel.append(el("p", { className: "exercise-hint", textContent: "Choose an exercise from the library or add your own movement below." }));
    s.exercises.forEach((exercise, index) => {
      const card = el("article", { className: "exercise-card" });
      const name = el("input", { value: exercise.name, placeholder: "e.g. Bench press", maxLength: 100, required: true });
      name.dataset.exerciseName = exercise.id;
      name.addEventListener("input", () => { exercise.name = name.value; delete exercise.catalogId; delete exercise.target; s.customized=true; save(); });
      card.append(el("div", { className: "exercise-heading" }, el("label", { className: "exercise-name", textContent: "EXERCISE " + String(index + 1).padStart(2, "0") }, name), button("Remove", () => confirmAction("Remove exercise?", "Remove this exercise and its sets?", "Remove exercise", () => { s.exercises = s.exercises.filter(e => e.id !== exercise.id); s.customized=true; save(); render(); }), "quiet remove-exercise")));
      window.FORMTrainingUI?.decorateExercise(card, exercise, s, data);
      card.append(el("div", { className: "set-labels", ariaHidden: "true" }, el("span", { textContent: "SET" }), el("span", { textContent: "REPS" }), el("span", { textContent: "WEIGHT (" + s.unit.toUpperCase() + ")" }), el("span", { textContent: "REPS LEFT" }), el("span", { textContent: "DONE" }), el("span")));
      exercise.sets.forEach((set, setIndex) => {
        const row = el("div", { className: "set-row" + (set.done ? " done" : "") });
        row.append(el("span", { textContent: String(setIndex + 1) }));
        ["reps", "weight"].forEach(field => {
          const input = el("input", { type: "number", min: "0", max: field === "reps" ? "10000" : "100000", step: field === "reps" ? "1" : "any", value: set[field], placeholder: "—" });
          input.setAttribute("aria-label", (exercise.name || "Exercise " + (index + 1)) + ", set " + (setIndex + 1) + ", " + field + (field === "weight" ? " in " + s.unit : ""));
          input.inputMode = field === "weight" ? "decimal" : "numeric";
          input.addEventListener("input", () => {
            if (!input.validity.valid) { input.setAttribute("aria-invalid", "true"); return; }
            input.removeAttribute("aria-invalid"); set[field] = input.value === "" ? "" : Number(input.value); set.edited=true; save();
          });
          input.addEventListener("blur", () => { if (!input.validity.valid) { input.reportValidity(); input.value = set[field]; input.removeAttribute("aria-invalid"); } });
          row.append(input);
        });
        const effort=el("select",{className:"set-effort"});
        effort.setAttribute("aria-label",(exercise.name||"Exercise "+(index+1))+", set "+(setIndex+1)+", reps left");
        effort.append(el("option",{value:"",textContent:"—"}));
        for(let remaining=0;remaining<=5;remaining++)effort.append(el("option",{value:String(remaining),textContent:remaining===5?"5+":String(remaining)}));
        effort.value=Number.isInteger(set.rir)?String(set.rir):"";
        effort.addEventListener("change",()=>{set.rir=effort.value===""?"":Number(effort.value);save();});
        row.append(effort);
        const done = el("input", { type: "checkbox", checked: set.done });
        done.setAttribute("aria-label", "Mark set " + (setIndex + 1) + " complete for " + (exercise.name || "exercise " + (index + 1)));
        done.addEventListener("change", () => { set.done = done.checked; row.classList.toggle("done", set.done); save(); window.dispatchEvent(new CustomEvent("form:log-rendered")); window.dispatchEvent(new CustomEvent("form:set-completed",{detail:{done:set.done,rest:exercise.target?.rest||75}})); });
        const remove = button("×", () => { exercise.sets = exercise.sets.filter(t => t.id !== set.id); if(exercise.target)exercise.target.sets=exercise.sets.length; s.customized=true; save(); renderSession(); });
        remove.setAttribute("aria-label", "Remove set " + (setIndex + 1));
        remove.disabled = exercise.sets.length === 1;
        row.append(done, remove); card.append(row);
      });
      card.append(button("＋ Add set", () => {
        if (exercise.sets.length >= 100) { showToast("An exercise can have up to 100 sets."); return; }
        const previous = exercise.sets.at(-1);
        exercise.sets.push({ ...blankSet(), reps: previous.reps, weight: previous.weight }); if(exercise.target)exercise.target.sets=exercise.sets.length; s.customized=true;
        save(); renderSession();
      }));
      panel.append(card);
    });
    panel.append(button("Add an exercise ＋", () => {
      if (s.exercises.length >= 100) { showToast("A session can have up to 100 exercises."); return; }
      const exercise = { id: uid(), name: "", sets: [blankSet()] };
      s.exercises.push(exercise); s.customized=true; save(); render();
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
      s = { id: uid(), completed: false, exercises: source ? source.exercises.map(e => ({ ...e, id: uid(), sets: e.sets.map(t => ({ ...t, id: uid(), done: false, rir:"", edited:false, weight: t.weight === "" ? "" : Math.round(t.weight * factor * 100) / 100 })) })) : [] };
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
  $("#export").addEventListener("click", () => {
    const profileName=(users.find(u=>u.id===activeUser)?.name||"training").replace(/[^a-z0-9-]+/gi,"-").slice(0,50);
    downloadText("form-workouts-"+profileName+"-"+dateKey(new Date())+".json",JSON.stringify(data,null,2));showToast("This profile’s backup was downloaded.");
  });
  $("#import").addEventListener("change", async event => {
    const file = event.target.files[0]; event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error("Too large");
      const restored = JSON.parse(await file.text());
      if (!validate(restored)) throw new Error("Invalid backup");
      confirmAction("Restore backup?", "This replaces the log for “"+(users.find(u=>u.id===activeUser)?.name||"My training")+"” with " + restored.sessions.length + " sessions and the backup’s training preferences. Download this profile’s current backup first if you want to keep it.", "Restore backup", () => {
        data = restored; blockedStorage = false; selectedId = null;
        if (data.sessions.length) selectedDate = [...data.sessions].sort((a,b) => b.date.localeCompare(a.date))[0].date;
        save(); render(); showToast("Backup restored.");
      });
    } catch { showToast("This file is not a valid FORM workout backup (maximum 10 MB). Your log has not changed."); }
  });
  // Avoid silently overwriting changes made in another tab.
  window.addEventListener("storage", event => {
    if (![KEY,ACTIVE_KEY,USERS_KEY].includes(event.key)) return;
    blockedStorage = true;
    status("Log changed in another tab — reload before editing");
    showToast("Another tab changed your workout log. Download a backup of any unsaved changes, then reload this page.");
  });
  window.FORMLog = {
    snapshot: () => structuredClone(data),
    selectedDate: () => selectedDate,
    currentId: () => selectedId,
    selectSession(id) { const s=data.sessions.find(s=>s.id===id); if(s){selectedDate=s.date;selectedId=s.id;render();} },
    refresh: () => render(),
    users: () => ({users:structuredClone(users),activeUser}),
    selectUser(id) {
      if(registryBlocked || !users.some(u=>u.id===id)) return false;
      try { localStorage.setItem(ACTIVE_KEY,id); location.reload(); return true; }
      catch { showToast("Browser storage is unavailable. A profile could not be opened."); return false; }
    },
    createUser(name) {
      name=name.trim();
      if(registryBlocked || !name || name.length>50 || users.length>=20) { showToast("Use a name up to 50 characters. This browser supports up to 20 profiles."); return; }
      const user={id:uid(),name};
      try { localStorage.setItem(USERS_KEY,JSON.stringify([...users,user])); localStorage.setItem(ACTIVE_KEY,user.id); location.reload(); }
      catch { showToast("Profile could not be saved. Check browser storage."); }
    },
    setProfile(profile) {
      if(!window.FORMTraining.validProfile(profile)) return false;
      data.profile=structuredClone(profile); save(); return true;
    },
    setReadiness(id,readiness) {
      const session=data.sessions.find(s=>s.id===id);
      if(!session||!["ready","low","pain"].includes(readiness))return false;
      session.readiness=readiness;save();render();return true;
    },
    applySuggestion(exerciseId,adjustment) {
      if(blockedStorage){showToast("Reload your log before applying a suggestion.");return false;}
      const session=current(),exercise=session?.exercises.find(e=>e.id===exerciseId);
      if(!exercise||session.completed||session.readiness==="pain")return false;
      if(exercise.sets.every(t=>t.done)){showToast("All sets are complete. Your recorded work has been kept.");return false;}
      const updated=structuredClone(exercise);
      if(Number.isInteger(adjustment.sets)&&adjustment.sets>0&&adjustment.sets<updated.sets.length){
        if(updated.sets.some(t=>t.done||t.edited||Number.isInteger(t.rir))) {showToast("This exercise already has entries. Keep them and adjust remaining sets manually.");return false;}
        updated.sets=updated.sets.slice(0,adjustment.sets);
        if(updated.target)updated.target.sets=updated.sets.length;
      }
      updated.sets.filter(t=>!t.done).forEach(t=>{
        if(Number.isFinite(adjustment.weight))t.weight=adjustment.weight;
        if(Number.isFinite(adjustment.reps))t.reps=adjustment.reps;
        if(Number.isFinite(adjustment.weight)||Number.isFinite(adjustment.reps))t.rir="";
      });
      const next={...data,sessions:data.sessions.map(s=>s.id===session.id?{...s,exercises:s.exercises.map(e=>e.id===exerciseId?updated:e)}:s)};
      if(!validate(next))return false;
      data=next;save();render();showToast("Suggestion applied. Completed sets were kept.");return true;
    },
    applyPlanReview(updates) {
      if(blockedStorage){showToast("Reload your log before applying a plan review.");return false;}
      const safe=updates.filter(u=>data.sessions.some(s=>s.id===u.id&&JSON.stringify(s)===JSON.stringify(u.before)));
      if(!safe.length){showToast("Those sessions changed. Preview the review again before applying.");return false;}
      const next={...data,sessions:data.sessions.map(s=>safe.find(u=>u.id===s.id)?.after||s)};
      if(!validate(next))return false;
      data=structuredClone(next);save();render();showToast(safe.length+" upcoming sessions updated. Logged and manual sessions were kept.");return true;
    },
    addSessions(sessions) {
      if(blockedStorage) { showToast("Reload or restore your log before adding a guided plan."); return false; }
      const combined={...data,sessions:[...data.sessions,...sessions]};
      if(!sessions.length||!validate(combined)) { showToast("This plan could not be added. Check your dates and available log space."); return false; }
      data=combined; selectedDate=sessions[0].date; selectedId=sessions[0].id; save(); render(); return true;
    },
    addExercise(exercise,replaceId=null) {
      const s=current();
      if(!s) { showToast("Select or create a session first."); return false; }
      const apply=()=>{
        const exercises=replaceId?s.exercises.map(e=>e.id===replaceId?exercise:e):[...s.exercises,exercise];
        if(!validate({...data,sessions:data.sessions.map(item=>item.id===s.id?{...s,exercises}:item)})) { showToast("The exercise could not be added.");return; }
        s.exercises=exercises;s.customized=true;save();render();
      };
      const old=s.exercises.find(e=>e.id===replaceId);
      if(old && old.sets.some(t=>t.done||t.weight!==""&&t.weight!==0)) confirmAction("Swap this exercise?","The replacement starts with new sets. Your entries for this exercise in this session will be removed.","Swap exercise",apply);
      else apply();
      return true;
    }
  };
  render();
})();
