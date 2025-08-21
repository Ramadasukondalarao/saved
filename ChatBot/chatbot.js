const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const emojiPickerBtn = document.querySelector("#emoji-picker");


//API setup
const API_KEY = "AIzaSyADyJlovwaswxPVV5KZnsthnPtMI-m_I6E";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

const userData = {
    message : null,
    file: {
        data: null,
        mime_type: null
    }
}

// Create message element with dynamic classes and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};


//Generative bot responce using API
const generateBotResponce = async (incomingMessageDiv) => {
const messageElement = incomingMessageDiv.querySelector(".message-text");

    //API request options
 const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     content: [
        {
        parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file}] : [])]
      },
     ],
    }),
 };

try{
    //Fetch bot responce from API
   const responce = await fetch(API_URL, requestOptions);
   const data = await responce.json();
   if(!responce.ok) throw new Error(data.error.message);


   //Extract and display bot responce text
   const apiResponceText = data.candidates[0].content.parts[0].text.trim();
   messageElement.innerText = apiResponceText;
}catch (error) {
    //Handle error in API response
   console.log(error)
   messageElement.innerText = error.message;
   messageElement.style.color = "#ff0000";
 } finally {
    //Reset user's file data, removing thinking indication and scroll chat to bottom
    userData.file = {};
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth" });
 }
}

//Handle outgoing user message
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";

    //create and display user message
  const messageContent = `<div class="message-text"></div>${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` : ""}`;

  const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
  outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth" });


  //simulate bot responce with thinking indicator after a delay
  setTimeout(() => {
  const messageContent = `<img class="bot-avatar" src="chatbot icon.png" alt="" width="50" height="50">
        <div class="message-text">
          <div class="thinking-indicator">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>`;

  const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
  chatBody.appendChild(incomingMessageDiv);
  chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth" });
  generateBotResponce(incomingMessageDiv);
  },600);
}

// Handle Enter key press for sending message
  messageInput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim();
  if (e.key === "Enter" && userMessage) {
    handleOutgoingMessage(e);
  }
});


// Handle file input changes and preview the selected file
fileInput.addEventListener("change", () => {
   const file = fileInput.files[0];
   if(!file) return;
    
   const reader = new FileReader();
   reader.onload = (e) => {
    const base64String = e.target.result.split(",")[1];

    //store file data in userData
    userData.file = {
        data: base64String,
        mime_type: file.type
    };
    
    fileInput.value = "";
   }

   reader.readAsDataURL(file);
});

//Initialize emoji picker
const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
        const { selectionStart, selectionEnd: end } = messageInput;
        messageInput.setRangeText(emoji.native, startTransition, end, "end");
        messageInput.focus();
    },
    onClickOutside: (e) => {
        if(e.target.id === "emoji-picker"){
            document.body.classList.toggle("show-emoji-picker");
        } else {
            document.body.classList.remove("show-emoji-picker");
        }
    }
})


document.querySelector(".chat-form").appendChild(picker);

sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e))
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());

