import {
    Scene, 
    Engine, 
    FreeCamera, 
    Vector3, 
    HemisphericLight, 
    MeshBuilder,
    CubeTexture,
    PBRMaterial,
    Texture,
    SceneLoader,
    AbstractMesh,
    GlowLayer,
    LightGizmo,
    GizmoManager,
    Light,
    Color3,
    DirectionalLight,
    PointLight,
    SpotLight,
    ShadowGenerator
} from "@babylonjs/core";
import "@babylonjs/loaders";

export class TwilightSaga{

    scene: Scene;
    engine: Engine;
    lightTubes!: AbstractMesh[];
    models!: AbstractMesh[];
    ball!: AbstractMesh;

    constructor(private canvas:HTMLCanvasElement){
        //adding scene at 0,0,0
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();

        this.CreateGround();
        // this.CreateRock();
        this.CreateLevelDesign();
        this.CreateEnvironmentalLight();

        this.engine.runRenderLoop(()=>{
            this.scene.render();
        })
    }

    CreateScene():Scene{
        // adding camera
        const scene = new Scene(this.engine);
        const camera = new FreeCamera("camera", new Vector3(0,1,-5), this.scene); //set the camera position
        camera.attachControl();
        camera.speed = 0.2;

        // //adding light
        // const hemiLight = new HemisphericLight(
        //     "hemiLight", 
        //     new Vector3(0,1,0), 
        //     this.scene
        // );

        // //set intensity of light
        // hemiLight.intensity = 0;

        //set the sky
        const envTex = CubeTexture.CreateFromPrefilteredData("./environment/sky.env", scene);
        scene.environmentTexture = envTex;
        // scene.createDefaultEnvironment; //can use this too if u dont have environment texture
        scene.createDefaultSkybox(envTex, true);

        //environment intensity
        scene.environmentIntensity = 0.2;
        
        return scene;
    }

    CreateGround():void {
        //create the ground mesh
        const ground = MeshBuilder.CreateGround("ground", 
            { width:40, height:40 },
            this.scene
        );

        //creating traditional ball mesh
        // const ball = MeshBuilder.CreateSphere("ball", {diameter: 1}, this.scene);
        // ball.position = new Vector3(0,0.5,5); //set the ball position
        // // ball.position.x = 1 // if want to adjust the x y z of ball
        
        ground.material = this.CreateGrass();
    }

    CreateGrass(): PBRMaterial{
        const pbr = new PBRMaterial("pbr", this.scene);
        // pbr.environmentIntensity = 0.1;

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

    async CreateRock(): Promise<void> {
        //for one obj
        const {meshes} = await SceneLoader.ImportMeshAsync(
            "",
            "./models/", 
            "rock_lod2.glb"
        );

        console.log("meshes", meshes);

    }

    async CreateLevelDesign(): Promise<void> {
        //multiple obj
        const models = await SceneLoader.ImportMeshAsync(
            "",
            "./models/", 
            "envi3.glb"
        );

        //moving individual object of the model object
        models.meshes[1].position = new Vector3(0,-5,0);

        const glowLayer = new GlowLayer("glowLayer", this.scene);
        glowLayer.intensity = 0.75;

        console.log("models", models);


    }
    
    async CreateEnvironmentalLight(): Promise<void> {
        // const { meshes } = await SceneLoader.ImportMeshAsync(
        // "",
        // "./models/",
        // "LightingScene.glb"
        // );

        // this.models = meshes;

        // this.lightTubes = meshes.filter(
        // (mesh) =>
        //     mesh.name === "lightTube_left" || mesh.name === "lightTube_right"
        // );

        // this.ball = MeshBuilder.CreateSphere("ball", { diameter: 0.5 }, this.scene);

        // this.ball.position = new Vector3(0, 1, -1);

        const glowLayer = new GlowLayer("glowLayer", this.scene);
        glowLayer.intensity = 0.75;

        this.CreateLights();
    }

    CreateLights(): void {
    const hemiLight = new HemisphericLight(
      "hemiLight",
      new Vector3(1, 1, 0),
      this.scene
    );

    hemiLight.diffuse = new Color3(0.2, 0, 0);
    hemiLight.groundColor = new Color3(0, 0, 0.1);
    hemiLight.specular = new Color3(0, 0.1, 0);
    // hemiLight.intensity = 1;

    const directionalLight = new DirectionalLight(
      "directionalLight",
      new Vector3(0, -1, 0),
      this.scene
    );
    }

//         const pointLight = new PointLight(
//         "pointLight",
//         new Vector3(0, 1, 0),
//         this.scene
//         );

//         pointLight.diffuse = new Color3(172 / 255, 246 / 255, 250 / 255);
//         pointLight.intensity = 0.25;

//         const pointClone = pointLight.clone("pointClone") as PointLight;

//         pointLight.parent = this.lightTubes[0];
//         pointClone.parent = this.lightTubes[1];

//         const spotLight = new SpotLight(
//         "spotLight",
//         new Vector3(0, 0.5, -3),
//         new Vector3(0, 1, 3),
//         Math.PI / 2,
//         10,
//         this.scene
//         );

//         spotLight.intensity = 100;

//         spotLight.shadowEnabled = true;
//         spotLight.shadowMinZ = 1;
//         spotLight.shadowMaxZ = 10;

//         const shadowGen = new ShadowGenerator(2048, spotLight);
//         shadowGen.useBlurCloseExponentialShadowMap = true;

//         this.ball.receiveShadows = true;
//         shadowGen.addShadowCaster(this.ball);

//         this.models.map((mesh) => {
//         mesh.receiveShadows = true;
//         shadowGen.addShadowCaster(mesh);
//         });

//         this.CreateGizmos(spotLight);
//     }

//    CreateGizmos(customLight: Light): void {
//         const lightGizmo = new LightGizmo();
//         lightGizmo.scaleRatio = 2;
//         lightGizmo.light = customLight;

//         const gizmoManager = new GizmoManager(this.scene);
//         gizmoManager.positionGizmoEnabled = true;
//         gizmoManager.rotationGizmoEnabled = true;
//         gizmoManager.usePointerToAttachGizmos = false;
//         gizmoManager.attachToMesh(lightGizmo.attachedMesh);
//     }

    //use this if the modell is not placed in the root
    // CreateRock(): void {
    // SceneLoader.Append("./models/", "rock.glb", this.scene, () => {
    //     console.log("GLB file appended successfully");

    //     //  can print all meshes in the scene to double check
    //     this.scene.meshes.forEach(mesh => {
    //         console.log("Mesh name:", mesh.name);
    //     });
    // });
    // }
}