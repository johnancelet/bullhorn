// Dotmailer is a singleton
// The credentials are stored in local storage and the session is
// kept up as long as they're there.
var DM = {
  config: {
    host: 'https://api.dotmailer.com/v2',
    credentials: null
  },

  errors: {
    unauthorized: 401,
    addressBookNotFound: 404
  },

  ajax: function (method, path, options) {
    if (!DM.config.credentials) {
      // TODO error code
      return $.Deferred().reject(DM.errors.unauthorized);
    }

    options = options || {};

    options.method = method;
    options.url = DM.config.host + path;
    options.username = DM.config.credentials.username;
    options.password = DM.config.credentials.password;

    return $.ajax(options)
      .success(function (data) {
        console.log('OK', method, path, data)
      })
      .error(function (data) {
        console.log('NO', method, path, data)
      });
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

  getAddressBookIdByName: function (name) {
    return DM
      .ajax('GET', '/address-books')
      .then(function (data) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].name == name) {
            return data[i].id;
          }
        }

        console.log("no " + name + " in", data)
        return $.Deferred().reject(DM.errors.addressBookNotFound);
      })
  },

  // Return the promise of an addressbook id
  createAddressBook: function (name) {
    var params = {
      data: JSON.stringify({
        name: name
      }),
      contentType: 'application/json'
    };

    return DM
      .ajax('POST', '/address-books', params)
      .then(function (data) {
        return data.id;
      });
  },

  ensureAddressBookId: function (name) {
    var dfd = $.Deferred();

    DM.getAddressBookIdByName(name)
      .then(dfd.resolve)
      // TODO test if the fail was 404
      .fail(function () {
        DM.createAddressBook(name)
          .then(dfd.resolve)
          .fail(dfd.reject);
      })

    return dfd.promise();
  },

  updateAddressBook: function (id, contacts) {
    var csv = DM.contactsToCSV(contacts);
    console.log(csv);
    var formData = new FormData();
    var blob = new Blob([csv], {type: 'text/csv'});
    formData.append('data', blob, 'contacts.csv');
    var params = {
      data: formData,
      contentType: false,
      processData: false
    };

    return DM.ajax('POST', '/address-books/' + id + '/contacts/import', params);
  },

  updateAddressBookByName: function (name, contacts) {
    console.log({name: name, contacts: contacts});
    return DM
      .getAddressBookIdByName(name)
      .then(function (id) {
        return DM.updateAddressBook(id, contacts);
      })
  },

  // Take an array of contacts and turn them into a csv string
  contactsToCSV: function (contacts) {
    var rows = [['Email', 'foo']];
    contacts.forEach(function (contact) {
      rows.push([contact.email, 'bar']);
    });
    rows = rows.map(function (row) {
      return row.join(',')
    });
    return rows.join(';\n');
  }

}
