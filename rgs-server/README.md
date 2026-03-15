# Serveur RGS (preview)

Serveur RGS minimal pour les **previews** du builder : il utilise les maths d’origine (`game-math.js`) pour générer des boards et des gains réels (lignes, ways, cluster, scatter, expwilds).

## Lancement

```bash
cd rgs-server
npm install
npm start
```

Port par défaut : **3111** (modifiable via `PORT`).

## Utilisation avec le front

1. Démarrer le serveur : `npm start` dans `rgs-server`.
2. Démarrer le front : `npm run dev` à la racine (écoute sur le port **8080**).
3. Ouvrir le builder Amateur avec les paramètres RGS dans l’URL :
   ```
   http://localhost:8080/amateur/?rgs_url=http://localhost:3111
   ```
4. Optionnel : `&sessionID=xxx` si tu veux réutiliser une session (sinon le serveur en crée une).

## Endpoints

| Méthode | Chemin | Body | Description |
|--------|--------|------|-------------|
| POST | `/wallet/authenticate` | `{ sessionID?, lang?, device? }` | Crée ou récupère une session, retourne `sessionId`, `balance`, `minBet`, `maxBet`, `stepBet`, `currency`. |
| POST | `/wallet/play` | `{ sessionID, bet, gameId? }` | Débite la mise, appelle les maths (`runSpin(gameId, bet)`), met à jour la balance, retourne `events`, `payoutMultiplier`, `balance`. |
| POST | `/wallet/end-round` | `{ sessionID }` | Fin de round (no-op côté state). |
| GET | `/games` | — | Liste des `gameId` disponibles. |

Balance et mises sont en **entier à 6 décimales** (ex. `1.00` = `1000000`).

## Game IDs (maths)

- `0_0_lines` — 5×3, 20 lignes
- `0_0_ways` — 5×3, ways
- `0_0_cluster` — 7×7, cluster
- `0_0_scatter` — 6×5, scatter + BONUS (multiplicateur). **Freegame** : déclenché avec **4 scatters ou plus** ; 2 free spins par scatter (ex. 4 → 8 free spins).
- `0_0_expwilds` — 5×5, 15 lignes

Par défaut, si `gameId` est absent dans `/wallet/play`, le serveur utilise `0_0_scatter`.

## RTP (preview)

Script de simulation : `npm run simulate-rtp [gameId] [numSpins]` ou **100k base + 100k bonus** :  
`npm run simulate-rtp 0_0_scatter 100000 100000`

- **2 arguments** : gameId, numSpins → RTP base uniquement.
- **3 arguments** : gameId, numBase, numBonus → RTP base puis RTP bonus (preview). Le bonus en preview utilise la même évaluation que la base (tumble non implémenté) ; les deux RTP sont donc du même ordre (~97–99 %).
- Le RTP garanti et les livres finaux viennent du **Math SDK** ; voir [MATH_RGS_REFERENCE.md](../docs/MATH_RGS_REFERENCE.md) (section 4).

## Symboles (alignés front)

- 0–4 : H1–H5  
- 5–8 : L1–L4  
- 9 : WILD  
- 10 : SCATTER  
- 11 : BONUS (multiplicateur dans le mode scatter)

## Référence

- **Math & RGS** : [docs/MATH_RGS_REFERENCE.md](../docs/MATH_RGS_REFERENCE.md) (règles Scatter-Pays, format RGS, refs SDK).
- **Sample games** : [Stake Engine Sample Games](https://stakeengine.github.io/math-sdk/math_docs/sample_section/sample_games/).
- **Tumble** : le mode scatter en preview est une seule évaluation (sans boucle tumble) ; le tumble complet est côté Math SDK.
