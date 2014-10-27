/*
 * Listeners and Events
 */
// when the extension in installed
chrome.runtime.onInstalled.addListener(function (details) {
    chrome.browserAction.setBadgeBackgroundColor({color: mc.iconBadgeColor});
    mc.init(function () {
        if (!mc.apikey) {
            mc.openSettingsTab();
        } else {
            extn.setBadgeText(mc.stats.unique_opens.toShortString());
        }
    });
});

// when storage is updated
chrome.storage.onChanged.addListener(function (changes) {
    if (changes.apikey != undefined) mc.onApiKeyChange(changes.apikey);
    if (changes.stats !== undefined) {
        mc.setStats(changes.stats);
        mc.notifyStatsUpdate();
    }
    if (changes.refreshPeriod !== undefined) mc.onRefreshPeriodChange(changes.refreshPeriod);
});


// when the refresh timer ticks
chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name == 'refresher') mc.fetchCampaign();
});

function checkForValidUrl(tabId, changeInfo, tab) {
   // If  'example.com' is the hostname for the tabs url.
   var a = document.createElement ('a');
   a.href = tab.url;
   if (a.hostname == "example.com") {
       // ... show the page action.
       chrome.pageAction.show(tabId);
   }
};

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);
//For highlighted tab as well
chrome.tabs.onHighlighted.addListener(checkForValidUrl);