mc.init(function() {
    
    /*
     * API Key
     */
    $('#getApiKey').click(function() {
        extn.openTab('https://admin.mailchimp.com/account/api-key-popup/');
    });
    $('#apiKeyInput').focus().val(mc.apikey);// inject current key
    $('#checkKey').click(function() {
        var key = $('#apiKeyInput').val();
        
        if (key.split('-').length != 2) {
            extn.alert('It doesn\'t look like that\'s a valid key. Try again?', 'error', 'key-validity');
            $('#apiKeyInput').val('');
            return;
        }
        
        mc.call('ping', {apikey: key}, {
            success: function() {
                extn.alert('Yup, that key looks good to me!', 'success', 'key-validity');
                chrome.storage.sync.set({'apikey': key});
                
            }, error: function(data) {
                extn.alert('It doesn\'t look like that\'s a valid key. Try again?', 'error', 'key-validity');
                $('#apiKeyInput').val('');   
            }
        });
    });
    $('#saveKey').click(function(){
        var key = $('#apiKeyInput').val();
        
        if (key.split('-').length != 2) {
            extn.alert('It doesn\'t look like that\'s a valid key. Try again?', 'error', 'key-validity');
            $('#apiKeyInput').val('');
            return;
        }
        
        mc.call('ping', {apikey: key}, {
            success: function() {
                extn.alert('Yup, that key looks good to me!', 'success', 'key-validity');
                chrome.storage.sync.set({'apikey': key}, function() {
                    extn.goto('main');
                });
                
            }, error: function(data) {
                extn.alert('It doesn\'t look like that\'s a valid key. Try again?', 'error', 'key-validity');
                $('#apiKeyInput').val('');
            }
        });
    });
    if (mc.apikey) $('#forgetKey').removeClass('hide');// if there isn't a key, don't show the "Forget Key" button
    $('#forgetKey').click(function(){
        chrome.storage.sync.remove('apikey', function() {
            window.close();
        });
    });
    
    /*
     * Refresh Period
     */
    $('input#refreshPeriod' + mc.refreshPeriod).prop('checked', true);// inject current setting
    
    /*
     * Save all settings
     */
    $('#saveSettings').click(function() {
        var key = $('#apiKeyInput').val();
        var refreshPeriod = $('input[name=refreshPeriod]:checked').val();
        
        if (key.split('-').length != 2) {
            extn.alert('It doesn\'t look like that\'s a valid key. Try again?', 'error', 'key-validity');
            $('#apiKeyInput').val('');
            return;
        }
        
        mc.call('ping', {apikey: key}, {
            success: function() {
                chrome.storage.sync.set({'apikey': key}, function () {
                    chrome.storage.local.set({'refreshPeriod': refreshPeriod}, function () {
                        window.close();
                    });
                });
                
            }, error: function(data) {
                extn.alert('It doesn\'t look like that\'s a valid key. Try again?', 'error', 'key-validity');
                $('#apiKeyInput').val('');
            }
        });
    });
});
