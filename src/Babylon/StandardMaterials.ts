import {
    Scene, 
    Engine, 
    FreeCamera, 
    Vector3, 
    HemisphericLight, 
    MeshBuilder,
    StandardMaterial,
    Texture
} from "@babylonjs/core"

export class StandardMaterials{

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
        const camera = new FreeCamera("camera", new Vector3(0,2,-5), this.scene); //set the camera position
        camera.attachControl();
        camera.speed = 0.25;

        //adding light
        const hemiLight = new HemisphericLight(
            "hemiLight", 
            new Vector3(0,1,0), 
            this.scene
        );

        //set intensity of light 
        hemiLight.intensity = 1;
        const ground = MeshBuilder.CreateGround("ground", 
            { width:10, height:10 },
            this.scene
        );

        //.......creating mesh

        //BALL
        const ball = MeshBuilder.CreateSphere("ball", {diameter: 1}, this.scene);
        ball.position = new Vector3(0,0.5,3); //set the ball position
        // ball.position.x = 1 // if want to adjust the x y z of ball

        //assigning materials to each meshes
        ground.material = this.CreateGroundMaterial();
        ball.material = this.CreateBallMaterial();


        return scene;
    }

    //methods for materials
    //mat1
    CreateGroundMaterial():StandardMaterial{
        const groundMat = new StandardMaterial("groundMat", this.scene);

            const uvScale = 4;
            const texArray: Texture[] = [];

            //.........assigning texture to material
            const diffuseTex = new Texture("./textures/stone/floor_bricks_02_diff_1k.jpg", this.scene);
            //scale u/down the texture
            // diffuseTex.uScale = 4;
            // diffuseTex.vScale = 4;
            groundMat.diffuseTexture = diffuseTex;
            texArray.push(diffuseTex);

            const normalTex = new Texture("./textures/stone/floor_bricks_02_nor_gl_1k.jpg", this.scene);
            groundMat.bumpTexture = normalTex;
            texArray.push(normalTex);

            const aoText = new Texture("./textures/stone/floor_bricks_02_ao_1k.jpg", this.scene);
            groundMat.ambientTexture = aoText;
            texArray.push(aoText);

            const specTex = new Texture("./textures/stone/floor_bricks_02_spec_1k.jpg", this.scene);
            groundMat.specularTexture = specTex;
            texArray.push(specTex);

            texArray.forEach((tex)=>{
                tex.uScale = uvScale;
                tex.vScale = uvScale;
            });

        return groundMat;
    }

    //mat2
    CreateBallMaterial():StandardMaterial{
        const ballMat = new StandardMaterial("ballMat", this.scene);
        const uvScale = 1;
        const texArray: Texture[] = [];

            //.........assigning texture to material
            const diffuseTex = new Texture("./textures/metal/metal_plate_diff_1k.jpg", this.scene);
            ballMat.diffuseTexture = diffuseTex;
            texArray.push(diffuseTex);

            const normalTex = new Texture("./textures/metal/metal_plate_nor_gl_1k.jpg", this.scene);
            ballMat.bumpTexture = normalTex;
            texArray.push(normalTex);

            const aoText = new Texture("./textures/metal/metal_plate_ao_1k.jpg", this.scene);
            ballMat.invertNormalMapX = true; //invert the normal map
            ballMat.invertNormalMapY = true; //invert the normal map
            ballMat.ambientTexture = aoText;
            texArray.push(aoText);

            const specTex = new Texture("./textures/metal/metal_plate_spec_1k.jpg", this.scene);
            ballMat.specularTexture = specTex;
            ballMat.specularPower = 10; //dia jadi lebih dominan redup cahaya(?)
            texArray.push(specTex);

            texArray.forEach((tex)=>{
                tex.uScale = uvScale;
                tex.vScale = uvScale;
            });

        return ballMat;
    }

}