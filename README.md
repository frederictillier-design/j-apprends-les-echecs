# ♞ J'apprends les échecs

Une application web (installable, fonctionne **sans connexion**) pour apprendre les échecs pas à pas, sur téléphone ou ordinateur.

## Contenu
- 🎓 **Test de niveau** (29 questions) : règles, petits exercices sur l'échiquier, tactiques → niveau + leçons conseillées
- 📚 **13 leçons interactives** : échiquier, pièces, coups spéciaux, échec/mat/pat, valeur des pièces, mats élémentaires, ouvertures et pièges, fourchette/clouage/enfilade, découverte et mat du couloir, mats en 1 et 2 coups, finales, stratégie
- 🧠 **13 fiches Techniques** : routine avant chaque coup, calcul, gestion du temps, analyse de ses parties, etc.
- 🧩 **86 exercices** (mat en 1 / 2 coups, gain de matériel, tactiques), avec répétition espacée des exercices ratés
- ♟️ **Parties contre l'ordinateur** (4 niveaux), conseils, annulation d'un coup, analyse des erreurs après la partie
- 📈 **Progression** : étoiles, médailles, jours consécutifs, sauvegarde par code, remise à zéro

## Installer sur iPhone
1. Ouvrir l'adresse du site **dans Safari**.
2. Toucher **Partager** puis **Sur l'écran d'accueil**.
3. Toujours lancer l'appli depuis cette icône (la progression est enregistrée dans l'appareil).

## Mettre à jour
Remplacer les fichiers du dépôt, puis changer `VERSION` dans `sw.js` (ex. `echecs-v2`) pour que les appareils rechargent la nouvelle version.

Les règles du jeu reposent sur [chess.js](https://github.com/jhlywa/chess.js) (licence BSD-2). L'adversaire est un petit moteur maison (`engine.js`).
