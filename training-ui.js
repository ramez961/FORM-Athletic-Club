/* Guided training UI. Built on the same log and backups as manual sessions. */
(() => {
  "use strict";
  const { $,el,showToast }=window.FORM;
  const model=window.FORMTraining, log=window.FORMLog;
  const id=()=>crypto.randomUUID();
  const defaults={level:"beginner",goal:"fitness",equipment:"bodyweight",duration:40,unit:"kg",days:[0,2,4],time:"18:00",food:"mixed",increment:2.5,preferred:[],excluded:[]};
  const profile=()=>log.snapshot().profile||{...defaults};
  const name=()=>{const u=log.users();return u.users.find(p=>p.id===u.activeUser)?.name||"My training";};
  let preview=null,swapId=null,view="calendar",guidedSession=null,review=null;
  let timerEnd=0,timerRemaining=0,timerPaused=false;
  function btn(text,action,cls="quiet"){
    const b=el("button",{type:"button",textContent:text,className:cls});b.addEventListener("click",action);return b;
  }
  function setView(next){
    view=next;
    ["calendar","library","food"].forEach(v=>{
      $("#"+v+"-view").hidden=v!==next;
      document.querySelector('[data-view="'+v+'"]').setAttribute("aria-pressed",String(v===next));
    });
    if(next==="library")renderLibrary();
    if(next==="food")renderFood();
  }
  document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{swapId=null;setView(b.dataset.view);}));
  function openSetup(){
    const p=profile(),form=$("#training-setup");
    ["level","goal","equipment","duration","unit","time","food"].forEach(key=>form.elements[key].value=p[key]);
    form.elements.increment.value=p.increment||(p.unit==="lb"?5:2.5);
    form.elements.start.value=log.selectedDate();form.elements.start.min="1900-01-01";form.elements.start.max="9998-12-01";
    form.querySelectorAll('[name="days"]').forEach(input=>input.checked=p.days.includes(Number(input.value)));
    $("#plan-preview").hidden=true;$("#setup-error").textContent="";preview=null;
    $("#setup-dialog").showModal();
  }
  $("#open-setup").addEventListener("click",openSetup);
  $("#edit-setup").addEventListener("click",openSetup);
  $("#training-setup").addEventListener("input",()=>{
    // A preview always describes the exact preferences that generated it.
    preview=null;$("#plan-preview").hidden=true;
  });
  $("#training-setup").addEventListener("submit",event=>{
    event.preventDefault();const form=event.currentTarget;
    const p={...profile(),level:form.elements.level.value,goal:form.elements.goal.value,equipment:form.elements.equipment.value,duration:Number(form.elements.duration.value),unit:form.elements.unit.value,days:[...form.querySelectorAll('[name="days"]:checked')].map(i=>Number(i.value)),time:form.elements.time.value,food:form.elements.food.value,increment:Number(form.elements.increment.value)};
    try {
      if(!model.validProfile(p))throw new Error("Choose 2–4 training days and complete each field.");
      const generated=model.buildPlan(p,form.elements.start.value,log.snapshot().sessions,id);
      log.setProfile(p);preview={...generated,profile:p};renderSummary();
      $("#setup-error").textContent="";$("#plan-preview").hidden=false;
      $("#plan-description").textContent=generated.description;
      $("#plan-note").textContent=generated.sessions.length+" sessions ready. "+generated.skipped.length+" dates skipped because you already have a session. "+generated.warnings.join(" ");
      const weeks=$("#preview-weeks");weeks.replaceChildren();
      generated.sessions.forEach(s=>weeks.append(el("div",{className:"preview-session"},el("time",{textContent:new Date(s.date+"T12:00:00").toLocaleDateString("en",{weekday:"short",month:"short",day:"numeric"}),dateTime:s.date}),el("div",{},el("strong",{textContent:s.title+" · estimated "+s.plan.estimatedMinutes+" min"}),el("span",{textContent:s.exercises.map(e=>e.name+" ("+e.sets.length+" sets)").join(" · ")})))));
      renderVolume($("#preview-volume"),generated.reports);
      $("#apply-plan").disabled=!generated.sessions.length;$("#apply-plan").textContent=generated.sessions.length?"Add "+generated.sessions.length+" sessions to my calendar ↗":"These dates already have sessions";
      $("#plan-preview").scrollIntoView({block:"start",behavior:"smooth"});
    } catch(error){$("#setup-error").textContent=error.message;$("#plan-preview").hidden=true;}
  });
  $("#apply-plan").addEventListener("click",()=>{
    if(!preview)return;
    const existing=log.snapshot().sessions;
    const sessions=preview.sessions.filter(s=>!existing.some(e=>e.date===s.date));
    if(!sessions.length){showToast("Those dates already have sessions. Choose another start date.");return;}
    if(log.addSessions(sessions)){
      $("#setup-dialog").close();preview=null;setView("calendar");renderSummary();
      showToast(sessions.length+" sessions added. You can move, swap or edit any of them.");
      $("#calendar-view").scrollIntoView({block:"start",behavior:"smooth"});
    }
  });
  function renderSummary(){
    const data=log.snapshot(),p=data.profile;
    $("#companion-title").textContent=p?name()+" · your next chapter":name()+" · let’s get started.";
    $("#profile-summary").textContent=p?model.levels[p.level]+" · "+model.goals[p.goal]+" · "+model.equipment[p.equipment]+" · "+p.days.length+" days/week":"Tell us your level, goals and equipment to get a starting plan you can make your own.";
    $("#edit-setup").textContent=p?"Adjust my plan":"Set up my training";
    $("#review-plan").disabled=!p;
    const today=model.dateKey(new Date()),monday=model.shiftDate(today,-((new Date(today+"T12:00:00").getDay()+6)%7)),sunday=model.shiftDate(monday,6);
    const week=data.sessions.filter(s=>s.date>=monday&&s.date<=sunday);
    const next=data.sessions.filter(s=>!s.completed&&s.date>=today).sort((a,b)=>a.date.localeCompare(b.date))[0];
    const stats=$("#progress-summary");stats.replaceChildren(el("span",{className:"eyebrow",textContent:"THIS WEEK"}),el("strong",{textContent:week.filter(s=>s.completed).length+" / "+week.length}),el("p",{textContent:"sessions marked complete"}));
    if(next)stats.append(btn("Next: "+next.title+" · "+next.date,()=>{log.selectSession(next.id);setView("calendar");$("#session-panel").scrollIntoView({block:"start",behavior:"smooth"});},"next-session"));
    else stats.append(el("p",{textContent:p?"Your next session is yours to plan.":"A good routine starts with a realistic week."}));
    const selected=log.selectedDate(),start=model.shiftDate(selected,-((new Date(selected+"T12:00:00").getDay()+6)%7));
    renderVolume($("#calendar-volume"),model.weeklyReport(data.sessions,start,p||defaults).slice(0,1));
  }
  function renderVolume(container,reports){
    container.replaceChildren();
    if(!reports.length)return;
    const table=el("table",{className:"volume-table"}),head=el("tr",{},el("th",{textContent:"Muscle group",scope:"col"}),el("th",{textContent:"Starting range",scope:"col"}));
    reports.forEach(r=>head.append(el("th",{textContent:reports.length===1?r.from+" – "+r.to:"Week "+r.week,scope:"col"})));
    table.append(el("caption",{textContent:"Weekly working-set equivalents · planning estimates"}),el("thead",{},head));
    const body=el("tbody");
    model.muscleGroups.forEach(group=>{
      const row=el("tr",{},el("th",{textContent:model.muscleNames[group],scope:"row"}),el("td",{textContent:reports[0].target[group].join("–")}));
      reports.forEach(r=>{
        const value=r.planned[group],range=r.target[group];
        row.append(el("td",{className:value<range[0]?"volume-low":value>range[1]?"volume-high":"",textContent:value+" planned / "+r.completed[group]+" done"+(value<range[0]?" · below range":value>range[1]?" · above range":"")}));
      });
      body.append(row);
    });
    table.append(body);container.append(el("div",{className:"volume-scroll"},table),el("p",{className:"caption",textContent:"Primary working sets count as 1; secondary involvement counts as 0.5. Light activation is excluded. These approximate ranges guide planning, not a guarantee of results. Trained muscle-growth plans aim around 10 sets per major group when time and recovery allow."}));
    if(reports.some(r=>r.unknown))container.append(el("p",{className:"caption",textContent:"Some custom exercise names are not recognized, so their muscle contribution is not counted."}));
  }
  $("#review-plan").addEventListener("click",()=>{
    const data=log.snapshot(),today=model.dateKey(new Date());
    review=model.reviewPlan(profile(),data.sessions,today,id);
    const container=$("#review-results");container.replaceChildren(el("p",{textContent:review.updates.length+" upcoming sessions have changes supported by your logs. "+review.skipped.length+" logged or customized guided sessions were kept. Manual workouts are kept too."}));
    if(!review.updates.length)container.append(el("p",{textContent:"No changes are supported yet. Log completed working sets and reps left, or record recovery feedback after training. The app will not assume that you got stronger just because another week passed."}));
    review.updates.forEach(update=>container.append(el("article",{className:"review-change"},el("h3",{textContent:update.after.title+" · "+update.after.date}),...update.reasons.map(reason=>el("p",{textContent:reason})))));
    $("#apply-review").disabled=!review.updates.length;$("#review-dialog").showModal();
  });
  $("#apply-review").addEventListener("click",()=>{if(review&&log.applyPlanReview(review.updates)){$("#review-dialog").close();review=null;}});
  $("#open-profiles").addEventListener("click",()=>{
    const state=log.users(),picker=$("#profile-picker");picker.replaceChildren();
    state.users.forEach(u=>picker.append(el("option",{value:u.id,textContent:u.name,selected:u.id===state.activeUser})));
    $("#profiles-dialog").showModal();
  });
  $("#switch-profile").addEventListener("click",()=>log.selectUser($("#profile-picker").value));
  $("#new-profile-form").addEventListener("submit",e=>{e.preventDefault();log.createUser(e.currentTarget.elements.name.value);});
  document.querySelectorAll("[data-guide-close]").forEach(b=>b.addEventListener("click",()=>b.closest("dialog").close()));
  // These dialogs were present when the shared log installed backdrop handlers.
  function startTimer(seconds,sessionId){
    seconds=Math.max(15,Math.min(300,Number(seconds)||75));
    timerRemaining=seconds;timerEnd=Date.now()+seconds*1000;timerPaused=false;updateTimer();
  }
  function updateTimer(){
    if(timerEnd&&!timerPaused)timerRemaining=Math.max(0,Math.ceil((timerEnd-Date.now())/1000));
    const output=$("#rest-countdown");
    if(output)output.textContent=timerRemaining?String(Math.floor(timerRemaining/60)).padStart(2,"0")+":"+String(timerRemaining%60).padStart(2,"0"):"Ready";
    const pause=$("#pause-rest");
    if(pause)pause.textContent=timerPaused?"Resume":"Pause";
    if(timerEnd&&timerRemaining===0&&!timerPaused){
      timerEnd=0;showToast("Rest finished. Start your next set when you feel ready.");
    }
  }
  setInterval(updateTimer,1000);
  window.addEventListener("form:set-completed",event=>{
    if(event.detail.done&&guidedSession===log.currentId())startTimer(event.detail.rest,guidedSession);
  });
  function decorateDay(panel,s,data,date){
    if(!s){
      const recovery=el("div",{className:"recovery-card"},el("span",{className:"eyebrow",textContent:"ROOM TO RECOVER"}),el("h3",{textContent:"An open day can still support your plan."}),el("p",{textContent:"Take an easy walk, do a little comfortable mobility, or rest. If you missed a session, use Edit / move on that session to reschedule it."}),btn("Build a guided plan",openSetup));
      panel.append(recovery);return;
    }
    const box=el("div",{className:"session-coach"});
    const feeling=s.readiness||"ready";
    const select=el("select",{});["ready","low","pain"].forEach((v,i)=>select.append(el("option",{value:v,textContent:["Ready to train","Low energy / more recovery needed","Pain during movement"][i],selected:v===feeling})));
    select.addEventListener("change",()=>{log.setReadiness(s.id,select.value);});
    box.append(el("div",{className:"coach-top"},el("div",{},el("span",{className:"eyebrow",textContent:"YOUR SESSION COMPANION"}),el("h3",{textContent:feeling==="pain"?"Pause and reassess.":s.completed?"A session to build on.":"One controlled set at a time."})),el("label",{textContent:"How are you feeling?"},select)));
    const advice=feeling==="pain"?"Stop the movement that causes pain. Do not use load or rep suggestions to push through it; seek qualified advice if pain persists.":feeling==="low"?"Keep today easy. Use a comfortable load, take longer rests, or preview fewer sets. You can also move this session to another day.":"Warm up separately, then log working sets. Reps left estimates how many more controlled reps you could have completed; aim to finish most working sets with 2–3 left.";
    box.append(el("p",{textContent:advice}));
    if(feeling!=="pain")box.append(btn(guidedSession===s.id?"End guided mode":"Start guided mode",()=>{
      if(guidedSession===s.id){guidedSession=null;timerEnd=0;timerRemaining=0;}
      else{guidedSession=s.id;timerEnd=0;timerRemaining=0;}
      log.refresh();
    }));
    if(guidedSession===s.id&&feeling!=="pain"){
      const pause=btn(timerPaused?"Resume":"Pause",()=>{
        if(!timerRemaining)return;
        timerPaused=!timerPaused;
        if(!timerPaused)timerEnd=Date.now()+timerRemaining*1000;
        updateTimer();
      });pause.id="pause-rest";
      box.append(el("div",{className:"rest-timer"},el("div",{},el("span",{className:"eyebrow",textContent:"REST TIMER"}),el("output",{id:"rest-countdown",textContent:"Ready",ariaLabel:"Rest remaining"})),btn("60 sec",()=>startTimer(60,s.id)),btn("90 sec",()=>startTimer(90,s.id)),btn("120 sec",()=>startTimer(120,s.id)),pause));
      box.append(el("p",{className:"caption",textContent:"Mark a set done to start its rest timer. The timer is a guide; take longer if you need it."}));
    }
    box.append(btn("Browse exercises / add a movement",()=>{swapId=null;setView("library");$("#library-title").focus();}));
    panel.append(box);updateTimer();
  }
  function decorateExercise(card,exercise,s,data){
    const feeling=s.readiness||"ready";
    const rec=model.recommendation(exercise,data.sessions,s.date,s.unit,s.id,profile(),feeling);
    const guidance=el("div",{className:"exercise-guidance"});
    if(rec.target)guidance.append(el("strong",{textContent:rec.target.sets+(rec.entry?.light?" control set":" working set")+(rec.target.sets===1?"":"s")+" · "+rec.target.min+"–"+rec.target.max+" reps · rest "+rec.target.rest+" sec"+(rec.entry?.light?" · comfortable range":" · 2–3 reps left")}));
    guidance.append(el("p",{textContent:rec.message}));
    if(rec.adjustment&&!s.completed&&feeling!=="pain")guidance.append(el("div",{className:"suggestion-preview"},el("p",{textContent:"Optional change: "+rec.adjustment.reason}),btn("Apply to uncompleted sets",()=>log.applySuggestion(exercise.id,rec.adjustment))));
    if(rec.entry){
      const details=el("details",{className:"movement-cue"},el("summary",{textContent:"How to do it · "+model.equipment[rec.entry.gear]}),el("p",{textContent:rec.entry.cue}));
      if(["db-row","single-bridge","reverse-lunge","db-lunge","dead-bug","bird-dog"].includes(rec.entry.id))details.append(el("p",{textContent:"Reps are per side. Log added weight consistently: per dumbbell for dumbbell exercises; total bar weight for barbells."}));
      guidance.append(details);
    }
    guidance.append(btn("Swap exercise",()=>{swapId=exercise.id;$("#exercise-search").value="";$("#library-equipment").value="profile";$("#library-level").value="profile";$("#library-pattern").value=rec.entry?rec.entry.pattern:"all";setView("library");$("#library-title").focus();},"text-link"));
    card.append(guidance);
  }
  function renderLibrary(){
    const p=profile(),gear=$("#library-equipment").value,level=$("#library-level").value,pattern=$("#library-pattern").value,query=$("#exercise-search").value.trim().toLowerCase();
    let list=gear==="all"?model.exercises:model.available({...p,equipment:gear==="profile"?p.equipment:gear});
    const max=level==="all"?2:{beginner:0,intermediate:1,experienced:2}[level==="profile"?p.level:level];
    list=list.filter(e=>e.difficulty<=max&&(pattern==="all"||e.pattern===pattern)&&(e.name+" "+e.pattern+" "+e.gear).toLowerCase().includes(query));
    $("#library-count").textContent=list.length+" movements · "+(swapId?"choose a replacement":"choose one to add");
    $("#cancel-swap").hidden=!swapId;
    $("#library-context").textContent=swapId?"Choose a replacement. Only this exercise in the selected session will change. Logged sets need confirmation before replacement.":"Browse movements for your equipment and level. Add one to the selected session, or start a session for the selected day.";
    const container=$("#exercise-library");container.replaceChildren();
    if(!list.length)container.append(el("p",{textContent:"No movements match these filters. Try another movement, level or equipment option."}));
    list.forEach(e=>{
      const t=model.targets(p,e);
      const card=el("article",{className:"library-card"},el("div",{className:"eyebrow",textContent:model.equipment[e.gear]+" / "+["STARTER","REGULAR","EXPERIENCED"][e.difficulty]}),el("h3",{textContent:e.name}),el("p",{textContent:e.cue}),el("span",{className:"library-prescription",textContent:t.sets+" sets · "+t.min+"–"+t.max+" reps"}));
      const outside=model.available(p).every(a=>a.id!==e.id)||e.difficulty>{beginner:0,intermediate:1,experienced:2}[p.level];
      if(outside)card.append(el("p",{className:"caption",textContent:"Outside your saved equipment or level. Choose this only if it fits your setup and experience."}));
      const preferred=(p.preferred||[]).includes(e.id),excluded=(p.excluded||[]).includes(e.id);
      const preference=(kind)=>{
        const current=profile(),set=new Set(current[kind]||[]);
        set.has(e.id)?set.delete(e.id):set.add(e.id);
        const other=kind==="preferred"?"excluded":"preferred";
        log.setProfile({...current,[kind]:[...set],[other]:(current[other]||[]).filter(x=>x!==e.id)});
        renderLibrary();renderSummary();
      };
      card.append(el("div",{className:"exercise-preferences"},btn(preferred?"✓ Preferred":"Prefer for my plans",()=>preference("preferred"),"text-link"),btn(excluded?"✓ Excluded from plans":"Exclude from plans",()=>preference("excluded"),"text-link")));
      card.append(btn(swapId?"Use this replacement":"Add to my session",()=>{
        const exercise=model.makeExercise(e,p,id);
        if(log.currentId()){
          if(log.addExercise(exercise,swapId)){swapId=null;setView("calendar");}
        }else{
          const session={id:id(),title:"My workout",date:log.selectedDate(),unit:p.unit,completed:false,notes:"",exercises:[exercise]};
          if(log.addSessions([session])){swapId=null;setView("calendar");}
        }
      }));
      container.append(card);
    });
  }
  ["exercise-search","library-equipment","library-pattern","library-level"].forEach(key=>$("#"+key).addEventListener(key==="exercise-search"?"input":"change",renderLibrary));
  $("#cancel-swap").addEventListener("click",()=>{swapId=null;setView("calendar");});
  function clock(minute){
    const day=minute<0?" (previous day)":minute>=1440?" (next day)":"";
    minute=(minute%1440+1440)%1440;
    return String(Math.floor(minute/60)).padStart(2,"0")+":"+String(minute%60).padStart(2,"0")+day;
  }
  function renderFood(){
    const p=profile();$("#food-time").value=p.time;$("#food-preference").value=p.food;
    const [h,m]=p.time.split(":").map(Number),start=h*60+m;
    const main={mixed:"Rice or potatoes, chicken or fish, and vegetables.",vegetarian:"Rice or potatoes, eggs or beans, and vegetables.",plant:"Rice or potatoes, lentils or tofu, and vegetables."}[p.food];
    const after={mixed:"A chicken sandwich and fruit, or yogurt with oats and berries.",vegetarian:"An egg sandwich and fruit, or yogurt with oats and berries.",plant:"A tofu sandwich and fruit, or fortified soy yogurt with oats and berries."}[p.food];
    const items=[
      [clock(start-210),"A main meal, if it fits","Allow roughly 3–4 hours to digest a larger meal. "+main],
      [clock(start-90),"An optional smaller snack","If hungry, try a banana, toast or a small bowl of cereal about 1–3 hours before exercise. Choose familiar food that feels comfortable."],
      [clock(start),"Time to move","Have water available and sip as needed. Adjust to heat, sweat and session length."],
      [clock(start+p.duration+60),"After your session","A meal with carbohydrate and protein within about two hours can support recovery. "+after]
    ];
    const timeline=$("#meal-timeline");timeline.replaceChildren();
    items.forEach(([time,title,copy])=>timeline.append(el("article",{className:"meal-step"},el("time",{textContent:time}),el("div",{},el("h3",{textContent:title}),el("p",{textContent:copy})))));
  }
  ["food-time","food-preference"].forEach(key=>$("#"+key).addEventListener(key==="food-time"?"input":"change",()=>{
    const p=profile(),time=$("#food-time").value;if(!time)return;
    log.setProfile({...p,time,food:$("#food-preference").value});renderFood();renderSummary();
  }));
  window.FORMTrainingUI={decorateDay,decorateExercise};
  window.addEventListener("form:log-rendered",()=>{renderSummary();if(view==="library")renderLibrary();if(view==="food")renderFood();});
  log.refresh();renderSummary();renderFood();
})();
