// Test de niveau : 28 questions. sec : r = règles, p = pratique, t = tactique. les = leçon à revoir en cas d'erreur.
const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const EMPTY = '8/8/8/8/8/8/8/8 w - - 0 1';
module.exports = [
  // ---- Règles ----
  { sec: 'r', les: 'l01', t: 'sq', fen: EMPTY, q: "Touche la case f6.", a: ['f6'] },
  { sec: 'r', les: 'l02', t: 'mcq', q: "Sur quelle case se place la dame blanche au départ ?", o: ["d1", "e1", "d8", "c1"], why: "La dame blanche est en d1 (la dame se place sur sa couleur)." },
  { sec: 'r', les: 'l03', t: 'mcq', q: "Comment se déplace le fou ?", o: ["En diagonale, d'autant de cases libres qu'on veut", "En L", "En ligne droite", "D'une case dans toutes les directions"], why: "Le fou se déplace en diagonale." },
  { sec: 'r', les: 'l03', t: 'mcq', fen: START, q: "Parmi ces cases, laquelle peut atteindre le cavalier g1 au premier coup ?", o: ["f3", "g3", "f2", "h2"], why: "Le cavalier saute en L : g1 → f3 ou h3 (e2 est occupée par un pion)." },
  { sec: 'r', les: 'l04', t: 'mcq', fen: '4k3/8/8/8/8/8/4r3/R3K2R w KQ - 0 1', q: "Les Blancs peuvent-ils roquer ?", o: ["Non : le roi est en échec", "Oui, côté roi", "Oui, côté dame", "Oui, des deux côtés"], why: "On ne roque jamais pour sortir d'un échec." },
  { sec: 'r', les: 'l04', t: 'mcq', q: "Qu'est-ce que la prise en passant ?", o: ["Un pion capture un pion adverse qui vient d'avancer de deux cases à côté de lui", "Un pion capture tout droit", "Un pion se transforme en dame", "Le roi capture en diagonale"], why: "C'est une capture spéciale de pion, possible seulement juste après la double avance." },
  { sec: 'r', les: 'l05', t: 'mcq', q: "Laquelle de ces actions ne permet PAS de parer un échec ?", o: ["Attaquer le roi adverse à son tour", "Déplacer le roi", "Capturer la pièce qui donne l'échec", "Interposer une pièce"], why: "Il faut sortir de l'échec immédiatement : déplacer, capturer ou interposer." },
  { sec: 'r', les: 'l05', t: 'mcq', fen: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1', q: "C'est aux Noirs de jouer. Que se passe-t-il ?", o: ["Pat : partie nulle", "Échec et mat", "Les Noirs jouent Rg8", "Les Blancs ont perdu"], why: "Le roi noir n'est pas en échec, n'a aucun coup : pat." },
  { sec: 'r', les: 'l06', t: 'mcq', q: "Quelle est la valeur approximative d'une tour (en pions) ?", o: ["5", "3", "9", "1"], why: "Pion 1, cavalier 3, fou 3, tour 5, dame 9." },
  // ---- Pratique ----
  { sec: 'p', les: 'l03', t: 'mv', fen: '7k/8/8/3p4/4P3/8/8/K7 w - - 0 1', q: "Capture le pion noir.", sol: ['e4d5'], why: "Le pion capture en diagonale." },
  { sec: 'p', les: 'l04', t: 'mv', pre: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'd3', 'Nf6'], q: "Mets ton roi à l'abri.", sol: ['e1g1'], why: "Le petit roque." },
  { sec: 'p', les: 'l04', t: 'mv', fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1', q: "Les Noirs viennent de jouer d7-d5. Capture ce pion en passant.", sol: ['e5d6'], why: "Prise en passant." },
  { sec: 'p', les: 'l04', t: 'mv', fen: '7k/4P3/8/8/8/8/8/K7 w - - 0 1', q: "Fais promouvoir ton pion en dame.", sol: ['e7e8q'], why: "Le pion arrive en e8 et devient une dame." },
  { sec: 'p', les: 'l06', t: 'mv', fen: '4k3/8/8/3n4/8/5B2/8/4K3 w - - 0 1', q: "Gagne une pièce gratuitement.", sol: ['f3d5'], why: "Le cavalier d5 n'est pas protégé." },
  { sec: 'p', les: 'l06', t: 'mcq', fen: '3qk3/8/8/8/3p4/8/8/3RK3 w - - 0 1', q: "Faut-il jouer Txd4 ?", o: ["Non : la dame reprend, je perds une tour pour un pion", "Oui : un pion gratuit", "Oui : la tour vaut plus qu'un pion"], why: "Le pion est protégé par la dame." },
  { sec: 'p', les: 'l05', t: 'mate', fen: '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1', n: 1, q: "Mat en 1 coup.", why: "Ta8# (mat du couloir)." },
  { sec: 'p', les: 'l07', t: 'mate', gen: 'KQ', n: 1, k: 2, q: "Mat en 1 coup avec dame et roi.", why: "" },
  { sec: 'p', les: 'l05', t: 'mv', fen: '4r1k1/8/8/8/8/8/8/2B1K3 w - - 0 1', q: "Ton roi est en échec : pare l'échec en interposant ton fou.", sol: ['c1e3'], why: "Fe3 s'interpose entre la tour et le roi." },
  // ---- Tactique et stratégie ----
  { sec: 't', les: 'l09', t: 'mv', fen: 'r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1', q: "Joue le coup qui gagne la tour (fourchette).", sol: ['d5c7', 'e8d7', 'c7a8'], why: "Cc7+ fourche roi et tour." },
  { sec: 't', les: 'l09', t: 'mv', fen: '4k3/8/2n1n3/8/3P4/8/8/4K3 w - - 0 1', q: "Avance ton pion pour attaquer deux pièces à la fois.", sol: ['d4d5'], why: "Fourchette de pion." },
  { sec: 't', les: 'l09', t: 'mv', fen: '4k3/3n4/8/1B6/8/8/8/3RK3 w - - 0 1', q: "Le cavalier d7 est cloué. Gagne-le.", sol: ['d1d7'], why: "Clouage." },
  { sec: 't', les: 'l09', t: 'mv', fen: 'r3k3/8/8/8/8/8/8/1K5R w - - 0 1', q: "Enfilade : gagne la tour noire (2 coups).", sol: ['h1h8', 'e8d7', 'h8a8'], why: "Th8+ puis Txa8." },
  { sec: 't', les: 'l10', t: 'mate', fen: '6rk/6pp/8/6N1/8/8/8/K7 w - - 0 1', n: 1, q: "Mat en 1 coup.", why: "Cf7# : mat étouffé." },
  { sec: 't', les: 'l11', t: 'mate', fen: '7k/8/8/8/8/8/R7/1R5K w - - 0 1', n: 2, q: "Mat en 2 coups.", why: "Tb7 puis Ta8#." },
  { sec: 't', les: 'l10', t: 'mv', fen: '4k3/3q4/8/4N3/8/8/8/4R1K1 w - - 0 1', q: "Gagne la dame noire grâce à un échec à la découverte.", sol: ['e5d7', 'e8d7'], why: "Cxd7+ découvre l'échec de la tour." },
  { sec: 't', les: 'l08', t: 'mv', pre: ['e4', 'e5', 'Nf3', 'd6', 'Bc4', 'Bg4', 'Nc3', 'g6'], q: "Trouve la combinaison gagnante pour les Blancs (premier coup).", sol: ['f3e5', 'g4d1', 'c4f7', 'e8e7', 'c3d5'], why: "Piège de Légal." },
  { sec: 't', les: 'l12', t: 'mcq', fen: '8/8/8/3k4/8/3K4/8/8 w - - 0 1', q: "C'est aux Blancs de jouer. Qui a l'opposition ?", o: ["Les Noirs", "Les Blancs", "Personne"], why: "Celui qui n'a pas le trait a l'opposition." },
  { sec: 't', les: 'l13', t: 'mcq', fen: '4k3/8/8/8/3P4/8/PP3PPP/4K3 w - - 0 1', q: "Quel pion blanc est isolé ?", o: ["d4", "a2", "f2", "h2"], why: "d4 n'a aucun pion voisin sur les colonnes c et e." },
  { sec: 't', les: 'l13', t: 'mcq', q: "Tu as gagné une pièce. Quelle est la bonne stratégie ?", o: ["Échanger les pièces pour simplifier", "Sacrifier ta dame pour attaquer", "Ne plus bouger", "Échanger tous tes pions"], why: "Quand on est en avance, on échange les pièces." }
];
