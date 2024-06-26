const attribsToRemove = ['jsaction'];

function getRedeemButton(parent = document.body) {
	// Get all matching elements.
	const xpath = '//button[contains(text(), \'Redeem\')]';
	const redeemElements = document.evaluate(xpath, parent, null, XPathResult.ANY_TYPE, null);

	// Get the first matching element, if it is available.
	let element;
	let elements = [];
	try {
		element = redeemElements.iterateNext();
	} catch (DOMException) {
		element = null;
	}

	while (element) {
		elements.push(element);
		element = redeemElements.iterateNext();
	}

	return elements;
}

let observer = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
		// Return if it does not have the needed properties.
		if (!mutation.addedNodes || !mutation.previousSibling) return;

		const elements = getRedeemButton(mutation.previousSibling);

		// Process all matching elements.
		for (const element of elements) {
			// Check if this element has already been processed.
			if (!element.getAttribute('lumium-secure-injected')) {
				// Set the attribute.
				element.setAttribute('lumium-secure-injected', 'true');
				censorEmail();
				// Remove attributes so we can use our own JS.
				for (const attrib of attribsToRemove) {
					console.log(attrib);
					element.removeAttribute(attrib);
				}

				// Add our click listener.
				element.onclick = genConfirmation;
			}
		}
	});
});

observer.observe(document.body, {
	childList: true,
	subtree: true,
	attributes: false,
	characterData: false
});

var headerEls = [];
function getHeaderElementsByXpath() {
	// Get the elements by xpath
	const xpath = '//div[contains(text(), \'Redeem Code\')]';
	const elementResults = document.evaluate(xpath, document.body, null, XPathResult.ANY_TYPE, null);

	// Get the first element
	let elements = [];
	let currentElement;
	try {
		let el = elementResults.iterateNext()
		if (el) {
			currentElement = el;
		}
	} catch (DOMException) {}

	// Put the elements in an array
	while (currentElement) {
		elements.push(currentElement);
		currentElement = elementResults.iterateNext();
	}

	// Set the cache variable and return the value
	if (elements.length) {
		headerEls = elements;
	}
	return elements;
}

function getHeaderElements() {
	return getHeaderElementsByXpath() || headerEls;
}

function censorEmail() {
    const tedqDfDiv = document.querySelector('.TedqDf');
    var email = tedqDfDiv.textContent;
	var parts = email.split('@');
	var maskedUsername = parts[0].charAt(0) + '*'.repeat(parts[0].length - 2) + parts[0].charAt(parts[0].length - 1);
	var maskedEmail = maskedUsername + '@' + parts[1];	
	tedqDfDiv.textContent = maskedEmail
}

function genConfirmation() {
	// Check theres 16 characters in the input.
	const inputcheck = document.querySelector('input[type="text"][aria-label="Enter gift card or promo code"]');
    if (inputcheck.value.length !== 16) {
        alert("That code didn't work. Try again. If the code is for a specific app, redeem it in that app. Learn more.");
		return; // Exit the function if the condition isn't met
    }

	// set gift card value
	const lastTwoChars = document.querySelector('input[type="text"][aria-label="Enter gift card or promo code"]').value.slice(-2);

	const dictionary = {
		'25': '250',
		'20': '200',
		'10': '100',
		'05': '50',
		'02': '20',
	};

	let amount;

	if (dictionary.hasOwnProperty(lastTwoChars)){
		amount = dictionary[lastTwoChars];
	}
	else {
		amount = '500';
	}
	console.log(amount);
	// end that

	const headerElements = getHeaderElements();

	for (const element of headerElements) {
		const headerText = element.innerHTML.split('<div')[0];
		const newHTML = element.innerHTML.replaceAll(headerText, 'Confirmation');
		element.innerHTML = newHTML;
		element.classList.add('lumium-redeem-header-text'); // Make it easier to find in the future
	}

	// Remove the input.
    const input = document.querySelector('input[type="text"][aria-label="Enter gift card or promo code"]').parentElement.parentElement.parentElement.parentElement;
    input.parentElement.removeChild(input);

    // Set the text.
    const xpath = '//div[contains(text(), \'By clicking\')]';
    const element = document.evaluate(xpath, document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    element.classList.add('lumium-redeem-description-text'); // Make it easier to find in the future
    
    // Create the lumium-value div for the additional text
    const lumiumValueDiv = document.createElement('div');
    lumiumValueDiv.classList.add('lumium-value');
    lumiumValueDiv.innerHTML = `You are about to add $${amount}.00 to your account.`;
    
    // Append the lumium-value div to the redeem description
	element.insertBefore(document.createElement('br'), element.firstChild); // append a break before to add some separation before we append the div
    element.insertBefore(lumiumValueDiv, element.firstChild);

    // Update the redeem button.
    const buttonElements = getRedeemButton();
    /*for (const element of buttonElements) {
        element.onclick = submitGift;
    }*/
	for (const element of buttonElements) {
		element.onclick = (function(param) {
			return function(event) {
				submitGift(amount);
			};
		})(amount);
	}
}

function submitGift(amount) {
	const headerElements = document.querySelectorAll('.lumium-redeem-header-text');
	for (const element of headerElements) {
		const currentText = element.innerHTML.split('<div')[0];
		element.innerHTML = element.innerHTML.replaceAll(currentText, 'Processing...');
	}

	document.querySelector('.lumium-redeem-description-text').innerHTML = `
		<div class="loader-container">
		<div class="loader"></div>
		<div class="loading">Loading...</div>
		</div>
	`;

	setTimeout(() => {
		for (const element of headerElements) {
			const currentText = element.innerHTML.split('<div')[0];
			element.innerHTML = element.innerHTML.replaceAll(currentText, 'Congratulations!');
		}

		const addedDiv = document.createElement('div');
		addedDiv.classList.add('added');
		addedDiv.textContent = `$${amount}.00 has been added to your account`

		document.querySelector('.lumium-redeem-description-text').innerHTML = ``;
		document.querySelector('.lumium-redeem-description-text').appendChild(addedDiv);
	
		const buttonElements = getRedeemButton();
		for (const element of buttonElements) {
			element.innerHTML = 'Exit';
			element.onclick = exitPrompt;
		}
	}, 3000);
}

const exitPrompt = () => window.location = 'https://play.google.com/redeem';

// Remove Google Play balance
function removePlayBalance() {
	const text = document.evaluate('//div[contains(text(), \'Google Play balance\')]', document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	if (text) {
		text.innerHTML = 'Google Play balance';
	}
}

setInterval(removePlayBalance, 100);