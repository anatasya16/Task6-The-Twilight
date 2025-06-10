import {
    Scene, 
    Engine, 
    FreeCamera, 
    Vector3, 
    HemisphericLight, 
    MeshBuilder,
    CubeTexture,
    PBRMaterial,
    Texture
} from "@babylonjs/core"

export class PBR{

    scene: Scene;
    engine: Engine;

    constructor(private canvas:HTMLCanvasElement){
        //adding scene at 0,0,0
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();

        this.CreateEnvironment();

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

        //set the sky
        const envTex = CubeTexture.CreateFromPrefilteredData("./environment/sky.env", scene);
        scene.environmentTexture = envTex;
        // scene.createDefaultEnvironment; //can use this too if u dont have environment texture
        scene.createDefaultSkybox(envTex, true);

        //environment intensity
        scene.environmentIntensity = 0.15;
        
        return scene;
    }

    CreateEnvironment():void {
        //create the ground mesh
        const ground = MeshBuilder.CreateGround("ground", 
            { width:30, height:20 },
            this.scene
        );

        //creating mesh
        const ball = MeshBuilder.CreateSphere("ball", {diameter: 1}, this.scene);
        ball.position = new Vector3(0,0.5,5); //set the ball position
        // ball.position.x = 1 // if want to adjust the x y z of ball
        
        ground.material = this.CreateGrass();
    }

    CreateGrass(): PBRMaterial{
        const pbr = new PBRMaterial("pbr", this.scene);
        // pbr.environmentIntensity = 0;

        // Albedo Texture
        const albedoTexture = new Texture("./textures/grass/coast_sand_rocks_02_diff_1k.jpg", this.scene);
        albedoTexture.uScale = 7;
        albedoTexture.vScale = 7;
        pbr.albedoTexture = albedoTexture;

        // Normal/Bump Texture
        const bumpTexture = new Texture("./textures/grass/coast_sand_rocks_02_nor_gl_1k.jpg", this.scene);
        bumpTexture.uScale = 7;
        bumpTexture.vScale = 7;
        pbr.bumpTexture = bumpTexture;
        pbr.invertNormalMapX = true;
        pbr.invertNormalMapY = true;

        // AO/Rough/Metal Texture
        const metallicTexture = new Texture("./textures/grass/coast_sand_rocks_02_arm_1k.jpg", this.scene);
        metallicTexture.uScale = 7;
        metallicTexture.vScale = 7;
        pbr.metallicTexture = metallicTexture;
        pbr.useAmbientOcclusionFromMetallicTextureRed = true;
        pbr.useRoughnessFromMetallicTextureGreen = true;
        pbr.useMetallnessFromMetallicTextureBlue = true;
        
        pbr.roughness = 0.5;

        return pbr;
    }
}