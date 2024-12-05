import express from "express";
import axios from "axios";

import functions from "./utils/functions.js";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.static("utils"));

// Global variables for game state
let gameState = {
    deck_info: null,
    deck_id: null,
    playerHand: [],
    dealerHand: [],
    results: "Game in Play",
};


try {
    if (!gameState.deck_info || !gameState.deck_id) {
        console.log("Initializing the deck...");
        gameState.deck_info = await functions.initializeDeck();
        gameState.deck_id = gameState.deck_info.deck_id;
        console.log("Deck Initialized: ", gameState.deck_info);
    }
    // next(); // Continue to the next middleware or route handler
} catch (error) {
    console.error("Error initializing deck:", error);
    res.status(500).send("Failed to initialize the deck.");
}


// Route for the home page (initial deal)
app.get("/", async (req, res) => {
    if (!gameState.deck_info) {
        return res.status(500).send("Deck not initialized.");
    }

    try {
        // alternate dealing the cards
        for (let i = 0; i < 2; i++) {
            // Deal Player's cards
            let newCard = await functions.drawCard(gameState.deck_id, 1);
            gameState.playerHand.value = functions.cardToHand(gameState.playerHand.value, newCard);
            // gameState.playerHand.img = gameState.playerHand.value.images.png;
            
            // Deal Dealer's cards
            newCard = await functions.drawCard(gameState.deck_id, 1);
            gameState.dealerHand = functions.cardToHand(gameState.dealerHand, newCard);
        }

        // Converts card data from the response into a readable "Value Suit" string format.
        const playerHandString = functions.cardsToStrings(gameState.playerHand.value);
        const dealerHandString = functions.cardsToStrings(gameState.dealerHand);
       
        // Print cards in play of the Dealer & Player
        console.log(`* Cards In PLAY *\nDealer Cards: ${dealerHandString}.\nPlayer Cards: ${playerHandString}.`);     
        // console.log("player images\n",gameState.playerHand.img)
        // update deck_info
        gameState.deck_info = await functions.updateDeck_info(gameState.deck_id);

        res.render("index.ejs", {gameState});
    } catch (error) {
        console.error("Error dealing cards:", error);
        res.status(500).send("An error occurred while dealing cards.");
    }
});

// Route for drawing additional cards
app.get("/hit", async (req, res) => {
    console.log("* Button Clicked: Hit")

    if (!gameState.deck_info) {
        return res.status(500).send("Deck not initialized.");
    }

    try {
        // Draw cards into play
        const newCard = await functions.drawCard(gameState.deck_id, 1)
        
        // Place draw cards into player hand
        gameState.playerHand = functions.cardToHand(gameState.playerHand, newCard);
        
        // Converts card data from the response into a readable "Value Suit" string format.   
        const playerHandString = functions.cardsToStrings(gameState.playerHand);
        const dealerHandString = functions.cardsToStrings(gameState.dealerHand);
        
         // Print cards in play of the Dealer & Player
         console.log(`* Cards In PLAY *\nDealer Cards: ${dealerHandString}.\nPlayer Cards: ${playerHandString}.`);     
        
         gameState.results = functions.check(gameState.playerHand, gameState.dealerHand);
        if (gameState.results == "Player busts and loses the bet.") {
            res.redirect("/stay");
        } else {
            gameState.results = "Game in Play"
        }

        // Update deck_info
        gameState.deck_info = await functions.updateDeck_info(gameState.deck_id);

        res.render("index.ejs", {gameState });
    } catch (error) {
        console.error('- Error drawing cards: \n', error);
        res.status(500).send("An error occurred while drawing cards.");
    }
});

// Route to reset the game and start a new round
app.get("/shuffle", async (req, res) => {
    console.log("* Button Clicked: Shuffle")
    try {
          // Reset deck.        
        const response = await axios(`https://deckofcardsapi.com/api/deck/${gameState.deck_id}/shuffle/`);
        gameState.deck_info = response.data        

        // Rest hands
        gameState.playerHand = [];
        gameState.dealerHand = [];
        gameState.results = "Game in Play";

        // Deals cards
        console.log("Redirecting to ./")
        res.redirect("/");

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
            dealerLogic = functions.dealerLogic(gameState.playerHand, gameState.dealerHand); 
            
            // Exit loop if dealer logic is false
            if (!dealerLogic) continue; 
            
            // Add a new card to the dealer's hand
            const newCard = await functions.drawCard(gameState.deck_id, dealerLogic);        
            gameState.dealerHand = functions.cardToHand(gameState.dealerHand, newCard);
            
            // Delay for 2 seconds (2000 milliseconds)
            // await new Promise(resolve => setTimeout(resolve, 2000));

            // res.render("index.ejs", { gameState });

        }

        // Determine results and render the page
        gameState.results = functions.check(gameState.playerHand, gameState.dealerHand);
        res.render("index.ejs", { gameState });

    } catch (error) {
        console.error("Error staying the game:", error);
        res.status(500).send("An error occurred while staying the game.");
    }
  
})

// Start the server after initializing the deck.
app.listen(port, () => {
    console.log(`Listening on ${port}, http://localhost:${port}`);
});
