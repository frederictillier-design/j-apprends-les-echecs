// Leçons 1 à 6 (débutant). Schéma des exercices :
//  {t:'sq',  fen, q, a:['e4']}                      toucher une case
//  {t:'mcq', fen?, q, o:[bonne réponse, ...], why}  QCM (la bonne réponse est TOUJOURS la première ; l'appli mélange)
//  {t:'mv',  fen, q, sol:['e2e4',...], ok?:[...], why}  jouer un coup (sol = coups alternés joueur/adversaire)
//  {t:'mate',fen, n, q, ok?:[...], why}             mat en n coups
const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const EMPTY = '8/8/8/8/8/8/8/8 w - - 0 1';
module.exports = [
{
  id: 'l01', titre: "L'échiquier et ses coordonnées", emoji: '🗺️', niveau: 'Débutant', duree: '8 min',
  objectifs: ["Savoir orienter l'échiquier", "Nommer n'importe quelle case (e4, a1…)", "Comprendre colonnes, rangées et diagonales"],
  etapes: [
    { h: "64 cases", p: ["L'échiquier est un carré de 8 × 8 = 64 cases, alternativement claires et foncées.", "Place-le toujours avec une case claire dans le coin en bas à droite (on dit : « la blanche à droite »). Ici, la case h1 est claire."], fen: START, hl: ['h1'] },
    { h: "Colonnes et rangées", p: ["Les 8 colonnes portent les lettres a à h, de gauche à droite (du côté des Blancs).", "Les 8 rangées portent les numéros 1 à 8, de bas en haut.", "Le nom d'une case = sa lettre + son numéro. Exemple : e4 est à l'intersection de la colonne e et de la rangée 4."], fen: EMPTY, hl: ['e4'] },
    { h: "Les diagonales", p: ["Une diagonale est une ligne de cases de même couleur reliées par les coins. La plus célèbre est la grande diagonale a1–h8.", "Les fous et la dame glissent sur les diagonales ; les tours et la dame sur les colonnes et les rangées."], fen: EMPTY, hl: ['a1','b2','c3','d4','e5','f6','g7','h8'] },
    { h: "Les deux camps", p: ["Les Blancs sont en bas et jouent toujours le premier coup. Les Noirs sont en haut.", "Chacun son tour, on joue un seul coup. On n'a pas le droit de passer son tour."], fen: START }
  ],
  ex: [
    { t: 'sq', fen: EMPTY, q: "Touche la case e4.", a: ['e4'] },
    { t: 'sq', fen: EMPTY, q: "Touche la case g7.", a: ['g7'] },
    { t: 'sq', fen: EMPTY, q: "Touche la case b3.", a: ['b3'] },
    { t: 'sq', fen: EMPTY, q: "Touche la case tout en haut à gauche (colonne a, rangée 8).", a: ['a8'] },
    { t: 'mcq', fen: EMPTY, q: "De quelle couleur est la case a1 ?", o: ["Foncée", "Claire"], why: "a1 est foncée : c'est h1, dans le coin en bas à droite, qui est claire." },
    { t: 'mcq', q: "Combien de cases compte l'échiquier ?", o: ["64", "60", "72", "81"], why: "8 colonnes × 8 rangées = 64 cases." },
    { t: 'mcq', q: "Qui joue le premier coup d'une partie ?", o: ["Les Blancs", "Les Noirs", "Celui qui est le plus jeune"], why: "Les Blancs commencent toujours." }
  ],
  conseil: "Entraîne-toi à nommer des cases dans ta tête : « h3 », « c6 »… Plus tu les connais vite, plus tu liras facilement les parties."
},
{
  id: 'l02', titre: "Les pièces et leur mise en place", emoji: '♟️', niveau: 'Débutant', duree: '8 min',
  objectifs: ["Reconnaître les six pièces", "Placer les pièces au départ", "Connaître le but du jeu"],
  etapes: [
    { h: "Six sortes de pièces", p: ["Chaque joueur a 16 pièces : 1 roi, 1 dame, 2 tours, 2 fous, 2 cavaliers et 8 pions.", "Le roi est la pièce la plus importante : si on le perd, on perd la partie. Mais il est lent : il avance d'une case à la fois."], fen: START },
    { h: "La mise en place", p: ["Rangée 1 (côté Blancs), de gauche à droite : Tour, Cavalier, Fou, Dame, Roi, Fou, Cavalier, Tour. Les 8 pions sont devant, sur la rangée 2.", "Astuce : la dame se place sur sa couleur. La dame blanche est sur la case claire d1, la dame noire sur la case foncée d8.", "Les Noirs sont la copie exacte des Blancs, en face."], fen: START, hl: ['d1', 'd8'] },
    { h: "Le but du jeu", p: ["Le but n'est pas de capturer toutes les pièces, mais de mettre le roi adverse en échec et mat : il est attaqué et ne peut plus échapper.", "Le roi n'est jamais capturé : la partie s'arrête avant, au moment du mat."], fen: '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1', ar: [['a1', 'a8']], cap: "Ici, la tour blanche jouera Ta8 : mat !" }
  ],
  ex: [
    { t: 'sq', fen: START, q: "Touche le roi blanc.", a: ['e1'] },
    { t: 'sq', fen: START, q: "Touche la dame noire.", a: ['d8'] },
    { t: 'sq', fen: START, q: "Touche le cavalier blanc qui est du côté du roi.", a: ['g1'] },
    { t: 'mcq', q: "Sur quelle case est placée la dame blanche au départ ?", o: ["d1", "e1", "d8", "c1"], why: "La dame blanche est en d1, sur la case claire (« la dame sur sa couleur »)." },
    { t: 'mcq', q: "Combien de pions chaque joueur possède-t-il au départ ?", o: ["8", "6", "10", "16"], why: "8 pions, tous sur la deuxième rangée." },
    { t: 'mcq', q: "Quel est le but du jeu ?", o: ["Mettre le roi adverse échec et mat", "Capturer toutes les pièces adverses", "Capturer la dame adverse"], why: "On gagne en matant le roi, même si on a moins de pièces." }
  ],
  conseil: "Avant chaque partie, vérifie ta mise en place : case claire en bas à droite, dame sur sa couleur."
},
{
  id: 'l03', titre: "Comment les pièces se déplacent", emoji: '♞', niveau: 'Débutant', duree: '15 min',
  objectifs: ["Connaître le déplacement de chaque pièce", "Capturer correctement", "Savoir que le pion capture autrement qu'il avance"],
  etapes: [
    { h: "La tour ♜", p: ["La tour se déplace en ligne droite, horizontalement ou verticalement, d'autant de cases libres qu'on veut. Elle capture en arrivant sur la case d'une pièce adverse."], fen: 'k7/8/8/8/3R4/8/8/7K w - - 0 1', from: 'd4' },
    { h: "Le fou ♝", p: ["Le fou se déplace en diagonale, d'autant de cases libres qu'on veut. Il reste toute la partie sur la même couleur de case : chacun a donc un fou « clair » et un fou « foncé »."], fen: 'k7/8/8/8/3B4/8/8/7K w - - 0 1', from: 'd4' },
    { h: "La dame ♛", p: ["La dame est la pièce la plus forte : elle se déplace comme une tour ET comme un fou. C'est pour cela qu'elle vaut environ 9 pions."], fen: 'k7/8/8/8/3Q4/8/8/7K w - - 0 1', from: 'd4' },
    { h: "Le roi ♚", p: ["Le roi se déplace d'une seule case dans toutes les directions. Il ne peut jamais aller sur une case attaquée par une pièce adverse."], fen: 'k7/8/8/8/3K4/8/8/8 w - - 0 1', from: 'd4' },
    { h: "Le cavalier ♞", p: ["Le cavalier saute en « L » : deux cases dans une direction, puis une case sur le côté. C'est la seule pièce qui peut sauter par-dessus les autres.", "Astuce : il change toujours de couleur de case à chaque saut."], fen: 'k7/8/8/8/3N4/8/8/7K w - - 0 1', from: 'd4' },
    { h: "Le pion ♟ : avancer", p: ["Le pion avance tout droit, d'une case. Depuis sa case de départ seulement, il peut avancer de une ou deux cases. Il ne recule jamais et ne peut pas capturer devant lui."], fen: 'k7/8/8/8/8/8/4P3/7K w - - 0 1', from: 'e2' },
    { h: "Le pion ♟ : capturer", p: ["Le pion capture en diagonale, d'une case vers l'avant. C'est la seule pièce qui capture autrement qu'elle ne se déplace."], fen: 'k7/8/8/3p1p2/4P3/8/8/7K w - - 0 1', from: 'e4', cap: "Le pion e4 peut capturer en d5 ou en f5, ou avancer tout droit en e5." }
  ],
  ex: [
    { t: 'mv', fen: '7k/8/8/3b4/3R4/8/8/K7 w - - 0 1', q: "Capture le fou noir avec ta tour.", sol: ['d4d5'], why: "La tour capture en ligne droite : d4 → d5." },
    { t: 'mv', fen: '7k/8/8/8/3B4/8/5r2/K7 w - - 0 1', q: "Capture la tour noire avec ton fou.", sol: ['d4f2'], why: "Le fou capture en diagonale : d4, e3, f2." },
    { t: 'mv', fen: '7k/8/4r3/8/3N4/8/8/K7 w - - 0 1', q: "Capture la tour noire avec ton cavalier.", sol: ['d4e6'], why: "Le cavalier saute en L : d4 → e6 (une colonne à droite, deux rangées en haut)." },
    { t: 'mv', fen: '7k/8/8/7r/8/8/8/K2Q4 w - - 0 1', q: "Capture la tour noire avec ta dame.", sol: ['d1h5'], why: "La dame se déplace comme un fou aussi : d1, e2, f3, g4, h5." },
    { t: 'mv', fen: 'k7/8/8/8/8/8/3p4/3K4 w - - 0 1', q: "Capture le pion noir avec ton roi.", sol: ['d1d2'], why: "Le pion d2 n'est pas protégé : le roi peut le prendre." },
    { t: 'mv', fen: '7k/8/8/3p4/4P3/8/8/K7 w - - 0 1', q: "Capture le pion noir avec ton pion.", sol: ['e4d5'], why: "Le pion capture en diagonale : e4 → d5." },
    { t: 'mv', fen: START, q: "Joue le cavalier de g1 en f3.", sol: ['g1f3'], why: "Le cavalier saute en L : une colonne à gauche, deux rangées en haut." },
    { t: 'mv', fen: START, q: "Avance le pion e de DEUX cases.", sol: ['e2e4'], why: "Depuis sa case de départ, un pion peut avancer de deux cases." }
  ],
  conseil: "Avant chaque coup, demande-toi : « comment cette pièce se déplace-t-elle ? » Le pion est le plus piégeux : il avance tout droit mais capture en diagonale."
},
{
  id: 'l04', titre: "Les coups spéciaux", emoji: '✨', niveau: 'Débutant', duree: '12 min',
  objectifs: ["Roquer correctement", "Réaliser la prise en passant", "Promouvoir un pion"],
  etapes: [
    { h: "Le roque", p: ["Le roque met le roi en sécurité et sort la tour. On déplace le roi de deux cases vers une tour, et la tour saute de l'autre côté du roi.", "Conditions : ni le roi ni cette tour n'ont déjà bougé ; les cases entre les deux sont libres ; le roi n'est pas en échec, ne traverse pas une case attaquée et n'arrive pas sur une case attaquée."], fen: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1', seq: ['O-O', 'O-O-O'], cap: "Petit roque (côté roi) pour les Blancs, grand roque (côté dame) pour les Noirs." },
    { h: "La prise en passant", p: ["Si un pion avance de deux cases et arrive à côté d'un pion adverse, celui-ci peut le capturer comme s'il n'avait avancé que d'une case. Mais seulement au coup suivant !", "Ici, les Noirs jouent d7-d5 ; le pion blanc e5 peut capturer en d6 « en passant » et le pion d5 disparaît."], fen: '4k3/3p4/8/4P3/8/8/8/4K3 b - - 0 1', seq: ['d5', 'exd6'] },
    { h: "La promotion", p: ["Un pion qui atteint la dernière rangée se transforme (« promeut ») en dame, tour, fou ou cavalier, au choix. On choisit presque toujours la dame !", "Un pion est donc un trésor en puissance : il vaut très cher quand il approche de la dernière rangée."], fen: '7k/P7/8/8/8/8/8/K7 w - - 0 1', seq: ['a8=Q+'] }
  ],
  ex: [
    { t: 'mv', fen: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1', q: "Fais le petit roque (côté roi).", sol: ['e1g1'], why: "On déplace le roi de deux cases vers la tour h1 ; la tour passe en f1." },
    { t: 'mv', fen: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1', q: "Fais le grand roque (côté dame).", sol: ['e1c1'], why: "Le roi va en c1 et la tour a1 passe en d1." },
    { t: 'mv', fen: '4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1', q: "Les Noirs viennent de jouer d7-d5. Capture ce pion en passant.", sol: ['e5d6'], why: "Ton pion arrive en d6 et le pion d5 est retiré de l'échiquier." },
    { t: 'mv', fen: '7k/P7/8/8/8/8/8/K7 w - - 0 1', q: "Fais promouvoir ton pion en dame.", sol: ['a7a8q'], ok: [], why: "Le pion arrive en a8 et se transforme en dame." },
    { t: 'mcq', fen: '4k3/8/8/8/8/8/4r3/R3K2R w KQ - 0 1', q: "Les Blancs peuvent-ils roquer ?", o: ["Non : le roi est en échec", "Oui, côté roi", "Oui, côté dame", "Oui, des deux côtés"], why: "On ne peut jamais roquer quand le roi est en échec." },
    { t: 'mcq', q: "Pour quelle pièce un pion promu est-il le plus souvent changé ?", o: ["La dame", "Le cavalier", "Le roi", "Le pion reste un pion"], why: "La dame est la pièce la plus forte. (Un cavalier est parfois préférable pour donner mat ou fourchette.)" }
  ],
  conseil: "Roque dès que possible : ton roi est plus en sécurité, et ta tour entre dans le jeu."
},
{
  id: 'l05', titre: "Échec, mat, pat et nulle", emoji: '👑', niveau: 'Débutant', duree: '12 min',
  objectifs: ["Parer un échec de trois façons", "Reconnaître un mat", "Éviter le pat quand on gagne"],
  etapes: [
    { h: "L'échec", p: ["Le roi est « en échec » quand une pièce adverse l'attaque. Le joueur DOIT alors parer l'échec immédiatement.", "Trois façons de parer : 1) déplacer le roi, 2) capturer la pièce qui donne l'échec, 3) interposer une pièce entre le roi et l'attaquant (impossible contre un cavalier)."], fen: '4r1k1/8/8/8/8/8/8/2B1K3 w - - 0 1', ar: [['e8', 'e1']], cap: "Le roi blanc est en échec : le fou peut s'interposer en e3." },
    { h: "L'échec et mat", p: ["Quand le roi est en échec et qu'aucune des trois parades n'est possible, c'est l'échec et mat : la partie est terminée et le joueur qui a maté gagne.", "Un exemple très courant : le « mat du couloir ». Le roi est bloqué par ses propres pions, et une tour donne échec sur la dernière rangée."], fen: '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1', seq: ['Ra8#'] },
    { h: "Le pat : attention !", p: ["Si c'est ton tour, que ton roi n'est PAS en échec, mais que tu n'as aucun coup légal, la partie est nulle : c'est le pat.", "C'est une erreur classique de pat quand on a une grosse avance : fais toujours attention à laisser un coup à l'adversaire !"], fen: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1', cap: "Les Noirs n'ont aucun coup et ne sont pas en échec : pat, partie nulle." },
    { h: "Les autres nulles", p: ["La partie est aussi nulle : par accord des deux joueurs ; si la même position se répète 3 fois ; après 50 coups sans prise ni coup de pion ; ou si aucun camp n'a assez de pièces pour mater (roi seul contre roi, par exemple)."] }
  ],
  ex: [
    { t: 'mv', fen: '4k3/8/8/8/8/3n4/8/1B2K3 w - - 0 1', q: "Ton roi est en échec par le cavalier. Capture-le avec ton fou.", sol: ['b1d3'], why: "Capturer la pièce qui donne l'échec est la parade la plus efficace." },
    { t: 'mv', fen: '4r1k1/8/8/8/8/8/8/2B1K3 w - - 0 1', q: "Ton roi est en échec par la tour. Pare l'échec en interposant ton fou.", sol: ['c1e3'], why: "Le fou se place en e3, entre la tour e8 et le roi e1." },
    { t: 'mate', fen: '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1', n: 1, q: "Mat en 1 coup : trouve-le !", why: "Ta8# : le roi noir est bloqué par ses pions (mat du couloir)." },
    { t: 'mate', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', n: 1, q: "Mat en 1 coup : trouve-le !", why: "Dxf7# : la dame est protégée par le fou c4, le roi ne peut pas la prendre." },
    { t: 'mcq', fen: '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1', q: "C'est aux Noirs de jouer. Que se passe-t-il ?", o: ["Pat : partie nulle", "Échec et mat : les Blancs gagnent", "Les Noirs jouent Rg8", "Les Noirs gagnent"], why: "Le roi noir n'est pas en échec mais n'a aucune case libre : c'est un pat, donc nulle." },
    { t: 'mcq', q: "Combien de fois faut-il répéter la même position pour obtenir la nulle ?", o: ["3 fois", "2 fois", "5 fois", "10 fois"], why: "La même position trois fois : nulle par répétition." }
  ],
  conseil: "Avant de jouer un coup « qui menace le roi », vérifie que l'adversaire a encore au moins un coup possible. Sinon, c'est pat !"
},
{
  id: 'l06', titre: "Valeur des pièces et échanges", emoji: '⚖️', niveau: 'Débutant', duree: '12 min',
  objectifs: ["Connaître la valeur des pièces", "Savoir si un échange est bon", "Repérer une pièce non protégée"],
  etapes: [
    { h: "Combien vaut chaque pièce ?", p: ["Pour comparer les échanges, on compte en « points » : pion = 1, cavalier = 3, fou = 3, tour = 5, dame = 9. Le roi n'a pas de valeur : il est inestimable.", "Donner un cavalier (3) pour une tour (5) est donc une bonne affaire (on gagne la « qualité »). Donner une dame (9) pour un pion (1) est une catastrophe."], fen: START },
    { h: "Pièce protégée ou non ?", p: ["Une pièce est « protégée » si, quand on la capture, on peut reprendre. Une pièce non protégée peut être capturée gratuitement.", "Avant de capturer, demande-toi : « Si je prends, est-ce que l'adversaire peut reprendre ? » Si oui, compare ce que tu gagnes et ce que tu perds."], fen: '3qk3/8/8/8/3p4/8/8/3RK3 w - - 0 1', hl: ['d4'], ar: [['d8', 'd4']], cap: "Le pion d4 est protégé par la dame d8 : Txd4 Dxd4 te ferait perdre une tour (5) pour un pion (1)." },
    { h: "Compter les attaquants et les défenseurs", p: ["Pour savoir si un échange est bon sur une case, compte les pièces qui l'attaquent et celles qui la défendent, puis fais l'échange dans ta tête, en commençant par la pièce la moins précieuse.", "Règle d'or : ne perds jamais une pièce gratuitement. Avant chaque coup, vérifie que la case d'arrivée n'est pas attaquée sans être protégée."] }
  ],
  ex: [
    { t: 'mv', fen: '4k3/8/8/3q4/4P3/8/8/4K3 w - - 0 1', q: "Gagne la dame noire avec un pion !", sol: ['e4d5'], why: "Un pion (1) capture une dame (9) : excellent échange." },
    { t: 'mv', fen: '4k3/8/8/3n4/8/5B2/8/4K3 w - - 0 1', q: "Un cavalier noir est sans protection. Capture-le.", sol: ['f3d5'], why: "Le fou f3 attaque d5 par la diagonale. Rien ne protège le cavalier : tu gagnes 3 points gratuitement." },
    { t: 'mcq', fen: '3qk3/8/8/8/3p4/8/8/3RK3 w - - 0 1', q: "Faut-il jouer Txd4 (la tour prend le pion) ?", o: ["Non : la dame reprend, je perds une tour pour un pion", "Oui : un pion gratuit", "Oui : la tour est plus forte que la dame"], why: "Le pion d4 est protégé par la dame. Après Dxd4, j'ai perdu 5 points pour en gagner 1." },
    { t: 'mcq', q: "Quel échange est le meilleur pour toi ?", o: ["Donner un cavalier, gagner une tour", "Donner une tour, gagner un cavalier", "Donner une dame, gagner une tour", "Donner un fou, gagner un pion"], why: "Cavalier (3) contre tour (5) : tu gagnes 2 points. Les autres échanges te font perdre du matériel." },
    { t: 'mcq', q: "Combien de points vaut la dame ?", o: ["9", "5", "10", "7"], why: "Dame = 9 points." },
    { t: 'mcq', q: "Que vaut mieux : un fou ou un cavalier ?", o: ["Ils valent à peu près pareil (3 points)", "Le cavalier vaut 5 points", "Le fou vaut 5 points", "Le cavalier vaut 1 point"], why: "Fou et cavalier valent environ 3 points. Le fou est un peu meilleur sur un échiquier ouvert, le cavalier dans une position fermée." }
  ],
  conseil: "Avant de capturer : 1) la pièce est-elle protégée ? 2) que vaut ce que je gagne, que vaut ce que je risque ?"
}
];
