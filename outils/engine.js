/* Moteur d'échecs compact (0x88, alpha-bêta, quiescence). Sert à l'adversaire de l'appli et à la validation du contenu.
   Les règles côté interface (légalité des coups, SAN, fin de partie) restent assurées par chess.js. */
(function (root) {
  'use strict';
  var P = 1, N = 2, B = 3, R = 4, Q = 5, K = 6;
  var VAL = [0, 100, 320, 330, 500, 900, 0];
  var MATE = 30000;
  var KN = [-33, -31, -18, -14, 14, 18, 31, 33], BD = [-17, -15, 15, 17], RD = [-16, -1, 1, 16], KD = [-17, -16, -15, -1, 1, 15, 16, 17];
  var PST = [null,
    [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
    [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
    [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
    [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
    [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
    [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20]
  ];
  var KEG = [-50,-30,-30,-30,-30,-30,-30,-50, -30,-20,-10,-10,-10,-10,-20,-30, -30,-10,20,30,30,20,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,20,30,30,20,-10,-30, -30,-30,0,0,0,0,-30,-30, -50,-30,-30,-30,-30,-30,-30,-50];

  var b = new Int8Array(128), side = 1, cast = 0, ep = -1, ksq = [0, 0, 0];
  var uCap = new Int8Array(512), uCast = new Int16Array(512), uEp = new Int16Array(512), uMove = new Int32Array(512), sp = 0;
  var nodes = 0, stopAt = 0, aborted = false;
  var killers = []; for (var i = 0; i < 64; i++) killers.push([0, 0]);

  function sqName(s) { return 'abcdefgh'[s & 7] + (8 - (s >> 4)); }
  function nameSq(n) { return (8 - parseInt(n[1], 10)) * 16 + 'abcdefgh'.indexOf(n[0]); }
  function moveUci(m) { var p = (m >> 14) & 7; return sqName(m & 127) + sqName((m >> 7) & 127) + (p ? 'nbrq'[p - 2] : ''); }

  function setFen(fen) {
    b.fill(0); sp = 0; cast = 0; ep = -1;
    var parts = fen.split(' '), rows = parts[0].split('/'), r, f, ch, s;
    var map = { p: P, n: N, b: B, r: R, q: Q, k: K };
    for (r = 0; r < 8; r++) {
      f = 0;
      for (var i = 0; i < rows[r].length; i++) {
        ch = rows[r][i];
        if (ch >= '1' && ch <= '8') f += +ch;
        else { s = r * 16 + f; var t = map[ch.toLowerCase()]; b[s] = ch === ch.toUpperCase() ? t : -t; if (t === K) ksq[ch === ch.toUpperCase() ? 1 : 2] = s; f++; }
      }
    }
    side = parts[1] === 'b' ? -1 : 1;
    var c = parts[2] || '-';
    if (c.indexOf('K') >= 0) cast |= 1; if (c.indexOf('Q') >= 0) cast |= 2; if (c.indexOf('k') >= 0) cast |= 4; if (c.indexOf('q') >= 0) cast |= 8;
    ep = parts[3] && parts[3] !== '-' ? nameSq(parts[3]) : -1;
  }

  function attacked(sq, by) { // la case sq est-elle attaquée par le camp by (1 blanc / -1 noir) ?
    var i, to, p;
    if (by === 1) { if (!((sq + 15) & 0x88) && b[sq + 15] === P) return true; if (!((sq + 17) & 0x88) && b[sq + 17] === P) return true; }
    else { if (!((sq - 15) & 0x88) && b[sq - 15] === -P) return true; if (!((sq - 17) & 0x88) && b[sq - 17] === -P) return true; }
    for (i = 0; i < 8; i++) { to = sq + KN[i]; if (!(to & 0x88) && b[to] === by * N) return true; }
    for (i = 0; i < 8; i++) { to = sq + KD[i]; if (!(to & 0x88) && b[to] === by * K) return true; }
    for (i = 0; i < 4; i++) { to = sq + BD[i]; while (!(to & 0x88)) { p = b[to]; if (p) { if (p === by * B || p === by * Q) return true; break; } to += BD[i]; } }
    for (i = 0; i < 4; i++) { to = sq + RD[i]; while (!(to & 0x88)) { p = b[to]; if (p) { if (p === by * R || p === by * Q) return true; break; } to += RD[i]; } }
    return false;
  }
  function inCheck() { return attacked(ksq[side === 1 ? 1 : 2], -side); }

  function genMoves(list, scores, capsOnly, ply) {
    var n = 0, sq, p, t, to, i, d, cp, dir = side === -1 ? 16 : -16;
    function add(from, to, promo, flag, sc) { list[n] = from | (to << 7) | (promo << 14) | (flag << 17); scores[n] = sc; n++; }
    for (sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      p = b[sq]; if (p * side <= 0) continue;
      t = p < 0 ? -p : p;
      if (t === P) {
        var promoRank = side === 1 ? (sq >> 4) === 1 : (sq >> 4) === 6;
        var startRank = side === 1 ? (sq >> 4) === 6 : (sq >> 4) === 1;
        to = sq + dir;
        if (b[to] === 0) {
          if (promoRank) { for (i = Q; i >= N; i--) add(sq, to, i, 0, 8000 + VAL[i]); }
          else if (!capsOnly) { add(sq, to, 0, 0, 0); if (startRank && b[to + dir] === 0) add(sq, to + dir, 0, 4, 0); }
        }
        for (d = -1; d <= 1; d += 2) {
          to = sq + dir + d; if (to & 0x88) continue;
          cp = b[to];
          if (cp * side < 0) {
            var ca = cp < 0 ? -cp : cp;
            if (promoRank) { for (i = Q; i >= N; i--) add(sq, to, i, 0, 8000 + VAL[i] + 10 * VAL[ca]); }
            else add(sq, to, 0, 0, 10 * VAL[ca] - 1 + 1000);
          } else if (to === ep && cp === 0) add(sq, to, 0, 1, 10 * 100 + 1000);
        }
      } else if (t === N || t === K) {
        var offs = t === N ? KN : KD;
        for (i = 0; i < 8; i++) {
          to = sq + offs[i]; if (to & 0x88) continue; cp = b[to];
          if (cp === 0) { if (!capsOnly) add(sq, to, 0, 0, 0); }
          else if (cp * side < 0) { var cc = cp < 0 ? -cp : cp; add(sq, to, 0, 0, 10 * VAL[cc] - t + 1000); }
        }
      } else {
        var dirs = t === B ? BD : (t === R ? RD : KD);
        for (i = 0; i < dirs.length; i++) {
          to = sq + dirs[i];
          while (!(to & 0x88)) {
            cp = b[to];
            if (cp === 0) { if (!capsOnly) add(sq, to, 0, 0, 0); }
            else { if (cp * side < 0) { var c2 = cp < 0 ? -cp : cp; add(sq, to, 0, 0, 10 * VAL[c2] - t + 1000); } break; }
            to += dirs[i];
          }
        }
      }
    }
    if (!capsOnly) { // roques
      if (side === 1 && ksq[1] === 116 && !attacked(116, -1)) {
        if ((cast & 1) && !b[117] && !b[118] && b[119] === R && !attacked(117, -1) && !attacked(118, -1)) add(116, 118, 0, 2, 5);
        if ((cast & 2) && !b[115] && !b[114] && !b[113] && b[112] === R && !attacked(115, -1) && !attacked(114, -1)) add(116, 114, 0, 2, 5);
      } else if (side === -1 && ksq[2] === 4 && !attacked(4, 1)) {
        if ((cast & 4) && !b[5] && !b[6] && b[7] === -R && !attacked(5, 1) && !attacked(6, 1)) add(4, 6, 0, 2, 5);
        if ((cast & 8) && !b[3] && !b[2] && !b[1] && b[0] === -R && !attacked(3, 1) && !attacked(2, 1)) add(4, 2, 0, 2, 5);
      }
    }
    if (ply != null && ply < 64 && !capsOnly) {
      for (i = 0; i < n; i++) if (scores[i] === 0 || scores[i] === 5) { if (list[i] === killers[ply][0]) scores[i] = 900; else if (list[i] === killers[ply][1]) scores[i] = 800; }
    }
    return n;
  }

  function make(m) {
    var from = m & 127, to = (m >> 7) & 127, promo = (m >> 14) & 7, flag = (m >> 17) & 7;
    var piece = b[from], cap = b[to], mover = side;
    uCast[sp] = cast; uEp[sp] = ep; uMove[sp] = m;
    if (flag & 1) { var cs = to + (side === 1 ? 16 : -16); cap = b[cs]; b[cs] = 0; }
    uCap[sp] = cap; sp++;
    b[to] = promo ? promo * side : piece; b[from] = 0;
    if (piece === K * side) {
      ksq[side === 1 ? 1 : 2] = to;
      if (flag & 2) { if (to > from) { b[to - 1] = b[to + 1]; b[to + 1] = 0; } else { b[to + 1] = b[to - 2]; b[to - 2] = 0; } }
      cast &= side === 1 ? ~3 : ~12;
    }
    if (from === 119 || to === 119) cast &= ~1; if (from === 112 || to === 112) cast &= ~2;
    if (from === 7 || to === 7) cast &= ~4; if (from === 0 || to === 0) cast &= ~8;
    ep = (flag & 4) ? (from + to) >> 1 : -1;
    side = -side;
    if (attacked(ksq[mover === 1 ? 1 : 2], side)) { unmake(); return false; }
    return true;
  }
  function unmake() {
    sp--; var m = uMove[sp], from = m & 127, to = (m >> 7) & 127, promo = (m >> 14) & 7, flag = (m >> 17) & 7;
    side = -side; cast = uCast[sp]; ep = uEp[sp];
    var piece = promo ? P * side : b[to], cap = uCap[sp];
    b[from] = piece;
    if (flag & 1) { b[to] = 0; b[to + (side === 1 ? 16 : -16)] = cap; } else b[to] = cap;
    if (piece === K * side) {
      ksq[side === 1 ? 1 : 2] = from;
      if (flag & 2) { if (to > from) { b[to + 1] = b[to - 1]; b[to - 1] = 0; } else { b[to - 2] = b[to + 1]; b[to + 1] = 0; } }
    }
  }

  function evaluate() { // du point de vue du trait
    var s = 0, mat = 0, sq, p, t, idx, v;
    for (sq = 0; sq < 128; sq++) { if (sq & 0x88) { sq += 7; continue; } p = b[sq]; if (p) { t = p < 0 ? -p : p; if (t !== K) mat += VAL[t]; } }
    var eg = mat < 2600;
    for (sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      p = b[sq]; if (!p) continue;
      t = p < 0 ? -p : p;
      idx = p > 0 ? (sq >> 4) * 8 + (sq & 7) : (7 - (sq >> 4)) * 8 + (sq & 7);
      v = VAL[t] + ((t === K && eg) ? KEG[idx] : PST[t][idx]);
      s += p > 0 ? v : -v;
    }
    return side === 1 ? s : -s;
  }

  var lists = [], scs = [];
  for (var q0 = 0; q0 < 80; q0++) { lists.push(new Int32Array(256)); scs.push(new Int32Array(256)); }
  function pickBest(list, sc, n, i) { var bi = i, k; for (k = i + 1; k < n; k++) if (sc[k] > sc[bi]) bi = k; if (bi !== i) { var t = list[i]; list[i] = list[bi]; list[bi] = t; t = sc[i]; sc[i] = sc[bi]; sc[bi] = t; } }

  function quiesce(alpha, beta, ply) {
    nodes++;
    if ((nodes & 2047) === 0 && stopAt && Date.now() > stopAt) aborted = true;
    if (aborted) return 0;
    var stand = evaluate();
    if (ply >= 60) return stand;
    if (stand >= beta) return stand;
    if (stand > alpha) alpha = stand;
    var list = lists[ply], sc = scs[ply], n = genMoves(list, sc, true, null), i;
    for (i = 0; i < n; i++) {
      pickBest(list, sc, n, i);
      if (!make(list[i])) continue;
      var v = -quiesce(-beta, -alpha, ply + 1);
      unmake();
      if (v >= beta) return v;
      if (v > alpha) alpha = v;
    }
    return alpha;
  }
  function search(depth, alpha, beta, ply) {
    nodes++;
    if ((nodes & 2047) === 0 && stopAt && Date.now() > stopAt) aborted = true;
    if (aborted) return 0;
    var chk = inCheck();
    if (chk && ply < 40) depth++;
    if (depth <= 0) return quiesce(alpha, beta, ply);
    var list = lists[ply], sc = scs[ply], n = genMoves(list, sc, false, ply), i, legal = 0, best = -MATE * 2;
    for (i = 0; i < n; i++) {
      pickBest(list, sc, n, i);
      var m = list[i];
      if (!make(m)) continue;
      legal++;
      var v = -search(depth - 1, -beta, -alpha, ply + 1);
      unmake();
      if (aborted) return 0;
      if (v > best) best = v;
      if (v > alpha) alpha = v;
      if (alpha >= beta) { if (!b[(m >> 7) & 127] && ply < 64 && killers[ply][0] !== m) { killers[ply][1] = killers[ply][0]; killers[ply][0] = m; } break; }
    }
    if (legal === 0) return chk ? -MATE + ply : 0;
    return best;
  }
  // tous les coups légaux à la racine avec leur score (fenêtre complète), du meilleur au moins bon
  function rootMoves(depth, timeMs) {
    nodes = 0; aborted = false; stopAt = timeMs ? Date.now() + timeMs : 0;
    var list = new Int32Array(256), sc = new Int32Array(256), n = genMoves(list, sc, false, null), out = [], i;
    for (i = 0; i < n; i++) {
      var m = list[i]; if (!make(m)) continue;
      var v = -search(depth - 1, -MATE * 2, MATE * 2, 1);
      unmake();
      if (aborted) return null;
      out.push({ uci: moveUci(m), score: v, m: m });
    }
    out.sort(function (x, y) { return y.score - x.score; });
    return out;
  }
  // approfondissement itératif avec limite de temps
  function think(fen, maxDepth, timeMs) {
    setFen(fen);
    var best = null, d;
    for (d = 1; d <= maxDepth; d++) {
      var r = rootMoves(d, d > 2 ? timeMs : 0);
      if (!r) break; best = r;
    }
    return best;
  }
  function rank(fen, depth) { setFen(fen); return rootMoves(depth, 0); }

  // coups après lesquels les blancs/noirs (camp au trait) matent de force en <= n coups
  function mateMoves(fen, n) {
    setFen(fen);
    var list = new Int32Array(256), sc = new Int32Array(256), cnt = genMoves(list, sc, false, null), res = [], i;
    for (i = 0; i < cnt; i++) { var m = list[i]; if (!make(m)) continue; if (forcedMate(n - 1)) res.push(moveUci(m)); unmake(); }
    return res;
  }
  function forcedMate(left) { // adversaire au trait : est-il maté de force ?
    var list = new Int32Array(256), sc = new Int32Array(256), cnt = genMoves(list, sc, false, null), i, legal = 0;
    for (i = 0; i < cnt; i++) {
      if (!make(list[i])) continue;
      legal++;
      var ok = false;
      if (left > 0) {
        var l2 = new Int32Array(256), s2 = new Int32Array(256), c2 = genMoves(l2, s2, false, null), j;
        for (j = 0; j < c2 && !ok; j++) { if (!make(l2[j])) continue; if (forcedMate(left - 1)) ok = true; unmake(); }
      }
      unmake();
      if (!ok) return false;
    }
    if (legal === 0) return inCheck();
    return true;
  }
  function perft(fen, depth) {
    setFen(fen);
    function go(d) { if (d === 0) return 1; var l = new Int32Array(256), s = new Int32Array(256), c = genMoves(l, s, false, null), t = 0, i; for (i = 0; i < c; i++) { if (!make(l[i])) continue; t += go(d - 1); unmake(); } return t; }
    return go(depth);
  }
  // choix d'un coup selon le niveau (1 débutant … 4 fort) ; renvoie un coup UCI
  function pickMove(fen, level) {
    var r;
    if (level === 1) { r = rank(fen, 1); }
    else if (level === 2) { r = rank(fen, 2); }
    else if (level === 3) { r = rank(fen, 4); }
    else { r = think(fen, 6, 1800); }
    if (!r || !r.length) return null;
    var top = r[0].score, pool;
    if (level === 1) { pool = r.filter(function (x) { return x.score >= top - 200; }); if (Math.random() < 0.3) pool = r.slice(0, Math.max(4, Math.ceil(r.length / 2))); }
    else if (level === 2) pool = r.filter(function (x) { return x.score >= top - 40; });
    else pool = r.filter(function (x) { return x.score >= top - 8; });
    return pool[Math.floor(Math.random() * pool.length)].uci;
  }
  var api = { rank: rank, think: think, mateMoves: mateMoves, perft: perft, pickMove: pickMove, MATE: MATE, VAL: VAL, nodes: function () { return nodes; } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Engine = api;
})(typeof window !== 'undefined' ? window : globalThis);
