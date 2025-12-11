import * as THREE from 'three';
import { GLTFLoader } from 'gltf';
import { FBXLoader } from 'FBXLoader';
import { FontLoader } from 'FontLoader';



const CANVAS_SELECTOR = '#myCanvas';
const AMPLITUDE = 0.005;
const FREQUENCY = 0.007;


const LARGEUR_CHAMBRE = 4.5;
const HAUTEUR_CHAMBRE = 2.5;
const PROFONDEUR_CHAMBRE = 8;
const EPAISSEUR_MUR = 0.1;


const HAUTEUR_PORTE = 2.0;
const LARGEUR_PORTE = 1.3;
const HAUTEUR_FENETRE = HAUTEUR_CHAMBRE / 2;
const LARGEUR_FENETRE = 2;
const LARGEUR_PLANCHE = 6.2;
const LONGUEUR_PLANCHE = 1.35;
const EPAISSEUR_PLANCHE = 0.1;
let t = 0;



const CLOUD_COUNT = 150;
const CLOUD_RADIUS = 50;

const BOUNDS = {
  minX: -14, maxX: -3,
  minY: -14, maxY: -4,
  minZ: 2, maxZ: 11
};

const width = BOUNDS.maxX - BOUNDS.minX;
const height = BOUNDS.maxY - BOUNDS.minY;
const depth = BOUNDS.maxZ - BOUNDS.minZ;

const targetRotX = Math.random() * Math.PI * 2;
const targetRotY = Math.random() * Math.PI * 2;
const icoGeo = new THREE.IcosahedronGeometry(0.05, 0);
const icoMat = new THREE.MeshNormalMaterial();
const ico = new THREE.Mesh(icoGeo, icoMat);

let canvas;
let renderer;
let scene;
let camera;
let hyperspeed = null;
let xhyperspeed = 0;
let yhyperspeed = 0;
let zhyperspeed = 0;
let helloMesh = undefined;

let introPhase = -1;
let fade = 1;
let fade2 = 0;
let icosSpawned = false;
let creditsSpawned = false;
let introphase_test = false;


let fadePlane;
let fadePlane2;
let cloudParticles = [];

let icos = [];
let velocities = [];

let squares1 = [];
let squares2 = [];
let squarespawn = false;


const loader = new GLTFLoader();
const fbxLoader = new FBXLoader();
let fontloader = new FontLoader();

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function spawnIcosa() {
  const geo = new THREE.IcosahedronGeometry(0.25, 0);
  const mat = new THREE.MeshNormalMaterial();
  const i = new THREE.Mesh(geo, mat);
  i.position.set(randomRange(BOUNDS.minX, BOUNDS.maxX), randomRange(BOUNDS.minY, BOUNDS.maxY), randomRange(BOUNDS.minZ, BOUNDS.maxZ));
  scene.add(i);
  icos.push(i);
  velocities.push(new THREE.Vector3(randomRange(-0.02, 0.02), randomRange(-0.02, 0.02), randomRange(-0.02, 0.02)));
}




canvas = document.querySelector(CANVAS_SELECTOR);
renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 300);
camera.lookAt(2, 1, 4);

scene.add(camera);

fadePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 })
);
fadePlane.position.z = -0.1;
camera.add(fadePlane);

fadePlane2 = new THREE.Mesh(
  new THREE.PlaneGeometry(2, 2),
  new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0 })
);
fadePlane2.position.z = -0.1;
camera.add(fadePlane2);


const texLoader = new THREE.TextureLoader();

const floorColor = texLoader.load("./assets/ground_texture/WoodFloor057_1K-JPG_Color.jpg");
const floorNormal = texLoader.load("./assets/ground_texture/WoodFloor057_1K-JPG_NormalGL.jpg");
const floorRoughness = texLoader.load("./assets/ground_texture/WoodFloor057_1K-JPG_Roughness.jpg");
const floorAO = texLoader.load("./assets/ground_texture/WoodFloor057_1K-JPG_AmbientOcclusion.jpg");

floorColor.wrapS = floorColor.wrapT = THREE.RepeatWrapping;
floorNormal.wrapS = floorNormal.wrapT = THREE.RepeatWrapping;
floorRoughness.wrapS = floorRoughness.wrapT = THREE.RepeatWrapping;
floorAO.wrapS = floorAO.wrapT = THREE.RepeatWrapping;

floorColor.repeat.set(2, 2);
floorNormal.repeat.set(2, 2);
floorRoughness.repeat.set(2, 2);
floorAO.repeat.set(2, 2);

const wallColor = texLoader.load("./assets/ground_texture/Plaster007_1K-JPG_Color.jpg");
const wallNormal = texLoader.load("./assets/ground_texture/Plaster007_1K-JPG_NormalGL.jpg");
const wallRoughness = texLoader.load("./assets/ground_texture/Plaster007_1K-JPG_Roughness.jpg");
const wallAO = texLoader.load("./assets/ground_texture/Plaster007_1K-JPG_AmbientOcclusion.jpg");

wallColor.wrapS = wallColor.wrapT = THREE.RepeatWrapping;
wallNormal.wrapS = wallNormal.wrapT = THREE.RepeatWrapping;
wallRoughness.wrapS = wallRoughness.wrapT = THREE.RepeatWrapping;
wallAO.wrapS = wallAO.wrapT = THREE.RepeatWrapping;

wallColor.repeat.set(1.5, 1.5);
wallNormal.repeat.set(1.5, 1.5);
wallRoughness.repeat.set(1.5, 1.5);
wallAO.repeat.set(1.5, 1.5);


const matMur = new THREE.MeshStandardMaterial({
  map: wallColor,
  normalMap: wallNormal,
  roughnessMap: wallRoughness,
  aoMap: wallAO,
  roughness: 0.95,
  metalness: 0.0
});


const matFenetre = new THREE.MeshStandardMaterial({
  color: 0x99ccff,
  transparent: true,
  opacity: 0.35,
  side: THREE.DoubleSide
});

const matSol = new THREE.MeshStandardMaterial({
  map: floorColor,
  normalMap: floorNormal,
  roughnessMap: floorRoughness,
  aoMap: floorAO,
  roughness: 1.0,
  metalness: 0.0
});


const ceilingLight = new THREE.PointLight(0xffffff, 0.5, 10);
ceilingLight.position.set(2.0, 2.3, 2);
scene.add(ceilingLight);

const ceilingLight2 = new THREE.PointLight(0xffffff, 0.5, 10);
ceilingLight2.position.set(2.0, 2.3, 7);
scene.add(ceilingLight2);


const windowLight = new THREE.DirectionalLight(0xffffff, 0.5);
windowLight.position.set(2.5, 2, 3.95);
scene.add(windowLight);

const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);


// Sol
const geom_ground = new THREE.BoxGeometry(LARGEUR_CHAMBRE, 0.1, PROFONDEUR_CHAMBRE);
geom_ground.attributes.uv2 = geom_ground.attributes.uv; 

const ground = new THREE.Mesh(geom_ground, matSol);
ground.position.set(LARGEUR_CHAMBRE / 2, 0.05, PROFONDEUR_CHAMBRE / 2);
scene.add(ground);


// Plafond
const geom_roof = new THREE.BoxGeometry(LARGEUR_CHAMBRE, 0.1, PROFONDEUR_CHAMBRE);
geom_roof.attributes.uv2 = geom_roof.attributes.uv;
const roof = new THREE.Mesh(geom_roof, matMur);
roof.position.set(LARGEUR_CHAMBRE / 2, HAUTEUR_CHAMBRE - 0.05, PROFONDEUR_CHAMBRE / 2);
scene.add(roof);

// Mur gauche avec porte
const hauteur_sup_g = HAUTEUR_CHAMBRE - HAUTEUR_PORTE;
const profondeur_cote_g = (PROFONDEUR_CHAMBRE - LARGEUR_PORTE) / 2;

const geom_sup_g = new THREE.BoxGeometry(EPAISSEUR_MUR, hauteur_sup_g, PROFONDEUR_CHAMBRE);
geom_sup_g.attributes.uv2 = geom_sup_g.attributes.uv;
const mesh_sup_g = new THREE.Mesh(geom_sup_g, matMur);
mesh_sup_g.position.set(EPAISSEUR_MUR / 2, HAUTEUR_PORTE + hauteur_sup_g / 2, PROFONDEUR_CHAMBRE / 2);
scene.add(mesh_sup_g);

const geom_gauche_g = new THREE.BoxGeometry(EPAISSEUR_MUR, HAUTEUR_PORTE, profondeur_cote_g);
geom_gauche_g.attributes.uv2 = geom_gauche_g.attributes.uv;
const mesh_gauche_g = new THREE.Mesh(geom_gauche_g, matMur);
mesh_gauche_g.position.set(EPAISSEUR_MUR / 2, HAUTEUR_PORTE / 2, profondeur_cote_g / 2);
scene.add(mesh_gauche_g);

const geom_droite_g = new THREE.BoxGeometry(EPAISSEUR_MUR, HAUTEUR_PORTE, profondeur_cote_g);
geom_droite_g.attributes.uv2 = geom_droite_g.attributes.uv;
const mesh_droite_g = new THREE.Mesh(geom_droite_g, matMur);
mesh_droite_g.position.set(EPAISSEUR_MUR / 2, HAUTEUR_PORTE / 2, PROFONDEUR_CHAMBRE - profondeur_cote_g / 2);
scene.add(mesh_droite_g);

// Mur droit avec fenêtre
const hauteur_sup_r = (HAUTEUR_CHAMBRE - HAUTEUR_FENETRE) / 2;
const hauteur_inf_r = hauteur_sup_r;

const geom_sup_r = new THREE.BoxGeometry(EPAISSEUR_MUR, hauteur_sup_r, PROFONDEUR_CHAMBRE);
geom_sup_r.attributes.uv2 = geom_sup_r.attributes.uv;
const mesh_sup_r = new THREE.Mesh(geom_sup_r, matMur);
mesh_sup_r.position.set(LARGEUR_CHAMBRE - EPAISSEUR_MUR / 2, HAUTEUR_CHAMBRE - hauteur_sup_r / 2, PROFONDEUR_CHAMBRE / 2);
scene.add(mesh_sup_r);

const geom_inf_r = new THREE.BoxGeometry(EPAISSEUR_MUR, hauteur_inf_r, PROFONDEUR_CHAMBRE);
geom_inf_r.attributes.uv2 = geom_inf_r.attributes.uv;
const mesh_inf_r = new THREE.Mesh(geom_inf_r, matMur);
mesh_inf_r.position.set(LARGEUR_CHAMBRE - EPAISSEUR_MUR / 2, hauteur_inf_r / 2, PROFONDEUR_CHAMBRE / 2);
scene.add(mesh_inf_r);

const geom_gauche_r = new THREE.BoxGeometry(EPAISSEUR_MUR, HAUTEUR_FENETRE, (PROFONDEUR_CHAMBRE - LARGEUR_FENETRE) / 2);
geom_gauche_r.attributes.uv2 = geom_gauche_r.attributes.uv;
const mesh_gauche_r = new THREE.Mesh(geom_gauche_r, matMur);
mesh_gauche_r.position.set(LARGEUR_CHAMBRE - EPAISSEUR_MUR / 2, HAUTEUR_CHAMBRE / 2, (PROFONDEUR_CHAMBRE - LARGEUR_FENETRE) / 4);
scene.add(mesh_gauche_r);

const geom_droite_r = new THREE.BoxGeometry(EPAISSEUR_MUR, HAUTEUR_FENETRE, (PROFONDEUR_CHAMBRE - LARGEUR_FENETRE) / 2);
geom_droite_r.attributes.uv2 = geom_droite_r.attributes.uv;
const mesh_droite_r = new THREE.Mesh(geom_droite_r, matMur);
mesh_droite_r.position.set(LARGEUR_CHAMBRE - EPAISSEUR_MUR / 2, HAUTEUR_CHAMBRE / 2, PROFONDEUR_CHAMBRE - (PROFONDEUR_CHAMBRE - LARGEUR_FENETRE) / 4);
scene.add(mesh_droite_r);

const geom_vitre_r = new THREE.BoxGeometry(EPAISSEUR_MUR, HAUTEUR_FENETRE, LARGEUR_FENETRE);
const mesh_vitre_r = new THREE.Mesh(geom_vitre_r, matFenetre);
mesh_vitre_r.position.set(LARGEUR_CHAMBRE - EPAISSEUR_MUR / 2, HAUTEUR_CHAMBRE / 2 - 0.01, PROFONDEUR_CHAMBRE / 2 - 0.01);
scene.add(mesh_vitre_r);

// Mur arrière
const geom_bwall = new THREE.BoxGeometry(LARGEUR_CHAMBRE, HAUTEUR_CHAMBRE, EPAISSEUR_MUR);
geom_bwall.attributes.uv2 = geom_bwall.attributes.uv;
const bwall = new THREE.Mesh(geom_bwall, matMur);
bwall.position.set(LARGEUR_CHAMBRE / 2, HAUTEUR_CHAMBRE / 2, EPAISSEUR_MUR / 2);
scene.add(bwall);

// Mur avant avec fenêtre
const hauteur_sup_f = (HAUTEUR_CHAMBRE - HAUTEUR_FENETRE) / 2;
const hauteur_inf_f = hauteur_sup_f;
const largeur_gauche_f = (LARGEUR_CHAMBRE - LARGEUR_FENETRE) / 2;
const largeur_droite_f = largeur_gauche_f;

const geom_sup_f = new THREE.BoxGeometry(LARGEUR_CHAMBRE, hauteur_sup_f, EPAISSEUR_MUR);
geom_sup_f.attributes.uv2 = geom_sup_f.attributes.uv;
const mesh_sup_f = new THREE.Mesh(geom_sup_f, matMur);
mesh_sup_f.position.set(LARGEUR_CHAMBRE / 2, HAUTEUR_CHAMBRE - hauteur_sup_f / 2, PROFONDEUR_CHAMBRE - EPAISSEUR_MUR / 2);
scene.add(mesh_sup_f);

const geom_inf_f = new THREE.BoxGeometry(LARGEUR_CHAMBRE, hauteur_inf_f, EPAISSEUR_MUR);
geom_inf_f.attributes.uv2 = geom_inf_f.attributes.uv;
const mesh_inf_f = new THREE.Mesh(geom_inf_f, matMur);
mesh_inf_f.position.set(LARGEUR_CHAMBRE / 2, hauteur_inf_f / 2, PROFONDEUR_CHAMBRE - EPAISSEUR_MUR / 2);
scene.add(mesh_inf_f);

const geom_gauche_f = new THREE.BoxGeometry(largeur_gauche_f, HAUTEUR_FENETRE, EPAISSEUR_MUR);
geom_gauche_f.attributes.uv2 = geom_gauche_f.attributes.uv;
const mesh_gauche_f = new THREE.Mesh(geom_gauche_f, matMur);
mesh_gauche_f.position.set(largeur_gauche_f / 2, HAUTEUR_CHAMBRE / 2, PROFONDEUR_CHAMBRE - EPAISSEUR_MUR / 2);
scene.add(mesh_gauche_f);

const geom_droite_f = new THREE.BoxGeometry(largeur_droite_f, HAUTEUR_FENETRE, EPAISSEUR_MUR);
geom_droite_f.attributes.uv2 = geom_droite_f.attributes.uv;
const mesh_droite_f = new THREE.Mesh(geom_droite_f, matMur);
mesh_droite_f.position.set(LARGEUR_CHAMBRE - largeur_droite_f / 2, HAUTEUR_CHAMBRE / 2, PROFONDEUR_CHAMBRE - EPAISSEUR_MUR / 2);
scene.add(mesh_droite_f);

const geom_vitre_f = new THREE.BoxGeometry(LARGEUR_FENETRE, HAUTEUR_FENETRE, EPAISSEUR_MUR);
const mesh_vitre_f = new THREE.Mesh(geom_vitre_f, matFenetre);
mesh_vitre_f.position.set(LARGEUR_CHAMBRE / 2 - 0.01, HAUTEUR_CHAMBRE / 2 - 0.01, PROFONDEUR_CHAMBRE - EPAISSEUR_MUR / 2);
scene.add(mesh_vitre_f);


// planche devant le mur gauche
const geom_planche = new THREE.BoxGeometry(LARGEUR_PLANCHE, EPAISSEUR_PLANCHE, LONGUEUR_PLANCHE);
geom_planche.attributes.uv2 = geom_planche.attributes.uv;
const planche = new THREE.Mesh(geom_planche, matSol);
planche.position.set(-3.1, EPAISSEUR_PLANCHE / 2, PROFONDEUR_CHAMBRE / 2);
scene.add(planche);



const text_loader = new THREE.TextureLoader();
text_loader.load("./assets/colorsmoke.png", function (texture) {
  const cloudGeo = new THREE.PlaneGeometry(75, 75);
  const cloudMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    opacity: 0.95,
  });

  for (let i = 0; i < CLOUD_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = CLOUD_RADIUS * Math.sin(phi) * Math.cos(theta);
    const y = CLOUD_RADIUS * Math.cos(phi);
    const z = CLOUD_RADIUS * Math.sin(phi) * Math.sin(theta);

    const cloud = new THREE.Mesh(cloudGeo, cloudMat);
    cloud.position.set(x, y, z);
    cloud.rotation.z = Math.random() * Math.PI * 2;
    cloud.material.color.setHSL(0.81, 1, 0.55);
    cloud.lookAt(camera.position);
    cloudParticles.push(cloud);
    scene.add(cloud);
  }
});



loader.load('./assets/kenney_furniture-kit/Models/GLTF format/bedDouble.glb', (gltf) => {
  const bed = gltf.scene;
  bed.position.set(2, 0.1, 3);
  bed.scale.set(2.5, 2.5, 2.5);
  bed.material = new THREE.MeshNormalMaterial();
  scene.add(bed);
});

loader.load('./assets/kenney_furniture-kit/Models/GLTF format/cabinetBedDrawerTable.glb', (gltf) => {
  const table = gltf.scene;
  table.position.set(0.5, 0.1, 0.55);
  table.scale.set(4.0, 2.0, 2.0);
  scene.add(table);
});

loader.load('./assets/kenney_furniture-kit/Models/GLTF format/rugRounded.glb', (gltf) => {
  const rug = gltf.scene;
  rug.position.set(0.5, 0.1, 4);
  rug.scale.set(2.0, 1.0, 1.0);
  scene.add(rug);
});

let ceilingfan = null;

loader.load('./assets/kenney_furniture-kit/Models/GLTF format/ceilingFan.glb', (gltf) => {
  ceilingfan = gltf.scene;
  ceilingfan.position.set(2.0, 2.5, 5.5);
  ceilingfan.scale.set(3.0, 3.0, 3.0);
  scene.add(ceilingfan);
});

loader.load('./assets/kenney_furniture-kit/Models/GLTF format/loungeSofa.glb', (gltf) => {
  const sofa = gltf.scene;
  sofa.position.set(3.5, 0.1, 5);
  sofa.scale.set(2, 2, 2);
  sofa.rotation.y = Math.PI / -2; 
  scene.add(sofa);
});

loader.load('./assets/kenney_furniture-kit/Models/GLTF format/cabinetTelevision.glb', (gltf) => {
  const cabinet = gltf.scene;
  cabinet.position.set(0.7, 0.1, 7);
  cabinet.scale.set(2, 2, 2);
  cabinet.rotation.y = Math.PI / 2; 
  scene.add(cabinet);
});

loader.load('./assets/kenney_furniture-kit/Models/GLTF format/televisionModern.glb', (gltf) => {
  const television = gltf.scene;
  television.position.set(0.4, 0.7, 6.2);
  television.scale.set(2, 2, 2);
  television.rotation.y = Math.PI / 2; 
  scene.add(television);
});

loader.load('./assets/kenney_furniture-kit/Models/GLTF format/bear.glb', (gltf) => {
  const bear = gltf.scene;
  bear.position.set(4.2, 0.9, 7.42);
  bear.scale.set(2, 2, 2);
  bear.rotation.y = Math.PI; 
  scene.add(bear);
});

loader.load('./assets/groovy_lava_lamp.glb', (gltf) => {
  const lamp = gltf.scene;
  lamp.position.set(0.7, 0.85, 0.25);
  lamp.scale.set(0.25, 0.25, 0.25);
  scene.add(lamp);

  const lampLight = new THREE.PointLight(0xff3366, 0.9, 3); 
  lampLight.position.set(0.7, 0.85, 0.55);
  scene.add(lampLight);
});


fbxLoader.load('./assets/hyperspeed.fbx', (fbx) => {
  fbx.scale.set(0.1, 0.1, 0.1);
  hyperspeed = fbx;
});

fontloader.load('js/fonts/helvetiker_regular.typeface.json', function (font) {
  let helloCubeMessageMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 1.0, side: THREE.DoubleSide });
  let shapes = font.generateShapes(
    `Credits

    Developpement :
    Nicolas Micuda

    Modeles 3D :
    Kenney Assets (CC0)
    hyperspeed : Nicolas Micuda

    Textures :
    AmbientCG (CC0)

    Bibliotheques :
    Three.js
    GLTF Loader
    FBX loader
    Fontloader
    fflate

    Logiciels :
    Blender
    Visual Studio Code
    
    Typo :
    helvetiker_regular

    Merci d'avoir regarde !`, 
    1
  );
  let geometry = new THREE.ShapeGeometry(shapes);
  geometry.translate(-1, 1, 0);
  helloMesh = new THREE.Mesh(geometry, helloCubeMessageMaterial);
});




const boxMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.0 });
const boxGeom = new THREE.BoxGeometry(width, height, depth);
const boundingBox = new THREE.Mesh(boxGeom, boxMat);
boundingBox.position.set(BOUNDS.minX + width / 2, BOUNDS.minY + height / 2, BOUNDS.minZ + depth / 2);
scene.add(boundingBox);




window.addEventListener('keydown', (event) => {
  if (event.key === "1") {
    if(introphase_test == false)
    introPhase = 0;
    introphase_test = true;
  }
});


let xlook = 0.0, ylook = 0.0, zlook = 0.0;
let phase = -1;



function animate() {
  if (introPhase == 0) {
    camera.position.lerp(new THREE.Vector3(2, 1, 4), 0.01);
    camera.lookAt(2, 1, 4);
    if (camera.position.distanceTo(new THREE.Vector3(2, 1, 4)) < 1.5) {
      fade += 0.02;
      fadePlane.material.opacity = fade;
      if (fade >= 1.2) {
        fade = 1.2;
        setTimeout(() => { introPhase = 1; }, 1000);
      }
    }
  } else if (introPhase == 1) {
    camera.position.set(3, 1.0, 0.85);
    camera.lookAt(0, 0, 0);
    fade -= 0.03;
    fadePlane.material.opacity = Math.max(0, fade);
    cloudParticles.forEach(p => p.lookAt(camera.position));
    if (!icosSpawned) {
      for (let i = 0; i < 50; i++) spawnIcosa();
      icosSpawned = true;
    }
    if (!squarespawn) {
      const sizes = [8, 7, 6, 5, 4, 3, 2, 1, 0.5, 0.25];
      const colors = [
        0x800080, // violet
        0x00ff00, // vert
        0xff0000, // rouge
        0x0000ff, // bleu
        0x00ffff, // cyan
        0xff00ff, // magenta
        0xffff00, // jaune
        0xff8800, // orange
        0xffffff, // blanc
        0xffff88  // jaune clair
      ];

      let zOffset = 15; 

      sizes.forEach((size, index) => {
        const geometry = new THREE.PlaneGeometry(size, size);
        const material = new THREE.MeshBasicMaterial({ color: colors[index % colors.length] });
        const square = new THREE.Mesh(geometry, material);

        square.position.set(2, 1.5, zOffset);
        square.lookAt(camera.position);
        scene.add(square);

        
        if (index % 2 === 0) {
          squares1.push(square);
        } else {
          squares2.push(square);
        }

        zOffset -= 0.15; 
      });

      squarespawn = true;
    }
    ico.position.set(2.0, 1.5, 14.5);
    scene.add(ico);
    introPhase = 3;
    phase = 0;
  }

  // phases de caméra
  if (phase == 0) {
    ylook += 0.007; xlook += 0.007; zlook += 0.007; camera.lookAt(xlook, ylook, zlook);
    if (ylook >= 3) phase = 1;
  } else if (phase == 1) {
    ylook -= 0.007; xlook -= 0.001; zlook -= 0.001; camera.position.y += 0.001; camera.lookAt(xlook, ylook, zlook);
    if (ylook <= 1) phase = 2;
  } else if (phase == 2) {
    ylook -= 0.002; zlook -= 0.006; xlook -= 0.006; camera.position.x -= 0.004; camera.lookAt(xlook, ylook, zlook);
    if (zlook <= 1) phase = 3;
  } else if (phase == 3) {
    ylook += 0.0045; camera.position.x -= 0.003; camera.lookAt(xlook, ylook, zlook);
    if (ylook >= 1.27) phase = 4;
  } else if (phase == 4) {
    ico.position.lerp(new THREE.Vector3(1.95, 1.30, 8.0), 0.01)
    if (zlook < 8) zlook += 0.02; if (camera.position.z < 7.5) camera.position.z += 0.01; if (xlook < 8) xlook += 0.0015; if (camera.position.x < 5) camera.position.x += 0.001;
    ylook += Math.sin(performance.now() * FREQUENCY) * AMPLITUDE;
    camera.lookAt(xlook, ylook, zlook);
    if (camera.position.z > 7.20) phase = 5;
  } else if (phase == 5) {
    ico.position.set(xlook, ylook, zlook);
    xlook -= 0.004; zlook -= 0.009; ylook += Math.sin(performance.now() * 0.0007) * 0.0005; camera.lookAt(xlook, ylook, zlook);
    if (zlook <= 6.5) phase = 6;
  } else if (phase == 6) {
    ico.position.set(xlook, ylook, zlook);
    xlook += 0.005; zlook -= 0.01; ylook += Math.sin(performance.now() * 0.0007) * 0.0005; camera.lookAt(xlook, ylook, zlook);
    if (xlook >= 2) phase = 7;
  } else if (phase == 7) {
    if (ico.position.x > -6.5) ico.position.x -= 0.04;
    if (ico.position.z > 4.5) ico.position.z -= 0.06;
    camera.position.z -= 0.01; xlook -= 0.01; zlook -= 0.007; camera.position.y += Math.sin(performance.now() * FREQUENCY) * AMPLITUDE; camera.lookAt(xlook, ylook, zlook);
    if (camera.position.z <= 4.15) phase = 8;
  } else if (phase == 8) {
    if (ico.position.y > -10) ico.position.y -= 0.05;
    camera.position.x -= 0.01; if (xlook >= -11.5) xlook -= 0.009; if (zlook <= 4.1) zlook += 0.007; camera.position.y += Math.sin(performance.now() * FREQUENCY) * AMPLITUDE; camera.lookAt(xlook, ylook, zlook);
    if (camera.position.x <= -5.1) phase = 25;
  } else if (phase == 25) {
    ylook -= 0.02;
    if (camera.position.x > -6.9) camera.position.x -= 0.008;
    camera.lookAt(xlook, ylook, zlook);
    if (ylook <= -1.95) phase = 26;
  } else if (phase == 26) {
    if (camera.fov <= 83) camera.fov += 0.3;
    camera.updateProjectionMatrix();
    if (camera.fov >= 82) phase = 10;
  } else if (phase == 10) {
    if (camera.fov >= 75) camera.fov -= 0.3;
    camera.updateProjectionMatrix();
    if (xlook >= -10) xlook -= 0.007; if (ylook > -10) ylook -= 0.08; camera.position.x -= 0.006; camera.position.y -= 0.06; camera.lookAt(xlook, ylook, zlook);
    if (camera.position.y <= -15.35) phase = 11;
  } else if (phase == 11) {
    camera.position.y += 0.05;
    camera.lookAt(xlook, ylook, zlook);
    if (camera.position.y >= 1.0) phase = 12;
  } else if (phase == 12) {
    camera.position.z += 0.02;
    camera.position.y -= 0.05;
    camera.lookAt(xlook, ylook, zlook);
    if (camera.position.z >= 10) phase = 13;
  } else if (phase == 13) {
    const targetLook = new THREE.Vector3(-35, -35, -35);
    const lookVec = new THREE.Vector3(xlook, ylook, zlook);

    lookVec.lerp(targetLook, 0.008); 

    xlook = lookVec.x;
    ylook = lookVec.y;
    zlook = lookVec.z;

    camera.lookAt(xlook, ylook, zlook);

    camera.position.lerp(new THREE.Vector3(-32, -32, -32), 0.008);

    if (camera.position.distanceTo(new THREE.Vector3(-32, -32, -32)) < 4.90 &&
        lookVec.distanceTo(targetLook) < 8.0) {
      phase = 14;
    }
  } else if (phase == 14) {
    hyperspeed.position.set(-35, -35, -35);
    scene.add(hyperspeed);
    xhyperspeed = hyperspeed.position.x;
    yhyperspeed = hyperspeed.position.y;
    zhyperspeed = (hyperspeed.position.z) * 30;
    camera.position.x -= 4
    camera.position.y -= 4
    phase = 15;
  } else if (phase == 15) {
    camera.lookAt(xhyperspeed, yhyperspeed, zhyperspeed);
    camera.position.z -= 7;
    if (camera.position.z <= -600) {
      fade2 += 0.02;
      fadePlane2.material.opacity = fade2;
      if (fade2 >= 1.2) {
        fade2 = 1.2;
      }
    }
    if (camera.position.z <= -770) phase = 16;
  } else if (phase == 16) {
    fade2 -= 0.03;
    fadePlane2.material.opacity = Math.max(0, fade2);
    if (fade2 <= 0) {
      phase = 17;
    }
  } else if (phase == 17) {
    if (!creditsSpawned) {
      helloMesh.position.set(camera.position.x - 7, camera.position.y - 8, camera.position.z - 10);
      scene.add(helloMesh);
      creditsSpawned = true;
    }
    helloMesh.position.y += 0.02;
  }
  squares1.forEach(sq => { sq.rotation.z -= 0.01; });
  squares2.forEach(sq => { sq.rotation.z += 0.01; });

  t += 0.02;

  squares1.forEach((sq, i) => {
    const pulse = 1 + Math.sin(t + i * 0.3) * 0.15;
    sq.scale.set(pulse, pulse, pulse);

    const hue = (t * 30 + i * 40) % 360;
    sq.material.color.setHSL(hue / 360, 1, 0.5);

    sq.lookAt(camera.position);
  });

  squares2.forEach((sq, i) => {
    const pulse = 1 + Math.sin(t + i * 0.5 + Math.PI) * 0.15;
    sq.scale.set(pulse, pulse, pulse);

    const hue = (t * 30 + i * 40 + 180) % 360;
    sq.material.color.setHSL(hue / 360, 1, 0.5);

    sq.lookAt(camera.position);
  });

  ico.rotation.x += 0.03; ico.rotation.y += 0.01;
  cloudParticles.forEach(p => { p.rotation.z -= 0.001; });

    if (ceilingfan) {
      ceilingfan.rotation.y += 0.03; 
    }

  for (let i = 0; i < icos.length; i++) {
    const ic = icos[i];
    const vel = velocities[i];
    ic.position.add(vel);
    if (ic.position.x <= BOUNDS.minX || ic.position.x >= BOUNDS.maxX) vel.x *= -1;
    if (ic.position.y <= BOUNDS.minY || ic.position.y >= BOUNDS.maxY) vel.y *= -1;
    if (ic.position.z <= BOUNDS.minZ || ic.position.z >= BOUNDS.maxZ) vel.z *= -1;
    ic.rotation.x += (targetRotX - ic.rotation.x) * 0.4;
    ic.rotation.y += (targetRotY - ic.rotation.y) * 0.4;
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

