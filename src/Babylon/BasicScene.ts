import {
    Scene, 
    Engine, 
    FreeCamera, 
    Vector3, 
    HemisphericLight, 
    MeshBuilder
} from "@babylonjs/core"

export class BasicScene{

    scene: Scene;
    engine: Engine;

    constructor(private canvas:HTMLCanvasElement){
        //adding scene at 0,0,0
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();
        this.engine.runRenderLoop(()=>{
            this.scene.render();
        })
    }

    CreateScene():Scene{
        // adding camera
        const scene = new Scene(this.engine);
        const camera = new FreeCamera("camera", new Vector3(0,1,-5), this.scene); //set the camera position
        camera.attachControl();
        camera.speed = 0.25;

        //adding light
        const hemiLight = new HemisphericLight(
            "hemiLight", 
            new Vector3(0,1,0), 
            this.scene
        );

        //set intensity of light
        hemiLight.intensity = 0.5;

        //set the ground mesh
        const ground = MeshBuilder.CreateGround("ground", 
            { width:10, height:10 },
            this.scene
        );

        //creating mesh
        const ball = MeshBuilder.CreateSphere("ball", {diameter: 1}, this.scene);
        ball.position = new Vector3(0,0.5,5); //set the ball position
        // ball.position.x = 1 // if want to adjust the x y z of ball
        return scene;
    }
}