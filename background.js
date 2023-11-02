chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "decodeVIN",
    title: "Decode VIN",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "decodeVIN") {
    const vin = encodeURIComponent(info.selectionText);
    const url = chrome.runtime.getURL(`popup.html?vin=${vin}`);
    chrome.tabs.create({ url });
  }
});
