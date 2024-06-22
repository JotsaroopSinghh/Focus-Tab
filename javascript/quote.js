document.addEventListener("DOMContentLoaded", getStoredQuote);

async function getStoredQuote() {
    try {
        const storedQuote = localStorage.getItem("quote");
        const storedDate = localStorage.getItem("date");

        if (storedQuote && storedDate === getCurrentDate()) {
            displayQuote(storedQuote);
        } else {
            let quoteText = '';
            let quoteAuthor = '';
            do {
                const response = await fetch("https://api.quotable.io/random");
                const data = await response.json();
                quoteText = data.content;
                quoteAuthor = data.author;
            } while (quoteText.length + quoteAuthor.length > 50); 

            const fullQuote = `${quoteText} - ${quoteAuthor}`;
            localStorage.setItem("quote", fullQuote);
            localStorage.setItem("date", getCurrentDate());

            displayQuote(fullQuote);
        }
    } catch (error) {
        console.error("Failed to fetch or display quote:", error);
    }
}

function displayQuote(quote) {
    document.getElementById("quote-text").textContent = quote;
}

function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
