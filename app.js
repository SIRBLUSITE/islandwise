/* ============================================================================
 * islandwise demo — everything here is SIMULATED. No network calls, no real
 * credentials, no real bank connections. Linked accounts & wallet live only in
 * this browser's localStorage.
 * ==========================================================================*/

/* ---------------------------------------------------------------------------
 * BANKS — banks licensed in The Bahamas that the Central Bank lists as resident
 * "Authorized Dealers" (i.e. authorised to deal in foreign currency under
 * Exchange Control, hence BSD + USD).
 * Sources (checked 18 Oct 2026):
 *  - Central Bank of The Bahamas, Supervised Financial Institutions List
 *    (Authorized Dealers section, licence "master codes"):
 *    https://www.centralbankbahamas.com/viewPDF/documents/2026-02-27-11-49-39-Supervised-Financial-Institutions-List-as-at-27-February-2026.pdf
 *    Index of current weekly lists (latest 09-Oct-2026):
 *    https://www.centralbankbahamas.com/bank-supervision/supervised-financial-institutions
 *  - Which are commercial banks / Bahamian-owned:
 *    https://www.centralbankbahamas.com/faq-s/banker-tobanks
 * `lic`   = CBOB licence master code (from the list above).
 * `code`  = islandwise-internal short code for this demo (NOT a SWIFT/BIC or
 *           routing code — those are deliberately omitted, not verified).
 * `instant` = 'simulated' for every bank: instant settlement is demo-only.
 * --------------------------------------------------------------------------*/
const BANKS = [
  {name:'Bank of The Bahamas', legal:'Bank of The Bahamas Ltd.', code:'BOB', short:'BOB', ini:'BOB', lic:'LIC0049', currencies:['BSD','USD'], instant:'simulated', commercial:true, bahamian:true},
  {name:'CIBC Caribbean (Bahamas)', legal:'CIBC Caribbean Bank (Bahamas) Ltd.', aka:'FirstCaribbean International Bank', code:'CIBC', short:'CIBC', ini:'CC', lic:'LIC0218', currencies:['BSD','USD'], instant:'simulated', commercial:true},
  {name:'Citibank N.A. (Bahamas)', legal:'Citibank, N.A.', code:'CITI', short:'Citibank', ini:'CN', lic:'LIC0003', currencies:['BSD','USD'], instant:'simulated', commercial:true},
  {name:'Commonwealth Bank', legal:'Commonwealth Bank Ltd.', code:'CWB', short:'Commonwealth', ini:'CB', lic:'LIC0024', currencies:['BSD','USD'], instant:'simulated', commercial:true, bahamian:true},
  {name:'Equity Bank Bahamas', legal:'Equity Bank Bahamas Ltd.', code:'EQB', short:'Equity', ini:'EB', lic:'LIC0141', currencies:['BSD','USD'], instant:'simulated', commercial:false},
  {name:'Fidelity Bank (Bahamas)', legal:'Fidelity Bank (Bahamas) Limited', code:'FID', short:'Fidelity', ini:'FB', lic:'LIC0096', currencies:['BSD','USD'], instant:'simulated', commercial:true, bahamian:true},
  {name:'Finance Corporation of Bahamas (FINCO)', legal:'Finance Corp. of Bahamas Ltd.', code:'FINCO', short:'FINCO', ini:'FC', lic:'LIC0014', currencies:['BSD','USD'], instant:'simulated', commercial:true},
  {name:'RBC Royal Bank (Bahamas)', legal:'RBC Royal Bank (Bahamas) Ltd.', code:'RBC', short:'RBC', ini:'RB', lic:'LIC0499', currencies:['BSD','USD'], instant:'simulated', commercial:true},
  {name:'RF Bank & Trust (Bahamas)', legal:'RF Bank & Trust (Bahamas) Ltd.', code:'RFB', short:'RF Bank', ini:'RF', lic:'LIC0256', currencies:['BSD','USD'], instant:'simulated', commercial:false},
  {name:'Scotiabank (Bahamas)', legal:'Scotiabank (Bahamas) Ltd.', code:'SCB', short:'Scotiabank', ini:'SB', lic:'LIC0244', currencies:['BSD','USD'], instant:'simulated', commercial:true}
];
// Neutral islandwise palette for initials avatars (not bank brand colours).
const PAL=['#00977f','#2563eb','#7c3aed','#d97706','#0891b2','#be185d','#4d7c0f','#475569','#c2410c','#0f766e'];
BANKS.forEach((b,i)=>b.color=PAL[i%PAL.length]);
const bankBy=c=>BANKS.find(b=>b.code===c);

/* ---------- core helpers + fee calculator (original behaviour) ---------- */
const RATE=1.0000,fee=a=>a>0?+(0.99+a*0.0037).toFixed(2):0,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],m=n=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
let cur='USD';const sym=c=>c==='USD'?'$':'B$',flag=c=>c==='USD'?'🇺🇸 USD':'🇧🇸 BSD',money=(n,c)=>sym(c)+m(n)+' '+c;
function setCur(c){cur=c;$$('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.c===c));$('#cCurLbl').textContent=$('#mCurLbl').textContent=flag(c);calc();mcalc()}
$$('.seg button').forEach(b=>b.onclick=()=>setCur(b.dataset.c));
function calc(){const a=+$('#cSend').value||0,f=fee(a),c=Math.max(a-f,0),s=sym(cur);$('#cFee').textContent=s+m(f)+' '+cur;$('#cConv').textContent=s+m(c)+' '+cur;$('#cGet').value=(c*RATE).toFixed(2);$('#cSave').textContent=s+m(a*0.042);
 $('#cRate').textContent=cur==='USD'?'1 USD = 1.0000 BSD':'Domestic transfer · no FX';$('#cNote').textContent=cur==='USD'?'Mid-market rate · BSD pegged 1:1 to USD':'Domestic — no currency conversion'}
$('#cSend').oninput=calc;calc();

/* ---------- simulated storage: linked accounts + wallet ---------- */
const LS_ACC='iw.linkedAccounts',LS_WAL='iw.walletBSD';
const load=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch(e){return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let accounts=load(LS_ACC,[]),wallet=+load(LS_WAL,0)||0;
const persist=()=>{save(LS_ACC,accounts);save(LS_WAL,+wallet.toFixed(2))};
const accLabel=a=>`${bankBy(a.bank)?.name||a.bank} · ${a.type} ••${a.mask}`;
// Compact label for tight UI (Pay-from select, review chip): short bank name.
const accShort=a=>`${bankBy(a.bank)?.short||a.bank} · ${a.type} ••${a.mask}`;
function renderWallet(){$('#walletBal').textContent='B$'+m(wallet);const ab=$('#aBal');if(ab)ab.textContent='B$'+m(wallet)+' BSD'}

/* ---------- Banks directory section ---------- */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const av=(b,cls='')=>`<span class="av ${cls}" style="--c:${b.color}" aria-hidden="true">${esc(b.ini)}</span>`;
function renderBanks(){
  const q=$('#bSearch').value.trim().toLowerCase();
  const list=BANKS.filter(b=>!q||[b.name,b.legal,b.aka||'',b.code].join(' ').toLowerCase().includes(q));
  $('#bGrid').innerHTML=list.map(b=>{const n=accounts.filter(a=>a.bank===b.code).length;return `<article class="card bank">
   <div class="bt">${av(b)}<div><h3>${esc(b.name)}</h3><p class="small">${esc(b.legal)}${b.aka?` · formerly ${esc(b.aka)}`:''}</p></div></div>
   <div class="chips">${b.currencies.map(c=>`<span class="chip">${flag(c)}</span>`).join('')}<span class="chip sim" title="Instant settlement is simulated in this demo">⚡ Instant · simulated</span>${b.bahamian?'<span class="chip">Bahamian-owned</span>':''}</div>
   <div class="bf"><span class="small">CBOB licence ${esc(b.lic)}</span>${n?`<span class="linked">✓ ${n} linked</span>`:''}<button class="btn sm ${n?'ghost':''}" data-link="${b.code}">${n?'Link another':'Link'}</button></div></article>`}).join('')
   ||`<p class="small empty">No banks match “${esc(q)}”.</p>`;
  $('#bCount').textContent=`${list.length} of ${BANKS.length} banks`;
}
$('#bSearch').oninput=renderBanks;
$('#bGrid').onclick=e=>{const b=e.target.closest('[data-link]');if(b)openLink(b.dataset.link)};

/* ---------- Link bank modal (simulated, Plaid-style) ---------- */
const lm=$('#linkModal');let lBank=null,lOffers=[],lCb=null;
function lshow(v){$$('#linkModal .lv').forEach(x=>x.hidden=x.dataset.l!==v);lm.querySelector('.sheet').scrollTop=0}
function lhead(){const b=bankBy(lBank);$$('#linkModal .lhead').forEach(h=>h.innerHTML=`${av(b,'sm')}<b>${esc(b.name)}</b><span class="tag demo">DEMO</span>`)}
function renderLList(){const q=$('#lSearch').value.trim().toLowerCase();
  $('#lList').innerHTML=BANKS.filter(b=>!q||(b.name+' '+b.legal+' '+(b.aka||'')).toLowerCase().includes(q)).map(b=>`<button type="button" class="bi" data-pick="${b.code}">${av(b,'sm')}<span><b>${esc(b.name)}</b><small>${b.currencies.join(' · ')}</small></span><i>›</i></button>`).join('')||'<p class="small empty">No banks match.</p>'}
$('#lSearch').oninput=renderLList;
$('#lList').onclick=e=>{const b=e.target.closest('[data-pick]');if(b)toLogin(b.dataset.pick)};
function toLogin(code){lBank=code;lhead();$('#lUser').value=$('#lPass').value='';$('#lErr').textContent='';lshow('login');setTimeout(()=>$('#lUser').focus(),50)}
function openLink(code,cb){lCb=cb||null;$('#lSearch').value='';renderLList();if(code)toLogin(code);else lshow('pick');lm.hidden=false}
const rnd=(a,b)=>Math.random()*(b-a)+a,digits=n=>Array.from({length:n},()=>Math.floor(Math.random()*10)).join('');
function genAccounts(code){const b=bankBy(code),out=[{type:'Checking',cur:'BSD',bal:rnd(800,9000)},{type:'Savings',cur:'BSD',bal:rnd(1500,25000)}];
  if(b.currencies.includes('USD'))out.push({type:'USD Checking',cur:'USD',bal:rnd(200,6000)});
  return out.map(a=>({id:'acc_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),bank:code,type:a.type,cur:a.cur,mask:digits(4),balance:+a.bal.toFixed(2)}))}
$('#lSign').onclick=function(){
  if(!$('#lUser').value.trim()||!$('#lPass').value){$('#lErr').textContent='Enter any username and password (demo).';return}
  // DEMO: credentials are never stored or transmitted — clear them immediately.
  $('#lUser').value=$('#lPass').value='';$('#lErr').textContent='';
  this.disabled=true;this.innerHTML='<span class="spin"></span> Connecting…';
  setTimeout(()=>{this.disabled=false;this.textContent='Sign in';lOffers=genAccounts(lBank);
    $('#lAccts').innerHTML=lOffers.map((a,i)=>`<label class="acct"><input type="checkbox" value="${a.id}" ${i===0?'checked':''}><span class="ai"><b>${esc(a.type)} ••••${a.mask}</b><small>${a.cur} account</small></span><span class="ab">${money(a.balance,a.cur)}</span></label>`).join('');
    $('#lErr2').textContent='';lshow('acct')},1100)};
$('#lLink').onclick=()=>{const ids=$$('#lAccts input:checked').map(i=>i.value);if(!ids.length){$('#lErr2').textContent='Select at least one account.';return}
  const picked=lOffers.filter(a=>ids.includes(a.id));accounts.push(...picked);persist();
  $('#lOkTxt').textContent=`${bankBy(lBank).name}: ${picked.length} account${picked.length>1?'s':''} linked (simulated). You can now pay from ${picked.length>1?'them':'it'} or add money to your islandwise balance.`;
  lshow('ok');refreshAll();lm._picked=picked[0]};
const closeLink=()=>{lm.hidden=true;$('#lUser').value=$('#lPass').value=''};
$('#lDone').onclick=()=>{const p=lm._picked,cb=lCb;lm._picked=null;lCb=null;closeLink();if(cb&&p)cb(p)};
$$('[data-lback]').forEach(b=>b.onclick=()=>lshow(b.dataset.lback));
lm.querySelector('[data-xl]').onclick=()=>{lCb&&lCb(null);lCb=null;closeLink()};
lm.onclick=e=>{if(e.target===lm){lCb&&lCb(null);lCb=null;closeLink()}};

/* ---------- Pay-from options (send flow + add money) ---------- */
const NEW='__new__',WAL='__wallet__',CARD='__card__';
function srcOf(v){if(v===WAL)return{kind:'wallet',label:'islandwise balance',cur:'BSD',balance:wallet};if(v===CARD)return{kind:'card',label:'Debit card (demo)',cur:null,balance:Infinity};const a=accounts.find(x=>x.id===v);return a?{kind:'bank',acc:a,label:accLabel(a),short:accShort(a),cur:a.cur,balance:a.balance}:null}
// Balance text for the Pay-from control (no trailing currency code: kept short).
const balTxt=s=>!s||s.kind==='card'?'':sym(s.cur)+m(s.balance);
// Visible label of a Pay-from field: name truncates with ellipsis, balance never does.
function fromLbl(sel){const f=sel.closest('.fromf');if(!f)return;const o=sel.options[sel.selectedIndex],s=srcOf(sel.value);
  f.querySelector('.fn').textContent=s?(s.short||s.label):(o?o.textContent:'');f.querySelector('.fb').textContent=balTxt(s);f.title=o?o.textContent:''}
function fillFrom(sel,{wallet:w,card}){const prev=sel._user;
  sel.innerHTML=(accounts.length?`<optgroup label="Linked banks">${accounts.map(a=>`<option value="${a.id}">${esc(accShort(a))} · ${sym(a.cur)}${m(a.balance)}</option>`).join('')}</optgroup>`:'')+
   (w?`<option value="${WAL}">islandwise balance · B$${m(wallet)}</option>`:'')+(card?`<option value="${CARD}">Debit card (demo)</option>`:'')+`<option value="${NEW}">＋ Link a new bank…</option>`;
  const has=v=>[...sel.options].some(o=>o.value===v);
  sel.value=prev&&prev!==NEW&&has(prev)?prev:accounts.length?accounts[0].id:w&&wallet>0?WAL:card?CARD:sel.options[0].value; sel._prev=sel.value;fromLbl(sel)}
function bindFrom(sel,after){sel.onchange=()=>{fromLbl(sel);if(sel.value!==NEW){sel._prev=sel._user=sel.value;after(true);return}
  openLink(null,acc=>{refreshAll();if(acc)sel._user=acc.id;sel.value=acc?acc.id:(sel._prev||sel.options[0].value);if(sel.value===NEW)sel.value=sel.options[0].value;sel._prev=sel.value;fromLbl(sel);after(true)})}}

/* ---------- Send modal ---------- */
let step=1,mode='bank';const modal=$('#modal');
function show(n){step=n;$$('#modal .view').forEach(v=>v.hidden=+v.dataset.step!==n);$$('.prog i').forEach((p,i)=>p.classList.toggle('on',i<n));$('.prog').style.visibility=n===4?'hidden':''}
function mcalc(){const a=+$('#mSend').value||0,f=fee(a),s=sym(cur);$('#mGet').value=m(Math.max(a-f,0)*RATE);$('#mFeeTxt').textContent=`Fee ${s}${m(f)} ${cur} (${s}0.99 + 0.37%) · `+(cur==='USD'?'1 USD = 1.0000 BSD (BSD pegged 1:1 to USD)':'Domestic — no currency conversion')+' · Arrives in seconds';fromHint()}
function fromHint(){const s=srcOf($('#mFrom').value),a=+$('#mSend').value||0,t=$('#mFromTxt');if(!s||!t)return;
  if(s.kind==='card'){t.className='small';t.textContent='Simulated card charge · no balance check.';return}
  const short=a>s.balance;t.className='small '+(short?'bad':'ok');
  t.textContent=`Available ${money(s.balance,s.cur)}`+(s.cur!==cur?` · debited 1:1 at the BSD/USD peg`:'')+(short?` · insufficient for ${money(a,cur)}`:'')}
$('#mSend').oninput=mcalc;
// Send currency follows the selected Pay-from source (BSD account -> BSD, USD account -> USD).
// Card has no currency, so the toggle is left alone. The user can still toggle manually afterwards.
function syncCur(){const s=srcOf($('#mFrom').value);if(s&&s.cur&&s.cur!==cur)setCur(s.cur)}
bindFrom($('#mFrom'),()=>{syncCur();fromHint();$('#e1').textContent=''});
function populateRecipientBanks(){$('#rBank').innerHTML=BANKS.map(b=>`<option value="${b.code}">${esc(b.name)}</option>`).join('')}
$$('[data-open]').forEach(b=>b.onclick=()=>{const v=+$('#cSend').value;if(v>0)$('#mSend').value=v;fillFrom($('#mFrom'),{wallet:true,card:true});syncCur();mcalc();show(1);modal.hidden=false});
const close=()=>modal.hidden=true;$('#close').onclick=close;modal.onclick=e=>{if(e.target===modal)close()};
document.onkeydown=e=>{if(e.key!=='Escape')return;if(!lm.hidden){lCb&&lCb(null);lCb=null;closeLink()}else if(!am.hidden)am.hidden=true;else close()};
$$('.tab').forEach(t=>t.onclick=()=>{mode=t.dataset.m;$$('.tab').forEach(x=>x.classList.toggle('on',x===t));$('#mBank').hidden=mode!=='bank';$('#mWise').hidden=mode==='bank'});
function valid(){if(step===1){const a=+$('#mSend').value,s=srcOf($('#mFrom').value);let e=a<1?`Enter at least ${sym(cur)}1.`:a>50000?`Maximum is ${sym(cur)}50,000 per transfer.`:'';
  if(!e&&!s)e='Choose where to pay from.';else if(!e&&a>s.balance)e=`Insufficient funds in ${s.label} (${money(s.balance,s.cur)} available). Pick another source or add money.`;
  $('#e1').textContent=e;return!e}
 let e='';if($('#rName').value.trim().length<2)e='Enter the recipient’s full name.';else if(mode==='bank'&&!/^\d{7,12}$/.test($('#rAcct').value.trim()))e='Account number must be 7–12 digits.';else if(mode==='wise'&&!/(^\S+@\S+\.\S+$)|(^\+?[\d\s-]{7,}$)/.test($('#rContact').value.trim()))e='Enter a valid email or phone.';$('#e2').textContent=e;return!e}
const toLabel=()=>mode==='bank'?`${bankBy($('#rBank').value).name} ••${$('#rAcct').value.trim().slice(-4)}`:$('#rContact').value.trim();
function review(){const a=+$('#mSend').value,f=fee(a),s=srcOf($('#mFrom').value);
 const rows=[['You send',money(a,cur)],['Fee',money(f,cur)],['Currency',cur==='USD'?'From USD → To BSD · 1:1 peg':'From BSD → To BSD · no conversion'],['Pay from',s.label],['Recipient',$('#rName').value.trim()],['To',toLabel()],['They get','B$'+m((a-f)*RATE)+' BSD'],['Arrives','⚡ In seconds']];
 $('#rev').innerHTML=`<li class="flow"><span class="fp"></span><i>→</i><span class="ft"></span></li>`+rows.map(()=>`<li><span></span><b></b></li>`).join('');
 const fp=$('#rev .fp'),ft=$('#rev .ft'),to=toLabel(),toS=mode==='bank'?`${bankBy($('#rBank').value).short} ••${$('#rAcct').value.trim().slice(-4)}`:to;
 fp.textContent=s.kind==='bank'?`${bankBy(s.acc.bank)?.short||s.acc.bank} ••${s.acc.mask}`:s.label;fp.title=s.label;ft.textContent=toS;ft.title=to;
 $$('#rev li:not(.flow)').forEach((li,i)=>{li.querySelector('span').textContent=rows[i][0];li.querySelector('b').textContent=rows[i][1]})}
$$('[data-next]').forEach(b=>b.onclick=()=>{if(!valid())return;if(step===2)review();show(step+1)});
$$('[data-back]').forEach(b=>b.onclick=()=>show(step-1));
$('#go').onclick=function(){const a=+$('#mSend').value,s=srcOf($('#mFrom').value);if(s&&a>s.balance){show(1);valid();return}
 this.disabled=true;this.innerHTML='<span class="spin"></span> Sending…';setTimeout(()=>{
  if(s.kind==='bank'){s.acc.balance=+(s.acc.balance-a).toFixed(2)}else if(s.kind==='wallet'){wallet=+(wallet-a).toFixed(2)}persist();refreshAll();
  $('#doneTxt').textContent=`${$('#rName').value.trim()} just received B$${m((a-fee(a))*RATE)} BSD ${mode==='bank'?'in their Bahamas account':'in their islandwise wallet'}. Paid from ${s.label}.`;$('#ref').textContent='Ref #IW-'+Math.random().toString(36).slice(2,10).toUpperCase()+' · simulated';show(4);this.disabled=false;this.innerHTML='⚡ Send instantly'},1400)};
$('#again').onclick=()=>{close();['#rName','#rAcct','#rContact'].forEach(s=>$(s).value='')};

/* ---------- Add money (pull from linked bank into wallet) ---------- */
const am=$('#addModal');
function ashow(n){$$('#addModal [data-a]').forEach(v=>v.hidden=+v.dataset.a!==n)}
function aHint(){const s=srcOf($('#aFrom').value),a=+$('#aAmt').value||0;if(!s)return;$('#aCur').textContent=s.cur||'BSD';
 const short=a>s.balance;$('#aFromTxt').className='small '+(short?'bad':'ok');$('#aFromTxt').textContent=`Available ${money(s.balance,s.cur)}`+(short?' · insufficient':'')}
function openAdd(){if(!accounts.length){openLink(null,acc=>{if(acc)openAdd()});return}
 fillFrom($('#aFrom'),{});$('#aErr').textContent='';ashow(1);aHint();renderWallet();am.hidden=false}
bindFrom($('#aFrom'),aHint);$('#aAmt').oninput=aHint;
$('#aGo').onclick=function(){const s=srcOf($('#aFrom').value),a=+$('#aAmt').value;let e='';
 if(!s||s.kind!=='bank')e='Choose a linked bank.';else if(!(a>=1))e='Enter at least 1.00.';else if(a>10000)e='Demo limit is 10,000 per top-up.';else if(a>s.balance)e=`Insufficient funds — ${money(s.balance,s.cur)} available.`;
 $('#aErr').textContent=e;if(e)return;this.disabled=true;this.innerHTML='<span class="spin"></span> Pulling from bank…';
 setTimeout(()=>{s.acc.balance=+(s.acc.balance-a).toFixed(2);wallet=+(wallet+a*RATE).toFixed(2);persist();refreshAll();
  $('#aOk').textContent=`${money(a,s.cur)} pulled from ${s.label}. Your islandwise balance is now B$${m(wallet)} BSD.`;ashow(2);this.disabled=false;this.textContent='Add money'},1200)};
$('#aDone').onclick=()=>am.hidden=true;am.querySelector('[data-xa]').onclick=()=>am.hidden=true;am.onclick=e=>{if(e.target===am)am.hidden=true};
$$('[data-add]').forEach(b=>b.onclick=openAdd);
$('#bReset').onclick=()=>{if(!confirm('Remove all simulated linked banks and reset your demo balance?'))return;accounts=[];wallet=0;$('#mFrom')._user=$('#aFrom')._user=null;persist();refreshAll();fillFrom($('#mFrom'),{wallet:true,card:true})};

/* ---------- init ---------- */
function refreshAll(){renderWallet();renderBanks();$('#bReset').hidden=!accounts.length&&!wallet;
 if(!modal.hidden){fillFrom($('#mFrom'),{wallet:true,card:true});fromHint()}if(!am.hidden){fillFrom($('#aFrom'),{});aHint()}}
populateRecipientBanks();fillFrom($('#mFrom'),{wallet:true,card:true});refreshAll();
