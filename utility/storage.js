export async function saveSelectedCoin(coin) {
    if (typeof browser !== "undefined" && browser.storage && browser.storage.local) {
        return browser.storage.local.set({ selectedCoin: coin })
    }

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ selectedCoin: coin }, () => {
                if (chrome.runtime && chrome.runtime.lastError) return reject(chrome.runtime.lastError)
                resolve()
            })
        })
    }

    try {
        localStorage.setItem("selectedCoin", coin)
        return
    } catch (e) {
        return Promise.reject(e)
    }
}

export async function getSelectedCoin(defaultCoin = "dogecoin") {
    if (typeof browser !== "undefined" && browser.storage && browser.storage.local) {
        const data = await browser.storage.local.get("selectedCoin")
        return data.selectedCoin || defaultCoin
    }

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get("selectedCoin", (data) => {
                if (chrome.runtime && chrome.runtime.lastError) return reject(chrome.runtime.lastError)
                resolve((data && data.selectedCoin) || defaultCoin)
            })
        })
    }

    try {
        return localStorage.getItem("selectedCoin") || defaultCoin
    } catch (e) {
        return defaultCoin
    }
}