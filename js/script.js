/*
 * Helper functions and objects
 */


function pad(num, length) {// pad the number with zeros to length, e.g. pad(14, 5) returns 00014
    return (1e15+num+"").slice(-length);
}

function formatTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var ampm = 0;
    
    if (hours == 0) {
        hours = 12;
    } else if (hours > 12) {
        hours -= 12;
        ampm = 1;
    }
    // format to 11:00 AM
    return hours + ":" + minutes.pad(2) + " "+ (ampm == 0 ? "AM" : "PM");
}

Number.prototype.toShortString = function () {
    var n = this.valueOf();
    if (n < 1000) return ""+n;
    if (n < 10000) return Math.floor(n/100)/10 + "k";
    if (n < 1000000) return Math.floor(n/1000) + "k";
    return Math.floor(n/1000000) + "m";
}

Number.prototype.pad = function (length) {// pad the number with zeros to length, e.g. pad(14, 5) returns 00014
    return (1e15+this.valueOf()+"").slice(-length);
}

Number.prototype.toPercentage = function (decimals) {
    return (this.valueOf()*100).toFixed(decimals || 1) + "%";
}

var extn = {
    defaultNotificationTimeout: 5*1000,
    goto: function (page) {
        window.location.href = page + '.html';
    },
    alert: function (message, type, id) {// in-extension popup notification; add alert with extn.alert("Yikes!", "error", "failure-on-launch");
        if (message === null) {// extn.alert(null) clears alerts
            $((!id) ? "#alerts *" : "#"+id).remove();
            
        } else if (id && $('#'+id).length != 0) {// if there is already a notification with given id, update it
            $("#" + id).removeClass().addClass('alert').addClass('alert-' + type).text(message);
            
        } else {// otherwise, create the alert
            $("#alerts").append('<li class="alert alert-' + type + '" id="' + id + '">' + message + '</li>');
        }
    },
    setBadgeText: function (value) {
        chrome.browserAction.setBadgeText({text: value});
    },
    openTab: function (url) {
        chrome.tabs.create({'url': url});
    },
    setIcon: function (icon) {
        chrome.browserAction.setIcon(icon);
    },
    popupIsUp: function () {
        return chrome.extension.getViews({type:"popup"}).length != 0;
    },
    notify: function (title, body, image, timeout) {// desktop notification
        // image must be declared in the manifest under web_accessible_resources
        var notification = webkitNotifications.createNotification(image || null, title, body);
        notification.onshow = function () {
            setTimeout(function () {
                notification.close();
            }, timeout || extn.defaultNotificationTimeout);
        };
        notification.show();
    }
};

/*
 * api handling, storage change callbacks, bootstrapping
 */
var mc = {
    iconNormal: {"path":"images/freddie-38.png"},
    iconExcited: {"path":"images/freddie-excited-38.png"},
    iconFreddie: "images/Icon-64.png",
    iconBadgeColor: '#23DAFF',
    isFetching: false,
    fetching: function (isFetching) {
        if (isFetching == undefined) return this.isFetching;// act like getter
        if (isFetching) $('#refresh-icon').addClass('loading').attr('src', 'images/loader.gif');// act like setter
        else $('#refresh-icon').removeClass('loading').attr('src', 'images/icon-refresh.png');
        this.isFetching = isFetching;
    },
    timeout: 10*1000,// api call timeout in ms
    output: "json",
    
    apikey: null,
    dc: null,
    getDc: function (apikey) {
        return ((apikey) ? apikey : this.apikey).split('-').pop();
    },
    onApiKeyChange: function (storageChange) {
        this.apikey = storageChange.newValue;
        if (!this.apikey) {// if the apikey is being unset
            chrome.storage.local.remove('stats');
        } else  {
            this.dc = this.getDc();
            this.fetchCampaign();
        }
    },
    
    stats: null,
    oldStats: null,
    setStats: function (storageChange) {
        this.stats = storageChange.newValue;
        this.oldStats = storageChange.oldValue;
    },
    onStatsChange: function (storageChange) {
        this.setStats(storageChange);
        this.updateStatsView();// update view
    },
    
    updatedAt: null,
    onUpdatedAtChange: function (storageChange) {
        this.updatedAt = storageChange.newValue;
        this.updateUpdatedAt();
    },
    
    defaultRefreshPeriod: 5,// in minutes
    minimumRefreshPeriod: 5,// in minutes
    refreshPeriod: 5,
    onRefreshPeriodChange: function (storageChange) {
        this.refreshPeriod = Math.max(mc.minimumRefreshPeriod, storageChange.newValue || mc.defaultRefreshPeriod);// set it to at least the minium, else newValue, else the default
        this.installRefresherAlarm();
    },
    installRefresherAlarm: function () {
        $('#refreshPeriod').text(this.refreshPeriod);
        chrome.alarms.create('refresher', {delayInMinutes: 5, periodInMinutes: parseInt(this.refreshPeriod)});
    },
    
    apiUri: function (apikey) {
        return "https://" + this.getDc(apikey) + ".api.mailchimp.com/1.3/?method=";
    },
    adminUri: function (apikey) {
        return "https://" + this.getDc(apikey) + ".admin.mailchimp.com/";
    },
    
    call: function (method, params, callbacks) {
        chrome.storage.sync.get('apikey', function (items) {
            mc.apikey = items.apikey;
            
            if (!mc.apikey && !params.apikey) {
                callbacks.error();
                return;
            }
            
            params = params || {};
            url =  mc.apiUri(params.apikey) + method;
            params['apikey'] = params.apikey || mc.apikey;
            params['output'] = mc.output;
            
            mc.fetching(true);
            $.ajax({
                type: "POST",
                url: url,
                data: JSON.stringify(params),
                contentType: "application/json",
                timeout: mc.timeout,
                success: function (data) {
                    if (data['error']) callbacks.error(data);
                    else callbacks.success(data);
                },
                error: function (errorThrown) {
                    if (callbacks.httpError) {
                        callbacks.httpError(errorThrown);
                    } else {
                        callbacks.error(errorThrown);
                    }
                },
                complete: function () {
                    mc.fetching(false);
                }
            });
        });
    },
    
    init: function (callback) {
        var sync = $.Deferred(function (dfd) {
            chrome.storage.sync.get(['apikey'], function (items) {
                dfd.resolve(items);
            });
        }).promise();
        var local = $.Deferred(function (dfd) {
            chrome.storage.local.get(['stats', 'refreshPeriod', 'updatedAt'], function (items) {
                dfd.resolve(items);
            });
        }).promise();
        var domReady = $.Deferred(function (dfd) {
            $(dfd.resolve);
        }).promise();
        $.when(sync, local, domReady).done(function (syncItems, localItems) {
            mc.apikey = syncItems.apikey;
            mc.stats = localItems.stats;
            mc.refreshPeriod = localItems.refreshPeriod || mc.defaultRefreshPeriod;
            mc.updatedAt = localItems.updatedAt;
            mc.installRefresherAlarm();
            callback();
        });
    },
    requireKey: function () {
        if (!this.apikey) return extn.goto('require-key');
    },
    load: function () {
        this.requireKey();
        
        if (this.stats) {
            this.updateStatsView();
            this.updateUpdatedAt();
        } else {
            this.fetchCampaign();
        }
    },
    fetchCampaign: function () {// Grab the Most Recent Campaign, called on this.load() with apikey and no stats available
        mc.call("campaigns", {filters:{'status':'sent,sending','exact':false},'limit':1,'sort_field':'created','sort_dir':'DESC'}, {
            success: function (data) {
                var campaign = data.data[0];
                chrome.storage.local.set({'recentCampaign': campaign}, function () {
                    mc.fetchStats(campaign);
                });
                extn.alert(null, null, 'key-validity');// clear any errors
                extn.alert(null, null, 'networking-trouble');
            }, error: function (data) {
                console.log(data);
                extn.alert("Problem fetching campaigns. Double check your API Key in the settings", 'error', 'key-validity');
            }, httpError: function (data) {
                extn.alert("Trouble checking your API Key", 'error', 'networking-trouble');
            }
        });
    },
    fetchStats: function (campaign) {// called when chrome.storage recentCampaign is changed
        if (!campaign) return;
        
        mc.call('campaignStats', {cid: campaign.id}, {
            success: function (data) {
                
                var newStats = {};
                newStats['title'] = campaign.title;
                newStats['sent'] = data['emails_sent'];
                newStats['opens'] = data['opens'];
                newStats['clicks'] = data['clicks'];
                newStats['unique_clicks'] = data['users_who_clicked'];
                newStats['unique_opens'] = data['unique_opens'];
                newStats['unsubs'] = data['unsubscribes'];
                newStats['last_open'] = data['last_open'];
                newStats['complaints'] = data['abuse_reports'];
                newStats['likes'] = data['unique_likes'];
                newStats['bounced'] = parseInt(data['soft_bounces']) + parseInt(data['hard_bounces']);
                newStats['date'] = new Date();
                
                chrome.storage.local.set({'stats': newStats, 'updatedAt': formatTime(new Date())});
                
            }, error: function () {
                extn.alert("Trouble fetching stats. Try refreshing in a few seconds.", 'notice', 'networking-trouble');
            }
        });
    },
    updateStatsView: function () {// for popup window
        var stats = this.stats;
        var oldStats = this.oldStats;
        
        $('.campaign-title').text(stats.title);
        
        $('#stat-open .percentage').text((stats.unique_opens/stats.sent).toPercentage());
        $('.opens .head').text(stats.unique_opens.toShortString());
        $('.barchart-fill-open').css({width: (stats.unique_opens/stats.sent).toPercentage()});
        
        $('#stat-click .percentage').text((stats.unique_clicks/stats.sent).toPercentage());
        $('.clicks .head').text(stats.unique_clicks.toShortString());
        $('.barchart-fill-click').css({width: (stats.unique_clicks/stats.sent).toPercentage()});
        
        $('#stat-sent .value').text(stats.sent);
        $('#stat-bounced .value').text(stats.bounced);
        $('#stat-complaints .value').text(stats.complaints);
        $('#stat-unsubs .value').text(stats.unsubs);
    },
    notifyStatsUpdate: function () {// for background script
        var stats = this.stats;
        var oldStats = this.oldStats;
        var msg = 'Eep eep!';
        
        if (!stats || $.isEmptyObject(stats)) return extn.setBadgeText('');
        extn.setBadgeText(stats.unique_opens.toShortString());
        
        // if same campaign as last update
        if (oldStats && oldStats.title == stats.title) {
            var diffs = [];
            diffs.push({'attr': 'sent', 'val': stats.sent - oldStats.sent});
            diffs.push({'attr': 'opens', 'val': stats.unique_opens - oldStats.unique_opens});
            diffs.push({'attr': 'clicks', 'val': stats.unique_clicks - oldStats.unique_clicks});
            diffs.push({'attr': 'bounced', 'val': stats.bounced - oldStats.bounced});
            diffs.push({'attr': 'complaints', 'val': stats.complaints - oldStats.complaints});
            diffs.push({'attr': 'unsubs', 'val': stats.unsubs - oldStats.unsubs});
            
            // find the stat with greatest change
            var maximum = diffs.reduce(function (previousValue, currentValue) {
                return (previousValue.val > currentValue.val) ? previousValue : currentValue;
            });
            
            // make sure the change is significant
            msg = (maximum.val > 0) ? maximum.val + ' new ' + maximum.attr : null;
            
        } else {
            msg = 'New Campaign!';
        }
        
        if (msg) {
            extn.setIcon(mc.iconExcited);
            extn.notify('New Campaign Stats', msg, mc.iconFreddie);
        }
    },
    updateUpdatedAt: function () {
        $('#updatedAtTime').text(this.updatedAt);
    },
    openSettingsTab: function () {
        extn.openTab(chrome.runtime.getURL('setup.html'));
    }
};
