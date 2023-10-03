const fileListElement = document.getElementById('fileList');
const folderListElement = document.getElementById('folderList');
var clickedFolder = '';
var clickedFile = '';

var imageName_fileKey = {};



const userID = document.getElementById("userID");
const userButton = document.getElementById("userButton");


userButton.addEventListener("click",function(event){
  event.preventDefault();
  console.log(userID.value);
  loadFolders(userID.value);
  
});

document.addEventListener("keydown", handleKeyPressed);

function handleKeyPressed(event){
  if(event.keyCode===46){
    if(clickedFile!=''&clickedFolder!=clickedFile){
      let Delete = confirm(`Delete file: ${clickedFile}?`);
      if(Delete){
        const header = new Headers();
        header.append('file-key',imageName_fileKey[clickedFile]);
        fetch('/delete',{headers:header})
        .then(response => {
          console.log("deleteKey: "+imageName_fileKey[clickedFile]);
          loadFolders(userID.value);
        });
        
      }
    }
  }
}

async function displayFiles(files) {
  fileListElement.innerHTML = '';
  try{
  for(const file of files){
    if ((file.Key.endsWith('.jpg') || file.Key.endsWith('.jpeg') || file.Key.endsWith('.png'))&&!file.Key.endsWith('-frame.png')) {
      const biggerDiv = document.createElement('div');
      biggerDiv.setAttribute('class','biggerDivs');
      const fileElement = document.createElement('div');
      fileElement.setAttribute('class','imageDivs');
      fileElement.classList.add('file');
      let fileNameElement;
      const headers1 = new Headers();
      headers1.append('file-key',file.Key);
      fetch('/make-url',{headers:headers1})
        .then(response =>response.text())
        .then(data => {
          const fileUrl = data;
          const fileImageElement = document.createElement('img');
          fileImageElement.src = fileUrl;
          fileElement.appendChild(fileImageElement);
          fileNameElement = document.createElement('span');
          fileNameElement.textContent = file.Key.split('/').pop();
          fileElement.appendChild(fileNameElement); 
          imageName_fileKey[fileNameElement.textContent] = file.Key;  
          
          //const searchURL = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(fileUrl)}`;
          //const buttonElement = createPopUpButton(searchURL);
          //biggerDiv.appendChild(buttonElement);
        }); 
        
        fileElement.addEventListener('click',function(event){
          clickedFile = fileNameElement.textContent;
          fileFocus();
        });
        fileListElement.appendChild(biggerDiv);
        biggerDiv.appendChild(fileElement);
        
          const resultJSON = await GetJSON(file.Key);
          
        if(resultJSON){
          const resultDiv = document.createElement('div');
          resultDiv.classList.add('showResult');

          resultJSON.forEach(product =>{
            const fileDivs = document.createElement('div');
            fileDivs.setAttribute('class','resultFile');
            const name = document.createElement('span');
            name.textContent = product.text;
            name.setAttribute('class','truncate-text');
            const resultImg = document.createElement('img');
            resultImg.src = product.imgsource;
            const Href = document.createElement('a');
            Href.href=product.url;
            fileDivs.appendChild(Href);
            resultDiv.appendChild(fileDivs);
            Href.appendChild(resultImg);
            Href.appendChild(name);            
          });
          const checkAll = document.createElement('button');
          checkAll.textContent = 'ALL';
          checkAll.addEventListener('click',function(event){
            

            const allResultsFiles = biggerDiv.children[1].children;
            for(let i = 0; i<allResultsFiles.length; i++){
              allResultsFiles[i].classList.add('highlighted');
            }
          });
          const inputDiv = document.createElement('div');
          inputDiv.classList.add('inputDiv');
          const resultInput = document.createElement('input');
          resultInput.type = 'text';
          resultInput.placeholder = 'Enter Result';
          const linkInput = document.createElement('input');
          linkInput.type = 'text';
          linkInput.placeholder = 'Enter Result Link';
          biggerDiv.appendChild(resultDiv);
          biggerDiv.appendChild(checkAll);

          inputDiv.appendChild(resultInput);
          inputDiv.appendChild(linkInput);
          biggerDiv.appendChild(inputDiv);
        }
    }
  }
  }catch(error){
    console.error(error);
  }

  const allLinks = document.querySelectorAll('a');

  allLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      if (!event.ctrlKey) {
        event.preventDefault();
      }
    });
  });
  ResultFocus();

  const renderButton = document.createElement('button');
  fileListElement.appendChild(renderButton);
  renderButton.classList.add('renderButton');
  renderButton.textContent = 'RENDER';
  renderButton.addEventListener('click', function(event){
    const HighlightedLinks = getAllHighlighted();
    for(const num in HighlightedLinks){
      fetchFindProduct(HighlightedLinks[num],num);
    }
    
  });

  const SendButton = document.createElement('button');
  fileListElement.appendChild(SendButton);
  SendButton.classList.add('renderButton');
  SendButton.textContent = 'SEND';
  SendButton.addEventListener('click', function(event){
    const ResultNameLink = getResultNameLink();
    console.log('resultNameLink',ResultNameLink);
    sendResultJSON(ResultNameLink);
    
  });
}

function sendResultJSON(result){
  fetch(`https://kjoym6c9d2.execute-api.ap-northeast-2.amazonaws.com/default/sam-jsonUpload-JsonUploadFunction-VwFTvPo0hwAw?foldername=${clickedFolder}&userID=${userID.value}`,{
    method: 'POST',
    body: JSON.stringify(result),
  })
  .then((response) => response.json())
  .then((data) => {
    console.log('Response from Lambda:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

function getResultNameLink(){
  let result = [];
  const biggerDivs = document.getElementsByClassName('biggerDivs');
  for(const i in Array.from(biggerDivs)){
    const resultFiles = biggerDivs[i].children[1].children;
    for(const index in Array.from(resultFiles)){
      if(resultFiles[index].classList.contains('highlighted')){
        const num = biggerDivs[i].children[0].textContent.replace('.png','');
        const name = biggerDivs[i].children[3].children[0].value;
        const link = biggerDivs[i].children[3].children[1].value;

        result.push({num: num, name: name, link: link});
        break;
      }
    }
  }
  return result;
}
function fetchFindProduct(link,num){
  fetch(`https://tb7bhxxsj1.execute-api.ap-northeast-2.amazonaws.com/default/sam-gpt-Gpt-WAH8Jfq0Aq1k?siteurl=${encodeURI(link)}`)
    .then(response => response.text())
    .then(data => {
      console.log(data,num);
    })
    .catch(error => {
      console.error(error);
    })
}
function getAllHighlighted(){
  let result = [];
  const allResultDivs = document.getElementsByClassName('showResult');
  for(const i in Array.from(allResultDivs)){
    const resultFiles = allResultDivs[i].children;
    for(const index in Array.from(resultFiles)){
      if(resultFiles[index].classList.contains('highlighted')){
        if(resultFiles[0].classList.contains('highlighted')&&resultFiles[1].classList.contains('highlighted')){
          searchByRow(i);
          break;
        }
        result.push(resultFiles[index].children[0].href);
      }
    }
    
  }
  return result;
}
function searchByRow(i){
  let texts = '';
  const AllResultDivs = document.getElementsByClassName('showResult');
  for(const resultFiles of Array.from(AllResultDivs[i].children)){
    texts+='// '+resultFiles.textContent;
  }

  fetch(`/gpt?text=${encodeURIComponent(texts)}`)
    .then(response => response.text())
    .then(data => {
      console.log(data,i);
    });

}
async function GetJSON(key){
  const jsonKey = key.replace(".png",".json");
  const link = 'https://taewons3.s3.ap-northeast-2.amazonaws.com/'+jsonKey;
  try {
    const response = await fetch(link);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error("Response was not OK:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching JSON:", error);
    return null;
  }
}


    

function createPopUpButton(url){
  const newButton = document.createElement('button');
  newButton.className = 'googleSearchButton';
  newButton.textContent = 'search';
  newButton.addEventListener('click',function(){
    window.open(url,'_blank');
  });
  return newButton;
}
function fileFocus(){
    const imageDivs = fileListElement.querySelectorAll('.imageDivs');

  imageDivs.forEach((imageDiv) => {
    const fileSpan = imageDiv.querySelector('span');
    if (fileSpan.textContent === clickedFile) {
      imageDiv.classList.add('bordered');
    } else {
      imageDiv.classList.remove('bordered');
    }
  });
}
function folderFocus(){
  const folderDivs = folderListElement.querySelectorAll('.folder');

  folderDivs.forEach((folderDiv) => {
    const folderSpan = folderDiv.querySelector('span');

    if (folderSpan.textContent === clickedFolder) {
      folderSpan.classList.add('highlighted');
    } else {
      folderSpan.classList.remove('highlighted');
    }
  });
}

function displayFolders(folders){
    folderListElement.innerHTML = '';
    
    folders.forEach(folder =>{
      const folderDiv = document.createElement('div');
      const folderElement = document.createElement('div');
      folderElement.classList.add('folder');
      const folderNameElement = document.createElement('span');
      folderNameElement.setAttribute('id','folderNameSpan');
      folderNameElement.textContent = folder;
      folderElement.appendChild(folderNameElement);
      folderDiv.appendChild(folderElement);
      folderListElement.appendChild(folderDiv);

      folderElement.addEventListener('click',function(event){
        getFiles(userID.value+'/'+folder);
        clickedFolder = folder;
        clickedFile = folder;
        folderFocus();

        const button = document.createElement('button');
        folderDiv.appendChild(button);
        button.textContent='search';
        button.addEventListener('click',function(event){
          event.preventDefault();
          crawlAll(userID.value+'/'+folder);
        });
      });
    });
}

function ResultFocus(){
  const showResults = document.getElementsByClassName('showResult');
  for(let i in showResults){
    if (!isNaN(i)) {
      let resultDiv = showResults[i].children;
      for(let j in resultDiv){
        if (!isNaN(j)) {
          const thisDiv = resultDiv[j];
          
          thisDiv.addEventListener('click',function(event){
            thisDiv.classList.toggle('highlighted');
            for(let k in resultDiv){
              if(!isNaN(k)&&j!=k){
                const otherDiv = resultDiv[k];
                otherDiv.classList.remove('highlighted');
              }
            }
          });
        }
      }
    }
  }
}

function crawlAll(prefix){
  const ip = 'https://vzsi1gwjbg.execute-api.ap-northeast-2.amazonaws.com/default/crawler-CrawlerFunction-RrLxuYMWRCt6';
  
  
  fetch(`/files?folder=${prefix}`)
    .then(response=>response.json())
    .then(files=>{
      files.forEach(file=>{
        if ((file.Key.endsWith('.jpg') || file.Key.endsWith('.jpeg') || file.Key.endsWith('.png'))&&!file.Key.endsWith('-frame.png')) {

          const link = ip+`?link=https%3A%2F%2Ftaewons3.s3.ap-northeast-2.amazonaws.com%2F${encodeURI(file.Key)}&num=5`;
          
          fetch(link)
            .then(response=>response.json())
            .then(data=>{console.log(data)})
        }
      })
    })
}

 function getFiles(prefix){
    fetch(`/files?folder=${prefix}`)
        .then(response => response.json())
        .then(files => {
            displayFiles(files);
        })
        .catch(error => {
            console.error(error);
        });
 }
 function loadFolders(userid){
  fetch(`/folders?userid=${userid}`)
  .then(response=>response.json())
  .then(folders=>{
    displayFolders(folders);
  })
  .catch(error=>{
    console.error(error);
  });
  clickedFile = '';
  fileListElement.innerHTML = '';
 }
 