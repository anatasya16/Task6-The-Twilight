// import {
//     Scene,
//     FreeCamera,
//     Vector3,
//     SceneLoader,
//     Mesh,
//     AbstractMesh,
//     Engine
// } from "@babylonjs/core";
// import "@babylonjs/loaders";

// export class BreakingDawn {
//     private scene: Scene;
//     private engine: Engine;
//     public book2Mesh!: Mesh;

//     // UI elements for book2 interaction
//     private interactionTextElement: HTMLElement;
//     private overlayElement: HTMLElement;
//     private storyContentElement: HTMLElement;
//     private prevPageBtn: HTMLButtonElement;
//     private nextPageBtn: HTMLButtonElement;

//     private isPlayerNearBook2 = false;
//     private book2InteractionDistance = 2.0;
//     private isBook2Locked = true;
//     private isOverlayActive = false; // Tracks if THIS book's overlay is active

//     private setGlobalOverlayActive: (active: boolean) => void; // NEW: Function from CustomLoading.ts

//     private currentChapterIndex = 0;
//     private storyChapters: string[] = [
//         `<h3>Breaking Dawn 1 by Stephenie Meyer</h3>
//         <p>The sun sets on Bella Swan’s final days as a human girl caught between two worlds — one of fire and blood, the other of ice and eternity. Her love for Edward Cullen has burned brighter than any mortal bond should allow, and now, at the edge of a great and irreversible choice, Bella steps into a life-altering decision that will seal her fate forever.</p>
//         <p> A long-anticipated union marks the beginning of Bella’s transformation — not just of her future, but of her very existence. In a ceremony that blends elegance with emotion, Bella and Edward promise themselves to each other, transcending the doubts and fears that once haunted them. But their blissful beginning soon gives way to uncertainty when the consequences of their love reveal themselves in unexpected, mysterious ways.</p>
//         <p>As they retreat into a secluded paradise, far from the skeptical eyes of Forks, the sanctuary of their honeymoon is quickly overshadowed by a strange and impossible development — one that neither vampire lore nor human science can explain. Bella’s body begins to betray her, changing faster than anyone could prepare for, and the life growing within her challenges everything they thought they understood.</p>
//         <p>Tensions rise within the Cullen family, testing even the strongest bonds. Some see Bella’s choice as reckless, others as brave. Meanwhile, Jacob Black, now more than ever, finds himself divided between loyalty, fury, and a growing understanding that his path may not be what he once believed.</p>`,
//         `<h3>Breaking Dawn 1 by Stephenie Meyer</h3>
//         <p>Outside the Cullen house, old rivalries stir. The wolves grow restless, divided by duty and compassion. Secrets surface within their ranks, and choices must be made that will echo for generations to come. Bella, caught in the middle of it all, faces pain and transformation beyond comprehension. Yet through it all, Bella holds fast to her love — unshaken, unwavering, even as her heart and body fracture under the weight of change. The fragile line between life and death, love and sacrifice, becomes nearly invisible. And just when everything seems to settle, a newborn silence descends — the kind that only comes before a storm.</p>
//         <p>In her darkest hour, Bella is reborn — not merely changed, but awakened. The world she once viewed through human eyes now glows with immortal clarity. But with this new sight comes a new danger, one far greater than anything they’ve faced before.</p>
//         <p>As whispers reach the powerful Volturi in Italy, the ancient rulers of the vampire world, Bella and Edward’s family find themselves standing on a precipice once again — this time not just as lovers, but as protectors. The choices they made in Breaking Dawn Part 1 will summon a reckoning no one can ignore.</p>
//         <p>And so, Breaking Dawn Part 2 awaits — where allegiances will be tested, truths will be revealed, and the strength of love will determine the fate of more than just one family.</p>`
//     ];

//     constructor(
//         scene: Scene,
//         engine: Engine,
//         interactionTextElement: HTMLElement,
//         overlayElement: HTMLElement,
//         storyContentElement: HTMLElement,
//         prevPageBtn: HTMLButtonElement,
//         nextPageBtn: HTMLButtonElement,
//         setGlobalOverlayActive: (active: boolean) => void // NEW: Accept callback in constructor
//     ) {
//         this.scene = scene;
//         this.engine = engine;
//         this.setGlobalOverlayActive = setGlobalOverlayActive; // NEW: Assign the global overlay setter

//         this.interactionTextElement = interactionTextElement;
//         this.overlayElement = overlayElement;
//         this.storyContentElement = storyContentElement;
//         this.prevPageBtn = prevPageBtn;
//         this.nextPageBtn = nextPageBtn;

//         this.setupUI();
//         this.setupGameLogic();
//         document.addEventListener('keydown', this.handleKeyPress.bind(this));
//         this.prevPageBtn.addEventListener('click', () => this.prevPage());
//         this.nextPageBtn.addEventListener('click', () => this.nextPage());

//         this.createBook2().catch(error => {
//             console.error("Error loading book2.glb:", error);
//         });
//     }

//     /**
//      * Loads the book2.glb model into the scene.
//      */
//     public async createBook2(): Promise<void> {
//         try {
//             const result = await SceneLoader.ImportMeshAsync(
//                 "",
//                 "./models/",
//                 "book2.glb", // Assuming this is your second book model
//                 this.scene
//             );
//             this.book2Mesh = result.meshes[0] as Mesh;
//             this.book2Mesh.position = new Vector3(-10, 0, 5); // Position different from the first book
//             this.book2Mesh.scaling = new Vector3(0.2, 0.2, 0.2);
//             this.book2Mesh.rotation = new Vector3(0, 0.2, 0.0);
//             console.log("Loaded book2.glb:", this.book2Mesh.name);

//             // Initially make the book non-interactable visually if it's locked
//             if (this.isBook2Locked) {
//                 this.book2Mesh.isVisible = false; // Or change its material to indicate locked
//             }

//         } catch (error) {
//             console.error("Error loading book2.glb:", error);
//             throw error;
//         }
//     }

//     /**
//      * Unlocks the book, making it interactable.
//      */
//     public unlockBook(): void {
//         this.isBook2Locked = false;
//         if (this.book2Mesh) {
//             this.book2Mesh.isVisible = true; // Make it visible if it was hidden
//             console.log("Book 2 unlocked!");
//         }
//     }

//     /**
//      * Sets up the HTML UI elements for interaction and story overlay.
//      */
//     private setupUI(): void {
//         this.interactionTextElement.style.display = 'none';
//         this.overlayElement.style.visibility = 'hidden';
//         this.overlayElement.style.opacity = '0';
//         this.prevPageBtn.style.display = 'none';
//         this.nextPageBtn.style.display = 'none';
        
//         this.updateStoryContent();
//     }

//     /**
//      * Updates the story content in the overlay based on currentChapterIndex.
//      * Enables/disables navigation buttons.
//      */
//     private updateStoryContent(): void {
//         this.storyContentElement.innerHTML = this.storyChapters[this.currentChapterIndex];
        
//         this.prevPageBtn.disabled = this.currentChapterIndex === 0;
//         this.nextPageBtn.disabled = this.currentChapterIndex === this.storyChapters.length - 1;
//     }

//     /**
//      * Moves to the next chapter/page.
//      */
//     private nextPage(): void {
//         if (this.currentChapterIndex < this.storyChapters.length - 1) {
//             this.currentChapterIndex++;
//             this.updateStoryContent();
//         }
//     }

//     /**
//      * Moves to the previous chapter/page.
//      */
//     private prevPage(): void {
//         if (this.currentChapterIndex > 0) {
//             this.currentChapterIndex--;
//             this.updateStoryContent();
//         }
//     }

//     /**
//      * Sets up the game logic loop for player-book2 interaction.
//      */
//     private setupGameLogic(): void {
//         this.scene.onBeforeRenderObservable.add(() => {
//             if (!this.book2Mesh || !this.scene.activeCamera || this.isBook2Locked) {
//                 return;
//             }

//             const cameraPosition = this.scene.activeCamera.position;
//             const book2Position = this.book2Mesh.position;
//             const distanceToBook2 = Vector3.Distance(cameraPosition, book2Position);

//             // Only show book2 interaction text if this book's overlay is NOT active
//             if (distanceToBook2 < this.book2InteractionDistance && !this.isOverlayActive) {
//                 if (!this.isPlayerNearBook2) {
//                     this.interactionTextElement.style.display = 'block';
//                     this.isPlayerNearBook2 = true;
//                 }
//             } else {
//                 if (this.isPlayerNearBook2) {
//                     this.interactionTextElement.style.display = 'none';
//                     this.isPlayerNearBook2 = false;
//                 }
//             }
//              // Ensure interaction text is hidden when THIS overlay IS active
//              if (this.isOverlayActive) {
//                 this.interactionTextElement.style.display = 'none';
//             }
//         });
//     }

//     /**
//      * Handles global key press events for book2 interactions.
//      * @param {KeyboardEvent} event The keyboard event.
//      */
//     private handleKeyPress(event: KeyboardEvent): void {
//         // Handle closing overlay with 'Escape'
//         if (event.key === 'Escape') {
//             if (this.isOverlayActive) {
//                 this.hideStoryOverlay();
//                 event.preventDefault();
//             }
//             return;
//         }

//         // Handle opening book2 story with 'E' only if unlocked and player is near
//         // And if no other global overlay is active (implicitly managed by CustomLoading.ts)
//         if (!this.isOverlayActive && !this.isBook2Locked && this.isPlayerNearBook2) {
//             if (event.key === 'e' || event.key === 'E') {
//                 this.showStoryOverlay();
//                 event.preventDefault();
//             }
//         }
        
//         // Allow left/right arrow keys for book2 navigation ONLY IF book2 overlay is active
//         if (this.isOverlayActive && this.overlayElement.style.visibility === 'visible') {
//             if (event.key === 'ArrowLeft') {
//                 this.prevPage();
//                 event.preventDefault();
//             } else if (event.key === 'ArrowRight') {
//                 this.nextPage();
//                 event.preventDefault();
//             }
//         }
//     }

//     /**
//      * Displays the book2 story overlay and informs CustomLoading to detach camera controls.
//      */
//     private showStoryOverlay(): void {
//         if (!this.overlayElement) return;

//         this.isOverlayActive = true;
//         this.setGlobalOverlayActive(true); // NEW: Inform CustomLoading to manage camera controls

//         this.overlayElement.style.visibility = 'visible';
//         this.overlayElement.style.opacity = '1';
//         this.interactionTextElement.style.display = 'none'; // Hide book2 interaction text

//         // Show navigation buttons for book2
//         this.prevPageBtn.style.display = 'block';
//         this.nextPageBtn.style.display = 'block';
//         this.updateStoryContent(); // Ensure current chapter is displayed and buttons are correct
//     }

//     /**
//      * Hides the book2 story overlay and informs CustomLoading to re-enable camera controls.
//      */
//     private hideStoryOverlay(): void {
//         if (!this.overlayElement) return;

//         this.isOverlayActive = false;
//         this.setGlobalOverlayActive(false); // NEW: Inform CustomLoading to manage camera controls

//         this.overlayElement.style.opacity = '0';
//         this.prevPageBtn.style.display = 'none';
//         this.nextPageBtn.style.display = 'none';

//         // Use a timeout to hide visibility after the CSS transition
//         setTimeout(() => {
//             this.overlayElement.style.visibility = 'hidden';
//             // Re-enable interaction text if player is still near book and it's unlocked
//             // This is now handled by CustomLoading's continuous check and its global state.
//             if (this.isPlayerNearBook2 && !this.isBook2Locked) {
//                  this.interactionTextElement.style.display = 'block';
//             }
//         }, 300); // Match CSS transition duration
//     }
// }
