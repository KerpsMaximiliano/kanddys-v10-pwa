import { Component, OnInit } from '@angular/core';
import { 
  Scene, 
  PerspectiveCamera, 
  CubeCamera,
  WebGLCubeRenderTarget,
  Color,
  Clock,
  WebGLRenderer,
  PCFSoftShadowMap,
  Mesh,
  sRGBEncoding,
  MeshStandardMaterial,
  PlaneGeometry,
  AmbientLight,
  DirectionalLight,
  PointLight,
  SphereGeometry,
  MeshBasicMaterial,
  ShaderChunk,
  EquirectangularReflectionMapping,
  TextureLoader,
  AnimationMixer,
  LoopRepeat
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { GLTFLoader, GLTF, GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
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
  animationMixer: AnimationMixer = null;
  cardFaces: Record<any, MeshStandardMaterial> = {};

  constructor() { }

  async ngOnInit() {
    const {
      canvas,
      scene,
      sizes,
      camera,
      cubeCamera,
      renderer,
      controls,
      clock,
      groundMirror
    } = this.initScene();
    await this.addGLTFModelToTheScene(camera, cubeCamera, scene, 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/gltfs/Anim4/Creditcard.gltf');
    this.initMenu(camera, cubeCamera, this.gltfModel, groundMirror);

    const renderLoop = () => {
      controls.update();
    
      cubeCamera.update(renderer, scene);

      renderer.render(scene, camera);

      //Tiempo pasado desde el ultimo frame al actual
      let delta = clock.getDelta();

      this.animationMixer.update(delta);

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

    const cubeRenderTarget = new WebGLCubeRenderTarget( 512 );
    // cubeRenderTarget.texture.type = THREE.HalfFloatType;

    const cubeCamera = new CubeCamera( 1, 1000, cubeRenderTarget );
    scene.add(cubeCamera);

    // camera.position.y = 5;
    // camera.position.z = 40;
    camera.position.x = -0.0798657365045112;
    camera.position.y = 0.4813698379714353;
    camera.position.z = 4.376446891678747;

    //Luces
    //Añade una luz uniforme a toda la escena
    const light = new AmbientLight(0xffffff, 0.5); // soft white light
    scene.add(light);

    // const sphere = new SphereGeometry(0.1, 16, 8);

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

    // directionalLight.add(
    //   new Mesh(sphere, new MeshBasicMaterial({ color: 0x87ceeb }))
    // );


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

    controls.minDistance = 1; // radians
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
      transparent: true,
    });

    //Añade un espejo para las reflexiones del suelo
    const groundMirror = new Reflector(floorGeometry, {
      clipBias: 0.003,
      textureWidth: (window.innerWidth >= 500 ? 500 : window.innerWidth) * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0xffffff,
    });
    groundMirror.position.y = -0.055;
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
      cubeCamera,
      renderer,
      controls,
      clock,
      groundMirror
    }
  }

  initMenu(camera: PerspectiveCamera, cubeCamera: CubeCamera, gltf: GLTF, groundMirror: Reflector) {
    const gui = new GUI();
    gui.add( document, 'title' );

    gui.close();

    const cameraPositionsFolder = gui.addFolder('Camera Positions');
    cameraPositionsFolder.add(camera.position, 'x', -500, 500).step(0.1);
    cameraPositionsFolder.add(camera.position, 'y', -500, 500).step(0.1);
    cameraPositionsFolder.add(camera.position, 'z', -500, 500).step(0.1);

    const modelPositionsFolder = gui.addFolder('Model Positions');
    modelPositionsFolder.add(gltf.scene.position, 'x', -40, 40).step(0.1);
    modelPositionsFolder.add(gltf.scene.position, 'y', -40, 40).step(0.1);
    modelPositionsFolder.add(gltf.scene.position, 'z', -40, 40).step(0.1);

    const groundMirrorPositionsFolder = gui.addFolder('Reflector Positions');
    groundMirrorPositionsFolder.add(groundMirror.position, 'x', -40, 40).step(0.1);
    groundMirrorPositionsFolder.add(groundMirror.position, 'y', -40, 40).step(0.1);
    groundMirrorPositionsFolder.add(groundMirror.position, 'z', -40, 40).step(0.1);

    const frontFaceFolder = gui.addFolder('Front face');
    frontFaceFolder.add(this.cardFaces['front'].map.offset, 'x').min(-1).max(1).step(0.01).onChange(newValue => {
      this.cardFaces['front'].map.offset.setX(newValue);
    });

    frontFaceFolder.add(this.cardFaces['front'].map.offset, 'y').min(-1).max(1).step(0.01).onChange(newValue => {
      this.cardFaces['front'].map.offset.setY(newValue);
    });

    frontFaceFolder.add(this.cardFaces['front'].map.offset, 'y').min(-1).max(1).step(0.01).onChange(newValue => {
      this.cardFaces['front'].map.offset.setY(newValue);
    });

    frontFaceFolder.add(this.cardFaces['front'].map.repeat, 'x').min(0).max(2).step(0.01).onChange(newValue => {
      this.cardFaces['front'].map.repeat.setX(newValue);
    });

    frontFaceFolder.add(this.cardFaces['front'].map.repeat, 'y').min(0).max(2).step(0.01).onChange(newValue => {
      this.cardFaces['front'].map.repeat.setY(newValue);
    });

    const backFaceFolder = gui.addFolder('Back face');

    backFaceFolder.add(this.cardFaces['back'].map.offset, 'x').min(-1).max(1).step(0.01).onChange(newValue => {
      this.cardFaces['back'].map.offset.setX(newValue);
    });

    backFaceFolder.add(this.cardFaces['back'].map.offset, 'y').min(-1).max(1).step(0.01).onChange(newValue => {
      this.cardFaces['back'].map.offset.setY(newValue);
    });

    backFaceFolder.add(this.cardFaces['back'].map.repeat, 'x').min(0).max(2).step(0.01).onChange(newValue => {
      this.cardFaces['back'].map.repeat.setX(newValue);
    });

    backFaceFolder.add(this.cardFaces['back'].map.repeat, 'y').min(0).max(2).step(0.01).onChange(newValue => {
      this.cardFaces['back'].map.repeat.setY(newValue);
    });
  }

  addGLTFModelToTheScene(camera: PerspectiveCamera, cubeCamera: CubeCamera, scene: Scene, route: string): Promise<Boolean | null> {
    const loader = new GLTFLoader();
    const rgbeLoader = new RGBELoader();


    return new Promise((resolve, reject) => {
      rgbeLoader.load('https://storage-rewardcharly.sfo2.digitaloceanspaces.com/gltfs/Anim4/snow_field_2k.hdr', (envMapTexture => {
        envMapTexture.mapping = EquirectangularReflectionMapping;

        loader.load(
          route
          // '../Card/Card.gltf'
          , (gltf: any) => {

            unlockUI();
            const mixer = new AnimationMixer(gltf.scene); //reproductor de animaciones de Three.js
            this.animationMixer = mixer;
            
            this.gltfModel = gltf;
  
            gltf.scene.traverse(node => {
              if(node instanceof Mesh && node.material instanceof MeshStandardMaterial) {      
                if(['front', 'back'].includes(node.material.name)) this.cardFaces[node.material.name] = node.material;

                // node.receiveShadow = true;
                node.castShadow = true;
                node.material.metalness = 1;
                node.material.roughness = 0;
                node.material.envMap = envMapTexture;
                node.material.envMapIntensity = 1;
                // node.material.envMap = cubeCamera.renderTarget.texture;

                node.material.needsUpdate = true;
              }
            });

            console.log('gltf', gltf);

            gltf.animations.forEach((clip) => {
              //asegura que el ultimo frame prevalezca al terminar la animacion
              // const clipAction = this.animationMixer.clipAction(clip);
              // clipAction.clampWhenFinished = true;
              // clipAction.loop = LoopRepeat;

              // clipAction.play()
              
              //Clips de animacion para cada panel
              // if (clip.name === "cara media interior") {
              //   clipAction.play()
              // };
            
              //El componente del canvas con camara libre debe tener una linea 
              //de código que ejecute las animaciones principales con nombre "Main{Numero}"
              //if(clip.name.includes('Main')) clipAction.play();
            });
  
            gltf.scene.position.y = -0.3;
            camera.lookAt(gltf.scene.position);

    
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
      }));
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
          //reemplazar
          node.material.map = new TextureLoader().load(base64, (texture) => {
            texture.flipY = false;
            // texture.repeat.set(0.8, 0.8);
          });
          if(['front', 'back'].includes(node.material.name)) this.cardFaces[node.material.name] = node.material;
          

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
