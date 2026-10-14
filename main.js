// FORM home page: schedule, membership, planner and BMI (the shop is in shop.js).
(() => {
  const { $, $$, showToast, closeOnBackdrop, setActive, downloadText, el } = window.FORM;

  let billing = "monthly";

  // ---- Hero photo: hide only if it really fails, and bring it back if it loads.
  const heroPhoto = $(".hero-photo");
  if (heroPhoto) {
    heroPhoto.addEventListener("error", () => { heroPhoto.hidden = true; });
    heroPhoto.addEventListener("load", () => { heroPhoto.hidden = false; });
    if (heroPhoto.complete && heroPhoto.naturalWidth === 0) heroPhoto.hidden = true;
  }

  // ---- Class schedule (demo reservations saved in localStorage)
  const BOOKINGS_KEY = "form-bookings";
  const schedule = {
    Mon: [["07:00", "Strength Lab", "Alex Morgan"], ["12:30", "Restore & Flow", "Jamie Lee"], ["18:00", "Engine Room", "Nadia Reyes"]],
    Tue: [["07:30", "Engine Room", "Nadia Reyes"], ["12:00", "Pilates Studio", "Sofia Bennett"], ["17:30", "Strength Lab", "Alex Morgan"]],
    Wed: [["07:00", "Strength Lab", "Alex Morgan"], ["12:30", "Restore & Flow", "Jamie Lee"], ["18:30", "Engine Room", "Nadia Reyes"]],
    Thu: [["08:00", "Restore & Flow", "Jamie Lee"], ["12:00", "Pilates Studio", "Sofia Bennett"], ["18:00", "Strength Lab", "Alex Morgan"]],
    Fri: [["07:00", "Engine Room", "Nadia Reyes"], ["17:00", "Restore & Flow", "Jamie Lee"]],
    Sat: [["09:00", "Strength Lab", "Alex Morgan"], ["10:30", "Restore & Flow", "Jamie Lee"], ["11:30", "Pilates Studio", "Sofia Bennett"]],
  };

  function loadBookings() {
    try {
      return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function renderSessions(day) {
    const bookings = loadBookings();
    $("#sessions").replaceChildren();
    schedule[day].forEach(([time, className, coach]) => {
      const key = `${day} ${time} ${className}`;
      const booked = bookings.includes(key);
      const button = el("button", { textContent: booked ? "Cancel" : "Reserve ↗" });
      button.setAttribute("aria-label", `${booked ? "Cancel" : "Reserve"} ${className} ${day} ${time}`);
      button.onclick = () => {
        const current = loadBookings();
        const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
        try {
          localStorage.setItem(BOOKINGS_KEY, JSON.stringify(next));
          renderSessions(day);
          showToast(next.includes(key) ? "Demo reservation saved on this device." : "Demo reservation removed.");
        } catch {
          showToast("This browser could not save the reservation.");
        }
      };
      $("#sessions").append(el("div", { className: "session" },
        el("span", { textContent: time }),
        el("strong", { textContent: className }),
        el("small", { textContent: `with ${coach}` }),
        button,
      ));
    });
  }

  const dayButtons = $$("[data-day]");
  dayButtons.forEach((button) => {
    button.onclick = () => {
      setActive(dayButtons, button);
      renderSessions(button.dataset.day);
    };
  });
  renderSessions("Mon");

  // ---- Membership billing toggle (annual = 15% off, billed upfront)
  const billingButtons = $$("[data-billing]");
  billingButtons.forEach((button) => {
    button.onclick = () => {
      billing = button.dataset.billing;
      setActive(billingButtons, button);
      $$("[data-price]").forEach((price) => {
        const monthly = Number(price.dataset.price);
        const yearly = Math.round(monthly * 12 * 0.85);
        const annual = billing === "annual";
        price.replaceChildren(
          document.createTextNode(`$${annual ? Math.round(yearly / 12) : monthly}`),
          el("span", { textContent: annual ? `/ mo · $${yearly} billed yearly` : "/ month" }),
        );
      });
    };
  });

  // ---- Join dialog (demo interest saved in localStorage)
  const joinDialog = $("#join-dialog");
  $$("[data-plan]").forEach((button) => {
    button.onclick = () => {
      $("#selected-plan").textContent = button.dataset.plan;
      $("#join-description").textContent =
        `${button.dataset.plan} · ${billing} billing. Preview your interest; no payment is collected.`;
      $("#join-status").textContent = "";
      joinDialog.showModal();
    };
  });
  $("#join-dialog .close").onclick = () => joinDialog.close();
  joinDialog.addEventListener("click", closeOnBackdrop);

  $("#join-form").onsubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    try {
      localStorage.setItem("form-interest", JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        plan: $("#selected-plan").textContent,
        billing,
      }));
      $("#join-status").textContent = "Demo interest saved on this device. No information has been sent to a business.";
    } catch {
      $("#join-status").textContent = "Your browser could not save this. Please allow local storage and try again.";
    }
  };

  $(".clear-data").onclick = () => {
    try {
      localStorage.removeItem("form-interest");
      localStorage.removeItem(BOOKINGS_KEY);
      localStorage.removeItem("form-bag");
      window.FORM.clearBag?.();
      $("#join-form").reset();
      $("#join-status").textContent = "All saved FORM demo data cleared.";
      renderSessions($(".filters .active").dataset.day);
    } catch {
      $("#join-status").textContent = "Your browser could not clear local data.";
    }
  };

  // ---- Program planner (rules-based starting schedule)
  const trainingDays = {
    2: ["Monday", "Thursday"],
    3: ["Monday", "Wednesday", "Friday"],
    4: ["Monday", "Tuesday", "Thursday", "Saturday"],
    5: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
  };

  $("#program-form").onsubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const days = Number(data.get("days"));
    const age = Number(data.get("age"));
    const level = data.get("level");
    const goal = data.get("goal");
    const minutes = Number(data.get("duration"));

    const gentle = level === "beginner" || age >= 65;
    const effort = gentle
      ? "Comfortable pace; stop with 3–4 repetitions in reserve."
      : "Moderate effort; stop with 2–3 repetitions in reserve.";

    const strength = {
      name: "Strength foundations",
      detail: `5 min warm-up · ${gentle ? "2" : "3"} sets of supported squat, incline push-up, band row, hip hinge and carry. Rest 60–90 sec between sets.`,
    };
    const aerobic = {
      name: "Aerobic base",
      detail: `5 min easy warm-up · ${Math.max(10, minutes - 15)} min walk, cycle or elliptical at a conversational pace · 5 min cool-down.`,
    };
    const mobility = {
      name: "Mobility & balance",
      detail: "Gentle ankle, hip and shoulder mobility, supported single-leg balance, and easy walking. Keep every movement comfortable.",
    };
    const plans = {
      endurance: [aerobic, strength, aerobic, mobility, aerobic],
      mobility: [mobility, strength, mobility, aerobic, strength],
      fitness: [strength, aerobic, mobility, strength, aerobic],
      strength: [strength, aerobic, strength, mobility, strength],
    };
    const sessions = plans[goal] || plans.strength;

    const result = $("#program-result");
    const heading = el("h3", { textContent: `${days} days. A rhythm for you.`, tabIndex: -1 });
    result.replaceChildren(
      el("div", { className: "eyebrow", textContent: "YOUR STARTING SCHEDULE" }),
      heading,
      el("p", {
        className: "caption",
        textContent: `${minutes} minutes per session. ${effort} This is a general suggestion for an adult, not a medical or rehabilitation program. Review it with a qualified coach, especially if you have symptoms, injuries or health conditions.`,
      }),
    );
    trainingDays[days].forEach((day, i) => {
      result.append(el("div", { className: "result-day" },
        el("strong", { textContent: `${day} / ${sessions[i].name}` }),
        el("p", { textContent: sessions[i].detail }),
      ));
    });

    const adjust = el("button", { className: "button", textContent: "Adjust my profile ↗" });
    adjust.onclick = () => {
      result.hidden = true;
      form.hidden = false;
      form.querySelector("input").focus();
    };
    const download = el("button", { className: "text-link", textContent: "Download my schedule ↓" });
    download.style.marginTop = "15px";
    download.onclick = () => {
      const text = result.innerText
        .replace("Adjust my profile ↗", "")
        .replace("Download my schedule ↓", "");
      downloadText("my-form-schedule.txt", text);
    };
    result.append(
      el("p", {
        className: "caption",
        textContent: "Other days: rest or an easy walk. Start with short sessions, leave recovery between strength days, and increase gradually only when comfortable.",
      }),
      adjust,
      download,
    );

    form.hidden = true;
    result.hidden = false;
    heading.focus();
  };

  // ---- BMI calculator (metric / imperial)
  const KG_PER_LB = 0.45359237;
  const CM_PER_IN = 2.54;
  let unit = "metric";
  const heightInput = $("#bmi-height");
  const weightInput = $("#bmi-weight");
  const unitButtons = $$("[data-unit]");

  unitButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const next = button.dataset.unit;
      if (next === unit) return;
      const toImperial = next === "imperial";

      // Convert any values already entered so they still mean the same thing.
      const height = Number(heightInput.value);
      const weight = Number(weightInput.value);
      if (height > 0) heightInput.value = (toImperial ? height / CM_PER_IN : height * CM_PER_IN).toFixed(1);
      if (weight > 0) weightInput.value = (toImperial ? weight / KG_PER_LB : weight * KG_PER_LB).toFixed(1);
      unit = next;

      $("#bmi-height-label").textContent = toImperial ? "Height (inches)" : "Height (cm)";
      $("#bmi-weight-label").textContent = toImperial ? "Weight (lb)" : "Weight (kg)";
      Object.assign(heightInput, toImperial
        ? { min: "39.4", max: "94.5", placeholder: "69" }
        : { min: "100", max: "240", placeholder: "175" });
      Object.assign(weightInput, toImperial
        ? { min: "66.1", max: "661.4", placeholder: "165" }
        : { min: "30", max: "300", placeholder: "75" });
      setActive(unitButtons, button);
      $("#bmi-result").hidden = true;
    });
  });

  $("#bmi-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const metres = Number(heightInput.value) * (unit === "metric" ? 0.01 : CM_PER_IN / 100);
    const kg = Number(weightInput.value) * (unit === "metric" ? 1 : KG_PER_LB);
    const bmi = kg / (metres * metres);
    if (!Number.isFinite(bmi) || bmi <= 0) return;

    const category =
      bmi < 18.5 ? "Underweight" :
      bmi < 25 ? "Healthy weight" :
      bmi < 30 ? "Overweight" : "Obesity";

    const value = el("strong", { textContent: bmi.toFixed(1), tabIndex: -1 });
    const result = $("#bmi-result");
    result.replaceChildren(
      el("p", { textContent: "Your BMI" }),
      value,
      el("p", { className: "bmi-category", textContent: `${category} · adult screening category` }),
      el("p", {
        className: "caption",
        textContent: "A screening result, not a diagnosis or a training prescription. It does not measure body composition or overall health. Categories use the unrounded value.",
      }),
    );
    result.hidden = false;
    value.focus();
  });
})();
