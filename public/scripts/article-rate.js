const likeButton    = document.querySelector('.post__full__like-button');
const dislikeButton = document.querySelector('.post__full__dislike-button');
const articleId     = window.location.pathname.split('/')[3];
const user          = {
    email: document.querySelector('input#email').value
}
let requestObj      = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(user)
}

/**
 * Creates and updates the alert element
 * 
 * @param {*} isSuccess 
 * @param {*} text 
 */
function createAlertElement(isSuccess, text) {
    let elementClass = 'alert success'
    
    if (!isSuccess) {
        elementClass = 'alert error';
    }

    const isElementAlreadyCreated = document.querySelector('.alert')
    let alert                     = document.createElement('p');
    alert.textContent             = text;
    alert.className               = elementClass;
    const postElement             = document.querySelector('.post');
    
    if (isElementAlreadyCreated) {
        isElementAlreadyCreated.replaceWith(alert);
    } else {
        postElement.prepend(alert);
    }
}

/**
 * Updates the rate counters
 * 
 * @param {*} rate 
 * @param {*} number 
 */
function updateRateCounter(rate, number) {
    let counterClass = 'post__full__dislike-counter';

    if (rate == 'like') {
        counterClass = 'post__full__like-counter';
    }

    let counterElement         = document.querySelector(`.${counterClass}`);
    counterElement.textContent = number;
}

/**
 * Updates button event listener
 * 
 * @param {Element} element 
 */
function updateClickEventListener(element, oldListenerMethod, newListenerMethod) {
    element.removeEventListener('click', oldListenerMethod);
    element.addEventListener('click', newListenerMethod);
}

/**
 * Sends the request for the like setting
 * 
 * @returns 
 */
async function sendSetLike() {
    let response = await fetch(`/article/view/${articleId}/rating/setLike`, requestObj);
    let body     = await response.json();

    if (body.status === 'error') {
        return createAlertElement(false, body.error);
    }

    updateRateCounter('like', body.likes);
    updateRateCounter('dislike', body.dislikes);
    updateClickEventListener(likeButton, sendSetLike, sendUnsetLike);
}

/**
 * Sends the request for the dislike setting
 * 
 * @returns 
 */
async function sendSetDislike() {
    let response = await fetch(`/article/view/${articleId}/rating/setDislike`, requestObj);
    let body     = await response.json();

    if (body.status === 'error') {
        return createAlertElement(false, body.error);
    }

    updateRateCounter('like', body.likes);
    updateRateCounter('dislike', body.dislikes);
    updateClickEventListener(likeButton, sendSetDislike, sendUnsetDislike);
}

async function sendUnsetLike() {
    let response = await fetch(`/article/view/${articleId}/rating/unsetLike`, requestObj);
    let body     = await response.json();

    if (body.status === 'error') {
        return createAlertElement(false, body.error);
    }

    updateRateCounter('like', body.likes);
    updateRateCounter('dislike', body.dislikes);
    updateClickEventListener(likeButton, sendUnsetLike, sendSetLike);
}

async function sendUnsetDislike() {
    let response = await fetch(`/article/view/${articleId}/rating/unsetDislike`, requestObj);
    let body     = await response.json();

    if (body.status === 'error') {
        return createAlertElement(false, body.error);
    }

    updateRateCounter('like', body.likes);
    updateRateCounter('dislike', body.dislikes);
    updateClickEventListener(likeButton, sendUnsetDislike, sendSetDislike);
}


likeButton.addEventListener('click', sendSetLike)
dislikeButton.addEventListener('click', sendSetDislike)