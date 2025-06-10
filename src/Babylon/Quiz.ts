import {
    Scene,
    Engine,
    FreeCamera,
    Vector3,
    SceneLoader,
    AbstractMesh, // Still imported, though not directly used in the final version of this class
    Mesh // Import Mesh for type assertion
} from "@babylonjs/core";
import "@babylonjs/loaders";

export class QuizGame {
    private scene: Scene; // Now receives the scene from outside
    private engine: Engine; // Now receives the engine from outside
    deskMesh!: Mesh; // To store the loaded desk mesh

    // UI elements for quiz interaction
    private quizInteractionTextElement: HTMLElement; // "Click Q to start the Quiz!"
    private quizOverlayElement: HTMLElement;         // The main quiz overlay
    private quizContentElement: HTMLElement;         // Contains question, options, feedback
    private questionTextElement: HTMLElement;
    private answerOptionsContainer: HTMLElement;
    private answerButtons: HTMLButtonElement[];
    private feedbackTextElement: HTMLElement;
    private nextQuestionBtn: HTMLButtonElement;
    private closeQuizBtn: HTMLButtonElement;

    private isPlayerNearDesk = false;
    private isQuizActive = false;
    private quizInteractionDistance = 3.0; // Distance to trigger quiz interaction prompt
    private cameraDefaultSpeed = 0.2; // Store camera speed to restore after quiz

    private currentQuestionIndex = 0;
    private quizData = [
        {
            question: "1. Why does Bella move to Forks, Washington?",
            options: {
                A: "To attend a new school",
                B: "To escape her past",
                C: "To live with her father",
                D: "To find the Cullens"
            },
            correctAnswer: "C"
        },
        {
            question: "2. What makes the town of Forks feel mysterious in the story?",
            options: {
                A: "Its desert landscapes and heat",
                B: "The large city atmosphere",
                C: "The constant sunlight and clear skies",
                D: "The forests and perpetual cloud cover"
            },
            correctAnswer: "D"
        },
        {
            question: "3. How does Bella initially feel about her new school life in Forks?",
            options: {
                A: "Confident and popular",
                B: "Disappointed and isolated",
                C: "Excited and optimistic",
                D: "Bored but accepting"
            },
            correctAnswer: "D"
        },
        {
            question: "4. What about Edward Cullen draws Bella’s attention?",
            options: {
                A: "His mysterious behavior and unusual abilities",
                B: "His high grades and leadership in sports",
                C: "His musical talent and humor",
                D: "His constant talking and friendliness"
            },
            correctAnswer: "A"
        },
        {
            question: "5. Which theme is introduced as central to Twilight based on the summary?",
            options: {
                A: "Political conflict",
                B: "Technology and innovation",
                C: "Forbidden love and personal discovery",
                D: "War and revenge"
            },
            correctAnswer: "C"
        }
    ];

    constructor(
        scene: Scene, // Receive the scene from CustomLoading.ts
        engine: Engine, // Receive the engine from CustomLoading.ts
        quizInteractionTextElement: HTMLElement,
        quizOverlayElement: HTMLElement,
        quizContentElement: HTMLElement, // This will be the main container for question, options, feedback
        answerButtons: HTMLButtonElement[],
        feedbackTextElement: HTMLElement,
        nextQuestionBtn: HTMLButtonElement,
        closeQuizBtn: HTMLButtonElement
    ) {
        this.scene = scene; // Assign the passed scene
        this.engine = engine; // Assign the passed engine

        // Assign passed UI elements to class properties
        this.quizInteractionTextElement = quizInteractionTextElement;
        this.quizOverlayElement = quizOverlayElement;
        this.quizContentElement = quizContentElement; // This is the parent for question/options
        this.answerButtons = answerButtons;
        this.feedbackTextElement = feedbackTextElement;
        this.nextQuestionBtn = nextQuestionBtn;
        this.closeQuizBtn = closeQuizBtn;

        // Get direct references to the specific elements within quizContentElement
        this.questionTextElement = quizContentElement.querySelector('#questionText') as HTMLElement;
        this.answerOptionsContainer = quizContentElement.querySelector('#answerOptions') as HTMLElement;

        // Load the desk and set up quiz UI/logic
        this.CreateEnvironment().finally(() => {
            this.setupGameUI();
            this.setupGameLogic();
        }).catch(error => {
            console.error("Error during quiz environment creation:", error);
        });

        // No need for its own render loop or resize listener here, CustomLoading (via BabylonExamples.vue) will handle it
    }

    /**
     * Loads the desk.glb model into the scene.
     * @returns {Promise<void>}
     */
    async CreateDesk(): Promise<void> {
        try {
            const result = await SceneLoader.ImportMeshAsync(
                "",
                "./models/", // Assuming desk.glb is in your models folder
                "desk.glb",
                this.scene // Use the shared scene
            );
            // Assuming the first mesh is the primary desk mesh or its root
            this.deskMesh = result.meshes[0] as Mesh;
            this.deskMesh.rotation = new Vector3(0, 0, 0); 
            this.deskMesh.position = new Vector3(-5, 0, 2); // Position it for interaction (adjust as needed in your scene)
            this.deskMesh.scaling = new Vector3(0.1, 0.1, 0.1); // Adjust scaling as needed
            console.log("Loaded desk.glb:", this.deskMesh.name);
        } catch (error) {
            console.error("Error loading desk.glb:", error);
            throw error;
        }
    }

    /**
     * Orchestrates the creation of the environment, specifically the desk.
     */
    public async CreateEnvironment(): Promise<void> {
        await this.CreateDesk(); // Load the desk model
    }

    /**
     * Sets up the HTML UI elements for interaction and quiz overlay.
     */
    private setupGameUI(): void {
        this.quizInteractionTextElement.style.display = 'none';
        this.quizOverlayElement.style.visibility = 'hidden';
        this.quizOverlayElement.style.opacity = '0';
        this.feedbackTextElement.textContent = ''; // Clear feedback initially
        this.nextQuestionBtn.style.display = 'none'; // Hide next question button initially

        // Attach event listeners for answer buttons
        this.answerButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const selectedOption = (event.target as HTMLButtonElement).dataset.option as string;
                this.checkAnswer(selectedOption);
            });
        });

        // Attach event listener for Next Question button
        this.nextQuestionBtn.addEventListener('click', () => this.nextQuestion());

        // Attach event listener for Close Quiz button
        this.closeQuizBtn.addEventListener('click', () => this.hideQuizOverlay());

        // Display the first question
        this.updateQuizContent();
    }

    /**
     * Updates the quiz content with the current question and options.
     */
    private updateQuizContent(): void {
        if (this.currentQuestionIndex < this.quizData.length) {
            const currentQuizItem = this.quizData[this.currentQuestionIndex];
            this.questionTextElement.textContent = currentQuizItem.question;
            this.feedbackTextElement.textContent = ''; // Clear feedback for new question
            this.nextQuestionBtn.style.display = 'none'; // Hide next button

            // Reset answer button styles and content
            this.answerButtons.forEach(button => {
                const optionKey = button.dataset.option as keyof typeof currentQuizItem.options;
                button.textContent = `${optionKey}. ${currentQuizItem.options[optionKey]}`;
                button.classList.remove('correct', 'incorrect');
                button.disabled = false; // Enable buttons for new question
            });
        } else {
            // End of quiz
            this.questionTextElement.textContent = "Quiz Complete!";
            this.answerOptionsContainer.innerHTML = ''; // Clear options
            this.feedbackTextElement.textContent = "You've finished the quiz!";
            this.nextQuestionBtn.style.display = 'none';
            this.closeQuizBtn.textContent = 'Close Quiz'; // Ensure close button is visible
        }
    }

    /**
     * Checks the selected answer against the correct answer.
     * @param selectedOption The option chosen by the player (e.g., 'A', 'B').
     */
    private checkAnswer(selectedOption: string): void {
        const currentQuizItem = this.quizData[this.currentQuestionIndex];
        if (!currentQuizItem) return;

        // Disable all answer buttons after a selection
        this.answerButtons.forEach(button => {
            button.disabled = true;
        });

        if (selectedOption === currentQuizItem.correctAnswer) {
            this.feedbackTextElement.textContent = "Correct!";
            this.feedbackTextElement.style.color = '#28a745'; // Green
            this.answerButtons.find(btn => btn.dataset.option === selectedOption)?.classList.add('correct');
        } else {
            this.feedbackTextElement.textContent = "Incorrect. The correct answer is: " + currentQuizItem.correctAnswer; // Show correct answer on incorrect
            this.feedbackTextElement.style.color = '#dc3545'; // Red
            // Fix: Use 'btn' from the find callback, not an undeclared 'button'
            this.answerButtons.find(btn => btn.dataset.option === selectedOption)?.classList.add('incorrect');
            // Highlight the correct answer
            this.answerButtons.find(btn => btn.dataset.option === currentQuizItem.correctAnswer)?.classList.add('correct');
        }

        // Show next question button after answer, unless it's the last question
        if (this.currentQuestionIndex < this.quizData.length - 1) {
            this.nextQuestionBtn.style.display = 'block';
        } else {
            this.nextQuestionBtn.style.display = 'none'; // Hide if it's the last question
        }
    }

    /**
     * Advances to the next question or finishes the quiz.
     */
    private nextQuestion(): void {
        this.currentQuestionIndex++;
        this.updateQuizContent();
    }

    /**
     * Sets up the game logic loop for player-desk interaction.
     */
    private setupGameLogic(): void {
        // Use the shared scene's onBeforeRenderObservable
        this.scene.onBeforeRenderObservable.add(() => {
            if (!this.deskMesh || !this.scene.activeCamera) {
                return; // Ensure desk and camera exist
            }

            const cameraPosition = this.scene.activeCamera.position;
            const deskPosition = this.deskMesh.position;
            const distance = Vector3.Distance(cameraPosition, deskPosition);

            if (distance < this.quizInteractionDistance) {
                // Only show interaction text if the quiz is NOT active
                if (!this.isPlayerNearDesk && !this.isQuizActive) {
                    this.quizInteractionTextElement.style.display = 'block';
                    this.isPlayerNearDesk = true;
                }
            } else {
                if (this.isPlayerNearDesk && !this.isQuizActive) {
                    this.quizInteractionTextElement.style.display = 'none';
                    this.isPlayerNearDesk = false;
                }
            }

            // Ensure interaction text is hidden when the quiz overlay IS active
            if (this.isQuizActive) {
                this.quizInteractionTextElement.style.display = 'none';
            }
        });

        // Add keyboard event listener for 'Q' to open quiz
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }

    /**
     * Handles global key press events for quiz interactions.
     * @param {KeyboardEvent} event The keyboard event.
     */
    private handleKeyPress(event: KeyboardEvent): void {
        // Handle closing active overlay with 'Escape'
        if (event.key === 'Escape') {
            if (this.isQuizActive) {
                this.hideQuizOverlay();
                event.preventDefault();
            }
            return; // Prevent further processing
        }

        // Handle opening quiz with 'Q'
        if (!this.isQuizActive && this.isPlayerNearDesk) {
            if (event.key === 'q' || event.key === 'Q') {
                this.showQuizOverlay();
                event.preventDefault();
            }
        }
    }

    /**
     * Displays the quiz overlay and disables camera controls.
     */
    private showQuizOverlay(): void {
        if (!this.quizOverlayElement || !this.scene.activeCamera) return;

        this.isQuizActive = true;
        this.quizOverlayElement.style.visibility = 'visible';
        this.quizOverlayElement.style.opacity = '1';
        this.quizInteractionTextElement.style.display = 'none'; // Hide prompt

        // Reset quiz to first question when opened
        this.currentQuestionIndex = 0;
        this.updateQuizContent();

        // Store current camera speed before disabling controls
        this.cameraDefaultSpeed = (this.scene.activeCamera as FreeCamera).speed;
        // Disable camera controls
        this.scene.activeCamera.detachControl(); // Corrected: Call detachControl with no arguments
        (this.scene.activeCamera as FreeCamera).angularSensibility = 0;
    }

    /**
     * Hides the quiz overlay and re-enables camera controls.
     */
    private hideQuizOverlay(): void {
        if (!this.quizOverlayElement || !this.scene.activeCamera) return;

        this.isQuizActive = false;
        this.quizOverlayElement.style.opacity = '0';

        // Use a timeout to hide visibility after the CSS transition
        setTimeout(() => {
            this.quizOverlayElement.style.visibility = 'hidden';
            // Re-enable interaction text if player is still near desk
            if (this.isPlayerNearDesk) {
                 this.quizInteractionTextElement.style.display = 'block';
            }
        }, 300); // Match CSS transition duration

        // Re-enable camera controls, restoring previous speed
        this.scene.activeCamera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
        (this.scene.activeCamera as FreeCamera).speed = this.cameraDefaultSpeed;
        (this.scene.activeCamera as FreeCamera).angularSensibility = 2000;
    }
}

