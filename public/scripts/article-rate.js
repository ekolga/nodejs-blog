const likeButton         = document.querySelector('.post__full__like-button');
const dislikeButton      = document.querySelector('.post__full__dislike-button');
const likeButtonClass    = likeButton.className;
const dislikeButtonClass = dislikeButton.className;
const articleId          = window.location.pathname.split('/')[3];
const user               = {
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
 * Disables button click events by adding them "pointer-events: none;" style
 */
function disableButtonClickEvents() {
    likeButton.className += ' disabled'
    dislikeButton.className += ' disabled'
}

/**
 * Returns button classes to the initial state
 */
function enableButtonEvents() {
    likeButton.className    = likeButtonClass;
    dislikeButton.className = dislikeButtonClass;
}

/**
 * Parses the response and updates the rate counters
 * 
 * @param {*} response 
 * @returns 
 */
async function parseResults(response) {
    let body = await response.json();

    if (body.status === 'error') {
        return createAlertElement(false, body.error);
    }

    updateRateCounter('like', body.likes);
    updateRateCounter('dislike', body.dislikes);
}

/**
 * Sends the request for the like setting
 */
async function sendSetLike() {
    disableButtonClickEvents();

    let response = await fetch(`/article/view/${articleId}/rating/setLike`, requestObj);

    await parseResults(response);

    updateClickEventListener(likeButton, sendSetLike, sendUnsetLike);
    updateClickEventListener(dislikeButton, sendUnsetDislike, sendSetDislike);

    enableButtonEvents();
}

/**
 * Sends the request for the dislike setting
 */
async function sendSetDislike() {
    disableButtonClickEvents();

    let response = await fetch(`/article/view/${articleId}/rating/setDislike`, requestObj);

    await parseResults(response);

    updateClickEventListener(dislikeButton, sendSetDislike, sendUnsetDislike);
    updateClickEventListener(likeButton, sendUnsetLike, sendSetLike);

    enableButtonEvents();
}

/**
 * Sends the request for the like unset
 */
async function sendUnsetLike() {
    disableButtonClickEvents();

    let response = await fetch(`/article/view/${articleId}/rating/unsetLike`, requestObj);
        
    await parseResults(response);

    updateClickEventListener(likeButton, sendUnsetLike, sendSetLike);

    enableButtonEvents();
}

/**
 * Sends the request for the dislike unset
 */
async function sendUnsetDislike() {
    disableButtonClickEvents();

    let response = await fetch(`/article/view/${articleId}/rating/unsetDislike`, requestObj);
        
    await parseResults(response);

    updateClickEventListener(dislikeButton, sendUnsetDislike, sendSetDislike);

    enableButtonEvents();
}

/**
 * Initial event listeners
 */

if (document.querySelector('.like-button__filled')) {
    likeButton.addEventListener('click', sendUnsetLike)
} else {
    likeButton.addEventListener('click', sendSetLike)
}

if (document.querySelector('.dislike-button__filled')) {
    dislikeButton.addEventListener('click', sendUnsetDislike)
} else {
    dislikeButton.addEventListener('click', sendSetDislike)
}
