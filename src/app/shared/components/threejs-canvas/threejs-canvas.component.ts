import { Component, OnInit } from '@angular/core';
import { 
  Scene, 
  PerspectiveCamera, 
  Color,
  Clock,
  WebGLRenderer,
  PCFSoftShadowMap,
  Mesh,
  sRGBEncoding,
  MeshStandardMaterial,
  PlaneGeometry,
  AmbientLight,
  SphereGeometry,
  DirectionalLight,
  MeshBasicMaterial,
  ShaderChunk,
  TextureLoader
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { GLTFLoader, GLTF, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader';
import { Reflector } from 'three/examples/jsm/objects/Reflector';
import { GUI } from 'lil-gui'
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

@Component({
  selector: 'app-threejs-canvas',
  templateUrl: './threejs-canvas.component.html',
  styleUrls: ['./threejs-canvas.component.scss']
})
export class ThreejsCanvasComponent implements OnInit {
  gltfModel: GLTF = null;
  gltfJSON: any = null;

  constructor() { }

  async ngOnInit() {
    const {
      canvas,
      scene,
      sizes,
      camera,
      renderer,
      controls,
      clock
    } = this.initScene();
    await this.addGLTFModelToTheScene(camera, scene, 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/gltfs/Anim2/Creditcard.gltf');
    this.initMenu(camera, this.gltfModel);

    const renderLoop = () => {
      controls.update();
    
      renderer.render(scene, camera);

      //Tiempo pasado desde el ultimo frame al actual
      let delta = clock.getDelta();

      // if (mixer) mixer.update(delta);
    
      //esto causa que el rendered redibuje la imagen a la tasa de refresco de la pantalla (usualmente 60 veces por segundo)
      requestAnimationFrame(renderLoop);
    }

    renderLoop();
  }

  initScene() {
    const canvas = document.getElementById('threejs-canvas');
    const scene = new Scene();
    scene.background = new Color("#FFF");

    //Responsive values
    const sizes = {
      width: window.innerWidth >= 500 ? 500 : window.innerWidth,
      height: window.innerHeight,
    };

    const camera = new PerspectiveCamera(
      50,
      (window.innerWidth >= 500 ? 500 : window.innerWidth) / window.innerHeight,
    );
    // camera.position.y = 5;
    // camera.position.z = 40;
    camera.position.x = -0.09363450643606908;
    camera.position.y = 1.1561169246658674;
    camera.position.z = 4.863602187237972;

    //Luces
    //Añade una luz uniforme a toda la escena
    const light = new AmbientLight(0xffffff, 0.5); // soft white light
    scene.add(light);

    const sphere = new SphereGeometry(0.1, 16, 8);

    const directionalLight = new DirectionalLight(0xffffff, 0.7);
    directionalLight.castShadow = true;
    directionalLight.position.set(1.5, 2.4, 3); //default;
    directionalLight.shadow.mapSize.width = 1024; // default
    directionalLight.shadow.mapSize.height = 1024; // default
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 10;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.bias = -0.005;
    scene.add(directionalLight);
    directionalLight.add(
      new Mesh(sphere, new MeshBasicMaterial({ color: 0x87ceeb }))
    );


    //Crea un renderizador para que dibuje el 3D en el canvas
    const renderer = new WebGLRenderer({
      preserveDrawingBuffer: true,
      antialias: true,
      canvas
    });

    const transformControls = new TransformControls(camera, renderer.domElement);
    scene.add(transformControls);
    transformControls.attach(directionalLight);
    transformControls.visible = false;
    transformControls.enabled = false;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    renderer.setSize(sizes.width, sizes.height);

    renderer.outputEncoding = sRGBEncoding;
    
    //INYECTA EL SHADER DE SOMBRAS SUAVES
    // overwrite shadowmap code
    let shader = ShaderChunk.shadowmap_pars_fragment;

    shader = shader.replace(
      "#ifdef USE_SHADOWMAP",
      "#ifdef USE_SHADOWMAP" + document.getElementById("PCSS").textContent
    );

    shader = shader.replace(
      "#if defined( SHADOWMAP_TYPE_PCF )",
      document.getElementById("PCSSGetShadow").textContent +
        "#if defined( SHADOWMAP_TYPE_PCF )"
    );

    ShaderChunk.shadowmap_pars_fragment = shader;

    //Añade los controles orbitales al render
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    controls.maxPolarAngle = Math.PI / 2; // radians

    controls.minDistance = 5; // radians
    controls.maxDistance = 40; // radians
    

    window.addEventListener("resize", () => {
      sizes.width = window.innerWidth >= 500 ? 500 : window.innerWidth;
      sizes.height = window.innerHeight;
    
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
    
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    const floorGeometry = new PlaneGeometry(100, 100);
    const floorMaterial = new MeshStandardMaterial({
      color: 0xFFFFFF,
      opacity: 0.95,
      transparent: true
    });

    //Añade un espejo para las reflexiones del suelo
    const groundMirror = new Reflector(floorGeometry, {
      clipBias: 0.003,
      textureWidth: (window.innerWidth >= 500 ? 500 : window.innerWidth) * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0xffffff,
    });
    groundMirror.position.y = -0.1;
    groundMirror.rotateX(-Math.PI / 2);
    scene.add(groundMirror);

    const floor = new Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    floor.position.set(0, -0.05, 0);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    //Reloj para el tiempo delta
    const clock = new Clock();

    return {
      canvas,
      scene,
      sizes,
      camera,
      renderer,
      controls,
      clock
    }
  }

  initMenu(camera: PerspectiveCamera, gltf: GLTF) {
    const gui = new GUI();
    gui.add( document, 'title' );

    gui.close();

    console.log("GLTF", gltf);
    
    const cameraPositionsFolder = gui.addFolder('Camera Positions');
    cameraPositionsFolder.add(camera.position, 'x', -500, 500).step(0.1);
    cameraPositionsFolder.add(camera.position, 'y', -500, 500).step(0.1);
    cameraPositionsFolder.add(camera.position, 'z', -500, 500).step(0.1);
  }

  addGLTFModelToTheScene(camera: PerspectiveCamera, scene: Scene, route: string): Promise<Boolean | null> {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        route
        // '../Card/Card.gltf'
        , (gltf) => {
          unlockUI();
          
          this.gltfModel = gltf;

          gltf.scene.traverse( function( node ) {
            if(node instanceof Mesh) {              
              // node.receiveShadow = true;
              node.castShadow = true; 
            }
          });
  
          scene.add(gltf.scene);
  
          // const gltfModel = gltf.scene.children[0].children[0];
      
          // camera.lookAt(gltfModel.position);
      
          // gltf.scene.position.y = 0;
      
          // mixer = new THREE.AnimationMixer(gltfModel); //reproductor de animaciones de Three.js
      
          // gltf.scene.traverse( function( node ) {
          //   if ( node.isMesh ) { 
          //     // node.receiveShadow = true;
          //     node.castShadow = true; 
          //   }
          // });
      
          // scene.add(gltfModel);
      
          /*
          if(product.modelName === "Box") {
            gltfModel.traverse(node => {
              if(node.material && node.material.name === "MOD-Arriba") {
                node.material.map = new TextureLoader().load('../images/color.jpg');
      
                node.material.map.repeat.x = 4;
                node.material.map.repeat.y = 4;
      
                node.material.map.wrapS = THREE.MirroredRepeatWrapping;
                node.material.map.wrapT = THREE.MirroredRepeatWrapping;
                /*
                node.material.map.wrapS = THREE.RepeatWrapping;
                node.material.map.wrapT = THREE.RepeatWrapping
      
      
                node.material.map.wrapS = THREE.MirroredRepeatWrapping;
                node.material.map.wrapT = THREE.MirroredRepeatWrapping;
      
                node.material.map.offset.x = 0.5;
                node.material.map.offset.y = 0.5;
      
                node.material.map.rotation = Math.PI * 0.25;
                node.material.map.center.x = 0.5;
                node.material.map.center.y = 0.5;
              }
            })
          }*/
      
          // gltfObject = gltf;
          // gltfJSON = gltf.parser.json;
      
          //readFiles();
          this.gltfJSON = gltf.parser.json;

          resolve(true);
        }, 
        () => {
          lockUI()
        },
        error => {
          console.log(error);
          reject(null);
        }
      );
    });
  }

  applyImageToGLTFMaterial(event: any) {
    let { typeOfImage: targetName, base64} = event;

    targetName = targetName === 'frontImage' ? 'front' : 'back';

    this.gltfModel.scene.traverse((node) => {
      //el condicional comprueba que el nodo sea un "material" y se
      //debe comprobar mediante el name, que sea una imagen valida para cambiar
      
      if(node instanceof Mesh) {
        if (node.material && node.material.name === targetName) {
          node.material.map = new TextureLoader().load(base64, (texture) => {
            texture.flipY = false;
          });

          // const materialNameCapitalized = node.material.name[0].toUpperCase() + node.material.name.slice(1);

          // this.gltfJSON.images.forEach((image, index) => {
          //   console.log(materialNameCapitalized, image.name);
          //   if (
          //     image.name === materialNameCapitalized
          //   ) {
          //     this.gltfJSON.images[index].uri = base64;

          //     console.log(this.gltfJSON);
          //   }
          // });
        }
      }
    });
  }
}
