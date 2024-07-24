let map;
// Add your Javascript code here
const CAPITAL_SELECTOR = document.querySelector("#capital-selector");
/**
 * Displays a map with markers for each country's capital.
 *
 * @param {Object} fetchedCountry - The country data for the selected country.
 * @param {Object} fetchedCountry.capitalInfo - Capital information for the selected country.
 * @param {number[]} fetchedCountry.capitalInfo.latlng - Latitude and longitude of the selected country's capital.
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

const getCountryListElement = (cca3, city, countryName) => {
    return `<option id = "${cca3}">${city}[${countryName}]</option>`;
};

const showCountryList = (countryList) => {
    let selectorOptions = countryList.flatMap(country => country.capitals.map(capital => ({
        capital: capital,
        optionElement: getCountryListElement(country.cca3,capital,country.name.common)
    })))
    //
    selectorOptions = selectorOptions.sort((currentElement, nextElement) => currentElement.capital.localeCompare(nextElement.capital))
    //
    selectorOptions = selectorOptions.map(option => option.optionElement)
    //
    selectorOptions = selectorOptions.join("")
    

    CAPITAL_SELECTOR.innerHTML = selectorOptions
};

const mainFunction = async () => {
    const allCountries = await fetchUrl(
        "https://jvvkjy8utk.execute-api.eu-central-1.amazonaws.com/tourist/api/countries/all"
    );
    showCountryList(allCountries);
};
mainFunction();
async function fetchCountryDetails(countryCode) {
    const countryUrl = `https://jvvkjy8utk.execute-api.eu-central-1.amazonaws.com/tourist/api/countries/by-cca3/${countryCode}`;
    return await fetchUrl(countryUrl);
}
const showBorderList = async (selectedCountry) => {
    document.getElementById("border-list").innerHTML = "";
    document.getElementById("border-list").innerHTML =
        "<h4>Neighbouring countries:</h4>";

    if (selectedCountry.borders.length === 0) {
        document.getElementById("border-list").innerHTML +=
            "<p>No neighbouring countries</p>";
    }
    selectedCountry.borders.forEach(async (borderingCountryCCA3) => {
        const country = await fetchUrl(
            `https://jvvkjy8utk.execute-api.eu-central-1.amazonaws.com/tourist/api/countries/by-cca3/${borderingCountryCCA3}`
        );
        const liElement = document.createElement("li");
        liElement.id = country.cca3;
        liElement.classList =
            "cursor-pointer w-[fit-content] list-disc text-green hover:underline";
        liElement.textContent = country.name.common;
        document.getElementById("border-list").appendChild(liElement);
    });
};

async function fetchWeatherDetails(cityName) {
    fetch(
        `https://api.weatherapi.com/v1/current.json?key=6ce7a0152aa640eb91b144442242107&q=${cityName}`
    )
        .then((response) => response.json())
        .then((data) => {
            display(data);
        });
}

function display(data) {
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
 * @param {Object} country.currencies - The currencies object for the country.
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
async function displayCurrency(country) {
    const selectedCountry = country;
    const currencyDiv = document.querySelector("#currency-div");
    const currencyKeys = Object.keys(selectedCountry.currencies).join(",");
    const currencyWord =
        Object.keys(selectedCountry.currencies).length > 1
            ? "currencies"
            : "currency";
    currencyDiv.innerHTML = `
    <p>Country's ${currencyWord}: <span id = "current-currency">${currencyKeys}</span>
    </p>`
    document.querySelector("#currency-div").innerHTML += `<p>Exchange currency: 1 ${currencyKeys} =  <span id = "exchange-rate">1</span> <select name="" id="currency-selector" class="bg-green text-sm rounded-lg text-white"><option value="" selected disabled hidden>${Object.keys(selectedCountry.currencies)[0]
        }</option></select> </p>`;
    fetchCurrencyData(selectedCountry);
}

async function showExchangeRate(currencyCode) {
    const currentCurrency = document.getElementById("current-currency");
    const data = await fetchUrl(
        `https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_xKOTM3edtp3pi9q1hYzVP3vTpUGtG8nfutNDKJJs&base_currency=${currentCurrency.textContent}&currencies=${currencyCode}`
    );
    const exchangeRate = data.data[currencyCode];
    const spanEl = document.getElementById("exchange-rate");
    spanEl.textContent = exchangeRate;
}

const capitalChange = (selector) => {
    const optionIndex = CAPITAL_SELECTOR.selectedIndex;
    const selectorElement = CAPITAL_SELECTOR;
    const btnElement = document.querySelector(`#${selector}`);
    if (
        (optionIndex === 1 && selector === "prev-btn") ||
        (optionIndex === selectorElement.length - 1 && selector === "next-btn")
    ) {
        btnElement.disabled = true;
    } else {
        document
            .querySelectorAll("#navigation-container button")
            .forEach((btn) => (btn.disabled = false));
        const changedIndex =
            selector === "prev-btn" ? optionIndex - 1 : optionIndex + 1;
        fetchWeatherDetails(CAPITAL_SELECTOR[changedIndex].value);
        CAPITAL_SELECTOR.value = CAPITAL_SELECTOR[changedIndex].value;
        fetchCountryDetails(CAPITAL_SELECTOR[changedIndex].id).then(
            (country) => {
                showBorderList(country);
                displayCurrency(country);
                displayMapImage(country);
            }
        );
    }
};
window.addEventListener("input", (event) => {
    if (event.target.id === "capital-selector") {
        fetchWeatherDetails(
            event.target.value.slice(0, event.target.value.indexOf("["))
        );
        fetchCountryDetails(
            CAPITAL_SELECTOR[event.target.selectedIndex].id
        ).then((country) => {
            document.querySelector("#flag").src = country.flags.png
            showBorderList(country);
            displayCurrency(country);
            displayMapImage(country);
        });
    }
    if (event.target.id === "currency-selector") {
        showExchangeRate(event.target.value);
    }
});
window.addEventListener("click", (event) => {
    if (event.target.id === "prev-btn" || event.target.id === "next-btn") {
        capitalChange(event.target.id);
    }
    if (event.target.nodeName === "LI") {
        fetchWeatherDetails(event.target.textContent);
        CAPITAL_SELECTOR.value =
            CAPITAL_SELECTOR[
                Array.from(CAPITAL_SELECTOR).find((element) =>
                    element.value.includes(`[${event.target.textContent}]`)
                ).index
            ].value;
        fetchCountryDetails(event.target.id).then((country) => {
            showBorderList(country);
            displayCurrency(country);
            displayMapImage(country);
        });
    }
    if (event.target.classList.contains("leaflet-marker-icon")) {
        fetchWeatherDetails(event.target.classList[1]);
        CAPITAL_SELECTOR.value =
            CAPITAL_SELECTOR[
                Array.from(CAPITAL_SELECTOR).find(
                    (element) => element.id === event.target.classList[1]
                ).index
            ].value;
        fetchCountryDetails(event.target.classList[1]).then((country) => {
            showBorderList(country);
            displayCurrency(country);
            displayMapImage(country);
        });
    }
});
