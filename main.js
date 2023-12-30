const API_Key="8ee1b717a7ec5f369e559ae7dcabae62";

const DAYS_OF_THE_WEEK=["sun","mon","tue","wed","thu","fri","sat"]

const getCurrentWeatherData=async()=>{
    const city="aligarh";
    const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_Key}`);
    return response.json();
}
const gethourly= async ({name:city})=>{
    const response= await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_Key}`)
    const data=await response.json();
    return data.list.map(forecast=>{
        const {main:{temp,temp_max,temp_min},dt,dt_txt,weather:[{description,icon}] }=forecast;
        return{temp,temp_max,temp_min,dt,dt_txt,description,icon}

    })
    console.log(data)
}

const formatTempreature=(temp)=>`${temp?.toFixed(1)}°`

loadCurrentForecast=({name, main:{temp,temp_max,temp_min},weather:[{description}]})=>{
   const currentForecastElement= document.querySelector("#current-forecast");
   currentForecastElement.querySelector(".city").textContent=name;
   currentForecastElement.querySelector(".temp").textContent=formatTempreature(temp)

   currentForecastElement.querySelector(".description").textContent=description
   currentForecastElement.querySelector(".min-max-temp").textContent=`H:${ formatTempreature(temp_max)} L:${ formatTempreature(temp_min)}`;
 
}
const createIconUrl=(icon)=>`http://openweathermap.org/img/wn/${icon}@2x.png`

const loadHourlyForecast=(gethourly)=>{
    //console.log(gethourly)
    let dataFor12Hours=gethourly.slice(2,14);
   const hourlyContainer= document.querySelector(".hourly-container")
   let innerHTMLString=``;
   for(let {temp,icon,dt_txt} of dataFor12Hours){
  innerHTMLString+=` <article>
  <h3  class="time">${dt_txt.split(" ")[1]}</h3>
  <img  src="${createIconUrl(icon)}" class="icon" alt=""/>icon
<p class="hourly-temp">${formatTempreature(temp)}</p>
</article>`
   }
   hourlyContainer.innerHTML=innerHTMLString
}
const loadsFeelsLike=({main:{feels_like}})=>{
  let container=  document.querySelector("#feels-like");
  container.querySelector(".feels-like-temp").textContent=formatTempreature(feels_like)
}
const loadHumidity=({main:{humidity}})=>{
    let container=  document.querySelector("#humidity");
    container.querySelector(".humidity-value").textContent=`${humidity} %`
  }
  const calculateDayWiseForecast=(hourlyForecast)=>{
    console.log(hourlyForecast)
let  dayWiseForecast=new Map()
for(let forecast of hourlyForecast){
const[date]=forecast.dt_txt.split(" ");
const dayOftheWeek=DAYS_OF_THE_WEEK[new Date(date).getDay()]
console.log(dayOftheWeek)
if(dayWiseForecast.has(dayOftheWeek)){
let forecastForTheDay=dayWiseForecast.get(dayOftheWeek);
forecastForTheDay.push(forecast);
dayWiseForecast.set(dayOftheWeek,forecastForTheDay)
}
else{
  dayWiseForecast.set(dayOftheWeek,[forecast]);
}
}
console.log(dayWiseForecast)
for(let [key,value] of dayWiseForecast){
  let temp_min=Math.min(...Array.from(value,val=>val.temp_min))
  let temp_max=Math.max(...Array.from(value,val=>val.temp_max))
  dayWiseForecast.set(key,{temp_min,temp_max,icon:value.find(v=>v.icon).icon})

}
console.log(dayWiseForecast)
return dayWiseForecast

  }

const loadFiveDayForecasr=( hourlyForecast)=>{
console.log(hourlyForecast)
const dayWiseForecast=calculateDayWiseForecast(hourlyForecast)
const container=document.querySelector(".five-day-forecast-container")
let daywiseInfo="";
console.log(Array.from(dayWiseForecast))
Array.from(dayWiseForecast).map(([day,{temp_max,temp_min,icon}],index)=>{
if(index<5){
 daywiseInfo+=` <article class="day-wise-forecast">
            <h3 class ="day" >${index===0?"today":day}</h3>
            <img src="${createIconUrl(icon)}" alt="" class="icon" />
            
            <p class="min-temp">${formatTempreature( temp_min)}</p>
            <p class="max-temp">${formatTempreature( temp_max)}</p>
        </article>`
}
})

container.innerHTML=daywiseInfo;

}

document.addEventListener("DOMContentLoaded",async ()=>{
const currentWeather= await getCurrentWeatherData();
//console.log(getCurrentWeatherData());
loadCurrentForecast(currentWeather)
 const hourlyForecast=await gethourly(currentWeather)
 loadHourlyForecast(hourlyForecast)
 loadsFeelsLike(currentWeather)
 loadHumidity(currentWeather)
loadFiveDayForecasr( hourlyForecast)
})