// Add your Javascript code here
//#capital-city
const CAPITAL_SELECTOR = document.querySelector("#capital-selector"); 

async function fetchAllCapitals(url) {
    const response = await fetch(url);
    return await response.json();
}
const showCountryList = (capitalList) => {
    
    CAPITAL_SELECTOR.innerHTML += capitalList
        .reduce((acc, capital) => {
            capital.capitals.forEach((city) => {
                acc.push(`<option>${city}[${capital.name.common}]</option>`);
            });
            return acc;
        }, [])
        .sort((currentCapital, nextCapital) =>
            currentCapital.localeCompare(nextCapital)
        )
        .join("");
};

const mainFunction = async () => {
    const allCapitals = await fetchAllCapitals(
        "https://jvvkjy8utk.execute-api.eu-central-1.amazonaws.com/tourist/api/countries/all"
    );
    showCountryList(allCapitals);
    console.log(allCapitals);
};

mainFunction();

async function fetchCountryDetails(countryName) {
    const name = countryName
        .split(" ")
        .reduce(
            (acc, str, index) =>
                (acc +=
                    index === countryName.split(" ").length - 1
                        ? `name=${str.toLowerCase()}`
                        : `name=${str.toLowerCase()}&`),
            ""
        );

    const countryUrl = `https://jvvkjy8utk.execute-api.eu-central-1.amazonaws.com/tourist/api/countries/?${name}`;
    const selectedCountry = await fetchAllCapitals(countryUrl);
    document.getElementById("border-list").innerHTML = "";
    selectedCountry.items[0].borders.forEach(async (borderingCountryCCA3) => {
        const country = await fetchAllCapitals(
            `https://jvvkjy8utk.execute-api.eu-central-1.amazonaws.com/tourist/api/countries/by-cca3/${borderingCountryCCA3}`
        );
        const liElement = document.createElement("li");
        liElement.textContent = country.name.common;
        document.getElementById("border-list").appendChild(liElement);
    });
}

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

window.addEventListener("input", (event) => {
    if (event.target.id === "capital-selector") {
        fetchWeatherDetails(
            event.target.value.slice(0, event.target.value.indexOf("["))
        );
        fetchCountryDetails(
            event.target.value.slice(
                event.target.value.indexOf("[") + 1,
                event.target.value.indexOf("]")
            )
        );
    }
});
const capitalChange = (selector) => {
    const optionIndex =
        CAPITAL_SELECTOR.selectedIndex;
    const selectorElement = CAPITAL_SELECTOR;
    const btnElement = document.querySelector(`#${selector}`);
    if (
        (optionIndex === 0 && selector === "prev-btn") ||
        (optionIndex === selectorElement.length - 1 && selector === "next-btn")
    ) {
        btnElement.disabled = true;
    } else {
        btnElement.disabled = false;
        const changedIndex =
            selector === "prev-btn" ? optionIndex - 1 : optionIndex + 1;
        fetchWeatherDetails(
            CAPITAL_SELECTOR[changedIndex].value
        );
        CAPITAL_SELECTOR.value =
            CAPITAL_SELECTOR[changedIndex].value;
    }
};

window.addEventListener("click", (event) => {
    if (event.target.id === "prev-btn" || event.target.id === "next-btn") {
        capitalChange(event.target.id);
    }
    if (event.target.nodeName === "LI") {
        fetchWeatherDetails(event.target.textContent);
        CAPITAL_SELECTOR.value =
            CAPITAL_SELECTOR[
                Array.from(CAPITAL_SELECTOR).find(
                    (element) =>
                        element.value.includes(`[${event.target.textContent}]`)
                ).index
            ].value;
            fetchCountryDetails(event.target.textContent)
    }
});
