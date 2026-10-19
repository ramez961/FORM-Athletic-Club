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
  const muscleGroups=["chest","back","quads","hamstrings","glutes","shoulders","biceps","triceps","calves","core"];
  const muscleNames={chest:"Chest",back:"Back",quads:"Quads",hamstrings:"Hamstrings",glutes:"Glutes",shoulders:"Shoulders",biceps:"Biceps",triceps:"Triceps",calves:"Calves",core:"Core"};
  const maxDifficulty={beginner:0,intermediate:1,experienced:2};
  const exercises=rows.map(([id,name,pattern,gear,difficulty,cue])=>{
    const light=["prone-w","wall-slide"].includes(id);
    let muscles={};
    if(pattern==="squat")muscles={quads:1,glutes:0.5};
    if(pattern==="hinge")muscles=["bridge","single-bridge"].includes(id)?{glutes:1,hamstrings:0.5}:{hamstrings:1,glutes:1};
    if(pattern==="push")muscles={chest:1,shoulders:0.5,triceps:0.5};
    if(pattern==="pull"&&!light)muscles={back:1,biceps:0.5};
    if(pattern==="shoulders"&&!light)muscles={shoulders:1,triceps:0.5};
    if(pattern==="core")muscles={core:1};
    if(["reverse-lunge","db-lunge"].includes(id))muscles={quads:1,glutes:0.5};
    if(id==="leg-curl")muscles={hamstrings:1};
    if(id==="calf")muscles={calves:1};
    if(id==="band-side")muscles={glutes:0.5};
    const progression={"chair-squat":"squat","wall-push":"incline-push","incline-push":"push-up","bridge":"single-bridge"}[id];
    return {id,name,pattern,gear,difficulty,cue,muscles,light,progression,vertical:["pulldown","db-press","shoulder-press","band-press-up"].includes(id)};
  });
  const byId=id=>exercises.find(e=>e.id===id);
  const entryFor=e=>byId(e.catalogId)||exercises.find(x=>x.name.toLowerCase()===e.name.trim().toLowerCase());
  const dateKey=date=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");
  const shiftDate=(date,days)=>{const d=new Date(date+"T12:00:00");d.setDate(d.getDate()+days);return dateKey(d);};
  const validDate=date=>typeof date==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&date>="1900-01-01"&&date<="9998-12-01"&&dateKey(new Date(date+"T12:00:00"))===date;
  const validIds=list=>list===undefined||Array.isArray(list)&&list.length<=exercises.length&&new Set(list).size===list.length&&list.every(id=>byId(id));
  function validProfile(p){
    return !!p&&Object.hasOwn(levels,p.level)&&Object.hasOwn(goals,p.goal)&&Object.hasOwn(equipment,p.equipment)&&[25,40,55].includes(p.duration)&&["kg","lb"].includes(p.unit)&&["mixed","vegetarian","plant"].includes(p.food)&&/^([01]\d|2[0-3]):[0-5]\d$/.test(p.time)&&Array.isArray(p.days)&&p.days.length>=2&&p.days.length<=4&&new Set(p.days).size===p.days.length&&p.days.every(d=>Number.isInteger(d)&&d>=0&&d<=6)&&validIds(p.preferred)&&validIds(p.excluded)&&(p.increment===undefined||Number.isFinite(p.increment)&&p.increment>=0.1&&p.increment<=50)&&!(p.preferred||[]).some(id=>(p.excluded||[]).includes(id));
  }
  function available(profile,pattern=null){
    const allowed=new Set(["bodyweight",profile.equipment]);
    if(profile.equipment==="gym")["dumbbells","bands","gym"].forEach(g=>allowed.add(g));
    return exercises.filter(e=>allowed.has(e.gear)&&(!pattern||e.pattern===pattern));
  }
  function historyList(exercise,sessions,beforeDate,unit,excludeId){
    const entry=entryFor(exercise),name=exercise.name.trim().toLowerCase(),result=[];
    for(const s of [...sessions].filter(s=>s.id!==excludeId&&s.date<beforeDate).sort((a,b)=>b.date.localeCompare(a.date))){
      const match=s.exercises.find(e=>entry&&e.catalogId===entry.id||e.name.trim().toLowerCase()===name);
      if(!match)continue;
      const sets=match.sets.filter(t=>t.done&&Number.isFinite(t.reps)&&t.reps>0&&Number.isFinite(t.weight));
      if(!sets.length)continue;
      const factor=s.unit===unit?1:unit==="lb"?2.2046226218:1/2.2046226218;
      result.push({date:s.date,sessionId:s.id,readiness:s.readiness||"ready",expectedSets:match.target?.sets||match.sets.length,full:match.sets.every(t=>t.done),sets:sets.map(t=>({...t,weight:Math.round(t.weight*factor*100)/100})),target:match.target});
    }
    return result;
  }
  const historyFor=(e,sessions,date,unit,exclude)=>historyList(e,sessions,date,unit,exclude)[0]||null;
  function recoveryState(sessions,beforeDate){
    const relevant=sessions.filter(s=>s.date<beforeDate&&s.date>=shiftDate(beforeDate,-14)&&(s.completed||s.exercises.some(e=>e.sets.some(t=>t.done)))).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
    return {reduce:relevant.filter(s=>s.readiness==="low"||s.readiness==="pain").length>=2,recent:relevant};
  }
  function choose(profile,pattern,variant=0,sessions=[],beforeDate="9998-01-01",used=[]){
    const options=available(profile,pattern).filter(e=>e.difficulty<=maxDifficulty[profile.level]&&!(profile.excluded||[]).includes(e.id)&&!used.includes(e.id)&&historyFor({name:e.name,catalogId:e.id},sessions,beforeDate,profile.unit)?.readiness!=="pain");
    const score=e=>{
      const logs=historyList({name:e.name,catalogId:e.id},sessions,beforeDate,profile.unit);
      let value=(e.light?-30:0)+(e.gear===profile.equipment?6:profile.equipment==="gym"&&e.gear==="dumbbells"?5:0);
      value+=(profile.preferred||[]).includes(e.id)?40:0;
      value+=e.difficulty===maxDifficulty[profile.level]?2:0;
      if(logs.length)value+=logs[0].readiness==="pain"?-30:logs[0].sets.some(t=>t.rir===0)?-4:8;
      if(pattern==="pull"&&variant%2===1&&e.vertical)value+=3;
      if(pattern==="legs"&&variant%2===0&&e.id==="calf")value+=10;
      if(profile.goal==="strength"&&profile.level==="experienced"&&e.id.startsWith("bar"))value+=3;
      return value;
    };
    return [...options].sort((a,b)=>score(b)-score(a)||a.id.localeCompare(b.id))[0]||null;
  }
  function targets(profile,e){
    const main=["squat","hinge","push","pull"].includes(e.pattern)&&!e.light;
    const strength=profile.goal==="strength"&&profile.level!=="beginner"&&e.gear!=="bodyweight"&&main;
    const sets=e.light?1:profile.level==="beginner"?2:profile.goal==="muscle"&&main?Math.min(4,Math.ceil(10/(profile.days.length===4?2:profile.days.length))):strength?3:2;
    return {min:e.light?10:strength?4:8,max:e.light?15:strength?6:profile.goal==="fitness"?15:12,sets,rest:e.light?45:strength?180:main?120:75,rirMin:2,rirMax:3};
  }
  function recommendation(exercise,sessions,date,unit,sessionId,profile={},readiness="ready"){
    const entry=entryFor(exercise);
    const target=exercise.target&&[exercise.target.min,exercise.target.max,exercise.target.rest,exercise.target.sets].every(Number.isFinite)?exercise.target:null;
    const history=historyList(exercise,sessions,date,unit,sessionId),last=history[0]||null;
    const body=entry?.gear==="bodyweight";
    let action="calibrate",message=body?"Choose a variation you can control with 2–3 reps left. Log 0 for added weight.":"Choose a controllable starting load with 2–3 good reps left. A rep range alone does not determine the right weight.";
    let adjustment=null;
    const recentRecovery=recoveryState(sessions,date).reduce;
    const prefix=last?"Last logged: "+last.date+" · "+last.sets.map(t=>t.reps+" × "+t.weight+" "+unit+(Number.isInteger(t.rir)?" ("+t.rir+" reps left)":"")).join(", ")+". ":"";
    const sameLoad=h=>h&&h.sets.every(t=>Math.abs(t.weight-h.sets[0].weight)<0.02);
    const effortKnown=h=>h&&h.sets.every(t=>Number.isInteger(t.rir)&&t.rir>=0&&t.rir<=5);
    const passed=h=>!!target&&h?.full&&h.sets.length>=target.sets&&h.sets.every(t=>t.reps>=target.max&&Number.isInteger(t.rir)&&t.rir>=2)&&h.readiness==="ready"&&sameLoad(h);
    const latestLoad=last&&sameLoad(last)?last.sets[0].weight:null;
    const factor=profile.unit&&profile.unit!==unit?(unit==="lb"?2.2046226218:1/2.2046226218):1;
    const step=Math.round((profile.increment|| (profile.unit==="lb"?5:2.5))*factor*100)/100;
    if(readiness==="pain"||last?.readiness==="pain"){
      action="pause";message="Pain was reported. Pause this movement; do not use a load increase to work through it. Get qualified advice if pain persists.";
    }else if(entry?.light){
      action="control";message="Use a comfortable range and steady control. This light activation exercise is not counted as a loaded working set or used to justify load progression.";
    }else if(readiness==="low"||recentRecovery){
      action="recover";message="Recovery is the priority. Consider one fewer working set, a comfortable load or moving the session. No increase is suggested.";
      const count=exercise.sets?.length||target?.sets||0;
      if(target&&count>1)adjustment={sets:Math.max(1,count-1),reason:"Lighter session: one fewer unlogged working set."};
    }else if(last&&target){
      const hard=effortKnown(last)&&last.sets.some(t=>t.rir<=1&&t.reps<target.min);
      const falling=history.length>=2&&sameLoad(last)&&sameLoad(history[1])&&Math.abs(last.sets[0].weight-history[1].sets[0].weight)<0.02&&last.sets.every(t=>t.reps<target.min)&&history[1].sets.every(t=>t.reps<target.min);
      if(hard||falling){
        action="reduce";message="The recent sets were too difficult for the planned range. Repeat an easier variation or use a smaller load before building again.";
        if(latestLoad!==null&&latestLoad>step&&step/latestLoad<=0.1)adjustment={weight:Math.round((latestLoad-step)*100)/100,reps:target.min,reason:"One available load step lower; restart at the bottom of the rep range."};
      }else if(passed(last)&&passed(history[1])&&Math.abs(last.sets[0].weight-history[1].sets[0].weight)<0.02){
        if(body){
          action="variation";message=entry?.progression?"Two consistent sessions reached the top of the range with effort in reserve. You can trial "+byId(entry.progression).name+"; swap only if the new movement stays comfortable.":"Two consistent sessions reached the top of the range. Keep the same controlled variation or choose a modestly harder one.";
        }else if(latestLoad>0&&step/latestLoad<=0.1){
          action="increase";const weight=Math.round((latestLoad+step)*100)/100;
          message="Two sessions reached the top of the range with at least 2 reps left. Consider "+weight+" "+unit+" (one available step), restarting at "+target.min+" reps. Reassess your form before accepting.";
          adjustment={weight,reps:target.min,reason:"Increase one step after two consistent exposures, then rebuild reps."};
        }else{action="hold";message="You earned a progression check, but the configured load step is over 10% of this load. Keep the load, or configure a smaller available step.";}
      }else if(!effortKnown(last)){
        action="record-effort";message="Repeat a comfortable load and record reps left after each working set. Without effort data, no load increase is suggested.";
      }else if(passed(last)){
        action="confirm";message="A good exposure. Repeat the load and confirm the same reps with at least 2 reps left in another session before increasing.";
      }else{
        action="build-reps";message="Keep the load comfortable and build reps within the range. An increase needs all planned sets, sufficient reps left and a second consistent session.";
      }
    }
    return {entry,target,last,history,action,adjustment,message:prefix+message};
  }
  function makeExercise(entry,profile,id,sets=null){
    const target={...targets(profile,entry),...(sets===null?{}:{sets})};
    return {id:id(),catalogId:entry.id,name:entry.name,target,sets:Array.from({length:target.sets},()=>({id:id(),reps:target.min,weight:entry.gear==="bodyweight"?0:"",rir:"",done:false}))};
  }
  function estimateMinutes(list){
    return Math.ceil((300+list.reduce((total,e)=>total+45+e.sets.length*35+Math.max(0,e.sets.length-1)*(e.target?.rest||90),0))/60);
  }
  function volumeTargets(profile){
    const base=profile.level==="beginner"?[4,8]:profile.goal==="muscle"?[8,12]:profile.goal==="strength"?[4,8]:[4,8];
    return Object.fromEntries(muscleGroups.map(g=>[g,["core","calves"].includes(g)?[2,6]:["biceps","triceps"].includes(g)?(profile.goal==="muscle"&&profile.level!=="beginner"?[4,10]:[2,8]):g==="shoulders"?[4,10]:base]));
  }
  function weeklyReport(sessions,start,profile){
    const target=volumeTargets(profile),reports=[];
    for(let week=0;week<4;week++){
      const from=shiftDate(start,week*7),to=shiftDate(from,6),planned=Object.fromEntries(muscleGroups.map(g=>[g,0])),completed={...planned};
      let unknown=0,light=0;
      for(const s of sessions.filter(s=>s.date>=from&&s.date<=to))for(const exercise of s.exercises){
        const e=entryFor(exercise);if(!e){unknown++;continue;}
        if(e.light){light++;continue;}
        for(const [g,credit]of Object.entries(e.muscles))if(g in planned){planned[g]+=exercise.sets.length*credit;completed[g]+=exercise.sets.filter(t=>t.done).length*credit;}
      }
      reports.push({week:week+1,from,to,planned,completed,target,unknown,light,gaps:muscleGroups.filter(g=>planned[g]<target[g][0])});
    }
    return reports;
  }
  function buildSession(profile,date,mode,variant,sessions,id,week,blockId){
    const required=mode==="Upper body"?["push","pull","shoulders"]:mode==="Lower body"?["squat","hinge"]:["squat","hinge","push","pull"];
    const chosen=[];
    for(const pattern of required){
      const e=choose(profile,pattern,variant,sessions,date,chosen.map(e=>e.id));
      if(!e)throw new Error("No "+pattern+" movement fits your equipment, level, exclusions or recent pain feedback. Review your preferences; get qualified guidance for painful movements.");
      chosen.push(e);
    }
    // Keep core and secondary movements when time permits; never drop a primary pattern.
    const extras=mode==="Upper body"?["pull","push","core"]:mode==="Lower body"?["legs","core","calves"]:["core","shoulders","legs"];
    let list=chosen.map(e=>makeExercise(e,profile,id));
    while(estimateMinutes(list)>profile.duration&&list.some(e=>e.sets.length>2)){
      const largest=[...list].filter(e=>e.sets.length>2).sort((a,b)=>b.target.rest-a.target.rest||b.sets.length-a.sets.length)[0];
      largest.sets.pop();largest.target.sets=largest.sets.length;
    }
    for(const pattern of extras){
      if(list.length>=(profile.duration===25?5:profile.level==="beginner"?6:7))break;
      const e=pattern==="calves"?available(profile,"legs").find(e=>e.id==="calf"&&!(profile.excluded||[]).includes(e.id)&&!list.some(x=>x.catalogId===e.id)&&historyFor({name:e.name,catalogId:e.id},sessions,date,profile.unit)?.readiness!=="pain"):choose(profile,pattern,variant,sessions,date,list.map(e=>e.catalogId));if(!e)continue;
      if(e.light)continue;
      const extra=makeExercise(e,profile,id,profile.level==="beginner"&&pattern==="core"?1:2);
      if(estimateMinutes([...list,extra])<=profile.duration)list.push(extra);
    }
    const recovery=recoveryState(sessions,date);
    if(recovery.reduce)list.forEach(e=>{if(e.sets.length>1){e.sets.pop();e.target.sets=e.sets.length;}});
    const estimatedMinutes=estimateMinutes(list);
    return {id:id(),title:mode+" · "+(variant===0?"A":"B"),date,unit:profile.unit,completed:false,readiness:"ready",plan:{version:2,week,blockId,estimatedMinutes,recovery:recovery.reduce},notes:"Guided plan · "+levels[profile.level]+" · "+goals[profile.goal]+". Warm up with easy movement and light practice reps. Log working sets below; record how many controlled reps were left. Estimates include rest; take longer when needed. "+(recovery.reduce?"Recent recovery feedback suggests a lighter starting dose. ":"")+"Week "+week+": "+(week===1?"calibrate controllable loads.":"review actual results before changing load; increases are never assumed."),exercises:list};
  }
  function buildPlan(profile,start,sessions,id){
    if(!validProfile(profile)||!validDate(start))throw new Error("Choose a valid profile and start date.");
    const days=[...profile.days].sort((a,b)=>a-b);
    if(profile.level==="beginner"&&days.length>3)throw new Error("Start with 2 or 3 strength days. Add frequency as your routine settles.");
    if(days.length<4&&days.some(d=>days.includes((d+1)%7)))throw new Error("Leave a day between full-body sessions. Try Monday / Wednesday / Friday, or Tuesday / Saturday.");
    const split=days.length===4,result=[],skipped=[],warnings=[],blockId=id();
    let ordinal=0;
    for(let offset=0;offset<28;offset++){
      const date=shiftDate(start,offset),weekday=(new Date(date+"T12:00:00").getDay()+6)%7;
      if(!days.includes(weekday))continue;
      const mode=split?(ordinal%2===0?"Upper body":"Lower body"):"Full body",variant=ordinal%2;ordinal++;
      if(sessions.some(s=>s.date===date)){skipped.push(date);continue;}
      result.push(buildSession(profile,date,mode,variant,sessions.filter(s=>s.date<start),id,Math.floor(offset/7)+1,blockId));
    }
    const reports=weeklyReport([...sessions,...result],start,profile);
    if(result.some(s=>s.plan.estimatedMinutes>profile.duration))warnings.push("Some sessions need longer than your time budget to retain primary movements and full rest. Choose more time or a different schedule; do not rush heavy sets.");
    if(reports.some(r=>r.gaps.some(g=>g!=="core")))warnings.push("Some muscle groups fall below the starting volume ranges. The table shows the shortfall; longer sessions, another appropriate day or different equipment may help.");
    if(profile.equipment==="bodyweight")warnings.push("Without pulling equipment, back work is light activation, not a loaded pulling substitute. It does not count as back working sets in the volume table.");
    if(result.some(s=>s.plan.recovery))warnings.push("Multiple recent low-recovery or painful sessions were logged. The preview uses fewer sets; reassess before training through symptoms.");
    return {sessions:result,skipped,reports,warnings,description:days.length+" days/week · "+(split?"upper / lower":"full body")+" · "+equipment[profile.equipment]+" · "+profile.duration+" min budget",bodyweightPull:profile.equipment==="bodyweight"};
  }
  function reviewPlan(profile,sessions,fromDate,id){
    const updates=[],skipped=[];
    const observed=sessions.filter(s=>s.date<=fromDate);
    for(const s of sessions.filter(s=>s.date>=fromDate&&!s.completed&&(s.plan?.version===2||s.notes.startsWith("Guided plan")))){
      if(s.customized||s.exercises.some(e=>!e.catalogId||!e.target||e.sets.some(t=>t.done||t.edited||t.weight>0||Number.isInteger(t.rir)))){skipped.push(s.id);continue;}
      const after=structuredClone(s),reasons=[];
      for(const e of after.exercises){
        const rec=recommendation(e,observed,s.date,s.unit,s.id,profile,s.readiness||"ready");
        if(rec.adjustment){
          if(rec.adjustment.sets&&rec.adjustment.sets<e.sets.length){e.sets=e.sets.slice(0,rec.adjustment.sets);e.target.sets=e.sets.length;}
          if(Number.isFinite(rec.adjustment.weight))e.sets.forEach(t=>{t.weight=rec.adjustment.weight;t.reps=rec.adjustment.reps||t.reps;});
          reasons.push(e.name+": "+rec.adjustment.reason+" "+(Number.isFinite(rec.adjustment.weight)?rec.adjustment.weight+" "+s.unit+" × "+rec.adjustment.reps+" reps in each uncompleted set.":rec.adjustment.sets+" working sets."));
        }
      }
      if(reasons.length){after.plan={...(after.plan||{}),version:2,reviewed:fromDate};updates.push({id:s.id,before:structuredClone(s),after,reasons});}
    }
    return {updates,skipped};
  }
  return {exercises,byId,entryFor,equipment,goals,levels,muscleGroups,muscleNames,validProfile,available,choose,targets,historyFor,historyList,recoveryState,recommendation,makeExercise,buildPlan,reviewPlan,estimateMinutes,weeklyReport,volumeTargets,dateKey,shiftDate};
});
