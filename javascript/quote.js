 document.addEventListener("DOMContentLoaded", getStoredQuote);

      async function getStoredQuote() {
        try {
          const storedQuote = localStorage.getItem("quote");
          const storedDate = localStorage.getItem("date");

          if (storedQuote && storedDate === getCurrentDate()) {
            displayQuote(storedQuote);
          } else {
            const response = await fetch("https://api.quotable.io/random");
            const data = await response.json();
            let quoteText = data.content;
            const quoteAuthor = data.author;

            if (quoteText.length > 100) {
              while (quoteText.length > 100) {
                const newResponse = await fetch(
                  "https://api.quotable.io/random"
                );
                const newData = await newResponse.json();
                quoteText = newData.content;
              }
            }

            localStorage.setItem("quote", `${quoteText} - ${quoteAuthor}`);
            localStorage.setItem("date", getCurrentDate());

            displayQuote(`${quoteText} - ${quoteAuthor}`);
          }
        } catch (error) {
          console.error("Failed to fetch or display quote:", error);
        }
      }

      function displayQuote(quote) {
        const [quoteText, quoteAuthor] = quote.split(" - ");
        document.getElementById("quote-text").textContent = `"${quoteText}"`;
        document.getElementById(
          "quote-author"
        ).textContent = `- ${quoteAuthor}`;
      }

      function getCurrentDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }