// Add your Javascript code here
//#capital-city
let allCapitals;


async function fetchAllCapitals(url){
    const response = await fetch(url)
    return await response.json()

}
const showCountryList = capitalList =>{
    document.querySelector("#capital-selector").innerHTML = capitalList.reduce((acc,capital) =>{
        capital.capitals.forEach(city => {
            acc.push(`<option>${city}[${capital.name.common}]</option>`)
        });
        return acc
    },[]).sort((currentCapital, nextCapital) => currentCapital.localeCompare(nextCapital)).join("")
} 
const mainFunction = async () =>{
    const allCapitals = await fetchAllCapitals('https://jvvkjy8utk.execute-api.eu-central-1.amazonaws.com/tourist/api/countries/all')
    showCountryList(allCapitals)
    console.log(allCapitals);
}

mainFunction()






// https://api.weatherapi.com/v1/current.json?key=6ce7a0152aa640eb91b144442242107&q=${cityName}



async function fetchWeatherDetails(cityName){
fetch(`https://api.weatherapi.com/v1/current.json?key=6ce7a0152aa640eb91b144442242107&q=${cityName}`)
    .then(response => response.json())
    .then(data => {
        display(data)
    })
}


function display(data){
    const weatherDetails = document.getElementById("weather-details")
    weatherDetails.innerHTML = `<h2>City's Name: ${data.location.name}</h2> 
    <p>Temperature:${data.current.temp_c} </p>
    <p>Weather Condition: ${data.current.condition.text}
    <img src="${data.current.condition.icon}" alt="Current weather picture.">
    </p>
    <p>Wind: ${data.current.wind_kph} km/h Direction: ${data.current.wind_dir}</p>`
}

window.addEventListener("input", event =>{
    if (event.target.id === "capital-selector") {
        fetchWeatherDetails(event.target.value.slice(0,event.target.value.indexOf("[")))
    }
})
window.addEventListener("click", event => {
    
})