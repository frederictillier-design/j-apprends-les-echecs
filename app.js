/* J'apprends les échecs — appli autonome (PWA). Règles du jeu : chess.js ; adversaire : engine.js ; contenu : data.js */
(function(){
'use strict';
var D = window.ECHECS_DATA, Chess = window.Chess, Engine = window.Engine;
var $ = function(s,r){ return (r||document).querySelector(s); };
var $$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
var KEY = 'echecs-v1';
var FILES = 'abcdefgh';
var START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
function today(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function addDays(ds,n){ var p=ds.split('-'); var d=new Date(+p[0],+p[1]-1,+p[2]+n); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function dayNum(){ return Math.floor(Date.now()/86400000); }
function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function fmtDate(ds){ if(!ds) return ''; var p=ds.split('-'); return p[2]+'/'+p[1]+'/'+p[0]; }
function fr(s){ if(!s) return s; var M={K:'R',Q:'D',R:'T',B:'F',N:'C'}; return String(s).replace(/^([KQRBN])/,function(m){return M[m];}).replace(/=([QRBN])/,function(m,p){return '='+M[p];}); }
function lessonById(id){ for(var i=0;i<D.lessons.length;i++) if(D.lessons[i].id===id) return D.lessons[i]; }

/* ---------- état et sauvegarde ---------- */
function fresh(){ return { v:1, name:'', created:today(), lessons:{}, test:{done:false,run:null,history:[]}, puz:{}, games:[], cur:null, days:[], tech:{}, theme:'', hist:[] }; }
var S = fresh();
function normalize(o){
  var f = fresh(); if(!o||typeof o!=='object') return f;
  for(var k in f) if(o[k]===undefined) o[k]=f[k];
  if(!o.test||typeof o.test!=='object') o.test=f.test; if(!o.test.history) o.test.history=[];
  return o;
}
function load(){ try{ var r=localStorage.getItem(KEY); if(r) S=normalize(JSON.parse(r)); }catch(e){ S=fresh(); } }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
function touchDay(){ var t=today(); if(S.days.indexOf(t)<0){ S.days.push(t); S.days.sort(); if(S.days.length>800) S.days=S.days.slice(-800); } }
function log(kind,text){ touchDay(); S.hist.unshift({d:today(),k:kind,t:text}); if(S.hist.length>120) S.hist.length=120; save(); }
function streak(){
  var t=today(), n=0, d=t; var set={}; S.days.forEach(function(x){set[x]=1;});
  if(!set[d]) d=addDays(t,-1);
  while(set[d]){ n++; d=addDays(d,-1); }
  return n;
}
function encodeBackup(){ try{ return btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }catch(e){ return ''; } }
function decodeBackup(c){ try{ var o=JSON.parse(decodeURIComponent(escape(atob(c.trim())))); if(o && typeof o==='object' && o.lessons) return normalize(o); }catch(e){} return null; }

/* ---------- niveau et progression ---------- */
function testResult(){ // résumé du dernier test
  var t=S.test; if(!t.done || !t.last) return null; return t.last;
}
function levelLabel(r){ return r<0.3?'Débutant':(r<0.55?'Débutant confirmé':(r<0.8?'Intermédiaire':'Avancé')); }
function levelNum(){
  var n=1, t=testResult();
  if(t){ var r=t.score/t.total; n = r<0.55?1:(r<0.8?2:3); }
  var done=D.lessons.filter(function(l){return S.lessons[l.id]&&S.lessons[l.id].done;}).length;
  if(done>=11) n=Math.max(n,3); else if(done>=7) n=Math.max(n,2);
  return n;
}
function lessonDone(id){ return !!(S.lessons[id]&&S.lessons[id].done); }
function lessonAcquired(id){ // acquis d'après le test
  var t=testResult(); if(!t||!t.byLesson) return false; var b=t.byLesson[id]; return !!(b && b[1]>0 && b[0]===b[1]);
}
function nextLesson(){
  for(var i=0;i<D.lessons.length;i++){ var l=D.lessons[i]; if(!lessonDone(l.id) && !lessonAcquired(l.id)) return l; }
  for(var j=0;j<D.lessons.length;j++) if(!lessonDone(D.lessons[j].id)) return D.lessons[j];
  return null;
}
function puzStats(){
  var ok=0, tot=0, solved=0;
  for(var k in S.puz){ var p=S.puz[k]; ok+=p.ok||0; tot+=(p.ok||0)+(p.bad||0); if((p.ok||0)>0) solved++; }
  return {ok:ok, tot:tot, solved:solved};
}
function gameStats(){ var w=0,l=0,d=0; S.games.forEach(function(g){ if(g.res==='win') w++; else if(g.res==='loss') l++; else d++; }); return {w:w,l:l,d:d,n:S.games.length}; }
var BADGES = [
  {id:'b1', e:'🌱', n:'Premier pas', d:'Terminer une leçon', ok:function(){return D.lessons.some(function(l){return lessonDone(l.id);});}},
  {id:'b2', e:'🎓', n:'Test passé', d:'Faire le test de niveau', ok:function(){return S.test.done;}},
  {id:'b3', e:'🔥', n:'3 jours', d:'3 jours d\'affilée', ok:function(){return streak()>=3;}},
  {id:'b4', e:'⚡', n:'7 jours', d:'7 jours d\'affilée', ok:function(){return streak()>=7;}},
  {id:'b5', e:'🧩', n:'10 exercices', d:'10 exercices réussis', ok:function(){return puzStats().ok>=10;}},
  {id:'b6', e:'🧠', n:'50 exercices', d:'50 exercices réussis', ok:function(){return puzStats().ok>=50;}},
  {id:'b7', e:'🎯', n:'Premier mat', d:'Gagner une partie', ok:function(){return gameStats().w>=1;}},
  {id:'b8', e:'🏆', n:'5 victoires', d:'Gagner 5 parties', ok:function(){return gameStats().w>=5;}},
  {id:'b9', e:'📚', n:'Technicien', d:'Lire 5 fiches Techniques', ok:function(){return Object.keys(S.tech).length>=5;}},
  {id:'b10', e:'👑', n:'Cours complet', d:'Terminer les 13 leçons', ok:function(){return D.lessons.every(function(l){return lessonDone(l.id);});}}
];

/* ---------- échiquier ---------- */
var GLYPH = {k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
function parseFen(fen){
  var map={}, rows=fen.split(' ')[0].split('/');
  for(var r=0;r<8;r++){ var f=0; for(var i=0;i<rows[r].length;i++){ var ch=rows[r][i]; if(ch>='1'&&ch<='8') f+=+ch; else { map[FILES[f]+(8-r)]=ch; f++; } } }
  return map;
}
var boardSeq = 0, boards = {};
function Board(opts){
  this.id = 'bd'+(++boardSeq);
  this.fen = opts.fen; this.flip = !!opts.flip; this.interactive = !!opts.interactive; this.sqMode = !!opts.sqMode;
  this.game = null; try{ this.game = new Chess(opts.fen); }catch(e){ this.game = null; }
  this.sel = null; this.last = opts.last||null; this.hl = opts.hl||[]; this.dots = opts.dots||[]; this.arrows = opts.arrows||[];
  this.marks = {}; // case -> 'good'|'bad'
  this.onMove = opts.onMove||null; this.onSquare = opts.onSquare||null; this.locked = false;
  boards[this.id] = this;
}
Board.prototype.html = function(){
  var pieces = this.game ? parseFen(this.game.fen()) : parseFen(this.fen);
  var flip = this.flip, h = '<div class="bwrap"><div class="board" id="'+this.id+'">';
  var legalTo = {}, caps = {};
  if(this.sel && this.game){ this.game.moves({square:this.sel,verbose:true}).forEach(function(m){ legalTo[m.to]=1; if(m.captured||/e/.test(m.flags)) caps[m.to]=1; }); }
  var chk = null;
  if(this.game && this.game.inCheck()){ var tb = this.game.board(); for(var rr=0;rr<8;rr++) for(var cc=0;cc<8;cc++){ var x=tb[rr][cc]; if(x && x.type==='k' && x.color===this.game.turn()) chk = FILES[cc]+(8-rr); } }
  for(var r=0;r<8;r++) for(var c=0;c<8;c++){
    var file = flip ? 7-c : c, rank = flip ? r+1 : 8-r, sq = FILES[file]+rank;
    var light = (file+rank)%2===1;
    var cls = 'sq '+(light?'light':'dark');
    if(this.last && (this.last[0]===sq||this.last[1]===sq)) cls+=' lm';
    if(this.hl.indexOf(sq)>=0) cls+=' hl';
    if(this.sel===sq) cls+=' sel';
    if(chk===sq) cls+=' chk';
    if(this.marks[sq]) cls+=' '+this.marks[sq];
    var isDot = legalTo[sq] || this.dots.indexOf(sq)>=0;
    if(isDot && (caps[sq] || (this.dots.indexOf(sq)>=0 && pieces[sq]))) cls+=' cap';
    h += '<div class="'+cls+'" data-sq="'+sq+'">';
    if(c===0) h += '<span class="co r">'+rank+'</span>';
    if(r===7) h += '<span class="co f">'+FILES[file]+'</span>';
    if(isDot) h += '<i class="dot"></i>';
    var p = pieces[sq];
    if(p){ var w = p===p.toUpperCase(); h += '<span class="pc '+(w?'w':'b')+'">'+GLYPH[p.toLowerCase()]+'︎</span>'; }
    h += '</div>';
  }
  if(this.arrows.length){
    h += '<svg class="arrows" viewBox="0 0 8 8"><defs><marker id="ah'+this.id+'" markerWidth="3" markerHeight="3" refX="1.8" refY="1.5" orient="auto"><path d="M0,0 L3,1.5 L0,3 z" fill="rgba(230,120,0,.9)"/></marker></defs>';
    var self=this;
    this.arrows.forEach(function(a){
      var f=self.xy(a[0]), t=self.xy(a[1]); var dx=t[0]-f[0], dy=t[1]-f[1], L=Math.sqrt(dx*dx+dy*dy)||1;
      var ex=t[0]-dx/L*.3, ey=t[1]-dy/L*.3, sx=f[0]+dx/L*.12, sy=f[1]+dy/L*.12;
      h += '<line x1="'+sx+'" y1="'+sy+'" x2="'+ex+'" y2="'+ey+'" stroke="rgba(230,120,0,.85)" stroke-width=".13" stroke-linecap="round" marker-end="url(#ah'+self.id+')"/>';
    });
    h += '</svg>';
  }
  h += '</div></div>';
  return h;
};
Board.prototype.xy = function(sq){ var f=FILES.indexOf(sq[0]), r=parseInt(sq[1],10); var x = this.flip ? 7-f : f, y = this.flip ? r-1 : 8-r; return [x+.5, y+.5]; };
Board.prototype.mount = function(el){ this.el = el; this.redraw(); };
Board.prototype.redraw = function(){
  if(!this.el) return; this.el.innerHTML = this.html(); fitBoards();
};
Board.prototype.apply = function(uci){
  var m = this.game.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]});
  this.last = [m.from,m.to]; this.sel = null; this.marks = {}; this.redraw(); return m;
};
Board.prototype.undo = function(){ var m=this.game.undo(); this.sel=null; this.marks={}; var h=this.game.history({verbose:true}); this.last = h.length?[h[h.length-1].from,h[h.length-1].to]:null; this.redraw(); return m; };
Board.prototype.click = function(sq){
  if(this.locked) return;
  if(this.sqMode){ if(this.onSquare) this.onSquare(sq); return; }
  if(!this.interactive || !this.game) return;
  var g = this.game, self = this;
  if(this.sel){
    var cands = g.moves({square:this.sel,verbose:true}).filter(function(m){return m.to===sq;});
    if(cands.length){
      var from = this.sel;
      if(cands[0].promotion){ askPromotion(g.turn(), function(pc){ self.sel=null; self.onMove && self.onMove(from+sq+pc); }); return; }
      this.sel = null; this.onMove && this.onMove(from+sq); return;
    }
  }
  var p = g.get(sq);
  if(p && p.color===g.turn()){ this.sel = (this.sel===sq)?null:sq; this.redraw(); }
  else if(this.sel){ this.sel=null; this.redraw(); }
};
function askPromotion(color, cb){
  var h = '<div class="modal" id="promo-modal"><div class="box"><h3 class="center">Promotion : choisis une pièce</h3><div class="promo">';
  ['q','r','b','n'].forEach(function(p){ h += '<button data-act="promo" data-p="'+p+'"><span class="pc '+(color==='w'?'w':'b')+'" style="font-size:2.2rem;--cs:40px">'+GLYPH[p]+'︎</span></button>'; });
  h += '</div></div></div>';
  $('#modal').innerHTML = h; promoCb = cb;
}
var promoCb = null;
function fitBoards(){
  $$('.board').forEach(function(b){ var w=b.clientWidth; if(w) b.style.setProperty('--cs', (w/8)+'px'); });
}
window.addEventListener('resize', fitBoards);
window.addEventListener('orientationchange', function(){ setTimeout(fitBoards,150); });
function staticBoard(fen, o){ o=o||{}; var b=new Board({fen:fen, flip:o.flip, hl:o.hl, dots:o.dots, arrows:o.arrows, last:o.last}); return b; }
function boardSlot(b){ return '<div id="slot-'+b.id+'" data-board="'+b.id+'"></div>'; }
function mountAll(){ $$('[data-board]').forEach(function(el){ var b=boards[el.getAttribute('data-board')]; if(b) b.mount(el); }); }

/* ---------- lecteur d'exercice (leçons, test, exercices) ---------- */
var EX = null;
function sideName(c){ return c==='b'?'Noirs':'Blancs'; }
function exTurn(ex){ if(ex.turn) return ex.turn; try{ return new Chess(ex.fen).turn(); }catch(e){ return 'w'; } }
// opts : {mode:'lesson'|'test'|'puz', idx, total, onDone(result)}
function exView(ex, opts){
  EX = { ex:ex, opts:opts, errs:0, ply:0, over:false, hints:0, board:null, order:null, shown:false };
  var R = EX, h = '<div class="card" id="exc"><div class="row sp wrap" style="margin-bottom:6px"><span class="chip">'+esc(opts.label||'Exercice')+'</span>';
  if(ex.t==='mv'||ex.t==='mate'){ h += '<span class="chip mute">Trait aux '+sideName(exTurn(ex))+'</span>'; }
  h += '</div><h3 style="margin:6px 0 10px">'+esc(ex.q)+'</h3>';
  if(ex.t==='mv' || ex.t==='mate'){
    R.board = new Board({fen:ex.fen, flip: exTurn(ex)==='b', interactive:true, onMove:onExMove});
    h += boardSlot(R.board);
  } else if(ex.t==='sq'){
    R.board = new Board({fen:ex.fen, sqMode:true, onSquare:onExSquare});
    h += boardSlot(R.board);
  } else if(ex.t==='mcq'){
    if(ex.fen){ R.board = new Board({fen:ex.fen}); h += boardSlot(R.board); }
    R.order = shuffle(ex.o.map(function(t,i){return i;}));
    h += '<div id="opts">';
    R.order.forEach(function(oi,k){ h += '<button class="opt" data-act="opt" data-k="'+oi+'">'+esc(ex.o[oi])+'</button>'; });
    h += '</div>';
  }
  h += '<div id="exmsg"></div><div id="exbtn" class="row wrap" style="margin-top:8px"></div></div>';
  setTimeout(function(){ exButtons(); }, 0);
  return h;
}
function exButtons(){
  var R=EX; if(!R) return; var el=$('#exbtn'); if(!el) return; var h='';
  if(R.over){ h = '<button class="btn grow" data-act="exnext">'+(R.opts.last?'Terminer':'Suivant')+' →</button>'; }
  else if(R.opts.mode!=='test' && (R.ex.t==='mv'||R.ex.t==='mate')){
    h = '<button class="btn sec sm" data-act="exhint">💡 Indice</button>';
    if(R.errs>=2) h += '<button class="btn ghost sm" data-act="exsol">Voir la solution</button>';
  } else if(R.opts.mode==='test'){ h = '<button class="btn ghost sm" data-act="exskip">Je ne sais pas</button>'; }
  el.innerHTML = h;
}
function exMsg(kind, text){ var el=$('#exmsg'); if(el) el.innerHTML = text?('<div class="msg '+kind+'">'+text+'</div>'):''; }
function exFinish(ok){
  var R=EX; if(!R||R.over) return; R.over = true;
  if(R.board) R.board.locked = true;
  var result = {ok: ok && R.errs===0 && !R.shown, errs:R.errs};
  R.result = result;
  if(R.opts.mode==='test'){ R.opts.onDone(result); return; }
  exButtons();
}
function exSuccess(){
  var R=EX, ex=R.ex;
  var good = R.errs===0 ? '✅ Bravo ! ' : '✅ Bien joué ! ';
  exMsg('good', good + esc(ex.why||''));
  if(R.board){ R.board.sel=null; R.board.redraw(); }
  if(R.opts.mode==='puz'){ /* maj fiche */ }
  exFinish(true);
}
function exWrong(msg){
  var R=EX; R.errs++;
  if(R.opts.mode==='test'){ exFinish(false); return; }
  exMsg('bad', msg);
  exButtons();
}
function acceptable(ex, ply, uci){
  var exp = ex.sol[ply]; if(!exp) return false;
  var list = ply===0 ? [exp].concat(ex.ok||[]) : [exp];
  if(list.indexOf(uci)>=0) return true;
  // promotion : accepter la même case d'arrivée si la solution est une promotion en dame et que le joueur a choisi autre chose ? non.
  return false;
}
function onExMove(uci){
  var R=EX; if(!R||R.over) return; var ex=R.ex, b=R.board;
  if(ex.t==='mv'){
    if(acceptable(ex, R.ply, uci)){
      b.apply(uci); R.ply++;
      if(R.ply>=ex.sol.length){ exSuccess(); return; }
      b.locked = true;
      setTimeout(function(){ if(!EX||EX!==R) return; b.apply(ex.sol[R.ply]); R.ply++; b.locked=false; if(R.ply>=ex.sol.length) exSuccess(); else exMsg('info','Bien ! Continue…'); }, 520);
    } else {
      wrongTry(uci, "Ce n'est pas le bon coup. Regarde bien la position (menaces, pièces non protégées) et réessaie.");
    }
  } else if(ex.t==='mate'){
    if(ex.n===1){
      var ok = false; var chk = new Chess(b.game.fen());
      try{ chk.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]}); ok = chk.isCheckmate(); }catch(e){}
      if(ok){ b.apply(uci); exSuccess(); } else wrongTry(uci, "Ce coup ne donne pas mat. Le roi adverse a encore une parade : pièce qui capture, case de fuite ou interposition.");
    } else {
      if(R.ply===0){
        if((ex.ok||[]).indexOf(uci)>=0){
          b.apply(uci); R.ply=1; b.locked=true; exMsg('info','Bien ! Les Noirs/Blancs répondent… trouve maintenant le mat.');
          setTimeout(function(){
            if(EX!==R) return; var rr = Engine.rank(b.game.fen(),3);
            if(rr && rr.length){ b.apply(rr[0].uci); }
            b.locked=false; exMsg('info','À toi : donne le mat !');
          }, 600);
        } else wrongTry(uci, "Ce n'est pas le bon premier coup : cherche celui qui ne laisse qu'une seule réponse au roi adverse.");
      } else {
        var ok2=false, c2=new Chess(b.game.fen());
        try{ c2.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]}); ok2=c2.isCheckmate(); }catch(e){}
        if(ok2){ b.apply(uci); exSuccess(); } else wrongTry(uci, "Ce n'est pas mat. Réfléchis : quelles cases le roi peut-il encore atteindre ?");
      }
    }
  }
}
function wrongTry(uci, msg){
  var R=EX, b=R.board; if(!b) return;
  if(R.opts.mode==='test'){ exWrong(msg); return; }
  b.locked = true;
  var m; try{ m = b.apply(uci); }catch(e){ b.locked=false; exWrong(msg); return; }
  b.marks = {}; b.marks[uci.slice(2,4)]='bad'; b.redraw();
  exWrong(msg);
  setTimeout(function(){ if(EX!==R) return; b.undo(); b.locked=false; }, 800);
}
function onExSquare(sq){
  var R=EX; if(!R||R.over) return; var ex=R.ex, b=R.board;
  if(ex.a.indexOf(sq)>=0){ b.marks={}; b.marks[sq]='good'; b.redraw(); exSuccess(); }
  else {
    if(R.opts.mode==='test'){ exFinish(false); return; }
    R.errs++; b.marks={}; b.marks[sq]='bad'; b.redraw(); exMsg('bad',"Ce n'est pas la bonne case ("+sq+"). Réessaie !");
    setTimeout(function(){ if(EX!==R||R.over) return; b.marks={}; b.redraw(); },700);
    if(R.errs>=3){ b.marks={}; b.hl=ex.a.slice(); b.redraw(); R.shown=true; exMsg('gold',"La bonne case était <b>"+ex.a[0]+"</b>."); R.over=true; R.result={ok:false,errs:R.errs}; exButtons(); }
  }
}
function onExOpt(k){
  var R=EX; if(!R||R.over) return; var ex=R.ex; var correct = (k===0);
  $$('#opts .opt').forEach(function(btn){ var kk=+btn.getAttribute('data-k'); if(R.opts.mode!=='test'){ if(kk===0) btn.classList.add('ok'); else if(kk===k) btn.classList.add('ko'); } btn.setAttribute('disabled',''); });
  if(correct){ if(R.opts.mode!=='test') exMsg('good','✅ Exact ! '+esc(ex.why||'')); R.errs=0; exFinish(true); }
  else { if(R.opts.mode!=='test') exMsg('bad','❌ Pas tout à fait. <b>Bonne réponse :</b> '+esc(ex.o[0])+'. '+esc(ex.why||'')); R.errs=1; exFinish(false); }
}
function exHint(){
  var R=EX; if(!R||R.over) return; var ex=R.ex, b=R.board; R.hints++;
  var first = ex.t==='mv' ? ex.sol[R.ply] : (R.ply===0 ? (ex.ok&&ex.ok[0]) : null);
  if(ex.t==='mate' && ex.n===1 || (ex.t==='mate' && R.ply>0)){
    var ms = b.game.moves({verbose:true}).filter(function(m){return /#/.test(m.san);});
    if(ms.length) first = ms[0].from+ms[0].to;
  }
  if(!first){ exMsg('gold','💡 Cherche les échecs et les captures en premier.'); return; }
  if(R.hints===1){ b.hl=[first.slice(0,2)]; b.redraw(); exMsg('gold','💡 Regarde la pièce en surbrillance : c\'est elle qu\'il faut jouer.'); }
  else { b.hl=[first.slice(0,2)]; b.arrows=[[first.slice(0,2),first.slice(2,4)]]; b.redraw(); exMsg('gold','💡 Voici le coup à jouer.'); R.shown=true; }
}
function exSolution(){
  var R=EX; if(!R||R.over) return; R.shown=true; exHint(); if(R.hints<2){ R.hints=2; exHint(); }
  R.over=true; R.result={ok:false,errs:R.errs}; if(R.board) R.board.locked=true;
  exMsg('gold','Solution affichée. '+esc(R.ex.why||'')); exButtons();
}

/* ---------- vue étape de leçon (diagramme + texte) ---------- */
var SEQ = null;
function stepView(et, L, si){
  var h = '<div class="card"><h2>'+esc(et.h)+'</h2>';
  (et.p||[]).forEach(function(p){ h += '<p>'+esc(p)+'</p>'; });
  if(et.fen){
    if(et.seq){
      var fens=[et.fen], g=new Chess(et.fen);
      et.seq.forEach(function(u){ g.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]}); fens.push(g.fen()); });
      var b = new Board({fen:et.fen, hl:et.hl, arrows:et.ar});
      SEQ = { fens:fens, seq:et.seq, san:et.san, i:0, board:b, timer:null };
      h += boardSlot(b);
      h += '<div class="row" style="justify-content:center;gap:8px;margin:2px 0 8px"><button class="btn ghost sm" data-act="sq-first" aria-label="Début">⏮</button><button class="btn ghost sm" data-act="sq-prev" aria-label="Précédent">◀</button><button class="btn sm" data-act="sq-play" id="sq-play">▶ Lecture</button><button class="btn ghost sm" data-act="sq-next" aria-label="Suivant">▶|</button></div>';
      h += '<div class="moves center" id="sq-moves"></div>';
    } else {
      SEQ = null;
      var b2 = new Board({fen:et.fen, hl:et.hl, dots:et.dots, arrows:et.ar});
      h += boardSlot(b2);
      if(et.cap) h += '<div class="bcap">'+esc(et.cap)+'</div>';
    }
  } else SEQ = null;
  h += '</div>';
  return h;
}
function seqRender(){
  if(!SEQ) return; var b=SEQ.board;
  b.game = new Chess(SEQ.fens[SEQ.i]);
  b.last = SEQ.i>0 ? [SEQ.seq[SEQ.i-1].slice(0,2), SEQ.seq[SEQ.i-1].slice(2,4)] : null;
  if(SEQ.i>0){ b.hl=[]; b.arrows=[]; }
  b.redraw();
  var m=$('#sq-moves'); if(m){
    var h='';
    var startNo = parseInt(SEQ.fens[0].split(' ')[5],10)||1; var white = SEQ.fens[0].split(' ')[1]==='w';
    var num=startNo;
    SEQ.san.forEach(function(s,k){
      if(white){ h += '<span class="mv-n">'+num+'.</span> '; }
      else if(k===0){ h += '<span class="mv-n">'+num+'…</span> '; }
      h += '<span class="mv'+(SEQ.i===k+1?' on':'')+'">'+esc(fr(s))+'</span> ';
      if(!white) num++; white=!white;
    });
    m.innerHTML = h;
  }
}
function seqStop(){ if(SEQ&&SEQ.timer){ clearInterval(SEQ.timer); SEQ.timer=null; var bt=$('#sq-play'); if(bt) bt.textContent='▶ Lecture'; } }
function seqGo(d){ if(!SEQ) return; seqStop(); SEQ.i=Math.max(0,Math.min(SEQ.seq.length,SEQ.i+d)); seqRender(); }
function seqPlay(){
  if(!SEQ) return;
  if(SEQ.timer){ seqStop(); return; }
  if(SEQ.i>=SEQ.seq.length) SEQ.i=0;
  seqRender(); var bt=$('#sq-play'); if(bt) bt.textContent='⏸ Pause';
  SEQ.timer = setInterval(function(){
    if(!SEQ) return;
    if(SEQ.i>=SEQ.seq.length){ seqStop(); return; }
    SEQ.i++; seqRender();
  }, 1100);
}

/* ---------- vues ---------- */
var V = { tab:'home' };
var TABS = [['home','🏠','Accueil'],['cours','📚','Cours'],['puz','🧩','Exercices'],['jouer','♟️','Jouer'],['prog','📈','Progrès']];
function go(v){ seqStop(); V=v; EX=null; render(); window.scrollTo(0,0); }
function renderChrome(){
  var st = streak();
  $('#top-r').innerHTML = (st>0?'<span class="chip gold">🔥 '+st+' jour'+(st>1?'s':'')+'</span>':'');
  var h=''; TABS.forEach(function(t){ h += '<button class="tab'+(V.tab===t[0]?' on':'')+'" data-act="tab" data-t="'+t[0]+'"><span class="ic">'+t[1]+'</span>'+t[2]+'</button>'; });
  $('#tabs').innerHTML = h;
}
function render(){
  var html;
  if(!S.name && !S.skipName){ html = viewWelcome(); $('#tabs').innerHTML=''; $('#top-r').innerHTML=''; }
  else {
    renderChrome();
    switch(V.tab){
      case 'home': html = viewHome(); break;
      case 'cours': html = V.page==='lesson' ? viewLesson() : (V.page==='tech' ? viewTech() : viewCours()); break;
      case 'test': html = viewTest(); break;
      case 'puz': html = viewPuz(); break;
      case 'jouer': html = viewGame(); break;
      case 'prog': html = viewProg(); break;
      default: html = viewHome();
    }
  }
  $('#app').innerHTML = html;
  mountAll();
  if(SEQ && SEQ.board) seqRender();
  fitBoards();
}

function viewWelcome(){
  return '<div class="card hero" style="margin-top:20px"><div style="font-size:3rem;line-height:1">♞</div><h1 style="color:#fff;margin-top:8px">J\'apprends les échecs</h1><p>Un test de niveau, 13 leçons interactives, des exercices, des fiches techniques et des parties contre l\'ordinateur. Tout fonctionne sans connexion, sur ton téléphone ou ton ordinateur.</p></div>'+
  '<div class="card"><h3>Comment t\'appelles-tu ?</h3><p class="muted small">Seulement pour te saluer. Ça reste sur cet appareil.</p><input type="text" id="nm" placeholder="Ton prénom" maxlength="30" autocomplete="off"><div style="height:10px"></div><button class="btn block" data-act="setname">Commencer →</button></div>';
}

function viewHome(){
  var nl = nextLesson(), tr = testResult(), done = D.lessons.filter(function(l){return lessonDone(l.id);}).length;
  var h = '<div class="card hero"><h1 style="color:#fff">Bonjour'+(S.name?' '+esc(S.name):'')+' ! 👋</h1>';
  if(!S.test.done && !S.test.run){
    h += '<p>Commence par un test de niveau (environ 15 minutes) : il choisit les leçons qu\'il te faut. Tu peux aussi aller directement aux leçons.</p><div class="row wrap"><button class="btn" data-act="gotest">🎓 Faire le test de niveau</button><button class="btn ghost" data-act="tab" data-t="cours">Voir les leçons</button></div>';
  } else if(S.test.run && !S.test.done){
    h += '<p>Ton test de niveau est en cours.</p><button class="btn" data-act="gotest">Reprendre le test</button>';
  } else if(nl){
    h += '<p>Prochaine étape conseillée :</p><div class="row" style="margin:6px 0 12px"><span style="font-size:2rem">'+nl.emoji+'</span><div><b>Leçon '+nl.n+' — '+esc(nl.titre)+'</b><div class="small" style="opacity:.85">'+esc(nl.niveau)+' · '+esc(nl.duree)+'</div></div></div><button class="btn" data-act="openlesson" data-id="'+nl.id+'">Continuer →</button>';
  } else {
    h += '<p>Tu as terminé tout le cours, bravo ! Continue avec les exercices et les parties contre l\'ordinateur.</p><button class="btn" data-act="tab" data-t="puz">Faire des exercices</button>';
  }
  h += '</div>';
  // exercices du jour
  var dd = S.daily && S.daily.date===today() && S.daily.done;
  h += '<div class="card"><div class="row sp"><div class="grow"><h3>🧩 Exercices du jour</h3><p class="muted small" style="margin:0">5 exercices choisis pour toi (15 minutes en tout).</p></div>'+(dd?'<span class="chip good">✔ Fait</span>':'')+'</div><div style="height:10px"></div><button class="btn '+(dd?'sec':'')+' block" data-act="daily">'+(dd?'Refaire une série':'Commencer la série')+'</button></div>';
  // jouer
  h += '<div class="card row"><div style="font-size:1.8rem">♟️</div><div class="grow"><b>Une partie contre l\'ordinateur ?</b><div class="small muted">4 niveaux, du plus facile au plus fort.</div></div><button class="btn sec sm" data-act="tab" data-t="jouer">Jouer</button></div>';
  // technique du jour
  var t = D.tech[dayNum() % D.tech.length];
  h += '<div class="card soft"><div class="small muted" style="margin-bottom:2px">Technique du jour</div><div class="row"><span style="font-size:1.6rem">'+t.emoji+'</span><div class="grow"><b>'+esc(t.titre)+'</b><div class="small">'+esc(t.resume)+'</div></div></div><div style="height:8px"></div><button class="btn sm sec" data-act="opentech" data-id="'+t.id+'">Lire la fiche</button></div>';
  // stats
  var ps = puzStats(), gs = gameStats();
  h += '<div class="grid2"><div class="stat"><b>'+done+'/'+D.lessons.length+'</b><span class="small muted">leçons</span></div><div class="stat"><b>'+ps.ok+'</b><span class="small muted">exercices réussis</span></div></div>';
  if(tr) h += '<p class="small muted center" style="margin-top:12px">Dernier test : '+esc(tr.level)+' ('+tr.score+'/'+tr.total+')</p>';
  return h;
}

function viewCours(){
  var h = '<div class="seg"><button class="'+(V.sub!=='tech'?'on':'')+'" data-act="sub" data-s="l">📚 Leçons</button><button class="'+(V.sub==='tech'?'on':'')+'" data-act="sub" data-s="tech">🧠 Techniques</button></div>';
  if(V.sub==='tech'){
    h += '<p class="muted small">Des méthodes de réflexion pour progresser, courtes et pratiques.</p><div class="list">';
    D.tech.forEach(function(t){ h += '<button class="item" data-act="opentech" data-id="'+t.id+'"><span class="em">'+t.emoji+'</span><span class="grow"><div class="tt">'+esc(t.titre)+'</div><div class="sub">'+esc(t.resume)+'</div></span>'+(S.tech[t.id]?'<span class="chip good">✔</span>':'')+'</button>'; });
    h += '</div>';
    return h;
  }
  var nl = nextLesson();
  h += '<div class="list">';
  D.lessons.forEach(function(l){
    var st = S.lessons[l.id], chips='';
    if(st&&st.done) chips += '<span class="stars">'+'★'.repeat(st.stars||1)+'<span style="opacity:.25">'+'★'.repeat(3-(st.stars||1))+'</span></span>';
    else if(lessonAcquired(l.id)) chips += '<span class="chip good">Acquis au test</span>';
    else if(nl && nl.id===l.id) chips += '<span class="chip gold">Conseillée</span>';
    h += '<button class="item" data-act="openlesson" data-id="'+l.id+'"><span class="em">'+l.emoji+'</span><span class="grow"><div class="tt">'+l.n+'. '+esc(l.titre)+'</div><div class="sub">'+esc(l.niveau)+' · '+esc(l.duree)+'</div></span>'+chips+'</button>';
  });
  h += '</div>';
  return h;
}

function viewLesson(){
  var L = lessonById(V.id), h = '';
  h += '<button class="back" data-act="backcours">← Cours</button>';
  if(V.phase==='steps'){
    var n = L.etapes.length;
    h += '<div class="row sp" style="margin-bottom:6px"><span class="chip">'+L.emoji+' Leçon '+L.n+'</span><span class="small muted">Étape '+(V.step+1)+'/'+n+'</span></div>';
    if(V.step===0){ h += '<h1>'+esc(L.titre)+'</h1><div class="card soft"><b>Objectifs</b><ul style="margin:6px 0 0;padding-left:20px">'+L.objectifs.map(function(o){return '<li>'+esc(o)+'</li>';}).join('')+'</ul></div>'; }
    h += stepView(L.etapes[V.step], L, V.step);
    h += '<div class="row" style="margin-top:6px">'+(V.step>0?'<button class="btn ghost" data-act="lprev">←</button>':'')+'<button class="btn grow" data-act="lnext">'+(V.step===n-1?'Passer aux exercices →':'Suivant →')+'</button></div>';
  } else if(V.phase==='ex'){
    var N = L.ex.length, ex = L.ex[V.ei];
    h += '<div class="row sp" style="margin-bottom:8px"><span class="chip">'+L.emoji+' '+esc(L.titre)+'</span></div><div class="bar" style="margin-bottom:12px"><i style="width:'+Math.round(V.ei/N*100)+'%"></i></div>';
    h += exView(ex, {mode:'lesson', label:'Exercice '+(V.ei+1)+'/'+N, last: V.ei===N-1});
  } else {
    var ok = V.res.filter(Boolean).length, tot = V.res.length, r = tot?ok/tot:1;
    var stars = r>=0.85?3:(r>=0.6?2:1);
    h += '<div class="card center"><div style="font-size:2.6rem">'+(stars===3?'🏆':(stars===2?'🎉':'👍'))+'</div><h2>Leçon terminée !</h2><div class="stars" style="font-size:1.8rem">'+'★'.repeat(stars)+'<span style="opacity:.25">'+'★'.repeat(3-stars)+'</span></div><p>'+ok+' réussi'+(ok>1?'s':'')+' du premier coup sur '+tot+'.</p></div>';
    h += '<div class="card gold"><b>💡 À retenir</b><p style="margin:6px 0 0">'+esc(L.conseil)+'</p></div>';
    var nxt = D.lessons[L.n]; // leçon suivante
    h += '<div class="list">'+(nxt?'<button class="btn block" data-act="openlesson" data-id="'+nxt.id+'">Leçon suivante : '+esc(nxt.titre)+' →</button>':'')+'<button class="btn sec block" data-act="openlesson" data-id="'+L.id+'">Refaire cette leçon</button><button class="btn ghost block" data-act="backcours">Retour au cours</button></div>';
  }
  return h;
}
function finishLesson(){
  var L = lessonById(V.id), ok = V.res.filter(Boolean).length, tot = V.res.length, r = tot?ok/tot:1;
  var stars = r>=0.85?3:(r>=0.6?2:1), old = S.lessons[L.id]||{};
  S.lessons[L.id] = {done:true, stars:Math.max(old.stars||0,stars), ratio:Math.max(old.ratio||0,r), date:today()};
  log('lesson', 'Leçon '+L.n+' — '+L.titre+' ('+ok+'/'+tot+')'); save();
}
function viewTech(){
  var t = null; D.tech.forEach(function(x){ if(x.id===V.id) t=x; });
  var h = '<button class="back" data-act="backtech">← Techniques</button><div class="card"><div class="row"><span style="font-size:2rem">'+t.emoji+'</span><h2 style="margin:0">'+esc(t.titre)+'</h2></div><p class="muted">'+esc(t.resume)+'</p><ul style="padding-left:20px;margin:0 0 10px">'+t.points.map(function(p){return '<li style="margin-bottom:6px">'+esc(p)+'</li>';}).join('')+'</ul>';
  if(t.exemple){ var b = new Board({fen:t.exemple.fen, hl:t.exemple.hl}); h += boardSlot(b)+'<div class="bcap">'+esc(t.exemple.txt)+'</div>'; }
  h += '<div class="msg gold">💡 '+esc(t.astuce)+'</div></div>';
  h += exView({t:'mcq', q:t.quiz.q, o:t.quiz.o, why:t.quiz.why}, {mode:'lesson', label:'Teste-toi', last:true, tech:t.id});
  return h;
}

/* ---------- test de niveau ---------- */
var LEVEL_TEXT = {
  'Débutant': "Tu découvres le jeu : on commence par les bases (échiquier, pièces, règles). Aucun souci, tout le monde est passé par là !",
  'Débutant confirmé': "Tu connais les règles de base. Il est temps de travailler les mats simples, les échanges et l'ouverture.",
  'Intermédiaire': "Tu maîtrises les règles et tu vois déjà quelques tactiques. Place aux combinaisons, aux finales et à la stratégie.",
  'Avancé': "Très bon niveau ! Concentre-toi sur la stratégie, les finales et les parties contre l'ordinateur au niveau Fort."
};
var SEC_NAME = {r:'Règles', p:'Pratique', t:'Tactique et stratégie'};
function viewTest(){
  var T = D.test, h = '';
  if(V.phase==='result'){ return viewTestResult(); }
  if(V.phase==='q' && S.test.run){
    var i = S.test.run.i, ex = T[i];
    h += '<div class="row sp" style="margin-bottom:8px"><span class="chip">🎓 Test de niveau</span><button class="btn ghost sm" data-act="tpause">Pause</button></div><div class="bar" style="margin-bottom:12px"><i style="width:'+Math.round(i/T.length*100)+'%"></i></div>';
    h += exView(ex, {mode:'test', label:'Question '+(i+1)+'/'+T.length, onDone:function(res){ testAnswer(res.ok); }});
    return h;
  }
  h += '<button class="back" data-act="tab" data-t="home">← Accueil</button><div class="card"><h1>🎓 Test de niveau</h1><p>'+T.length+' questions, environ 15 minutes : règles, petits exercices sur l\'échiquier, tactiques. À la fin, tu connais ton niveau et les leçons à travailler.</p><ul style="padding-left:20px"><li>Pas de panique : ce n\'est pas noté à l\'école.</li><li>Réponds seul(e), sans aide, pour que le résultat soit juste.</li><li>Si tu ne sais pas, touche « Je ne sais pas ».</li><li>Tu peux faire une pause et reprendre plus tard.</li></ul>';
  if(S.test.run){ h += '<button class="btn block" data-act="tresume">Reprendre (question '+(S.test.run.i+1)+')</button><div style="height:8px"></div><button class="btn ghost block" data-act="tstart">Recommencer à zéro</button>'; }
  else h += '<button class="btn block" data-act="tstart">C\'est parti !</button>';
  h += '</div>';
  if(S.test.last){ h += '<div class="card soft"><b>Dernier résultat</b><div>'+esc(S.test.last.level)+' — '+S.test.last.score+'/'+S.test.last.total+' ('+fmtDate(S.test.last.date)+')</div><div style="height:8px"></div><button class="btn sm sec" data-act="tshow">Revoir le détail</button></div>'; }
  return h;
}
function testAnswer(ok){
  var run = S.test.run; if(!run) return;
  run.ans[run.i] = ok?1:0; run.i++; save();
  var wait = EX && EX.ex && (EX.ex.t==='mv'||EX.ex.t==='mate') ? 700 : 350;
  setTimeout(function(){
    if(run.i>=D.test.length) finishTest(); else render();
    window.scrollTo(0,0);
  }, wait);
}
function finishTest(){
  var run = S.test.run, T = D.test, score=0, sec={r:[0,0],p:[0,0],t:[0,0]}, by={}, wrong=[];
  T.forEach(function(q,i){ var ok = run.ans[i]===1; sec[q.sec][1]++; if(ok){ sec[q.sec][0]++; score++; } else wrong.push(q.id); if(!by[q.les]) by[q.les]=[0,0]; by[q.les][1]++; if(ok) by[q.les][0]++; });
  var level = levelLabel(score/T.length);
  S.test.last = {date:today(), score:score, total:T.length, level:level, sec:sec, byLesson:by, wrong:wrong};
  S.test.history.push({date:today(), score:score, total:T.length, level:level});
  S.test.done = true; S.test.run = null; log('test','Test de niveau : '+score+'/'+T.length+' — '+level); save();
  V = {tab:'test', phase:'result'}; render(); window.scrollTo(0,0);
}
function viewTestResult(){
  var r = S.test.last, h = '';
  var pct = Math.round(r.score/r.total*100);
  h += '<div class="card hero center"><div style="font-size:2.6rem">🎓</div><p style="margin:0;opacity:.85">Ton niveau</p><h1 style="color:#fff;font-size:2rem">'+esc(r.level)+'</h1><p style="margin:0">'+r.score+' bonnes réponses sur '+r.total+' ('+pct+' %)</p></div>';
  h += '<div class="card"><p>'+esc(LEVEL_TEXT[r.level])+'</p></div>';
  h += '<div class="card"><h3>Détail par domaine</h3>';
  ['r','p','t'].forEach(function(k){ var a=r.sec[k], p=a[1]?Math.round(a[0]/a[1]*100):0; h += '<div style="margin:8px 0"><div class="row sp small"><span>'+SEC_NAME[k]+'</span><b>'+a[0]+'/'+a[1]+'</b></div><div class="bar"><i style="width:'+p+'%"></i></div></div>'; });
  h += '</div>';
  var todo = D.lessons.filter(function(l){ var b=r.byLesson[l.id]; return b && b[0]<b[1]; });
  var nl = nextLesson();
  h += '<div class="card"><h3>Par quoi commencer ?</h3>';
  if(todo.length){ h += '<p class="small muted">Leçons à travailler d\'après tes erreurs :</p><div class="list">'+todo.slice(0,5).map(function(l){return '<button class="item" data-act="openlesson" data-id="'+l.id+'"><span class="em">'+l.emoji+'</span><span class="grow"><div class="tt">'+l.n+'. '+esc(l.titre)+'</div><div class="sub">'+esc(l.niveau)+' · '+esc(l.duree)+'</div></span></button>';}).join('')+'</div>'; }
  else h += '<p>Aucune erreur dans les domaines testés. Passe directement aux leçons avancées et aux exercices !</p>';
  h += '</div>';
  if(nl) h += '<button class="btn block" data-act="openlesson" data-id="'+nl.id+'">Commencer : leçon '+nl.n+' →</button>';
  h += '<div style="height:10px"></div><button class="btn ghost block" data-act="treview">'+(V.review?'Masquer la correction':'Voir la correction des erreurs')+'</button>';
  if(V.review){
    h += '<div style="height:10px"></div>';
    var wr = D.test.filter(function(q){ return r.wrong.indexOf(q.id)>=0; });
    if(!wr.length) h += '<div class="card">Aucune erreur 🎉</div>';
    wr.forEach(function(q){
      var ans = q.t==='mcq' ? 'Bonne réponse : <b>'+esc(q.o[0])+'</b>' : (q.t==='sq' ? 'Bonne case : <b>'+esc(q.a[0])+'</b>' : (q.t==='mate' ? 'Il fallait trouver le mat (voir la leçon).' : 'Coup attendu : <b>'+esc(q.sol? sanOf(q.fen,q.sol[0]) : '')+'</b>'));
      h += '<div class="card"><b>'+esc(q.q)+'</b><p class="small" style="margin:6px 0 0">'+ans+'. '+esc(q.why||'')+'</p></div>';
    });
  }
  return h;
}
function sanOf(fen,uci){ try{ var c=new Chess(fen); return fr(c.move({from:uci.slice(0,2),to:uci.slice(2,4),promotion:uci[4]}).san); }catch(e){ return uci; } }

/* ---------- exercices (banque) ---------- */
var THEMES = [['all','🎲','Série mélangée','Un peu de tout, adapté à ton niveau'],['mat1','♚','Mat en 1 coup','Trouve le coup qui mate'],['mat2','♛','Mat en 2 coups','Prépare le mat en deux temps'],['materiel','⚖️','Gagner du matériel','Pièces en prise, captures, échanges'],['tactique','⚔️','Tactiques classiques','Fourchette, clouage, découverte, pièges']];
function puzById(id){ for(var i=0;i<D.bank.length;i++) if(D.bank[i].id===id) return D.bank[i]; }
function selectPuz(theme, n){
  var lv = levelNum(), t = today();
  var pool = D.bank.filter(function(p){ return theme==='all' || p.th===theme; });
  var scored = pool.map(function(p){
    var rec = S.puz[p.id], sc;
    if(!rec) sc = 200 - Math.abs(p.lv-lv)*35 + Math.random()*20;
    else if(rec.due && rec.due<=t && (rec.box||0)<4) sc = 300 - (rec.box||0)*20 + Math.random()*10;
    else sc = 40 + Math.random()*30 - (rec.box||0)*5;
    return {p:p, sc:sc};
  }).sort(function(a,b){return b.sc-a.sc;});
  var out=[], cnt={};
  scored.forEach(function(x){ if(out.length>=n) return; var c = cnt[x.p.th]||0; if(theme==='all' && c>=Math.ceil(n/2)) return; cnt[x.p.th]=c+1; out.push(x.p.id); });
  scored.forEach(function(x){ if(out.length<n && out.indexOf(x.p.id)<0) out.push(x.p.id); });
  return shuffle(out);
}
function updatePuz(id, ok){
  var r = S.puz[id] || {ok:0,bad:0,box:0}; var iv=[0,1,3,7,21];
  if(ok){ r.ok++; r.box=Math.min(4,(r.box||0)+1); r.due=addDays(today(), iv[r.box]); } else { r.bad++; r.box=0; r.due=addDays(today(),1); }
  r.last = today(); S.puz[id]=r; touchDay(); save();
}
function viewPuz(){
  var h = '';
  if(V.page==='run' && V.pz){
    var P=V.pz, N=P.ids.length;
    if(P.i>=N){
      var ok=P.res.filter(Boolean).length;
      h += '<div class="card center"><div style="font-size:2.4rem">'+(ok>=N*0.8?'🏆':(ok>=N/2?'🎉':'💪'))+'</div><h2>Série terminée</h2><p>'+ok+' réussi'+(ok>1?'s':'')+' du premier coup sur '+N+'.</p><p class="muted small">Les exercices ratés reviendront bientôt pour que tu les retiennes.</p></div>';
      h += '<button class="btn block" data-act="prun" data-th="'+P.theme+'" data-n="'+(P.daily?5:8)+'">Une autre série</button><div style="height:8px"></div><button class="btn ghost block" data-act="pmenu">Retour aux thèmes</button>';
      return h;
    }
    var ex = puzById(P.ids[P.i]);
    h += '<div class="row sp" style="margin-bottom:8px"><button class="back" data-act="pmenu" style="margin:0">← Quitter</button><span class="small muted">'+(P.i+1)+'/'+N+'</span></div><div class="bar" style="margin-bottom:12px"><i style="width:'+Math.round(P.i/N*100)+'%"></i></div>';
    h += exView(ex, {mode:'puz', label:(P.daily?'Exercice du jour ':'Exercice ')+(P.i+1)+'/'+N, last:P.i===N-1, pid:ex.id});
    return h;
  }
  var ps = puzStats();
  h += '<h1>🧩 Exercices</h1><p class="muted">Résous des problèmes pour t\'entraîner. Ceux que tu rates reviennent plus tard. ('+ps.solved+' résolus sur '+D.bank.length+')</p><div class="list">';
  THEMES.forEach(function(t){
    var pool = D.bank.filter(function(p){return t[0]==='all'||p.th===t[0];}), sv = pool.filter(function(p){return S.puz[p.id]&&S.puz[p.id].ok>0;}).length;
    h += '<button class="item" data-act="prun" data-th="'+t[0]+'" data-n="8"><span class="em">'+t[1]+'</span><span class="grow"><div class="tt">'+t[2]+'</div><div class="sub">'+t[3]+'</div><div class="bar" style="margin-top:6px"><i style="width:'+Math.round(sv/Math.max(1,pool.length)*100)+'%"></i></div></span><span class="small muted">'+sv+'/'+pool.length+'</span></button>';
  });
  h += '</div>';
  return h;
}
function startPuz(theme, n, daily){ V = {tab:'puz', page:'run', pz:{theme:theme, ids:selectPuz(theme,n), i:0, res:[], daily:!!daily}}; render(); window.scrollTo(0,0); }

/* ---------- jouer contre l'ordinateur ---------- */
var GM = null;
var LV = [[1,'🌱','Débutant','L\'ordinateur fait des erreurs : idéal pour débuter.'],[2,'🙂','Facile','Il voit les menaces simples.'],[3,'😎','Moyen','Il calcule quelques coups à l\'avance.'],[4,'🔥','Fort','Il réfléchit plus longtemps : sois attentif !']];
function lvName(n){ return LV[n-1][2]; }
function gameInit(){
  var b = new Board({fen:START, flip:S.cur.color==='b', interactive:true, onMove:gameMove});
  S.cur.moves.forEach(function(u){ b.game.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]}); });
  var hs = b.game.history({verbose:true}); if(hs.length) b.last=[hs[hs.length-1].from, hs[hs.length-1].to];
  GM = {board:b, over:false, thinking:false, hints:0};
}
function viewGame(){
  var h='';
  if(V.g && V.g.mode==='over' && GM){ return viewGameOver(); }
  if(S.cur && !(V.g && V.g.mode==='setup')){
    if(!GM || GM.over) gameInit();
    var b = GM.board;
    h += '<div class="row sp wrap" style="margin-bottom:8px"><span class="chip">♟️ '+lvName(S.cur.level)+'</span><span class="chip mute">Tu joues les '+(S.cur.color==='w'?'Blancs':'Noirs')+'</span></div>';
    h += '<div id="gstat" class="msg info" style="margin:0 0 8px">'+gameStatus()+'</div>';
    h += boardSlot(b);
    h += '<div class="row wrap" style="justify-content:center;margin-bottom:6px"><button class="btn ghost sm" data-act="g-undo">↩ Annuler</button><button class="btn sec sm" data-act="g-hint">💡 Conseil</button><button class="btn ghost sm" data-act="g-resign">🏳 Abandonner</button></div>';
    h += '<div class="card"><div class="small muted" style="margin-bottom:4px">Coups joués</div><div class="moves" id="gmoves">'+gameMoves()+'</div></div>';
    setTimeout(function(){ if(GM && !GM.over && !GM.thinking && b.game.turn()!==S.cur.color && !b.game.isGameOver()) engineReply(); }, 50);
    return h;
  }
  h += '<h1>♟️ Jouer</h1><p class="muted">Une partie complète contre l\'ordinateur. Choisis ton adversaire :</p>';
  var gs = gameStats();
  if(gs.n) h += '<p class="small muted">Tes parties : '+gs.w+' victoire'+(gs.w>1?'s':'')+', '+gs.d+' nulle'+(gs.d>1?'s':'')+', '+gs.l+' défaite'+(gs.l>1?'s':'')+'.</p>';
  h += '<div class="list" id="lvl">';
  var sl = V.g && V.g.level || 1;
  LV.forEach(function(l){ h += '<button class="item'+(sl===l[0]?' selected':'')+'" data-act="g-lvl" data-l="'+l[0]+'" style="'+(sl===l[0]?'border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-soft)':'')+'"><span class="em">'+l[1]+'</span><span class="grow"><div class="tt">'+l[2]+'</div><div class="sub">'+l[3]+'</div></span>'+(sl===l[0]?'<span class="chip">✔</span>':'')+'</button>'; });
  h += '</div><div style="height:12px"></div><b>Ta couleur</b><div class="row wrap" style="margin:8px 0 14px"><button class="btn sec grow" data-act="g-start" data-c="w">⚪ Blancs</button><button class="btn sec grow" data-act="g-start" data-c="b">⚫ Noirs</button><button class="btn sec grow" data-act="g-start" data-c="r">🎲 Hasard</button></div><p class="small muted">Les Blancs commencent. Tu peux demander un conseil ou annuler un coup à tout moment.</p>';
  return h;
}
function gameStatus(){
  if(!GM) return '';
  var g = GM.board.game;
  if(GM.thinking) return '⏳ L\'ordinateur réfléchit…';
  if(g.isCheckmate()||g.isDraw()) return 'Partie terminée';
  var mine = g.turn()===S.cur.color;
  return (mine?'À toi de jouer':'Au tour de l\'ordinateur')+(g.inCheck()?' — <b>échec !</b>':'');
}
function gameMoves(){
  if(!GM) return ''; var hs = GM.board.game.history(), h='';
  for(var i=0;i<hs.length;i++){ if(i%2===0) h += '<span class="mv-n">'+(i/2+1)+'.</span> '; h += '<span class="mv'+(i===hs.length-1?' on':'')+'">'+esc(fr(hs[i]))+'</span> '; }
  return h||'<span class="muted">Aucun coup pour l\'instant.</span>';
}
function updateGameUI(){ var s=$('#gstat'); if(s) s.innerHTML=gameStatus(); var m=$('#gmoves'); if(m) m.innerHTML=gameMoves(); }
function gameMove(uci){
  if(!GM||GM.over||GM.thinking) return; var b=GM.board;
  if(b.game.turn()!==S.cur.color) return;
  b.arrows=[]; b.apply(uci); S.cur.moves.push(uci); save(); updateGameUI();
  if(checkEnd()) return; engineReply();
}
function engineReply(){
  if(!GM||GM.over||GM.thinking) return; var b=GM.board; if(b.game.isGameOver()) { checkEnd(); return; }
  GM.thinking=true; b.locked=true; updateGameUI();
  setTimeout(function(){
    if(!GM||GM.over) return;
    var u = Engine.pickMove(b.game.fen(), S.cur.level);
    GM.thinking=false; b.locked=false;
    if(u){ b.apply(u); S.cur.moves.push(u); save(); }
    updateGameUI(); checkEnd();
  }, 120);
}
function checkEnd(){
  var g=GM.board.game;
  if(g.isCheckmate()){ var winner = g.turn()==='w'?'b':'w'; gameOver(winner===S.cur.color?'win':'loss','Échec et mat !'); return true; }
  if(g.isStalemate()){ gameOver('draw','Pat : partie nulle.'); return true; }
  if(g.isThreefoldRepetition()){ gameOver('draw','Nulle par répétition de position.'); return true; }
  if(g.isInsufficientMaterial()){ gameOver('draw','Nulle : matériel insuffisant pour mater.'); return true; }
  if(g.isDraw()){ gameOver('draw','Nulle (règle des 50 coups).'); return true; }
  return false;
}
function gameOver(res, why){
  GM.over=true; GM.res=res; GM.why=why; GM.finalMoves=S.cur.moves.slice(); GM.color=S.cur.color; GM.level=S.cur.level;
  S.games.push({date:today(), level:S.cur.level, color:S.cur.color, res:res, plies:S.cur.moves.length});
  if(S.games.length>200) S.games=S.games.slice(-200);
  log('game', (res==='win'?'Victoire':(res==='loss'?'Défaite':'Nulle'))+' contre l\'ordinateur ('+lvName(S.cur.level)+')');
  S.cur=null; save(); GM.board.locked=true; GM.analysis=null;
  V = {tab:'jouer', g:{mode:'over'}}; render();
}
function viewGameOver(){
  var res=GM.res, h='';
  var emo = res==='win'?'🏆':(res==='loss'?'💪':'🤝'), tt = res==='win'?'Victoire !':(res==='loss'?'Défaite':'Partie nulle');
  h += '<div class="card center"><div style="font-size:2.6rem">'+emo+'</div><h2>'+tt+'</h2><p>'+esc(GM.why)+'</p></div>';
  h += boardSlot(GM.board);
  h += '<div class="list"><button class="btn block" data-act="g-analyse">🔎 Analyser mes coups</button><button class="btn sec block" data-act="g-new">Nouvelle partie</button></div>';
  h += '<div id="ganalysis">'+(GM.analysis||'')+'</div>';
  return h;
}
function analyseGame(){
  var out=$('#ganalysis'); if(!out) return;
  var moves=GM.finalMoves, color=GM.color, c=new Chess(), idx=0, flagged=[], mine=0;
  out.innerHTML='<div class="msg info" id="aprog">Analyse en cours… 0 %</div>';
  function step(){
    if(idx>=moves.length){ finish(); return; }
    var u=moves[idx], fen=c.fen(), turn=c.turn();
    if(turn===color){
      mine++;
      var r=Engine.rank(fen,3), played=null, best=r[0];
      r.forEach(function(x){ if(x.uci===u) played=x; });
      if(played && best && best.score-played.score>=250 && best.score<20000){
        var san=sanOf(fen,u), bsan=sanOf(fen,best.uci);
        flagged.push({n:Math.floor(idx/2)+1, san:san, best:bsan, buci:best.uci, loss:Math.round((best.score-played.score)/100), fen:fen});
      }
    }
    c.move({from:u.slice(0,2),to:u.slice(2,4),promotion:u[4]}); idx++;
    var p=$('#aprog'); if(p) p.textContent='Analyse en cours… '+Math.round(idx/moves.length*100)+' %';
    setTimeout(step, 10);
  }
  function finish(){
    flagged.sort(function(a,b){return b.loss-a.loss;}); var top=flagged.slice(0,4), h='';
    h += '<div class="card"><h3>Résultat de l\'analyse</h3><p>Sur '+mine+' coups joués, <b>'+flagged.length+'</b> grosse'+(flagged.length>1?'s':'')+' erreur'+(flagged.length>1?'s':'')+' repérée'+(flagged.length>1?'s':'')+' (≈ 2,5 points de matériel ou plus perdus).</p>';
    if(!flagged.length) h += '<p>Excellente partie, rien de grave ! Continue comme ça. 🎉</p>';
    h += '</div>';
    top.forEach(function(f){
      var bd = new Board({fen:f.fen, flip:color==='b', arrows:[[f.buci.slice(0,2),f.buci.slice(2,4)]]});
      h += '<div class="card"><b>Coup '+f.n+' : '+esc(f.san)+'</b><p class="small" style="margin:4px 0 8px">Tu perdais environ <b>'+f.loss+' point'+(f.loss>1?'s':'')+'</b>. Meilleur coup : <b>'+esc(f.best)+'</b> (flèche).</p>'+boardSlot(bd)+'</div>';
    });
    if(flagged.length) h += '<p class="small muted">Avant chaque coup, vérifie les pièces en prise : voir la fiche « La routine avant chaque coup ».</p>';
    GM.analysis=h; out.innerHTML=h; mountAll();
  }
  setTimeout(step, 30);
}

/* ---------- progrès et réglages ---------- */
function viewProg(){
  var done = D.lessons.filter(function(l){return lessonDone(l.id);}).length, ps = puzStats(), gs = gameStats(), st = streak(), tr = testResult();
  var h = '<h1>📈 Mes progrès</h1>';
  h += '<div class="card hero"><div class="row sp"><div><div style="opacity:.8" class="small">Niveau</div><h2 style="margin:0">'+(tr?esc(tr.level):'À évaluer')+'</h2></div><div class="center"><div style="font-size:1.7rem">🔥</div><div class="small">'+st+' jour'+(st>1?'s':'')+'</div></div></div>'+(tr?'<p class="small" style="margin:8px 0 0;opacity:.9">Test du '+fmtDate(tr.date)+' : '+tr.score+'/'+tr.total+'</p>':'<p class="small" style="margin:8px 0 0">Fais le test de niveau pour connaître ton niveau.</p>')+'<div style="height:10px"></div><button class="btn sm" data-act="gotest">'+(tr?'Refaire le test':'Faire le test')+'</button></div>';
  h += '<div class="grid2" style="margin-bottom:12px"><div class="stat"><b>'+done+'/'+D.lessons.length+'</b><span class="small muted">leçons terminées</span></div><div class="stat"><b>'+ps.ok+'</b><span class="small muted">exercices réussis</span></div><div class="stat"><b>'+(ps.tot?Math.round(ps.ok/ps.tot*100):0)+' %</b><span class="small muted">de réussite</span></div><div class="stat"><b>'+gs.w+'-'+gs.d+'-'+gs.l+'</b><span class="small muted">victoires-nulles-défaites</span></div></div>';
  h += '<div class="card"><h3>Médailles</h3><div class="grid2" style="grid-template-columns:repeat(3,1fr)">';
  BADGES.forEach(function(b){ var on=b.ok(); h += '<div class="badge'+(on?'':' off')+'"><span class="e">'+b.e+'</span><b>'+b.n+'</b><span class="muted">'+b.d+'</span></div>'; });
  h += '</div></div>';
  h += '<div class="card"><h3>Leçons</h3>'+D.lessons.map(function(l){ var s=S.lessons[l.id]; return '<div class="row sp small" style="padding:4px 0"><span>'+l.emoji+' '+l.n+'. '+esc(l.titre)+'</span><span>'+(s&&s.done?'<span class="stars">'+'★'.repeat(s.stars||1)+'</span>':(lessonAcquired(l.id)?'<span class="chip good">acquis</span>':'<span class="muted">—</span>'))+'</span></div>'; }).join('')+'</div>';
  if(S.test.history.length>1){ h += '<div class="card"><h3>Évolution au test</h3>'+S.test.history.map(function(t){return '<div class="row sp small" style="padding:3px 0"><span>'+fmtDate(t.date)+'</span><b>'+t.score+'/'+t.total+' — '+esc(t.level)+'</b></div>';}).join('')+'</div>'; }
  if(S.hist.length){ h += '<div class="card"><h3>Dernières activités</h3>'+S.hist.slice(0,10).map(function(x){ return '<div class="small" style="padding:3px 0"><span class="muted">'+fmtDate(x.d)+'</span> · '+esc(x.t)+'</div>'; }).join('')+'</div>'; }
  h += '<div class="card"><h3>Mon prénom</h3><div class="row"><input type="text" id="nm2" value="'+esc(S.name)+'" maxlength="30" placeholder="Ton prénom"><button class="btn sm sec" data-act="savename2">OK</button></div></div>';
  h += '<div class="card"><h3>💾 Sauvegarde</h3><p class="small muted">Ta progression est enregistrée sur cet appareil. Pour la changer de téléphone ou la protéger, copie ton code de sauvegarde et colle-le dans l\'appli de l\'autre appareil.</p><button class="btn sec block" data-act="backup">Générer mon code</button><div id="bk"></div><div style="height:10px"></div><textarea id="rs" placeholder="Colle ici un code de sauvegarde pour restaurer…"></textarea><div style="height:8px"></div><button class="btn ghost block" data-act="restore">Restaurer ce code</button><div id="rsmsg"></div></div>';
  h += '<div class="card"><h3>Remise à zéro</h3><p class="small muted">Efface toute la progression (leçons, exercices, parties, test). Pense à faire une sauvegarde avant.</p>'+(V.resetAsk?'<div class="msg bad">Es-tu sûr(e) ? Cette action est définitive.</div><div class="row"><button class="btn danger grow" data-act="reset-yes">Oui, tout effacer</button><button class="btn ghost grow" data-act="reset-no">Non</button></div>':'<button class="btn ghost block" data-act="reset">Tout remettre à zéro</button>')+'</div>';
  h += '<p class="center tiny muted">J\'apprends les échecs · version 1.0</p>';
  return h;
}

/* ---------- confirmation ---------- */
var cfmCb = null;
function confirmBox(text, yesLabel, cb){
  cfmCb = cb;
  $('#modal').innerHTML = '<div class="modal"><div class="box"><p style="font-size:1.05rem">'+esc(text)+'</p><div class="row"><button class="btn danger grow" data-act="cfm-yes">'+esc(yesLabel)+'</button><button class="btn ghost grow" data-act="cfm-no">Annuler</button></div></div></div>';
}

/* ---------- événements ---------- */
var lastSub = 'l';
document.addEventListener('click', function(e){
  var t = e.target;
  var sqEl = t.closest && t.closest('.sq');
  if(sqEl){ var bd = sqEl.closest('.board'); if(bd && boards[bd.id]){ boards[bd.id].click(sqEl.getAttribute('data-sq')); return; } }
  var el = t.closest && t.closest('[data-act]'); if(!el) return;
  var act = el.getAttribute('data-act'), d = el.dataset;
  switch(act){
    case 'tab': lastSub = V.sub||lastSub; go(d.t==='cours'?{tab:'cours', sub:lastSub}:{tab:d.t}); break;
    case 'setname': var v=($('#nm').value||'').trim(); S.name=v; if(!v) S.skipName=true; save(); render(); break;
    case 'savename2': S.name=($('#nm2').value||'').trim(); save(); render(); break;
    case 'gotest': go({tab:'test'}); break;
    case 'tstart': S.test.run={i:0,ans:[]}; save(); go({tab:'test',phase:'q'}); break;
    case 'tresume': go({tab:'test',phase:'q'}); break;
    case 'tpause': go({tab:'test'}); break;
    case 'tshow': go({tab:'test',phase:'result'}); break;
    case 'treview': V.review=!V.review; render(); break;
    case 'openlesson': go({tab:'cours', page:'lesson', id:d.id, step:0, phase:'steps', ei:0, res:[]}); break;
    case 'lnext': (function(){ var L=lessonById(V.id); seqStop(); if(V.step<L.etapes.length-1) V.step++; else { V.phase='ex'; V.ei=0; V.res=[]; if(!L.ex.length){ finishLesson(); V.phase='end'; } } render(); window.scrollTo(0,0); })(); break;
    case 'lprev': seqStop(); V.step=Math.max(0,V.step-1); render(); window.scrollTo(0,0); break;
    case 'backcours': go({tab:'cours', sub:lastSub}); break;
    case 'sub': V.sub = d.s==='tech'?'tech':'l'; lastSub=V.sub; render(); break;
    case 'opentech': go({tab:'cours', page:'tech', id:d.id, sub:'tech'}); break;
    case 'backtech': lastSub='tech'; go({tab:'cours', sub:'tech'}); break;
    case 'daily': startPuz('all',5,true); break;
    case 'prun': startPuz(d.th, +d.n, false); break;
    case 'pmenu': go({tab:'puz'}); break;
    case 'exhint': exHint(); break;
    case 'exsol': exSolution(); break;
    case 'exskip': exFinish(false); break;
    case 'opt': onExOpt(+d.k); break;
    case 'exnext': exNext(); break;
    case 'promo': (function(){ var cb=promoCb; promoCb=null; $('#modal').innerHTML=''; if(cb) cb(d.p); })(); break;
    case 'sq-first': seqGo(-99); break;
    case 'sq-prev': seqGo(-1); break;
    case 'sq-next': seqGo(1); break;
    case 'sq-play': seqPlay(); break;
    case 'g-lvl': V.g = {mode:'setup', level:+d.l}; render(); break;
    case 'g-start': (function(){ var lvl=(V.g&&V.g.level)||1, c=d.c==='r'?(Math.random()<0.5?'w':'b'):d.c; S.cur={level:lvl,color:c,moves:[]}; GM=null; save(); V={tab:'jouer'}; render(); })(); break;
    case 'g-undo': (function(){ if(!GM||GM.over||GM.thinking) return; var b=GM.board, n=b.game.history().length; if(n>=2 && b.game.turn()===S.cur.color){ b.undo(); b.undo(); S.cur.moves.length=Math.max(0,S.cur.moves.length-2); save(); updateGameUI(); } })(); break;
    case 'g-hint': (function(){ if(!GM||GM.over||GM.thinking) return; var b=GM.board; if(b.game.turn()!==S.cur.color) return; var r=Engine.rank(b.game.fen(),3); if(r&&r.length){ b.arrows=[[r[0].uci.slice(0,2),r[0].uci.slice(2,4)]]; b.sel=null; b.redraw(); GM.hints++; var s=$('#gstat'); if(s) s.innerHTML='💡 Conseil : regarde la flèche. Mais demande-toi pourquoi ce coup est bon !'; } })(); break;
    case 'g-resign': confirmBox("Abandonner la partie ? Elle comptera comme une défaite.", "Abandonner", function(){ if(S.cur && GM){ gameOver('loss','Tu as abandonné.'); } }); break;
    case 'g-new': GM=null; go({tab:'jouer', g:{mode:'setup', level:(GM&&GM.level)||1}}); break;
    case 'g-analyse': analyseGame(); break;
    case 'cfm-yes': (function(){ var cb=cfmCb; cfmCb=null; $('#modal').innerHTML=''; if(cb) cb(); })(); break;
    case 'cfm-no': cfmCb=null; $('#modal').innerHTML=''; break;
    case 'backup': (function(){ var c=encodeBackup(); $('#bk').innerHTML='<textarea readonly id="bkc" onclick="this.select()">'+esc(c)+'</textarea><div style="height:6px"></div><button class="btn sm sec" data-act="copyb">Copier le code</button>'; })(); break;
    case 'copyb': (function(){ var ta=$('#bkc'); ta.select(); try{ navigator.clipboard.writeText(ta.value); }catch(er){ try{ document.execCommand('copy'); }catch(e2){} } el.textContent='Copié ✔'; })(); break;
    case 'restore': (function(){ var o=decodeBackup($('#rs').value||''); var m=$('#rsmsg'); if(!o){ m.innerHTML='<div class="msg bad">Ce code n\'est pas valide.</div>'; return; } S=o; save(); m.innerHTML='<div class="msg good">Progression restaurée ✔</div>'; setTimeout(function(){ V={tab:'prog'}; render(); }, 600); })(); break;
    case 'reset': V.resetAsk=true; render(); break;
    case 'reset-no': V.resetAsk=false; render(); break;
    case 'reset-yes': S=fresh(); S.skipName=false; GM=null; save(); V={tab:'home'}; render(); window.scrollTo(0,0); break;
  }
});
function exNext(){
  var R = EX; if(!R||!R.over) return;
  var ok = R.result ? !!R.result.ok : false;
  if(V.page==='lesson' && V.phase==='ex'){
    var L = lessonById(V.id); V.res.push(ok); V.ei++;
    if(V.ei>=L.ex.length){ finishLesson(); V.phase='end'; }
  } else if(V.page==='tech'){
    S.tech[R.opts.tech]=true; log('tech','Fiche technique lue'); save(); lastSub='tech'; go({tab:'cours', sub:'tech'}); return;
  } else if(V.tab==='puz' && V.pz){
    var P=V.pz; updatePuz(R.opts.pid, ok); P.res.push(ok); P.i++;
    if(P.i>=P.ids.length){ if(P.daily){ S.daily={date:today(),done:true}; } log('puzzle','Série d\'exercices : '+P.res.filter(Boolean).length+'/'+P.ids.length); save(); }
  }
  render(); window.scrollTo(0,0);
}
window.addEventListener('pagehide', function(){ save(); });
document.addEventListener('visibilitychange', function(){ if(document.hidden) save(); });

/* ---------- démarrage ---------- */
load();
if(S.cur && !S.cur.moves) S.cur=null;
render();
window.__echecs = { get S(){return S;}, set S(v){S=v;}, get EX(){return EX;}, get V(){return V;}, get GM(){return GM;}, render:render, go:go, D:D };
})();
