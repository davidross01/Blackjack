import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

import functions from "./utils/functions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "utils"), {
    setHeaders: (res, path) => {
        if (path.endsWith(".js")) {
            res.setHeader("Content-Type", "application/javascript");
        }
    }
}));

// Global variables for Game State
let GS = {
    deck_info: null,
    deck_id: null,
    playerHand: [],
    dealerHand: [],
    playerHandImages: [],
    dealerHandImages: [],
    results: "Game in Play",
};

(async () => {
    try {
        console.log("Initializing the deck...");
        GS.deck_info = await functions.initializeDeck();
        GS.deck_id = GS.deck_info.deck_id;
        // console.log("Deck Initialized: ", GS.deck_info);
        console.log("Game State: ", GS);

        app.listen(port, () => {
            console.log(`Listening on ${port}, http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Error initializing deck:", error);
        process.exit(1); // Exit if deck initialization fails
    }
})();

// Route for the home page (initial deal)
app.get('/', async (req, res) => {
    if (!GS.deck_info) {
        return res.status(500).send("Deck not initialized.");
    }

    try {
        if (!GS.playerHand.length) {
            console.log("The player hand is empty!");
            // alternate dealing the cards
            for (let i = 0; i < 2; i++) {
                // Deal Player's cards
                let newCard = await functions.drawCard(GS.deck_id, 1);
                GS.playerHand.value = functions.cardToHand(GS.playerHand, newCard);
                GS.playerHandImages[i] = GS.playerHand.value[i].image;            
                
                // Deal Dealer's cards
                newCard = await functions.drawCard(GS.deck_id, 1);
                GS.dealerHand.value = functions.cardToHand(GS.dealerHand, newCard);

                if (i == 0) {
                    GS.dealerHandImages[i] = "https://deckofcardsapi.com/static/img/back.png";
                } else {
                    GS.dealerHandImages[i] = GS.dealerHand.value[i].image;
                }
                console.log("Dealer Image:", GS.dealerHandImages[i]);
            }

            // Converts card data from the response into a readable "Value Suit" string format.
            const playerHandString = functions.cardsToStrings(GS.playerHand);
            const dealerHandString = functions.cardsToStrings(GS.dealerHand);
        
            // Print cards in play of the Dealer & Player
            console.log(`* "/" Cards In PLAY *\nDealer Cards: ${dealerHandString}.\nPlayer Cards: ${playerHandString}.`);     
        }
        // update deck_info
        GS.deck_info = await functions.updateDeck_info(GS.deck_id);

        res.render("index.ejs", { GS });
    } catch (error) {
        console.error("Error dealing cards:", error);
        res.status(500).send("An error occurred while dealing cards.");
    }
});

// Route for drawing additional cards
app.get("/hit", async (req, res) => {
    console.log("* Button Clicked: Hit")

    if (!GS.deck_info) {
        return res.status(500).send("Deck not initialized.");
    }

    try {
        // Draw cards into play
        const newCard = await functions.drawCard(GS.deck_id, 1)
        
        // Place draw cards into player hand
        GS.playerHand = functions.cardToHand(GS.playerHand, newCard);
        
        // Converts card data from the response into a readable "Value Suit" string format.   
        const playerHandString = functions.cardsToStrings(GS.playerHand);
        const dealerHandString = functions.cardsToStrings(GS.dealerHand);
        
        // Print cards in play of the Dealer & Player
        console.log(`* [HIT] Cards In PLAY *\nDealer Cards: ${dealerHandString}.\nPlayer Cards: ${playerHandString}.`);     
        
        GS.results = functions.check(GS.playerHand, GS.dealerHand);

        if (GS.results == "Player busts and loses the bet.") {
            res.redirect("/");
        } else {
            GS.results = "Game in Play"
        }

        // Update deck_info how many cards have been removed 
        GS.deck_info = await functions.updateDeck_info(GS.deck_id);
        res.redirect("/")

    } catch (error) {
        console.error('- Error drawing cards: \n', error);
        res.status(500).send("An error occurred while drawing cards.");
    }
});

// Route to reset the game and start a new round
app.get("/shuffle", async (req, res) => {
    console.log("* Button Clicked: Shuffle")
    if (!GS.deck_id) {
        return res.status(500).send("Deck ID is not initialized.");
    }
    try {
        // Resuffle deck.        
        const response = await axios(`https://deckofcardsapi.com/api/deck/${GS.deck_id}/shuffle/`);
        GS.deck_info = response.data;

        // Rest hands
        GS.playerHand = [];
        GS.dealerHand = [];
        GS.playerHandImages = [];
        GS.dealerHandImages = [];
        GS.results = "Game in Play";

        console.log("GS: DEALER", GS.playerHand);
        res.redirect(`/`);
    } catch (error) {
        console.error("Error resetting the game:", error);
        res.status(500).send("An error occurred while resetting the game.");
    }
});

app.get("/stay", async (req, res) => {
    console.log("* Button Clicked: Stay")
    
    try {
        let dealerLogic = 1;

        while (dealerLogic) {
            // Update dealer logic
            dealerLogic = functions.dealerLogic(GS.playerHand, GS.dealerHand); 
            
            // Exit loop if dealer logic is false
            if (!dealerLogic) break; 
            
            // Add a new card to the dealer's hand
            let newCard = await functions.drawCard(GS.deck_id, dealerLogic);        
            GS.dealerHand = functions.cardToHand(GS.dealerHand, newCard);

        }
        
        for (let i = 0; i < GS.dealerHand.length; i++) {
            GS.dealerHandImages[i] = GS.dealerHand.value[i].image;
        }

        // Determine results and render the page
        GS.results = functions.check(GS.playerHand, GS.dealerHand);
        
        GS.deck_info = await functions.updateDeck_info(GS.deck_id);
        res.redirect("/")

    } catch (error) {
        console.error("Error staying the game:", error);
        res.status(500).send("An error occurred while staying the game.");
    }
});


