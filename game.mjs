import {REGIONS} from './regions.mjs?v=20261013-4';
export {REGIONS,REGION_NAMES,regionName} from './regions.mjs?v=20261013-4';
export const LETTERS = 'АВЕКМНОРСТУХ';
export const RARITIES = {
  common: {label:'Обычный',color:'#acb1a7',rank:0},
  uncommon: {label:'Необычный',color:'#a5d890',rank:1},
  rare: {label:'Редкий',color:'#82b7fa',rank:2},
  epic: {label:'Эпический',color:'#c2a2f6',rank:3},
  legendary: {label:'Легендарный',color:'#e7c76f',rank:4}
};
export const CASES = [
  {id:'standard',name:'Стандарт',desc:'Удача любит смелых',cost:1000,weights:[68,21,8.5,2.3,0.2]},
  {id:'premium',name:'Премиум',desc:'Больше редких сочетаний',cost:10000,weights:[25,42,25,7,1]},
  {id:'legend',name:'Легенда',desc:'Каждый номер — с характером',cost:50000,weights:[0,10,50,32,8]}
];
export const ACHIEVEMENTS = [
  {id:'first',title:'С первой передачи',desc:'Выбей свой первый номер',icon:'key',goal:1,metric:'spins',reward:2000},
  {id:'five',title:'Поймай свою удачу',desc:'Выбей 5 номеров',icon:'flag',goal:5,metric:'spins',reward:10000},
  {id:'ten',title:'На полном ходу',desc:'Выбей 10 номеров',icon:'bolt',goal:10,metric:'spins',reward:20000},
  {id:'seller',title:'Хорошая сделка',desc:'Продай первый номер',icon:'tag',goal:1,metric:'sold',reward:5000},
  {id:'buyer',title:'Со вкусом',desc:'Купи номер на рынке',icon:'bag',goal:1,metric:'bought',reward:5000},
  {id:'collector',title:'Место в истории',desc:'Собери 10 номеров в гараже',icon:'grid',goal:10,metric:'collection',reward:15000},
  {id:'epic',title:'Редкая птица',desc:'Выбей эпический или легендарный номер',icon:'diamond',goal:1,metric:'epics',reward:30000},
  {id:'legendary',title:'Городские легенды',desc:'Выбей легендарный номер',icon:'crown',goal:1,metric:'legends',reward:75000}
];
export function random() {if (globalThis.crypto?.getRandomValues) return crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;return Math.random();}
const pick = (arr,rng) => arr[Math.floor(rng()*arr.length)];
export function generatePlate(caseId='standard',rng=random) {
  const box=CASES.find(c=>c.id===caseId)||CASES[0];let threshold=rng()*100;let rarity='common';
  const keys=Object.keys(RARITIES);
  for(let i=0;i<keys.length;i++){threshold-=box.weights[i];if(threshold<0){rarity=keys[i];break;}}
  const letter=()=>pick(LETTERS,rng);const digit=()=>String(Math.floor(rng()*10));
  let letters=[letter(),letter(),letter()];let digits;let tags=[];const region=pick(REGIONS,rng);
  if(rarity==='common'){
    do {digits=String(1+Math.floor(rng()*999)).padStart(3,'0');} while(digits[0]===digits[2]||digits.endsWith('00')||['123','234','345','456','567','678','789'].includes(digits));
    if(letters[0]===letters[1]&&letters[1]===letters[2]) letters[2]=LETTERS[(LETTERS.indexOf(letters[2])+1)%LETTERS.length];
    tags=['Классическое сочетание'];
  }else if(rarity==='uncommon'){
    const first=String(1+Math.floor(rng()*9));const middle=String((Number(first)+1+Math.floor(rng()*8))%10);
    if(rng()<.5){digits=first+middle+first;tags=['Зеркальный номер'];}else{digits=first+'00';tags=['Круглый номер'];}
    if(letters.every(l=>l===letters[0])) letters[2]=LETTERS[(LETTERS.indexOf(letters[2])+1)%LETTERS.length];
  }else if(rarity==='rare'){
    digits=String(1+Math.floor(rng()*9)).repeat(3);tags=['Три одинаковые цифры'];
    if(letters.every(l=>l===letters[0])) letters[2]=LETTERS[(LETTERS.indexOf(letters[2])+1)%LETTERS.length];
  }else if(rarity==='epic'){
    digits=pick(['007','001','100','500','700','900','010'],rng);letters=[letters[0],letters[0],letters[0]];tags=['Три одинаковые буквы',digits.endsWith('00')?'Круглый номер':'Особая серия'];
  }else{
    digits=pick(['111','555','777','888','999'],rng);letters=[letters[0],letters[0],letters[0]];tags=['Три одинаковые буквы','Три одинаковые цифры','Коллекционная серия'];
  }
  const ranges={common:[600,1800],uncommon:[2500,7000],rare:[14000,42000],epic:[100000,380000],legendary:[950000,4200000]};
  const [min,max]=ranges[rarity];let value=Math.round((min+rng()*(max-min))/100)*100;
  if(digits==='777'&&rarity==='legendary')value=Math.round(value*1.6/100)*100;
  return {id:makeId(),letters,digits,region,rarity,value,tags,createdAt:Date.now(),favorite:false,source:'roll'};
}
export function makeId(){return globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;}
export function plateText(p){return `${p.letters[0]} ${p.digits} ${p.letters[1]}${p.letters[2]} ${p.region}`;}
export function starterState(){
  return {version:1,balance:150000,spins:0,sold:0,bought:0,epics:0,legends:0,earned:0,best:null,lastDaily:null,claimed:[],purchased:[],history:[],sound:false,
    collection:[
      {id:'starter-1',letters:['К','М','Р'],digits:'404',region:'77',rarity:'uncommon',value:4200,tags:['Зеркальный номер'],createdAt:1,favorite:false,source:'gift'},
      {id:'starter-2',letters:['А','В','К'],digits:'777',region:'24',rarity:'rare',value:28000,tags:['Три одинаковые цифры'],createdAt:2,favorite:false,source:'gift'},
      {id:'starter-3',letters:['М','Т','Е'],digits:'815',region:'197',rarity:'common',value:1100,tags:['Классическое сочетание'],createdAt:3,favorite:false,source:'gift'}]};
}
export const MARKET = [
  {id:'market-1',letters:['А','А','А'],digits:'777',region:'777',rarity:'legendary',value:2450000,tags:['Три одинаковые буквы','Три одинаковые цифры','Коллекционная серия'],price:2790000},
  {id:'market-2',letters:['В','В','В'],digits:'007',region:'77',rarity:'epic',value:185000,tags:['Три одинаковые буквы','Особая серия'],price:215000},
  {id:'market-3',letters:['М','К','Х'],digits:'888',region:'178',rarity:'rare',value:32000,tags:['Три одинаковые цифры'],price:38900},
  {id:'market-4',letters:['О','О','О'],digits:'900',region:'61',rarity:'epic',value:290000,tags:['Три одинаковые буквы','Круглый номер'],price:335000},
  {id:'market-5',letters:['Е','К','Х'],digits:'121',region:'24',rarity:'uncommon',value:4600,tags:['Зеркальный номер'],price:5900},
  {id:'market-6',letters:['Х','А','М'],digits:'444',region:'99',rarity:'rare',value:25000,tags:['Три одинаковые цифры'],price:29900},
  {id:'market-7',letters:['С','С','С'],digits:'111',region:'97',rarity:'legendary',value:1290000,tags:['Три одинаковые буквы','Три одинаковые цифры','Коллекционная серия'],price:1490000},
  {id:'market-8',letters:['Т','О','Р'],digits:'700',region:'124',rarity:'uncommon',value:5000,tags:['Круглый номер'],price:6500},
  {id:'market-9',letters:['А','К','М'],digits:'369',region:'50',rarity:'common',value:1200,tags:['Классическое сочетание'],price:1500}
];
export function progress(state,achievement){return Math.min(achievement.goal,achievement.metric==='collection'?state.collection.length:Number(state[achievement.metric])||0);}
export function roll(state,caseId,rng=random){
  const box=CASES.find(c=>c.id===caseId);if(!box)return {error:'Неизвестный режим'};
  if(state.collection.length>=300)return {error:'Гараж заполнен. Продай несколько номеров (лимит — 300).'};
  if(state.balance<box.cost)return {error:'Не хватает игровых ₽. Продай номер или забери ежедневную награду.'};
  const p=generatePlate(caseId,rng);state.balance-=box.cost;state.spins++;state.collection.unshift(p);
  if(RARITIES[p.rarity].rank>=3)state.epics++;if(p.rarity==='legendary')state.legends++;
  if(!state.best||p.value>state.best.value)state.best={...p};
  state.history.unshift({...p});state.history=state.history.slice(0,20);return {plate:p};
}
export function sell(state,id){const i=state.collection.findIndex(p=>p.id===id);if(i<0)return {error:'Номер уже продан'};const p=state.collection[i];if(p.favorite)return {error:'Сначала убери номер из избранного'};state.collection.splice(i,1);state.balance+=p.value;state.earned+=p.value;state.sold++;return {plate:p};}
export function buy(state,id){const offer=MARKET.find(p=>p.id===id);if(!offer||state.purchased.includes(id))return {error:'Этот номер уже куплен'};if(state.collection.length>=300)return {error:'Гараж заполнен (300 номеров)'};if(state.balance<offer.price)return {error:'Не хватает игровых ₽ для покупки'};state.balance-=offer.price;state.bought++;state.purchased.push(id);const p={...offer,id:makeId(),createdAt:Date.now(),favorite:false,source:'market'};delete p.price;state.collection.unshift(p);return {plate:p};}
export function claimAchievement(state,id){const a=ACHIEVEMENTS.find(a=>a.id===id);if(!a||state.claimed.includes(id)||progress(state,a)<a.goal)return {error:'Награда пока недоступна'};state.claimed.push(id);state.balance+=a.reward;return {reward:a.reward};}
export function localDay(date=new Date()){return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;}
export function claimDaily(state,day=localDay()){if(state.lastDaily===day)return {error:'Сегодня награда уже получена. Возвращайся завтра!'};state.lastDaily=day;state.balance+=25000;return {reward:25000};}
export function loadState(storage){try{const raw=JSON.parse(storage.getItem('nomernoy-v1'));if(!raw||raw.version!==1||!Number.isFinite(raw.balance)||raw.balance<0||!Array.isArray(raw.collection)||raw.collection.some(p=>!validPlate(p)))return starterState();const s={...starterState(),...raw};for(const k of ['spins','sold','bought','epics','legends','earned'])if(!Number.isFinite(s[k])||s[k]<0)s[k]=0;for(const k of ['claimed','purchased','history'])if(!Array.isArray(s[k]))s[k]=[];s.history=s.history.filter(validPlate).slice(0,20);if(s.best&&!validPlate(s.best))s.best=null;return s;}catch{return starterState();}}
function validPlate(p){return p&&typeof p.id==='string'&&Array.isArray(p.letters)&&p.letters.length===3&&p.letters.every(l=>LETTERS.includes(l)&&l.length===1)&&/^\d{3}$/.test(p.digits)&&/^\d{2,3}$/.test(p.region)&&Boolean(RARITIES[p.rarity])&&Number.isFinite(p.value)&&p.value>=0&&Array.isArray(p.tags);}
