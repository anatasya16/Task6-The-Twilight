import {
    Scene,
    Engine,
    FreeCamera,
    Vector3,
    CubeTexture,
    SceneLoader,
    AbstractMesh,
    GlowLayer,
    Color3,
    DirectionalLight,
    PointLight,
    SpotLight,
    ShadowGenerator,
    MeshBuilder,
    PBRMaterial,
    Texture,
    HemisphericLight,
    Mesh,
    AnimationGroup
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { CustomLoadingScreen } from "./CustomLoadingScreen";

export class CustomLoading {
    public scene!: Scene; // Now public
    public engine!: Engine; // Now public

    loadingScreen: CustomLoadingScreen;

    lightTubes: AbstractMesh[] = [];
    models: AbstractMesh[] = [];
    bookMesh!: Mesh; // To store the loaded book mesh (book.glb)
    book2Mesh!: Mesh; // New: To store the loaded book2 mesh (book2.glb)

    // Character 1: Vampire
    vampireMeshes: AbstractMesh[] = [];
    vampireAnimationGroups: AnimationGroup[] = [];
    private isPlayerNearVampire = false;
    private vampireInteractionDistance = 2.0;
    private vampireSpeech = `<p>Hey kid, I heard that there are many nocturnal creatures around here. Please be careful! Don't be like Bella Swan. Guess what she did to the 'Cullen' family?</p>`;

    // Character 2: Werewolf
    werewolfMeshes: AbstractMesh[] = [];
    werewolfAnimationGroups: AnimationGroup[] = [];
    private isPlayerNearWerewolf = false;
    private werewolfInteractionDistance = 2.0; // Same as vampire for now, adjust as needed
    private werewolfSpeech = `<p>Raawwwrrr! What can I help you? But hey don't be scared, we Uley Pack rarely bite. Right, <i>Jacob?</i></p>`;
    
    // UI elements for book interaction (shared for both books)
    private interactionTextElement: HTMLElement; // For "Click E to read!" prompt
    private overlayElement: HTMLElement;         // For book story overlay
    private storyContentElement: HTMLElement;    // For book story content
    private prevPageBtn: HTMLButtonElement;      // For book navigation
    private nextPageBtn: HTMLButtonElement;      // For book navigation

    // UI elements for character interaction (shared for both vampire and werewolf)
    private characterInteractionTextElement: HTMLElement; // For generic "Click I to interact!" prompt
    private characterOverlayElement: HTMLElement;         // For character speech overlay
    private characterSpeechContentElement: HTMLElement;   // For character speech content

    private isPlayerNearBook = false;
    private isPlayerNearBook2 = false; // New: tracks if player is near book2
    private isOverlayActive = false; // Tracks if EITHER book or character overlay is active

    // Defined interaction distances
    private bookInteractionDistance = 16.5;
    private book2InteractionDistance = 5; // Same distance as first book
    private cameraDefaultSpeed = 0.1;

    // Story management properties (for the first book - book.glb)
    private storyChapters_book1: string[] = [
        `<h3>Twilight by Stephenie Meyer</h3>
        <p>When seventeen-year-old Isabella Swan chooses to leave behind her life in sunny Phoenix, she expects little more than grey skies and quiet solitude in the small town of Forks, Washington. She moves in with her father, Charlie Swan, a local police chief, resigned to the idea of a mundane, uneventful existence in her new home. But Forks holds secrets. Dark, dense forests shroud the town in mystery, and the constant cloud cover seems to whisper of something hidden beneath the surface.</p>
        <p> At Forks High School, Bella finds herself surrounded by unfamiliar faces, navigating the awkward terrain of being the new girl. Among her classmates, one group stands apart: the Cullens. Impossibly beautiful, pale, and distant, the Cullen family appears untouched by the ordinary world around them. Edward Cullen, in particular, intrigues Bella in ways she can’t explain, both drawn to and confounded by him. Edward is unlike anyone she has ever met. He’s intelligent, graceful, and eerily perceptive, but his behavior is confusing and, at times, contradictory.</p>
        <p>One moment, he’s cold and distant; the next, he’s saving her from danger with impossible strength and speed. As Bella becomes more entwined with Edward’s world, she senses that he is hiding something, something bigger than she can imagine. Her curiosity grows, and with it, so does her connection to him, despite the warnings in his eyes and the unspoken tension that surrounds him. Forks begins to feel less ordinary, and Bella starts to unravel truths that challenge everything she thought she knew about the world. </p>
        <p>Her once-predictable life turns into something far more dangerous and far more exhilarating than she could have imagined. Amidst the towering pines and overcast skies, a romance begins to bloom. But it’s a romance unlike any other, defined by secrets, restraint, and a pull that neither of them can deny.</p>`,
        `<h3>New Moon by Stephenie Meyer</h3>
        <p>Time passes in Forks, but the air still carries the same chill, the same veiled tension that settled when Bella Swan first stepped into this quiet, rain-drenched town. As her eighteenth birthday approaches, Bella is more aware than ever of time slipping through her fingers, time that feels like it's racing ahead, especially when measured against the eternal stillness of someone she loves. The Cullen family, still shrouded in mystery and grace, has become a central part of Bella’s world.</p>
        <p>Their presence is at once comforting and precarious, like walking a tightrope between dreams and danger. Edward Cullen remains both her anchor and her most complex uncertainty. But just as Bella begins to believe she might have found a place where she belongs, an unexpected event shatters the delicate balance between their worlds. A single moment threatens to unravel everything, forcing decisions that cut deep and leave invisible wounds.</p>
        <p>With her life upended, Bella is thrust into an emotional void, struggling to navigate a world suddenly devoid of the light that once guided her. Her days blur together, each one a mirror of the last, steeped in silence and shadow. The pull of memory, once beautiful, becomes a haunting echo. But healing has strange ways of finding us. In the quiet company of Jacob Black, a childhood friend from the nearby Quileute reservation, Bella finds warmth again. His easy smile and steady presence begin to mend what was broken, though he, too, harbors secrets waiting to rise with the moon.</p>
        <p>As their friendship deepens, Bella discovers that danger has not faded, it has only changed shape. The supernatural world that once seemed centered around one truth begins to reveal its many layers, each more mysterious than the last. Forks is no longer just the home of vampires, it’s something more ancient, more deeply rooted. Old legends begin to breathe life into modern days. Bella finds herself at a crossroads between loyalty and destiny, between what she’s lost and what she might become. The line between friend and foe begins to blur, and choices must be made with the weight of entire lives resting on them.</p>`,
        `<h3>Eclipse by Stephenie Meyer</h3>
        <p>Tension blankets Forks like its ever-present mist. Bella Swan finds herself caught in the middle of forces greater than herself, deeper than the sea, and older than the legends whispered around campfires. With high school nearing its end and decisions looming, Bella stands at the edge of more than just adulthood, she stands at the brink of transformation. Her love for Edward Cullen is unwavering, a flame that has endured storms and silence. But love, as Bella learns, is rarely simple.</p>
        <p> It comes with consequences, with expectations, and with the sharp realization that choosing one path often means giving up another. The stakes have never been higher, not just for her heart, but for her very soul. The peace between vampire and werewolf is fragile, an uneasy truce built on shared interests, not trust. Jacob Black remains a steadfast figure in Bella’s life, one whose warmth and honesty challenge her convictions and force her to re-examine what love truly means. His world, wild and ancient, pulls at her in ways she never anticipated.</p>
        <p> Meanwhile, shadows stir in the distance. A series of mysterious killings plague the nearby city of Seattle, hinting at something far more sinister than random violence. The Cullen family begins to suspect a darker plan unfolding, one that may have everything to do with Bella and her future. The hunter is becoming the hunted once more. With danger circling closer, Bella must navigate a tangle of choices: the man she loves, the friend she cannot abandon, and the destiny that waits silently beneath it all. Her heart is torn between fire and ice, between the eternal calm of one and the untamed heat of the other.</p>
        <p> The alliances that form in Eclipse are as unlikely as they are vital. In order to survive, old enemies must lay down arms, if only for a moment. Trust becomes a gamble, and loyalty is tested in ways no one expects. Every decision Bella makes will ripple across not just her life, but the lives of everyone she holds dear. As battles brew and hearts waver, Bella wrestles with her identity. Is she ready to give up everything human about herself? What does it truly mean to belong, to a world, to a person, to a future?</p>
        <p> In the twilight between peace and war, Bella stands as a bridge, and a battleground, for two worlds that were never meant to coexist.</p>`
    ];

    // Story management properties (for the second book - book2.glb)
    private storyChapters_book2: string[] = [
        `<h3>Breaking Dawn 1 by Stephenie Meyer</h3>
        <p>The sun sets on Bella Swan’s final days as a human girl caught between two worlds, one of fire and blood, the other of ice and eternity. Her love for Edward Cullen has burned brighter than any mortal bond should allow, and now, at the edge of a great and irreversible choice, Bella steps into a life-altering decision that will seal her fate forever.</p>
        <p> A long-anticipated union marks the beginning of Bella’s transformation, not just of her future, but of her very existence. In a ceremony that blends elegance with emotion, Bella and Edward promise themselves to each other, transcending the doubts and fears that once haunted them. But their blissful beginning soon gives way to uncertainty when the consequences of their love reveal themselves in unexpected, mysterious ways.</p>
        <p>As they retreat into a secluded paradise, far from the skeptical eyes of Forks, the sanctuary of their honeymoon is quickly overshadowed by a strange and impossible development, one that neither vampire lore nor human science can explain. Bella’s body begins to betray her, changing faster than anyone could prepare for, and the life growing within her challenges everything they thought they understood.</p>
        <p>Tensions rise within the Cullen family, testing even the strongest bonds. Some see Bella’s choice as reckless, others as brave. Meanwhile, Jacob Black, now more than ever, finds himself divided between loyalty, fury, and a growing understanding that his path may not be what he once believed.</p>`,
        `<h3>Breaking Dawn 1 by Stephenie Meyer</h3>
        <p>Outside the Cullen house, old rivalries stir. The wolves grow restless, divided by duty and compassion. Secrets surface within their ranks, and choices must be made that will echo for generations to come. Bella, caught in the middle of it all, faces pain and transformation beyond comprehension. Yet through it all, Bella holds fast to her love, unshaken, unwavering, even as her heart and body fracture under the weight of change. The fragile line between life and death, love and sacrifice, becomes nearly invisible. And just when everything seems to settle, a newborn silence descends, the kind that only comes before a storm.</p>
        <p>In her darkest hour, Bella is reborn, not merely changed, but awakened. The world she once viewed through human eyes now glows with immortal clarity. But with this new sight comes a new danger, one far greater than anything they’ve faced before.</p>
        <p>As whispers reach the powerful Volturi in Italy, the ancient rulers of the vampire world, Bella and Edward’s family find themselves standing on a precipice once again, this time not just as lovers, but as protectors. The choices they made in Breaking Dawn Part 1 will summon a reckoning no one can ignore.</p>
        <p>And so, Breaking Dawn Part 2 awaits, where allegiances will be tested, truths will be revealed, and the strength of love will determine the fate of more than just one family.</p>`
    ];

    private currentChapterIndex_book1 = 0; // Current chapter index for book.glb
    private currentChapterIndex_book2 = 0; // New: Current chapter index for book2.glb

    private activeStoryChapters: string[] = []; // Reference to the currently displayed story array
    private activeChapterIndex = 0;    // Index for the currently displayed story
    private currentActiveBook: 'book1' | 'book2' | null = null; // To track which book's story is currently open

    constructor(
        private canvas: HTMLCanvasElement,
        private setLoaded: () => void,
        private loadingBar: HTMLElement,
        private percentLoaded: HTMLElement,
        private loader: HTMLElement,
        // UI elements for book interaction
        interactionTextElement: HTMLElement,
        overlayElement: HTMLElement,
        storyContentElement: HTMLElement,
        prevPageBtn: HTMLButtonElement,
        nextPageBtn: HTMLButtonElement,
        // UI elements for character interaction
        characterInteractionTextElement: HTMLElement,
        characterOverlayElement: HTMLElement,
        characterSpeechContentElement: HTMLElement
    ) {
        // CustomLoading is responsible for its own engine and scene
        this.engine = new Engine(this.canvas, true);
        this.scene = this.CreateScene();
        this.cameraDefaultSpeed = (this.scene.activeCamera as FreeCamera).speed;

        this.loadingScreen = new CustomLoadingScreen(
            this.loadingBar,
            this.percentLoaded,
            this.loader
        );

        this.engine.loadingScreen = this.loadingScreen;
        this.engine.displayLoadingUI();
        
        // Assign passed UI elements to class properties
        this.interactionTextElement = interactionTextElement;
        this.overlayElement = overlayElement;
        this.storyContentElement = storyContentElement;
        this.prevPageBtn = prevPageBtn;
        this.nextPageBtn = nextPageBtn;
        this.characterInteractionTextElement = characterInteractionTextElement;
        this.characterOverlayElement = characterOverlayElement;
        this.characterSpeechContentElement = characterSpeechContentElement;

        // Setup UI elements (their initial display state) and key event listeners
        this.setupGameUI();
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        // Attach click listeners for navigation buttons (book)
        this.prevPageBtn.addEventListener('click', () => this.prevPage());
        this.nextPageBtn.addEventListener('click', () => this.nextPage());

        this.CreateEnvironment().finally(() => {
            this.engine.hideLoadingUI();
            this.setLoaded();
            this.setupGameLogic();
        }).catch(error => {
            console.error("Error during scene creation/loading:", error);
            this.engine.hideLoadingUI();
            this.setLoaded();
        });

        // Render loop and resize listener are managed by BabylonExamples.vue now.
        // The CustomLoading instance will *not* start its own render loop or resize listener.
    }

    /**
     * Creates the main Babylon.js scene and camera.
     * @returns {Scene} The created scene.
     */
    CreateScene(): Scene {
        const scene = new Scene(this.engine);
        const camera = new FreeCamera("camera", new Vector3(0, 1, -5), scene);
        camera.attachControl(this.canvas, true);
        camera.speed = 0.1;

        const envTex = CubeTexture.CreateFromPrefilteredData("./environment/sky.env", scene);
        scene.environmentTexture = envTex;
        scene.createDefaultSkybox(envTex, true);
        scene.environmentIntensity = 0.2;

        return scene;
    }

    /**
     * Creates a PBR material for the ground.
     * @returns {PBRMaterial} The created PBR material.
     */
    CreateGrass(): PBRMaterial {
        const pbr = new PBRMaterial("pbr", this.scene);
        const albedoTexture = new Texture("./textures/grass/coast_sand_rocks_02_diff_1k.jpg", this.scene);
        albedoTexture.uScale = 7;
        albedoTexture.vScale = 7;
        pbr.albedoTexture = albedoTexture;
        const bumpTexture = new Texture("./textures/grass/coast_sand_rocks_02_nor_gl_1k.jpg", this.scene);
        bumpTexture.uScale = 7;
        bumpTexture.vScale = 7;
        pbr.bumpTexture = bumpTexture;
        pbr.invertNormalMapX = true;
        pbr.invertNormalMapY = true;
        pbr.useAmbientOcclusionFromMetallicTextureRed = true;
        pbr.useRoughnessFromMetallicTextureGreen = true;
        pbr.useMetallnessFromMetallicTextureBlue = true;
        pbr.roughness = 0.5;
        return pbr;
    }

    /**
     * Creates the ground mesh and applies the grass material.
     * @returns {void}
     */
    CreateGround(): void {
        const ground = MeshBuilder.CreateGround("ground",
            { width: 40, height: 40 },
            this.scene
        );
        ground.material = this.CreateGrass();
    }

    /**
     * Loads the rock_lod2.glb model into the scene.
     * @returns {Promise<void>}
     */
    async CreateRock(): Promise<void> {
        try {
            const { meshes } = await SceneLoader.ImportMeshAsync(
                "",
                "./models/",
                "rock_lod2.glb",
                this.scene
            );
            console.log("Loaded rock_lod2.glb meshes:", meshes);
            if (meshes.length > 0 && meshes[0] instanceof Mesh) {
                meshes[0].position = new Vector3(0, 0, 0.5);
                meshes[0].scaling = new Vector3(0.5, 0.5, 0.5);
            }
        } catch (error) {
            console.error("Error loading rock_lod2.glb:", error);
            throw error;
        }
    }

    /**
     * Loads the envi4.glb model (level design) into the scene.
     * @returns {Promise<void>}
     */
    async CreateLevelDesign(): Promise<void> {
        try {
            const result = await SceneLoader.ImportMeshAsync(
                "",
                "./models/",
                "envi4.glb",
                this.scene
            );
            this.models = result.meshes;
            console.log("Loaded envi4.glb models:", this.models);

            if (this.models.length > 1 && this.models[1] instanceof Mesh) {
                this.models[1].position = new Vector3(0, -5, 0);
            }
        } catch (error) {
            console.error("Error loading envi4.glb:", error);
            throw error;
        }
    }

    /**
     * Loads the book.glb model into the scene for gamification.
     * @returns {Promise<void>}
     */
    async CreateBook(): Promise<void> {
        try {
            const result = await SceneLoader.ImportMeshAsync(
                "",
                "./models/",
                "book.glb",
                this.scene
            );
            this.bookMesh = result.meshes[0] as Mesh;
            this.bookMesh.position = new Vector3(5, -11, 16);
            this.bookMesh.scaling = new Vector3(0.2, 0.2, 0.2);
            this.bookMesh.rotation = new Vector3(5.5, 0.2, 0.0);
            console.log("Loaded book.glb:", this.bookMesh.name);
        } catch (error) {
            console.error("Error loading book.glb:", error);
            throw error;
        }
    }

    /**
     * New: Loads the book2.glb model into the scene.
     * @returns {Promise<void>}
     */
    async CreateBook2(): Promise<void> {
        try {
            const result = await SceneLoader.ImportMeshAsync(
                "",
                "./models/",
                "book2.glb", // Assuming this is the correct filename
                this.scene
            );
            this.book2Mesh = result.meshes[0] as Mesh;
            // Set a distinct position, scaling, and rotation for book2
            this.book2Mesh.position = new Vector3(-9, 1, 7); // Example new position
            this.book2Mesh.scaling = new Vector3(0.2, 0.2, 0.2); // Same scaling as book.glb
            this.book2Mesh.rotation = new Vector3(5,8.9,3); // Slightly different rotation
            console.log("Loaded book2.glb:", this.book2Mesh.name);
        } catch (error) {
            console.error("Error loading book2.glb:", error);
            throw error;
        }
    }

    /**
     * Loads the vampire character model with its animations.
     * @returns {Promise<void>}
     */
    async CreateVampire(): Promise<void> {
        try {
            const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(
                "",
                "./models/",
                "vampire1.glb",
                this.scene
            );

            this.vampireMeshes = meshes;
            this.vampireAnimationGroups = animationGroups;

            if (meshes.length > 0) {
                meshes[0].rotation = new Vector3(0,4.5,0);
                meshes[0].position = new Vector3(5, 0, 4);
                meshes[0].scaling = new Vector3(0.5, 0.5, 0.5);
            }

            if (animationGroups.length > 0) {
                console.log("Vampire animation groups:", animationGroups);
                animationGroups[0].play(true);
            } else {
                console.warn("No animation groups found for vampire.");
            }
            console.log("Vampire model loaded successfully!");

        } catch (error) {
            console.error("Error loading vampire model:", error);
            throw error;
        }
    }

    /**
     * Loads the werewolf character model with its animations.
     * @returns {Promise<void>}
     */
    async CreateWerewolf(): Promise<void> {
        try {
            const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(
                "",
                "./models/",
                "werewolf.glb", // Assuming this is the correct filename
                this.scene
            );

            this.werewolfMeshes = meshes;
            this.werewolfAnimationGroups = animationGroups;

            if (meshes.length > 0) {
                // Position the werewolf differently from the vampire
                meshes[0].rotation = new Vector3(0, 2.0, 0); // Example rotation
                meshes[0].position = new Vector3(-7, 0, -5); // Example position
                meshes[0].scaling = new Vector3(0.008, 0.008, 0.008); // Adjust scaling as needed
            }

            if (animationGroups.length > 0) {
                console.log("Werewolf animation groups:", animationGroups);
                // Play a default animation if available
                if (animationGroups[0]) {
                    animationGroups[0].play(true);
                }
            } else {
                console.warn("No animation groups found for werewolf.");
            }
            console.log("Werewolf model loaded successfully!");

        } catch (error) {
            console.error("Error loading werewolf model:", error);
            throw error;
        }
    }

    /**
     * Orchestrates the creation of the environment, including ground, models, and lights.
     */
    public async CreateEnvironment(): Promise<void> {
        this.CreateGround();
        this.loadingScreen.updateLoadStatus(10);

        await this.CreateRock();
        this.loadingScreen.updateLoadStatus(20); // Adjusted progress

        await this.CreateLevelDesign();
        this.loadingScreen.updateLoadStatus(35); // Adjusted progress

        await this.CreateBook();
        this.loadingScreen.updateLoadStatus(50); // Adjusted progress

        await this.CreateBook2(); // New: Load the second book
        this.loadingScreen.updateLoadStatus(65); // Adjusted progress

        await this.CreateVampire(); // Load the vampire
        this.loadingScreen.updateLoadStatus(80); // Adjusted progress

        await this.CreateWerewolf(); // Load the werewolf
        this.loadingScreen.updateLoadStatus(90); // Adjusted progress

        this.CreateEnvironmentalLight();
        this.loadingScreen.updateLoadStatus(95);

        this.loadingScreen.updateLoadStatus(100);
        console.log("All environment and models loaded.");
    }

    async CreateEnvironmentalLight(): Promise<void> {
        const glowLayer = new GlowLayer("glowLayer", this.scene);
        glowLayer.intensity = 0.75;

        this.CreateLights();
    }

    /**
     * Creates and configures various lights in the scene.
     * @returns {void}
     */
    CreateLights(): void {
        const hemiLight = new HemisphericLight(
            "hemiLight_CustomLoading",
            new Vector3(1, 1, 0),
            this.scene
        );
        hemiLight.diffuse = new Color3(0.2, 0, 0);
        hemiLight.groundColor = new Color3(0, 0, 0.1);
        hemiLight.specular = new Color3(0, 0.1, 0);

        const directionalLight = new DirectionalLight(
            "directionalLight",
            new Vector3(0, -1, 0),
            this.scene
        );
        // Removed: 'directionalLight' is assigned a value but never used

        const pointLight = new PointLight(
            "pointLight",
            new Vector3(0, 1, -1),
            this.scene
        );
        pointLight.diffuse = new Color3(172 / 255, 246 / 255, 250 / 255);
        pointLight.intensity = 0.25;

        const pointClone = pointLight.clone("pointClone") as PointLight;
        pointClone.position = new Vector3(0, 1, 1);

        const spotLight = new SpotLight(
            "spotLight",
            new Vector3(0, 0.5, -3),
            new Vector3(0, 1, 3),
            Math.PI / 2,
            10,
            this.scene
        );
        spotLight.intensity = 100;
        spotLight.shadowEnabled = true;
        spotLight.shadowMinZ = 1;
        spotLight.shadowMaxZ = 10;

        const shadowGen = new ShadowGenerator(2048, spotLight);
        shadowGen.useBlurCloseExponentialShadowMap = true;

        if (this.models && this.models.length > 0) {
            this.models.forEach((mesh) => {
                if (mesh instanceof Mesh) {
                    mesh.receiveShadows = true;
                    shadowGen.addShadowCaster(mesh);
                }
            });
        }
        // Add shadow casters for vampire meshes
        if (this.vampireMeshes && this.vampireMeshes.length > 0) {
            this.vampireMeshes.forEach((mesh) => {
                if (mesh instanceof Mesh) {
                    mesh.receiveShadows = true;
                    shadowGen.addShadowCaster(mesh);
                }
            });
        }
        // Add shadow casters for werewolf meshes
        if (this.werewolfMeshes && this.werewolfMeshes.length > 0) {
            this.werewolfMeshes.forEach((mesh) => {
                if (mesh instanceof Mesh) {
                    mesh.receiveShadows = true;
                    shadowGen.addShadowCaster(mesh);
                }
            });
        }
        // New: Add shadow casters for book2 mesh
        if (this.book2Mesh) {
            if (this.book2Mesh instanceof Mesh) {
                this.book2Mesh.receiveShadows = true;
                shadowGen.addShadowCaster(this.book2Mesh);
            }
        }
    }

    /**
     * Sets up the HTML UI elements for interaction and story overlay.
     */
    private setupGameUI(): void {
        this.interactionTextElement.style.display = 'none';
        this.overlayElement.style.visibility = 'hidden';
        this.overlayElement.style.opacity = '0';
        this.prevPageBtn.style.display = 'none';
        this.nextPageBtn.style.display = 'none';
        
        // Hide character interaction and overlay elements initially
        this.characterInteractionTextElement.style.display = 'none';
        this.characterOverlayElement.style.visibility = 'hidden';
        this.characterOverlayElement.style.opacity = '0';
        
        // Initial setup for the active story (default to book 1)
        this.activeStoryChapters = this.storyChapters_book1;
        this.activeChapterIndex = this.currentChapterIndex_book1;
        this.updateStoryContent();
    }

    /**
     * Updates the story content in the overlay based on currently active story and index.
     * Enables/disables navigation buttons.
     */
    private updateStoryContent(): void {
        if (this.activeStoryChapters.length === 0) {
            this.storyContentElement.innerHTML = "<p>No story content available.</p>";
            this.prevPageBtn.disabled = true;
            this.nextPageBtn.disabled = true;
            return;
        }

        this.storyContentElement.innerHTML = this.activeStoryChapters[this.activeChapterIndex];
        
        this.prevPageBtn.disabled = this.activeChapterIndex === 0;
        this.nextPageBtn.disabled = this.activeChapterIndex === this.activeStoryChapters.length - 1;
    }

    /**
     * Moves to the next chapter/page of the active story.
     */
    private nextPage(): void {
        if (this.activeChapterIndex < this.activeStoryChapters.length - 1) {
            this.activeChapterIndex++;
            this.updateStoryContent();
        }
    }

    /**
     * Moves to the previous chapter/page of the active story.
     */
    private prevPage(): void {
        if (this.activeChapterIndex > 0) {
            this.activeChapterIndex--;
            this.updateStoryContent();
        }
    }


    /**
     * Sets up the game logic loop for player-book and player-character interaction.
     */
    private setupGameLogic(): void {
        this.scene.onBeforeRenderObservable.add(() => {
            if (!this.bookMesh || !this.book2Mesh || !this.scene.activeCamera || this.vampireMeshes.length === 0 || this.werewolfMeshes.length === 0) {
                return;
            }

            const cameraPosition = this.scene.activeCamera.position;

            // --- Book Interaction Logic ---
            const distanceToBook1 = Vector3.Distance(cameraPosition, this.bookMesh.position);
            const distanceToBook2 = Vector3.Distance(cameraPosition, this.book2Mesh.position); // New: distance to book2

            this.isPlayerNearBook = distanceToBook1 < this.bookInteractionDistance;
            this.isPlayerNearBook2 = distanceToBook2 < this.book2InteractionDistance; // New: check proximity for book2

            // Only show book interaction text if no overlay is active
            if (!this.isOverlayActive) {
                if (this.isPlayerNearBook && this.isPlayerNearBook2) {
                    // Both books are near, show prompt for the closer one
                    if (distanceToBook1 < distanceToBook2) {
                        this.interactionTextElement.style.display = 'block';
                        this.interactionTextElement.textContent = "Click E to read the first book!";
                    } else {
                        this.interactionTextElement.style.display = 'block';
                        this.interactionTextElement.textContent = "Click E to read the second book!";
                    }
                } else if (this.isPlayerNearBook) {
                    this.interactionTextElement.style.display = 'block';
                    this.interactionTextElement.textContent = "Click E to read the chapter!";
                } else if (this.isPlayerNearBook2) { // New: if only book2 is near
                    this.interactionTextElement.style.display = 'block';
                    this.interactionTextElement.textContent = "Click E to read the chapter!";
                }
                else {
                    this.interactionTextElement.style.display = 'none';
                }
            } else {
                // If any overlay is active, hide the interaction text
                this.interactionTextElement.style.display = 'none';
            }


            // --- Character Interaction Logic (Vampire and Werewolf) ---
            const vampireRootMesh = this.vampireMeshes[0];
            const werewolfRootMesh = this.werewolfMeshes[0];

            const distanceToVampire = Vector3.Distance(cameraPosition, vampireRootMesh.position);
            const distanceToWerewolf = Vector3.Distance(cameraPosition, werewolfRootMesh.position);

            this.isPlayerNearVampire = distanceToVampire < this.vampireInteractionDistance;
            this.isPlayerNearWerewolf = distanceToWerewolf < this.werewolfInteractionDistance;

            // Determine which character is currently interactable and display the prompt
            if (!this.isOverlayActive) {
                if (this.isPlayerNearVampire && this.isPlayerNearWerewolf) {
                    // Both are near, show prompt for the closer one
                    if (distanceToVampire < distanceToWerewolf) {
                        this.characterInteractionTextElement.style.display = 'block';
                        this.characterInteractionTextElement.textContent = "Click I to interact with Vampire!";
                    } else {
                        this.characterInteractionTextElement.style.display = 'block';
                        this.characterInteractionTextElement.textContent = "Click I to interact with Werewolf!";
                    }
                } else if (this.isPlayerNearVampire) {
                    this.characterInteractionTextElement.style.display = 'block';
                    this.characterInteractionTextElement.textContent = "Click I to interact with Vampire!";
                } else if (this.isPlayerNearWerewolf) {
                    this.characterInteractionTextElement.style.display = 'block';
                    this.characterInteractionTextElement.textContent = "Click I to interact with Werewolf!";
                } else {
                    this.characterInteractionTextElement.style.display = 'none';
                }
            } else {
                // Hide character interaction text if any overlay is active
                this.characterInteractionTextElement.style.display = 'none';
            }
        });
    }

    /**
     * Handles global key press events for game interactions.
     * @param {KeyboardEvent} event The keyboard event.
     */
    private handleKeyPress(event: KeyboardEvent): void {
        // Handle closing any active overlay first
        if (event.key === 'Escape') {
            if (this.isOverlayActive) {
                this.hideStoryOverlay(); // Hides book overlay if active
                this.hideCharacterOverlay(); // Hides character overlay if active
                event.preventDefault();
            }
            return; // Prevent further processing if escape is pressed
        }

        // Book interaction (for either book1 or book2)
        if (!this.isOverlayActive) {
            if (event.key === 'e' || event.key === 'E') {
                if (this.isPlayerNearBook) {
                    this.showStoryOverlay('book1');
                    event.preventDefault();
                } else if (this.isPlayerNearBook2) { // New: interact with book2
                    this.showStoryOverlay('book2');
                    event.preventDefault();
                }
            }
        }

        // Character interaction
        if (!this.isOverlayActive && (this.isPlayerNearVampire || this.isPlayerNearWerewolf)) {
            if (event.key === 'i' || event.key === 'I') {
                // Determine which character to interact with based on proximity
                const cameraPosition = this.scene.activeCamera!.position;
                const distanceToVampire = this.vampireMeshes.length > 0 ? Vector3.Distance(cameraPosition, this.vampireMeshes[0].position) : Infinity;
                const distanceToWerewolf = this.werewolfMeshes.length > 0 ? Vector3.Distance(cameraPosition, this.werewolfMeshes[0].position) : Infinity;

                if (this.isPlayerNearVampire && this.isPlayerNearWerewolf) {
                    // Both are near, interact with the closer one
                    if (distanceToVampire < distanceToWerewolf) {
                        this.showCharacterOverlay(this.vampireSpeech);
                    } else {
                        this.showCharacterOverlay(this.werewolfSpeech);
                    }
                } else if (this.isPlayerNearVampire) {
                    this.showCharacterOverlay(this.vampireSpeech);
                } else if (this.isPlayerNearWerewolf) {
                    this.showCharacterOverlay(this.werewolfSpeech);
                }
                event.preventDefault();
            }
        }
        
        // Allow left/right arrow keys for book navigation ONLY IF book overlay is active
        // These now operate on the `activeStoryChapters` and `activeChapterIndex`
        if (this.isOverlayActive && this.overlayElement.style.visibility === 'visible') {
            if (event.key === 'ArrowLeft') {
                this.prevPage();
                event.preventDefault();
            } else if (event.key === 'ArrowRight') {
                this.nextPage();
                event.preventDefault();
            }
        }
    }

    /**
     * Displays the story overlay (for the book) and disables camera controls.
     * @param bookId Specifies which book's story to load ('book1' or 'book2').
     */
    private showStoryOverlay(bookId: 'book1' | 'book2'): void {
        if (!this.overlayElement || !this.scene.activeCamera) return;

        this.isOverlayActive = true;
        this.currentActiveBook = bookId; // Set the currently active book

        // Load the appropriate story chapters and index based on bookId
        if (bookId === 'book1') {
            this.activeStoryChapters = this.storyChapters_book1;
            this.activeChapterIndex = this.currentChapterIndex_book1;
        } else if (bookId === 'book2') {
            this.activeStoryChapters = this.storyChapters_book2;
            this.activeChapterIndex = this.currentChapterIndex_book2;
        }

        this.overlayElement.style.visibility = 'visible';
        this.overlayElement.style.opacity = '1';
        this.interactionTextElement.style.display = 'none'; // Hide book interaction text
        this.characterInteractionTextElement.style.display = 'none'; // Hide character interaction text
        this.characterOverlayElement.style.visibility = 'hidden'; // Ensure character overlay is hidden
        this.characterOverlayElement.style.opacity = '0';

        // Show navigation buttons for the book
        this.prevPageBtn.style.display = 'block';
        this.nextPageBtn.style.display = 'block';
        this.updateStoryContent(); // Ensure current chapter is displayed and buttons are correct

        // Disable camera controls
        this.scene.activeCamera.detachControl(this.canvas);
        (this.scene.activeCamera as FreeCamera).speed = 0;
        (this.scene.activeCamera as FreeCamera).angularSensibility = 0;
    }

    /**
     * Hides the story overlay (for the book) and re-enables camera controls.
     */
    private hideStoryOverlay(): void {
        if (!this.overlayElement || !this.scene.activeCamera) return;

        this.isOverlayActive = false;
        this.overlayElement.style.opacity = '0';
        this.prevPageBtn.style.display = 'none';
        this.nextPageBtn.style.display = 'none';

        // Save the current chapter index back to the specific book's property
        if (this.currentActiveBook === 'book1') {
            this.currentChapterIndex_book1 = this.activeChapterIndex;
        } else if (this.currentActiveBook === 'book2') {
            this.currentChapterIndex_book2 = this.activeChapterIndex;
        }
        this.currentActiveBook = null; // Reset active book tracking

        // Use a timeout to hide visibility after the CSS transition
        setTimeout(() => {
            this.overlayElement.style.visibility = 'hidden';
            // Re-enable interaction text if player is still near book
            // This logic is now handled by setupGameLogic's continuous check, but a fallback is good.
            if (this.isPlayerNearBook || this.isPlayerNearBook2) {
                this.interactionTextElement.style.display = 'block';
            }
            // Re-enable character interaction text if player is near character and no other overlay is active
            if ((this.isPlayerNearVampire || this.isPlayerNearWerewolf) && !this.isOverlayActive) {
                this.characterInteractionTextElement.style.display = 'block';
            }
        }, 300); // Match CSS transition duration

        // Re-enable camera controls
        this.scene.activeCamera.attachControl(this.canvas, true);
        (this.scene.activeCamera as FreeCamera).speed = this.cameraDefaultSpeed;
        (this.scene.activeCamera as FreeCamera).angularSensibility = 2000;
    }

    /**
     * Displays the character speech overlay and disables camera controls.
     * @param speechText The text to display in the speech bubble.
     */
    private showCharacterOverlay(speechText: string): void {
        if (!this.characterOverlayElement || !this.characterSpeechContentElement || !this.scene.activeCamera) return;

        this.isOverlayActive = true;
        this.characterOverlayElement.style.visibility = 'visible';
        this.characterOverlayElement.style.opacity = '1';
        this.characterInteractionTextElement.style.display = 'none'; // Hide character interaction text
        this.interactionTextElement.style.display = 'none'; // Hide book interaction text
        this.characterSpeechContentElement.innerHTML = speechText; // Set the dynamic speech content

        // Disable camera controls
        this.scene.activeCamera.detachControl(this.canvas);
        (this.scene.activeCamera as FreeCamera).speed = 0;
        (this.scene.activeCamera as FreeCamera).angularSensibility = 0;
    }

    /**
     * Hides the character speech overlay and re-enables camera controls.
     */
    private hideCharacterOverlay(): void {
        if (!this.characterOverlayElement || !this.scene.activeCamera) return;

        this.isOverlayActive = false;
        this.characterOverlayElement.style.opacity = '0';

        // Use a timeout to hide visibility after the CSS transition
        setTimeout(() => {
            this.characterOverlayElement.style.visibility = 'hidden';
            // Re-enable character interaction text if player is still near a character
            if ((this.isPlayerNearVampire || this.isPlayerNearWerewolf) && !this.isOverlayActive) {
                this.characterInteractionTextElement.style.display = 'block';
            }
            // Re-enable book interaction text if player is near book and no other overlay is active
            if ((this.isPlayerNearBook || this.isPlayerNearBook2) && !this.isOverlayActive) {
                this.interactionTextElement.style.display = 'block';
            }
        }, 300); // Match CSS transition duration

        // Re-enable camera controls
        this.scene.activeCamera.attachControl(this.canvas, true);
        (this.scene.activeCamera as FreeCamera).speed = this.cameraDefaultSpeed;
        (this.scene.activeCamera as FreeCamera).angularSensibility = 2000;
    }
}
