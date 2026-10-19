/* Deterministic training suggestions. Shared by the browser and Node tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.FORMTraining = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const equipment = { bodyweight: "Bodyweight", dumbbells: "Dumbbells", bands: "Resistance bands", gym: "Full gym" };
  const goals = { fitness: "Everyday fitness", strength: "Build strength", muscle: "Build muscle" };
  const levels = { beginner: "Getting started", intermediate: "Training regularly", experienced: "Experienced" };
  const rows = [
    ["chair-squat","Chair squat","squat","bodyweight",0,"Use a sturdy chair against a wall. Sit back under control, keep feet planted, then stand tall. Make the range smaller if needed."],
    ["squat","Bodyweight squat","squat","bodyweight",1,"Plant your whole foot. Sit down between your hips, keep knees tracking with toes, then stand. Choose a comfortable depth."],
    ["goblet","Goblet squat","squat","dumbbells",1,"Hold one dumbbell close to your chest. Keep the whole foot down as you lower, then push the floor away."],
    ["leg-press","Leg press","squat","gym",0,"Ask staff to set up the machine. Keep your back supported and heels down; stop before your lower back rounds. Do not lock the knees."],
    ["barbell-squat","Barbell back squat","squat","gym",2,"Use a rack with safety bars and learn the setup with a coach. Brace before each rep and keep the bar balanced over the mid-foot."],
    ["band-squat","Band squat","squat","bands",1,"Stand on a long band with both feet and hold the ends at shoulder height. Check the band first; keep tension controlled."],
    ["bridge","Glute bridge","hinge","bodyweight",0,"Lie on your back with feet planted. Tighten your abdomen, lift your hips by squeezing your glutes, then lower slowly without arching your back."],
    ["single-bridge","Single-leg glute bridge","hinge","bodyweight",2,"Set up like a bridge, lift one foot and keep your hips level as you raise and lower. Complete equal reps on each side."],
    ["db-rdl","Dumbbell Romanian deadlift","hinge","dumbbells",1,"Soften your knees and send your hips back. Keep the weights close to your legs and your back steady; stand by driving through your feet."],
    ["bar-rdl","Barbell Romanian deadlift","hinge","gym",2,"Start light and use a controlled hip hinge. Keep the bar close to your legs and stop the descent before your back position changes."],
    ["band-hinge","Band Romanian deadlift","hinge","bands",1,"Stand on the centre of a sound band, hold both ends, and hinge at the hips. Stand smoothly without jerking the band."],
    ["wall-push","Wall push-up","push","bodyweight",0,"Place hands on a stable wall at chest height. Keep your body in one line, bend your elbows to approach the wall, then press away."],
    ["incline-push","Incline push-up","push","bodyweight",1,"Use a sturdy, fixed counter or bench. Keep your trunk steady and lower your chest towards the surface. A higher surface makes this easier."],
    ["push-up","Push-up","push","bodyweight",2,"Keep hands just wider than shoulders and brace your trunk. Lower under control, then press up without letting your hips sag."],
    ["db-floor","Dumbbell floor press","push","dumbbells",0,"Lie on the floor with knees bent. Hold the dumbbells above your chest; lower until your upper arms gently touch the floor, then press."],
    ["chest-press","Machine chest press","push","gym",0,"Adjust the seat so handles are near chest height. Keep your back supported and wrists straight. Press smoothly, then return slowly."],
    ["bench-press","Barbell bench press","push","gym",2,"Use correctly set safety bars or a spotter. Keep your feet planted and control the bar to your chest before pressing. Learn the setup with a coach."],
    ["band-press","Band chest press","push","bands",1,"Pass the band around your upper back below shoulder level, holding an end in each hand. Press forwards under control; keep the band away from your neck."],
    ["prone-w","Prone W raise","pull","bodyweight",0,"Lie face down, arms in a W shape. Gently lift your hands and elbows a little, drawing shoulder blades together. This is light upper-back work, not a replacement for heavy rows."],
    ["db-row","Supported dumbbell row","pull","dumbbells",0,"Support one hand on a stable bench. Keep your trunk still and pull the dumbbell towards your hip. Lower slowly; match reps on both sides."],
    ["seated-row","Seated cable row","pull","gym",0,"Keep your torso steady. Pull the handles towards your lower ribs with elbows close to your sides; return without rounding or rocking."],
    ["pulldown","Lat pulldown","pull","gym",1,"Set the thigh pad snugly. Pull the bar towards the top of your chest with a controlled motion; avoid pulling behind your neck."],
    ["band-row","Seated band row","pull","bands",1,"Sit tall and loop a sound band around the middle of your feet while wearing shoes. Pull your elbows back without leaning; keep the band secure."],
    ["calf","Standing calf raise","legs","bodyweight",0,"Use a stable wall for balance. Rise onto the balls of your feet, pause, then lower slowly. Keep the movement controlled."],
    ["reverse-lunge","Reverse lunge","legs","bodyweight",1,"Step one foot back and lower both knees as far as feels controlled. Press through the front foot to return. Alternate sides."],
    ["db-lunge","Dumbbell reverse lunge","legs","dumbbells",1,"Hold weights by your sides and step back into a controlled lunge. Keep the front foot planted and match reps on both sides."],
    ["band-side","Band side steps","legs","bands",0,"Place a loop band above the knees. Keep a slight bend at the hips and knees and take small sideways steps without letting knees collapse inward."],
    ["leg-curl","Seated leg curl","legs","gym",0,"Ask staff to adjust the machine. Keep your hips in the seat as you bend your knees, then return slowly."],
    ["dead-bug","Dead bug","core","bodyweight",0,"Lie on your back with hips and knees bent. Brace gently and extend opposite arm and leg without arching your lower back. Alternate sides."],
    ["bird-dog","Bird dog","core","bodyweight",0,"Start on hands and knees. Reach one arm and the opposite leg away while keeping hips level; return slowly and switch sides."],
    ["db-press","Dumbbell shoulder press","shoulders","dumbbells",1,"Sit on a supportive bench. Press the dumbbells up without leaning back; lower to a comfortable shoulder position."],
    ["shoulder-press","Machine shoulder press","shoulders","gym",1,"Set the seat so handles begin near shoulder height. Keep your back against the pad, press smoothly and use a comfortable range."],
    ["band-press-up","Band overhead press","shoulders","bands",1,"Stand on the band and hold its ends at shoulder height. Press upwards with a steady trunk, then lower slowly."],
    ["wall-slide","Wall slide","shoulders","bodyweight",0,"Stand with your back near a wall. Slowly slide your arms upwards in a comfortable range, keeping ribs relaxed. This is a light control exercise."],
  ];
  const exercises = rows.map(([id,name,pattern,gear,difficulty,cue]) => ({id,name,pattern,gear,difficulty,cue}));
  const byId = id => exercises.find(e => e.id === id);
  const dateKey = date => [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");
  const shiftDate = (date,days) => { const d = new Date(date+"T12:00:00"); d.setDate(d.getDate()+days); return dateKey(d); };
  const validDate = date => typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= "1900-01-01" && date <= "9998-12-01" && dateKey(new Date(date+"T12:00:00")) === date;
  function validProfile(p) {
    return !!p && Object.hasOwn(levels,p.level) && Object.hasOwn(goals,p.goal) && Object.hasOwn(equipment,p.equipment) && [25,40,55].includes(p.duration) && ["kg","lb"].includes(p.unit) && ["mixed","vegetarian","plant"].includes(p.food) && /^([01]\d|2[0-3]):[0-5]\d$/.test(p.time) && Array.isArray(p.days) && p.days.length >= 2 && p.days.length <= 4 && new Set(p.days).size === p.days.length && p.days.every(d=>Number.isInteger(d)&&d>=0&&d<=6);
  }
  function available(profile,pattern=null) {
    const allowed = new Set(["bodyweight",profile.equipment]);
    if (profile.equipment === "gym") ["dumbbells","bands","gym"].forEach(g=>allowed.add(g));
    return exercises.filter(e => allowed.has(e.gear) && (!pattern || e.pattern === pattern));
  }
  function choose(profile,pattern,variant=0) {
    const maxDifficulty = {beginner:0,intermediate:1,experienced:2}[profile.level];
    const options = available(profile,pattern).filter(e=>e.difficulty<=maxDifficulty);
    const preferred = options.filter(e=>e.gear===profile.equipment || profile.equipment==="gym"&&e.gear==="dumbbells");
    const pool = preferred.length ? preferred : options;
    return pool[variant % pool.length];
  }
  function targets(profile,e) {
    const light = ["core","shoulders"].includes(e.pattern) || e.id === "prone-w";
    const strength = profile.goal === "strength" && profile.level !== "beginner" && e.gear !== "bodyweight" && !light;
    return { min: strength ? 6 : 8, max: strength ? 8 : profile.goal === "fitness" ? 15 : 12, sets: profile.level === "beginner" || profile.duration===25 ? 2 : 3, rest: strength ? 120 : 75 };
  }
  function historyFor(exercise,sessions,beforeDate,unit,excludeId) {
    const name = exercise.name.trim().toLowerCase();
    for (const s of [...sessions].filter(s=>s.id!==excludeId&&s.date<beforeDate).sort((a,b)=>b.date.localeCompare(a.date))) {
      const match = s.exercises.find(e=>e.name.trim().toLowerCase()===name);
      if (!match) continue;
      const logged = match.sets.filter(t=>t.done&&typeof t.reps==="number"&&t.reps>0&&typeof t.weight==="number");
      if (!logged.length) continue;
      const factor = s.unit===unit ? 1 : unit==="lb" ? 2.2046226218 : 1/2.2046226218;
      return { date:s.date, sets:logged.map(t=>({...t,weight:Math.round(t.weight*factor*100)/100})) };
    }
    return null;
  }
  function recommendation(exercise,sessions,date,unit,sessionId) {
    const entry = byId(exercise.catalogId) || exercises.find(e=>e.name.toLowerCase()===exercise.name.trim().toLowerCase());
    const target = exercise.target && [exercise.target.min,exercise.target.max,exercise.target.rest].every(Number.isFinite) ? exercise.target : null;
    const last = historyFor(exercise,sessions,date,unit,sessionId);
    const body = entry?.gear==="bodyweight";
    let message = body ? "Bodyweight: log 0 for added weight. Work through a comfortable range with steady control." : "Choose a light starting load you can control. Finish each set feeling you could do 2–3 more good reps.";
    if (last) {
      const top = Math.max(...last.sets.map(t=>t.weight));
      message = "Last logged: "+last.date+" · "+last.sets.map(t=>t.reps+" × "+t.weight+" "+unit).join(", ")+". ";
      if (target && last.sets.length >= (target.sets||2) && last.sets.every(t=>t.reps>=target.max)) {
        message += body ? "You reached the top of the range. If every rep felt controlled, try a slightly harder variation." : "You reached the top of the rep range. If form felt solid, consider the smallest available weight increase; otherwise repeat this load.";
      } else message += body ? "Repeat this variation and work towards the top of your rep range." : "Try the same load again ("+top+" "+unit+" at most), adding a rep only if control stays solid.";
    }
    return {entry,target,last,message};
  }
  function makeExercise(entry,profile,id) {
    const target=targets(profile,entry);
    return { id:id(),catalogId:entry.id,name:entry.name,target,sets:Array.from({length:target.sets},()=>({id:id(),reps:target.min,weight:entry.gear==="bodyweight"?0:"",done:false})) };
  }
  function buildPlan(profile,start,sessions,id) {
    if (!validProfile(profile)||!validDate(start)) throw new Error("Choose a valid profile and start date.");
    const days=[...profile.days].sort((a,b)=>a-b);
    if(profile.level==="beginner"&&days.length>3) throw new Error("Start with 2 or 3 strength days. Add frequency as your routine settles.");
    if(days.length<4&&days.some(d=>days.includes((d+1)%7))) throw new Error("Leave a day between full-body sessions. Try Monday / Wednesday / Friday, or Tuesday / Saturday.");
    // Four days alternate upper/lower, including across week boundaries.
    const split=days.length===4;
    const result=[],skipped=[];
    let ordinal=0;
    for(let offset=0;offset<28;offset++){
      const date=shiftDate(start,offset),weekday=(new Date(date+"T12:00:00").getDay()+6)%7;
      if(!days.includes(weekday))continue;
      const mode=split?(ordinal%2===0?"Upper body":"Lower body"):"Full body";
      const variant=ordinal%2;ordinal++;
      if(sessions.some(s=>s.date===date)){skipped.push(date);continue;}
      const patterns=split?(mode==="Upper body"?["push","pull","shoulders","core"]:["squat","hinge","legs","core"]):["squat","push","pull","hinge","core"];
      const count=profile.duration===25?3:profile.duration===40?4:5;
      // Keep a hinge in short full-body B sessions to balance squat-focused A sessions.
      if(!split&&profile.duration===25&&variant===1)patterns[0]="hinge";
      const chosen=patterns.slice(0,count).map(pattern=>choose(profile,pattern,variant));
      const list=chosen.map(e=>makeExercise(e,profile,id));
      const session={id:id(),title:mode+" · "+(variant===0?"A":"B"),date,unit:profile.unit,completed:false,notes:"Guided plan · "+levels[profile.level]+" · "+goals[profile.goal]+". Start with 5 minutes of easy movement and light practice reps. Rest between sets; leave 2–3 good reps in reserve. Aim for about "+profile.duration+" minutes, taking longer if needed.",exercises:list};
      result.push(session);
    }
    return {sessions:result,skipped,description:days.length+" days/week · "+(split?"upper / lower":"full body")+" · "+equipment[profile.equipment]+" · around "+profile.duration+" min",bodyweightPull:profile.equipment==="bodyweight"};
  }
  return {exercises,byId,equipment,goals,levels,validProfile,available,choose,targets,historyFor,recommendation,makeExercise,buildPlan,dateKey,shiftDate};
});
