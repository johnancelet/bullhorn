console.log('setting up events');

// Use the rest token extracted from bullhorn local storage
SHARED.events.on('restToken', function (data) {
  BH.config.restToken = data.token;
});

// Update a dotmailer addressbook with bullhorn contacts
SHARED.events.on('transferDistributionList', function (data) {


  BH.fetchDistributionList(data.distributionList.id)
    .then(function (contacts) {
      DM.updateAddressBook(data.distributionList.id, contacts);
    })
});

SHARED.storage.watch('dotmailerCredentials', DM.authenticate);

chrome.runtime.onMessage.addListener(function (message, MessageSender, sendReponse) {
  console.log('chrome.runtime.onMessage', message, MessageSender, sendReponse);
});
