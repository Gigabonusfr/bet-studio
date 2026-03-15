# Documentation Stake Engine — BetStudio

Ce document décrit l’intégration **Stake Engine** (Math SDK, RGS, Frontend) dans BetStudio et la **checklist de validation** utilisée avant et après l’export.

---

## 1. Qu’est-ce que Stake Engine ?

Stake Engine fournit :

- **Math SDK** (Python) : configuration du jeu, gamestate, reelstrips, simulations, optimisation RTP, génération des livres et poids pour le RGS.
- **RGS** (Remote Game Server) : format de données (events, books, lookUpTable), API wallet (authenticate, play, end-round).
- **Frontend Web SDK** : intégration du jeu dans une iframe, événements (reveal, winInfo, setWin, finalWin), Storybook.
- **TS Client** : client TypeScript pour communiquer avec le RGS.

**Documentation officielle** : [Stake Development Kit (Math SDK)](https://stakeengine.github.io/math-sdk/)

---

## 2. Liens officiels

| Ressource | URL |
|----------|-----|
| Hub Math SDK | https://stakeengine.github.io/math-sdk/ |
| Quickstart Math | https://stakeengine.github.io/math-sdk/math_docs/quickstart/ |
| Structure du jeu | https://stakeengine.github.io/math-sdk/math_docs/overview_section/game_struct/ |
| GameConfig / Gamestate | https://stakeengine.github.io/math-sdk/math_docs/gamestate_section/configuration_section/config_overview/ |
| Format RGS / data | https://stakeengine.github.io/math-sdk/rgs_docs/data_format/ |
| API RGS | https://stakeengine.github.io/math-sdk/rgs_docs/RGS/ |
| Frontend Get Started | https://stakeengine.github.io/math-sdk/fe_docs/get_started/ |
| GitHub Math SDK | https://github.com/StakeEngine/math-sdk |
| GitHub Web SDK | https://github.com/StakeEngine/web-sdk |
| GitHub TS Client | https://github.com/StakeEngine/ts-client |

Les constantes utilisées dans le projet sont dans `src/constants/docs-links.ts`.

---

## 3. Structure d’un jeu (Math SDK)

Un jeu exporté par BetStudio est conçu pour être déposé dans `math-sdk/games/<game_id>/` :

| Fichier / Dossier | Rôle |
|-------------------|------|
| `game_config.py` | Config dérivée de `Config` : grille, paytable, special_symbols, reels, bet_modes, RTP, free spins. |
| `gamestate.py` | Définition des états et transitions (basegame, freegame), dérivée de `GameState`. |
| `run.py` | Point d’entrée : simulations, optimisation, génération par sheet, upload. |
| `stake_engine.py` | Couche de compatibilité fournie par l’export (wrapper minimal pour exécuter run.py dans le SDK). |
| `reels/` | CSV des reelstrips : `BR0.csv` (base), `FR0.csv` (free game si activé). |
| `index.json` | Manifest des modes (nom, cost, events, weights). Généré après les simulations. |

Après exécution des simulations et de l’optimisation, les sorties utiles pour le RGS se trouvent dans `library/publish_files/` (books, lookUpTable, etc.).

---

## 4. Export BetStudio (ZIP)

L’export produit un ZIP contenant notamment :

- **Math** : `game_config.py`, `gamestate.py`, `run.py`, `stake_engine.py`, `reels/*.csv`, `index.json` (exemple), `design_config.json`.
- **Front** : selon le mode (skin, config FE, assets).
- **Scripts** : `prepare-publish.js` pour copier les sorties Math SDK vers un dossier `upload_math/`.

**URL CDN de jeu** (après déploiement) :

```
https://{TeamName}.cdn.stake-engine.com/{GameID}/{GameVersion}/index.html?sessionID=...&rgs_url=...&lang=...&device=...
```

---

## 5. Checklist de validation pré-export (Stake Engine)

Ces vérifications sont exécutées dans l’app par `stake-engine-validator` et affichées dans **ExportValidator** avant l’export. Les **erreurs** bloquent l’export ; les **warnings** permettent d’exporter tout en signalant des écarts aux bonnes pratiques.

### 5.1 Catégorie : Math

| Id | Label | Niveau | Critère |
|----|--------|--------|---------|
| `math-symbols-valid` | Symboles reelstrip valides | error / pass | Tous les symboles des reelstrips (base + free) doivent exister dans la paytable ou special_symbols. |
| `math-wild-defined` | WILD défini | warning / pass | Au moins un symbole de type `wild` (recommandé pour la plupart des slots). |
| `math-scatter-required` | SCATTER défini (freespins actifs) | error / pass | Si free spins activés, un symbole `scatter` doit être défini. |
| `math-paytable-kind` | Paytable kind cohérent | warning / pass | Kind minimum de la paytable ≥ 2 (4+ reels) ou ≥ 3 (3 reels). |
| `math-wincap` | Wincap cohérent | error / pass | Wincap > max payout de la paytable (sinon l’optimisation échoue). |
| `math-rtp-bounds` | RTP estimé dans les bornes | error / warning / pass | RTP estimé entre 50 % et 100 % ; écart à la cible signalé en warning. Templates officiels ignorés. |
| `math-reelstrip-length` | Longueur reelstrips (min 20) | warning / pass | Chaque reelstrip a au moins 20 positions par rouleau (recommandé 30+). |
| `math-br0` | BR0.csv présent | error / pass | Au moins une reelstrip basegame avec id `BR0`. |
| `math-fr0` | FR0.csv présent (freespins actifs) | warning / pass | Si free spins activés, une reelstrip freegame `FR0` (sinon une peut être auto-générée). |
| `math-wild-on-all-reels` | WILD sur chaque rouleau | warning / pass | Dans BR0, WILD présent sur chaque rouleau (recommandé). |
| `math-paylines-defined` | Paylines défini (mode lines) | error / pass | Si `winMechanic === "lines"`, `numPaylines` doit être défini et > 0. |

### 5.2 Catégorie : BetModes

| Id | Label | Niveau | Critère |
|----|--------|--------|---------|
| `betmodes-base` | Mode "base" avec cost=1.0 | warning / pass | Mode base avec `cost === 1.0`. |
| `betmodes-bonus-cost` | Mode bonus cost > 1.0 | error / pass | Si free spins activés, coût du mode bonus > 1.0. |

### 5.3 Catégorie : RGS & Publication

| Id | Label | Niveau | Critère |
|----|--------|--------|---------|
| `files-game-id` | Game ID valide | error / pass | Game ID : uniquement `a-z`, `0-9`, `_`, `-`. |
| `files-version` | Version semver | warning / pass | Version au format semver (ex. `1.0.0`). |

### 5.4 Catégorie : Front & Skin (guidelines Stake)

| Id | Label | Niveau | Critère |
|----|--------|--------|---------|
| `frontend-title-forbidden` | Titre sans marque protégée | error / pass | Nom du jeu / Game ID sans termes type Megaways, Xways. |
| `frontend-background-present` | Background défini | warning / pass | Un background (image ou vidéo) est défini. |
| `frontend-audio-toggle` | Option pour couper les sons | warning / pass | Si des sons sont activés, possibilité de couper (master mute ou équivalent). |
| `frontend-stakeus-forbidden-words` | Mots sensibles Stake.US | warning / pass | Labels principaux sans mots sensibles (jackpot, lottery, stake.us, crypto, etc.). |
| `frontend-bonus-buy-confirmation` | Confirmation d’achat de bonus | pass | Si Bonus Buy actif, dialogue de confirmation attendu (informatif). |
| `frontend-hud-values` | HUD : balance / mise visibles | warning / pass | Balance et mise affichées dans la barre de contrôle. |
| `frontend-controls-spin` | Bouton SPIN présent | pass | Toujours présent dans les layouts actuels. |
| `frontend-controls-turbo` | Toggle TURBO disponible | warning / pass | Si mode TURBO activé en config, toggle visible dans la barre. |
| `frontend-cta-wording` | Wording CTA sensible | warning / pass | Pas de wording type gamble, double or nothing, all in dans les labels CTA principaux. |

### 5.5 Conformité upload Stake (vérifications côté Stake à l’import)

Lors de l’upload des fichiers math sur Stake Engine, les vérifications suivantes sont effectuées (réf. [data_format](https://stakeengine.github.io/math-sdk/rgs_docs/data_format/)) :

- **index.json** : doit exister à la racine du dossier d’upload, avec une structure stricte `modes` : chaque entrée contient `name`, `cost`, `events` (nom du fichier `.jsonl.zst`), `weights` (nom du fichier CSV).
- **Fichiers référencés** : les fichiers `books_<mode>.jsonl.zst` et `lookUpTable_<mode>_0.csv` indiqués dans l’index doivent être présents.
- **Correspondance payoutMultiplier** : pour chaque round, la valeur `payoutMultiplier` dans le game logic (books) doit **correspondre exactement** à celle du CSV (lookup table). Stake effectue une vérification / hash à l’upload ; toute incohérence entraîne un rejet.
- **Format CSV** : colonnes en `uint64` — simulation number (id), round probability (weight), payout multiplier. Pas d’en-tête.

En amont, le validateur BetStudio (section 5) et le mode « Préparation soumission Stake » (strict) aident à respecter ces exigences (noms de modes `base` / `bonus` ou `freegame`, FR0, reelstrips 30+).

---

## 6. Checklist de soumission post-export (Stake Engine)

À faire **après** avoir exporté le ZIP et exécuté le Math SDK (simulations + optimisation).

### 6.1 Math SDK

- [ ] Fichiers déposés dans `games/<game_id>/` (game_config.py, gamestate.py, run.py, stake_engine.py, reels/).
- [ ] Reelstrips base (BR0.csv) et si besoin free (FR0.csv) en place.
- [ ] Simulations lancées (nombre suffisant par mode).
- [ ] RTP vérifié à la cible (ex. 96 %).
- [ ] Optimisation exécutée (`run_optimization: True`).
- [ ] Fichiers de sortie dans `library/publish_files/`.

### 6.2 Fichiers de sortie

- [ ] `index.json` — manifest des modes.
- [ ] `books_<mode>.jsonl.zst` — livres par mode (base + bonus si applicable).
- [ ] `lookUpTable_<mode>_0.csv` — poids par mode.
- [ ] `payoutMultiplier` cohérent entre CSV et books.

### 6.3 Conformité

- [ ] Jeu entièrement stateless.
- [ ] Pas de jackpots, gamble, early cashout ou progression.
- [ ] Tous les résultats pré-simulés.
- [ ] RTP calculable à partir des poids CSV.

### 6.4 Frontend SDK

- [ ] Web SDK cloné : https://github.com/StakeEngine/web-sdk
- [ ] Événements du jeu rendus dans Storybook.
- [ ] Types d’événements gérés : reveal, winInfo, setWin, finalWin.

### 6.5 Intégration RGS

- [ ] TS Client connecté : https://github.com/StakeEngine/ts-client
- [ ] `/wallet/authenticate` testé.
- [ ] `/wallet/play` testé.
- [ ] `/wallet/end-round` testé.
- [ ] URL CDN vérifiée : `https://{TeamName}.cdn.stake-engine.com/{GameID}/{Version}/index.html`

---

## 7. Référence code

- **Validateur** : `src/lib/stake-engine-validator.ts` — `validateExport()`, `hasBlockingErrors()`.
- **UI checklist** : `src/components/math/ExportValidator.tsx`.
- **Génération checklist texte (post-export)** : `src/lib/export-utils.ts` — `generateChecklist()`.
- **Liens doc** : `src/constants/docs-links.ts`.

---

*Dernière mise à jour : alignée sur le builder BetStudio et le validateur Stake Engine.*
