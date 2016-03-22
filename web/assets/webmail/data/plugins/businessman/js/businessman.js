$(function () {
    // Hide unwanted UI elements
    $('.item+.contacts, .item+.calendar, .item+.settings, .item+.logout, .manage_folders').hide();

    // Load CSS
    $('<link/>', {
        rel: 'stylesheet',
        type: 'text/css',
        href: 'businessman.css'
    }).appendTo('head');

    // Plugin hooks
    AfterLogicApi.addPluginHook('view-message', _viewMessage);

    AfterLogicApi.addPluginHook('ajax-default-request', function (action, data) {
        if (action === 'MessageSend') {
            data.PostToBusinessman = $('.businessman_import_sent input[type="checkbox"]').prop('checked')
        }
    });

    // Initialization
    if (App.currentMessage() !== null) {
        _viewMessage();
    }

    var lastCheckRequest;

    function _viewMessage() {
        // Check if email has already been imported
        $('.businessman_import_status').remove();
        $('.message_header .date').parent().append('<span class="businessman_import_status">Checking status...</span>');

        var thisRequest = Math.floor((Math.random() * 1024));
        lastCheckRequest = thisRequest;

        AfterLogicApi.sendAjaxRequest({
            'Action': 'BusinessMan_FindEmail',
            'Data': {
                'messageId': App.currentMessage().messageId()
            }
        }, function (data) {
            if (lastCheckRequest !== thisRequest) {
                return;
            }

            if (data.Result) {
                $('.businessman_import_status')
                    .empty()
                    .append('Posted ' + moment(data.EmailMessage.created).calendar())
                    .removeClass('businessman_not_imported')
                    .addClass('businessman_imported');
            } else {
                $('.businessman_import_status')
                    .empty()
                    .append('Not yet posted to BusinessMan')
                    .removeClass('businessman_imported')
                    .addClass('businessman_not_imported');
            }
        });

        // Create import email button
        $('.message_header .toolbar .content .businessman_begin_import').remove();

        $('<span class="item businessman_begin_import command"><span class="icon" title="Post to BusinessMan"></span><span class="text">Reply</span></span>')
            .appendTo('.message_header .toolbar .content')
            .on('click', function (e) {
                var importPanel = new BusinessMan_ImportEmail(App.currentMessage());

                importPanel.show();
            });
    }

    // Sent email import button
    hasher.changed.add(_composeMessage);
    hasher.initialized.add(_composeMessage);

    function _composeMessage(newHash) {
        if (!(newHash.substring(0, 7) === 'compose' || newHash.substring(0, 14) === 'single-compose')) {
            return;
        }

        $('.businessman_import_sent').remove();
        $('<span class="item businessman_import_sent"><label class="custom_checkbox"><span class="icon"></span><input type="checkbox" id="businessmanSentImport"></label><label class="text" for="businessmanSentImport">Post to BusinessMan</label></span>').appendTo('.compose .toolbar .content');

        $('.businessman_import_sent .icon').css('display', 'block');

        $('.businessman_import_sent input[type="checkbox"]').on('click', function () {
            if ($('.businessman_import_sent input[type="checkbox"]').prop('checked')) {
                $('.businessman_import_sent .custom_checkbox').addClass('checked');
                $('.compose .toolbar').css('background', '#e0e7ef');
            } else {
                $('.businessman_import_sent .custom_checkbox').removeClass('checked');
                $('.compose .toolbar').css('background', '');
            }
        });
    }
});