# Info base de données

Dossier `database/` : schémas MongoDB (Mongoose, format décoré `@nestjs/mongoose`) pour l'app d'analyse de pilotage basée sur l'API [OpenF1](https://openf1.org/docs/).

Ce dossier contient **JUSTE les schémas** (et plus tard les scripts d'ingestion). La logique métier (API, DTO, calculs, résumés) est dans le backend NestJS.

---

## 1. Installation rapide

```bash
npm install
cp .env.example .env     # puis remplir DATABASE_URI
```

`.env` :

```
DATABASE_URI=mongodb+srv://USER:PASSWORD@cluster.xxxxx.mongodb.net/f1app?retryWrites=true&w=majority
```

- Le nom de la base (`f1app`) va avant le `?`.
- Si le mot de passe contient des caractères spéciaux (`@`, `:`, `/`, `#`), il faut les encoder (ex. `@` → `%40`).
- **Ne jamais commiter `.env`** (il est dans `.gitignore`) ni afficher l'URI complète dans les logs. Chacun a le sien, et `.env.example` ne contient aucun secret.

### Connexion : backend vs scripts

- **Backend NestJS** : comme dans le labo du cours, la connexion se fait avec `MongooseModule.forRootAsync` + `ConfigService` (`@nestjs/config`, validation du `.env` avec Joi). Le backend n'utilise **pas** `src/connect.ts`.
- **`src/connect.ts`** (ce dossier) : sert aux scripts d'ingestion qui remplissent la base depuis OpenF1.

### Utilisation dans le backend

Tout est exporté depuis `src/index.ts`. Chaque fichier exporte une **classe** (le type TypeScript) et son **schéma** (`...Schema`). Il n'y a pas de `model(...)` ici : c'est le module fonctionnel du backend qui enregistre le modèle, puis un repository (ou un service) le reçoit par injection, comme dans le cours.

```ts
// laps.module.ts
import { Lap, LapSchema } from 'database';

@Module({
  imports: [MongooseModule.forFeature([{ name: Lap.name, schema: LapSchema }])],
  providers: [LapsRepository, LapsService],
})
export class LapsModule {}

// laps.repository.ts  (pattern Mongoose + Repository + Service vu au labo)
@Injectable()
export class LapsRepository {
  constructor(@InjectModel(Lap.name) private readonly lapModel: Model<Lap>) {}

  findByDriverAtCircuit(circuitKey: number, driverKey: string) {
    return this.lapModel.find({ circuitKey, driverKey }).exec();
  }
}
```

Le **repository** centralise les requêtes Mongoose, et le **service** garde la logique métier.

---

## 2. Schéma, DTO, modèle : qui fait quoi

| Notion | Rôle | Où |
|---|---|---|
| **Schéma** (classe `@Schema` + `...Schema`) | Décrit comment les données sont **stockées** dans MongoDB | Ce dossier |
| **Modèle** Mongoose | Objet qui exécute les requêtes (`find`, `create`…), construit à partir d'un schéma | Backend (`forFeature` + `@InjectModel`) |
| **DTO** | Décrit ce que l'API **reçoit ou retourne** (validation, Swagger) | Backend |

L'API ne doit pas retourner directement un document Mongoose.

---

## 3. Vocabulaire OpenF1 → notre app

| OpenF1 | Chez nous | Exemple |
|---|---|---|
| Meeting | `GrandPrix` | « Grand Prix de Singapour 2026 » (tout le week-end) |
| Session | `Session` | Essais 1, Qualifications, Sprint, **Course** |
| Lap | `Lap` | Un tour d'un pilote dans une session |

Hiérarchie : **Circuit → GrandPrix (par année) → Sessions → Tours, événements, télémétrie.**

Une « course » = une `Session` dont le `type` est `Race`. Les sessions de pratique, de qualifs et de sprint sont dans la même collection.

---

## 4. Conventions importantes

- **Clés** : on relie les collections avec nos propres clés métier (pas les `_id` Mongo). Ça permet de réingérer sans doublons (upsert).
  - `driverKey` (String) : généré à partir du nom du pilote (ex. `max-verstappen`). **Ne pas utiliser `driver_number`** : il change selon la saison.
  - `circuitKey`, `meetingKey`, `sessionKey` (Number) : viennent directement d'OpenF1.
- **Unités** :
  - Distances sur le circuit, coordonnées x/y : **décimètres** (1/10 de mètre), mesurées depuis la ligne de départ.
  - Vitesses : km/h. Temps : secondes (sauf indication contraire, ex. `timeSinceStart` en ms).
  - Dates : stockées en UTC (`Date`).
- **Timestamps** : `timestamps: true` ajoute `createdAt` et `updatedAt` automatiquement.
- **Champs optionnels** : l'API a souvent des données manquantes. Un champ optionnel (`?`) veut dire « peut être absent », pas « oubliez-le ».
- **Données de l'API vs dérivées** : certaines collections sont *ingérées* depuis OpenF1, d'autres sont *dérivées* (calculées par le backend). Voir le tableau plus bas.

---

## 5. Les schémas

| Fichier | Classe | Rôle | Source |
|---|---|---|---|
| `user.schema.ts` | `User` | Utilisateurs, mot de passe hashé, favoris (pilotes, circuits) | Notre app |
| `driver.schema.ts` | `Driver` | Pilotes + historique par saison (équipe, couleur, numéro) | Ingérée (`drivers`) |
| `circuit.schema.ts` | `Circuit` | Circuits + layouts par année (virages, tracé) | Ingérée (`meetings` + `circuit_info_url`) |
| `grandprix.schema.ts` | `GrandPrix` | Un week-end de Grand Prix | Ingérée (`meetings`) |
| `session.schema.ts` | `Session` | Une session (pratique, qualifs, sprint, course) + météo résumée | Ingérée (`sessions`, `weather`) |
| `result.schema.ts` | `Result` | Résultat final d'un pilote dans une session | Ingérée (`session_result`, `starting_grid`) |
| `lap.schema.ts` | `Lap` | Un tour : temps, secteurs, vitesses intermédiaires, tour de sortie des stands | Ingérée (`laps`) |
| `raceEvent.schema.ts` | `RaceEvent` | Événements : arrêts aux stands, dépassements, drapeaux/safety car | Ingérée (`pit`, `overtakes`, `race_control`) |
| `lapTelemetry.schema.ts` | `LapTelemetry` | Télémétrie d'un tour (vitesse, freins, gaz, position x/y) | Ingérée (`car_data`, `location`) |
| `cornerStats.schema.ts` | `CornerStats` | Stats par virage, par tour, par pilote (freinage, vitesse mini, sortie) | **Dérivée** (backend) |
| `raceSummary.schema.ts` | `RaceSummary` | Résumé d'une course (podium, moments clés), mis en cache | **Dérivée** (backend) |

### `User`
Compte utilisateur. `passwordHash` est `select: false` : il n'est **jamais** retourné par défaut (utiliser `.select('+passwordHash')` seulement pour le login). Ne jamais le renvoyer dans l'API ni le journaliser. Favoris : `favoriteDriverKeys` (String[]) et `favoriteCircuitKeys` (Number[]). Le courriel et le nom sont des renseignements personnels (voir les chapitres 7 et 8 du cours sur la sécurité et la vie privée).

### `Driver`
Un document par pilote, avec `seasons[]` : `{ year, teamName, teamColour, number }`.

### `Circuit`
`layouts[]` contient un layout **par année** (clé = l'année **dans le JSON**, pas celle de l'URL) :
- `outline` : tracé du circuit (x[], y[]), pris d'une vraie voiture. C'est la forme du circuit, pas le milieu de la piste.
- `corners[]` : `cornerNumber`, `xCoord`, `yCoord`, `distanceFromStart` (décimètres), `angle`, `direction` (Left/Right, **dérivé** par le backend).

Chaque virage est un **point**, pas une zone. La zone d'analyse (début/fin) est définie par le backend.

### `GrandPrix`
`gmtOffset` : décalage du circuit par rapport à GMT, pour afficher l'heure locale du circuit. Convention à confirmer dans l'équipe (recommandé : **minutes**, ex. `+08:00` → `480`).

### `Session`
Lié à `GrandPrix` via `meetingKey` et au circuit via `circuitKey`. `weather` est **un seul objet** (moyennes de température de l'air et de la piste, conditions Dry/Wet/Mixed dérivées de l'indicateur de pluie de l'API).

### `Result`
Une ligne par pilote par session. `dnf`, `dns`, `dsq` séparés. `gapToLeader` en secondes, `lapsBehind` si le pilote est lapé. `points` est optionnel (vient de l'endpoint championnat, en bêta). Les résultats peuvent ne pas être disponibles tout de suite après la course.

### `Lap`
Clé unique : `sessionKey + driverKey + lapNumber`. `isPitOutLap` ne marque que les tours **de sortie** des stands (l'API n'a pas de flag pour le tour d'entrée). `intermediateSpeed1/2` : vitesses aux points intermédiaires de l'API (supposées être en fin de secteur 1 et 2, **à confirmer**). Pas de vitesse pour le secteur 3.

### `RaceEvent`
Une seule collection pour tous les types d'événements (`type` : `Pit`, `Overtake`, `RaceControl`). Les champs propres à un type sont optionnels. `eventKey` est construit par le script d'ingestion (évite les doublons).
- Les dépassements d'OpenF1 incluent aussi les changements de position dus aux arrêts aux stands et aux pénalités : il faut les filtrer.
- Pour `RaceControl`, on ne garde que les catégories utiles (`Flag`, `SafetyCar`).

### `LapTelemetry`
Un document par tour par pilote, avec deux blocs séparés (l'API les donne avec des horodatages différents, ~3,7 Hz) :
- `carData` : vitesse, gaz, frein (booléen, l'API ne donne que on/off), rapport, régime, DRS (code brut).
- `locationOnTrack` : x, y, z.
- `distanceFromStart` (optionnel) : distance parcourue sur le tour pour chaque échantillon de position, **calculée par le backend** en projetant x/y sur l'`outline` du circuit. Même unité et même point zéro que `distanceFromStart` des virages.

Pour savoir où sur la piste un échantillon de `carData` s'est produit, il faut comparer les `timeSinceStart` des deux blocs (et idéalement interpoler).

⚠️ Ces documents sont gros (~30 Ko par tour, ~1 200 par course). On ne les ingère que pour quelques courses de démo.

### `CornerStats` (collection dérivée)
Un document par **session + pilote + tour + virage** : début de freinage, durée de freinage (approximative), vitesses d'entrée/minimale/sortie, reprise des gaz, etc. L'application lit ces documents pour comparer deux pilotes. `isCleanLap` permet de filtrer les tours non représentatifs (tour de sortie des stands, tour 1, safety car). `analysisVersion` permet de savoir quoi recalculer si l'algorithme change.

### `RaceSummary` (collection dérivée / cache)
Un document par session de **course ou sprint** : podium, pole, meilleur tour, nombre de dépassements en piste, arrêts, safety cars, abandons, `keyMoments[]` (dépassements, arrêts, safety car…) et un résumé par pilote. `cause` d'un moment clé est une **inférence** (ex. « OnTrack », « Pit », « SafetyCar »), pas un fait de l'API. `status: Partial` tant que les résultats officiels ne sont pas publiés.

---

## 6. Comment les collections se relient

```
Circuit (circuitKey)
  └─ GrandPrix (meetingKey, circuitKey, year)
       └─ Session (sessionKey, meetingKey, circuitKey)
            ├─ Result (sessionKey, driverKey)
            ├─ Lap (sessionKey, driverKey, lapNumber)
            │    └─ LapTelemetry (même clé)
            │         └─ CornerStats (+ circuitKey, cornerNumber)
            ├─ RaceEvent (sessionKey, driverKey?)
            └─ RaceSummary (sessionKey)

Driver (driverKey) ← référencé partout par driverKey
User → favoriteDriverKeys / favoriteCircuitKeys
```

Exemples de requêtes :
- La course d'un Grand Prix : `Session.find({ meetingKey, type: 'Race' })`
- Les tours d'un pilote sur un circuit : `Lap.find({ circuitKey, driverKey })`
- Tous les pilotes à un virage : `CornerStats.find({ sessionKey, cornerNumber })`

---

## 7. Décisions de modélisation (imbriqué vs référence)

Principe du cours : on modélise selon les **requêtes fréquentes** de l'app. On **imbrique** ce qui est petit et toujours lu avec son parent, et on utilise des **références** pour ce qui est nombreux ou a son propre cycle de vie.

| Donnée | Choix | Justification |
|---|---|---|
| `Driver.seasons` | Imbriqué | Quelques entrées, toujours lues avec le pilote, jamais modifiées seules |
| `Circuit.layouts` (outline, corners) | Imbriqué | Lus avec le circuit ; quelques layouts par circuit, quelques Ko chacun |
| `Session.weather` | Imbriqué | Un seul objet résumé par session |
| `User.favorite*Keys` | Imbriqué (tableaux de clés) | Petits, lus avec l'utilisateur |
| `LapTelemetry.carData / locationOnTrack` | Tableaux dans **un document par tour** | ~30 Ko par document, loin de la limite de 16 Mo ; pas un document par échantillon (trop nombreux) |
| `Lap`, `Result`, `RaceEvent`, `CornerStats` | **Collections séparées**, liées par clés | Très nombreux, interrogés indépendamment, cycle de vie propre (même raisonnement que `rooms` dans le labo) |
| `RaceSummary` | Agrégat en cache | Une lecture pour afficher tout le résumé d'une course |

**Dénormalisation volontaire** : `circuitKey` et `year` sont répétés dans `Session`, `Lap`, `CornerStats` et `RaceSummary`, et `isCleanLap` est stocké dans `CornerStats`. Ça évite des jointures pour les requêtes « par piste ». Le risque (valeurs qui divergent) est faible, car ces valeurs ne changent pas après l'ingestion.

**Références par clés métier, pas par `ObjectId`** : voir la section « Clés » ci-dessus (réingestion sans doublons).

---

## 8. Index et justification

Un index (`unique: true` ou `.index(...)`) n'est ajouté que s'il sert une requête fréquente ou une règle métier.

| Collection | Index | Pourquoi |
|---|---|---|
| `User` | `email` unique | Connexion + pas deux comptes avec le même courriel |
| `Driver` | `driverKey` unique ; `seasons.year` | Éviter les doublons à l'ingestion ; « pilotes de 2026 » |
| `Circuit` | `circuitKey` unique | Un seul document par circuit |
| `GrandPrix` | `meetingKey` unique ; `year` ; `circuitKey` | Doublons ; GP par année ; GP par circuit |
| `Session` | `sessionKey` unique ; `meetingKey` ; `(circuitKey, type)` | Doublons ; sessions d'un GP ; qualifs/courses d'un circuit |
| `Result` | `(sessionKey, driverKey)` unique ; `driverKey` | Un résultat par pilote par session ; historique d'un pilote |
| `Lap` | `(sessionKey, driverKey, lapNumber)` unique ; `(circuitKey, driverKey)` | Pas de tour en double ; tours d'un pilote sur un circuit |
| `RaceEvent` | `eventKey` unique ; `(sessionKey, type, date)` ; `(sessionKey, driverKey)` | Doublons ; chronologie d'une session ; événements d'un pilote |
| `LapTelemetry` | `(sessionKey, driverKey, lapNumber)` unique | Un document de télémétrie par tour |
| `CornerStats` | clé complète unique ; `(circuitKey, cornerNumber, driverKey)` ; `(sessionKey, cornerNumber)` | Doublons ; comparaisons par virage/circuit ; tous les pilotes à un virage |
| `RaceSummary` | `sessionKey` unique ; `(circuitKey, year)` ; `meetingKey` | Un résumé par course ; résumés d'un circuit ; résumés d'un GP |

Les index ralentissent légèrement les écritures : on n'en ajoute pas « au cas où ».

---

## 9. Ce que l'API doit exposer (côté backend)

- **Ne jamais exposer** `_id`, `__v` ni `passwordHash`. Retourner des **DTO de réponse** avec un `id` public, et appliquer la même transformation partout (un document seul ou une collection).
- **Traduire les erreurs MongoDB** en erreurs HTTP : violation d'un index unique → `409 Conflict` ; ressource absente → `404 Not Found` ; données invalides → `400 Bad Request` ; erreur imprévue → `500`. Ne jamais renvoyer le message brut du pilote ni le nom d'une collection.
- Les schémas ne sont **pas** les contrats Swagger : la documentation OpenAPI décrit les DTO.

---

## 10. Limites et points à vérifier

- **Historique** : l'API OpenF1 gratuite couvre 2023 et après (pas de clé API pour l'historique).
- **Le frein est binaire** (on/off) et la fréquence est ~3,7 Hz : la précision d'un point de freinage est d'environ 20 m à haute vitesse. Les analyses sont des **approximations**.
- **Inside/outside** : la doc d'OpenF1 dit que `location` manque de précision latérale. `lineOffset` dans `CornerStats` est **expérimental**.
- **DRS** : depuis 2026, l'aéro est active (plus seulement DRS). À vérifier ce que le champ contient pour les courses 2026 (on stocke le code brut).
- **Unité des coordonnées** : à confirmer que `location` utilise la même unité/le même repère que le fichier de circuit (test à faire sur un circuit).
- **Vitesses intermédiaires** : à confirmer qu'elles sont bien mesurées en fin de secteur.
- **`GrandPrix.gmtOffset`** : unité à fixer (minutes recommandé).
- **Résultats tardifs** : `session_result` et `starting_grid` peuvent retourner 404 jusqu'à la publication officielle.
- **Champs obsolètes** : ne pas utiliser `pit_duration` (utiliser `lane_duration`) ni `country_code` des pilotes, qui seront retirés fin 2026.
- **Suppression** : les données OpenF1 ne sont pas supprimées par l'app. Seul `User` peut l'être, et ses favoris (imbriqués) partent avec lui.

---

## 11. Glossaire (pour ceux qui ne sont pas dans les courses)

- **Apex** : le point de la courbe le plus proche de l'intérieur du virage.
- **Ligne de course** : la trajectoire que prend la voiture dans un virage.
- **Point de freinage** : l'endroit où le pilote commence à freiner avant un virage.
- **Sortie de virage** : la vitesse et l'accélération en quittant le virage ; une bonne sortie fait gagner du temps sur la ligne droite suivante.
- **Stint** : une période de roulage avec le même train de pneus (en F1, un seul pilote par voiture).
- **Tour de sortie (out lap)** : le tour juste après un arrêt aux stands (pit stop), lent à cause des pneus froids.
- **Safety car / VSC** : la voiture de sécurité (ou la version « virtuelle ») qui ralentit toute la course après un incident.
- **DNF / DNS / DSQ** : n'a pas fini / n'a pas pris le départ / disqualifié.
- **Dépassement** : un pilote prend la place d'un autre (OpenF1 inclut aussi les changements de position dus aux arrêts et aux pénalités).
