// Dotmailer is a singleton
// The credentials are stored in local storage and the session is
// kept up as long as they're there.
var DM = {
  config: {
    host: 'https://api.dotmailer.com/v2',
    credentials: null
  },

  errors: {
    UNAUTHORIZED: 'No valid dotmailer credentials provided.',
    ADDRESS_BOOK_NOT_FOUND: 'Could not find dotmailer address book by given name.',
    INVALID_CREDENTIALS: 'Dotmailer credentials provided are not valid.',
    COULD_NOT_CREATE_ADDRESS_BOOK: 'Could not create the address book on dotmailer.',
    EMPTY_ADDRESS_BOOK: 'Tried to upload a missing or empty address book.',
  },

  ajax: function (method, path, options) {
    if (!DM.config.credentials) {
      return $.Deferred().reject(DM.errors.unauthorized).promise();
    }

    options          = options || {};
    options.method   = method;
    options.url      = DM.config.host + path;
    options.username = DM.config.credentials.username;
    options.password = DM.config.credentials.password;

    return $.ajax(options);
  },

  login: function (email, password) {
    DM.config.credentials = {
      email: email,
      password: password
    };

    return DM
      .ajax('GET', '/account-info')
      .fail(DM.logout);
  },

  logout: function () {
    DM.config.credentials = null;
  },

  getAddressBookIdByName: function (name) {
    if (!name) {
      return $.Deferred().reject(DM.errors.INVALID_ADDRESS_BOOK_NAME).promise();
    }

    var i;
    name = name.toString();

    return DM
      .ajax('GET', '/address-books')
      .then(function (data) {
        console.log('checking', data);
        // TODO find out whether this can be paginated
        // Look for an address book with matching name in the list of all
        for (i = 0; i < data.length; i++) {
          if (data[i].name === name) {
            return data[i].id;
          }
        }
        console.log('dit not find', name);
        return $.Deferred().reject(DM.errors.ADDRESS_BOOK_NOT_FOUND).promise();
      });
  },

  // Return the promise of an addressbook id
  createAddressBook: function (name) {
    if (!name) {
      return $.Deferred().reject(DM.errors.INVALID_ADDRESS_BOOK_NAME).promise();
    }

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
      })
      .fail(function () {
        return DM.errors.COULD_NOT_CREATE_ADDRESS_BOOK;
      });
  },

  // Return the id of an existing or freshly created address book
  ensureAddressBookId: function (name) {
    var dfd = $.Deferred();

    DM.getAddressBookIdByName(name)
      .then(dfd.resolve)
      .fail(function () {
        DM.createAddressBook(name)
          .then(dfd.resolve)
          .fail(dfd.reject);
      });

    return dfd.promise();
  },

  // Takes an array of contact objects with at least an email field.
  updateAddressBook: function (id, contacts) {
    if (contacts === undefined || !contacts.length) {
      $.Deferred().reject(DM.errors.EMPTY_ADDRESS_BOOK).promise();
    }

    var csv      = DM.contactsToCSV(contacts);
    var formData = new FormData();
    var blob     = new Blob([csv], {type: 'text/csv'});

    formData.append('data', blob, 'contacts.csv');

    var params = {
      data: formData,
      contentType: false,
      processData: false
    };

    return DM.ajax('POST', '/address-books/' + id + '/contacts/import', params);
  },

  updateAddressBookByName: function (name, contacts) {
    return DM
      .ensureAddressBookId(name)
      .then(function (id) {
        return DM.updateAddressBook(id, contacts);
      });
  },

  // Take an array of contacts and turn them into a csv string
  contactsToCSV: function (contacts) {
    var rows = [['Email', 'foo']];
    contacts.forEach(function (contact) {
      rows.push([contact.email, 'bar']);
    });
    rows = rows.map(function (row) {
      return row.join(',');
    });
    return rows.join(';\n');
  }
};
