export function getBackgroundPlaceholder() {
    return {
        urls: {
            regular: "https://images.unsplash.com/photo-1458668383970-8ddd3927deed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxNDI0NzB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NzM1OTkzMjh8&ixlib=rb-4.1.0&q=80&w=1080"
        },
        user: {
            name: "samsommer",
            username: "samsommer"
        }
    }
}

export function getCryptoPlaceholder() {
    return {
        image: {
            small: "https://coin-images.coingecko.com/coins/images/5/small/dogecoin.png?1696501409"
        },
        name: "Dogecoin",
        market_data: {
            current_price: {
                usd: 0
            },
            high_24h: {
                usd: 0
            },
            low_24h: {
                usd: 0
            },
        }
    }
}

export function getWeatherPlaceholder() {
    return {
        main: {
            temp: 0
        },
        name: "Earth",
        weather: [{
            icon: "04d",
            description: "No weather data available",
        }]
    }
}

export function getHistoryPlaceholder() {
    return {
        events: [{
            year: "Never",
            text: "No history data available",
        }]
    }
}