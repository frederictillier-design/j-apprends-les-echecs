// Assemble + valide le contenu, produit data.js
const {Chess}=require('chess.js'); const E=require('./engine.js'); const fs=require('fs');
const START='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const lessons=[...require('./src/lessons_a.js'),...require('./src/lessons_b.js')];
const test=require('./src/test.js'); const tech=require('./src/tech.js');
const mates=require('./mates_raw.json'); const tact=require('./tactics_raw.json');
const errors=[], warns=[];
const err=(m)=>errors.push(m), warn=(m)=>warns.push(m);
function fenFromPre(pre,where){ const c=new Chess(); for(const s of pre){ try{c.move(s);}catch(e){err(where+' : coup SAN illégal '+s);break;} } return c.fen(); }
const FR={K:'R',Q:'D',R:'T',B:'F',N:'C'}; function frSan(x){ return x.replace(/^([KQRBN])/,m=>FR[m]).replace(/=([QRBN])/,(m,p)=>'='+FR[p]); }
function uciOf(m){ return m.from+m.to+(m.promotion||''); }
function mv(c,u){ return c.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]}); }
// pools de mats générés
function pickPool(gen,n,k,used){
  const arr=(n===1?mates.m1:mates.m2).filter(x=>x.label===gen && x.ok.length<=(n===1?2:2)).filter(x=>!used.has(x.fen));
  // déterministe : tri par fen pour stabilité
  arr.sort((a,b)=>a.fen<b.fen?-1:1);
  const step=Math.max(1,Math.floor(arr.length/10)); const x=arr[(k*step+3)%arr.length]; used.add(x.fen); return x;
}
const usedPool=new Set();
function normalizeEx(e,where,ctx){
  const x=Object.assign({},e);
  if(x.pre){ x.fen=fenFromPre(x.pre,where); delete x.pre; }
  if(x.t==='mate' && x.gen){ const p=pickPool(x.gen,x.n,x.k||0,usedPool); x.fen=p.fen; x.ok=p.ok.slice(); delete x.gen; delete x.k; }
  if(x.t==='sq'||x.t==='mcq') { if(x.t==='mcq' && (!x.o||x.o.length<2)) err(where+' : QCM invalide'); return x; }
  let c; try{ c=new Chess(x.fen); }catch(er){ err(where+' : FEN invalide '+x.fen+' '+er.message); return x; }
  if(x.t==='mate'){
    const m=E.mateMoves(x.fen,x.n);
    if(!m.length) err(where+' : aucun mat en '+x.n+' : '+x.fen);
    if(x.n>1 && E.mateMoves(x.fen,x.n-1).length) warn(where+' : mat plus court existe : '+x.fen);
    x.ok=m; // coups de départ valides (mat en n)
    if(x.n===1) delete x.ok; // mat en 1 : tout coup mat est accepté
    x.turn=c.turn();
  } else if(x.t==='mv'){
    // jouer la solution
    const cc=new Chess(x.fen); let okSol=true;
    x.sol.forEach((u,i)=>{ try{ const r=mv(cc,u); if(!r) throw 0; }catch(er){ err(where+' : coup de solution illégal #'+i+' '+u+' dans '+x.fen); okSol=false; } });
    if(okSol){
      const r=E.rank(x.fen,4); const top=r[0], me=r.find(y=>y.uci===x.sol[0]);
      const alts=(x.ok||[]); const allowed=[x.sol[0],...alts];
      if(!me) err(where+' : 1er coup absent'); else if(top.score-me.score>120 && !alts.length) warn(where+' : le moteur préfère '+top.uci+' ('+top.score+') à '+x.sol[0]+' ('+me.score+')');
      // autres coups quasi aussi bons non listés
      const near=r.filter(y=>y.score>=me.score-60 && !allowed.includes(y.uci));
      if(near.length && me.score<9000 && x.sol.length===1) warn(where+' : coups équivalents non listés '+near.map(y=>y.uci).join(',')+' (sol '+x.sol[0]+')');
    }
    x.turn=c.turn();
  }
  return x;
}
const outLessons=lessons.map((L,li)=>{
  const out={id:L.id,n:li+1,titre:L.titre,emoji:L.emoji,niveau:L.niveau,duree:L.duree,objectifs:L.objectifs,conseil:L.conseil,etapes:[],ex:[]};
  L.etapes.forEach((s,si)=>{
    const where=L.id+' étape '+(si+1);
    const e=Object.assign({},s);
    if(e.seq){
      const c=new Chess(e.fen||START); const uc=[],san=[];
      for(const m of e.seq){ try{ const r=c.move(m); uc.push(uciOf(r)); san.push(r.san); }catch(er){ err(where+' : seq illégale '+m+' ('+er.message+')'); break; } }
      e.seq=uc; e.san=san; e.fen=e.fen||START;
    }
    if(e.from){ try{ const c=new Chess(e.fen); e.dots=c.moves({square:e.from,verbose:true}).map(m=>m.to); if(!e.dots.length) err(where+' : aucun coup depuis '+e.from); delete e.from; }catch(er){ err(where+' : FEN invalide'); } }
    out.etapes.push(e);
  });
  L.ex.forEach((e,ei)=>out.ex.push(Object.assign(normalizeEx(e,L.id+' ex'+(ei+1)),{id:L.id+'-'+(ei+1)})));
  return out;
});
const outTest=test.map((e,i)=>Object.assign(normalizeEx(e,'test q'+(i+1)),{id:'q'+(i+1)}));
// banque d'exercices complémentaires
const bank=[]; let bn=0;
function addBank(o){ bn++; bank.push(Object.assign({id:'b'+String(bn).padStart(3,'0')},o)); }
// mats générés (non utilisés dans les leçons)
function addMates(gen,n,count,lv){
  const arr=(n===1?mates.m1:mates.m2).filter(x=>x.label===gen&&x.ok.length<=3&&!usedPool.has(x.fen)).sort((a,b)=>a.fen<b.fen?-1:1);
  const step=Math.max(1,Math.floor(arr.length/count));
  for(let i=0;i<count&&i*step<arr.length;i++){ const x=arr[i*step+1<arr.length?i*step+1:i*step]; if(usedPool.has(x.fen)) continue; usedPool.add(x.fen);
    const c=new Chess(x.fen); const turn=c.turn();
    const e={t:'mate',th:n===1?'mat1':'mat2',lv,fen:x.fen,n,q:'Mat en '+n+' coup'+(n>1?'s':'')+'.',why:n===1?'Le roi est maté : toutes ses cases sont contrôlées.':'Cherche le coup qui laisse une seule réponse au roi.',turn};
    if(n>1) e.ok=x.ok; // n=1 : tout mat accepté
    const vm=E.mateMoves(x.fen,n); if(!vm.length) { err('bank mate invalide '+x.fen); continue; }
    if(n>1) e.ok=vm; addBank(e); }
}
addMates('KQ',1,4,1); addMates('KR',1,3,1); addMates('KRR',1,5,1);
addMates('KQ',2,4,2); addMates('KR',2,4,2); addMates('KRR',2,6,3);
// exercices des leçons réutilisés comme tactiques
const themeOf={l03:'materiel',l06:'materiel',l09:'tactique',l10:'tactique',l08:'tactique',l05:'mat1',l07:null,l11:null,l12:null,l13:null,l04:null};
outLessons.forEach(L=>L.ex.forEach(e=>{ if((e.t==='mv'||e.t==='mate')&&themeOf[L.id]){ const th=e.t==='mate'?(e.n===1?'mat1':'mat2'):themeOf[L.id]; addBank({t:e.t,th,lv:L.n<=6?1:2,fen:e.fen,n:e.n,q:e.q,sol:e.sol,ok:e.ok,why:e.why,turn:e.turn,src:L.id}); } }));
// tactiques "gagne du matériel" générées
tact.forEach((f,i)=>{
  const pts=Math.max(1,Math.round(f.gap/100));
  const side=f.turn==='w'?'Blancs':'Noirs';
  addBank({t:'mv',th:'materiel',lv:f.gap>=500?1:2,fen:f.fen,q:"Tu joues les "+side+". Trouve le coup qui gagne le plus de matériel.",sol:[f.uci],why:"Le meilleur coup est "+frSan(f.san)+" : il rapporte environ "+pts+" point"+(pts>1?'s':'')+" de matériel de plus que les autres coups.",turn:f.turn});
});
const data={lessons:outLessons,test:outTest,tech,bank};
fs.writeFileSync('data.json',JSON.stringify(data));
fs.writeFileSync('data.js','window.ECHECS_DATA='+JSON.stringify(data)+';');
console.log('leçons',outLessons.length,'ex',outLessons.reduce((a,l)=>a+l.ex.length,0),'test',outTest.length,'bank',bank.length);
console.log('ERREURS',errors.length); errors.forEach(e=>console.log(' ✗',e));
console.log('AVERTISSEMENTS',warns.length); warns.forEach(e=>console.log(' !',e));
