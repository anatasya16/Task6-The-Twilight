<template>
  <main>
    <!-- Loading Screen UI -->
    <div id="loader">
      <p>Loading</p>
      <div id="loadingContainer">
        <div id="loadingBar"></div>
      </div>
      <p id="percentLoaded">0%</p> <!-- Initial percentage -->
    </div>
      
    <!-- Interaction Text UI (for the book) -->
    <div id="interactionText">Click E to read the chapter!</div>

    <!-- Character Interaction Text UI -->
    <div id="characterInteractionText">Click I to interact!</div>

    <!-- Story Overlay UI (for the book) -->
    <div id="storyOverlay">
        <div id="storyContent">
            <!-- Story content will be dynamically set by CustomLoading.ts based on chapter -->
            <!-- Initial content will be Chapter 1 -->
        </div>
        <!-- Book Navigation Buttons -->
        <div id="bookNavigation">
            <button id="prevPageBtn">Previous</button>
            <button id="nextPageBtn">Next</button>
        </div>
    </div>

    <!-- Character Speech Overlay (like the book overlay, but for character dialogue) -->
    <div id="characterOverlay" class="character-overlay">
        <div id="characterSpeechContent" class="speech-content">
            <!-- Speech content will be dynamically set by CustomLoading.ts -->
        </div>
    </div>

    <!-- Quiz Interaction Text UI -->
    <div id="quizInteractionText">Click Q to start the Quiz!</div>

    <!-- Quiz Overlay UI -->
    <div id="quizOverlay" class="quiz-overlay">
        <div id="quizContent" class="quiz-content">
            <div id="questionText"></div>
            <div id="answerOptions">
                <button class="answer-btn" data-option="A"></button>
                <button class="answer-btn" data-option="B"></button>
                <button class="answer-btn" data-option="C"></button>
                <button class="answer-btn" data-option="D"></button>
            </div>
            <div id="feedbackText"></div>
            <button id="nextQuestionBtn">Next Question</button>
            <button id="closeQuizBtn">Close Quiz</button>
        </div>
    </div>

    <!-- Main 3D Scene Elements -->
    <h3>The Twilight</h3>
    <canvas id="babylonCanvas"></canvas> <!-- Added an ID to the canvas -->
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { CustomLoading } from "@/Babylon/CustomLoading";
import { QuizGame } from "@/Babylon/Quiz";
import { Engine, Scene } from "@babylonjs/core"; // Only import Engine and Scene for type hints

export default defineComponent({
  name: 'BabylonExamples',
  data() {
    return {
      loaded: false,
    };
  },
  mounted() {
    const canvas = document.getElementById("babylonCanvas") as HTMLCanvasElement;
    const loadingBar = document.getElementById("loadingBar") as HTMLElement;
    const percentLoaded = document.getElementById("percentLoaded") as HTMLElement;
    const loader = document.getElementById("loader") as HTMLElement;

    // Existing book interaction UI elements
    const interactionTextElement = document.getElementById("interactionText") as HTMLElement;
    const storyOverlay = document.getElementById("storyOverlay") as HTMLElement;
    const storyContent = document.getElementById("storyContent") as HTMLElement;
    const prevPageBtn = document.getElementById("prevPageBtn") as HTMLButtonElement;
    const nextPageBtn = document.getElementById("nextPageBtn") as HTMLButtonElement;
    // Existing character interaction UI elements
    const characterInteractionTextElement = document.getElementById("characterInteractionText") as HTMLElement;
    const characterOverlayElement = document.getElementById("characterOverlay") as HTMLElement;
    const characterSpeechContentElement = document.getElementById("characterSpeechContent") as HTMLElement;

    // Quiz UI elements
    const quizInteractionTextElement = document.getElementById("quizInteractionText") as HTMLElement;
    const quizOverlayElement = document.getElementById("quizOverlay") as HTMLElement;
    const quizContentElement = document.getElementById("quizContent") as HTMLElement;
    const answerButtons = Array.from(document.querySelectorAll("#answerOptions .answer-btn")) as HTMLButtonElement[];
    const feedbackTextElement = document.getElementById("feedbackText") as HTMLElement;
    const nextQuestionBtn = document.getElementById("nextQuestionBtn") as HTMLButtonElement;
    const closeQuizBtn = document.getElementById("closeQuizBtn") as HTMLButtonElement;

    // Ensure all critical elements are found
    if (!canvas || !loadingBar || !percentLoaded || !loader || !interactionTextElement || !storyOverlay || !storyContent || !prevPageBtn || !nextPageBtn || !characterInteractionTextElement || !characterOverlayElement || !characterSpeechContentElement || !quizInteractionTextElement || !quizOverlayElement || !quizContentElement || answerButtons.length === 0 || !feedbackTextElement || !nextQuestionBtn || !closeQuizBtn) {
      console.error("Critical HTML elements for Babylon.js or UI are missing!");
      return;
    }

    // Instantiate CustomLoading first. It will create its own engine and scene.
    const customLoadingInstance = new CustomLoading(
      canvas,
      this.setLoaded,
      loadingBar,
      percentLoaded,
      loader,
      interactionTextElement,
      storyOverlay,
      storyContent,
      prevPageBtn,
      nextPageBtn,
      characterInteractionTextElement,
      characterOverlayElement,
      characterSpeechContentElement
    );

    // After CustomLoading has initialized, get its public scene and engine.
    const sharedScene = customLoadingInstance.scene;
    const sharedEngine = customLoadingInstance.engine;

    // Instantiate QuizGame, passing the shared scene and engine
    const quizGameInstance = new QuizGame(
        sharedScene,  // Pass the shared scene
        sharedEngine, // Pass the shared engine
        quizInteractionTextElement,
        quizOverlayElement,
        quizContentElement,
        answerButtons,
        feedbackTextElement,
        nextQuestionBtn,
        closeQuizBtn
    );

    // Start the render loop and handle resize for the overall engine
    // This ensures only one render loop is running for the single engine.
    sharedEngine.runRenderLoop(() => {
        sharedScene.render();
    });

    window.addEventListener('resize', () => {
        sharedEngine.resize();
    });

  },
  methods: {
    setLoaded() {
      this.loaded = true;
    },
  },
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto+Condensed&family=Roboto:wght@100;700&display=swap");

main {
  width: 70%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* Loading Screen Styles */
#loader {
  width: 100%;
  height: 100%;
  background: slategrey;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  transition: opacity 1s ease;
}

#loaded {
  opacity: 0;
  pointer-events: none; /* Allow clicks through when faded */
}

#loadingContainer {
  width: 30%;
  height: 2rem;
  background: rgba(255, 255, 255, 0.75);
  border-radius: 6px;
  margin: 0.5rem;
}

#loadingBar {
  height: 100%;
  background: green;
  border-radius: 6px;
  width: 0%; /* Ensure initial state */
  transition: width 0.1s ease-out;
}

p {
  color: white;
  background: none;
  margin-bottom: 1rem;
  font-family: "Roboto Condensed";
  font-weight: 400;
  font-size: 2rem;
}

canvas {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  box-shadow: 8px 8px 10px -6px #000000;
}

h3 {
    color: #FFF; /* Example color for the title */
    margin-top: 20px; /* Space from top */
    z-index: 5; /* Ensure it's above canvas but below loader/overlay */
}

/* --- Interaction Text (for Book) Styles --- */
#interactionText {
    position: absolute;
    top: 10%; /* Adjust as needed */
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-family: sans-serif;
    font-size: 1.2em;
    display: none; /* Hidden by default */
    z-index: 100;
}

/* --- Character Interaction Text Styles --- */
#characterInteractionText {
    position: absolute;
    top: 20%; /* Slightly lower than book text to avoid overlap if both are near */
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-family: sans-serif;
    font-size: 1.2em;
    display: none; /* Hidden by default */
    z-index: 100;
}


/* --- Story Overlay (for Book) Styles --- */
#storyOverlay {
    position: fixed; /* Use fixed to cover entire viewport */
    top: 0;
    left: 0;
    width: 100vw; /* Cover full viewport width */
    height: 100vh; /* Cover full viewport height */
    background-color: rgba(0, 0, 0, 0.8); /* 80% black transparency */
    display: flex;
    flex-direction: column; /* Changed to column to stack content and buttons */
    justify-content: center;
    align-items: center;
    z-index: 200; /* Higher than other UI */
    opacity: 0; /* Hidden by default with fade */
    visibility: hidden; /* Ensures it's not interactive when opacity is 0 */
    transition: opacity 0.3s ease-in-out;
}

#storyContent {
    color: white;
    font-family: serif;
    font-size: 1.1em;
    max-width: 60%;
    padding: 20px;
    background-color: rgba(20, 20, 20, 0.9);
    border-radius: 8px;
    line-height: 1.6;
    text-align: justify;
    max-height: 70%; /* Give space for buttons */
    overflow-y: auto; /* Enable scrolling */
    box-shadow: 0 4px 15px rgba(0,0,0,0.5); /* Add some depth */
    margin-bottom: 20px; /* Space between content and buttons */
}

/* Specific styles for story content elements within the overlay */
#storyContent h3 {
    font-family: "Roboto Condensed"; /* Example font */
    font-size: 1.8em;
    margin-bottom: 15px;
    text-align: center;
    color: #ADD8E6; /* Light blue for headings */
}
#storyContent p {
    font-family: serif; /* Ensure paragraphs use serif font */
    font-size: 1em;
    margin-bottom: 10px;
    line-height: 1.5;
    color: #F0F0F0; /* Light gray for body text */
}

#bookNavigation {
    display: flex;
    gap: 20px; /* Space between buttons */
    z-index: 201; /* Ensure buttons are above overlay */
}

#bookNavigation button {
    padding: 10px 25px;
    font-size: 1.1em;
    font-family: "Roboto Condensed", sans-serif;
    background-color: #007bff; /* Blue button */
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

#bookNavigation button:hover {
    background-color: #0056b3;
    transform: translateY(-2px);
}

#bookNavigation button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

#bookNavigation button:disabled {
    background-color: #6c757d; /* Grey out disabled buttons */
    cursor: not-allowed;
    box-shadow: none;
}

/* --- Character Speech Overlay Styles (similar to storyOverlay) --- */
#characterOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 200;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease-in-out;
}

.speech-content {
    background-color: rgba(255, 255, 255, 0.95); /* Lighter background for speech bubble */
    border-radius: 15px;
    padding: 30px;
    max-width: 700px; /* Wider for dialogue */
    box-shadow: 0 8px 25px rgba(0,0,0,0.4);
    color: #333;
    font-family: 'Roboto', sans-serif; /* More readable font for dialogue */
    font-size: 1.2em;
    line-height: 1.6;
    text-align: center; /* Center the text for a single dialogue bubble */
    position: relative;
}

/* Optional: Add a subtle pointer/tail for the speech bubble */
.speech-content::before {
    content: '';
    position: absolute;
    top: 100%; /* Position at the bottom of the content box */
    left: 50%;
    border: 20px solid transparent;
    border-top-color: rgba(255, 255, 255, 0.95); /* Match bubble background */
    transform: translateX(-50%);
    margin-top: -1px; /* Overlap slightly to avoid gap */
}

.speech-content p {
    color: #333; /* Ensure text color is dark inside speech bubble */
    margin: 0;
    font-size: 1em;
}

/* --- Quiz Interaction Text Styles --- */
#quizInteractionText {
    position: absolute;
    top: 30%; /* Adjust as needed */
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-family: sans-serif;
    font-size: 1.2em;
    display: none; /* Hidden by default */
    z-index: 100;
}

/* --- Quiz Overlay Styles --- */
#quizOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.9); /* Darker background for quiz */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 300; /* Higher than other overlays */
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease-in-out;
}

.quiz-content {
    background-color: rgba(30, 30, 30, 0.95); /* Dark background for quiz content */
    border-radius: 15px;
    padding: 40px;
    max-width: 800px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.6);
    color: white;
    font-family: 'Roboto', sans-serif;
    text-align: center;
}

#questionText {
    font-size: 1.8em;
    margin-bottom: 30px;
    color: #ADD8E6; /* Light blue */
    font-weight: bold;
}

#answerOptions {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Two columns for buttons */
    gap: 20px;
    margin-bottom: 30px;
}

.answer-btn {
    padding: 15px 30px;
    font-size: 1.2em;
    background-color: #4CAF50; /* Green default */
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.answer-btn:hover:not(:disabled) {
    background-color: #45a049;
    transform: translateY(-3px);
}

.answer-btn:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

.answer-btn:disabled {
    background-color: #6c757d; /* Grey out disabled buttons */
    cursor: not-allowed;
    box-shadow: none;
}

.answer-btn.correct {
    background-color: #28a745; /* Darker green for correct */
}

.answer-btn.incorrect {
    background-color: #dc3545; /* Red for incorrect */
}

#feedbackText {
    font-size: 1.4em;
    margin-top: 20px;
    min-height: 1.5em; /* Reserve space */
    font-weight: bold;
}

#nextQuestionBtn, #closeQuizBtn {
    padding: 12px 25px;
    font-size: 1.1em;
    margin-top: 20px;
    margin-left: 10px;
    margin-right: 10px;
    background-color: #007bff; /* Blue */
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

#nextQuestionBtn:hover, #closeQuizBtn:hover {
    background-color: #0056b3;
}
</style>

