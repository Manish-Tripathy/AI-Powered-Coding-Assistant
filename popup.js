const AZ_prob_key="AZ_prob_key";


const assetsURLMap={
    "play": chrome.runtime.getURL("assets/play.png"),
    "delete": chrome.runtime.getURL("assets/delete.png")
}

const bookmarkSection=document.getElementById("bookmarks");
document.addEventListener("DOMContentLoaded",()=>{
    chrome.storage.sync.get([AZ_prob_key],(data)=>{
        const currentBookmark=data[AZ_prob_key]||[];
        viewbookmark(currentBookmark);
    });
});

function viewbookmark(bookmarks){
    bookmarkSection.innerHTML="";
    if(bookmarks.length===0){
        bookmarkSection.innerHTML="<i>No Bookmark to Show</i>";
        return;
    }

    bookmarks.forEach((bookmark) => addNewBookmark(bookmark));
}


function addNewBookmark(bookmark){
  const newBookmark=document.createElement('div');
  const bookmarkTitle=document.createElement('div');
  const bookmarkControls=document.createElement('div');


  bookmarkTitle.textContent=bookmark.name;
  bookmarkTitle.classList.add("bookmark-title");
  
  bookmarkControls.classList.add("bookmark-controls");

  setControlAttribute(assetsURLMap["play"],onPlay,bookmarkControls);
  setControlAttribute(assetsURLMap["delete"],onDelete,bookmarkControls);
   
  newBookmark.classList.add("bookmark");
  newBookmark.setAttribute("url",bookmark.url);
  newBookmark.setAttribute("bookmark-id",bookmark.id);

  newBookmark.append(bookmarkTitle);
  newBookmark.append(bookmarkControls);

  bookmarkSection.appendChild(newBookmark);
}


function setControlAttribute(src,handler,parentDiv){
  const controlElement=document.createElement("img");
  controlElement.src=src;
  controlElement.addEventListener("click",handler);
  parentDiv.appendChild(controlElement);
}

function onPlay(event){
   const URL= event.target.parentNode.parentNode.getAttribute("url");
   window.open(URL,"_blank");
}

function onDelete(event){
    const bookmarkItem=event.target.parentNode.parentNode;
    const idToRemove=bookmarkItem.getAttribute("bookmark-id");
    bookmarkItem.remove();

    deleteItemFromStorage(idToRemove);
}


function deleteItemFromStorage(idToRemove){
    chrome.storage.sync.get([AZ_prob_key],(data)=>{
     const currBookmark=data[AZ_prob_key]|| [];
     const updatedBookmark=currBookmark.filter((bookmark)=>bookmark.id!=idToRemove);
     chrome.storage.sync.set({AZ_prob_key:updatedBookmark});
    });
}