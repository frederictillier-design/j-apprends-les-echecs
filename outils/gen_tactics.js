// Génère des positions "gagne du matériel" à partir de parties aléatoires, validées par le moteur à plusieurs profondeurs
const {Chess}=require('chess.js'); const E=require('./engine.js');
let seed=777; function rnd(){ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; }
const found=[]; const seen=new Set();
const t0=Date.now();
for(let g=0; g<400 && found.length<70 && Date.now()-t0<420000; g++){
  const c=new Chess(); const plies=10+Math.floor(rnd()*28);
  for(let p=0;p<plies && !c.isGameOver();p++){
    const fen=c.fen();
    // choix du coup : niveau 1 mais avec un peu d'aléa
    const mv=E.pickMove(fen, rnd()<0.5?1:2); if(!mv) break;
    c.move({from:mv.slice(0,2),to:mv.slice(2,4),promotion:mv[4]});
  }
  if(c.isGameOver()||c.inCheck()) continue;
  // vérifie des positions près de la fin de la partie jouée, en remontant de quelques demi-coups
  for(let back=0;back<4;back++){
    const fen=c.fen();
    const key=fen.split(' ').slice(0,2).join(' ');
    if(!seen.has(key)){
      seen.add(key);
      const r3=E.rank(fen,3); if(r3.length>=3){
        const gap=r3[0].score-r3[1].score;
        if(gap>=250 && Math.abs(r3[0].score)<1500 && r3[0].score<20000){
          const r5=E.rank(fen,5);
          if(r5[0].uci===r3[0].uci && r5[0].score-r5[1].score>=220 && r5[0].score<20000 && r5[0].score>-20000 && r5[1].score>-900){
            // ne garder que les positions où le trait n'est pas déjà largement gagnant (sinon trop facile)
            const cc=new Chess(fen); const m=cc.move({from:r5[0].uci.slice(0,2),to:r5[0].uci.slice(2,4),promotion:r5[0].uci[4]});
            const mat=(f)=>{const b=new Chess(f).board().flat().filter(Boolean);const v={p:1,n:3,b:3,r:5,q:9,k:0};return b.reduce((a,x)=>a+(x.color==='w'?1:-1)*v[x.type],0);};
            found.push({fen,san:m.san,uci:r5[0].uci,gap:r5[0].score-r5[1].score,cap:!!m.captured,mate:/#/.test(m.san),check:/\+/.test(m.san),turn:fen.split(' ')[1],matBefore:mat(fen)});
          }
        }
      }
    }
    if(!c.history().length) break; c.undo(); if(c.isGameOver()||c.inCheck()) { /* continue quand même */ }
    if(c.inCheck()) break;
  }
}
console.log('trouvé',found.length,'en',Math.round((Date.now()-t0)/1000),'s');
require('fs').writeFileSync('tactics_raw.json',JSON.stringify(found));
found.slice(0,12).forEach(f=>console.log(f.san,f.gap,f.fen));
