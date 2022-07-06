import { Component, OnInit } from '@angular/core';
import { 
  Scene, 
  PerspectiveCamera, 
  Color,
  Clock,
  WebGLRenderer,
  PCFSoftShadowMap,
  sRGBEncoding
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-threejs-canvas',
  templateUrl: './threejs-canvas.component.html',
  styleUrls: ['./threejs-canvas.component.scss']
})
export class ThreejsCanvasComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    const {
      canvas,
      scene,
      sizes,
      camera,
      renderer,
      controls,
      clock
    } = this.initScene();

    const renderLoop = () => {
      controls.update();
    
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
      width: 500,
      height: window.innerHeight,
    };

    const camera = new PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
    );
    // camera.position.y = 5;
    // camera.position.z = 40;

    //Crea un renderizador para que dibuje el 3D en el canvas
    const renderer = new WebGLRenderer({
      preserveDrawingBuffer: true,
      antialias: true,
      canvas
    });

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    renderer.setSize(sizes.width, sizes.height);

    renderer.outputEncoding = sRGBEncoding;

    //Añade los controles orbitales al render
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;

    controls.maxPolarAngle = Math.PI / 2; // radians

    controls.minDistance = 30; // radians
    controls.maxDistance = 40; // radians

    window.addEventListener("resize", () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
    
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
    
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

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

}
