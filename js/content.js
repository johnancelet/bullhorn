// Fetch the bullhorn rest-token from localstorage and
// pass it to the background process.
// TODO update these with window.on 'storage'
chrome.runtime.sendMessage({
  event: 'restToken',
  data: {
    token: JSON.parse(localStorage['BhRestToken'])
  }
});

chrome.runtime.sendMessage({
  event: 'privateLabel',
  data: {
    token: JSON.parse(localStorage['PrivateLabel'])
  }
});

// Keep the distribution list information (id, name) in the background
// in sync with the front.
function updateDistributionList (list) {
  console.log('updateDistributionList', list)
  chrome.storage.sync.set({lastDistributionList: list});
};

function onStorage(event) {
  console.log('onStorage', event.key);
  if (event.key !== 'PersonList') {
    return;
  }
  var list = JSON.parse(event.newValue).distributionList;
  updateDistributionList(list);
}

window.addEventListener('storage', onStorage, false);

if (localStorage['PersonList'] !== undefined) {
  updateDistributionList(JSON.parse(localStorage['PersonList']));
}

