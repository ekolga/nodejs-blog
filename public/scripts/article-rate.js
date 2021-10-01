let likeButton = document.querySelector('.post__full__like-button');
const articleId = '6136168aa3df301ab9934f52';
const user = {
    email: 'fckshw@gmail.com1'
}

let requestObj = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(user)
}

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


async function sendSetLike() {
    let response = await fetch(`/article/view/${articleId}/rating/setLike`, requestObj)
    let body     = await response.json()

    if (body.status === 'error') {
        return createAlertElement(false, body.error)
    }

}

likeButton.addEventListener('click', sendSetLike)