/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const placeholderText = document.getElementById("placeholderText");

const placeholderTexts = [
  "Discover your ideal beauty routine...",
  "Find products for your skin type...",
  "Ask about skincare, haircare, or routines...",
  "Need help choosing the right serum?",
  "Looking for products for dry or damaged hair?",
  "Build a personalized skincare routine...",
  "Find the right moisturizer for your skin...",
  "Explore products for healthy-looking hair...",
  "Ask for a routine tailored to your needs...",
  "Get beauty recommendations in seconds..."
];

function getRandomPlaceholder() {
  return placeholderTexts[Math.floor(Math.random() * placeholderTexts.length)];
}

userInput.placeholder = getRandomPlaceholder(); // set initial placeholder

setInterval(() => {
  userInput.placeholder = getRandomPlaceholder();
}, 5000);


//INtialize chat history
let messages = [
  {role: 'system', content: `You are a friendly L’Oréal chatbot. Your role is to only answer questions about: 
- L’Oréal products
- L’Oréal brands
- skincare, haircare, and makeup routines
- beauty recommendations using L’Oréal products
- how to use L’Oréal products

Do not answer questions outside of these topics. If a question is unrelated, say: "I can only help with L’Oréal products, routines, and recommendations."

Do Be:
- Be helpful, concise, and brand-focused.
- Use Emojis to make the conversation more engaging, emphasizing on products, and understanding of customer needs.`}
];

const workerUrl = 'https://loreal-chatbot.alizarraga2349.workers.dev';
// Set initial message
chatWindow.textContent = "How can I assist you today?";

//render the conversation with the latest user message and assistant reply
function renderConversation(userMessage, replyText) {
  chatWindow.innerHTML = "";

  const userLine = document.createElement("p");
  const userLabel = document.createElement("strong");
  userLabel.textContent = "You:";
  userLine.append(userLabel, ` ${userMessage}`);

  const assistantLine = document.createElement("p");
  const assistantLabel = document.createElement("strong");
  assistantLabel.textContent = "Assistant:";
  assistantLine.append(assistantLabel, ` ${replyText}`);

  chatWindow.append(userLine, assistantLine);
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get and validate the user's message.
  const userMessage = userInput.value.trim();
  if (!userMessage) {
    return;
  }

  // Save the user's message so it is included in chat history.
  messages.push({ role: "user", content: userMessage });
  chatWindow.textContent = "Thinking...";

  try {
    // Send chat history to the Worker.
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status ${response.status}`);
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content;

    if (!replyText) {
      throw new Error("Invalid response format from API");
    }

    // Save the assistant's response and display it.
    messages.push({ role: "assistant", content: replyText });
    renderConversation(userMessage, replyText);
  } catch (error) {
    console.error("Error:", error);
    chatWindow.textContent = "Uh-oh, something went wrong. Please try again later.";
  }

  userInput.value = "";
});
