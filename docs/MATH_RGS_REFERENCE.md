# Référence Math & RGS — Stake Engine

Ce document synthétise les règles officielles (documentation et sample games Stake Engine) pour aligner le serveur RGS de preview et l’export BetStudio. **La référence des maths** est le Math SDK (config, sample games, scatter/tumble, optimisation RTP).

---

## 1. Sources

- **Hub** : https://stakeengine.github.io/math-sdk/
- **Sample games** : https://stakeengine.github.io/math-sdk/math_docs/sample_section/sample_games/
- **Scatter** : https://stakeengine.github.io/math-sdk/math_docs/source_section/scatter_info/
- **Tumble** : https://stakeengine.github.io/math-sdk/math_docs/source_section/tumble_info/
- **Config** : https://stakeengine.github.io/math-sdk/math_docs/gamestate_section/configuration_section/config_overview/
- **RGS data format** : https://stakeengine.github.io/math-sdk/rgs_docs/data_format/
- **GitHub** : https://github.com/StakeEngine/math-sdk

---

## 2. Scatter-Pays (0_0_scatter) — Règles officielles

D’après la doc **Sample Games** :

- **Grille** : 6 rouleaux × 5 rangées, pay-anywhere (symboles n’importe où).
- **Symboles** : 2 spéciaux (wild, scatter), 8 payants (4 high, 4 low). Payouts groupés par tailles : (8-8), (9-10), (11-13), (14-36).
- **Basegame** : **minimum 4 Scatters** pour déclencher le freegame. 2 free spins par Scatter (ex. 4 scatters → 8 free spins).
- **Freegame** :
  - Chaque **tumble** incrémente le **multiplicateur global** de +1 (persistant pendant tout le freegame).
  - Le multiplicateur global est appliqué au gain de chaque tumble au fur et à mesure.
  - **Après tous les tumbles** : multiplier le gain cumulé des tumbles par les multiplicateurs sur le board.
  - Si un **symbole multiplicateur** (BONUS) est sur le board, sa valeur est **ajoutée au multiplicateur global** avant l’évaluation finale.
- **Tumble** : tant qu’il y a des gains, on fait tomber le board (`tumble_game_board`), on réévalue les gains scatter (`get_scatterpay_wins`), on met à jour le wallet et on émet les events.

**Scatter (scatter_info)** : pay-anywhere par nombre de symboles (souvent min 8), pay_group par plages incluses `((min, max), symbol_name): payout`. Attributs `multiplier` et `wild` sur les symboles. Boucle tumble : `while totalWin > 0 and not wincap: tumble_game_board(); win_data = get_scatterpay_wins(record_wins=True); update_spinwin(); emit_tumble_win_events()`.

**Implémentation preview (rgs-server)** : pour coller au sample, le BONUS doit contribuer au multiplicateur (valeurs discrètes type x2, x5, x10 par cellule, ajoutées au global ou multipliées au gain selon la doc). Tumble : retirer symboles gagnants, remplir depuis le haut, réévaluer, jusqu’à plus de gain.

---

## 3. Format RGS minimal pour acceptation à l’import

D’après **rgs_docs/data_format** :

### 3.1 Fichiers requis par mode

- **index.json** : fichier à la racine du dossier d’upload. Structure stricte :
  ```json
  {
    "modes": [
      {
        "name": "<string>",
        "cost": <float>,
        "events": "<logic_file>.jsonl.zst",
        "weights": "<lookup_table>.csv"
      }
    ]
  }
  ```
  Exemple 2 modes : `name: "base", cost: 1.0, events: "books_base.jsonl.zst", weights: "lookUpTable_base_0.csv"` et mode bonus avec cost > 1. Les noms de modes (ex. `"base"`, `"bonus"`) doivent être cohérents entre l’index.json, le Math SDK (run.py / sorties) et les noms de fichiers générés (books_*, lookUpTable_*).

- **Game logic** : fichier `.jsonl.zst` (JSON Lines compressé zstd). **Chaque ligne** = un round avec les champs **obligatoires** :
  - `"id"` : entier (simulation ID).
  - `"events"` : liste d’objets (events du round).
  - `"payoutMultiplier"` : entier (ex. 1150 = 11.5x pour un coût 1.0x).

- **Lookup table** : CSV sans en-tête, colonnes en `uint64` :
  - simulation number (id),
  - round probability (weight),
  - payout multiplier.
  Les valeurs **payoutMultiplier** du CSV doivent **correspondre exactement** à celles des books (vérification/hash côté Stake à l’upload).

### 3.2 Événements typiques (sample)

- `reveal` : board révélé.
- `winInfo` : combinaisons gagnantes (multipliers, positions, payInfo) — envoyé à chaque tumble.
- `freeSpinsTrigger` (preview Scatter Pays) : émis quand le board contient **4 scatters ou plus** ; champs `scatterCount`, `freeSpinsAwarded` (2 par scatter). Le front affiche le bonus et le nombre de free spins restants.
- `tumbleBanner` : cumul du tumble avec global mult appliqué.
- `setWin` : résultat du spin (du Reveal au prochain).
- `setTotalWin` / `finalWin` : gain cumulé du round (base = setWin, bonus = incrémental).

---

## 4. RTP et attentes Stake Engine

- **Stake Engine** : chaque sample game a un mode **base** (cost 1x) et un mode **freegame** (bonus). Les livres (events) et la lookup table sont **séparés par mode**. Le RTP cible est défini et vérifié par le Math SDK (simulations, optimisation des bandes).
- **Ce que Stake attend à l’import** : `index.json` avec au moins un mode base et souvent un mode bonus, chaque mode avec son `events` (`.jsonl.zst`) et son `weights` (CSV). Les payout multipliers du CSV doivent correspondre aux books.
- **Preview (rgs-server)** : une seule évaluation par spin (pas de tumble). Le script de simulation permet d’estimer le RTP base et bonus (preview) :
  - **Commande** (depuis `rgs-server`) : `node scripts/simulate-rtp.js 0_0_scatter 100000 100000` → 100k tours base + 100k tours bonus (preview).
  - **Résultat typique** (ordre de grandeur) : base ~98 % et bonus (preview) ~99 % en moyenne des `payoutMultiplier`. En preview le bonus utilise la même évaluation que la base (tumble et multiplicateur global freegame non implémentés), donc les deux RTP sont proches ; la variance sur 100k tours peut les faire différer légèrement.
  - Le **RTP garanti** et les livres finaux viennent du **Math SDK** ; ces chiffres ne font qu’indiquer que la preview est dans une fourchette raisonnable (~97–99 %).

---

## 5. Rôle du RGS de preview (BetStudio)

- Le dossier **rgs-server** est un serveur Node.js **preview** : scatter en une seule évaluation (sans boucle tumble ; le tumble complet est côté Math SDK). Il ne remplace pas le Math SDK. Il vise à se rapprocher des sample games (0_0_*) pour que la preview soit réaliste (grille, gains, multiplicateurs).
- Le **RTP garanti** et les **livres finaux** (books, lookUpTable) viennent du **Math SDK** : simulations + optimisation. L’export BetStudio produit game_config.py, gamestate.py, run.py, reels/, etc. ; après exécution du SDK, les vrais books et CSV sont dans `library/publish_files/`.
- Référence pour paytables et logique exacte : **sample games** du repo [StakeEngine/math-sdk](https://github.com/StakeEngine/math-sdk) (games/0_0_scatter, etc.) lorsque le code est disponible.

---

## 6. Structure jeu (game_struct)

- Chaque jeu dans le SDK suit une structure type : `game_config.py`, `gamestate.py`, `run.py`, `game_executables.py`, `game_calculations.py`, `game_events.py`, `game_override.py`, `reels/`, `library/` (books, books_compressed, configs, lookup_tables).
- run.py : paramètres de simulation (num_threads, compression, num_sim_args par mode). `create_books()` remplit library. `generate_configs(gamestate)` produit configs front/backend/math.
