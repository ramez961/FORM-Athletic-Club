const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const m=require('../training-model.js');
const uid=()=>crypto.randomUUID();
const base={level:'beginner',goal:'fitness',equipment:'bodyweight',duration:40,unit:'kg',days:[0,2,4],time:'18:00',food:'mixed'};
let combinations=0;
for(const level of Object.keys(m.levels)) for(const goal of Object.keys(m.goals)) for(const equipment of Object.keys(m.equipment)) for(const duration of [25,40,55]) {
 const p={...base,level,goal,equipment,duration};
 const plan=m.buildPlan(p,'2026-10-19',[],uid);
 assert.equal(plan.sessions.length,12);
 const ids=new Set();
 for(const s of plan.sessions){
  assert.equal(s.unit,'kg');
  assert(s.date>='2026-10-19'&&s.date<='2026-11-15');
  assert(s.exercises.length>=3);
  assert(p.days.includes((new Date(s.date+'T12:00:00').getDay()+6)%7));
  for(const e of s.exercises){
   const entry=m.byId(e.catalogId);
   assert(m.available(p).some(x=>x.id===entry.id));
   assert(entry.difficulty<={beginner:0,intermediate:1,experienced:2}[level]);
   assert(e.sets.length>=2&&e.sets.length<=3);
   assert(e.target.min<=e.target.max);
   for(const t of e.sets){assert(!ids.has(t.id));ids.add(t.id);assert.equal(t.done,false);assert.equal(t.weight,entry.gear==='bodyweight'?0:'');}
  }
 }
 combinations++;
}
assert.equal(combinations,108);
assert.throws(()=>m.buildPlan({...base,days:[0,1]},'2026-10-19',[],uid),/Leave a day/);
assert.throws(()=>m.buildPlan({...base,days:[0,1,3,4]},'2026-10-19',[],uid),/2 or 3/);
assert.throws(()=>m.buildPlan({...base,days:[0,0]},'2026-10-19',[],uid),/valid profile/);
assert.throws(()=>m.buildPlan(base,'2026-02-30',[],uid),/valid profile/);
const split=m.buildPlan({...base,level:'intermediate',days:[0,1,3,4]},'2026-10-19',[],uid);
assert.equal(split.sessions.length,16);
assert(split.sessions[0].title.startsWith('Upper'));
assert(split.sessions[1].title.startsWith('Lower'));
const skipped=m.buildPlan(base,'2026-10-19',[{date:'2026-10-19'}],uid);
assert.equal(skipped.sessions.length,11);assert.deepEqual(skipped.skipped,['2026-10-19']);
const exercise={id:uid(),name:'Dumbbell floor press',catalogId:'db-floor',target:{min:8,max:12,sets:2,rest:75}};
const history=[{id:'past',date:'2026-10-18',unit:'kg',exercises:[{name:exercise.name,sets:[{reps:12,weight:10,done:true},{reps:12,weight:10,done:true}]}]},{id:'future',date:'2026-10-22',unit:'kg',exercises:[{name:exercise.name,sets:[{reps:15,weight:100,done:true}]}]}];
assert.match(m.recommendation(exercise,history,'2026-10-19','kg','now').message,/smallest available/);
assert.equal(m.historyFor(exercise,history,'2026-10-19','lb','now').sets[0].weight,22.05);
history[0].exercises[0].sets[1].done=false;
assert.doesNotMatch(m.recommendation(exercise,history,'2026-10-19','kg','now').message,/smallest available/);
history[0].exercises[0].sets[0].done=false;
assert.equal(m.historyFor(exercise,history,'2026-10-19','kg','now'),null);
assert.equal(m.validProfile({...base,time:'99:99'}),false);
assert.equal(m.validProfile({...base,equipment:'unknown'}),false);
console.log('PASS: 108 equipment/goal/level/duration plans, date and spacing validation, upper/lower split, occupied dates, unique IDs, load defaults, completed-history filtering, progression eligibility and unit conversion.');
