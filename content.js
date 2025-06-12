const bookmarkImgURL=chrome.runtime.getURL("assets/bookmark.png");
const AZ_prob_key="AZ_prob_key";

const div_class = "coding_nav_bg__HRkIn p-2 nav nav-pills w-100";
const myGeminiAPI="AIzaSyC6vZYVg4g__x6Vj1XaneNxXgld7S_Zo5g";
const ID=3178;
let obj=null,desc=null;
let cnt=0;
let prompt="hi you are a AI tutor your only task is to solve the problem that is given below you need to act as tutor and dont explain complete solution explain bit by bit if replied with anything other than problem say you cant answer or something this is the problem description and editorial code dont directly give the code rather give hints one by one dont go off topic of this problem";
const observer = new MutationObserver(() => {
  if (window.location.href.startsWith("https://maang.in/problems/")){
    addBUTTON();
    addBookmarkButton();
  }
  else{
    const x=document.getElementById("ai-chat-box");
   if(x){
    cnt=0;
    x.remove();
   }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true
});


addBookmarkButton();


window.addEventListener("message",(event)=>{
  // console.log(event.data);
  // console.log(event.data.data);
  if(typeof event?.data !=="undefined"){
    if (typeof obj?.data?.data === "undefined"){
    obj=event;
    console.log(obj.data.data);
    }
  }
});


addScript();

function getID(){
  const path = window.location.pathname; 
  const problemId = path.match(/-(\d+)$/)?.[1]; // Match digits after last hyphen at end
  
  console.log(problemId); 
  return problemId;  
}

function addScript(){
  const script=document.createElement("script");
  script.src=chrome.runtime.getURL("inject.js");
  script.onload=()=>script.remove();
  document.documentElement.appendChild(script);//ensures sipt is part of main document even if its not fully loaded yet
}


function addBUTTON() {
  const x = document.getElementsByClassName(div_class)[0];
  if (!x || document.getElementById("call-ai-button")) return;
  // getLocalStorageValuebyId(getID());

  const button = document.createElement("button");
  button.id = "call-ai-button";
  button.textContent = "AI Help";
  button.className="d-flex flex-row rounded-3 dmsans align-items-center coding_list__V_ZOZ coding_card_mod_unactive__O_IEq";
  Object.assign(button.style, {
    backgroundColor: "#4a90e2",
    color: "white",
    border: "none",
    borderRadius: "50px",
    padding: "12px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.3s ease, transform 0.2s ease",
    zIndex: "10",
    marginTop: "10px",
    overflowX: 'auto',
    
  });
  button.onmouseenter = () => button.style.backgroundColor = "#357ABD";
  button.onmouseleave = () => button.style.backgroundColor = "#4a90e2";

  button.addEventListener("click", showChatBox);
  x.insertAdjacentElement("beforeend", button);

  
}

async function handleQuery(input) {
  const query = input.value || input;
  if (query.trim() === "") return;
  let id=getID();
  const historyKey = `chatHistory${id}`;
  let history = [];
  let problemObj=obj.data.data;
  // If no chat history, insert problem prompt context
  if (!localStorage.getItem(historyKey)) {
    const initialPromptParts = [];

    // Assuming prompt, desc, and problemObj are global variables already set
    initialPromptParts.push({ text: prompt });
    initialPromptParts.push({ text: desc });

    if (problemObj.inputFormat) initialPromptParts.push({ text: "Input Format:\n" + problemObj.inputFormat.replace(/<[^>]*>/g, '') });
    if (problemObj.outputFormat) initialPromptParts.push({ text: "Output Format:\n" + problemObj.outputFormat.replace(/<[^>]*>/g, '') });

    if (problemObj.hints?.hint1) initialPromptParts.push({ text: "Hint 1:\n" + problemObj.hints.hint1.replace(/<[^>]*>/g, '') });
    if (problemObj.hints?.hint2) initialPromptParts.push({ text: "Hint 2:\n" + problemObj.hints.hint2.replace(/<[^>]*>/g, '') });

    if (problemObj.hints?.solution_approach) {
      initialPromptParts.push({ text: "Solution Approach:\n" + problemObj.hints.solution_approach.replace(/<[^>]*>/g, '') });
    }

    if (Array.isArray(problemObj.editorialCode)) {
      initialPromptParts.push({ text: "Editorial Code:\n" + problemObj.editorialCode.join("\n") });
    }

    history.push({
      role: "user",
      parts: initialPromptParts
    });
  } else {
    history = JSON.parse(localStorage.getItem(historyKey));
  }

  // Add user's latest message
  history.push({
    role: "user",
    parts: [{ text: query }]
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${myGeminiAPI}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: history })
    });

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (reply) {
      history.push({
        role: "model",
        parts: [{ text: reply }]
      });

      localStorage.setItem(historyKey, JSON.stringify(history));
      return reply;
    } else {
      return "AI did not return a response.";
    }

  } catch (err) {
    console.error("Error from Gemini API:", err);
    return "Something went wrong while fetching AI response.";
  }
}


//Chatbox
function showChatBox() {
  if (document.getElementById("ai-chat-box")) {
    document.getElementById("ai-chat-box").style.display = "flex";
    return;
  }

  const chatBox = document.createElement("div");
  chatBox.id = "ai-chat-box";
  Object.assign(chatBox.style, {
    // position: "fixed",
    bottom: "80px",
    right: "20px",
    width: "300px",
    height: "400px",
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "10px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
    display: "flex",
    flexDirection: "column",
    zIndex: "1000",
    overflow: "hidden",
    resize: "none"
    // position: "fixed"
  });
 
  chatBox.style.position = "fixed"; // Ensure fixed positioning for drag
  chatBox.style.left = ""; // Let position be set later when dragging
  chatBox.style.top = "";  // Same here

  // Header with drag and close
  const header = document.createElement("div");
  header.textContent = "AI Chat";
  Object.assign(header.style, {
    background: "#4a90e2",
    color: "white",
    padding: "10px",
    cursor: "move",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "bold"
  });

  const closeBtn = document.createElement("span");
  closeBtn.innerHTML = "&times;";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontSize = "20px";
  closeBtn.style.marginLeft = "10px";
  closeBtn.style.userSelect = "none";
  closeBtn.onclick = () => chatBox.style.display = "none";
  header.appendChild(closeBtn);

  // Chat area
  const chatMessages = document.createElement("div");
  chatMessages.style.flex = "1";
  chatMessages.style.overflowY = "auto";
  chatMessages.style.padding = "10px";
  // chatMessages.innerHTML = "<p style='color:#888;'>Welcome! How can I help you?</p>";

  // Input field
  const x1 = document.createElement("div");
  Object.assign(x1.style, {
    display: "flex",
    alignItems: "center",
    padding: "0 10px 10px 10px"
  });
  
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Type your doubt";
  Object.assign(input.style, {
    flex: "1", 
    margin: "10px 10px 10px 0",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "5px"
  });
  
  const button1 = document.createElement("button");
  button1.textContent = "Send";
  Object.assign(button1.style, {
    backgroundColor: "#4a90e2",
    color: "white",
    border: "none",
    borderRadius: "30px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.3s ease, transform 0.2s ease",
    zIndex: "1000",
    padding: "8px 16px",
    marginTop: "10px"
  });

  // button1.addEventListener("click",()=>{
  //   if(input.value.trim()==="")return;
  //   handleQuery(input);
  //   const msg = document.createElement("div");
  //   Object.assign(msg.style, {
  //     backgroundColor: "#f0f0f0",
  //     padding: "6px 10px",
  //     borderRadius: "6px",
  //     margin: "5px 0",
  //     whiteSpace: "pre-wrap",
  //     wordBreak: "break-word",
  //     overflowWrap: "break-word",
  //     maxWidth: "100%"
  //   });
    
  //   chatMessages.appendChild(msg);
  //   input.value = "";
  //   chatMessages.scrollTop = chatMessages.scrollHeight;
  // });
  button1.addEventListener("click", async () => {
    const text = input.value.trim();
    if (text === "") return;
  
    const userMsg = document.createElement("div");
    userMsg.textContent = text;
    Object.assign(userMsg.style, {
      backgroundColor: "#f0f0f0",
      padding: "6px 10px",
      borderRadius: "6px",
      margin: "5px 0",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      overflowWrap: "break-word",
      maxWidth: "100%"
    });
    chatMessages.appendChild(userMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  
    input.value = "";
  
    // Send to API and display response
    const aiResponse = await handleQuery({ value: text });
    if (aiResponse) {
      const aiMsg = document.createElement("div");
      aiMsg.textContent = aiResponse;
      Object.assign(aiMsg.style, {
        backgroundColor: "#e0f7fa",
        padding: "6px 10px",
        borderRadius: "6px",
        margin: "5px 0",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        maxWidth: "100%"
      });
      chatMessages.appendChild(aiMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });
  
  

  x1.appendChild(input);
  x1.appendChild(button1);

  chatBox.appendChild(header);
  chatBox.appendChild(chatMessages);
  chatBox.appendChild(x1);

  // Resizer
  const resizer = document.createElement("div");
  Object.assign(resizer.style, {
    width: "15px",
    height: "15px",
    position: "absolute",
    right: "0",
    bottom: "0",
    cursor: "nwse-resize",
    backgroundColor: "transparent",
    zIndex: "10"
  });
  chatBox.appendChild(resizer);

  let isResizing = false;

  resizer.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isResizing = true;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;
    const rect = chatBox.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    const newHeight = e.clientY - rect.top;
    if (newWidth > 200) chatBox.style.width = `${newWidth}px`;
    if (newHeight > 200) chatBox.style.height = `${newHeight}px`;
  });

  document.addEventListener("mouseup", () => {
    isResizing = false;
    document.body.style.userSelect = "auto";
  });

  // Drag functionality
  let isDragging = false, offsetX = 0, offsetY = 0;
  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - chatBox.getBoundingClientRect().left;
    offsetY = e.clientY - chatBox.getBoundingClientRect().top;
    chatBox.style.transition = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      chatBox.style.left = `${e.clientX - offsetX}px`;
      chatBox.style.top = `${e.clientY - offsetY}px`;
      chatBox.style.bottom = "auto";
      chatBox.style.right = "auto";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  document.body.appendChild(chatBox);
  loadChatHistory();
}

function loadChatHistory() {
  let id=getID();

  const historyKey = `chatHistory${id}`;
  const chatMessages = document.querySelector("#ai-chat-box > div:nth-child(2)");
  if (!chatMessages) return;

  const historyJSON = localStorage.getItem(historyKey);
  if (!historyJSON) return;

  try {
    const history = JSON.parse(historyJSON);

    // Skip the first entry if it is the initial prompt/editorial setup
    for (let i = 0; i < history.length; i++) {
      const entry = history[i];
      if (!entry?.parts?.length) continue;

      // Skip the very first system/prompt-style message if history starts with that
      if (i === 0 && entry.role === "user" && entry.parts.length > 1) continue;

      const text = entry.parts.map(p => p.text).join("\n");
      const msg = document.createElement("div");
      msg.textContent = text;
      msg.style.padding = "6px 10px";
      msg.style.borderRadius = "6px";
      msg.style.margin = "5px 0";
      msg.style.whiteSpace = "pre-wrap"; // wrap long lines

      if (entry.role === "user") {
        msg.style.backgroundColor = "#f0f0f0";
        msg.style.alignSelf = "flex-end";
      } else if (entry.role === "model") {
        msg.style.backgroundColor = "#e6f0ff";
        msg.style.alignSelf = "flex-start";
      }

      chatMessages.appendChild(msg);
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (err) {
    console.error("Failed to parse chat history:", err);
  }
}




function getLocalStorageValuebyId(id){
   const key=`course_${ID}_${id}_C++14`;
   const value=localStorage.getItem(key);
   if(value!==null){
    console.log(`Value for key ${key}: `,value);
   }
   else{
    console.log(`key ${key} not found`);
   }
   return value;
}



function onProblemPage(){
  return window.location.pathname.startsWith('/problems/');
}

function addBookmarkButton() {
  console.log("triggering");
  if (document.getElementById("add-bookmark-button")) return;
  console.log("in");
  setTimeout(()=>{
    cnt=1;
    let x=document.getElementsByClassName("w-100");
    // console.log(x[5].innerText);
    desc=x[5].innerText;
    // console.log(desc);
  },3000);
  const bookmarkButton = document.createElement("button");
  bookmarkButton.id = "add-bookmark-button";
  bookmarkButton.className = "d-flex flex-row rounded-3 dmsans align-items-center coding_list__V_ZOZ coding_card_mod_unactive__O_IEq";

  // Style the button to match AI Help
  Object.assign(bookmarkButton.style, {
    backgroundColor: "#4a90e2",
    border: "none",
    borderRadius: "50px",
    padding: "8px 14px",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.3s ease, transform 0.2s ease",
    zIndex: "10",
    marginTop: "10px",
    marginLeft: "10px",   
    marginRight: "10px", 
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  // Create and style the image inside the button
  const img = document.createElement("img");
  img.src = bookmarkImgURL;
  img.alt = "Bookmark";
  img.style.height = "30px";
  img.style.width = "30px";
  img.style.display = "block";

  bookmarkButton.appendChild(img);

  // Hover effect
  bookmarkButton.onmouseenter = () => bookmarkButton.style.backgroundColor = "#357ABD";
  bookmarkButton.onmouseleave = () => bookmarkButton.style.backgroundColor = "#4a90e2";

  bookmarkButton.addEventListener("click", addURL);

  const askDoubt = document.getElementsByClassName(div_class)[0];
  askDoubt.insertAdjacentElement("beforeend", bookmarkButton);
  console.log("added");
}


async function addURL(){
  const currBookmark=await getCurrentBookmark();
  const URL=window.location.href;
  const uniqueid=getid(URL);
  const probname=document.getElementsByClassName("Header_resource_heading__cpRp1")[0].innerText;

  const bookmarkObj={
      id:uniqueid,
      name: probname,
      url: URL
  }
  const updatedBookmark=[...currBookmark,bookmarkObj];
  chrome.storage.sync.set({AZ_prob_key: updatedBookmark},()=>{
      console.log("updated to ",updatedBookmark);
  });
}


function getid(URL){
  const start=URL.indexOf("problems/")+"problems/".length;
  const end=URL.indexOf("?");
  return end===-1?URL.substring(start):URL.substring(start,end);
}

function getCurrentBookmark(){
  return new Promise((resolve,reject)=>{
      chrome.storage.sync.get([AZ_prob_key],(results)=>{
          resolve(results[AZ_prob_key]|| []);
      });
  });
}