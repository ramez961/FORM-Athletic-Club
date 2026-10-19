const assert=require("node:assert/strict");
const {randomUUID:uid}=require("node:crypto");
const m=require("../training-model.js");
const base={level:"beginner",goal:"fitness",equipment:"bodyweight",duration:40,unit:"kg",days:[0,2,4],time:"18:00",food:"mixed",increment:1};
let combinations=0;
for(const level of Object.keys(m.levels))for(const goal of Object.keys(m.goals))for(const equipment of Object.keys(m.equipment))for(const duration of [25,40,55]){
 const p={...base,level,goal,equipment,duration},plan=m.buildPlan(p,"2026-10-19",[],uid),ids=new Set();
 assert.equal(plan.sessions.length,12);assert.equal(plan.reports.length,4);
 for(const s of plan.sessions){
  assert(s.date>="2026-10-19"&&s.date<="2026-11-15");
  assert(p.days.includes((new Date(s.date+"T12:00:00").getDay()+6)%7));
  for(const pattern of ["squat","hinge","push","pull"])assert(s.exercises.some(e=>m.byId(e.catalogId).pattern===pattern));
  assert.equal(new Set(s.exercises.map(e=>e.catalogId)).size,s.exercises.length);
  assert.equal(s.plan.estimatedMinutes,m.estimateMinutes(s.exercises));
  if(s.plan.estimatedMinutes>duration)assert(plan.warnings.some(x=>x.includes("time budget")));
  for(const e of s.exercises){
   const entry=m.byId(e.catalogId);
   assert(m.available(p).some(x=>x.id===entry.id));assert(entry.difficulty<={beginner:0,intermediate:1,experienced:2}[level]);
   assert(e.sets.length>=1&&e.sets.length<=4);assert.equal(e.target.sets,e.sets.length);
   for(const t of e.sets){assert(!ids.has(t.id));ids.add(t.id);assert(!t.done);assert.equal(t.rir,"");assert.equal(t.weight,entry.gear==="bodyweight"?0:"");}
  }
 }
 if(equipment==="bodyweight"){assert(plan.reports.every(r=>r.planned.back===0));assert(plan.warnings.some(w=>w.includes("pulling substitute")));}
 combinations++;
}
assert.equal(combinations,108);
for(const [p,date,re]of [[{...base,days:[0,1]},"2026-10-19",/Leave a day/],[{...base,days:[0,1,3,4]},"2026-10-19",/2 or 3/],[{...base,days:[0,0]},"2026-10-19",/valid profile/],[base,"2026-02-30",/valid profile/]])assert.throws(()=>m.buildPlan(p,date,[],uid),re);
const split=m.buildPlan({...base,level:"intermediate",equipment:"gym",days:[0,1,3,4]},"2026-10-19",[],uid);
assert.equal(split.sessions.length,16);assert(split.sessions[0].title.startsWith("Upper"));assert(split.sessions[1].title.startsWith("Lower"));
const skipped=m.buildPlan(base,"2026-10-19",[{date:"2026-10-19",exercises:[]}],uid);
assert.equal(skipped.sessions.length,11);assert.deepEqual(skipped.skipped,["2026-10-19"]);
const p={...base,level:"intermediate",goal:"muscle",equipment:"gym",duration:55,days:[0,3]};
assert(m.targets(p,m.byId("chest-press")).sets>m.targets({...p,goal:"fitness"},m.byId("chest-press")).sets);
assert(m.targets({...p,goal:"strength"},m.byId("chest-press")).rest>=180);
assert.equal(m.choose({...p,preferred:["chest-press"]},"push").id,"chest-press");
assert(!m.validProfile({...p,preferred:["chest-press"],excluded:["chest-press"]}));
assert(!m.validProfile({...p,increment:-1}));assert(!m.validProfile({...p,preferred:["unknown"]}));
assert.throws(()=>m.buildPlan({...base,excluded:m.available(base,"pull").map(e=>e.id)},"2026-10-19",[],uid),/No pull movement/);
const e={id:uid(),catalogId:"db-floor",name:"Dumbbell floor press",target:{min:8,max:12,sets:2,rest:120}};
const set=(reps=12,weight=20,rir=2)=>({id:uid(),reps,weight,rir,done:true});
const exposure=(date,sets=[set(),set()],extra={})=>({id:uid(),date,unit:"kg",readiness:"ready",completed:true,notes:"",exercises:[{...structuredClone(e),sets}],...extra});
const history=[exposure("2026-10-12"),exposure("2026-10-16")];
const rec=(h=history,other=p,readiness="ready")=>m.recommendation(e,h,"2026-10-19","kg","now",other,readiness);
assert.equal(rec().action,"increase");assert.equal(rec().adjustment.weight,21);assert.equal(rec().adjustment.reps,8);
assert.equal(rec([history[1]]).action,"confirm");
assert.equal(rec([exposure("2026-10-16",[set(12,20,""),set(12,20,"")])]).action,"record-effort");
assert.equal(rec([exposure("2026-10-16",[set(5,20,0),set(5,20,1)])]).adjustment.weight,19);
assert.equal(rec(history,{...p,increment:10}).action,"hold");
assert.equal(rec(history,p,"pain").action,"pause");assert.equal(rec(history,p,"low").action,"recover");
const partial=structuredClone(history);partial[1].exercises[0].sets[1].done=false;
assert.notEqual(rec(partial).action,"increase");
const mixed=structuredClone(history);mixed[1].exercises[0].sets[1].weight=15;
assert.notEqual(rec(mixed).action,"increase");
assert.equal(m.historyFor(e,[...history,exposure("2026-10-22",[set(12,100),set(12,100)])],"2026-10-19","lb","now").sets[0].weight,44.09);
const lb=m.recommendation(e,history,"2026-10-19","lb","now",p);
assert.equal(lb.action,"increase");assert.equal(lb.adjustment.weight,46.29);
const low=[exposure("2026-10-12",undefined,{readiness:"low"}),exposure("2026-10-16",undefined,{readiness:"low"})];
assert(m.recoveryState(low,"2026-10-19").reduce);
const light=m.buildPlan(p,"2026-10-19",low,uid);assert(light.sessions[0].plan.recovery);assert(light.warnings.some(w=>w.includes("fewer sets")));
const accounting=m.weeklyReport([exposure("2026-10-19")],"2026-10-19",p)[0];
assert.equal(accounting.planned.chest,2);assert.equal(accounting.planned.shoulders,1);assert.equal(accounting.completed.chest,2);
assert.equal(m.weeklyReport([{...exposure("2026-10-19"),exercises:[{name:"Custom lift",sets:[set()]}]}],"2026-10-19",p)[0].unknown,1);
const planned={id:"future",date:"2026-10-21",title:"Full body",unit:"kg",notes:"Guided plan",completed:false,readiness:"ready",plan:{version:2},exercises:[{...structuredClone(e),sets:[{id:uid(),reps:8,weight:"",rir:"",done:false},{id:uid(),reps:8,weight:"",rir:"",done:false}]}]};
const reviewed=m.reviewPlan(p,[...history,planned],"2026-10-19",uid);
assert.equal(reviewed.updates.length,1);assert.equal(reviewed.updates[0].after.exercises[0].sets[0].weight,21);assert.equal(planned.exercises[0].sets[0].weight,"");
for(const change of [{completed:true},{customized:true},{exercises:[{...planned.exercises[0],sets:[{...planned.exercises[0].sets[0],edited:true}]}]}])assert.equal(m.reviewPlan(p,[...history,{...structuredClone(planned),...change}],"2026-10-19",uid).updates.length,0);
assert.equal(m.reviewPlan(p,[history[0],planned,exposure("2026-10-20")],"2026-10-19",uid).updates.length,0);
assert(!m.validProfile({...base,time:"99:99"}));
const html=require("node:fs").readFileSync(require("node:path").join(__dirname,"../workouts.html"),"utf8");
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
assert.equal(new Set(ids).size,ids.length);
const painful=[exposure("2026-10-16",undefined,{readiness:"pain"})];
assert.notEqual(m.choose({...p,preferred:["db-floor"]},"push",0,painful,"2026-10-19")?.id,"db-floor");
const lightExercise=m.makeExercise(m.byId("prone-w"),base,uid);
assert.equal(m.recommendation(lightExercise,[],"2026-10-19","kg","now",base).action,"control");
console.log("PASS: 108 plans; movement coverage, dose/time limits, volume accounting, preferences/exclusions, effort-gated progression, regression/recovery, mixed loads, unit conversion and protected reviews.");
