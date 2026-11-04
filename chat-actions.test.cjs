const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
const tick=()=>new Promise(r=>setImmediate(r));
const read=p=>fs.readFileSync(p,'utf8');
const person={id:'demo',name:'Demo Person',title:'Engineer',email:'demo@example.com',department:'Engineering',skills:['HTML'],chat_user_id:'recipient'};
async function directory(url='https://example.com/index.html#directory'){
 const dom=new JSDOM(read('index.html'),{runScripts:'outside-only',url,pretendToBeVisual:true});
 const w=dom.window;w.matchMedia=()=>({matches:true,addEventListener(){}});w.scrollTo=()=>{};
 w.EmployeeStore={list:async()=>[person]};w.eval(read('directory.js'));await tick();return w;
}
test('Jessie header search works with existing filters and Clear all resets both search fields',async()=>{
 const w=await directory();try{
 const d=w.document,h=d.querySelector('#header-search-input');h.value='Nobody';h.dispatchEvent(new w.Event('input'));
 assert.equal(d.querySelectorAll('.employee-card').length,0);
 d.querySelector('#clearSearch').click();assert.equal(h.value,'');assert.equal(d.querySelectorAll('.employee-card').length,1);
 h.value='engineer';h.dispatchEvent(new w.Event('input'));assert.equal(d.querySelector('#search').value,'engineer');assert.equal(d.querySelectorAll('.employee-card').length,1);
 assert.match(d.querySelector('.header-quick-invite').href,/admin.html$/);
 }finally{w.close()}
});
test('shared links open the current full profile, copy its ID, and print without losing chat action',async()=>{
 const w=await directory('https://example.com/index.html?employee=demo#directory');try{
 const d=w.document;let copied='',printed=0;Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async t=>{copied=t}}});w.print=()=>printed++;
 assert.equal(d.querySelectorAll('.full-profile-section').length,4);
 assert.equal(d.querySelector('.profile-message-button').textContent,'Send Direct Message');
 d.querySelector('.share-profile-button').click();await tick();assert.equal(new URL(copied).searchParams.get('employee'),'demo');
 d.querySelector('.print-profile-button').click();assert.equal(printed,1);
 d.querySelector('.modal-close').click();assert.equal(d.querySelector('.profile-modal'),null);
 }finally{w.close()}
});
async function chat(user={id:'sender'},recipient='recipient'){
 const dom=new JSDOM(read('messaging.html'),{url:'https://example.com/messaging.html'});
 const state={window:{location:{search:'?recipient='+recipient,href:''}},document:dom.window.document,URLSearchParams,console};
 let inserted,notify,filter;
 state.miguelSupabaseClient={auth:{getUser:async()=>({data:{user}})},from:table=>({select:()=>({eq:()=>({single:async()=>({data:{display_name:'Demo Recipient'}})}),or:v=>{filter=v;return {order:async()=>({data:[{id:'one',sender_id:'recipient',recipient_id:'sender',body:'Previous message'}]})}}}),insert:async value=>{inserted=value;return {error:null}}}),channel:()=>({on:(type,opts,cb)=>{notify=cb;return {subscribe(){}}}})};
 vm.createContext(state);vm.runInContext(read('messaging.js'),state);await tick();
 return {dom,state,get inserted(){return inserted},get filter(){return filter},notify:m=>notify({new:m})};
}
test('Miguel chat loads history, sends correct participants, handles prompts and filters realtime messages',async()=>{
 const c=await chat();try{
 const d=c.dom.window.document;assert.equal(d.querySelector('#recipient-name').textContent,'Demo Recipient');
 assert.match(d.querySelector('#conversation').textContent,/Previous message/);assert.match(c.filter,/sender_id.eq.sender/);
 d.querySelector('[data-prompt]').click();assert.match(d.querySelector('#message-composer').value,/introduce/);
 d.querySelector('#message-form').dispatchEvent(new c.dom.window.Event('submit',{cancelable:true}));await tick();assert.equal(c.inserted.sender_id,'sender');assert.equal(c.inserted.recipient_id,'recipient');
 c.notify({sender_id:'other',recipient_id:'other',body:'unrelated'});assert.doesNotMatch(d.querySelector('#conversation').textContent,/unrelated/);
 c.notify({sender_id:'recipient',recipient_id:'sender',body:'Live reply'});assert.match(d.querySelector('#conversation').textContent,/Live reply/);
 }finally{c.dom.window.close()}
});
test('chat requires its own login and preserves the selected recipient',async()=>{
 const c=await chat(null);try{assert.equal(c.state.window.location.href,'chat-login.html?recipient=recipient');assert.equal(c.dom.window.document.querySelector('button[type=submit]').disabled,true)}finally{c.dom.window.close()}
});
