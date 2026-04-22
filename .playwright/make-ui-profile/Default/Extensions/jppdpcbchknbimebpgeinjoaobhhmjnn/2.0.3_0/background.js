// contexts: 
// "all", "page", "frame", "selection", "link", "editable", "image", "video", "audio", "launcher", "browser_action", "page_action", or "action"
const maxHistory = 28;

function updateContext() {
  chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    "id": "linangPickColor",
    "title": 'Pick a color on the page',
    "contexts": ["all"]
  });
  /* chrome.contextMenus.create({
    "id": "linangPickColorFull", 
    "title": 'Alternate pick color', 
    "contexts":["selection"]
  }); */
}
updateContext();

function addHistory(hist, x) {
  try {
    hist.unshift(x);
  if (hist.length > maxHistory) {
    hist.length = maxHistory;
  }
  return hist;
  } catch (err) {
    console.log(err);
    return hist;
  }
}

/* Listen for messages */
chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
  try {
    // console.log(request); 
    if (request && request.eyedropper) {
      // console.log("eyedropper", request.eyedropper);
      // sendResponse({ message: 'success' });

      chrome.tabs.query({active: true}, tabs =>{
        // console.log("tabs", tabs);
        // console.log("tabs[0]", tabs[0]);
        if (tabs.length && tabs.length === 2 && tabs[1].url) {
          pickColor({}, tabs[1] );
        } else if (tabs.length && tabs.length) {
          pickColor({}, tabs[0] );
        }
      })
    } else if (request && request.hex) {

      chrome.storage.sync.get({
        eyedropperHistory: [],
      }, items => {
        let eyeDHistory = Array.isArray(items.eyedropperHistory) ? items.eyedropperHistory : [];
        eyeDHistory = addHistory(eyeDHistory, request.hex);
        // eyeDHistory.unshift(request.hex);
        // console.log("eyedropperHistory", eyeDHistory);
        chrome.storage.sync.set({
          // Cycle through array of n-colors previously picked...
          eyedropperHistory: eyeDHistory

          // eyedropperHistory: null
        }, () => {
          // console.log('Eyedropper history saved')
        });
      });

    }
    return true;
  } catch (err) {
    console.log(err);
  }
});

chrome.contextMenus.onClicked.addListener( (info, tab) => {
  pickColor(info, tab);
});

function pickColor(info, tab) {
  try {
    // console.log('pickColor:', tab);

    const zoom = chrome.tabs.getZoom(tab.id, (zoom) => {
      const width = tab.width / zoom;
      const height = tab.height / zoom;
      // console.log(zoom, width, height);
      chrome.tabs.captureVisibleTab(null, {
        format: 'png'
        // format: 'jpeg',
        // quality: 100
      }, function (dataUrl) {
        // console.log(dataUrl);

        function passImageData(dataUrl, width, height) {
          cp_imgSrc = dataUrl; 
          cp_width = width; 
          cp_height = height;
        }

        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          func: passImageData,
          args: [dataUrl, width, height],
        });  
        
        chrome.scripting.executeScript({
          target: {tabId: tab.id},
          files: ["content.js"],
        }); 

        /* Manifest v2  */
        /* chrome.tabs.executeScript({code:`var cp_imgSrc = "${dataUrl}"; cp_width = ${width}; cp_height = ${height}`}
              // function(results){ console.log(results)}; 
        ); */
        // chrome.tabs.executeScript({file: "content.js"}, () => {console.log('content.js injected')});

      });
    });
  } catch (err) {
      console.error(err)
  }

}