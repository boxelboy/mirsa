(function ($, Routing) {
    $.fn.scheduler = function (resourceData, eventData, settings, options) {
        // Defaults
        resourceData = $.extend({
            group: [],
            category: [],
            resource: []
        }, resourceData);

        if (typeof eventData == 'undefined') {
            eventData = [];
        }

        settings = $.extend({
            resourceJump: 6,
            resourceCount: 6,
            markPastEvents: false,
            startHour: 8,
            endHour: 19,
            viewHour: 8,
            confirmationPrompt: true,
            timeslotMinutes: 15,
            timeslotHeight: 2,
            defaultView: 'month',
            autoRefreshMinutes: 5,
            allowClashes: false,
            readOnly: false
        }, settings);

        options = $.extend({
            resourceNavigationSelector: '',
            shedulerNavigationSelector: '',
            fileMaker: false
        }, options);

        this.each(function () {
            var dp = null,
                init = false,
                id = this.id,
                lastResources,
                lastFilterType,
                lastFilterId,
                timelineSettings = {
                    type: 'Bar',
                    unit: 'minute',
                    date: '%H:%i',
                    step: 30,
                    size: 24,
                    start: 16,
                    length: 48
                };

            function reloadEvents(filterType, filterId) {
                scheduler.clearAll();
                scheduler.load(Routing.generate('api_scheduler_schedules', { filterType: filterType, filterId: filterId }), 'json');
            }

            function confirmChanges(event, isNew) {
                if (settings.confirmationPrompt) {
                    if (!confirm('Confirm these changes?')) {
                        return false;
                    }
                }

                var response = true;

                if (!settings.allowClashes && event.resources) {
                    $.each(event.resources.toString().split(','), function (index, resource) {
                        var clashes = null,
                            dateTimeToStr = scheduler.date.date_to_str("%Y-%m-%d %H:%i:%s");

                        $.ajax(
                            Routing.generate('api_scheduler_clashes', {
                                resource: resource,
                                newStartDate: dateTimeToStr(event.start_date),
                                newEndDate: dateTimeToStr(event.end_date)
                            }), {
                                method: 'GET',
                                async: false,
                                success: function (data) {
                                    clashes = data;
                                }
                            }
                        );

                        if (isNew && clashes.length) {
                            response = confirm('Clashes with other schedules. Override?');
                        } else {
                            for (var i in clashes) {
                                if (clashes[i].id != event.id) {
                                    response = confirm('Clashes with other schedules. Override?');
                                }
                            }
                        }
                    });
                }

                return response;
            }

            function initScheduler(resources, filterType, filterId) {
                resources = typeof resources === 'undefined' ? lastResources : resources;
                filterType = typeof filterType === 'undefined' ? lastFilterType : filterType;
                filterId = typeof filterId === 'undefined' ? lastFilterId : filterId;

                lastFilterType = filterType;
                lastFilterId = filterId;
                lastResources = resources;

                var initHash = false;

                // Event handlers
                if (!init) {
                    var baseFunctions = {
                        render_event: scheduler.render_event
                    };

                    scheduler.render_event = function (event) {
                        if (this._mode == 'unit') {
                            var resourceEvent = $.extend(true, {}, event);

                            if (resourceEvent.schedules) {
                                $.each(resourceEvent.schedules, function (index, schedule) {
                                    if (schedule.event && schedule.resource.id == resourceEvent.resources) {
                                        $.each(eventData, function (index, scheduleEvent) {
                                            if (scheduleEvent.key == schedule.event.id) {
                                                resourceEvent.color = scheduleEvent.backgroundColor;
                                                resourceEvent.textColor = scheduleEvent.color;
                                                resourceEvent.event = scheduleEvent.key;
                                                resourceEvent.event_text = scheduleEvent.label;
                                            }
                                        });
                                    }
                                });
                            }

                            baseFunctions.render_event.call(this, resourceEvent);
                        } else {
                            baseFunctions.render_event.call(this, event);
                        }
                    };

                    scheduler.attachEvent('onClearAll', function () {
                        $.each(scheduler.map._markers, function (index, marker) {
                            if (marker) {
                                marker.setMap(null);
                            }
                        });

                        scheduler.map._markers = [];
                    });

                    scheduler.attachEvent('onBeforeViewChange', function (oldMode, oldDate, newMode, newDate) {
                        var hashData = getHashData();

                        if (!initHash) {
                            initHash = true;

                            if (hashData.date || hashData.mode) {
                                try {
                                    this.setCurrentView(hashData.date ? strToDate(hashData.date) : null, hashData.mode || null);
                                } catch (e) {
                                    this.setCurrentView(hashData.date ? strToDate(hashData.date) : null, newMode);
                                }

                                return false;
                            }
                        }

                        hashData.date = dateToStr(newDate || oldDate);
                        hashData.mode = newMode || oldMode;

                        setHashData(hashData);

                        if (newMode == 'unit') {
                            scheduler.xy.scale_height = 45;
                        } else if (newMode == 'year') {
                            scheduler.xy.scale_height = 21;
                        } else {
                            scheduler.xy.scale_height = 35;
                        }

                        $('a[data-mode]', options.schedulerNavigationSelector).removeClass('active');
                        $('a[data-mode="' + newMode + '"]', options.schedulerNavigationSelector).addClass('active');

                        return true;
                    });

                    scheduler.attachEvent('onBeforeEventChanged', function (event, e, isNew) {
                        return confirmChanges(event, isNew);
                    });

                    scheduler.attachEvent('onEventSave', function (id, event, isNew) {
                        return confirmChanges(scheduler.getEvent(id), isNew);
                    });

                    scheduler.attachEvent('onBeforeLightbox', function (id) {
                        event = scheduler.getEvent(id);

                        if (!event.event) {
                            scheduler.config.buttons_left = ['dhx_save_btn'];
                        } else {
                            scheduler.config.buttons_left = ['dhx_save_btn', 'dhx_cancel_btn'];
                        }

                        return true;
                    });
                }

                // Configuration
                scheduler.skin = 'flat';
                scheduler.config.xml_date = '%Y-%m-%d %H:%i';
                scheduler.config.show_loading = true;
                scheduler.config.multi_day = true;
                scheduler.config.mark_now = true;
                scheduler.config.default_date = '%D, %M %d %Y';
                scheduler.config.hour_date = '%g:%i %A';
                scheduler.config.dblclick_create = false;
                scheduler.config.drag_create = true;
                scheduler.config.edit_on_create = true;
                scheduler.config.icons_select = ['icon_details', 'icon_delete'];
                scheduler.config.full_day = true;
                scheduler.config.multisection = true;

                scheduler.config.first_hour = settings.startHour;
                scheduler.config.last_hour = settings.endHour;
                scheduler.config.scroll_hour = settings.viewHour;
                scheduler.config.hour_size_px = (60 / settings.timeslotMinutes) * (settings.timeslotHeight * 11);

                scheduler.config.map_start = new Date(2014, 1, 1);
                scheduler.config.map_end = new Date(2015, 1, 1);
                scheduler.config.map_inital_zoom = 8;
                scheduler.config.map_resolve_user_location = false;

                var strToDate = scheduler.date.str_to_date("%Y-%m-%d"),
                    dateToStr = scheduler.date.date_to_str("%Y-%m-%d");

                if (settings.readOnly) {
                    scheduler.config.readonly = true;
                    scheduler.config.details_on_dblclick = false;
                } else {
                    scheduler.config.details_on_dblclick = true;

                    scheduler.attachEvent('onDblClick', function (id) {
                        var event = this.getEvent(id);

                        return event['private'] != 'Private';
                    });
                }

                scheduler.locale.labels.unit_tab = 'Resource';
                scheduler.locale.labels.section_location = 'Location';
                scheduler.locale.labels.year_tab = 'Year';

                scheduler.setLoadMode('month');

                dhtmlXTooltip.config.className = 'dhtmlXTooltip tooltip';
                dhtmlXTooltip.config.timeout_to_display = 10;
                dhtmlXTooltip.config.delta_x = 15;
                dhtmlXTooltip.config.delta_y = -20;

                scheduler.createUnitsView({
                    name: 'unit',
                    property: 'resources',
                    list: resources,
                    size: settings.resourceCount,
                    step: settings.resourceJump,
                    skip_incorrect: true
                });

                scheduler.createTimelineView({
                    name: 'multiday',
                    x_unit: 'day',
                    x_date: '%D <br /> %d %M',
                    x_step: 1,
                    x_size: 30,
                    y_unit: resources,
                    y_property: 'resources'
                });

                scheduler.createTimelineView({
                    name: 'timeline',
                    x_unit:	timelineSettings.unit,
                    x_date:	timelineSettings.date,
                    x_step:	timelineSettings.step,
                    x_size: timelineSettings.size,
                    x_start: timelineSettings.start,
                    x_length: timelineSettings.length,
                    y_unit:	resources,
                    y_property:	'resources',
                    dx: 200,
                    dy: 50,
                    render: timelineSettings.type,
                    event_dy: 'full'
                });

                scheduler.attachEvent('onTemplatesReady', function () {
                    scheduler.templates.timeline_scale_date = function (date) {
                        var template = scheduler.date.date_to_str(timelineSettings.date || scheduler.config.hour_date);
                        return template(date);
                    };

                    scheduler.templates.event_text = function (start, end, event) {
                        if (event.event) {
                            return event.event_text + ': ' + event.text;
                        } else {
                            return event.text;
                        }
                    };

                    if (settings.markPastEvents) {
                        scheduler.templates.event_class = function (startDate, endDate, event) {
                            if (endDate < (new Date())) {
                                return 'past_event';
                            }

                            return '';
                        };
                    }

                    var format = scheduler.date.date_to_str("%Y-%m-%d %H:%i");
                    scheduler.templates.tooltip_text = function (start, end, event) {
                        if (scheduler.getState().mode === 'year') {
                            return false;
                        }

                        var text = '<b>Booked for:</b> ' + event.text + '<br />' +
                            '<b>Start date:</b> ' + format(start) + '<br />' +
                            '<b>End date:</b> ' + format(end);

                        if (event.schedules) {
                            var resourceNames = [];

                            $.each(event.schedules, function (index, schedule) {
                                resourceNames.push(schedule.resource.name + (schedule.event ? ' (' + schedule.event.type + ')' : ''));
                            });

                            text += '<br /><b>Resources:</b> ' + resourceNames.join(', ');
                        }

                        return text;
                    };

                    scheduler.templates.hour_scale = function (date) {
                        var hours = date.getHours();
                        var minutes = date.getMinutes();
                        var ampm = hours >= 12 ? 'pm' : 'am';

                        hours = hours % 12;
                        hours = hours ? hours : 12;
                        minutes = minutes < 10 ? '0' + minutes : minutes;

                        return "<span class='dhx_scale_h'>" + hours + "</span>" +
                            "<span class='dhx_scale_m'>&nbsp;"+ minutes +"</span>" +
                            "<span class='dhx_scale_ampm'>"+ ampm +"</span>";
                    };

                    scheduler.form_blocks.resources = {
                        render: function () {
                            return '<div id="scheduler_resources"><a class="btn btn-link">Add resource</a><table><thead><tr><th>Category</th><th>Name</th><th>Event</th><th></th></tr></thead><tbody></tbody></table></div>';
                        },
                        set_value: function (element, value, event) {
                            var $table = $('tbody', element).empty();

                            function setLightboxHeight() {
                                $('.dhx_cal_light').height(214 + $(options.resourceNavigationSelector).height());
                                $('.dhx_cal_larea').height(122 + $(options.resourceNavigationSelector).height());
                            }

                            function addResourceRow(schedule) {
                                var $row = $('<tr><td></td><td></td><td></td><td></td></tr>').data('event', event.id).appendTo($table),
                                    $category = $('<select></select>').appendTo($('td:nth-child(1)', $row)),
                                    $resource = $('<select></select>').appendTo($('td:nth-child(2)', $row)),
                                    $event = $('<select><option value=""></option></select>').appendTo($('td:nth-child(3)', $row)),
                                    $delete = $('<a class="btn btn-xs btn-danger"><i class="fa fa-trash-o"></i></a>').appendTo($('td:nth-child(4)', $row));

                                if (schedule) {
                                    $row.data('schedule', schedule.id);
                                }

                                $.each(resourceData.category, function (index, category) {
                                    $category.append('<option value="' + category.key + '">' + category.label + '</option>');
                                });

                                $category.on('change', function () {
                                    var categoryId = $(this).val();

                                    $resource.empty();
                                    $event.empty();

                                    $.each(resourceData.resource, function (index, resource) {
                                        if (resource.category_id == categoryId) {
                                            $resource.append('<option value="' + resource.key + '">' + resource.label + '</option>');
                                        }
                                    });

                                    $.each(eventData, function (index, event) {
                                        if (event.category == categoryId) {
                                            $('<option value="' + event.key + '">' + event.label + '</option>')
                                                .data('label', event.label)
                                                .css('color', event.color)
                                                .data('color', event.color)
                                                .css('background-color', event.backgroundColor)
                                                .data('background-color', event.backgroundColor)
                                                .appendTo($event);
                                        }
                                    });
                                });

                                $delete.on('click', function () {
                                    if ($row.data('schedule')) {
                                        event.schedules = $.grep(event.schedules, function (schedule) {
                                            return schedule.id != $row.data('schedule');
                                        });
                                    }

                                    $row.remove();

                                    setLightboxHeight();
                                });

                                $event.on('change', function () {
                                    var $row = $('tbody tr', element).last(),
                                        $event = $('td:nth-child(3) select', $row);

                                    event.event = $event.val();
                                    event.event_text = $event.find('option:selected').data('label');
                                    event.textColor = $event.find('option:selected').data('color');
                                    event.color = $event.find('option:selected').data('background-color');
                                });

                                if (schedule) {
                                    $category.val(schedule.resource.category.id).change();

                                    if (schedule.event) {
                                        $event.val(schedule.event.id).change();
                                    }

                                    $resource.val(schedule.resource.id).change();
                                } else {
                                    $category.change();
                                }

                                setLightboxHeight();
                            }

                            $('a', element).off('click').on('click', function () {
                                addResourceRow();
                            });

                            if (event.schedules) {
                                $.each(event.schedules, function (index, schedule) {
                                    addResourceRow(schedule);
                                });
                            } else {
                                event.schedules = [];
                            }
                        },
                        get_value: function (element) {
                            $($('tbody tr', element).get().reverse()).each(function () {
                                var $row = $(this),
                                    $category = $('td:nth-child(1) select', $row),
                                    $resource = $('td:nth-child(2) select', $row),
                                    $event = $('td:nth-child(3) select', $row),
                                    event = scheduler.getEvent($row.data('event')),
                                    resourceIds = [];

                                if ($row.data('schedule')) {
                                    $.each(event.schedules, function (index, schedule) {
                                        if (schedule.id == $row.data('schedule')) {
                                            schedule.event.id = $event.val();
                                            schedule.resource.id = $resource.val();
                                            schedule.resource.category.id = $category.val();
                                        }
                                    });
                                } else {
                                    event.schedules.push({
                                        id: '',
                                        event: { id: $event.val() },
                                        resource: { id: $resource.val(), category: { id: $category.val() } }
                                    });
                                }

                                $.each(event.schedules, function (index, schedule) {
                                    resourceIds.push(schedule.resource.id);
                                });

                                event.resources = resourceIds.join(',');
                            });
                        },
                        focus: function () {}
                    };

                    scheduler.config.lightbox.sections = [
                        { name: 'description', height: 60, map_to: 'text', type: 'textarea', focus: true },
                        { name: 'resources', type: 'resources', map_to: 'auto' },
                        { name: 'time', height: 32, type: 'time', map_to: 'auto' }
                    ];

                    scheduler.locale.labels.section_resources = 'Resources';
                });

                var defaultView = settings.defaultView.toLowerCase();

                if (defaultView == 'resource') {
                    defaultView = 'unit';
                }

                var schedulerDate = scheduler.getState().date;

                if (!schedulerDate || isNaN(schedulerDate.getTime())) {
                    schedulerDate = new Date();
                }

                if (!init) {
                    scheduler.init(id, schedulerDate, scheduler.getState().mode ? scheduler.getState().mode : defaultView);
                }

                reloadEvents(filterType, filterId);

                if (!init) {
                    dp = new dataProcessor(Routing.generate('api_scheduler_process'));
                    dp.init(scheduler);

                    dp.attachEvent('onBeforeDataSending', function (id, action, data) {
                        $.each(data, function (id, serializedEvent) {
                            var schedule = scheduler.getEvent(id),
                                action = serializedEvent['!nativeeditor_status'];

                            delete serializedEvent.color;
                            delete serializedEvent.event;
                            delete serializedEvent.event_text;
                            delete serializedEvent.textColor;

                            if (action == 'updated') {
                                var serializedSchedules = [];
                                var existingResourceIds = [];

                                if (serializedEvent.resources) {
                                    $.each(serializedEvent.resources.toString().split(','), function (index, resourceId) {
                                        existingResourceIds.push(resourceId);
                                    });
                                }

                                $.each(serializedEvent.schedules, function (index, schedule) {
                                    schedule.resource.id = existingResourceIds[index];
                                    serializedSchedules.push(schedule.id + '-' + schedule.resource.id + '-' + (schedule.event ? schedule.event.id : ''));
                                });

                                serializedEvent.schedules = serializedSchedules.join(',');

                                delete serializedEvent.resources;
                            } else if (action == 'inserted') {
                                var defaultEventId = null,
                                    categoryId = null;

                                $.each(resourceData.resource, function (index, resource) {
                                    if (resource.key == schedule.resources) {
                                        categoryId = resource.category_id;
                                        return false;
                                    }
                                });

                                $.each(eventData, function (index, event) {
                                    if (event.category == categoryId) {
                                        defaultEventId = event.key;
                                        return false;
                                    }
                                });

                                schedule.schedules = [
                                    {
                                        id: '',
                                        event: { id: defaultEventId },
                                        resource: { id: schedule.resources, category: { id: categoryId } }
                                    }
                                ];
                            } else if (action == 'deleted') {
                                delete serializedEvent.start_date;
                                delete serializedEvent.end_date;
                                delete serializedEvent.text;
                                delete serializedEvent.resources;
                                delete serializedEvent.lat;
                                delete serializedEvent.lng;
                                delete serializedEvent.location;
                                delete serializedEvent.schedules;
                            }
                        });

                        return true;
                    });

                    dp.attachEvent('onAfterUpdate', function(sid, action, tid, data) {
                        var event = scheduler.getEvent(tid);

                        if (action != 'deleted') {
                            if ($(data).attr('scheduleIds')) {
                                $.each($(data).attr('scheduleIds').split(','), function (index, scheduleId) {
                                    event.schedules[index].id = scheduleId;
                                });
                            }
                        }

                        if (action == 'inserted') {
                            if (scheduler._mode != 'timeline') {
                                scheduler.showLightbox(tid);
                            }
                        }

                        $('.dhx_loading').remove();
                    });
                }

                init = true;
            }

            function getHashData() {
                if (!document.location.hash && !window.localStorage.getItem('scheduler_hash')) {
                    return {};
                }

                var items, data = {};

                if (document.location.hash) {
                    items = document.location.hash.replace('#','').split(',');
                } else {
                    items = window.localStorage.getItem('scheduler_hash').replace('#','').split(',');
                }

                $.each(items, function (index, item) {
                    var splitItem = item.split('=');
                    data[splitItem[0]] = splitItem[1];
                });

                return data;
            }

            function setHashData(hashData) {
                var hash = '#';

                $.each(hashData, function (index, item) {
                    hash += index + '=' + item + ',';
                });

                hash = hash.substr(0, hash.length - 1);

                document.location.hash = hash;
                window.localStorage.setItem('scheduler_hash', hash);
            }

            function getResources(category, key, resourceData) {
                return $.grep(resourceData.resource, function (resource) {
                    if (category == 'resource') {
                        if (key == 'all') {
                            return true;
                        }

                        return resource.key == key;
                    }

                    if (category == 'category') {
                        return resource.category_id == key;
                    }

                    if (category == 'group') {
                        return $.inArray(parseInt(key), resource.group_ids) !== -1;
                    }

                    return false;
                });
            }

            function setFilter(filter, resourceData, settings) {
                var i = filter.indexOf('-'),
                    category = filter.slice(0, i),
                    key = filter.slice(i + 1);

                initScheduler(getResources(category, key, resourceData), category, key);

                var hashData = getHashData();
                hashData.filter = filter;

                setHashData(hashData);
            }

            // TODO: Create timeline selection element and apply timeline settings

            // Initialize resource navigation
            $.each(resourceData, function (type, list) {
                var listElement = $('.' + type, options.resourceNavigationSelector);

                $.each(list, function (index, entity) {
                    $('<option value="' + type + '-' + entity.key + '">' + entity.label + '</option>').appendTo(listElement);
                });
            });

            $(options.resourceNavigationSelector).on('change', function () {
                setFilter($(this).val(), resourceData);
            });

            $('a[data-mode]', options.schedulerNavigationSelector).on('click', function (e) {
                e.preventDefault();
                scheduler.setCurrentView(scheduler._date, $(this).data('mode'));
            });

            $('a.today', options.schedulerNavigationSelector).on('click', function (e) {
                e.preventDefault();
                scheduler._click.dhx_cal_today_button();
            });

            $('a[data-step]', options.schedulerNavigationSelector).on('click', function (e) {
                e.preventDefault();
                scheduler._click.dhx_cal_next_button(0, $(this).data('step'));
            });

            // Init
            var hashData = getHashData();

            if (typeof hashData.filter !== 'undefined') {
                $('#resourceSearch').val(hashData.filter);
            }

            setFilter($(options.resourceNavigationSelector).val(), resourceData, settings);

            $(options.resourceNavigationSelector).chosen({
                disable_search_threshold: 10,
                search_contains: true
            });

            // Auto-refresh
            if (settings.autoRefreshMinutes) {
                setInterval(function () {
                    if (!$(scheduler.getLightbox()).is(':visible')) {
                        initScheduler();
                    }
                }, settings.autoRefreshMinutes * 60 * 1000);
            }

            // Print
            $('.print', options.schedulerNavigationSelector).click(function (e) {
                e.preventDefault();

                var formatDate = scheduler.date.date_to_str("%Y-%m-%d");

                window.location.href = Routing.generate('scheduler_print_resource', {
                    filterType: lastFilterType,
                    filterId: lastFilterId,
                    date: formatDate(scheduler.getState().date)
                });
            });

            $('.refresh', options.resourceNavigationSelector).click(function (e) {
                initScheduler();
            });

            // Calendar
            var calendar = null;

            function destroyCalendar() {
                if (calendar !== null) {
                    scheduler.destroyCalendar(calendar);
                    calendar = null;
                }
            }

            $('.calendar', options.resourceNavigationSelector).on('click', function (e) {
                e.stopPropagation();

                if (calendar === null) {
                    calendar = scheduler.renderCalendar({
                        container: "scheduler_calendar",
                        navigation: true,
                        handler: function(date){
                            scheduler.setCurrentView(date, scheduler._mode);
                            destroyCalendar();
                        }
                    });
                } else {
                    destroyCalendar()
                }
            });

            $('#scheduler_calendar').on('click', function (e) {
                e.stopPropagation();
            });

            $(':not(#scheduler_calendar)').not('#nav .calendar').on('click', function () {
                destroyCalendar();
            });

            $(options.resourceNavigationSelector).trigger('chosen:updated');
        });

        return this;
    };
}(jQuery, Routing));
