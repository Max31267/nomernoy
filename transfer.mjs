import {LETTERS,RARITIES,loadState,saveState} from './game.mjs?v=20261014-3';

const PREFIX='NMR1.';
const MAX_BYTES=2_000_000,MAX_CODE=3_000_000;
const BEFORE_IMPORT='nomernoy-v1-before-import';
const safeId=value=>typeof value==='string'&&/^[A-Za-z0-9._:-]{1,160}$/.test(value);
const amount=value=>Number.isSafeInteger(value)&&value>=0;
const optional=(value,check)=>value===undefined||check(value);
const validPlate=p=>p&&typeof p==='object'&&safeId(p.id)
 &&Array.isArray(p.letters)&&p.letters.length===3&&p.letters.every(l=>typeof l==='string'&&l.length===1&&LETTERS.includes(l))
 &&typeof p.digits==='string'&&/^\d{3}$/.test(p.digits)
 &&typeof p.region==='string'&&/^\d{2,3}$/.test(p.region)
 &&typeof p.rarity==='string'&&Object.hasOwn(RARITIES,p.rarity)&&amount(p.value)
 &&Array.isArray(p.tags)&&p.tags.length<=20&&p.tags.every(t=>typeof t==='string'&&t.length<=300)
 &&optional(p.createdAt,amount)&&optional(p.favorite,v=>typeof v==='boolean')
 &&optional(p.source,v=>['roll','gift','market'].includes(v));

function validate(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Это не сохранение игры. Вставь код целиком.');
 if(raw.version!==1)throw new Error('Эта версия сохранения не поддерживается. Проверь код и обнови страницу игры.');
 const valid=amount(raw.balance)&&Array.isArray(raw.collection)&&raw.collection.length<=300&&raw.collection.every(validPlate)
  &&new Set(raw.collection.map(p=>p.id)).size===raw.collection.length
  &&['spins','sold','bought','epics','legends','earned'].every(k=>optional(raw[k],amount))
  &&['claimed','purchased'].every(k=>optional(raw[k],v=>Array.isArray(v)&&v.length<=1000&&v.every(safeId)))
  &&optional(raw.history,v=>Array.isArray(v)&&v.length<=1000&&v.every(validPlate))
  &&(raw.best==null||validPlate(raw.best))
  &&optional(raw.lastDaily,v=>v===null||(typeof v==='string'&&/^\d{4}-\d{1,2}-\d{1,2}$/.test(v)))
  &&['sound','notifications'].every(k=>optional(raw[k],v=>typeof v==='boolean'));
 if(!valid)throw new Error('В сохранении есть повреждённые данные. Текущий прогресс не изменён.');
 // Reuse existing defaults and price migrations without writing to the real browser storage.
 const serialized=JSON.stringify(raw);
 return loadState({getItem:key=>key==='nomernoy-v1'?serialized:null,setItem:()=>{}});
}

async function readLimited(stream,limit){
 const reader=stream.getReader(),chunks=[];let size=0;
 try{
  while(true){
   const {done,value}=await reader.read();if(done)break;
   size+=value.byteLength;
   if(size>limit){await reader.cancel().catch(()=>{});throw new Error('Сохранение слишком большое.');}
   chunks.push(value);
  }
 }finally{reader.releaseLock();}
 const output=new Uint8Array(size);let offset=0;
 for(const chunk of chunks){output.set(chunk,offset);offset+=chunk.byteLength;}
 return output;
}

function toBase64(bytes){
 let binary='';
 for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
 return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function fromBase64(text){
 if(!/^[A-Za-z0-9+/_-]+={0,2}$/.test(text))throw new Error('Неверный код сохранения. Скопируй его целиком.');
 try{
  const binary=atob(text.replace(/-/g,'+').replace(/_/g,'/'));
  return Uint8Array.from(binary,c=>c.charCodeAt(0));
 }catch{throw new Error('Код сохранения обрезан или повреждён. Скопируй его ещё раз.');}
}

export async function encodeSave(state){
 if(typeof CompressionStream==='undefined')throw new Error('Для сжатого кода обнови браузер до последней версии.');
 const bytes=new TextEncoder().encode(JSON.stringify(state));
 if(bytes.byteLength>MAX_BYTES)throw new Error('Сохранение слишком большое для переноса.');
 const compressed=await readLimited(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip')),MAX_CODE);
 return PREFIX+toBase64(compressed);
}

export async function decodeSave(code){
 if(typeof code!=='string'||!code.trim())throw new Error('Сначала вставь код сохранения.');
 if(code.length>MAX_CODE)throw new Error('Код слишком большой. Проверь, что вставлено только сохранение.');
 const input=code.trim();let text;
 if(input.startsWith('{')||input.startsWith('"')){
  text=input;
 }else{
  const compact=input.replace(/\s/g,'');
  if(/^NMR\d+\./.test(compact)&&!compact.startsWith(PREFIX))throw new Error('Для этого кода нужна более новая версия игры. Обнови страницу.');
  if(compact.startsWith(PREFIX)){
   if(typeof DecompressionStream==='undefined')throw new Error('Для загрузки сжатого кода обнови браузер до последней версии.');
   const bytes=fromBase64(compact.slice(PREFIX.length));
   try{
    const unpacked=await readLimited(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')),MAX_BYTES);
    text=new TextDecoder('utf-8',{fatal:true}).decode(unpacked);
   }catch{throw new Error('Код обрезан, повреждён или слишком велик. Скопируй сохранение ещё раз целиком.');}
  }else{
   // Also accept older console exports: UTF-8 JSON encoded as base64.
   try{text=new TextDecoder('utf-8',{fatal:true}).decode(fromBase64(compact));}
   catch{throw new Error('Не удалось прочитать сохранение. Вставь код NMR1 или старый текст из консоли.');}
  }
 }
 if(new TextEncoder().encode(text).byteLength>MAX_BYTES)throw new Error('Сохранение слишком большое.');
 let raw;
 try{raw=JSON.parse(text);if(typeof raw==='string')raw=JSON.parse(raw);}
 catch{throw new Error('Вставлен неполный или неверный текст сохранения.');}
 return validate(raw);
}

export function previousSave(storage){
 try{return storage.getItem(BEFORE_IMPORT);}catch{return null;}
}

export function replaceSave(storage,incoming,current){
 // Abort if the recovery copy cannot be saved. Do not change in-memory progress first.
 storage.setItem(BEFORE_IMPORT,JSON.stringify(current));
 saveState(storage,incoming);
}
