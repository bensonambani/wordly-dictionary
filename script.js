
// Get HTML elements
const searchForm = document.getElementById("searchForm");
const wordInput = document.getElementById("wordInput");
const results = document.getElementById("results");
const message = document.getElementById("message");
const favoritesContainer = document.getElementById("favorites");
const themeToggle = document.getElementById("themeToggle");

// Load saved favorite words
let favorites = JSON.parse(
    localStorage.getItem("wordlyFavorites") || "[]"
);

// Search form event listener
searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const word = wordInput.value.trim().toLowerCase();

    if (!word) {
        message.textContent = "Please enter a word.";
        return;
    }

    searchWord(word);
});

// Search for a word using Dictionary API
async function searchWord(word) {
    results.innerHTML = "";
    message.textContent = "Searching for word...";

    try {
        const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
        );

        if (!response.ok) {
            throw new Error(
                response.status === 404
                    ? "Word not found. Please try another word."
                    : "Unable to connect to the dictionary API."
            );
        }

        const data = await response.json();

        displayWord(data[0]);

        message.textContent = "Word found successfully!";

    } catch (error) {
        results.innerHTML = "";
        message.textContent = error.message;
    }
    let html = `
        <div class="word-card">

            <h2>${escapeHTML(word)}</h2>

            <p><strong>Pronunciation:</strong>
            ${escapeHTML(phonetic)}</p>

            <button id="favoriteButton">
                ⭐ Save Favorite
            </button>

            ${audio ? `
                <button id="audioButton">
                    🔊 Play Audio
                </button>
            ` : ""}

    `;

    data.meanings.forEach(meaning => {

        html += `
            <h3>${escapeHTML(meaning.partOfSpeech)}</h3>
        `;

        meaning.definitions.forEach(definition => {

            html += `
                <div class="definition">

                    <p><strong>Definition:</strong>
                    ${escapeHTML(definition.definition)}</p>

                    ${definition.example ? `
                        <p><strong>Example:</strong>
                        ${escapeHTML(definition.example)}</p>
                    ` : ""}

                </div>
            `;
        });

        if (meaning.synonyms.length > 0) {
            html += `
                <p><strong>Synonyms:</strong>
                ${escapeHTML(meaning.synonyms.join(", "))}</p>
            `;
        }

    });

    html += `</div>`;

    results.innerHTML = html;

    // Favorite button
    document.getElementById("favoriteButton")
        .addEventListener("click", function () {
            saveFavorite(data);
        });

    // Audio playback button
}
// Protect the page from unsafe HTMLif (audio) {
document.getElementById("audioButton")
    .addEventListener("click", async function () {

        const player = new Audio(audio);

        try {
            await player.play();
            message.textContent = "Playing pronunciation...";

            player.onended = function () {
                message.textContent = "Audio finished.";
            };

        } catch (error) {
            console.error("Audio error:", error);

            message.textContent =
                "Unable to play audio. Please try again.";
        }
    });

Atext
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

// Save favorite words
function saveFavorite(data) {

    const exists = favorites.some(
        item => item.word === data.word
    );

    if (exists) {
        message.textContent = "This word is already saved!";
        return;
    }

    favorites.push({
        word: data.word,
        definition:
            data.meanings[0].definitions[0].definition
    });

    localStorage.setItem(
        "wordlyFavorites",
        JSON.stringify(favorites)
    );

    displayFavorites();

    message.textContent = "Word saved to favorites!";
}

// Display favorite words
function displayFavorites() {

    favoritesContainer.innerHTML = "";

    if (favorites.length === 0) {
        favoritesContainer.textContent =
            "No favorite words saved yet.";
        return;
    }

    favorites.forEach(item => {

        const div = document.createElement("div");

        div.className = "favorite-item";

        const title = document.createElement("strong");
        title.textContent = item.word;

        const definition = document.createElement("p");
        definition.textContent = item.definition;

        div.append(title, definition);

        favoritesContainer.appendChild(div);
    });
}

// Dark mode functionality
themeToggle.addEventListener("click", function () {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        themeToggle.textContent = "🌙 Dark Mode";
    }

});

// Display saved favorites when page loads
displayFavorites();
