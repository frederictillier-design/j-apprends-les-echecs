const {Chess}=require('chess.js'); const E=require('./engine.js');
let seed=12345; function rnd(){ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; }
const files='abcdefgh';
function sq(i){return files[i%8]+(Math.floor(i/8)+1);}
function gen(pieces){ // pieces: ['Q'] / ['R'] / ['R','R'] ; blancs: roi + pieces ; noir: roi seul
  for(let tries=0;tries<200;tries++){
    const used=new Set(); const place=()=>{let s;do{s=Math.floor(rnd()*64);}while(used.has(s));used.add(s);return s;};
    const wk=place(), bk=place();
    const fk=Math.abs((wk%8)-(bk%8))<=1&&Math.abs(Math.floor(wk/8)-Math.floor(bk/8))<=1; if(fk) continue;
    const ps=pieces.map(p=>[p,place()]);
    const b=Array.from({length:8},()=>Array(8).fill(null));
    b[Math.floor(wk/8)][wk%8]='K'; b[Math.floor(bk/8)][bk%8]='k'; ps.forEach(([p,s])=>b[Math.floor(s/8)][s%8]=p);
    const fen=b.slice().reverse().map(r=>{let o='',e=0;r.forEach(c=>{if(!c)e++;else{if(e)o+=e;e=0;o+=c;}});if(e)o+=e;return o;}).join('/')+' w - - 0 1';
    try{ const c=new Chess(fen); if(c.inCheck()) continue; // noir pas en échec (trait blanc)
      const c2=new Chess(fen.replace(' w ',' b ')); if(c2.inCheck()&&false) continue; return fen; }catch(e){}
  }
}
const out={m1:[],m2:[],m3:[]};
function run(pieces,label,N,maxN){
  let got=0;
  for(let i=0;i<N;i++){
    const fen=gen(pieces); if(!fen) continue;
    const m1=E.mateMoves(fen,1); if(m1.length){ out.m1.push({fen,label,ok:m1}); continue; }
    if(maxN>=2){ const m2=E.mateMoves(fen,2); if(m2.length){ out.m2.push({fen,label,ok:m2}); continue; } }
    if(maxN>=3){ const m3=E.mateMoves(fen,3); if(m3.length) out.m3.push({fen,label,ok:m3}); }
  }
}
run(['Q'],'KQ',2000,2); run(['R'],'KR',2000,2); run(['R','R'],'KRR',1500,3);
for(const k of ['m1','m2','m3']) console.log(k,out[k].length, out[k].filter(x=>x.label==='KQ').length,out[k].filter(x=>x.label==='KR').length,out[k].filter(x=>x.label==='KRR').length);
require('fs').writeFileSync('mates_raw.json',JSON.stringify(out));
