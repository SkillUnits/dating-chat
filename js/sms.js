// Define the messages array
class Flow {
    constructor(operMessages) {
        this.operMessages = operMessages;
    }
}

class OperMessage {
    constructor(operMessage, userAnswers, action) {
        this.operMessage = operMessage;
        this.userAnswers = userAnswers;
        this.action = action;
    }
}

class Answer {
    constructor(text, action, conversionStatus) {
        this.text = text;
        this.action = action;
        this.conversionStatus = conversionStatus
    }
}

class Action {
    static actionChangeFlow = "changeFlow";
    static showCurrentOffers = "showCurrentOffers";
    static showOffers = "showOffers";
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}



const endMessageFlow = new Flow([
    new OperMessage("Go to the site, register, and start chatting with me!", null, null),
    new OperMessage("I’m waiting for you here! Click the button and let’s get to know each other better!", [
        new Answer("Message me ❤️", null, null),
    ], null),
]);

const badDayInterestsFlow = new Flow([
    new OperMessage("Don’t worry, I can cheer you up. Let’s chat in private messages?", [
        new Answer("Of course, let’s do it!", new Action(Action.actionChangeFlow, endMessageFlow), null),
        new Answer("Yes, that’s a great idea! I want to get to know you more.", new Action(Action.actionChangeFlow, endMessageFlow), null),
    ], null),
]);

const transitionToPrivateFlow = new Flow([
    new OperMessage("That’s interesting! I like your perspective on love. How about getting to know each other better in private messages?", [
        new Answer("Of course, let’s do it! I’m in, let’s chat more.", new Action(Action.actionChangeFlow, endMessageFlow), null),
        new Answer("Yes, that’s a great idea! I want to get to know you more.", new Action(Action.actionChangeFlow, endMessageFlow), null),
    ], null),
]);

const yesQuestionFlow = new Flow([
    new OperMessage("We have a lot in common! Do you believe in love at first sight, or do you think it’s more about mutual understanding over time?", [
        new Answer("I believe in it! Sometimes things happen quickly and unexpectedly.", new Action(Action.actionChangeFlow, transitionToPrivateFlow), null),
        new Answer("I think true love needs to be built over time.", new Action(Action.actionChangeFlow, transitionToPrivateFlow), null),
    ], null),
]);

const travelRomanticFlow = new Flow([
    new OperMessage("Wow, I love traveling too! Have you ever been to Paris?", [
        new Answer("Yes", new Action(Action.actionChangeFlow, yesQuestionFlow), null),
        new Answer("No", new Action(Action.actionChangeFlow, yesQuestionFlow), null),
    ], null),
]);

const homeRomanticFlow = new Flow([
    new OperMessage("I also like to relax at home sometimes. Do you enjoy comedies or other genres?", [
        new Answer("I love comedies, they’re fun)", new Action(Action.actionChangeFlow, yesQuestionFlow), null),
        new Answer("I mostly prefer other genres.", new Action(Action.actionChangeFlow, yesQuestionFlow), null),
    ], null),
]);

const goodDayInterestsFlow = new Flow([
    new OperMessage("Cool! I’m glad everything is good. What do you like to do in your free time?", [
        new Answer("I love traveling! How about you?", new Action(Action.actionChangeFlow, travelRomanticFlow), null),
        new Answer("I prefer relaxing at home. What do you like to do?", new Action(Action.actionChangeFlow, homeRomanticFlow), null),
    ], null),
]);

// Flows
const mainFlow = new Flow([
    new OperMessage("Hi! 👋 How’s your day going?", [
        new Answer("Everything’s great! How’s your day?", new Action(Action.actionChangeFlow, goodDayInterestsFlow), "have_credits"),
        new Answer("Not the best, but I’m trying to cheer up.", new Action(Action.actionChangeFlow, badDayInterestsFlow), "no_credits"),
    ], null),
]);

var currentFlow = mainFlow
var currentMessageIndex = 0;
var bottomChatViewId = 'offers-select';
var userOffers = [];

function selectOffer(element, offer) {
    if (element.className == "offer-select") {
        userOffers.push(offer);
        element.className = "offer-select-selected";
    } else {
        removeItemOnce(userOffers, offer);
        element.className = "offer-select";
    }
}

function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}


function doneSelectOffer(element) {
    keitaroConvertion("my_offers_select");
    document.getElementById('select-offer-button').style.display = 'none';
    proceedToNextMessage();
}

function scrollToBottom() {
    document.getElementById("main").scrollTop = document.getElementById("main").scrollHeight;

    // window.scroll({
    //     top: document.body.scrollHeight,
    //     behavior: 'smooth'  // Optional: Adds smooth scrolling
    // });
}

function renderMessage(messageDiv) {
    if (bottomChatViewId) {
        document.getElementById("chat-container").insertBefore(messageDiv, document.getElementById(bottomChatViewId))
    } else {
        document.getElementById("chat-container").insertBefore(messageDiv, null)
    }

    scrollToBottom();
}

function displayMessage(content, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    messageDiv.textContent = content;
    renderMessage(messageDiv);
}

function showOperatorMessage() {
    const message = currentFlow.operMessages[currentMessageIndex];
    if (message.operMessage) {
        const operatorMessageDiv = document.createElement("div");
        operatorMessageDiv.classList.add("message", "operator", "typing");

        const circleDiv = document.createElement("div");
        circleDiv.classList.add("circle");

        const circleDiv1 = document.createElement("div");
        circleDiv1.classList.add("circle");

        const circleDiv2 = document.createElement("div");
        circleDiv2.classList.add("circle");

        operatorMessageDiv.appendChild(circleDiv)
        operatorMessageDiv.appendChild(circleDiv1)
        operatorMessageDiv.appendChild(circleDiv2)

        // Disable buttons while the operator is typing
        disableAnswerButtons();

        renderMessage(operatorMessageDiv);

        setTimeout(() => {
            // Show operator message
            operatorMessageDiv.textContent = message.operMessage;

            if (message.userAnswers && message.userAnswers.length > 0) {
                // Show answer buttons
                displayAnswerButtons(message.userAnswers);
                operatorMessageDiv.classList.remove("typing")
                scrollToBottom();
            } else if (message.action) {
                // Handle custom action
                handleAction(message.action)
            } else {
                // Show next message
                operatorMessageDiv.classList.remove("typing");
                proceedToNextMessage();
                scrollToBottom();
            }
        }, Math.random() * 1000 + 1000); // random delay between 1500ms and 2500ms
    }
}

function displayAnswerButtons(answers) {
    const answerButtonsContainer = document.getElementById("answer-buttons");

    answers.forEach(answer => {
        const button = document.createElement("button");
        button.classList.add("answer-button");
        button.textContent = answer.text;
        button.onclick = () => handleUserResponse(answer);
        answerButtonsContainer.appendChild(button);
    });

    // Enable buttons after operator's message is shown
    enableAnswerButtons();
}

function handleUserResponse(response) {
    displayMessage(response.text, "user");
    keitaroConvertion(response.conversionStatus);

    if (response.action) {
        handleAction(response.action)
        hideButtons()
        return
    }

    proceedToNextMessage();
    hideButtons()
}

function handleAction(action) {
    switch (action.type) {
        case Action.actionChangeFlow:
            currentFlow = action.value;
            currentMessageIndex = 0;
            showOperatorMessage();
            break;
        case Action.showCurrentOffers:
            showOffersSelect(true)
            break;
        case Action.showOffers:
            showOffersResult(true)
            break;
    }
}

function hideButtons() {
    const answerButtonsContainer = document.getElementById("answer-buttons");
    while (answerButtonsContainer.firstChild) {
        answerButtonsContainer.removeChild(answerButtonsContainer.firstChild);
    }
}

function proceedToNextMessage() {
    currentMessageIndex++;
    if (currentMessageIndex < currentFlow.operMessages.length) {
        // Show next flow message
        setTimeout(showOperatorMessage, 500);
    }
}

function showOffersSelect(show) {
    if (show) {
        bottomChatViewId = "offers-result";
    }

    document.getElementById("offers-select").style.display = show ? "block" : "none";
    scrollToBottom();
}

function showOffersResult(show) {
    for (const element of userOffers) {
        const view = document.getElementById("offer-" + element);
        if (view) {
            view.style.display = "none";
        }
    }

    document.getElementById("offers-result").style.display = show ? "block" : "none";
}

function disableAnswerButtons() {
    const answerButtonsContainer = document.getElementById("answer-buttons");
    answerButtonsContainer.classList.add('locked'); // Lock the entire button container
}

function enableAnswerButtons() {
    const answerButtonsContainer = document.getElementById("answer-buttons");
    answerButtonsContainer.classList.remove('locked'); // Unlock the entire button container
}