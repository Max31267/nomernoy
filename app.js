import {encodeSave,decodeSave,previousSave,replaceSave} from './transfer.mjs?v=20261014-1';
import {ReelAudio} from './audio.mjs?v=20261013-7';
import {LETTERS,RARITIES,CASES,ACHIEVEMENTS,MARKET,SERIES_RULES,plateText,regionName,progress,roll,sell,buy,claimAchievement,claimDaily,localDay,loadState,saveState} from './game.mjs?v=20261013-9';

const icons={
  spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  bag:'<path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
  trophy:'<path d="M8 3h8v7a4 4 0 0 1-8 0V3Z"/><path d="M8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 2v5m-4 2h8"/>',
  wallet:'<path d="M20 8V5H6a3 3 0 0 0 0 6h15v8H6a3 3 0 0 1-3-3V8"/><path d="M21 11h-6v5h6m-3-2.5h.01"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 .5c0 2-2.5 2-2.5 4m0 3h.01"/>',
  flag:'<path d="M5 21V4m0 0c5-4 9 4 14 0v10c-5 4-9-4-14 0"/>',
  sound:'<path d="m11 4-5 4H3v8h3l5 4V4Zm5 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  mute:'<path d="m11 4-5 4H3v8h3l5 4V4Zm6 5 5 6m0-6-5 6"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0"/>',
  bellOff:'<path d="m3 3 18 18M6.5 6.5A6 6 0 0 0 6 8c0 7-3 7-3 9h14M10 2.3A6 6 0 0 1 18 8c0 2.2.3 3.7.8 4.8M10 20a2 2 0 0 0 4 0"/>',
  dice:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" stroke-width="3"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  crown:'<path d="m3 6 4 4 5-6 5 6 4-4-2 12H5L3 6Zm3 15h12"/>',
  diamond:'<path d="m3 8 4-5h10l4 5-9 13L3 8Zm0 0h18M7 3l5 18 5-18"/>',
  gift:'<path d="M3 8h18v4H3zm2 4v9h14v-9M12 8v13"/><path d="M12 8C5 8 5 2 8 2s4 6 4 6Zm0 0c7 0 7-6 4-6s-4 6-4 6Z"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  check:'<path d="m5 12 4 4L20 5"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  search:'<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
  tag:'<path d="M3 3h8l10 10-8 8L3 11V3Z"/><circle cx="7.5" cy="7.5" r=".8"/>',
  bolt:'<path d="m13 2-9 12h7l-1 8 10-13h-7l1-7Z"/>',
  key:'<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-5-5 3-3m-1 5 3-3"/>',
  chart:'<path d="M3 3v18h18M7 15l5-6 4 3 5-7"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  car:'<path d="m5 10 2-6h10l2 6M3 17v-5l2-2h14l2 2v5H3Zm1 0v3m16-3v3M7 13h.01M17 13h.01"/>',
  transfer:'<path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4"/>',
  copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>'
};
const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.spark}</svg>`;
const $=(selector)=>document.querySelector(selector);
const money=(n)=>Math.round(n).toLocaleString('ru-RU');
const esc=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let storage;try{storage=localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw new Error('storage');}};}
let state=loadState(storage), page='roll',selectedCase='standard',spinning=false,result=null,search='',filter='all',sort='new',saveWarning=false;
const reelAudio=new ReelAudio(()=>state.sound);
const demoPlate={letters:['А','А','А'],digits:'777',region:'777',rarity:'legendary',value:2450000,tags:['Три одинаковые буквы','Три одинаковые цифры']};
const routes=[{id:'roll',label:'Выбить номер',short:'Выбить',icon:'spark'},{id:'garage',label:'Мой гараж',short:'Гараж',icon:'grid'},{id:'market',label:'Авторынок',short:'Рынок',icon:'bag'},{id:'achievements',label:'Достижения',short:'Награды',icon:'trophy'}];

function save(){try{saveState(storage,state);}catch{if(!saveWarning){toast('Браузер не разрешил сохранение. Прогресс доступен до закрытия страницы.','error');saveWarning=true;}}updateHeader();}
function toast(message,type='success'){if(!state.notifications)return;const el=document.createElement('div');el.className=`toast ${type}`;el.innerHTML=`${icon(type==='error'?'help':'check')}<span>${esc(message)}</span>`;$('#toasts').append(el);while($('#toasts').children.length>3)$('#toasts').firstElementChild.remove();setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),250);},4500);}
function updateHeader(){const balance=$('#balance');balance.innerHTML=`${money(state.balance)} <span>₽</span>`;$('#sound-button').innerHTML=icon(state.sound?'sound':'mute');$('#sound-button').setAttribute('aria-label',state.sound?'Выключить звук':'Включить звук');$('#sound-button').title=state.sound?'Выключить звук':'Включить звук';const notifications=$('#notifications-button');notifications.innerHTML=icon(state.notifications?'bell':'bellOff');notifications.setAttribute('aria-pressed',String(state.notifications));notifications.title=state.notifications?'Отключить уведомления':'Включить уведомления';$('#mission-progress').style.width=`${Math.min(state.spins/5,1)*100}%`;$('#mission-count').textContent=`${Math.min(state.spins,5)} из 5 номеров`;const claim=$('#mission-claim');claim.disabled=state.spins<5||state.claimed.includes('five');claim.textContent=state.claimed.includes('five')?'Получено ✓':'Забрать ↗';$('#wallet-bonus').classList.toggle('available',state.lastDaily!==localDay());}
function nav(){routes.forEach(r=>{const count=r.id==='garage'?`<span class="nav-count">${state.collection.length}</span>`:'';const active=r.id===page;$('#desktop-nav').insertAdjacentHTML('beforeend',`<a href="#${r.id}" class="nav-link ${active?'active':''}" ${active?'aria-current="page"':''}>${icon(r.icon)}<span>${r.label}</span>${count}${active?'<span class="nav-active-dot"></span>':''}</a>`);$('#mobile-nav').insertAdjacentHTML('beforeend',`<a href="#${r.id}" class="mobile-nav-link ${active?'active':''}" ${active?'aria-current="page"':''}>${icon(r.icon)}<span>${r.short}</span></a>`);});}
function rarity(p){return `<span class="rarity" style="--rarity:${RARITIES[p.rarity].color}"><i></i>${RARITIES[p.rarity].label}</span>`;}
function plate(p,extra=''){
 const glyph=(c,cl='')=>`<span class="plate-slot ${cl}" data-char="${c}"><span class="reel-track"><span>${c}</span></span></span>`;
 return `<div class="license-plate ${extra}" role="img" aria-label="Автономер ${plateText(p)}"><span class="plate-bolt bolt-left"></span><div class="plate-main">${glyph(p.letters[0],'letter first-letter')}${[...p.digits].map((n,i)=>glyph(n,`digit digit-${i}`)).join('')}${glyph(p.letters[1],'letter suffix')}${glyph(p.letters[2],'letter')}</div><div class="plate-region"><div class="region-number">${[...p.region].map(c=>glyph(c,'region-digit')).join('')}</div><div class="country">RUS <span class="rus-flag"></span></div></div><span class="plate-bolt bolt-right"></span></div>`;
}
function card(p,mode='garage'){
 const market=mode==='market',sold=mode==='history';return `<article class="number-card" style="--rarity:${RARITIES[p.rarity].color}"><div class="number-card-top">${rarity(p)}${market||sold?`<span class="offer-label">${sold?'ПРОДАН':'ИГРОВОЙ ЛОТ'}</span>`:`<button class="icon-button favorite ${p.favorite?'is-favorite':''}" data-favorite="${p.id}" aria-label="${p.favorite?'Убрать из избранного':'В избранное'}" aria-pressed="${Boolean(p.favorite)}">${icon('heart')}</button>`}</div>${plate(p,'mini-plate')}<p class="card-description">${esc(p.tags[0])}</p><div class="number-card-bottom"><div><small>${market?'ЦЕНА':'ОЦЕНКА'}</small><strong>${money(market?p.price:p.value)} <span>₽</span></strong></div>${sold?'<span class="sold-label">'+icon('check')+' Продан</span>':`<button class="${market?'buy-button':'sell-button'}" data-${market?'buy':'sell'}="${p.id}" ${!market&&p.favorite?'disabled':''}>${market?'Купить':'Продать'} ${icon('arrow')}</button>`}</div></article>`;
}
function pageHead(kicker,title,desc,aside=''){return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${desc}</p></div>${aside}</div>`;}
function resultActions(p){
 const owned=state.collection.find(n=>n.id===p.id);
 return `<div class="result-actions">${owned?`<button class="quick-sell-button" data-quick-sell="${p.id}" ${owned.favorite?'disabled':''}>${icon('tag')}<span>Продать сразу<strong>+${money(p.value)} ₽</strong></span>${icon('arrow')}</button>`:`<div class="result-sold" role="status">${icon('check')} Продан · +${money(p.value)} ₽</div>`}<button class="result-garage-button" id="result-garage">${icon('grid')} ${owned?'Оставить в гараже':'Открыть гараж'}</button></div>`;
}

function render(){
 $('#desktop-nav').innerHTML='';$('#mobile-nav').innerHTML='';nav();$('#page-breadcrumb').textContent=routes.find(r=>r.id===page).label;
 $('#main').innerHTML=page==='roll'?rollView():page==='garage'?collectionView():page==='market'?marketView():achievementView();
 document.title=`${routes.find(r=>r.id===page).label} — Номерной`;updateHeader();bindPage();
 if(page==='garage'||page==='market')updateCards();
}
function rollView(){
 const box=CASES.find(c=>c.id===selectedCase),p=result||demoPlate;
 const recent=state.history.length?state.history.slice(0,3):state.collection.slice(0,3);
 return `${pageHead('УДАЧА НА ТВОЕЙ СТОРОНЕ','У каждого номера<br>есть <em>свой характер.</em>','Крути. Находи редкие сочетания. Собирай свою историю.',`<div class="session-badge">${icon('spark')}<span>ТВОЯ КОЛЛЕКЦИЯ УДАЧИ<b>Без доната. Только игра.</b></span></div>`)}
 <div class="play-layout"><section class="roll-area"><div class="case-selector" role="group" aria-label="Режим выбивания">${CASES.map((c,i)=>`<button data-case="${c.id}" class="case-option ${selectedCase===c.id?'selected':''}" aria-pressed="${selectedCase===c.id}">${icon(['dice','diamond','crown'][i])}<span><b>${c.name}</b><small><span>${money(c.cost)} ₽</span><span class="case-unit"> / спин</span></small></span>${selectedCase===c.id?'<i class="case-selected-dot"></i>':''}</button>`).join('')}</div>
 <div class="spin-stage ${result?`result-${p.rarity}`:''}"><div class="stage-top"><span><i></i> ${result?'ТВОЯ НОВАЯ НАХОДКА':'СЛЕДУЮЩИЙ МОЖЕТ БЫТЬ ТВОИМ'}</span><button class="odds-button" id="odds-button">Шансы ${icon('help')}</button></div><div class="stage-visual"><div class="stage-aura"></div><div class="stage-rings"></div>${result?`<div class="drop-price" id="drop-price" style="--rarity:${RARITIES[p.rarity].color}" aria-live="polite"><span>СТОИМОСТЬ НОМЕРА</span><strong>${money(p.value)} <small>₽</small></strong></div>`:''}<div class="plate-meta" id="plate-meta">${rarity(p)}${result?`<span class="plate-location">${regionName(p.region)} <span class="region-code">· ${p.region}</span></span>`:'<span>КРАСИВОЕ СОВПАДЕНИЕ</span>'}</div><div id="hero-plate">${plate(p,'hero-plate')}</div><div class="plate-caption" id="plate-caption">${result?p.tags.map(t=>`<span>${esc(t)}</span>`).join(''):'Три буквы. Три цифры. Миллион историй.'}</div></div><div class="stage-actions">${result?resultActions(p):''}<button id="spin-button" class="spin-button">${icon('dice')}<span>Выбить номер</span><span class="spin-cost">${money(box.cost)} ₽ ${icon('arrow')}</span></button><div class="spin-bottom"><button class="text-button" id="series-button">Спецсерии и оценка ${icon('help')}</button>${result?'':`<span class="keyboard-hint"><kbd>space</kbd> чтобы крутить</span>`}</div></div></div>
 <div class="stats-strip"><div>${icon('dice')}<span>Всего спинов<strong>${money(state.spins)}</strong></span></div><div>${icon('grid')}<span>В гараже<strong>${state.collection.length} <small>ном.</small></strong></span></div><div>${icon('chart')}<span>Продано на сумму<strong>${money(state.earned)} <small>₽</small></strong></span></div></div></section>
 <aside class="right-rail"><section class="record-card"><div class="rail-heading"><span>${icon('trophy')} ЛИЧНЫЙ РЕКОРД</span><span class="tiny-dot"></span></div><h3>${state.best?'Твой лучший<br>экземпляр.':'Большие находки<br>ещё впереди.'}</h3><div class="record-plate-wrap">${plate(state.best||demoPlate,'small-plate')}</div><div class="record-value"><span>${state.best?RARITIES[state.best.rarity].label:'Вдохновение дня'}</span><strong>${state.best?money(state.best.value)+' ₽':'А 777 АА · 777'}</strong></div><button class="rail-link" id="record-button">${state.best?'Посмотреть номер':'Что делает номер редким?'} ${icon('arrow')}</button></section>
 <section class="daily-card"><span class="daily-icon">${icon('gift')}</span><span class="eyebrow">МАЛЕНЬКАЯ ТРАДИЦИЯ</span><h3>Новый день.<br>Новая удача.</h3><p>Заходи каждый день<br>и забирай игровые ₽.</p><button id="daily-button" class="daily-button" ${state.lastDaily===localDay()?'disabled':''}>${state.lastDaily===localDay()?'Сегодня получено ✓':'+25 000 ₽ забрать'} ${icon(state.lastDaily===localDay()?'check':'arrow')}</button></section>
 <div class="rail-note">${icon('heart')} <span>Самые красивые номера —<br>те, которые нравятся тебе.</span></div></aside></div>
 <section class="recent-section"><div class="section-heading"><div><h2>${state.history.length?'Последние находки':'Начало твоей коллекции'}<span>${state.history.length?'ТВОЯ ИСТОРИЯ':'3 НОМЕРА В ПОДАРОК'}</span></h2></div><a class="text-button" href="#garage">Весь гараж ${icon('arrow')}</a></div><div class="recent-grid">${recent.map(p=>card({...p,favorite:state.collection.find(c=>c.id===p.id)?.favorite||false},state.collection.some(c=>c.id===p.id)?'garage':'history')).join('')}</div></section>`;
}
function controls(market=false){return `<div class="collection-controls"><label class="search-box">${icon('search')}<input id="search-input" type="search" placeholder="Номер или регион…" aria-label="Поиск по номеру или региону" value="${esc(search)}" autocomplete="off"></label><div class="filter-scroll" role="group" aria-label="Фильтр номеров"><button data-filter="all" class="filter-chip ${filter==='all'?'active':''}">Все номера</button>${['rare','epic','legendary',...(!market?['favorites']:[])].map(k=>`<button data-filter="${k}" class="filter-chip ${filter===k?'active':''}">${k==='favorites'?icon('heart'):''}${k==='favorites'?'Избранное':RARITIES[k].label.replace('Редкий','Редкие').replace('Эпический','Эпические').replace('Легендарный','Легенды')}</button>`).join('')}</div><label class="sort-control"><span class="sr-only">Сортировка</span><select id="sort-select"><option value="new" ${sort==='new'?'selected':''}>${market?'По умолчанию':'Сначала новые'}</option><option value="expensive" ${sort==='expensive'?'selected':''}>Сначала дорогие</option><option value="cheap" ${sort==='cheap'?'selected':''}>Сначала дешёвые</option><option value="rarity" ${sort==='rarity'?'selected':''}>По редкости</option></select></label></div>`;}
function collectionView(){const total=state.collection.reduce((s,p)=>s+p.value,0);return `${pageHead('БОЛЬШЕ, ЧЕМ ПРОСТО ЦИФРЫ','Твой <em>гараж.</em>','Сохраняй любимые. Продавай лишние. Освобождай место для легенд.',`<a class="outline-button" href="#roll">${icon('spark')} Пополнить коллекцию ${icon('arrow')}</a>`)}<div class="summary-cards"><div><span>${icon('grid')} В коллекции</span><strong>${state.collection.length}<small>номеров</small></strong></div><div><span>${icon('wallet')} Стоимость гаража</span><strong>${money(total)}<small>₽</small></strong></div><div><span>${icon('heart')} Избранное</span><strong>${state.collection.filter(p=>p.favorite).length}<small>номеров</small></strong></div></div>${controls()}<div class="results-label" id="results-label"></div><div class="collection-grid" id="collection-grid"></div>`;}
function marketView(){return `${pageHead('КРАСОТА ИМЕЕТ СВОЮ ЦЕНУ','Найди <em>свой номер.</em>','Готовые сочетания для твоей коллекции. Все сделки — за игровые ₽.',`<div class="market-badge">${icon('bag')} ИГРОВОЙ МАГАЗИН</div>`)}<div class="market-banner"><div class="market-banner-icon">${icon('tag')}</div><div><h3>У каждой находки есть цена.</h3><p>Покупай здесь, а продавай номера из своего гаража по их оценке.</p></div><a href="#garage" class="text-button">Продать номер ${icon('arrow')}</a></div>${controls(true)}<div class="results-label" id="results-label"></div><div class="collection-grid" id="collection-grid"></div>`;}
function achievementView(){const complete=ACHIEVEMENTS.filter(a=>state.claimed.includes(a.id)).length;return `${pageHead('КАЖДЫЙ ШАГ СЧИТАЕТСЯ','На пути <em>к легенде.</em>','Собирай впечатления, открывай достижения и получай награды.',`<div class="achievement-total">${icon('trophy')}<strong>${complete}<span> / ${ACHIEVEMENTS.length}</span></strong><small>НАГРАД ПОЛУЧЕНО</small></div>`)}<div class="achievements-grid">${ACHIEVEMENTS.map(a=>{const n=progress(state,a),claimed=state.claimed.includes(a.id),done=n>=a.goal;return `<article class="achievement-card ${done?'completed':''}"><div class="achievement-icon">${icon(a.icon)}</div><span class="achievement-status">${claimed?'ПОЛУЧЕНО':done?'ОТКРЫТО':'В ПРОЦЕССЕ'}</span><h3>${a.title}</h3><p>${a.desc}</p><div class="achievement-progress"><div class="progress-track"><i style="width:${n/a.goal*100}%"></i></div><span>${n} / ${a.goal}</span></div><button class="reward-button" data-claim="${a.id}" ${!done||claimed?'disabled':''}>${claimed?icon('check')+' Награда получена':done?'Забрать +'+money(a.reward)+' ₽':icon('lock')+' '+money(a.reward)+' ₽'}</button></article>`;}).join('')}</div>`;}

function updateCards(){let list=page==='garage'?[...state.collection]:MARKET.filter(p=>!state.purchased.includes(p.id));const term=search.replace(/\s/g,'').toUpperCase();if(term)list=list.filter(p=>plateText(p).replace(/\s/g,'').includes(term));if(filter!=='all')list=list.filter(p=>filter==='favorites'?p.favorite:p.rarity===filter);if(sort==='expensive')list.sort((a,b)=>(b.price||b.value)-(a.price||a.value));if(sort==='cheap')list.sort((a,b)=>(a.price||a.value)-(b.price||b.value));if(sort==='rarity')list.sort((a,b)=>RARITIES[b.rarity].rank-RARITIES[a.rarity].rank);if(sort==='new'&&page==='garage')list.sort((a,b)=>b.createdAt-a.createdAt);$('#results-label').textContent=`${page==='garage'?'В гараже':'Доступно'}: ${list.length} ${list.length===1?'номер':'номеров'}`;$('#collection-grid').innerHTML=list.length?list.map(p=>card(p,page)).join(''):`<div class="empty-state">${icon(search||filter!=='all'?'search':'grid')}<h3>${search||filter!=='all'?'Таких номеров пока нет':'Здесь начинается коллекция'}</h3><p>${search||filter!=='all'?'Попробуй другой запрос или сбрось фильтры.':'Выбей новый номер — и он появится в твоём гараже.'}</p>${search||filter!=='all'?'<button class="outline-button" id="clear-filters">Сбросить фильтры</button>':'<a class="outline-button" href="#roll">Выбить номер ↗</a>'}</div>`;$('#clear-filters')?.addEventListener('click',()=>{search='';filter='all';render();});}
function bindPage(){
 document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>{if(spinning)return;selectedCase=b.dataset.case;render();}));
 $('#spin-button')?.addEventListener('click',spin);
 $('#daily-button')?.addEventListener('click',daily);
 $('#record-button')?.addEventListener('click',()=>state.best?showPlate(state.best):showOdds());
 $('#odds-button')?.addEventListener('click',showOdds);
 $('#series-button')?.addEventListener('click',showSeries);
 $('#result-garage')?.addEventListener('click',()=>location.hash='garage');
 $('#search-input')?.addEventListener('input',e=>{search=e.target.value;updateCards();});
 $('#sort-select')?.addEventListener('change',e=>{sort=e.target.value;updateCards();});
 document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(c=>c.classList.toggle('active',c.dataset.filter===filter));updateCards();}));
}
async function spin(){
 if(spinning)return;const res=roll(state,selectedCase);if(res.error){toast(res.error,'error');return;}
 spinning=true;save();closeModal();const p=res.plate;const stage=$('.spin-stage');stage.classList.add('is-spinning');$('#spin-button').disabled=true;$('#spin-button').innerHTML=`${icon('dice','spinning-icon')}<span>Ловим удачу…</span><span class="spin-cost">${money(CASES.find(c=>c.id===selectedCase).cost)} ₽</span>`;
 document.querySelectorAll('[data-case],[data-quick-sell]').forEach(b=>b.disabled=true);if($('#drop-price'))$('#drop-price').innerHTML='<span>ИЩЕМ ТВОЁ СОЧЕТАНИЕ</span><strong>···</strong>';$('#plate-meta').innerHTML=`<span class="spinning-label">СОВПАДЕНИЯ НЕ СЛУЧАЙНЫ</span><span>КРУТИМ…</span>`;$('#plate-caption').textContent='У каждого символа — свой момент.';
 $('#hero-plate').innerHTML=plate(p,'hero-plate');playTone(280,.08);
 await animateReels($('#hero-plate'));result=p;spinning=false;render();playTone(RARITIES[p.rarity].rank>=3?880:560,.22);
 if(RARITIES[p.rarity].rank>=3)celebrate(p.rarity==='legendary');
 toast(`${RARITIES[p.rarity].label} номер ${plateText(p)} — уже в гараже`);
 const unlocked=ACHIEVEMENTS.filter(a=>!state.claimed.includes(a.id)&&progress(state,a)>=a.goal);if(unlocked.length)$('#mission-claim').classList.add('attention');
}
function animateReels(root){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduced)return new Promise(resolve=>setTimeout(resolve,100));
 const animations=[...root.querySelectorAll('.plate-slot')].map((slot,i)=>{
 const final=slot.dataset.char,chars=slot.classList.contains('letter')?LETTERS:'0123456789';const count=24+i*3;
 const seq=Array.from({length:count},()=>chars[Math.floor(Math.random()*chars.length)]);seq.push(final);
 const track=slot.querySelector('.reel-track');track.innerHTML=seq.map(c=>`<span>${c}</span>`).join('');const h=slot.getBoundingClientRect().height;
 const anim=track.animate([{transform:'translateY(0)'},{transform:`translateY(-${count*h}px)`}],{duration:1250+i*130,easing:'cubic-bezier(.12,.65,.12,1)',fill:'forwards'});
 const stopSound=reelAudio.watch(anim,count,i);
 return anim.finished.then(()=>{stopSound(true);track.innerHTML=`<span>${final}</span>`;anim.cancel();},()=>{stopSound(false);track.innerHTML=`<span>${final}</span>`;});
 });return Promise.all(animations);
}
function playTone(freq,duration){reelAudio.tone(freq,duration);}
function celebrate(legend=false){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const root=$('#confetti');for(let i=0;i<42;i++){const el=document.createElement('i');el.style.cssText=`--x:${Math.random()*100}vw;--d:${Math.random()*.8}s;--r:${Math.random()*720}deg;background:${legend?['#e7c76f','#fff2c8','#c5a149'][i%3]:['#d7f86b','#c2a2f6','#f1f2e8'][i%3]}`;root.append(el);setTimeout(()=>el.remove(),3800);}}

function openModal(html){$('#modal-content').innerHTML=`<button class="modal-close icon-button" id="modal-close" aria-label="Закрыть">${icon('close')}</button>${html}`;if(!$('#modal').open)$('#modal').showModal();$('#modal-close').addEventListener('click',closeModal);}
function closeModal(){$('#modal').close();}
function showPlate(p){openModal(`<div class="modal-symbol">${icon('trophy')}</div><div class="eyebrow">ТВОЙ ЛИЧНЫЙ РЕКОРД</div><h2>Номер с историей.</h2><div class="modal-plate">${plate(p)}</div>${rarity(p)}<div class="modal-price">${money(p.value)} <span>₽</span></div><div class="modal-tags">${p.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div><p class="modal-note">Рекорд сохраняется, даже если номер продан.</p>`);}
function showOdds(){const box=CASES.find(c=>c.id===selectedCase);openModal(`<div class="modal-symbol">${icon('dice')}</div><div class="eyebrow">ПОНЯТНЫЕ ПРАВИЛА</div><h2>Удача в цифрах.</h2><p>Режим «${box.name}» · ${money(box.cost)} игровых ₽ за спин. Каждый спин независим.</p><div class="odds-list">${Object.entries(RARITIES).map(([k,r],i)=>`<div>${rarity({rarity:k})}<span class="odds-bar"><i style="width:${box.weights[i]}%;background:${r.color}"></i></span><b>${box.weights[i].toLocaleString('ru-RU')}%</b></div>`).join('')}</div><div class="info-note">${icon('spark')}<span>Редкость определяет тип сочетания. Известная спецсерия и её регион дополнительно повышают оценку: даже обычные цифры в серии АМР могут стоить дорого.</span></div><button class="outline-button modal-action" id="odds-series">Спецсерии и цены ${icon('arrow')}</button>`);$('#odds-series').addEventListener('click',showSeries);}
function showSeries(){
 openModal(`<div class="modal-symbol">${icon('crown')}</div><div class="eyebrow">БУКВЫ ТОЖЕ ИМЕЮТ ЗНАЧЕНИЕ</div><h2>Особая история номера.</h2><p>Оценка учитывает буквы, точный код региона и цифры. Например, АМР 97 — от 3 500 000 ₽, АМР 77 — от 850 000 ₽, АМР в других регионах — от 120 000 ₽. Красивые цифры увеличивают надбавку.</p><label class="search-box series-search">${icon('search')}<input id="series-search" type="search" placeholder="АМР, ЕКХ или код региона…" aria-label="Поиск спецсерии"></label><div class="series-list" id="series-list"></div><p class="modal-note">Цены — игровые. Справочник отражает известные исторические и коллекционные сочетания; он не определяет нынешнего владельца или ведомство. За пределами указанного региона популярные буквы получают меньшую коллекционную надбавку.</p><p class="series-sources">Источники: <a href="https://nomer.club/specserii" target="_blank" rel="noopener noreferrer">справочник серий</a>, <a href="https://www.rbcautonews.ru/news/698f1dff9a7947868af70d04" target="_blank" rel="noopener noreferrer">РБК Авто</a>.</p>`);
 const draw=()=>{const term=$('#series-search').value.trim().toUpperCase(),rules=SERIES_RULES.filter(r=>!term||r.code.includes(term)||r.regions.some(c=>c.includes(term)));$('#series-list').innerHTML=rules.length?rules.map(r=>`<div class="series-row"><span><strong>${r.code}</strong><small>Регион ${r.regions.join(', ')}</small></span><b>от ${money(r.minimum)} ₽</b></div>`).join(''):'<p>Такого сочетания в справочнике пока нет.</p>';};
 $('#series-search').addEventListener('input',draw);draw();
}
function showHelp(){openModal(`<div class="modal-symbol">${icon('key')}</div><div class="eyebrow">ДОБРО ПОЖАЛОВАТЬ В КЛУБ</div><h2>Твоя коллекция удачи.</h2><div class="help-steps"><div><b>01</b><span><strong>Выбивай номера</strong><p>Выбери режим и нажми «Выбить номер». Буквы, цифры и регион прокрутятся и остановятся на твоём сочетании.</p></span></div><div><b>02</b><span><strong>Собирай и продавай</strong><p>Каждая находка попадает в гараж. Продавай по игровой оценке или добавляй в избранное, чтобы защитить от продажи.</p></span></div><div><b>03</b><span><strong>Возвращайся за новым</strong><p>Ежедневно забирай 25 000 ₽ и выполняй достижения. На старте у тебя 150 000 ₽ и три подарочных номера.</p></span></div></div><p class="modal-note">Это бесплатная игра с виртуальной валютой. Номера не являются настоящими регистрационными знаками. Прогресс хранится только в этом браузере на этом устройстве. Для переноса на другое устройство используй «Перенести прогресс» внизу сайта или в статистике. Очистка данных браузера удаляет коллекцию. Рынок — игровой магазин, без других игроков.</p><button class="spin-button modal-action" id="help-done">Погнали ${icon('arrow')}</button>`);$('#help-done').addEventListener('click',closeModal);}
function showProfile(){openModal(`<div class="modal-symbol">${icon('car')}</div><div class="eyebrow">ТВОЙ ПУТЬ В КЛУБЕ</div><h2>Хороший вкус.<br>Красивая коллекция.</h2><div class="profile-stats"><div><span>Спинов</span><strong>${state.spins}</strong></div><div><span>В гараже</span><strong>${state.collection.length}</strong></div><div><span>Продано номеров</span><strong>${state.sold}</strong></div><div><span>Легенд выбито</span><strong>${state.legends}</strong></div></div><p class="modal-note">Прогресс автоматически сохраняется в этом браузере. Его можно перенести на другое устройство с помощью кода.</p><div class="profile-actions"><button class="spin-button" id="profile-transfer">${icon('transfer')} Перенести сохранение</button><button class="outline-button" id="profile-achievements">Посмотреть достижения ${icon('arrow')}</button></div>`);$('#profile-achievements').addEventListener('click',()=>{closeModal();location.hash='achievements';});$('#profile-transfer').addEventListener('click',()=>showTransfer());}

function transferStatus(element,message,error=false){element.textContent=message;element.dataset.kind=error?'error':'success';}
function transferSummary(saved,label){return `<div><span>${label}</span><strong>${money(saved.balance)} ₽</strong><small>${saved.collection.length} номеров · ${money(saved.spins)} спинов</small></div>`;}
function showTransfer(initial=''){
 openModal(`<div class="modal-symbol">${icon('transfer')}</div><div class="eyebrow">ПРОГРЕСС ВСЕГДА С ТОБОЙ</div><h2>Перенести сохранение.</h2><p>Скопируй код на этом устройстве и вставь его в игру на другом.</p><section class="transfer-section"><h3>Забрать сохранение</h3><p>${money(state.balance)} ₽ на балансе · ${state.collection.length} номеров в гараже</p><button class="spin-button transfer-copy" id="transfer-copy" disabled>${icon('copy')} Готовим код…</button><div id="transfer-export-manual" hidden><label for="transfer-export">Твой код сохранения</label><textarea id="transfer-export" class="transfer-input" rows="3" readonly spellcheck="false" aria-describedby="transfer-export-status"></textarea></div><p class="transfer-status" id="transfer-export-status" role="status"></p></section><form class="transfer-section" id="transfer-form"><h3>Загрузить сохранение</h3><label for="transfer-input">Код с другого устройства</label><textarea class="transfer-input" id="transfer-input" rows="4" placeholder="Вставь код NMR1… или старый текст из консоли" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="transfer-import-status" maxlength="3000000"></textarea><p class="transfer-hint">После проверки ты увидишь, какой прогресс будет загружен. Балансы и коллекции не складываются.</p><p class="transfer-status" id="transfer-import-status" role="status"></p><button class="outline-button transfer-load" id="transfer-load" type="submit">${icon('transfer')} Проверить и загрузить</button></form>${previousSave(storage)?'<button class="text-button transfer-restore" id="transfer-restore">Вернуть сохранение до последнего переноса ↗</button>':''}`);
 const form=$('#transfer-form'),input=$('#transfer-input'),status=$('#transfer-import-status');
 const copy=$('#transfer-copy'),exportStatus=$('#transfer-export-status');let code='';
 input.value=initial;
 encodeSave(state).then(value=>{if(!copy.isConnected)return;code=value;copy.disabled=false;copy.innerHTML=`${icon('copy')} Скопировать код сохранения`;}).catch(error=>{if(!copy.isConnected)return;copy.innerHTML=`${icon('copy')} Код недоступен`;transferStatus(exportStatus,error.message,true);});
 copy.addEventListener('click',async()=>{
  if(!code)return;
  try{
   if(!navigator.clipboard?.writeText)throw new Error('clipboard');
   await navigator.clipboard.writeText(code);
   if(copy.isConnected)transferStatus(exportStatus,'Код скопирован. Сохрани его и вставь на другом устройстве.');
  }catch{
   if(!copy.isConnected)return;
   $('#transfer-export-manual').hidden=false;const field=$('#transfer-export');field.value=code;field.focus();field.select();field.setSelectionRange(0,code.length);
   transferStatus(exportStatus,'Автокопирование недоступно. Код выделен — скопируй его вручную.');
  }
 });
 input.addEventListener('input',()=>{input.removeAttribute('aria-invalid');status.textContent='';});
 const preview=async(text,restore=false)=>{
  if(spinning){transferStatus(status,'Дождись окончания прокрутки номера.',true);return;}
  const load=$('#transfer-load');load.disabled=true;transferStatus(status,'Читаем сохранение…');
  try{
   const incoming=await decodeSave(text);
   if(!form.isConnected||!$('#modal').open)return;
   confirmTransfer(incoming,input.value,restore);
  }catch(error){if(form.isConnected){transferStatus(status,error.message,true);input.setAttribute('aria-invalid','true');}}
  finally{if(load.isConnected)load.disabled=false;}
 };
 form.addEventListener('submit',event=>{event.preventDefault();preview(input.value);});
 $('#transfer-restore')?.addEventListener('click',()=>preview(previousSave(storage)||'',true));
}
function confirmTransfer(incoming,original,restore=false){
 openModal(`<div class="modal-symbol">${icon('transfer')}</div><div class="eyebrow">ПРОВЕРЬ ПЕРЕД ЗАГРУЗКОЙ</div><h2>${restore?'Вернуть прежний прогресс?':'Загрузить это сохранение?'}</h2><div class="transfer-comparison">${transferSummary(state,'Сейчас на устройстве')}${transferSummary(incoming,restore?'Будет восстановлено':'Будет загружено')}</div><p>Текущий прогресс будет заменён. Его резервную копию можно вернуть в окне переноса.</p><p class="transfer-status" id="transfer-confirm-status" role="status"></p><div class="modal-buttons"><button class="outline-button" id="transfer-cancel">Назад</button><button class="spin-button" id="transfer-confirm">${restore?'Вернуть сохранение':'Заменить и загрузить'} ${icon('arrow')}</button></div>`);
 $('#transfer-cancel').addEventListener('click',()=>showTransfer(original));
 $('#transfer-confirm').addEventListener('click',()=>{
  const status=$('#transfer-confirm-status');
  if(spinning){transferStatus(status,'Дождись окончания прокрутки номера.',true);return;}
  try{replaceSave(storage,incoming,state);}
  catch{transferStatus(status,'Браузер не разрешил сохранить данные. Освободи место или разреши хранение данных сайта. Текущий прогресс не изменён.',true);return;}
  state=incoming;result=null;saveWarning=false;search='';filter='all';sort='new';$('#toasts').replaceChildren();$('#confetti').replaceChildren();reelAudio.setEnabled(state.sound);render();
  openModal(`<div class="modal-symbol">${icon('check')}</div><div class="eyebrow">ВСЁ НА МЕСТЕ</div><h2>${restore?'Прогресс восстановлен.':'Сохранение перенесено.'}</h2><p>${money(state.balance)} ₽ на балансе и ${state.collection.length} номеров в гараже. Можно продолжать игру.</p><p class="modal-note">Прежний прогресс остался в резервной копии в окне переноса.</p><button class="spin-button modal-action" id="transfer-done">Вернуться в игру ${icon('arrow')}</button>`);
  $('#transfer-done').addEventListener('click',closeModal);
 });
}

function completeSale(id){if(spinning){toast('Дождись остановки номера','error');return;}const res=sell(state,id);if(res.error){toast(res.error,'error');return;}closeModal();save();render();toast(`Номер продан. +${money(res.plate.value)} ₽ на балансе`);return true;}
function quickSell(id){if(completeSale(id))$('#spin-button')?.focus({preventScroll:true});}
function requestSell(id){if(spinning){toast('Дождись остановки номера','error');return;}const p=state.collection.find(p=>p.id===id);if(!p){toast('Этот номер уже продан','error');return;}if(p.favorite){toast('Сначала убери номер из избранного','error');return;}openModal(`<div class="modal-symbol">${icon('tag')}</div><div class="eyebrow">ХОРОШАЯ СДЕЛКА</div><h2>Передать эстафету?</h2><div class="modal-plate">${plate(p)}</div><p>Номер покинет гараж, а на баланс поступит <b class="bright">${money(p.value)} игровых ₽</b>.</p><div class="modal-buttons"><button class="outline-button" id="cancel-sale">Оставить себе</button><button class="spin-button" id="confirm-sale">Продать ${icon('arrow')}</button></div>`);$('#cancel-sale').addEventListener('click',closeModal);$('#confirm-sale').addEventListener('click',()=>completeSale(id));}
function requestBuy(id){if(spinning)return;const offer=MARKET.find(p=>p.id===id);if(!offer)return;if(state.balance<offer.price){toast('Не хватает игровых ₽. Продай номер или забери ежедневную награду.','error');return;}openModal(`<div class="modal-symbol">${icon('bag')}</div><div class="eyebrow">НОВЫЙ ХАРАКТЕР В КОЛЛЕКЦИИ</div><h2>Забираешь себе?</h2><div class="modal-plate">${plate(offer)}</div><p>Стоимость — <b class="bright">${money(offer.price)} игровых ₽</b>. Номер сразу появится в твоём гараже.</p><div class="modal-buttons"><button class="outline-button" id="cancel-buy">Ещё подумаю</button><button class="spin-button" id="confirm-buy">Купить ${icon('arrow')}</button></div>`);$('#cancel-buy').addEventListener('click',closeModal);$('#confirm-buy').addEventListener('click',()=>{const res=buy(state,id);if(res.error){toast(res.error,'error');return;}closeModal();save();render();toast(`${plateText(res.plate)} — теперь в твоём гараже`);});}
function daily(){if(spinning){toast('Сначала дождись остановки номера','error');return;}const res=claimDaily(state);if(res.error){toast(res.error,'error');return;}save();render();closeModal();toast('Хорошего дня! +25 000 игровых ₽ на балансе');playTone(660,.16);}
function claim(id){if(spinning)return;const res=claimAchievement(state,id);if(res.error){toast(res.error,'error');return;}save();render();toast(`Достижение твоё! +${money(res.reward)} ₽`);playTone(770,.16);}
document.addEventListener('click',e=>{const quick=e.target.closest('[data-quick-sell]');if(quick){quickSell(quick.dataset.quickSell);return;}const favorite=e.target.closest('[data-favorite]');if(favorite){if(spinning)return;const p=state.collection.find(p=>p.id===favorite.dataset.favorite);if(p){p.favorite=!p.favorite;save();if(page==='garage')updateCards();else render();toast(p.favorite?'Номер в избранном и защищён от продажи':'Номер убран из избранного');}}const sale=e.target.closest('[data-sell]');if(sale)requestSell(sale.dataset.sell);const purchase=e.target.closest('[data-buy]');if(purchase)requestBuy(purchase.dataset.buy);const reward=e.target.closest('[data-claim]');if(reward)claim(reward.dataset.claim);});
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))closeModal();});
$('#help-button').addEventListener('click',showHelp);$('#footer-help').addEventListener('click',showHelp);$('#footer-transfer').addEventListener('click',()=>showTransfer());$('#profile-button').addEventListener('click',showProfile);$('#wallet-bonus').addEventListener('click',daily);$('#mission-claim').addEventListener('click',()=>claim('five'));
$('#sound-button').addEventListener('click',()=>{state.sound=!state.sound;reelAudio.setEnabled(state.sound);save();if(state.sound)playTone(500,.1);});
$('#notifications-button').addEventListener('click',()=>{state.notifications=!state.notifications;$('#toasts').replaceChildren();save();if(state.notifications)toast('Уведомления включены');});
document.addEventListener('keydown',e=>{if(e.code==='Space'&&page==='roll'&&!spinning&&!$('#modal').open&&['BODY','MAIN'].includes(document.activeElement.tagName)){e.preventDefault();spin();}});
window.addEventListener('hashchange',()=>{const next=location.hash.slice(1);if(spinning){history.replaceState(null,'',`#${page}`);toast('Ещё мгновение — номер останавливается','error');return;}page=routes.some(r=>r.id===next)?next:'roll';search='';filter='all';sort='new';render();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));$('#year').textContent=new Date().getFullYear();page=routes.some(r=>r.id===location.hash.slice(1))?location.hash.slice(1):'roll';render();
