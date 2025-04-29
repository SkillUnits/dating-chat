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

const endingFlow = new Flow([
    new OperMessage("We’ve found <strong>over 1500 candidates</strong> who are perfect for you! Answer a few <strong>last questions</strong> so we can find the ideal partner.", null, null),
    new OperMessage(`<img src="images/photos.png">`, [
        new Answer("Start matchmaking now!", null, null)
    ], null),
]);

const fifthQuestionFlow = new Flow([
    new OperMessage(`<span class="question-count">5/5</span> <br> Do you have specific criteria for a partner?`, [
        new Answer("Yes, it’s important that we share similar views on life", new Action(Action.actionChangeFlow, endingFlow), null),
        new Answer("No, I’m open to different options", new Action(Action.actionChangeFlow, endingFlow), null),
        new Answer("Yes, it’s important that my partner has certain hobbies and interests", new Action(Action.actionChangeFlow, endingFlow), null)
    ], null),
]);

const fourthQuestionFlow = new Flow([
    new OperMessage(`<span class="question-count">4/5</span> <br> What is your ideal date?`, [
        new Answer("Romantic dinner at a restaurant", new Action(Action.actionChangeFlow, fifthQuestionFlow), null),
        new Answer("Shared activity, such as hiking or cycling", new Action(Action.actionChangeFlow, fifthQuestionFlow), null),
        new Answer("A quiet evening at home with a movie and something tasty", new Action(Action.actionChangeFlow, fifthQuestionFlow), null)
    ], null),
]);

const thirdQuestionFlow = new Flow([
    new OperMessage(`<span class="question-count">3/5</span> <br> How do you feel about online dating?`, [
        new Answer("It’s a new experience for me, but I’m open to it", new Action(Action.actionChangeFlow, fourthQuestionFlow), null),
        new Answer("I’ve tried it before and I’m looking for a serious relationship", new Action(Action.actionChangeFlow, fourthQuestionFlow), null),
        new Answer("It’s interesting, but I’m looking for casual encounters", new Action(Action.actionChangeFlow, fourthQuestionFlow), null)
    ], null),
]);

const secondQuestionFlow = new Flow([
    new OperMessage(`<span class="question-count">2/5</span> <br> What is important to you in a relationship?`, [
        new Answer("Support and mutual understanding", new Action(Action.actionChangeFlow, thirdQuestionFlow), null),
        new Answer("Adventures and new emotions", new Action(Action.actionChangeFlow, thirdQuestionFlow), null),
        new Answer("Spending time together and shared interests", new Action(Action.actionChangeFlow, thirdQuestionFlow), null)
    ], null),
]);

// Flows
const mainFlow = new Flow([
    new OperMessage(`<span class="question-count">1/5</span> <br> What is your age?`, [
        new Answer("Over 35", new Action(Action.actionChangeFlow, secondQuestionFlow), "have_credits"),
        new Answer("Under 35", new Action(Action.actionChangeFlow, secondQuestionFlow), "no_credits"),
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
            operatorMessageDiv.innerHTML = message.operMessage;

            if (message.operMessage && message.operMessage.includes("<img") || message.operMessage && message.operMessage.includes("<video")) {
                operatorMessageDiv.classList.remove("operator");
                operatorMessageDiv.classList.add("message-image-wrapper");
            }

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

    answers.forEach((answer, index) => {
        const button = document.createElement("button");
        button.classList.add("answer-button");
        button.textContent = answer.text;
        button.onclick = () => handleUserResponse(answer);
    
        // Якщо це останнє питання і є тільки одна відповідь — додати особливий стиль
        if (currentFlow === endingFlow) {
            button.classList.add("answer-button-ending");
        }
    
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