const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const tick = () => new Promise(resolve => setImmediate(resolve));
async function setup(admin, failSave=false) {
 const dom = new JSDOM(fs.readFileSync('admin.html','utf8'), {runScripts:'outside-only',url:'https://example.com/admin.html'});
 const w=dom.window; let saved;
 w.EmployeeStore={getAdmin:async()=>admin,list:async()=>[{id:'1',name:'<img src=x onerror=alert(1)>',title:'Developer',department:'Engineering',location:'San Antonio, TX (CT)',skills:[],email:'test@example.com',image:''}],onAuthChange(){},save:async input=>{if(failSave)throw Error('Connection failed');saved=input;return {...input,id:'2'};},removePhotoIfUnused:async()=>{}};
 w.eval(fs.readFileSync('location-picker.js','utf8'));
 w.eval(fs.readFileSync('admin.js','utf8')); await tick();
 return {w,getSaved:()=>saved};
}
test('anonymous visitors cannot see management form',async()=>{const {w}=await setup(null);assert.equal(w.document.getElementById('manager-panel').hidden,true);assert.equal(w.document.getElementById('login-panel').hidden,false);w.close();});
test('employee names render as text, and approved admins can save',async()=>{const {w,getSaved}=await setup({id:'admin',email:'owner@example.com'});const d=w.document;assert.equal(d.querySelector('#admin-employees img'),null);assert.match(d.querySelector('#admin-employees').textContent,/<img src=x/);for(const [key,value] of Object.entries({name:'New Person',title:'Tester',department:'QA',email:'new@example.com'}))d.getElementById('employee-'+key).value=value;d.getElementById('employee-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();assert.equal(getSaved().name,'New Person');assert.equal(d.getElementById('employee-name').value,'');w.close();});
test('failed save preserves draft and restores controls',async()=>{const {w}=await setup({id:'admin',email:'owner@example.com'},true);const d=w.document;for(const [key,value] of Object.entries({name:'Draft Person',title:'Tester',department:'QA',email:'new@example.com'}))d.getElementById('employee-'+key).value=value;d.getElementById('employee-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();assert.equal(d.getElementById('employee-name').value,'Draft Person');assert.equal(d.getElementById('employee-fields').disabled,false);assert.match(d.getElementById('admin-status').textContent,/Connection failed/);w.close();});


test('live preview uses text and shows only three skill badges', async()=>{
 const {w}=await setup({id:'admin',email:'owner@example.com'});const d=w.document;
 for(const [key,value] of Object.entries({name:'<img src=x onerror=alert(1)>',title:'Engineer',department:'Engineering',email:'person@example.com',skills:'HTML, CSS, JavaScript, SQL'}))d.getElementById('employee-'+key).value=value;
 d.getElementById('employee-name').dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.equal(d.getElementById('card-name').textContent,'<img src=x onerror=alert(1)>');assert.equal(d.querySelector('#card-name img'),null);
 assert.equal(d.querySelectorAll('#card-skills .skill-chip').length,3);assert.equal(d.getElementById('readiness-progress').value,4);
 d.querySelector('#skill-chip-list button').click();assert.equal(d.getElementById('employee-skills').value,'CSS, JavaScript, SQL');
 w.close();
});
test('suggested skills avoid duplicates and skill limit blocks invalid submission',async()=>{
 const {w}=await setup({id:'admin',email:'owner@example.com'});const d=w.document;const b=d.querySelector('[data-skill="HTML"]');b.click();b.click();assert.equal(d.getElementById('employee-skills').value,'HTML');
 d.getElementById('employee-skills').value=Array.from({length:21},(_,i)=>'Skill '+i).join(',');d.getElementById('employee-skills').dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(d.getElementById('employee-skills').checkValidity(),false);
 d.getElementById('new-employee').click();assert.equal(d.getElementById('employee-skills').checkValidity(),true);assert.equal(d.getElementById('readiness-progress').value,0);w.close();
});
test('local draft is scoped to admin and restoring does not publish',async()=>{
 const {w,getSaved}=await setup({id:'admin-a',email:'owner@example.com'});const d=w.document;
 d.getElementById('employee-name').value='Draft Person';d.getElementById('save-draft').click();assert.ok(w.localStorage.getItem('thePeople.teammateDraft.admin-a'));assert.equal(w.localStorage.getItem('thePeople.teammateDraft.admin-b'),null);
 d.getElementById('new-employee').click();d.getElementById('restore-draft').click();assert.equal(d.getElementById('employee-name').value,'Draft Person');assert.equal(d.getElementById('card-name').textContent,'Draft Person');assert.equal(getSaved(),undefined);w.close();
});
test('editing refreshes preview and saving preserves optional fields',async()=>{
 const {w,getSaved}=await setup({id:'admin',email:'owner@example.com'});const d=w.document;d.querySelector('#admin-employees button').click();assert.match(d.getElementById('card-name').textContent,/<img/);assert.equal(d.getElementById('save-draft').hidden,true);
 assert.equal(d.getElementById('employee-location').value,'San Antonio, TX (CT)');d.getElementById('employee-location').value='Los Angeles, CA (PT)';d.getElementById('employee-location').dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(d.getElementById('card-location').textContent,'Los Angeles, CA (PT)');d.getElementById('employee-bio').value='Bio';d.getElementById('employee-linkedin').value='https://linkedin.com/in/example';d.getElementById('employee-joiningDate').value='2026-10-01';d.getElementById('employee-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();assert.equal(getSaved().location,'Los Angeles, CA (PT)');assert.equal(getSaved().bio,'Bio');assert.equal(getSaved().joiningDate,'2026-10-01');assert.equal(getSaved().linkedin,'https://linkedin.com/in/example');assert.equal(d.getElementById('card-name').textContent,'Your new teammate');w.close();
});

test('theme icon button toggles and remembers the selected theme',async()=>{
 const {w}=await setup({id:'admin',email:'owner@example.com'});const button=w.document.getElementById('admin-theme');
 assert.equal(button.getAttribute('aria-pressed'),'false');button.click();
 assert.equal(w.document.body.classList.contains('darkMode'),true);assert.equal(button.getAttribute('aria-label'),'Switch to light mode');assert.equal(w.localStorage.getItem('darkMode'),'enabled');
 button.click();assert.equal(w.document.body.classList.contains('darkMode'),false);assert.equal(button.getAttribute('aria-label'),'Switch to dark mode');w.close();
});

test('Vancouver suggestion fills Canada, province and named zone and saves them',async()=>{
 const {w,getSaved}=await setup({id:'admin',email:'owner@example.com'});const d=w.document;
 assert.equal(d.querySelectorAll('#employee-country option').length,250);
 const city=d.getElementById('employee-location');city.value='Vancouver';city.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.equal(d.getElementById('employee-country').value,'Canada');assert.equal(d.getElementById('employee-region').value,'British Columbia');assert.equal(d.getElementById('employee-timeZone').value,'America/Vancouver');assert.equal(d.getElementById('card-location').textContent,'Vancouver, British Columbia, Canada');
 for(const [k,v] of Object.entries({name:'New Teammate',title:'Engineer',department:'Engineering',email:'new@example.com'}))d.getElementById('employee-'+k).value=v;
 d.getElementById('employee-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();assert.equal(getSaved().country,'Canada');assert.equal(getSaved().region,'British Columbia');assert.equal(getSaved().timeZone,'America/Vancouver');w.close();
});
test('manual worldwide city works with selected country and zone',async()=>{
 const {w,getSaved}=await setup({id:'admin',email:'owner@example.com'});const d=w.document;
 d.getElementById('employee-country').value='Afghanistan';d.getElementById('employee-country').dispatchEvent(new w.Event('change',{bubbles:true}));
 d.getElementById('employee-location').value='Herat';d.getElementById('employee-region').value='Herat';d.getElementById('employee-timeZone').value='Asia/Kabul';
 for(const [k,v] of Object.entries({name:'New Teammate',title:'Engineer',department:'Engineering',email:'new@example.com'}))d.getElementById('employee-'+k).value=v;
 d.getElementById('employee-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await tick();assert.equal(getSaved().location,'Herat');assert.equal(getSaved().country,'Afghanistan');assert.equal(getSaved().timeZone,'Asia/Kabul');w.close();
});
