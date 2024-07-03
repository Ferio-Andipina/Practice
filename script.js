let weatherInterval;
let timeInterval;
let timezone;
function getLocation() {
    const ipInput = document.getElementById('ipInput').value;
    const locationInfo = document.getElementById('locationInfo');
    const weatherInfo = document.getElementById('weatherInfo');
    const timeElement = document.getElementById('time');
    const apiKey = '9c0f4c5332eb4bce9db0e6de8cad930d';
    let ipUrl = `https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}`;

    if (ipInput) {
        if (!validateIP(ipInput)) {
            alert('Enter the correct IP address.');
            return;
        }
        ipUrl += `&ip=${ipInput}`;
    }

//    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
//    const fetchUrl = proxyUrl + ipUrl;

    fetch(ipUrl)
        .then(response => response.json())
        .then(data => {
            if (!data.city || !data.state_prov || !data.country_name) {
                alert('Location could not be determined.');
                return;
            }
            locationInfo.innerHTML = `<h2>Location</h2>
                                      <p>City: ${data.city}</p>
                                      <p>Region: ${data.state_prov}</p>
                                      <p>A country: ${data.country_name}</p>
                                      <p>IP: ${data.ip}</p>`;
            timezone = data.time_zone.name;
            startClock(timezone);
            setBackgroundByCity(data.city);
            return data;
        })
        .then(data => {
            if (data) {
                fetchWeather(data.latitude, data.longitude);
                clearInterval(weatherInterval);
                weatherInterval = setInterval(() => fetchWeather(data.latitude, data.longitude), 15000);
            }
        })
        .catch(error => {
            console.error('error:', error);
            weatherInfo.innerHTML = `<p style="color: red;">Error when receiving weather data: ${error.message}</p>`;
        });
}


function setBackgroundByCity(city) {
    const body = document.body;
    const backgroundUrl = `https://api.unsplash.com/photos/random?query=${city}&client_id=QCG1_z1aYfF6jqwpwdpyN_Z1q4CEb5BQdhJxfB2bz7k`;

    fetch(backgroundUrl)
        .then(response => response.json())
        .then(data => {
            if (data.urls && data.urls.regular) {
                body.style.backgroundImage = `url('${data.urls.regular}')`;
                body.style.backgroundSize = 'cover';
                body.style.backgroundPosition = 'center';
                body.style.backgroundRepeat = 'no-repeat';
            } else {
                console.error('Error fetching background image data');
            }
        })
        .catch(error => {
            console.error('Error fetching background image:', error);
        });
}
function fetchWeather(lat, lon) {
    const weatherInfo = document.getElementById('weatherInfo');
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Europe/Moscow`;
    fetch(openMeteoUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }
            return response.json();
        })
        .then(weatherData => {
            if (weatherData && weatherData.current_weather) {
                weatherInfo.innerHTML = `<h2>Weather</h2>
                                         <p>Temperature: ${weatherData.current_weather.temperature} °C</p>
                                         <p>Wind speed: ${weatherData.current_weather.windspeed} m/s</p>`;
            } else {
                throw new Error('Weather data not available');
            }
        })
        .catch(error => {
            console.error('error:', error);
            weatherInfo.innerHTML = `<p style="color: red;">Error when receiving weather data: ${error.message}</p>`;
        });
}

function validateIP(ip) {
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;
    return ipPattern.test(ip);
}

function startClock(timezone) {
    if (timeInterval) {
        clearInterval(timeInterval);
    }

    function updateTime() {
        const timeElement = document.getElementById('time');
        const now = new Date().toLocaleString("en-US", { timeZone: timezone });
        timeElement.textContent = new Date(now).toLocaleTimeString();
    }

    updateTime();
    timeInterval = setInterval(updateTime, 1000);
}