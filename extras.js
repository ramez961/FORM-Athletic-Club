// Mobile navigation
const menuButton=document.querySelector('.menu-toggle');
const mobileMenu=document.querySelector('#mobile-nav');
menuButton.addEventListener('click',()=>{
  const open=menuButton.getAttribute('aria-expanded')!=='true';
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  mobileMenu.hidden=!open;
});
mobileMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  mobileMenu.hidden=true;
  menuButton.setAttribute('aria-expanded','false');
  menuButton.setAttribute('aria-label','Open navigation');
}));

// BMI is calculated on this page and never persisted.
let bmiUnit='metric';
const bmiHeight=document.querySelector('#bmi-height');
const bmiWeight=document.querySelector('#bmi-weight');
document.querySelectorAll('[data-unit]').forEach(button=>button.addEventListener('click',()=>{
  const next=button.dataset.unit;
  if(next===bmiUnit)return;
  const h=Number(bmiHeight.value),w=Number(bmiWeight.value);
  if(h>0)bmiHeight.value=(next==='imperial'?h/2.54:h*2.54).toFixed(1);
  if(w>0)bmiWeight.value=(next==='imperial'?w/0.45359237:w*0.45359237).toFixed(1);
  bmiUnit=next;
  const metric=next==='metric';
  document.querySelector('#bmi-height-label').textContent=metric?'Height (cm)':'Height (inches)';
  document.querySelector('#bmi-weight-label').textContent=metric?'Weight (kg)':'Weight (lb)';
  Object.assign(bmiHeight,{min:metric?'100':'39.4',max:metric?'240':'94.5',placeholder:metric?'175':'69'});
  Object.assign(bmiWeight,{min:metric?'30':'66.1',max:metric?'300':'661.4',placeholder:metric?'75':'165'});
  document.querySelectorAll('[data-unit]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});
  document.querySelector('#bmi-result').hidden=true;
}));
document.querySelector('#bmi-form').addEventListener('submit',event=>{
  event.preventDefault();
  const height=Number(bmiHeight.value)*(bmiUnit==='metric'?0.01:0.0254);
  const weight=Number(bmiWeight.value)*(bmiUnit==='metric'?1:0.45359237);
  const value=weight/(height*height);
  if(!Number.isFinite(value)||value<=0)return;
  const category=value<18.5?'Underweight':value<25?'Healthy weight':value<30?'Overweight':'Obesity';
  const result=document.querySelector('#bmi-result');
  result.replaceChildren();
  const label=document.createElement('p');label.textContent='Your BMI';
  const score=document.createElement('strong');score.textContent=value.toFixed(1);score.tabIndex=-1;
  const group=document.createElement('p');group.className='bmi-category';group.textContent=category+' · adult screening category';
  const note=document.createElement('p');note.className='caption';note.textContent='A screening result, not a diagnosis or a training prescription. It does not measure body composition or overall health. Categories use the unrounded value.';
  result.append(label,score,group,note);result.hidden=false;score.focus();
});

// Sample catalogue, with in-memory bag. No checkout or network requests.
const products=[
 {id:'men',name:'Men’s Training Set',category:'men',price:52,image:'merch-men',description:'Charcoal training tee + lime cap.',sizes:['XS','S','M','L','XL','XXL']},
 {id:'women',name:'Women’s Studio Set',category:'women',price:52,image:'merch-women',description:'Sage cropped tee + ivory tote.',sizes:['XS','S','M','L','XL','XXL']},
 {id:'volleyball',name:'Volleyball Court Kit',category:'sport',price:68,image:'merch-volleyball',description:'Unisex jersey, shorts + volleyball.',sizes:['XS','S','M','L','XL','XXL']},
 {id:'football',name:'Football Match Kit',category:'sport',price:68,image:'merch-football',description:'Unisex jersey, shorts + football.',sizes:['XS','S','M','L','XL','XXL']},
 {id:'equipment',name:'Gym Essentials',category:'equipment',price:58,image:'merch-equipment',description:'Bottle, exercise mat + resistance loop.',sizes:[]},
 {id:'sports',name:'Multisport Collection',category:'equipment',price:98,image:'merch-sports',description:'Basketball, volleyball, American football + duffel.',sizes:[]}
];
const bag=[];
const bagDialog=document.querySelector('#bag-dialog');
const money=value=>'$'+value.toFixed(2);
function renderProducts(category='all'){
 const grid=document.querySelector('#products');grid.replaceChildren();
 products.filter(p=>category==='all'||p.category===category).forEach(p=>{
  const card=document.createElement('article');card.className='product-card';
  const photo=document.createElement('div');photo.className='product-photo';
  const img=document.createElement('img');Object.assign(img,{src:`assets/${p.image}.jpg`,alt:`AI-generated FORM ${p.name.toLowerCase()} with the club emblem`,width:640,height:640,loading:'lazy'});photo.append(img);
  const heading=document.createElement('div');heading.className='product-heading';
  const title=document.createElement('h3');title.textContent=p.name;
  const price=document.createElement('span');price.textContent=money(p.price);heading.append(title,price);
  const description=document.createElement('p');description.textContent=p.description;
  const controls=document.createElement('div');controls.className='product-buy';
  let select;
  if(p.sizes.length){const label=document.createElement('label');label.textContent='Size';select=document.createElement('select');select.setAttribute('aria-label',`${p.name} size`);p.sizes.forEach(s=>{const option=document.createElement('option');option.value=s;option.textContent=s;select.append(option)});select.value='M';label.append(select);controls.append(label)}
  const add=document.createElement('button');add.className='button';add.textContent='Add to bag +';add.setAttribute('aria-label',`Add ${p.name} to bag`);
  add.addEventListener('click',()=>{const size=select?select.value:'One size';const existing=bag.find(b=>b.id===p.id&&b.size===size);if(existing){existing.quantity=Math.min(existing.quantity+1,10)}else{bag.push({id:p.id,size,quantity:1})}renderBag();toast(`${p.name} added to your demo bag.`)});
  controls.append(add);card.append(photo,heading,description,controls);grid.append(card);
 });
}
document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});renderProducts(button.dataset.category);
}));
function renderBag(){
 document.querySelector('#bag-count').textContent=String(bag.reduce((sum,b)=>sum+b.quantity,0));
 const items=document.querySelector('#bag-items');items.replaceChildren();
 if(!bag.length){const empty=document.createElement('p');empty.style.marginTop='25px';empty.textContent='Your bag is waiting for a little FORM.';items.append(empty)}
 bag.forEach((item,index)=>{
  const p=products.find(p=>p.id===item.id);const row=document.createElement('div');row.className='bag-row';
  const img=document.createElement('img');img.src=`assets/${p.image}.jpg`;img.alt=p.name;
  const body=document.createElement('div');const title=document.createElement('strong');title.textContent=p.name;
  const size=document.createElement('small');size.textContent=`${item.size} · ${money(p.price)} each`;
  const controls=document.createElement('div');controls.className='bag-controls';
  const minus=document.createElement('button');minus.textContent='−';minus.setAttribute('aria-label',`Decrease ${p.name} quantity`);minus.onclick=()=>{if(item.quantity>1)item.quantity--;else bag.splice(index,1);renderBag()};
  const count=document.createElement('span');count.textContent=item.quantity;
  const plus=document.createElement('button');plus.textContent='+';plus.disabled=item.quantity>=10;plus.setAttribute('aria-label',`Increase ${p.name} quantity`);plus.onclick=()=>{item.quantity=Math.min(item.quantity+1,10);renderBag()};
  const remove=document.createElement('button');remove.className='bag-remove';remove.textContent='Remove';remove.setAttribute('aria-label',`Remove ${p.name} ${item.size}`);remove.onclick=()=>{bag.splice(index,1);renderBag()};
  controls.append(minus,count,plus,remove);body.append(title,size,controls);
  const total=document.createElement('strong');total.textContent=money(item.quantity*p.price);row.append(img,body,total);items.append(row);
 });
 document.querySelector('#bag-subtotal').textContent=money(bag.reduce((sum,b)=>sum+b.quantity*products.find(p=>p.id===b.id).price,0));
 document.querySelector('#download-bag').disabled=bag.length===0;
 document.querySelector('#bag-status').textContent='';
}
document.querySelector('#open-bag').onclick=()=>{renderBag();bagDialog.showModal()};
document.querySelector('#close-bag').onclick=()=>bagDialog.close();
document.querySelector('#download-bag').onclick=()=>{
 const lines=bag.map(b=>{const p=products.find(p=>p.id===b.id);return `${p.name} / ${b.size} × ${b.quantity}: ${money(p.price*b.quantity)}`});
 const text=['FORM — Demo shopping bag',...lines,'Subtotal: '+document.querySelector('#bag-subtotal').textContent,'No order placed. No payment collected. Taxes and shipping not included.'].join('\n');
 const url=URL.createObjectURL(new Blob([text],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='form-demo-bag.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelector('#bag-status').textContent='Demo bag summary downloaded.';
};
renderProducts();renderBag();

