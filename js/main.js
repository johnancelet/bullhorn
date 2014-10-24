// We keep a lastDistributionList in localStorage, which matches
// the last distribution list viewed on the web page.
// When the user clicks the 'transfer' button, the information
// of this list is transferred to dotmailer.
var MAIN = {
  lastDistributionList: undefined,
  setLastDistributionList: function (list) {
    console.log('setLastDistributionList', list);
    $('#distribution-list-name').html(list === undefined ? 'nothing' : list.name);
    MAIN.lastDistributionList = list;
  },
  transferLastDistributionList: function () {
    if (MAIN.lastDistributionList === undefined) {
      throw new Error("No distribution list set!");
    }
    chrome.runtime.sendMessage({
      event: 'transferDistributionList',
      data: {
        distributionList: MAIN.lastDistributionList
      }
    })
  }
}

chrome.storage.sync.get('lastDistributionList', function (items) {
  console.log('chrome.storage.sync.get(lastDistributionList)', items);
  console.log(items);
  console.log(items.lastDistributionList);
  MAIN.setLastDistributionList(items.lastDistributionList);
});
chrome.storage.onChanged.addListener(function (changes, namespace) {
  console.log('chrome.storage.onChanged', changes)
  if (changes.lastDistributionList === undefined) {
    return;
  }
  MAIN.setLastDistributionList(changes.lastDistributionList);
});

$('#transfer').click(MAIN.transferLastDistributionList);
