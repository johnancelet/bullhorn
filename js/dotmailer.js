var DM = {
  config: {
    host: 'https://api.dotmailer.com/v2',
    credentials: null
  },

  ajax: function (method, path, options) {
    if (!DM.credentials) {
      // TODO error code
      throw new Error("Unauthorized");
    }

    if (options === undefined) {
      options = {};
    }

    if (options.data === undefined) {
      options.data = {};
    }

    options.method = method;
    options.url = DM.config.host + path;

    options.data.username = DM.credentials.username;
    options.data.password = DM.credentials.password;

    return $.ajax(options);
  },

  authenticate: function (creds) {
    creds ? DM.login(creds) : DM.logout();
  },

  login: function (email, password) {
    DM.config.credentials = {
      email: email,
      password: password
    };

    return DM.ajax('GET', '/account-info', {
      error: DM.logout
    });
  },

  logout: function () {
    DM.config.credentials = null;
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

Object.defineProperty(DM, 'credentials', {
  get: function() {
    return chrome.storage.get:
  }
})
