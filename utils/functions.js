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

// Adjusts hand values to account for Aces
function adjustForAces(handValues) {
    let total = handValues.reduce((acc, curr) => acc + curr, 0);
    let aceCount = handValues.filter(value => value === 11).length;

    while (total > 21 && aceCount > 0) {
        total -= 10;
        aceCount--;
    }

    return total;
}

// Converts a hand of cards into an array of numeric values.
// Converts card objects into numeric values (uses adjustForAces optionally)
function cardsToArray(hand) {
    try {
        const handValues = hand.map(card => {
            if (card.value === "ACE") return 11;
            if (["JACK", "QUEEN", "KING"].includes(card.value)) return 10;
            return Number(card.value);
        });
        return handValues; // Or use: return adjustForAces(handValues);
    } catch (error) {
        console.error("* Error converting cards to array: **\n", error);
        return [];
    }
}

// Evaluates the game state by comparing the player's and dealer's hands.
// Checks for blackjack, busts, and determines the winner.
// Game state evaluation
function check(playerHand, dealerHand) {
    try {
        const playerHandValues = cardsToArray(playerHand);
        const dealerHandValues = cardsToArray(dealerHand);

        const playerTotal = adjustForAces(playerHandValues);
        const dealerTotal = adjustForAces(dealerHandValues);

        if (dealerTotal === 21 && dealerHand.length === 2) {
            return "Dealer has Blackjack";
        } else if (playerTotal === 21 && playerHand.length === 2) {
            return "Blackjack! Player Wins!";
        } else if (playerTotal > 21) {
            return "Player Busts and Loses The Bet.";
        } else if (dealerTotal > 21) {
            return "Dealer Busts. Player wins.";
        } else if (playerTotal > dealerTotal) {
            return "Player Wins!";
        } else if (playerTotal < dealerTotal) {
            return "Dealer Wins";
        } else {
            return "Push. Player's bet is returned.";
        }
    } catch (error) {
        console.error("* Error checking game state: *\n", error);
    }
}

function dealerLogic(playerHand, dealerHand) {
    try {

    const dealerHandValues = cardsToArray(dealerHand);
    const playerHandValues = cardsToArray(playerHand);

    // Calculate the total value of players' hand.
    const dealerTotal = dealerHandValues.reduce((acc, curr) => acc + curr, 0);
    const playerTotal = playerHandValues.reduce((acc, curr) => acc + curr, 0);

    if (dealerTotal >= 17 || playerTotal > 21) {
        console.log("+ Dealer: Stay");        
        return 0; // Always stand on soft 17 or higher.
    } else {
        console.log("+ Dealer: Hit");
        return  1; // Hit if the dealer's card is weak.
    }
    
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



