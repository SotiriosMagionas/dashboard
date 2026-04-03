import {
    getBackgroundPlaceholder,
    getCryptoPlaceholder,
    getWeatherPlaceholder,
    getHistoryPlaceholder
} from "./utility/placeholder.js"
import { violentWords } from "./utility/violentWords.js"

const loader = document.querySelector("#loader")
const mainEl = document.querySelector("main")
const timeEl = document.querySelector(".time")
const historyCard = document.querySelector(".event-card")
const historyPrevBtn = document.querySelector(".history-previous")
const historyNextBtn = document.querySelector(".history-next")
const historyDateEl = document.querySelector(".date")
const historyEventEl = document.querySelector(".event")
const outerCryptoContainer = document.getElementById("crypto")
const innerCryptoContainer = document.getElementById("crypto-top")
const today = new Date()
const month = String(today.getMonth() + 1).padStart(2, "0")
const day = String(today.getDate()).padStart(2, "0")
const imageUrl = "https://apis.scrimba.com/unsplash/photos/random?orientation=landscape&query=nature"
const cryptoUrl = "https://api.coingecko.com/api/v3/coins/dogecoin"
const historyUrl = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${month}/${day}`
const weatherBaseUrl = "https://apis.scrimba.com/openweathermap/data/2.5/weather"
let historyEvents = []
let historyIndex = 0
historyNextBtn.addEventListener("click", handleNextClick)
historyPrevBtn.addEventListener("click", handlePrevClick)
let cryptoPrice = null;

function hideLoader() { loader.classList.add("hidden") }

function getPosition() {

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}

function loadImage(url) {

    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(url)
        img.onerror = reject
        img.src = url
    })
}

function handleNextClick(e) {

    e.stopPropagation()

    const atLastItem = historyIndex >= historyEvents.length - 1
    if (atLastItem) {
        historyNextBtn.disabled = true
        return
    }

    historyIndex++

    historyPrevBtn.disabled = false
    historyNextBtn.disabled = historyIndex === historyEvents.length - 1
    historyNextBtn.blur()
    renderNewEvent(historyEvents[historyIndex])
}

function handlePrevClick(e) {

    e.stopPropagation()

    const atFirstItem = historyIndex <= 0
    if (atFirstItem) {
        historyPrevBtn.disabled = true
        return
    }

    historyIndex--

    historyNextBtn.disabled = false
    historyPrevBtn.disabled = historyIndex === 0
    historyPrevBtn.blur()
    renderNewEvent(historyEvents[historyIndex])
}

function renderNewEvent(historicEvent) {

    historyDateEl.textContent = "On this day in: " + historicEvent.year
    historyEventEl.textContent = historicEvent.text
}

async function loadDashboard() {

    try {
        const imageFetch = fetch(imageUrl)
        const cryptoFetch = fetch(cryptoUrl)
        const historyFetch = fetch(historyUrl)

        let position = null
        try {
            position = await getPosition()
        } catch (err) {
            console.warn("Geolocation not available", err)
        }

        const weatherFetch = position
            ? fetch(`${weatherBaseUrl}?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric`)
            : fetch(`${weatherBaseUrl}?lat=37.99083&lon=23.6971397&units=metric`)

        const results = await Promise.allSettled([
            imageFetch,
            cryptoFetch,
            weatherFetch,
            historyFetch
        ])

        const [imageRes, cryptoRes, weatherRes, historyRes] = results

        const imageResOk = imageRes.status === "fulfilled" && imageRes.value.ok

        const imageData = imageResOk
            ? await imageRes.value.json()
            : getBackgroundPlaceholder()

        const cryptoData = (cryptoRes.status === "fulfilled" && cryptoRes.value.ok)
            ? await cryptoRes.value.json()
            : getCryptoPlaceholder()

        const weatherData = (weatherRes.status === "fulfilled" && weatherRes.value.ok)
            ? await weatherRes.value.json()
            : getWeatherPlaceholder()

        const historyData = (historyRes.status === "fulfilled" && historyRes.value.ok)
            ? await historyRes.value.json()
            : getHistoryPlaceholder()

        if (imageResOk) await loadImage(await imageData.urls.regular)

        render(imageData, cryptoData, weatherData, historyData)

    } catch (err) {
        console.error(err)
    }
    finally {
        hideLoader()
        mainEl.setAttribute("aria-hidden", "false")
    }
}

function render(imageData, cryptoData, weatherData, historyData) {

    document.body.style.backgroundImage = `url(${imageData.urls.regular})`

    const author = document.getElementById("author")
    author.href = `https://unsplash.com/@${imageData.user.username}`
    author.textContent = `Image by: ${imageData.user.name}`
    author.setAttribute("rel", "noopener noreferrer")
    author.setAttribute("target", "_blank")

    renderCrypto(cryptoData)

    const iconUrl = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`
    const weatherContainer = document.getElementById("weather")
    const weatherIcon = document.createElement("img")
    weatherIcon.src = iconUrl
    weatherIcon.alt = "Current weather icon"
    const weatherDesc = document.createElement("p")
    weatherDesc.textContent = weatherData.weather[0].description;
    weatherDesc.classList.add("sr-only")
    const weatherTemp = document.createElement("p")
    weatherTemp.textContent = Math.round(weatherData.main.temp) + "ºC"
    weatherTemp.classList.add("weather-temp")
    const weatherLocation = document.createElement("p")
    weatherLocation.textContent = weatherData.name
    weatherLocation.classList.add("weather-city")
    weatherContainer.append(weatherDesc, weatherIcon, weatherTemp, weatherLocation)

    historyNextBtn.style.display = "block"
    historyPrevBtn.style.display = "block"
    historyCard.style.display = "block"
    const violentRegEx = new RegExp(`\\b(${violentWords})\\b`, "i");
    historyEvents = historyData.events.filter((event) => {
        return !violentRegEx.test(event.text)
    }).sort((a, b) => b.year - a.year)
    historyDateEl.textContent = "On this day in: " + historyEvents[historyIndex].year
    historyEventEl.textContent = historyEvents[historyIndex].text

    tick()
    refreshCoinData()
}

function tick() {

    const now = new Date()
    timeEl.textContent = now.toLocaleTimeString("en-us", { timeStyle: "medium" })

    const delay = 1000 - (now.getMilliseconds())
    setTimeout(tick, delay)
}

async function refreshCoinData() {

    const now = new Date()

    try {
        const cryptoFetch = fetch(cryptoUrl)
        const result = await cryptoFetch
        if (!result.ok) throw new Error("Response not ok, keep old data for now")

        const data = await result.json()
        renderCrypto(data)

    } catch (err) {
        console.error("Error refetching coin data: ", err)
    }

    const delay = 30000 - (now.getMilliseconds())
    setTimeout(refreshCoinData, delay)
}

function renderCrypto(data) {

    innerCryptoContainer.textContent = ""
    const img = document.createElement("img")
    img.src = data.image.small
    img.alt = "Selected crypto coin icon"
    const span = document.createElement("span")
    span.textContent = data.name
    innerCryptoContainer.appendChild(img)
    innerCryptoContainer.appendChild(span)

    const arrow = document.createElement("img")
    arrow.className = "arrow"
    if (data.market_data.current_price.usd > cryptoPrice) {
        arrow.src = "./assets/images/arrow-trend-up.svg"
        arrow.alt = "arrow pointing up-increase"
    } else if (data.market_data.current_price.usd < cryptoPrice) {
        arrow.src = "./assets/images/arrow-trend-down.svg"
        arrow.alt = "arrow pointing down-decrease"
    } else if (data.market_data.current_price.usd === cryptoPrice) {
        arrow.src = "./assets/images/arrow-right-long.svg"
        arrow.alt = "arrow pointing right-no change"
    }

    const currentPriceContainer = document.createElement("div")
    currentPriceContainer.className = "current-price-container"

    const currentPriceEl = document.createElement("p")
    currentPriceEl.textContent = `🎯: $${data.market_data.current_price.usd.toFixed(6)}`
    currentPriceContainer.innerHTML = ""
    currentPriceContainer.appendChild(currentPriceEl)
    if (cryptoPrice != null) currentPriceContainer.appendChild(arrow)

    const upperPriceEl = document.createElement("p")
    upperPriceEl.textContent = `👆: $${data.market_data.high_24h.usd.toFixed(6)}`

    const lowerPriceEl = document.createElement("p")
    lowerPriceEl.textContent = `👇: $${data.market_data.low_24h.usd.toFixed(6)}`
    
    outerCryptoContainer.innerHTML = ""
    outerCryptoContainer.append(innerCryptoContainer, currentPriceContainer, upperPriceEl, lowerPriceEl)
    outerCryptoContainer.style.display = "block"
    cryptoPrice = data.market_data.current_price.usd;
}

loadDashboard()
