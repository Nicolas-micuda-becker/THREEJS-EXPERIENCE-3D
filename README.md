# Expérience 3D Immersive - Three.js

> **Projet Final - Moteur de Jeu L3**  
> _Une expérience interactive 3D mêlant réalisme architectural et voyage spatial psychédélique_

![Three.js](https://img.shields.io/badge/Three.js-r149+-000000?style=for-the-badge&logo=three.js)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![WebGL](https://img.shields.io/badge/WebGL-2.0-990000?style=for-the-badge&logo=webgl)

---

## Table des matières

- [À propos](#à-propos)
- [Caractéristiques](#caractéristiques)
- [Technologies](#technologies)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Architecture](#architecture)
- [Apprentissages](#apprentissages)
- [Crédits](#crédits)

---

## À propos

Ce projet implémente une **expérience 3D interactive** divisée en plusieurs actes :

1. **Visite Virtuelle** : Exploration cinématique d'une chambre photorealiste avec éclairage dynamique, textures PBR, et meubles 3D détaillés
2. **Transition Psychédélique** : Plongée dans un univers abstrait avec particules nuageuses, icosaèdres rebondissants, et carrés pulsants colorés
3. **Voyage Hyperspatial** : Effet de vitesse lumière traversant l'espace
4. **Générique** : Crédits défilants en texte 3D


---

## Caractéristiques

### Modélisation & Rendu

- **Chambre réaliste** avec murs, sol en bois, plafond, fenêtres transparentes
- **Textures PBR avancées** : Color, Normal, Roughness, Ambient Occlusion
- **Modèles 3D GLTF** : lit double, canapé, télévision, meuble TV, tapis, ventilateur de plafond, lampe à lave groovy
- **Éclairage dynamique** : PointLight (plafond + lampe), DirectionalLight (fenêtre), AmbientLight

### Effets Visuels

- **150 particules nuageuses** distribuées sphériquement avec rotation continue
- **50 icosaèdres** animés avec physique de rebond et bounding box
- **10 carrés concentriques** pulsants avec animation HSL arc-en-ciel
- **Effet Hyperspeed** (modèle FBX custom)
- **Transitions fade** (noir/blanc) pour changements de scènes

### Cinématographie

- **17 phases de caméra** chorégraphiées avec interpolations lerp
- **Mouvements sinusoïdaux** pour oscillations réalistes
- **FOV dynamique** (zoom in/out)
- **LookAt animés** pour suivre objets d'intérêt

### Interactivité

- **Contrôle clavier** : Touche `1` pour lancer l'animation
- **Responsive** : Adaptation automatique à la taille de la fenêtre

---

## Technologies

### Langages & Frameworks

```
JavaScript ES6+ (Modules)
Three.js (r149+)
WebGL 2.0
HTML5 / CSS3
```

### Loaders & Utilitaires

| Composant               | Usage                           |
| ----------------------- | ------------------------------- |
| **GLTFLoader**          | Import modèles 3D Kenney Assets |
| **FBXLoader**           | Import effet hyperspeed custom  |
| **FontLoader**          | Rendu texte 3D (crédits)        |
| **TextureLoader**       | Chargement textures PBR         |
| **fflate**              | Décompression assets            |
| **BufferGeometryUtils** | Manipulation géométries         |

### Assets

- **Modèles 3D** : [Kenney Furniture Kit](https://kenney.nl/) (CC0)
- **Textures** : AmbientCG (CC0) - WoodFloor057, Plaster007
- **Fonts** : Helvetiker Regular (typeface.json)
- **Custom** : Hyperspeed FBX (créé avec Blender)

---

## Installation

### Prérequis

- **Navigateur moderne** avec support WebGL 2.0
- **Serveur local** (Live Server, http-server, Python SimpleHTTPServer)

### Étapes

```bash
# 1. Cloner ou télécharger le projet
git clone <votre-repo>
cd TP3_THREEJS_Micuda_Nicolas

# 2. Lancer un serveur local
# Option A : avec Python
python3 -m http.server 8000

# Option B : avec Node.js http-server
npx http-server -p 8000

# Option C : avec VS Code Live Server
# Clic droit sur index.html → "Open with Live Server"

# 3. Ouvrir dans le navigateur
# http://localhost:8000
```

**Important** : Ne pas ouvrir `index.html` directement (erreurs CORS avec modules ES6)

---

## Utilisation

### Contrôles

| Touche | Action                      |
| ------ | --------------------------- |
| **1**  | Lancer l'animation |

### Déroulement

1. **Chargement** : La scène se charge (quelques secondes)
2. **Intro** : Caméra dans la chambre → **Appuyer sur `1`**
3. **Fade noir** : Transition vers l'univers abstrait
4. **Phase spatiale** : Mouvements automatiques de caméra
5. **Hyperspeed** : Accélération dans l'espace
6. **Crédits** : Générique défilant

### Expérience optimale

- **Résolution** : 1920×1080 ou supérieure
- **Navigateur** : Chrome/Edge (meilleures performances WebGL)
- **Audio** : Mettre votre musique préférée !

---

## Architecture

### Structure du projet

```
TP3_THREEJS_Micuda_Nicolas/
│
├── index.html                 # Point d'entrée
├── README                     # Ce fichier
│
├── js/
│   ├── app.js                 # Application principale (755 lignes)
│   ├── three.module.min.js    # Three.js core
│   ├── GLTFLoader.js          # Loader GLTF
│   ├── FBXLoader.js           # Loader FBX
│   ├── FontLoader.js          # Loader fonts
│   └── fonts/
│       └── helvetiker_regular.typeface.json
│
├── assets/
│   ├── ground_texture/        # Textures PBR (bois, plâtre)
│   ├── kenney_furniture-kit/  # Modèles 3D meubles
│   ├── colorsmoke.png         # Texture particules
│   ├── groovy_lava_lamp.glb   # Lampe à lave
│   └── hyperspeed.fbx         # Effet spatial
│
├── libs/
│   └── fflate.module.js       # Décompression
│
├── curves/                    # Utilitaires NURBS (non utilisés)
└── utils/
    └── BufferGeometryUtils.js
```

### Machine à États (FSM)

```
Phase -1  : Initialisation
Phase  0  : Intro chambre (appui touche 1)
Phase  1  : Fade noir + spawn icosaèdres/carrés
Phase  3-7: Mouvements caméra dans l'univers abstrait
Phase  8  : Descente vers l'espace
Phase 10  : Zoom FOV
Phase 11-13: Repositionnement
Phase 14  : Spawn hyperspeed
Phase 15  : Accélération + fade blanc
Phase 16  : Fade out blanc
Phase 17  : Crédits défilants
```

### Algorithmes Clés

#### Distribution sphérique des nuages

```javascript
const theta = Math.random() * Math.PI * 2;
const phi = Math.acos(2 * Math.random() - 1);
const x = RADIUS * Math.sin(phi) * Math.cos(theta);
const y = RADIUS * Math.cos(phi);
const z = RADIUS * Math.sin(phi) * Math.sin(theta);
```

#### Interpolation linéaire (Lerp)

```javascript
camera.position.lerp(targetPosition, 0.01); // 1% par frame
```

#### Physique de rebond

```javascript
if (position.x <= minX || position.x >= maxX) velocity.x *= -1;
```

#### Animation HSL cyclique

```javascript
const hue = (t * 30 + i * 40) % 360;
material.color.setHSL(hue / 360, 1, 0.5);
```

---

## Apprentissages

### Compétences Techniques

- **Three.js** : Maîtrise du pipeline de rendu, scene graph, matériaux PBR
- **WebGL** : Optimisation performances, gestion mémoire GPU
- **Géométrie 3D** : Transformations matricielles, quaternions, coordonnées sphériques
- **Programmation asynchrone** : Gestion loaders, promesses, callbacks
- **Architecture logicielle** : Machine à états, modularité, séparation des responsabilités

### Concepts Graphiques

- **PBR (Physically Based Rendering)** : Normal maps, roughness, AO
- **Cinématographie virtuelle** : Keyframing, easing, transitions
- **Systèmes de particules** : Distribution, animation procédurale
- **Éclairage 3D** : Point lights, directional lights, ambient occlusion

### Soft Skills

- **Problem solving** : Débogage visuel, ajustements itératifs
- **Gestion de projet** : Planification phases, optimisation workflow
- **Créativité technique** : Équilibre esthétique/performance

---

## Lien avec la Formation

**Parcours : Licence Informatique - Université Paris 8 Vincennes**

| Module                    | Application dans ce projet                    |
| ------------------------- | --------------------------------------------- |
| **Algorithmique Avancée** | FSM, lerp, distributions probabilistes        |
| **Programmation Objet**   | Architecture Three.js, héritage Mesh/Geometry |
| **Graphisme 3D**          | Pipeline de rendu, transformations, shaders   |
| **Moteurs de Jeu**        | Loop d'animation, gestion d'états, physique   |
| **Mathématiques**         | Géométrie 3D, trigonométrie, interpolations   |
| **Multimédia**            | Gestion assets, formats 3D, optimisation      |

Compétences directement transférables vers : **Game Development, Visualisation Scientifique, Réalité Virtuelle, Simulations 3D**

---

## Crédits

### Développement

**Nicolas Micuda** - Étudiant L3 Université Paris 8 Vincennes

### Assets 3D

- **Meubles** : [Kenney Assets](https://kenney.nl/assets/furniture-kit) (CC0)
- **Lampe à lave** : Modèle community (CC0)
- **Hyperspeed** : Modélisé avec Blender par Nicolas Micuda

### Textures

- **AmbientCG** : [ambientcg.com](https://ambientcg.com/) (CC0)
  - WoodFloor057 (1K)
  - Plaster007 (1K)
- **Particules** : colorsmoke.png (libre de droits)

### Bibliothèques

- **Three.js** : [threejs.org](https://threejs.org/) - MIT License
- **fflate** : Compression/décompression - MIT License

### Logiciels

- **Blender** : Modélisation 3D
- **Visual Studio Code** : IDE
- **Git** : Versioning

### Typographie

- **Helvetiker Regular** : typeface.json format

---

## License

Ce projet est réalisé dans un cadre académique.  
Les assets tiers conservent leurs licenses respectives.

**Code source** : Libre d'utilisation à des fins éducatives avec attribution.

---

## Remerciements

Merci à Nicolas Jouandeau enseignants du cours "Moteur de Jeu" de l'Université Paris 8 Vincennes.

Merci à la communauté Three.js pour la documentation exhaustive et les exemples inspirants (A NUMBER FROM THE GHOST).

---

<div align="center">

**Fait par Nicolas Micuda**

_Décembre 2025 - Université Paris 8 Vincennes

</div>
