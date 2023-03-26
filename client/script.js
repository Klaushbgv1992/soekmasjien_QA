import bot from './assets/bot.ico'
import user from './assets/user.ico'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')
const speakButton = document.querySelector('#speak-button');

var isFirefox = typeof InstallTrigger !== 'undefined';
var isChrome = !!window.chrome && !!window.chrome.webstore;

let loadInterval

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

//speakButton.addEventListener('click', speak); 
let userQuestionCounter = 0;

const handleSubmit = async (e) => {
    
    e.preventDefault()

    const data = new FormData(form)
    let prompt;

    // Check the state of the .sarsswitch checkbox
    const sarsswitch = document.getElementById("sarsswitch");
    if (sarsswitch.checked) {
        prompt = "Geef alstublieft een sarcastisch en humoristisch antwoord op de volgende vraag" + data.get('prompt') + "?";
    } else {
        prompt = "Geef alle antwoorden in het Nederlands" + data.get('prompt') + "?";
    }

    userQuestionCounter++;
    
    if (userQuestionCounter > 2) {
        const userQuestions = document.querySelectorAll('.wrapper:not(.ai)');
        userQuestions[0].remove();
      }
    
    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    if (userQuestionCounter === 1) {
    const userQuestions = document.querySelectorAll('.wrapper:not(.ai)');
    userQuestions[0].remove();
    }
    const uniqueId = generateUniqueId()
    
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    const response = await fetch('https://soekmasjien-qa.onrender.com', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            //prompt: data.get('prompt')
            prompt: prompt
        })
    })
    
    const botReplies = chatContainer.querySelectorAll('.ai .message');
    for (let i = 0; i < botReplies.length - 2; i++) {
        chatContainer.removeChild(botReplies[i].parentElement.parentElement);
    }

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

        typeText(messageDiv, parsedData)
        console.log(messageDiv)
        console.log(parsedData)

        responsiveVoice.speak(parsedData,"Afrikaans Male");
       
        //speak(parsedData);
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
    
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})

const initialPrompt = "Zeg tegen me -Hallo, mijn naam is Zoekmachine, stel je vraag- in het Nederlands?"

document.addEventListener("DOMContentLoaded", async () => {
  form.elements[0].value = initialPrompt
  handleSubmit(new Event("submit"))
});
