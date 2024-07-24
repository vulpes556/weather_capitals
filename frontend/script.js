let map;
// Add your Javascript code here
const CAPITAL_SELECTOR = document.querySelector("#capital-selector");
/**
 * Displays a map with markers for each country's capital.
 *
 * @param {Object} fetchedCountry - The country data for the selected country.
 */
const displayMapImage = (fetchedCountry) => {
    // Remove existing map if it exists
    if (map !== undefined) {
        map.remove();
    }
    // Extract markers from geoDataCountries
    const markers = geoDataCountries.reduce((acc, country) => {
        if (country.capital && country.capitalInfo.latlng) {
            acc.push([country.cca3, country.capitalInfo.latlng]);
        }
        return acc;
    }, []);
    // Map control settings
    const mapControls = {
        center: fetchedCountry.capitalInfo.latlng,
        zoom: 8,
        zoomControl: false,
        scrollWheelZoom: true,
        dragging: true,
        doubleClickZoom: false,
        worldCopyJump: true,
    };

    // Initialize the map
    map = new L.map("map", mapControls);

    // Add tile layer to the map
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add markers to the map
    markers.forEach(([cca3, latlng]) => {
        const banana_cat = L.icon({
            iconUrl: "./banana_cat.png",
            iconSize: [70, 70], // size of the icon
            iconAnchor: [70, 70], // point of the icon which will correspond to marker's location
            popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
            className: `${cca3}`,
        });
        L.marker(latlng, { icon: banana_cat }).addTo(map);
    });
};
/**
 * Fetches and returns JSON data from the given URL.
 *
 * @param {string} url - The URL to fetch data from.
 * @returns {Promise<Object>} - A promise that resolves to the JSON data.
 */
async function fetchUrl(url) {
    // Fetch the response from the URL
    const response = await fetch(url);

    // Parse the response as JSON and return
    return await response.json();
}

/**
 * Generates an HTML <option> element string for a country.
 *
 * @param {string} cca3 - The three-letter country code.
 * @param {string} city - The name of the city.
 * @param {string} countryName - The name of the country.
 * @returns {string} The HTML string for the <option> element.
 */
const getCountryListElement = (cca3, city, countryName) => {
    // Create and return the HTML string for an <option> element
    return `<option id = "${cca3}">${city}[${countryName}]</option>`;
};

/**
 * Generates and displays a sorted list of HTML <option> elements for countries and their capitals.
 *
 * @param {Array} countryList - An array of country objects, where each object contains:
 */
const showCountryList = (countryList) => {
    // Create an array of objects, each containing a capital city and its corresponding <option> element
    let selectorOptions = countryList.flatMap(country => country.capitals.map(capital => ({
        capital: capital,
        optionElement: getCountryListElement(country.cca3,capital,country.name.common)
    })))

    // Sort the array of objects by the capital city name
    selectorOptions = selectorOptions.sort((currentElement, nextElement) => currentElement.capital.localeCompare(nextElement.capital))

    // Extract only the <option> element strings from the sorted array
    selectorOptions = selectorOptions.map(option => option.optionElement)

    // Join the <option> element strings into a single string
    selectorOptions = selectorOptions.join("")

    // Set the innerHTML of the CAPITAL_SELECTOR element to the generated <option> elements string
    CAPITAL_SELECTOR.innerHTML = selectorOptions
};

/**
 * Fetches the details of a country using its three-letter country code.
 *
 * @param {string} countryCode - The three-letter country code.
 * @returns {Promise<Object>} A promise that resolves to the country details object.
 */
async function fetchCountryDetails(countryCode) {
    // Construct the API URL using the provided country code
    const countryUrl = `https://jvvkjy8utk.execute-api.eu-central-1.amazonaws.com/tourist/api/countries/by-cca3/${countryCode}`;

    // Fetch and return the country details from the API
    return await fetchUrl(countryUrl);
}

/**
 * Displays the list of bordering countries for the selected country.
 *
 * @param {Object} selectedCountry - The selected country object containing:
 */
const showBorderList = async (selectedCountry) => {
    // Clear the existing border list
    document.getElementById("border-list").innerHTML = "";
    document.getElementById("border-list").innerHTML =
        "<h4>Neighbouring countries:</h4>";

    // If there are no bordering countries, display a message
    if (selectedCountry.borders.length === 0) {
        document.getElementById("border-list").innerHTML +=
            "<p>No neighbouring countries</p>";
        return; // Exit the function early
    }

    // Fetch details for each bordering country and add them to the border list
    selectedCountry.borders.forEach(async (borderingCountryCCA3) => {
        // Fetch the bordering country details from the API
        const country = await fetchUrl(
            `https://jvvkjy8utk.execute-api.eu-central-1.amazonaws.com/tourist/api/countries/by-cca3/${borderingCountryCCA3}`
        );

        // Create a list item element for the bordering country
        const liElement = document.createElement("li");
        liElement.id = country.cca3;
        liElement.className =
            "cursor-pointer w-[fit-content] list-disc text-green hover:underline";
        liElement.textContent = country.name.common;

        // Append the list item to the border list
        document.getElementById("border-list").appendChild(liElement);
    });
};

/**
 * Fetches the current weather details for a given city.
 *
 * @param {string} cityName - The name of the city to fetch weather details for.
 * @returns {Promise<void>} A promise that resolves when the weather details have been fetched and displayed.
 */
async function fetchWeatherDetails(cityName) {
    const weatherUrl = `https://api.weatherapi.com/v1/current.json?key=6ce7a0152aa640eb91b144442242107&q=${cityName}`;
    fetch(weatherUrl)
        .then((response) => response.json())
        .then((data) => {
            displayWeatherDetails(data);
        });
}

/**
 * Displays the weather details on the webpage.
 *
 * @param {Object} data - The weather data object containing:
 */
function displayWeatherDetails(data) {
    const weatherDetails = document.getElementById("weather-details");
    weatherDetails.innerHTML = `<h2>City's Name: ${data.location.name}</h2> 
    <p>Temperature: ${data.current.temp_c} °C</p>
    <p>Weather Condition: ${data.current.condition.text}
    </p>
    <div class = "flex flex-col items-center content-center"><img src="${data.current.condition.icon}" alt="Current weather picture."></div>
    <p>Wind: ${data.current.wind_kph} km/h Direction: ${data.current.wind_dir}</p>
    `;
}

/**
 * Fetches currency data for a given country and updates the currency selector.
 *
 * @param {Object} country - The country data.
 */
const fetchCurrencyData = (country) => {
    // Construct the API URL using the first currency code from the country object
    const baseCurrency = Object.keys(country.currencies)[0];
    const apiUrl = `https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_xKOTM3edtp3pi9q1hYzVP3vTpUGtG8nfutNDKJJs&base_currency=${baseCurrency}`;

    // Fetch the latest currency data from the API
    fetch(apiUrl)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
        })
        .then((currencies) => {
            if (!currencies) return;

            // Select the currency selector element
            const currencySelector = document.querySelector("#currency-selector");

            //Populating the options string with the all the currencies
            let options = ""
            for (const key in currencies.data) {
                options += `<option>${key}</option>`;
            }

            //Changing the current currencySelectors innerHtml to the new options
            currencySelector.innerHTML = options
        })
        .catch((err) => console.log(err));
};
/**
 * Displays the currency information for a given country.
 *
 * @param {Object} country - The country object containing currency data.
 */
async function displayCurrency(country) {
    // Store the selected country in a constant variable
    const selectedCountry = country;

    // Select the HTML element where currency information will be displayed
    const currencyDiv = document.querySelector("#currency-div");

    // Get the currency keys (currency codes) and join them into a string
    const currencyKeys = Object.keys(selectedCountry.currencies).join(",");

    // Determine if the country has multiple currencies
    const currencyWord =
        Object.keys(selectedCountry.currencies).length > 1
            ? "currencies"
            : "currency";

    // Set the inner HTML of the currencyDiv to display the currency information
    currencyDiv.innerHTML = `
    <p>Country's ${currencyWord}: <span id = "current-currency">${currencyKeys}</span>
    </p>`

    // Append additional HTML for the exchange rate and currency selector
    currencyDiv.innerHTML += `<p>Exchange currency: 1 ${currencyKeys} =  <span id = "exchange-rate">1</span> <select name="" id="currency-selector" class="bg-green text-sm rounded-lg text-white"><option value="" selected disabled hidden>${Object.keys(selectedCountry.currencies)[0]
        }</option></select> </p>`;

    // Fetch and display currency exchange data
    fetchCurrencyData(selectedCountry);
}


/**
 * Fetches and displays the exchange rate for the given currency code.
 *
 * @param {string} currencyCode - The currency code to get the exchange rate for.
 */
async function showExchangeRate(currencyCode) {
    // Get the current currency code from the HTML element
    const currentCurrency = document.getElementById("current-currency");

    // Fetch the exchange rate data from the API
    const data = await fetchUrl(
        `https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_xKOTM3edtp3pi9q1hYzVP3vTpUGtG8nfutNDKJJs&base_currency=${currentCurrency.textContent}&currencies=${currencyCode}`
    );

    // Extract the exchange rate from the fetched data
    const exchangeRate = data.data[currencyCode];

    // Select the HTML element to display the exchange rate
    const spanEl = document.getElementById("exchange-rate");

    // Set the exchange rate in the selected HTML element
    spanEl.textContent = exchangeRate;
}


/**
 * Handles the change of capital city based on the selected option and button clicked.
 *
 * @param {string} selector - The ID of the button that was clicked ('prev-btn' or 'next-btn').
 */
const capitalChange = (selector) => {
    // Get the index of the currently selected option in the capital selector
    const optionIndex = CAPITAL_SELECTOR.selectedIndex;

    // Reference to the capital selector element
    const selectorElement = CAPITAL_SELECTOR;

    // Reference to the button element that was clicked
    const btnElement = document.querySelector(`#${selector}`);

    // Disable the button if it's the first option and 'prev-btn' is clicked,
    // or if it's the last option and 'next-btn' is clicked
    if (
        (optionIndex === 1 && selector === "prev-btn") ||
        (optionIndex === selectorElement.length - 1 && selector === "next-btn")
    ) {
        btnElement.disabled = true;
    } else {
        // Enable all navigation buttons
        document
            .querySelectorAll("#navigation-container button")
            .forEach((btn) => (btn.disabled = false));

        // Calculate the new index based on the button clicked
        const changedIndex =
            selector === "prev-btn" ? optionIndex - 1 : optionIndex + 1;

        // Display the selected capital
        displayCat(
            "BUTTON",
            CAPITAL_SELECTOR[changedIndex].value,
            CAPITAL_SELECTOR[changedIndex].id
        );

        // Modify the capital selector with the new value
        capitalSelectorModifier(true, CAPITAL_SELECTOR[changedIndex].value);
    }
};

/**
 * Modifies the capital selector based on the provided parameters.
 *
 * @param {boolean} isButton - Indicates if the change is triggered by a button click.
 * @param {string} targetText - The target value or ID to set in the capital selector.
 */
const capitalSelectorModifier = (isButton, targetText) => {
    if (isButton) {
        // Set the capital selector's value to the targetText if triggered by a button click
        CAPITAL_SELECTOR.value = targetText;
    } else {
        // Set the capital selector's value based on the targetText
        CAPITAL_SELECTOR.value =
            CAPITAL_SELECTOR[
                // Find the index of the option element that includes the targetText or matches the target ID
                Array.from(CAPITAL_SELECTOR).find(
                    (element) =>
                        element.value.includes(`[${targetText}]`) ||
                        element.id === targetText
                ).index
            ].value;
    }
}

/**
 * Adds a blinking effect to the map and content details elements.
 */
const blinking = () => {
    // Select the map element and add the 'blinking' class
    const map = document.querySelector("#map");
    map.classList.add("blinking");

    // Select the content details element and add the 'blinking' class
    const contentDetails = document.querySelector("#content-details");
    contentDetails.classList.add("blinking");

    // Remove the 'blinking' class from both elements after 1 second
    setTimeout(() => {
        map.classList.remove("blinking");
        contentDetails.classList.remove("blinking");
    }, 1000);
}

/**
 * Displays the selected capital's details by fetching relevant data and updating the UI.
 *
 * @param {string} nodeName - The type of HTML element that triggered the event (e.g., "BUTTON", "SELECT").
 * @param {string} targetText - The target text value to be used for fetching weather details.
 * @param {string} targetId - The target ID to be used for fetching country details.
 */
const displayCat = (nodeName, targetText, targetId) => {
    // Fetch weather details for the target text
    fetchWeatherDetails(targetText);

    // If the nodeName is "SELECT", update the targetId using the selected index
    if (nodeName === "SELECT") {
        targetId = CAPITAL_SELECTOR[targetId].id;
    }

    // Fetch country details using the target ID
    fetchCountryDetails(targetId).then((country) => {
        // Update the flag image source with the country's flag
        document.querySelector("#flag").src = country.flags.png;

        // Add a blinking effect to the map and content details elements
        blinking();

        // Show the list of bordering countries
        showBorderList(country);

        // Display the country's currency details
        displayCurrency(country);

        // Display the map image of the country
        displayMapImage(country);
    });
};
/**
 * Main function to fetch and display a list of all countries.
 */
const mainFunction = async () => {
    // Fetch the list of all countries from the API
    const allCountries = await fetchUrl(
        "https://jvvkjy8utk.execute-api.eu-central-1.amazonaws.com/tourist/api/countries/all"
    );

    // Display the list of fetched countries
    showCountryList(allCountries);
};
mainFunction();

// Add an input event listener to the window object
window.addEventListener("input", (event) => {
    // Check if the input event is triggered by the element with id 'capital-selector'
    if (event.target.id === "capital-selector") {
        // Call displayCat function with the nodeName, the selected value (up to the first '['), and the selected index
        displayCat(
            event.target.nodeName,
            event.target.value.slice(0, event.target.value.indexOf("[")),
            event.target.selectedIndex
        );
    }

    // Check if the input event is triggered by the element with id 'currency-selector'
    if (event.target.id === "currency-selector") {
        // Call showExchangeRate function with the selected value
        showExchangeRate(event.target.value);
    }
});

// Add a click event listener to the window object
window.addEventListener("click", (event) => {
    // Check if the clicked element is the previous or next button
    if (event.target.id === "prev-btn" || event.target.id === "next-btn") {
        // Call capitalChange function with the button ID
        capitalChange(event.target.id);
    }

    // Check if the clicked element is a list item (LI)
    if (event.target.nodeName === "LI") {
        // Call displayCat function with the nodeName, textContent, and ID of the clicked element
        displayCat(
            event.target.nodeName,
            event.target.textContent,
            event.target.id
        );
        // Modify the capital selector without using a button
        capitalSelectorModifier(false, event.target.textContent);
    }

    // Check if the clicked element has the class 'leaflet-marker-icon'
    if (event.target.classList.contains("leaflet-marker-icon")) {
        // Call displayCat function with the nodeName, and the classList's second item as both targetText and targetId
        displayCat(
            event.target.nodeName,
            event.target.classList[1],
            event.target.classList[1]
        );
        // Modify the capital selector without using a button
        capitalSelectorModifier(false, event.target.textContent);
    }
});

