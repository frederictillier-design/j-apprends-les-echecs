// Leçons 7 à 13. Extensions du schéma :
//  - fen peut être remplacé par pre:['e4','e5',...] (coups SAN joués depuis la position de départ)
//  - etape.seq : coups SAN à rejouer pas à pas
//  - {t:'mate', gen:'KQ'|'KR'|'KRR', n:1|2, k:index} : mat tiré de la banque générée
const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
module.exports = [
{
  id: 'l07', titre: "Les mats élémentaires", emoji: '🎯', niveau: 'Débutant', duree: '15 min',
  objectifs: ["Mater avec deux tours (l'escalier)", "Mater avec dame et roi", "Mater avec tour et roi"],
  etapes: [
    { h: "L'escalier avec deux tours", p: ["Avec deux tours contre un roi seul, on fait « l'escalier » : une tour coupe le roi sur une rangée, l'autre le repousse d'un cran vers le bord, et ainsi de suite jusqu'au mat.", "Dans l'exemple, Tb7 interdit au roi toute la 7e rangée. Le roi n'a plus que Rg8… et Ta8 est mat !"], fen: '7k/8/8/8/8/8/R7/1R5K w - - 0 1', seq: ['Rb7', 'Kg8', 'Ra8#'] },
    { h: "Dame et roi contre roi", p: ["La dame seule ne suffit pas : il faut que ton roi vienne l'aider. Méthode : 1) enferme le roi adverse dans une zone de plus en plus petite avec la dame ; 2) approche ton propre roi ; 3) donne mat avec la dame protégée par ton roi.", "Attention au pat : ne prive pas le roi noir de toutes ses cases quand il n'est pas en échec !"], fen: '6k1/8/8/5K2/8/Q7/8/8 w - - 0 1', seq: ['Kg6', 'Kh8', 'Qa8#'] },
    { h: "Tour et roi contre roi", p: ["Avec une tour, on pousse le roi adverse vers un bord de l'échiquier, puis on utilise l'opposition : les deux rois face à face, et la tour donne échec sur la rangée du bord.", "C'est plus long qu'avec la dame, mais c'est une technique essentielle à connaître."], fen: '7k/8/5K2/8/8/8/1R6/8 w - - 0 1', seq: ['Kg6', 'Kg8', 'Rb8#'] }
  ],
  ex: [
    { t: 'mate', gen: 'KRR', n: 1, k: 0, q: "Mat en 1 coup avec tes deux tours." },
    { t: 'mate', gen: 'KQ', n: 1, k: 0, q: "Mat en 1 coup avec dame et roi." },
    { t: 'mate', gen: 'KR', n: 1, k: 0, q: "Mat en 1 coup avec tour et roi." },
    { t: 'mate', gen: 'KQ', n: 2, k: 0, q: "Mat en 2 coups avec dame et roi." },
    { t: 'mate', gen: 'KR', n: 2, k: 0, q: "Mat en 2 coups avec tour et roi." },
    { t: 'mate', fen: '7k/8/8/8/8/8/R7/1R5K w - - 0 1', n: 2, q: "Mat en 2 coups : l'escalier avec deux tours.", why: "Tb7 coupe la 7e rangée ; après Rg8 forcé, Ta8 est mat." }
  ],
  conseil: "Les mats élémentaires se jouent calmement : avant chaque coup, vérifie que l'adversaire a encore un coup (sinon : pat !)."
},
{
  id: 'l08', titre: "Les principes d'ouverture", emoji: '🚀', niveau: 'Intermédiaire', duree: '18 min',
  objectifs: ["Appliquer les 5 principes d'ouverture", "Connaître 4 ouvertures classiques", "Éviter (et jouer) les pièges célèbres"],
  etapes: [
    { h: "Les 5 principes", p: ["1) Contrôle le centre (cases e4, d4, e5, d5) avec des pions.", "2) Développe tes pièces (cavaliers puis fous) vers le centre, pas sur les bords.", "3) Roque vite pour mettre ton roi à l'abri.", "4) Ne bouge pas deux fois la même pièce dans l'ouverture, et ne sors pas ta dame trop tôt.", "5) Évite les coups de pions sur les ailes qui n'aident pas ton développement."], fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', hl: ['e4', 'e5', 'f3', 'c6'], cap: "Après 1.e4 e5 2.Cf3 Cc6 : centre occupé, cavaliers développés." },
    { h: "La partie italienne", p: ["1.e4 e5 2.Cf3 Cc6 3.Fc4 : le fou vise f7, le point faible des Noirs. Une ouverture très naturelle pour apprendre."], fen: START, seq: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4', 'cxd4', 'Bb4+'] },
    { h: "La partie espagnole", p: ["1.e4 e5 2.Cf3 Cc6 3.Fb5 : le fou met la pression sur le cavalier qui défend e5. L'ouverture préférée de nombreux champions."], fen: START, seq: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7'] },
    { h: "Le gambit dame et le système de Londres", p: ["Avec 1.d4, les Blancs contrôlent aussi le centre. Dans le gambit dame (1.d4 d5 2.c4), on offre un pion pour dominer le centre. Le système de Londres est simple à apprendre : d4, Cf3, Ff4, e3."], fen: START, seq: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O'] },
    { h: "Piège : le coup du berger", p: ["Une attaque de débutant : Dh5 et Fc4 visent f7. Si les Noirs répondent mal (3…Cf6??), ils sont mat en 4 coups ! Pour te défendre : joue 3…g6 (attaque la dame), ou protège f7 avec 3…De7 ou 3…Ch6."], fen: START, seq: ['e4', 'e5', 'Qh5', 'Nc6', 'Bc4', 'Nf6', 'Qxf7#'] },
    { h: "Piège : le mat de l'imbécile", p: ["Le mat le plus court de l'histoire : seulement deux coups des Noirs ! Il montre pourquoi on ne doit pas ouvrir la diagonale du roi avec f3 et g4."], fen: START, seq: ['f3', 'e5', 'g4', 'Qh4#'] },
    { h: "Piège : le mat de Légal", p: ["Un joli piège : les Blancs sacrifient leur dame pour un mat avec leurs pièces mineures. Les Noirs ont gagné la dame, mais perdent la partie !"], fen: START, seq: ['e4', 'e5', 'Nf3', 'd6', 'Bc4', 'Bg4', 'Nc3', 'g6', 'Nxe5', 'Bxd1', 'Bxf7+', 'Ke7', 'Nd5#'] }
  ],
  ex: [
    { t: 'mv', fen: START, q: "Joue un bon premier coup (tu as le choix !).", sol: ['e2e4'], ok: ['d2d4', 'g1f3', 'c2c4'], why: "e4 et d4 occupent le centre. Cf3 et c4 aussi le contrôlent." },
    { t: 'mv', pre: ['e4', 'e5'], q: "Développe un cavalier ou un fou vers le centre.", sol: ['g1f3'], ok: ['b1c3', 'f1c4'], why: "Cf3 développe une pièce et attaque le pion e5." },
    { t: 'mv', pre: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'd3', 'Nf6'], q: "Mets ton roi à l'abri.", sol: ['e1g1'], why: "Le petit roque protège le roi et libère la tour h1." },
    { t: 'mv', pre: ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5'], q: "Les Blancs menacent Dxf7# ! Défends-toi.", sol: ['g7g6'], ok: ['d8e7', 'g8h6', 'd8f6'], why: "g6 attaque la dame ; De7 ou Ch6 protègent aussi f7. Surtout pas Cf6??, qui perd en un coup." },
    { t: 'mv', pre: ['e4', 'e5', 'Nf3', 'd6', 'Bc4', 'Bg4', 'Nc3', 'g6'], q: "Piège de Légal ! Les Blancs ont une combinaison gagnante. Capture le pion e5 avec le cavalier !", sol: ['f3e5', 'g4d1', 'c4f7', 'e8e7', 'c3d5'], why: "Cxe5! Fxd1?? Fxf7+ Re7 Cd5# : mat avec trois pièces mineures." },
    { t: 'mcq', q: "Quelle erreur est la plus classique en ouverture ?", o: ["Sortir sa dame tôt et la faire attaquer", "Occuper le centre avec un pion", "Roquer rapidement", "Développer un cavalier en f3"], why: "Une dame sortie trop tôt perd du temps : l'adversaire la chasse en développant ses pièces." },
    { t: 'mcq', q: "Pourquoi joue-t-on les cavaliers avant les fous ?", o: ["On sait tout de suite où les placer (f3, c3) ; pour les fous, ça dépend de la réponse adverse", "Parce que les cavaliers sont plus forts", "Parce que c'est obligatoire", "Parce que les fous ne peuvent pas bouger"], why: "C'est un conseil pratique, pas une loi : mais développer les cavaliers d'abord est simple et efficace." }
  ],
  conseil: "Pour commencer, choisis UNE ouverture avec les Blancs (par exemple la partie italienne) et UNE défense avec les Noirs. Mieux vaut bien en connaître une que mal en connaître dix."
},
{
  id: 'l09', titre: "Tactique 1 : fourchette, clouage, enfilade", emoji: '🍴', niveau: 'Intermédiaire', duree: '18 min',
  objectifs: ["Réaliser une fourchette", "Exploiter un clouage", "Repérer une enfilade"],
  etapes: [
    { h: "La fourchette", p: ["Une fourchette est une attaque double : une seule pièce attaque deux pièces adverses à la fois. L'adversaire ne peut en sauver qu'une.", "Le cavalier est le roi de la fourchette, car on ne peut pas bloquer son saut. Mais un pion ou une dame peuvent aussi fourcher !"], fen: 'r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1', seq: ['Nc7+', 'Kd7', 'Nxa8'], ar: [['d5', 'c7']], cap: "Cc7+ attaque le roi et la tour a8 : on gagne la tour." },
    { h: "Le clouage", p: ["Une pièce est clouée quand elle ne peut pas bouger sans exposer une pièce plus précieuse (souvent le roi) située derrière elle. Une pièce clouée au roi n'a même pas le droit de bouger.", "Attaque la pièce clouée : elle ne peut pas fuir !"], fen: '4k3/3n4/8/1B6/8/8/8/3RK3 w - - 0 1', ar: [['b5', 'e8']], cap: "Le cavalier d7 est cloué au roi e8 par le fou b5." },
    { h: "L'enfilade", p: ["L'enfilade est l'inverse du clouage : on attaque une pièce de valeur, qui doit s'écarter, et on capture la pièce qui était derrière elle.", "Cela marche avec une tour, un fou ou une dame (les pièces à longue portée)."], fen: 'r3k3/8/8/8/8/8/8/1K5R w - - 0 1', seq: ['Rh8+', 'Kd7', 'Rxa8'], ar: [['h1', 'h8']], cap: "Th8+ attaque le roi e8 ; quand il s'écarte, la tour a8 est capturée." }
  ],
  ex: [
    { t: 'mv', fen: 'r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1', q: "Fourchette de cavalier : gagne la tour ! (joue les deux coups)", sol: ['d5c7', 'e8d7', 'c7a8'], why: "Cc7+ fourche le roi et la tour a8." },
    { t: 'mv', fen: '4k3/8/2n1n3/8/3P4/8/8/4K3 w - - 0 1', q: "Fourchette de pion : avance ton pion pour attaquer les deux cavaliers.", sol: ['d4d5'], why: "d5 attaque c6 et e6 en même temps. Aucun des deux cavaliers ne peut attaquer le pion." },
    { t: 'mv', fen: '4k3/3n4/8/1B6/8/8/8/3RK3 w - - 0 1', q: "Le cavalier d7 est cloué. Gagne-le avec ta tour.", sol: ['d1d7'], why: "Le roi ne peut pas reprendre : d7 est aussi protégé par le fou b5. Tu gagnes un cavalier." },
    { t: 'mv', fen: 'r3k3/8/8/8/8/8/8/1K5R w - - 0 1', q: "Enfilade : donne échec avec la tour, puis capture la tour noire.", sol: ['h1h8', 'e8d7', 'h8a8'], why: "Th8+ oblige le roi à s'écarter, puis Txa8." },
    { t: 'mcq', q: "Qu'est-ce qu'une fourchette ?", o: ["Une pièce qui attaque deux pièces adverses en même temps", "Un échange de dames", "Un mat en deux coups", "Un coup de pion de deux cases"], why: "Une attaque double : l'adversaire ne peut pas tout défendre." },
    { t: 'mcq', q: "Qu'est-ce qu'un clouage ?", o: ["Une pièce qui ne peut pas bouger sans exposer une pièce plus précieuse derrière elle", "Une pièce qui vient d'être capturée", "Un pion qui promeut", "Un roi en échec"], why: "La pièce clouée est « collée » à la pièce qu'elle protège." },
    { t: 'mcq', q: "Quelle pièce est particulièrement redoutable en fourchette, car on ne peut pas bloquer son saut ?", o: ["Le cavalier", "Le fou", "La tour", "Le roi"], why: "Le cavalier saute par-dessus les pièces : impossible d'interposer." }
  ],
  conseil: "Avant chaque coup, cherche : « Y a-t-il deux pièces adverses en prise en même temps ? Y en a-t-il une clouée ? »"
},
{
  id: 'l10', titre: "Tactique 2 : découverte et attaques combinées", emoji: '💥', niveau: 'Intermédiaire', duree: '18 min',
  objectifs: ["Jouer une attaque à la découverte", "Exploiter le mat du couloir", "Trouver un mat étouffé"],
  etapes: [
    { h: "L'attaque à la découverte", p: ["Quand une pièce s'écarte, elle « découvre » l'attaque d'une pièce qui était derrière elle. Mieux : la pièce qui bouge peut elle-même faire une menace, ce qui fait deux attaques en un seul coup !", "Le cas le plus fort : l'échec à la découverte. Le roi doit parer l'échec, et ton coup suivant gagne de la matière."], fen: '4k3/3q4/8/4N3/8/8/8/4R1K1 w - - 0 1', ar: [['e1', 'e8'], ['e5', 'd7']], cap: "Cxd7+ capture la dame et la tour e1 donne échec à la découverte." },
    { h: "Le mat du couloir", p: ["Un roi enfermé derrière ses pions de la 7e rangée ne peut pas fuir un échec sur la dernière rangée. Pour t'en protéger, crée une « lucarne » (joue h3 ou g3), pour donner de l'air à ton roi."], fen: '3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', seq: ['Rxd8#'] },
    { h: "Le mat étouffé", p: ["Un roi entouré de ses propres pièces peut être maté par un cavalier : il n'a aucune case pour fuir. C'est le « mat étouffé », une des plus belles figures des échecs."], fen: '6rk/6pp/8/6N1/8/8/8/K7 w - - 0 1', seq: ['Nf7#'] }
  ],
  ex: [
    { t: 'mv', fen: '4k3/3q4/8/4N3/8/8/8/4R1K1 w - - 0 1', q: "Gagne la dame noire grâce à un échec à la découverte !", sol: ['e5d7', 'e8d7'], why: "Cxd7+ : le cavalier prend la dame et la tour e1 donne échec ; tu gagnes une dame (9) contre un cavalier (3)." },
    { t: 'mate', fen: '3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', n: 1, q: "Mat du couloir : trouve le mat en 1 coup.", why: "Txd8# : le roi n'a aucune fuite et la tour ne peut pas être reprise." },
    { t: 'mate', fen: '6rk/6pp/8/6N1/8/8/8/K7 w - - 0 1', n: 1, q: "Mat étouffé : trouve le mat en 1 coup.", why: "Cf7# : le roi est entouré de sa tour et de ses pions." },
    { t: 'mate', fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2', n: 1, q: "Tu joues les Noirs. Trouve le mat en 1 coup !", why: "Dh4# : le mat de l'imbécile, le plus court de l'histoire." },
    { t: 'mcq', q: "Comment éviter le mat du couloir ?", o: ["Créer une « lucarne » pour le roi (par exemple h3)", "Avancer tous ses pions de deux cases", "Échanger ses tours", "Mettre la dame devant le roi"], why: "Une case de fuite pour le roi suffit à éviter un mat du couloir." },
    { t: 'mcq', q: "Que signifie « échec à la découverte » ?", o: ["Une pièce s'écarte et en découvre une autre qui donne échec", "Le roi se découvre en quittant son roque", "On découvre un piège de l'adversaire", "Un échec donné par un pion"], why: "La pièce qui bouge libère la ligne d'une pièce à longue portée située derrière." }
  ],
  conseil: "Avant de jouer, regarde toujours les échecs (les tiens et ceux de l'adversaire) : ce sont les coups les plus forcés, donc les plus faciles à calculer."
},
{
  id: 'l11', titre: "Trouver le mat en 1 et 2 coups", emoji: '🏆', niveau: 'Intermédiaire', duree: '15 min',
  objectifs: ["Repérer un mat en un coup", "Calculer un mat en deux coups", "Vérifier que le roi n'a aucune fuite"],
  etapes: [
    { h: "La méthode", p: ["Pour trouver un mat, fais la liste des coups forcés : d'abord les échecs, ensuite les captures. Pour chaque échec, vérifie : 1) peut-on capturer la pièce qui donne échec ? 2) peut-on s'interposer ? 3) le roi peut-il fuir (cases libres, non attaquées) ?", "Si la réponse est non aux trois, c'est mat !"] },
    { h: "Mat en 2 coups", p: ["Pour un mat en 2, cherche le coup qui enlève au roi toute possibilité sauf une, puis le coup qui donne mat à la réponse forcée. Ne considère qu'un coup d'adversaire à la fois : s'il a plusieurs choix, vérifie que tu mates dans tous les cas."] }
  ],
  ex: [
    { t: 'mate', fen: 'k7/2Q5/1K6/8/8/8/8/8 w - - 0 1', n: 1, q: "Mat en 1 coup.", why: "Db7# ou Da7# : la dame est protégée par ton roi et le roi noir n'a aucune fuite." },
    { t: 'mate', gen: 'KRR', n: 1, k: 1, q: "Mat en 1 coup (deux tours)." },
    { t: 'mate', gen: 'KRR', n: 1, k: 2, q: "Mat en 1 coup (deux tours)." },
    { t: 'mate', gen: 'KQ', n: 1, k: 1, q: "Mat en 1 coup (dame)." },
    { t: 'mate', gen: 'KR', n: 1, k: 1, q: "Mat en 1 coup (tour)." },
    { t: 'mate', gen: 'KQ', n: 2, k: 1, q: "Mat en 2 coups (dame)." },
    { t: 'mate', gen: 'KR', n: 2, k: 1, q: "Mat en 2 coups (tour)." },
    { t: 'mate', gen: 'KRR', n: 2, k: 0, q: "Mat en 2 coups (deux tours)." },
    { t: 'mate', gen: 'KRR', n: 2, k: 1, q: "Mat en 2 coups (deux tours)." }
  ],
  conseil: "Chaque jour, résous 5 problèmes de mat. C'est l'entraînement le plus efficace pour progresser aux échecs."
},
{
  id: 'l12', titre: "Les finales essentielles", emoji: '🏁', niveau: 'Intermédiaire', duree: '18 min',
  objectifs: ["Comprendre l'opposition", "Utiliser la règle du carré", "Activer son roi en finale"],
  etapes: [
    { h: "En finale, le roi devient une pièce active", p: ["En finale (peu de pièces sur l'échiquier), le roi n'est plus en danger : il devient une pièce de combat. Avance-le vers le centre et vers les pions !", "Les finales de roi et pion sont les plus importantes : savoir si un pion peut promouvoir décide souvent de la partie."], fen: '8/8/8/3k4/8/3K4/8/8 w - - 0 1' },
    { h: "L'opposition", p: ["Les deux rois se font face avec une case entre eux : celui qui n'a PAS le trait (qui n'est pas à jouer) a « l'opposition ». Son adversaire doit céder le passage.", "Ici les Blancs doivent jouer : ils doivent s'écarter, les Noirs ont l'opposition."], fen: '8/8/8/3k4/8/3K4/8/8 w - - 0 1', ar: [['d3', 'd5']] },
    { h: "Roi devant le pion = victoire", p: ["Avec un pion, si ton roi est devant le pion (sur la 6e rangée, ou plus loin), tu gagnes, quelle que soit l'opposition. Le roi chasse le roi adverse et le pion promeut."], fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1' },
    { h: "La règle du carré", p: ["Un pion libre (qui n'a que le roi adverse pour l'arrêter) promeut si le roi adverse ne peut pas entrer dans son « carré ». On trace un carré dont un côté va du pion à la case de promotion.", "Si le roi adverse est DANS le carré, il rattrape le pion. S'il est en dehors, le pion court jusqu'à la dame !"], fen: '8/8/4k3/8/P7/8/8/7K w - - 0 1', hl: ['a4','b4','c4','d4','e4','a5','b5','c5','d5','e5','a6','b6','c6','d6','e6','a7','b7','c7','d7','e7','a8','b8','c8','d8','e8'], cap: "Le roi noir e6 est dans le carré a4-e8 : il rattrape le pion." }
  ],
  ex: [
    { t: 'mcq', fen: '8/8/8/3k4/8/3K4/8/8 w - - 0 1', q: "C'est aux Blancs de jouer. Qui a l'opposition ?", o: ["Les Noirs", "Les Blancs", "Personne"], why: "Celui qui n'a PAS le trait a l'opposition. Les Blancs doivent bouger et lâcher le terrain." },
    { t: 'mv', fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1', q: "Roi devant le pion : joue le coup gagnant.", sol: ['e6d6'], ok: ['e6f6'], why: "Rd6 ou Rf6 : le roi se place devant son pion et la victoire est assurée." },
    { t: 'mcq', fen: '8/8/4k3/8/P7/8/8/7K w - - 0 1', q: "Les Blancs jouent. Le pion a4 peut-il promouvoir sans être arrêté ?", o: ["Non : le roi noir est dans le carré et rattrape le pion", "Oui : le roi noir est trop loin", "Oui : le pion est protégé par le roi", "On ne peut pas savoir"], why: "Le roi noir e6 est dans le carré a4-e8 : il joue Rd6, Rc7 et Rb7 à temps. La partie est nulle." },
    { t: 'mcq', fen: '8/8/8/8/P7/8/7k/4K3 w - - 0 1', q: "Les Blancs jouent. Le pion a4 peut-il promouvoir ?", o: ["Oui : le roi noir est hors du carré", "Non : le roi noir rattrape le pion", "Seulement si le roi blanc l'aide"], why: "Le roi noir en h2 est hors du carré a4-e8 : le pion promeut sans être inquiété." },    { t: 'mcq', q: "En finale, que doit-on faire de son roi ?", o: ["L'activer : le centraliser et l'approcher des pions", "Le laisser dans le coin", "L'échanger", "Le sacrifier"], why: "Sans dames sur l'échiquier, le roi n'est plus en danger." },
    { t: 'mcq', q: "Une tour est mieux placée…", o: ["Derrière un pion passé", "Devant le pion de l'adversaire", "À côté du roi", "Dans un coin, sans bouger"], why: "La règle de Tarrasch : les tours se placent derrière les pions passés, les leurs comme ceux de l'adversaire." }
  ],
  conseil: "Compte les cases ! En finale, une seule case d'avance peut décider d'une partie. Entraîne-toi à compter."
},
{
  id: 'l13', titre: "Stratégie : plans et structure de pions", emoji: '🧠', niveau: 'Avancé', duree: '20 min',
  objectifs: ["Reconnaître les structures de pions", "Utiliser les colonnes ouvertes", "Se construire un plan simple"],
  etapes: [
    { h: "Les pions : l'âme des échecs", p: ["Les pions ne reculent jamais : leurs coups sont définitifs. Ils décident de la structure de la partie.", "Un pion isolé n'a pas de pions voisins pour le protéger. Des pions doublés (deux sur la même colonne) se gênent. Un pion passé n'a plus de pion adverse devant lui ni sur les colonnes voisines : c'est une force."], fen: '4k3/p4ppp/8/3P4/8/8/P4PPP/4K3 w - - 0 1', hl: ['d5'], cap: "Le pion d5 est un pion passé." },
    { h: "Colonnes ouvertes et cases fortes", p: ["Une colonne ouverte est une colonne sans aucun pion. Les tours y sont très puissantes : place-les-y !", "Un avant-poste est une case avancée où une de tes pièces (souvent un cavalier) ne peut plus être chassée par un pion adverse."], fen: 'r2q1rk1/pp3ppp/2p5/8/8/2P5/PP3PPP/R2Q1RK1 w - - 0 1', hl: ['d1', 'd8', 'e1', 'e8'] },
    { h: "Les 3 questions pour construire un plan", p: ["1) Où sont les faiblesses de l'adversaire (roi exposé, pion isolé, pièce mal placée) ?", "2) Comment améliorer ma pire pièce ?", "3) Que veut faire mon adversaire, et comment l'en empêcher ?", "Un mauvais plan vaut mieux que pas de plan : choisis un objectif, avance vers lui."] }
  ],
  ex: [
    { t: 'mcq', fen: 'r2q1rk1/pp3ppp/2p5/8/8/2P5/PP3PPP/R2Q1RK1 w - - 0 1', q: "Quelles colonnes sont ouvertes (sans pion) ?", o: ["d et e", "a et h", "b et g", "c et f"], why: "Il n'y a aucun pion sur les colonnes d et e : ce sont les colonnes à occuper avec les tours." },
    { t: 'mcq', fen: '4k3/8/8/8/3P4/8/PP3PPP/4K3 w - - 0 1', q: "Quel pion blanc est isolé ?", o: ["d4", "a2", "f2", "h2"], why: "d4 n'a aucun pion blanc sur les colonnes c et e pour le protéger." },
    { t: 'mcq', fen: '4k3/p4ppp/8/3P4/8/8/P4PPP/4K3 w - - 0 1', q: "Quel pion blanc est un pion passé ?", o: ["d5", "a2", "f2", "g2"], why: "Aucun pion noir ne peut plus arrêter d5 sur les colonnes c, d, e." },
    { t: 'mcq', fen: '4k3/8/8/8/8/2P5/2P2PPP/4K3 w - - 0 1', q: "Quel est le défaut des pions c2 et c3 ?", o: ["Ils sont doublés : ils se gênent", "Ils sont passés", "Ils sont trop avancés", "Aucun défaut"], why: "Deux pions sur la même colonne : un seul peut avancer librement." },
    { t: 'mcq', q: "Où un cavalier est-il en général le mieux placé ?", o: ["Au centre (par exemple e5 ou d4)", "Sur le bord (a1, h8, a4…)", "Dans le coin", "Le plus loin possible du roi adverse"], why: "Un cavalier au centre contrôle jusqu'à 8 cases ; au bord, seulement 4 ou moins." },
    { t: 'mcq', q: "Quand tu as un avantage de matériel, que faut-il faire ?", o: ["Échanger les pièces, pas les pions", "Échanger tous les pions", "Garder toutes les pièces sur l'échiquier", "Sacrifier ta dame"], why: "Échanger les pièces simplifie la position et réduit les contre-chances de l'adversaire." }
  ],
  conseil: "En cas de doute, pose-toi la question : « Quelle est ma pire pièce, et comment l'améliorer ? »"
}
];
