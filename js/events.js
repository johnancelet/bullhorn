console.log('setting up events');

chrome.runtime.onMessage.addListener(function (message, MessageSender, sendReponse) {
  console.log('chrome.runtime.onMessage', message, MessageSender, sendReponse);

  switch (message.event) {

    // Use the rest token extracted from bullhorn local storage
    case 'restToken':
      BH.config.restToken = message.data.token;
      break;

    // Update a dotmailer addressbook with bullhorn contacts
    case 'transferDistributionList':
      BH.fetchDistributionList(message.data.distributionList.id)
        .then(function (contacts) {
          DM.updateAddressBook(message.data.distributionList.id, contacts);
        })
      break;

  }

})


