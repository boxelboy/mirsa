function PersistentStorage(prefix) {
    var isLocalStorage = true,
        store = {};

    try {
        var test = 'bm_portal_test';

        window.localStorage.setItem(test, test);
        window.localStorage.removeItem(test);
    } catch (e) {
        isLocalStorage = false;
    }

    this.set = function (name, value) {
        name = prefix + '_' + name;

        if (isLocalStorage) {
            window.localStorage.setItem(name, value);
        } else {
            store[name] = value;
        }
    };

    this.remove = function (name) {
        name = prefix + '_' + name;

        if (isLocalStorage) {
            window.localStorage.removeItem(name);
        } else {
            delete store[name];
        }
    };

    this.clear = function () {
        if (isLocalStorage) {
            window.localStorage.clear();
        } else {
            store = {};
        }
    };

    this.get = function (name) {
        name = prefix + '_' + name;

        if (isLocalStorage) {
            return window.localStorage.getItem(name);
        } else {
            return store[name];
        }
    }
}

$(function () {
    $('#app_menu_toggle').on('click', function () {
        $('#app_menu').toggleClass('active');
    });

    $('body')
        .on('click', 'a[data-toggle="tab"]', function () {
            if (location.hash != $(this).attr('href')) {
                history.pushState(null, null, $(this).attr('href'));
            }
        })
        .on('submit', 'hx\\:include form', function (e) {
            e.preventDefault();

            var $element = $(this).closest('hx\\:include').html('<i class="fa fa-spin fa-spinner"></i>');

            $.post($(this).attr('action'), $(this).serialize(), function (data) {
                $element.html(data);
            });
        });

    $('select.chosen').chosen({
        disable_search_threshold: 5,
        search_contains: true
    });

    /*$('button').on('click', function() {
        $('.loader').show();
    });*/

    setTimeout(function () {
        if (location.hash != '') {
            $('a[href="'+location.hash+'"]').tab('show');
        }
    }, 50);

    window.addEventListener('popstate', function() {
        var activeTab = $('[href="' + location.hash + '"]');

        if (activeTab.length) {
            activeTab.tab('show');
        } else {
            $('.nav-tabs a:first').tab('show');
        }
    });

    $('nav#app_menu').on('click', 'ul>li>span', function () {
        $('ul', $(this).parent()).toggleClass('open');
    });

    setInterval(function () {
        if (!$('body').data('bridge')) {
            $('table.rowlink').off('click', 'td:not(:has(a))').on('click', 'td:not(:has(a))', function () {
                if ($(this).parent('tr').find('a:first-child').length) {
                    location.href = $(this).parent('tr').find('a:first-child').attr('href');
                }
            });

            $('table.rowlink td:not(:has(a))').css('cursor', 'pointer');
        }

        $('table[data-datatable=true]').each(function () {
            if ($.fn.dataTable.isDataTable(this)) {
                return;
            }

            var columns = [],
                order = [],
                footerTotal = $('<tr class="footerTotals"></tr>'),
                footer = $('<tr></tr>'),
                filterCount = 0,
                dom = "tr",
                paging = false,
                searching = false,
                url = null,
                serverSide = false,
                storage = new PersistentStorage('datatable'),
                $loader = $(this).parent().find('.loader');
                //$loader = $(this).parent().find('.dataTables_processing');

            if ($(this).data('url')) {
                url = $(this).data('url');
                serverSide = true;
            }

            if ($(this).data('show-header') != false) {
                dom = "<'row'<'col-xs-6'l><'col-xs-6'f>>" + dom;
            }

            if ($(this).data('show-footer') != false) {
                dom = dom + "<'row'<'col-xs-6'i><'col-xs-6'p>r>";
                paging = true;
                searching = true;
            }

            $('thead tr th', this).each(function (index) {
                var column = {
                    className: $(this).attr('class'),
                    orderable: false,
                    searchable: false
                };

                var footerTotalColumn = $('<th class="' + column.className + '" id="total_' + $(this).data('source') + '" data-total="' + $(this).data('total') + '"></th>').appendTo(footerTotal);
                var footerColumn = $('<th class="' + column.className + '" ></th>').appendTo(footer);

                if ($(this).data('sortable')) {
                    column.orderable = $(this).data('sortable');
                }
                
                if ($(this).data('sort')) {
                    order.push([columns.length, $(this).data('sort')]);
                }

                if ($(this).data('width')) {
                    column.width = $(this).data('width');
                }

                if ($(this).data('searchable') && searching) {
                    column.searchable = $(this).data('searchable');

                    filterCount++;

                    if ($(this).data('search-options')) {
                        var options = $(this).data('search-options').split(','),
                            filter = $('<select data-column-index="' + index + '"></select>');

                        $('<option></option>').appendTo(filter);

                        $.each(options, function (index, option) {
                            $('<option value="' + option + '">' + option + '</option>').appendTo(filter);
                        });

                        filter.appendTo(footerColumn);
                    } else {
                        $('<input type="text" data-column-index="' + index + '" />').appendTo(footerColumn);
                    }
                }

                if ($(this).data('type')) {
                    column.type = $(this).data('type');
                }

                if ($(this).data('source')) {
                    column.name = $(this).data('source').replace('.', '_');
                    column.data = $(this).data('source');
                }

                if ($(this).data('template')) {
                    var template = doT.template($('script[data-name="' + $(this).data('template') + '"]').html());

                    column.defaultContent = '';
                    column.render = function (data, type, row) {
                        return template(row);
                    };
                }

                columns.push(column);
            });

            var table = $(this).DataTable({
                processing: true,
                stateSave: true,
                serverSide: serverSide,
                columns: columns,
                order: order,
                dom: dom,
                paging: paging,
                searching: searching,
                language: {
                    emptyTable: 'No records found'
                },
                ajax: url === null ? null : function (request, callback) {
                    var url = $(this).data('url'),
                        cached = storage.get(url),
                        apiRequest = {
                            sort: []
                        };

                    if (cached) {
                        callback(JSON.parse(cached));
                        //$loader.css('display', 'block !important');
                        $('.loader').show();
                    }

                    apiRequest.offset = request.start;
                    apiRequest.limit = request.length;

                    if (request.search.value) {
                        apiRequest.filter = request.search.value;
                    } else {
                        apiRequest.filter = {};

                        $.each(request.columns, function (columnIndex, column) {
                            if (column.search.value) {
                                apiRequest.filter[column.data] = column.search.value;
                            }
                        });
                    }

                    $.each(request.order, function (index, sort) {
                        if (request.columns[sort.column].orderable) {
                            apiRequest.sort.push({ column: request.columns[sort.column].data, dir: sort.dir });
                        }
                    });

                    $.get(url, apiRequest, function (data, status, xhr) {
                        if (xhr.getResponseHeader('X-Login')) {
                            storage.clear();
                            window.location.href = Routing.generate('businessman_login');
                        } else {
                            var responseData = {
                                data: data.results,
                                recordsTotal: data.total,
                                recordsFiltered: data.total,
                                summaries:data.summaries
                            };

                            /* Code to add the summary totals to the columns. based on the ID of field */
                            if (data.summaries) {
                                $.each(data.summaries, function(totalColumn, totalValue) {
                                    mathsType = $('tfoot tr.footerTotals th#total_' + totalColumn).attr('data-total');
                                    if (mathsType == 'avg%') {
                                        $('tfoot tr.footerTotals th#total_' + totalColumn).html(((totalValue/data.total)*100).toFixed(2));
                                    } else if (mathsType == 'avg') {
                                        $('tfoot tr.footerTotals th#total_' + totalColumn).html((totalValue/data.total).toFixed(2));
                                    } else {
                                        $('tfoot tr.footerTotals th#total_' + totalColumn).html(totalValue);
                                    }
                                });
                            }
                            


                            storage.set(url, JSON.stringify(responseData));

                            callback(responseData);
                            //$loader.css('display', 'none');
                            $('.loader').hide();
                        }
                    });
                }
            });

            $('<tfoot></tfoot>').append(footerTotal).appendTo(this);
            if (filterCount) {
                $('<tfoot></tfoot>').append(footer).appendTo(this);
                $('.dataTables_filter', $(this).parent()).remove();

                $.each(columns, function (index) {
                    $('tfoot tr th:nth-child(' + (index + 1) + ')').find('input, select').val(table.column(index).search());
                });
            }

            var filterTimeout;

            if (document.cookie.indexOf("sku") != -1) {
                $('tfoot tr th.sku input').val(document.cookie.replace(/(?:(?:^|.*;\s*)sku\s*\=\s*([^;]*).*$)|^.*$/, "$1"));
            }

            if (document.cookie.indexOf("description") != -1) {
                $('tfoot tr th.description input').val(document.cookie.replace(/(?:(?:^|.*;\s*)description\s*\=\s*([^;]*).*$)|^.*$/, "$1"));
            }

            

            $('tfoot tr th select', this).on('change', function () {
                var value = $(this).val(),
                    columnIndex = $(this).data('column-index');

                table.column(columnIndex).search(value).draw();
            });

            $('tfoot tr th input', this).on('keyup', function () {
                var value = this.value,
                    columnIndex = $(this).data('column-index');

                clearTimeout(filterTimeout);
                filterTimeout = setTimeout(function () {
                    table.column(columnIndex).search(value).draw();
                }, 500);
            });
        });
    }, 100);
});