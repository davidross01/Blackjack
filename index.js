import express from "express";
import axios from "axios";

import functions from "./utils/functions.js";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.static("utils"));

// Global variables for game state
var deck_info, deck_id = null;
var playerHand = [];
var dealerHand = [];
var results = "Game in Play";

// Initialize the deck before handling requests
deck_info = await functions.initializeDeck();
deck_id = deck_info.deck_id;
console.log("Deck Initialized: ", deck_info);


// Route for the home page (initial deal)
app.get("/", async (req, res) => {
    if (!deck_info) {
        return res.status(500).send("Deck not initialized.");
    }

    try {
        // Deal Player's cards
        let newCard = await functions.drawCard(deck_id, 2);
        playerHand = functions.cardToHand(playerHand, newCard);
        
        // Deal Dealer's cards
        newCard = await functions.drawCard(deck_id, 2);
        dealerHand = functions.cardToHand(dealerHand, newCard);

        // Converts card data from the response into a readable "Value Suit" string format.
        const playerHandString = functions.cardsToStrings(playerHand);
        const dealerHandString = functions.cardsToStrings(dealerHand);
       
        // Print cards in play of the Dealer & Player
        console.log(`* Cards In PLAY *\nDealer Cards: ${dealerHandString}.\nPlayer Cards: ${playerHandString}.`);     
        
        // update deck_info
        deck_info = await functions.updateDeck_info(deck_id);

        res.render("index.ejs", {deck_info, playerHand, dealerHand, results});
    } catch (error) {
        console.error("Error dealing cards:", error);
        res.status(500).send("An error occurred while dealing cards.");
    }
});

// Route for drawing additional cards
app.get("/hit", async (req, res) => {
    if (!deck_info) {
        return res.status(500).send("Deck not initialized.");
    }

    try {
        // Draw cards into play
        const newCard = await functions.drawCard(deck_id, 1)
        
        // Place draw cards into player hand
        playerHand = functions.cardToHand(playerHand, newCard);
        
        // Converts card data from the response into a readable "Value Suit" string format.   
        const playerHandString = functions.cardsToStrings(playerHand);
        const dealerHandString = functions.cardsToStrings(dealerHand);
        
         // Print cards in play of the Dealer & Player
         console.log(`* Cards In PLAY *\nDealer Cards: ${dealerHandString}.\nPlayer Cards: ${playerHandString}.`);     
        
         results = functions.check(playerHand, dealerHand);

        // Update deck_info
        deck_info = await functions.updateDeck_info(deck_id);

        res.render("index.ejs", {deck_info, playerHand, dealerHand, results});
    } catch (error) {
        console.error('- Error drawing cards: \n', error);
        res.status(500).send("An error occurred while drawing cards.");
    }
});

// Route to reset the game and start a new round
app.get("/shuffle", async (req, res) => {
    try {
          // Reset deck.        
        const response = await axios(`https://deckofcardsapi.com/api/deck/${deck_id}/shuffle/`);
        deck_info = response.data        

        // Rest hands
        playerHand = [];
        dealerHand = [];

        // Deals cards
        console.log("Redirecting to ./")
        res.redirect("/");

    } catch (error) {
        console.error("Error resetting the game:", error);
        res.status(500).send("An error occurred while resetting the game.");
    }

});

app.get("/stay", async (req, res) => {
    try {
        let dealerLogic = true;

        while (dealerLogic) {
            // Update dealer logic
            dealerLogic = functions.dealerLogic(playerHand, dealerHand); 
            
            // Exit loop if dealer logic is false
            if (!dealerLogic) continue; 
            
            // Add a new card to the dealer's hand
            const newCard = await functions.drawCard(deck_id, dealerLogic);        
            dealerHand = functions.cardToHand(dealerHand, newCard);
        }

        // Determine results and render the page
        results = functions.check(playerHand, dealerHand);
        res.render("index.ejs", {deck_info, playerHand, dealerHand, results});

    } catch (error) {
        console.error("Error staying the game:", error);
        res.status(500).send("An error occurred while staying the game.");
    }
  
})


// Start the server after initializing the deck.
app.listen(port, () => {
    console.log(`Listening on ${port}, http://localhost:${port}`);
});
