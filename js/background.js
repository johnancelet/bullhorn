chrome.runtime.onMessage.addListener(console.log.bind(console, 'chrome.runtime.onMessage'));

// chrome.runtime.onInstalled.addListener(function() {
chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
  chrome.declarativeContent.onPageChanged.addRules([{
    conditions: [
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {
          hostSuffix: '.bullhornstaffing.com'
        }
      })
    ],
    actions: [new chrome.declarativeContent.ShowPageAction()]
  }]);
});

EVENTS.init();
