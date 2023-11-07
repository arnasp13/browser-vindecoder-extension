importScripts("ExtPay.js"); // or `import` / `require` if using a bundler
const extpay = ExtPay("vindecoder");
extpay.startBackground(); // this line is required to use ExtPay in the rest of your extension

extpay.getUser().then((user) => {
  if (user.paid) {
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
  } else {
    extpay.openPaymentPage();
  }
});
