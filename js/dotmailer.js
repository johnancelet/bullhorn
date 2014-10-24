var DM = {
  config: {
    host: 'https://api.dotmailer.com/v2',
    apiToken: null
  },

  initialize: function () {
    DM.config.apiToken = localStorage.get('dotmailerApiToken');
  },

  ajax: function (method, path, options) {
    if (options === undefined) {
      options = {};
    }

    options.method = method;
    options.url = DM.config.host + path;

    // Check for apiToken
    // Apply auth
    // return $.ajax(options);
    console.log("DM.ajax", options);
    return;
  },

  addressBookId: function (id) {
    return 'bullhort-distributionlist-' + id;
  },

  createAddressBook: function (id) {},

  ensureAddressBook: function (id) {},

  updateAddressBook: function (id, contacts) {
    console.log('updateAddressBook', id, contacts);
    var csv = DM.contactsToCSV(contacts);

    // TODO specify csv type

    var options = {
      data: csv
    }

    // TODO report progress

    return DM.ajax('POST', '/address-books/' + id + '/contacts/import', options);
  },

  // Take an array of contacts and turn them into a csv string
  contactsToCSV: function (contacts) {
    var rows = ['Email'];
    contacts.forEach(function (contact) {
      rows.push(contact.email)
    });
    return rows.join(';\n');
  }

}
