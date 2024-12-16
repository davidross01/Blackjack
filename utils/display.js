document.addEventListener("DOMContentLoaded", () => { // Wait for the DOM to fully load before running the script
    const cards = document.querySelectorAll(".card"); // Select all elements with the class "card"
    const sequence = [0, 2, 1, 3, 5, 4]; // Define the sequence in which the cards should appear (0-based index)
    if (cards.length == 4) { 
      cards.forEach((card, index) => { 
        // Set a timeout to delay the visibility of each card
        setTimeout(() => { 
          card.classList.add("show");
        }, sequence[index] * 500); 
      });
    } else {
      // If there are more than 4 cards
      cards.forEach((card, index) => { 
        // Set a timeout to delay the visibility of the last card
          if (index === cards.length - 1) { 
              setTimeout(() => { 
                card.classList.add("show");
              }, 400);
          } else { 
            // Add the "show" class to make the card visible immediately
            card.classList.add("show"); 
          }
      }); 
    }


  });
  
  document.getElementById("stay").addEventListener("click", () => {
    // Your code to execute when the button is pressed
    console.log("********Button was pressed!");
    // Add more actions here
});
  
  

