function BusinessMan_ImportEmail(email) {
    var email = email,
        element = null,
        filterRequest = 0,
        lastFilter;

    this.show = function () {
        // Create element
        var htmlTemplate = '' +
            '<div class="businessman_import"><h2>Post to BusinessMan</h2><form>' +
            '<div class="row"><label for="bmImportEntity">Type</label><select name="entity" id="bmImportEntity"></select></div>' +
            '<div class="row"><label for="bmImportSearch">Search</label><input type="text" placeholder="Start typing to search" name="searchFilter" id="bmImportSearch" /></div>' +
            '<div class="results"></div>' +
            '</form></div>';

        element = $(htmlTemplate)
            .appendTo('body');

        // Populate data
        $('.businessman_import select[name="entity"]')
            .append('<option value="client">Customer</option')
            .append('<option value="contact">Contact</option');

        _emptySearchResults();

        // Attach event listeners
        var searchFilterTimeout;
        $('.businessman_import form input[name="searchFilter"]').on('keyup', function () {
            var searchFilter = $('.businessman_import form input[name="searchFilter"]').last().val();
            var entity = $('.businessman_import select[name="entity"]').last().val();

            // Only perform request after typing has stopped
            clearTimeout(searchFilterTimeout);

            searchFilterTimeout = setTimeout(function () {
                if (searchFilter.length >= 3 && searchFilter !== lastFilter) {
                    $('.businessman_import .results').empty().append('<center><img src="loader.gif" /></center>').show();
                    filterRequest = Math.floor((Math.random() * 1024));
                    lastFilter = searchFilter;

                    var thisRequest = filterRequest;

                    _updateContainer();

                    AfterLogicApi.sendAjaxRequest({
                        'Action': 'BusinessMan_GetSearchResults',
                        'Data': {
                            'entity': entity,
                            'searchFilter': searchFilter
                        }
                    }, function (data) {
                        if (filterRequest === thisRequest) {
                            _handleSearchResults(data);
                        }
                    });
                }

                if (searchFilter === '') {
                    _emptySearchResults();
                }
            }, 500);
        });

        $('.businessman_import form').on('keydown', function (e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                return false;
            }
        });

        $('.businessman_import select[name="entity"]').on('change', function () {
            $('.businessman_import form input').val('').attr('placeholder', 'Start typing to search for a ' + $('.businessman_import select[name="entity"] option:selected:last').text()).keyup();
        }).change();

        // Show it
        element.easyModal({
            autoOpen: true,
            overlayOpacity: 0.8
        });

        element.on('closeModal', function () {
            _hide(true);
        });

        $('.businessman_import form input').focus();
    }

    function _emptySearchResults() {
        $('.businessman_import .results').empty();

        filterRequest = 0;

        $('<button>Post without attaching to a record</button>')
            .appendTo('.businessman_import .results')
            .on('click', function (e) {
                e.preventDefault();
                _confirmImport('none', 0);
            });

        _updateContainer();
    }

    function _hide(suppressCloseEvent) {
        if (element === null) {
            return false;
        }

        if (!suppressCloseEvent) {
            element.trigger('closeModal');
        }

        element.remove();
    }

    function _updateContainer() {
        element.css({
            'margin-top': '-' + (element.height() / 2) + 'px'
        });
    }

    function _confirmImport(entity, id) {
        var email = App.currentMessage();
        fromDate = new Date(email.fullDate());

        $('form', element).empty();
        element.append('<center><img src="loader.gif" /></center>');
        _updateContainer();

        AfterLogicApi.sendAjaxRequest({
            'Action': 'BusinessMan_SaveEmail',
            'Data': {
                'entity': entity,
                'id': id,
                'email': {
                    to: email.to(),
                    fromName: email.oFrom.getDisplay(),
                    fromEmail: email.oFrom.getFirstEmail(),
                    subject: email.subject(),
                    message: email.text(),
                    messageId: email.messageId(),
                    bcc: email.bcc(),
                    cc: email.cc(),
                    received: fromDate.toISOString()
                }
            }
        }, _handleImportResponse);
    }

    function _handleSearchResults(data) {
        $('.businessman_import .results').empty();

        var table = $('<table><thead></thead><tbody></tbody></table>');

        // Create table
        if (data.entity === 'client') {
            $('thead', table).append('<tr><th>ID</th><th>Name</th></tr>');
        } else if (data.entity == 'contact') {
            $('thead', table).append('<tr><th>Email</th><th>Name</th><th>Phone</th></tr>');
        }

        for (var i in data.results) {
            var row = $('<tr></tr>');

            if (data.entity === 'client') {
                row.append('<td>' + data.results[i].id + '</td><td>' + data.results[i].name + '</td>');
            }

            if (data.entity === 'contact') {
                var displayName = (data.results[i].forename ? data.results[i].forename + ' ' : '') +
                    (data.results[i].surname ? data.results[i].surname : ''),
                    displayTelephone = data.results[i].telephone ? data.results[i].telephone : '-';

                if (!displayName) {
                    displayName = 'Unknown contact';
                }

                row.append('<td>' + data.results[i].email + '</td><td>' + displayName + '</td><td>' + displayTelephone + '</td>');
            }

            row.on('click', function () {
                _confirmImport(data.entity, data.results[i].id)
            });

            $('tbody', table).append(row);
        }

        table.appendTo('.businessman_import .results');

        _updateContainer();
    }

    function _handleImportResponse(data) {
        var responseText;

        if (data.Result) {
            responseText = 'Successfully posted email';
        } else {
            responseText = 'There was a problem posting the email, please try again';
        }

        $('center', element).remove();
        $('form', element).empty().append('<div class="alert">' + responseText + '</div>');

        $('<button>Close</button>')
            .appendTo('.businessman_import .alert')
            .on('click', function (e) {
                e.preventDefault();
                _hide();
            });
    }
}