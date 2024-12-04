import axios from "axios";

// Test function to ensure the file is correctly imported and accessible.
function test() {
    console.log("TEST FUNCTION");
}

// Converts an array of card objects into a readable string format of "Value Suit".
function cardsToStrings(cards) {
    try {
        const result = cards.map(card => `${card.value} ${card.suit}`).join(", ");
        return result;
    } catch (error) {
        console.error("* Error converting cards to strings: *\n", error);
        return ""; // Return an empty string in case of error.
    }
}

// Fetches the current state of the deck from the API using the deck ID.
async function updateDeck_info(deck_id) {
    try {
        const response = await axios(`https://deckofcardsapi.com/api/deck/${deck_id}`);
        return response.data; // Returns updated deck information (e.g., remaining cards).
    } catch (error) {
        console.error("* Error updating deck info: *\n", error);
        throw error; // Rethrow the error to handle it further up if needed.
    }
}

// Initializes a new deck, shuffles it, and returns the deck information.
async function initializeDeck() {
    try {
        const response = await axios("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
        return response.data; // Contains deck ID, shuffled state, and remaining cards.;
    } catch (error) {
        console.error("* Error initializing deck: *\n", error);
        throw error; // Exits the process or rethrows the error for higher-level handling.
    }
}

// Draws a specified number of cards from the deck using the deck ID.
async function drawCard(deck_id, amountTodraw) {
    try {
        const response = await axios(`https://deckofcardsapi.com/api/deck/${deck_id}/draw/?count=${amountTodraw}`);
        return response.data.cards; // Returns the drawn cards as an array of card objects.
    } catch (error) {
        console.error("* Error drawing cards: *\n", error);
        throw error; // Rethrow for handling by the caller.
    }
}

// Adds an array of drawn cards to a player's hand.
function cardToHand(playerHand, cards) {
    try {
        playerHand.push(...cards); // Adds each card to the player's hand array.
        return playerHand; // Returns the updated hand.
    } catch (error) {
        console.error("*Error adding cards to hand: *\n", error);
        return playerHand; // Return the original hand in case of error.
    }
}

// Converts a hand of cards into an array of numeric values.
// Face cards (JACK, QUEEN, KING) are worth 10, ACE is worth 11, and others match their face value.
function cardsToArray(hand) {
    try {
        const handValues = hand.map(card => {
            if (card.value === "ACE") {
                return 11; // Ace is worth 11 by default (can be adjusted later in the game logic).
            } else if (card.value === "JACK" || card.value === "QUEEN" || card.value === "KING") {
                return 10; // Face cards are worth 10.
            } else {
                return Number(card.value); // Numeric cards are converted to numbers.
            }
        });
        return handValues; // Returns an array of numeric values.
    } catch (error) {
        console.error("* Error converting cards to array:  **\n", error);
        return []; // Return an empty array in case of error.
    }
}

// Evaluates the game state by comparing the player's and dealer's hands.
// Checks for blackjack, busts, and determines the winner.
function check(playerHand, dealerHand) {
    try {
        var result;

        // Convert hands to numeric value arrays.
        const playerHandValues = cardsToArray(playerHand);
        const dealerHandValues = cardsToArray(dealerHand);

        // Calculate the total value of each hand.
        const playerHandValuesTotal = playerHandValues.reduce((acc, curr) => acc + curr, 0);
        const dealerHandValuesTotal = dealerHandValues.reduce((acc, curr) => acc + curr, 0);

        console.log("Dealer hand values:", dealerHandValuesTotal);
        console.log("Player hand values:", playerHandValuesTotal);

        // Check game conditions and log the results.
        if (dealerHandValuesTotal === 21 && dealerHandValuesTotal.length === 2) {
            result = "Dealer has Blackjack. If player took insurance, it pays 2:1.";
        } else if (playerHandValuesTotal === 21 && playerHandValuesTotal.length === 2) {
            result = "Blackjack! Player wins 1.5 times the bet unless dealer also has Blackjack.";
        } else if (playerHandValuesTotal > 21) {
            result = "Player busts and loses the bet.";
        } else if (dealerHandValuesTotal > 21) {
            result = "Dealer busts. Player wins.";
        } else if (playerHandValuesTotal > dealerHandValuesTotal) {
            result = "Player wins.";
        } else if (playerHandValuesTotal < dealerHandValuesTotal) {
            result = "Dealer wins.";
        } else {
            result = "Push. Player's bet is returned.";
        }      
        console.log(result);  
        
        return result;

    } catch (error) {
        console.error("* Error checking game state: *\n", error);
    }
}

function dealerLogic(playerHand, dealerHand) {
    try {

    const dealerHandValues = cardsToArray(dealerHand);

    // Calculate the total value of players' hand.
    const dealerHandValuesTotal = dealerHandValues.reduce((acc, curr) => acc + curr, 0);

    var result;
    if (dealerHandValuesTotal >= 17 || playerHand > 21) {
        result = 0; // Always stand on soft 17 or higher.
        console.log("+ Dealer: Stay");        
    } else {
        result = 1; // Hit if the dealer's card is weak.
        console.log("+ Dealer: Hit");
    }

    return result;
    
    } catch (error) {
        console.error("* Error checking dealLogic state: *\n", error);

    }
    
    
}

// Export all the functions to use them in other files.
export default {
    test,              // Test function to verify module import.
    cardsToStrings,    // Converts card objects into readable strings.
    updateDeck_info,   // Updates deck state from the API.
    initializeDeck,    // Initializes and shuffles a new deck.
    drawCard,          // Draws cards from the deck.
    cardToHand,        // Adds drawn cards to a player's hand.
    cardsToArray,      // Converts a hand into numeric values.
    check,             // Evaluates and logs the game state.
    dealerLogic
};



