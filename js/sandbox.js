var SANDBOX = {
  bullhornParameters: {},
  contacts: [],

  init: function () {
    $('#show-distribution-list').on('click', SANDBOX.showDistributionLists);
    $('#get-bullhorn-params').on('click', SANDBOX.getBullhornParameters);
    $('#upload-contacts').on('click', SANDBOX.uploadContacts);
    $('#ensure-address-book').on('click', SANDBOX.ensureAddressBook);

    EVENTS.init();
  },

  getBullhornParameters: function () {
    chrome.tabs.query({
      url: "https://*.bullhornstaffing.com/*"
    }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'getBullhornParameters'
      }, function (params) {
        SANDBOX.bullhornParameters = params;
        $('#bullhorn-params').html(JSON.stringify(params));
      })
    })
  },

  showDistributionLists: function () {
    var listId = $('#distribution-list-id').val() || SANDBOX.bullhornParameters.distributionList.id;

    var contacts = Bullhorn(SANDBOX.bullhornParameters.config)
      .fetchDistributionList(listId)
      .then(function (contacts) {
        SANDBOX.contacts = contacts;
        $('#distribution-list-array').html(JSON.stringify(contacts));
        $('#distribution-list-csv').html(DM.contactsToCSV(contacts));
      });
  },

  ensureAddressBook: function () {
    var name = $('#address-book-name').val() || SANDBOX.bullhornParameters.distributionList.id;
    DM.ensureAddressBookId(name).then(function (id) {
      $('#address-book-id').html(id);
    });
  },

  uploadContacts: function () {
    var name = $('#address-book-name').val() || SANDBOX.bullhornParameters.distributionList.id;

    DM.updateAddressBookByName(name, SANDBOX.contacts)
      .then(function (data) {
        console.log('GREAT SUCCESS');
      })
      .fail(function (err) {
        console.log({err: err});
      });
  }
}

$(SANDBOX.init)