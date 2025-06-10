import { ILoadingScreen } from "@babylonjs/core";

export class CustomLoadingScreen implements ILoadingScreen {
    // These properties must be initialized, either here or in the constructor.
    // Making them public as required by the interface.
    public loadingUIBackgroundColor: string;
    public loadingUIText: string;

    constructor(
        private loadingBar: HTMLElement,
        private percentLoaded: HTMLElement,
        private loader: HTMLElement
    ) {
        // Initialize the required properties in the constructor
        this.loadingUIBackgroundColor = "#111111"; // Default background color
        this.loadingUIText = "Loading Scene..."; // Default loading text
    }

    /**
     * This function is called to display the loading screen.
     */
    displayLoadingUI(): void {
        // Show the loader container
        if (this.loader) {
            this.loader.style.display = "flex"; // Assuming you want a flex container for centering
            document.body.style.backgroundColor = this.loadingUIBackgroundColor;
        }

        // Reset progress bar to 0%
        if (this.loadingBar) {
            this.loadingBar.style.width = "0%";
        }
        if (this.percentLoaded) {
            this.percentLoaded.innerText = "0% loaded";
        }

        console.log("Custom loading UI displayed.");
    }

    /**
     * This function is called to hide the loading screen.
     */
    hideLoadingUI(): void {
        // Add a class for a fade-out animation if desired
        // If you're using CSS transitions for the fade, you might add a class like 'fade-out'
        // and then listen for 'transitionend' before setting display = 'none'.
        // For simplicity, directly setting display to none after a timeout.
        if (this.loader) {
            // Optional: If you use CSS for a fade-out, you might add a class here
            // this.loader.classList.add('fade-out');

            // Setting ID to 'loaded' might be for CSS styling (e.g., #loaded { opacity: 0; transition: opacity 1s; })
            this.loader.id = "loaded";

            // Hide the loader after a delay (e.g., 1000ms for a smooth transition)
            setTimeout(() => {
                this.loader.style.display = "none";
                // Optionally remove the 'loaded' ID or 'fade-out' class here
                // this.loader.id = ""; // Or this.loader.classList.remove('fade-out');
            }, 1000);
        }
        console.log("Custom loading UI hidden.");
    }

    /**
     * This method is called by Babylon.js to update loading progress.
     * Note: Babylon.js usually passes a number (0-100) for status.
     * It's safer to expect a number and convert to string for display.
     */
    updateLoadStatus(status: number): void {
        const percent = Math.round(status); // Ensure it's a whole number percentage
        if (this.loadingBar) {
            this.loadingBar.style.width = `${percent}%`;
        }
        if (this.percentLoaded) {
            this.percentLoaded.innerText = `${percent}% loaded`;
        }
    }
}
