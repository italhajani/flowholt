// Extension by BrowserNative: https://browsernative.com/save-webpage-offline/
function urlDomain(data) {
    let url = new URL(data);
    return url.hostname ?? "";
}

let tempFileName = "";

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
    if (downloadItem.mime === "application/x-mimearchive") {
        let filename = tempFileName;
        tempFileName = "";
        if (!filename.toLowerCase().endsWith('.mhtml')) {
            filename = filename + '.mhtml';
        }
        suggest({
            filename: filename,
            conflictAction: 'uniquify'
        });
        return true;
    }
});

function saveMHTML(tab) {
    chrome.pageCapture.saveAsMHTML({"tabId": tab.id}, function(mhtmlData){
        let mhtmlBlob  = new Blob([mhtmlData], { type: 'application/x-mimearchive' });
        let fileName = tab.title.replace(/[^a-z0-9]/gi, ' ').trim().replace(/\s+/g, '-') + "-" + urlDomain(tab.url) + ".mhtml";
        tempFileName = fileName;
        const reader = new FileReader();
        reader.onload = function() {
            chrome.downloads.download({
                url: reader.result,
                filename: fileName,
                saveAs: false
            });
        };
        reader.readAsDataURL(mhtmlBlob);
    });
}

function onClickHandler(info, tab) {
    saveMHTML(tab);
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

chrome.action.onClicked.addListener(function(tab) {
    saveMHTML(tab);
});

// first run
chrome.runtime.onInstalled.addListener(function(details) {
    
    chrome.contextMenus.create({
        "id": "saveMhtml",
        "title": "Save page as MHTML",
        "contexts": ["page"]
    });
    
    
    if (details.reason === "install") {
        chrome.tabs.create({
            url: "https://browsernative.com/save-webpage-offline-mhtml/"
        });
    }
});