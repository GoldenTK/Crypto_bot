const request = require('request-promise-native');

const API_TOKEN = "EAAaGGnZCmjNcBAEKM3wqg7DZBzvxSZAf6aX8LP1SZBgJ4XfNacZCH6IrgBhHzTk3rTTPTaciFvKyhzGCEBAJzQvNuIBC7fzWczqzZCldEBTjBxjhH6ZBzIJmmKzWut73CZBF7AKtgZChRurjAvEK63B9MBIwXT6Y9FZBWtbGphnqZC3YgZDZD";
const USER_ID = "+48511621833";
const CRYPTO_CURRENCY = "litecoin";
const TIME_OUT = "600000";

const getPrice = (coin, currency) => {
    return request(`https://api.coinmarketcap.com/v1/ticker/${coin}/?convert=${currency}`).then(data => {
        const prices = JSON.parse(data);
        return Promise.resolve(prices.map(price => price[`price_${currency.toLowerCase()}`]));
    }).catch(e => Promise.reject(`Unable to get data, error: ${e}`));
};

const sendMessage = (token, userId, message) => {
    return request({
        uri: `https://graph.facebook.com/v2.6/me/messages?access_token=${token}`,
        method: 'POST',
        body: { recipient: { phone_number: userId }, message: { text: message } },
        json: true
    }).then(() => Promise.resolve('Message was send')).catch(() => Promise.reject('Unable to send message'));
};

let wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const sendInfo = async (token, userId, cryptoCurrency, timeOut) => {
    const previousPrice = await getPrice(cryptoCurrency, 'PLN');
    console.log(`INFO: Previous price ${cryptoCurrency}: ${previousPrice}`);
    await wait(timeOut);
    const actualPrice = await getPrice(cryptoCurrency, 'PLN');
    console.log(`INFO: Actual price ${cryptoCurrency}: ${actualPrice}`);

    const pricesLength = previousPrice.length > actualPrice.length ? previousPrice.length : actualPrice.length;

    for (let i = 0; i < pricesLength; i++) {

        previousPrice[i] = parseFloat(previousPrice[i]).toFixed(2); 
        actualPrice[i] = parseFloat(actualPrice[i]).toFixed(2);

        if (previousPrice[i] !== actualPrice[i]) {
            const message = `${cryptoCurrency}: ${actualPrice[i]}`;
            sendMessage(token, userId, message).then(() => {
                console.log(`INFO: Message sended: ${message}`);
            }).catch(e => console.log(e));
        }
    }
};

sendInfo(API_TOKEN, USER_ID, CRYPTO_CURRENCY, TIME_OUT);
