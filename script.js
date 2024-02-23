
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");


let currentTab = userTab;
const API_KEY = "e49deaa4e2b73310f2459ae929e52780";
currentTab.classList.add("currentTab");
getfromSessionStorage();

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click",getLocation);

const searchInput = document.querySelector("[data-searchInput]")

function switchTab(newTab){
  if(newTab != currentTab){
    currentTab.classList.remove("currentTab");
    currentTab = newTab;
    currentTab.classList.add("currentTab");

    if(!searchForm.classList.contains("active")){
      // kya search form vaala container is invisible, if yes then make it visible
      userInfoContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");
      searchForm.classList.add("active"); 
    }
    else{
      // main pehle search wale tab pr tha, ab your weather tab visible karna h 
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");
      // ab main your weather tab me aagya hu , toh weather bhi display karna padega , so lets check local storage first 
      //  for coordinates, if we have saved them there 
      getfromSessionStorage();
    }
  }
}


userTab.addEventListener("click", () => {
  // pass clicked tab as input parameter
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  // pass clicked tab as input parameter
  switchTab(searchTab);
})

// check if coordinates are already present in session storage
function getfromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");
  if(!localCoordinates){
    // agar local coordinates nhi mile
    grantAccessContainer.classList.add("active");
  }
  else{
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeatherInfo(coordinates);
  }
}

async function fetchUserWeatherInfo(coordinates){
  const {lat, lon} = coordinates;
  // make grantcontainer invisible
  grantAccessContainer.classList.remove("active");
  // make other visible
  loadingScreen.classList.add("active");

  // API CALL
  try{
    const response = await fetch (`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    console.log(response);
    const data = await response.json();

    if (!data.sys) {
      throw data;
   }
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    rendorWeatherInfo(data);

  }
  catch(err){
    loadingContainer.classList.remove('active');
    notFound.classList.add('active');
    errorImage.style.display = 'none';
    errorText.innerText = `Error: ${err?.message}`;
    errorBtn.style.display = 'block';
    errorBtn.addEventListener("click", fetchUserWeatherInfo);
  }
}

function rendorWeatherInfo(weatherInfo){
  // firstly we have to fetch the elements 
  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const desc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windspeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloudiness]");
  // fetch values from weatherINFO object and put it UI elements 
  cityName.innerText = weatherInfo?.name;
  countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  desc.innerText = weatherInfo?.weather?.[0]?.description;
  weatherIcon.src =   `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
  temp.innerText = `${(weatherInfo?.main?.temp-273).toFixed(2)} °C`;
  windspeed.innerText = `${weatherInfo?.wind?.speed.toFixed(2)} m/s`;
  humidity.innerText =  `${weatherInfo?.main?.humidity.toFixed(2)} %`;
  cloudiness.innerText = `${weatherInfo?.clouds?.all.toFixed(2)} %`;
}

function getLocation(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(showPosition);
  }
  else{
    // HW - show an alert for no geolocation support available 
    grantAccessButton.style.display ='none';
  }
}

function showPosition(position){

  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  }

  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeatherInfo(userCoordinates);
}



searchForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  let cityName = searchInput.value;
  console.log(cityName);

  if(cityName === ""){
    return;
  }
  else {
    fetchSearchWeatherInfo(cityName);
  }

})

async function fetchSearchWeatherInfo(city){
  loadingScreen.classList.add("active");
  userInfoContainer.classList.remove("active");
  grantAccessContainer.classList.remove("active");
  // notFound.classList.remove("active");
  try{
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`);
    const data = await response.json();
    if (!data.sys) {
      throw data;
  }
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    rendorWeatherInfo(data);
  }
  catch(err){
    // HW
    loadingContainer.classList.remove('active');
    userInfoContainer.classList.remove('active');
    notFound.classList.add('active');
    errorText.innerText = `${err?.message}`;
    errorBtn.style.display = "none";
  }
}