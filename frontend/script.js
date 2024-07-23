let map;
// Add your Javascript code here
const CAPITAL_SELECTOR = document.querySelector("#capital-selector");
const displayMapImage = (fetchedCountry) => {
    console.log(fetchedCountry);
    if (map !== undefined) {
        map.remove();
    }
    const mapControls = {
        center: fetchedCountry.capitalInfo.latlng,
        zoom: 8,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
    };
    map = new L.map("map", mapControls);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    L.marker(fetchedCountry.capitalInfo.latlng).addTo(map);
};
async function fetchUrl(url) {
    const response = await fetch(url);
    return await response.json();
}
const showCountryList = (capitalList) => {
    CAPITAL_SELECTOR.innerHTML += capitalList
        .reduce((acc, capital) => {
            capital.capitals.forEach((city) => {
                acc.push(
                    `<option id = "${capital.cca3}">${city}[${capital.name.common}]</option>`
                );
            });
            return acc;
        }, [])
        .sort((currentCapital, nextCapital) =>
            currentCapital.slice(currentCapital.indexOf(">"),currentCapital.indexOf("[")-1 ).localeCompare(nextCapital.slice(currentCapital.indexOf(">"),currentCapital.indexOf("[")-1))
        )
        .join("");
};

const mainFunction = async () => {
    const allCapitals = await fetchUrl(
        "https://jvvkjy8utk.execute-api.eu-central-1.amazonaws.com/tourist/api/countries/all"
    );
    showCountryList(allCapitals);

    console.log(allCapitals);
};

mainFunction();
async function fetchCountryDetails(countryCode) {
    const countryUrl = `https://jvvkjy8utk.execute-api.eu-central-1.amazonaws.com/tourist/api/countries/by-cca3/${countryCode}`;
    console.log(await fetchUrl(countryUrl));
    return await fetchUrl(countryUrl);
}
const showBorderList = async (selectedCountry) => {
    document.getElementById("border-list").innerHTML = "";
    selectedCountry.borders.forEach(async (borderingCountryCCA3) => {
        const country = await fetchUrl(
            `https://jvvkjy8utk.execute-api.eu-central-1.amazonaws.com/tourist/api/countries/by-cca3/${borderingCountryCCA3}`
        );
        const liElement = document.createElement("li");
        liElement.id = country.cca3;
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
    <img src="${data.current.condition.icon}" alt="Current weather picture.">
    </p>
    <p>Wind: ${data.current.wind_kph} km/h Direction: ${data.current.wind_dir}</p>
    `;
}

async function displayCurrency(country) {
    const selectedCountry = country;
    const weatherDetails = document.getElementById("weather-details");
    const currencyDiv = document.createElement("div");
    currencyDiv.id = "currency-div";

    const currencyKeys = Object.keys(selectedCountry.currencies).join(",");
    currencyDiv.innerHTML = `
    <p>Country's ${
        Object.keys(selectedCountry.currencies).length > 1
            ? "currencies"
            : "currency"
    }: <span id = "current-currency">${currencyKeys}</span>
    </p><p>Exchange currency: 1 ${currencyKeys} =  <span id = "exchange-rate">1</span> <select name="" id="currency-selector"><option value="" selected disabled hidden>${
        Object.keys(selectedCountry.currencies)[0]
    }</option></select> </p>`;
    weatherDetails.insertAdjacentElement("beforeend", currencyDiv);
    const data = await fetchUrl(
        `https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_xKOTM3edtp3pi9q1hYzVP3vTpUGtG8nfutNDKJJs&base_currency=${Object.keys(selectedCountry.currencies)[0]}`
    );
    console.log("data keys: ", Object.keys(data.data));
    console.log("data:", Object.values(data)[0]);
    for (const key in Object.values(data)[0]) {
        document.querySelector(
            "#currency-selector"
        ).innerHTML += `<option>${key}</option>`;
    }
}
// "https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_xKOTM3edtp3pi9q1hYzVP3vTpUGtG8nfutNDKJJs&base_currency=${curencyCode}&currencies=USD,GBP,EUR"
//

async function showExchangeRate(currencyCode) {
    const currentCurrency = document.getElementById('current-currency')
    const data = await fetchUrl(`https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_xKOTM3edtp3pi9q1hYzVP3vTpUGtG8nfutNDKJJs&base_currency=${currentCurrency.textContent}&currencies=${currencyCode}`)
    console.log(data.data[currencyCode]);
    const exchangeRate = data.data[currencyCode]
    const spanEl = document.getElementById('exchange-rate')
    spanEl.textContent = exchangeRate
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
            .querySelectorAll(".navigation-container button")
            .forEach((btn) => (btn.disabled = false));
        const changedIndex =
            selector === "prev-btn" ? optionIndex - 1 : optionIndex + 1;
        fetchWeatherDetails(CAPITAL_SELECTOR[changedIndex].value);
        CAPITAL_SELECTOR.value = CAPITAL_SELECTOR[changedIndex].value;
        console.log(CAPITAL_SELECTOR[changedIndex]);
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
            console.log("asd", country);
            showBorderList(country);
            displayCurrency(country);
            displayMapImage(country);
        });
    }
   if (event.target.id ==='currency-selector') {
    console.log("event target value:",event.target.value);
    showExchangeRate(event.target.value)
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
});
