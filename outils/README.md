# Outils de fabrication du contenu

Ces fichiers ne servent pas au fonctionnement du site : ils permettent de **régénérer et valider** `data.js`
(leçons, test de niveau, exercices) après une modification.

- `src/lessons_a.js`, `src/lessons_b.js` : les 13 leçons (texte, diagrammes, exercices)
- `src/test.js` : les 29 questions du test de niveau
- `src/tech.js` : les 13 fiches « Techniques »
- `build.js` : assemble, **vérifie chaque position et chaque solution avec chess.js et le moteur**, puis écrit `data.js`
- `gen_mates.js`, `gen_tactics.js` : génèrent des positions de mat / de gain de matériel (`*_raw.json`)

Utilisation (Node 18+) :

```bash
npm install chess.js
node build.js        # affiche les erreurs éventuelles, produit data.js
```
Copier ensuite `data.js` à la racine du dépôt et augmenter `VERSION` dans `sw.js`.
