/*
 * jQuery.weekCalendar v1.2.2
 * http://www.redredred.com.au/
 *
 * Requires:
 * - jquery.weekcalendar.css
 * - jquery 1.3.x
 * - jquery-ui 1.7.x (widget, drag, drop, resize)
 *
 * Copyright (c) 2009 Rob Monie
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *   
 *   If you're after a monthly calendar plugin, check out http://arshaw.com/fullcalendar/
 */


(function($) {
   $.widget("ui.weekCalendar", {

      /***********************
       * Initialise calendar *
       ***********************/
      _init : function() {
         var self = this;
         this.eventStartDates = [];
         self._computeOptions();
         self._setupEventDelegation();
         self._renderCalendar();
         self._loadCalEvents();
         self._resizeCalendar();
         self._scrollToHour(self.options.date.getHours());

         $(window).unbind("resize.weekcalendar");
         $(window).bind("resize.weekcalendar", function() {
            self._resizeCalendar();
         });

      },

      /********************
       * public functions *
       ********************/
      /*
       * Refresh the events for the currently displayed week.
       */
      addEventStartDate : function(startDate) {
        this.eventStartDates.push(startDate);
      },
      removeEventStartDate : function(startDate) {
        var index = this.eventStartDates.indexOf(startDate);
        if (index >= 0) {
          this.eventStartDates.splice( index, 1 );
        }
      },
      refresh : function() {
         this._clearCalendar();
         this._loadCalEvents(this.element.data("startDate")); //reload with existing week
      },

      /*
       * Clear all events currently loaded into the calendar
       */
      clear : function() {
         this._clearCalendar();
      },

      /*
       * Go to this week
       */
      today : function() {
         this._clearCalendar();
         $('#datepicker').datepicker("setDate", new Date());
         this._loadCalEvents(new Date());
      },

      /*
       * Go to the previous week relative to the currently displayed week
       */
      prevWeek : function() {
         //minus more than 1 day to be sure we're in previous week - account for daylight savings or other anomolies
         var newDate = new Date(this.element.data("startDate").getTime() - (MILLIS_IN_WEEK));
         $('#datepicker').datepicker("setDate", newDate);
         this._clearCalendar();
         this._loadCalEvents(newDate);
      },

      /*
       * Go to the next week relative to the currently displayed week
       */
      nextWeek : function() {
        //add 8 days to be sure of being in prev week - allows for daylight savings or other anomolies
        var newDate = new Date(this.element.data("startDate").getTime() + MILLIS_IN_WEEK);
        $('#datepicker').datepicker("setDate", newDate);
        this._clearCalendar();
        this._loadCalEvents(newDate);
      },

      location : function() {
        this._clearCalendar();
        this._loadCalEvents();
      },

      /*
       * Reload the calendar to whatever week the date passed in falls on.
       */
      gotoWeek : function(date) {
         $('#datepicker').datepicker("setDate", date);
         this._clearCalendar();
         this._loadCalEvents(date);
      },

      /*
       * Remove an event based on it's id
       */
      removeEvent : function(eventId) {

         var self = this;

         self.element.find(".wc-cal-event").each(function() {
            if ($(this).data("calEvent").id === eventId) {
               $(this).remove();
               return false;
            }
         });

         //this could be more efficient rather than running on all days regardless...
         self.element.find(".wc-day-column-inner").each(function() {
            self._adjustOverlappingEvents($(this));
         });
      },

      /*
       * Removes any events that have been added but not yet saved (have no id).
       * This is useful to call after adding a freshly saved new event.
       */
      removeUnsavedEvents : function() {

         var self = this;

         self.element.find(".wc-new-cal-event").each(function() {
            $(this).remove();
         });

         //this could be more efficient rather than running on all days regardless...
         self.element.find(".wc-day-column-inner").each(function() {
            self._adjustOverlappingEvents($(this));
         });
      },

      /*
       * update an event in the calendar. If the event exists it refreshes
       * it's rendering. If it's a new event that does not exist in the calendar
       * it will be added.
       */
      updateEvent : function (calEvent) {
         this._updateEventInCalendar(calEvent);
      },

      /*
       * Returns an array of timeslot start and end times based on
       * the configured grid of the calendar. Returns in both date and
       * formatted time based on the 'timeFormat' config option.
       */
      getTimeslotTimes : function(date) {
         var options = this.options;
         var firstHourDisplayed = options.businessHours.limitDisplay ? options.businessHours.start : 0;
         var startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), firstHourDisplayed);

         var times = []
         var startMillis = startDate.getTime();
         for (var i = 0; i < options.timeslotsPerDay; i++) {
            var endMillis = startMillis + options.millisPerTimeslot;
            times[i] = {
               start: new Date(startMillis),
               startFormatted: this._formatDate(new Date(startMillis), options.timeFormat),
               end: new Date(endMillis),
               endFormatted: this._formatDate(new Date(endMillis), options.timeFormat)
            };
            startMillis = endMillis;
         }
         return times;
      },

      formatDate : function(date, format) {
         if (format) {
            return this._formatDate(date, format);
         } else {
            return this._formatDate(date, this.options.dateFormat);
         }
      },

      formatTime : function(date, format) {
         if (format) {
            return this._formatDate(date, format);
         } else {
            return this._formatDate(date, this.options.timeFormat);
         }
      },

      getData : function(key) {
         return this._getData(key);
      },

      /*********************
       * private functions *
       *********************/
      // compute dynamic options based on other config values
      _computeOptions : function() {

         var options = this.options;

         if (options.businessHours.limitDisplay) {
            options.timeslotsPerDay = options.timeslotsPerHour * (options.businessHours.end - options.businessHours.start);
            options.millisToDisplay = (options.businessHours.end - options.businessHours.start) * 60 * 60 * 1000;
            options.millisPerTimeslot = options.millisToDisplay / options.timeslotsPerDay;
         } else {
            options.timeslotsPerDay = options.timeslotsPerHour * 24;
            options.millisToDisplay = MILLIS_IN_DAY;
            options.millisPerTimeslot = MILLIS_IN_DAY / options.timeslotsPerDay;
         }
      },

      /*
       * Resize the calendar scrollable height based on the provided function in options.
       */
      _resizeCalendar : function () {

         var options = this.options;
         if (options && $.isFunction(options.height)) {
            var calendarHeight = options.height(this.element);
            var headerHeight = this.element.find(".wc-header").outerHeight();
            var navHeight = this.element.find(".wc-nav").outerHeight();
            this.element.find(".wc-scrollable-grid").height(calendarHeight - navHeight - headerHeight);
         }
      },

      /*
       * configure calendar interaction events that are able to use event
       * delegation for greater efficiency
       */
      _setupEventDelegation : function() {
         var self = this;
         var options = this.options;
         this.element.click(function(event) {
            var $target = $(event.target);
            if ($target.data("preventClick")) {
               return;
            }
            if ($target.hasClass("wc-cal-event")) {
               options.eventClick($target.data("calEvent"), $target, event);
            } else if ($target.parent().hasClass("wc-cal-event")) {
               options.eventClick($target.parent().data("calEvent"), $target.parent(), event);
            }
         }).mouseover(function(event) {
            var $target = $(event.target);

            if (self._isDraggingOrResizing($target)) {
               return;
            }

            if ($target.hasClass("wc-cal-event")) {
               options.eventMouseover($target.data("calEvent"), $target, event);
            }
         }).mouseout(function(event) {
            var $target = $(event.target);
            if (self._isDraggingOrResizing($target)) {
               return;
            }
            if ($target.hasClass("wc-cal-event")) {
               if ($target.data("sizing")) return;
               options.eventMouseout($target.data("calEvent"), $target, event);

            }
         });
      },

      /*
       * check if a ui draggable or resizable is currently being dragged or resized
       */
      _isDraggingOrResizing : function ($target) {
         return $target.hasClass("ui-draggable-dragging") || $target.hasClass("ui-resizable-resizing");
      },

      /*
       * Render the main calendar layout
       */
      _renderCalendar : function() {
         var $calendarContainer, calendarNavHtml, calendarHeaderHtml, calendarBodyHtml, $weekDayColumns;
         var self = this;
         var options = this.options;

         $calendarContainer = $("<div class=\"wc-container\">").appendTo(self.element);

         if (options.buttons) {
            calendarNavHtml = "<div class=\"wc-nav\">\
                    <button class=\"wc-prev\">" + options.buttonText.lastWeek + "</button>\
                    <button class=\"wc-today\">" + options.buttonText.today + "</button>\
                    <button class=\"wc-next\">" + options.buttonText.nextWeek + "</button>\
                    </div>";

            $(calendarNavHtml).appendTo($calendarContainer);

            $calendarContainer.find(".wc-nav .wc-today").click(function() {
               self.element.weekCalendar("today");
               return false;
            });

            $calendarContainer.find(".wc-nav .wc-prev").click(function() {
               self.element.weekCalendar("prevWeek");
               return false;
            });

            $calendarContainer.find(".wc-nav .wc-next").click(function() {
               self.element.weekCalendar("nextWeek");
               return false;
            });

         }

         //render calendar header
         calendarHeaderHtml = "<table class=\"wc-header\"><tbody><tr><td class=\"wc-time-column-header\"></td>";
         for (var i = 1; i <= options.daysToShow; i++) {
            calendarHeaderHtml += "<td class=\"wc-day-column-header wc-day-" + i + "\"></td>";
         }
         calendarHeaderHtml += "<td class=\"wc-scrollbar-shim\"></td></tr></tbody></table>";

         //render calendar body
         calendarBodyHtml = "<div class=\"wc-scrollable-grid\">\
                <table class=\"wc-time-slots\">\
                <tbody>\
                <tr>\
                <td class=\"wc-grid-timeslot-header\"></td>\
                <td colspan=\"" + options.daysToShow + "\">\
                <div class=\"wc-time-slot-wrapper\">\
                <div class=\"wc-time-slots\">";

         var start = options.businessHours.limitDisplay ? options.businessHours.start : 0;
         var end = options.businessHours.limitDisplay ? options.businessHours.end : 24;

         for (var i = start; i < end; i++) {
            for (var j = 0; j < options.timeslotsPerHour - 1; j++) {
               calendarBodyHtml += "<div class=\"wc-time-slot\"></div>";
            }
            calendarBodyHtml += "<div class=\"wc-time-slot wc-hour-end\"></div>";
         }

         calendarBodyHtml += "</div></div></td></tr><tr><td class=\"wc-grid-timeslot-header\">";

         for (var i = start; i < end; i++) {

            var bhClass = (options.businessHours.start <= i && options.businessHours.end > i) ? "wc-business-hours" : "";
            calendarBodyHtml += "<div class=\"wc-hour-header " + bhClass + "\">"
            if (options.use24Hour) {
               calendarBodyHtml += "<div class=\"wc-time-header-cell\">" + self._24HourForIndex(i) + "</div>";
            } else {
               calendarBodyHtml += "<div class=\"wc-time-header-cell\">" + self._hourForIndex(i) + "<span class=\"wc-am-pm\">" + self._amOrPm(i) + "</span></div>";
            }
            calendarBodyHtml += "</div>";
         }

         calendarBodyHtml += "</td>";

         for (var i = 1; i <= options.daysToShow; i++) {
            calendarBodyHtml += "<td class=\"wc-day-column day-" + i + "\"><div class=\"wc-day-column-inner\"></div></td>"
         }

         calendarBodyHtml += "</tr></tbody></table></div>";

         //append all calendar parts to container
         $(calendarHeaderHtml + calendarBodyHtml).appendTo($calendarContainer);

         $weekDayColumns = $calendarContainer.find(".wc-day-column-inner");
         $weekDayColumns.each(function(i, val) {
            $(this).height(options.timeslotHeight * options.timeslotsPerDay);
            if (!options.readonly) {
               self._addDroppableToWeekDay($(this));
               self._setupEventCreationForWeekDay($(this));
            }
         });

         $calendarContainer.find(".wc-time-slot").height(options.timeslotHeight - 1); //account for border

         $calendarContainer.find(".wc-time-header-cell").css({
            height :  (options.timeslotHeight * options.timeslotsPerHour) - 11,
            padding: 5
         });


      },

      /*
       * setup mouse events for capturing new events
       */
      _setupEventCreationForWeekDay : function($weekDay) {
         var self = this;
         var options = this.options;
         $weekDay.mousedown(function(event) {
            var $target = $(event.target);
            
            var columnOffset = $target.offset().top;
            var clickY = event.pageY - columnOffset;
            var clickYRounded = (clickY - (clickY % options.timeslotHeight)) / options.timeslotHeight;
            var topPosition = clickYRounded * options.timeslotHeight;
            var top = parseInt(topPosition);
            var startOffsetMillis = options.businessHours.limitDisplay ? options.businessHours.start * 60 * 60 * 1000 : 0;
            var start = new Date($weekDay.data("startDate").getTime() + startOffsetMillis + Math.round(top / options.timeslotHeight) * options.millisPerTimeslot);
            var now = new Date();

            if (now < start && $target.hasClass("wc-day-column-inner")) {
               var $newEvent = $("<div class=\"wc-cal-event wc-new-cal-event wc-new-cal-event-creating\"></div>");

               $newEvent.css({lineHeight: (options.timeslotHeight - 2) + "px", fontSize: (options.timeslotHeight / 2) + "px"});
               $target.append($newEvent);

               $newEvent.css({top: topPosition});

               $target.bind("mousemove.newevent", function(event) {
                  var isLap = false;
                  var eventDuration = self._getEventDurationFromPositionedEventElement($weekDay, $newEvent, top);
                  var endTime = eventDuration.end.getTime();
                  for (var i = 0, length = self.eventStartDates.length ; i < length ; i++) {
                    if(endTime == self.eventStartDates[i]) {
                      return;
                    }
                  }
                  
                  $newEvent.show();
                  $newEvent.addClass("ui-resizable-resizing");
                  
                  var height = Math.round(event.pageY - columnOffset - topPosition);
                  var remainder = height % options.timeslotHeight;

                  if (remainder < (height / 2)) {
                    console.log('aa');
                     var useHeight = height - remainder;
                     $newEvent.css("height", useHeight < options.timeslotHeight ? options.timeslotHeight : useHeight);
                  } else {
                    console.log('bb');
                     $newEvent.css("height", height + (options.timeslotHeight - remainder));
                  }
                  
               }).mouseup(function() {
                  $target.unbind("mousemove.newevent");
                  $newEvent.addClass("ui-corner-all");
               });
            }

         }).mouseup(function(event) {
            var $target = $(event.target);

            var $weekDay = $target.closest(".wc-day-column-inner");
            var $newEvent = $weekDay.find(".wc-new-cal-event-creating");

            if ($newEvent.length) {
               //if even created from a single click only, default height
               if (!$newEvent.hasClass("ui-resizable-resizing")) {
                  $newEvent.css({height: options.timeslotHeight * options.defaultEventLength}).show();
               }
               var top = parseInt($newEvent.css("top"));
               var eventDuration = self._getEventDurationFromPositionedEventElement($weekDay, $newEvent, top);

               $newEvent.remove();
               var newCalEvent = {start: eventDuration.start, end: eventDuration.end, title: options.newEventText};
               var $renderedCalEvent = self._renderEvent(newCalEvent, $weekDay);

               if (!options.allowCalEventOverlap) {
                  self._adjustForEventCollisions($weekDay, $renderedCalEvent, newCalEvent, newCalEvent);
                  self._positionEvent($weekDay, $renderedCalEvent);
               } else {
                  self._adjustOverlappingEvents($weekDay);
               }

               options.eventNew(eventDuration, $renderedCalEvent);
            }
         });
      }, 
      /*
       * load calendar events for the week based on the date provided
       */
      _loadCalEvents : function(dateWithinWeek) {

         var date, weekStartDate, endDate, $weekDayColumns;
         var self = this;
         var options = this.options;
         date = dateWithinWeek || options.date;
         weekStartDate = self._dateFirstDayOfWeek(date);
         weekEndDate = self._dateLastMilliOfWeek(date);

         options.calendarBeforeLoad(self.element);

         self.element.data("startDate", weekStartDate);
         self.element.data("endDate", weekEndDate);

         $weekDayColumns = self.element.find(".wc-day-column-inner");

         self._updateDayColumnHeader($weekDayColumns);

         //load events by chosen means

         var location = $('#location').text(),
            start_date = Math.round(new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1).getTime() / 1000);
            end_date = Math.round(new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 7).getTime() / 1000);

        var url = "/reservations/location/" + location + '/'+ start_date + '/'+ end_date;
        var self = this;

        $.ajax({
          type: "GET",
          url: url,
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          success: function(result){
            var weekStartDate, endDate, $weekDayColumns, data = [];
            
            weekStartDate = self._dateFirstDayOfWeek(date);
            weekEndDate = self._dateLastMilliOfWeek(date);

            self.element.data("startDate", weekStartDate);
            self.element.data("endDate", weekEndDate);

            $weekDayColumns = self.element.find(".wc-day-column-inner");

            self._updateDayColumnHeader($weekDayColumns);
            console.log(result);
            for (var i = 0, reservationLength = result.length ; i < reservationLength ; i++) {
              var calEvent = {
                title: result[i].leader.uid + ' - ' + result[i].leader.name,
                id: result[i].id,
                start: new Date(result[i].start_time*1000),
                end:new Date(result[i].end_time*1000)
              }
              data[i] = calEvent;
            }
            self._renderEvents(data, $weekDayColumns);
          }
        });
         self._disableTextSelect($weekDayColumns);
      },

      /*
       * update the display of each day column header based on the calendar week
       */
      _updateDayColumnHeader : function ($weekDayColumns) {
         var self = this;
         var options = this.options;
         var currentDay = self._cloneDate(self.element.data("startDate"));

         self.element.find(".wc-header td.wc-day-column-header").each(function(i, val) {

            var dayName = options.useShortDayNames ? options.shortDays[currentDay.getDay()] : options.longDays[currentDay.getDay()];

            $(this).html(dayName + "<br/>" + self._formatDate(currentDay, options.dateFormat));
            if (self._isToday(currentDay)) {
               $(this).addClass("wc-today");
            } else {
               $(this).removeClass("wc-today");
            }
            currentDay = self._addDays(currentDay, 1);

         });

         currentDay = self._dateFirstDayOfWeek(self._cloneDate(self.element.data("startDate")));
         currentHour = self.options.date.getHours();

         var pxTop = (self.options.date.getMinutes() + ((self.options.date.getHours() - 9) * 60)) * 2 - 2;
         var line = "<div id=\"line\" style =\"height: 2px; top:" + pxTop + "px; width: 100%; left: 0%; right: 0px;\">";

         $weekDayColumns.each(function(i, val) {

            $(this).data("startDate", self._cloneDate(currentDay));
            $(this).data("endDate", new Date(currentDay.getTime() + (MILLIS_IN_DAY)));
            if (self._isToday(currentDay)) {
               $(this).parent().addClass("wc-today");
               if(currentHour >= 9 && currentHour < 21) {
                $(this).append(line); 
               }
            } else {
               $(this).parent().removeClass("wc-today");
            }

            currentDay = self._addDays(currentDay, 1);
         });
      },

      /*
       * Render the events into the calendar
       */
      _renderEvents : function (events, $weekDayColumns) {
         var self = this;
         var options = this.options;
         var eventsToRender;

         if ($.isArray(events)) {
            eventsToRender = self._cleanEvents(events);
         } else if (events.events) {
            eventsToRender = self._cleanEvents(events.events);
         }
         if (events.options) {

            var updateLayout = false;
            //update options
            $.each(events.options, function(key, value) {
               if (value !== options[key]) {
                  options[key] = value;
                  updateLayout = true;
               }
            });

            self._computeOptions();

            if (updateLayout) {
               self.element.empty();
               self._renderCalendar();
               $weekDayColumns = self.element.find(".wc-time-slots .wc-day-column-inner");
               self._updateDayColumnHeader($weekDayColumns);
               self._resizeCalendar();
            }

         }


         $.each(eventsToRender, function(i, calEvent) {

            var $weekDay = self._findWeekDayForEvent(calEvent, $weekDayColumns);

            if ($weekDay) {
               self._renderEvent(calEvent, $weekDay);
            }
         });

         $weekDayColumns.each(function() {
            self._adjustOverlappingEvents($(this));
         });

         options.calendarAfterLoad(self.element);

         if (!eventsToRender.length) {
            options.noEvents();
         }

      },

      /*
       * Render a specific event into the day provided. Assumes correct
       * day for calEvent date
       */
      _renderEvent: function (calEvent, $weekDay) {
         var self = this;
         var options = this.options;
         if (calEvent.start.getTime() > calEvent.end.getTime()) {
            return; // can't render a negative height
         }

         var eventClass, eventHtml, $calEvent, $modifiedEvent;

         //TODO calEvent.id >= 0 알아봐야할듯
         eventClass = calEvent.id >= 0 ? "wc-cal-event" : "wc-cal-event wc-new-cal-event";
         eventHtml = "<div class=\"" + eventClass + " ui-corner-all\">\
                <div class=\"wc-time ui-corner-all\"></div>\
                <div class=\"wc-title\"></div></div>";

         $calEvent = $(eventHtml);
         $modifiedEvent = options.eventRender(calEvent, $calEvent);
         $calEvent = $modifiedEvent ? $modifiedEvent.appendTo($weekDay) : $calEvent.appendTo($weekDay);
         $calEvent.css({lineHeight: (options.timeslotHeight - 2) + "px", fontSize: (options.timeslotHeight / 2) + "px"});

         self._refreshEventDetails(calEvent, $calEvent);
         self._positionEvent($weekDay, $calEvent);
         $calEvent.show();

         if (!options.readonly && options.resizable(calEvent, $calEvent)) {
            self._addResizableToCalEvent(calEvent, $calEvent, $weekDay)
         }
         if (!options.readonly && options.draggable(calEvent, $calEvent)) {
            self._addDraggableToCalEvent(calEvent, $calEvent);
         }

         options.eventAfterRender(calEvent, $calEvent);

         return $calEvent;

      },

      _adjustOverlappingEvents : function($weekDay) {
         var self = this;
         if (self.options.allowCalEventOverlap) {
            var groupsList = self._groupOverlappingEventElements($weekDay);
            $.each(groupsList, function() {
               var curGroups = this;
               $.each(curGroups, function(groupIndex) {
                  var curGroup = this;

                  // do we want events to be displayed as overlapping
                  if (self.options.overlapEventsSeparate) {
                     var newWidth = 100 / curGroups.length;
                     var newLeft = groupIndex * newWidth;
                  } else {
                     // TODO what happens when the group has more than 10 elements
                     var newWidth = 100 - ( (curGroups.length - 1) * 10 );
                     var newLeft = groupIndex * 10;
                  }
                  $.each(curGroup, function() {
                     // bring mouseovered event to the front
                     if (!self.options.overlapEventsSeparate) {
                        $(this).bind("mouseover.z-index", function() {
                           var $elem = $(this);
                           $.each(curGroup, function() {
                              $(this).css({"z-index":  "1"});
                           });
                           $elem.css({"z-index": "3"});
                        });
                     }
                     $(this).css({width: newWidth + "%", left:newLeft + "%", right: 0});
                  });
               });
            });
         }
      },


      /*
       * Find groups of overlapping events
       */
      _groupOverlappingEventElements : function($weekDay) {
         var $events = $weekDay.find(".wc-cal-event:visible");
         var sortedEvents = $events.sort(function(a, b) {
            return $(a).data("calEvent").start.getTime() - $(b).data("calEvent").start.getTime();
         });

         var lastEndTime = new Date(0, 0, 0);
         var groups = [];
         var curGroups = [];
         var $curEvent;
         $.each(sortedEvents, function() {
            $curEvent = $(this);
            //checks, if the current group list is not empty, if the overlapping is finished
            if (curGroups.length > 0) {
               if (lastEndTime.getTime() <= $curEvent.data("calEvent").start.getTime()) {
                  //finishes the current group list by adding it to the resulting list of groups and cleans it

                  groups.push(curGroups);
                  curGroups = [];
               }
            }

            //finds the first group to fill with the event
            for (var groupIndex = 0; groupIndex < curGroups.length; groupIndex++) {
               if (curGroups[groupIndex].length > 0) {
                  //checks if the event starts after the end of the last event of the group
                  if (curGroups[groupIndex][curGroups [groupIndex].length - 1].data("calEvent").end.getTime() <= $curEvent.data("calEvent").start.getTime()) {
                     curGroups[groupIndex].push($curEvent);
                     if (lastEndTime.getTime() < $curEvent.data("calEvent").end.getTime()) {
                        lastEndTime = $curEvent.data("calEvent").end;
                     }
                     return;
                  }
               }
            }
            //if not found, creates a new group
            curGroups.push([$curEvent]);
            if (lastEndTime.getTime() < $curEvent.data("calEvent").end.getTime()) {
               lastEndTime = $curEvent.data("calEvent").end;
            }
         });
         //adds the last groups in result
         if (curGroups.length > 0) {
            groups.push(curGroups);
         }
         return groups;
      },


      /*
       * find the weekday in the current calendar that the calEvent falls within
       */
      _findWeekDayForEvent : function(calEvent, $weekDayColumns) {

         var $weekDay;
         $weekDayColumns.each(function() {
            if ($(this).data("startDate").getTime() <= calEvent.start.getTime() && $(this).data("endDate").getTime() >= calEvent.end.getTime()) {
               $weekDay = $(this);
               return false;
            }
         });
         return $weekDay;
      },

      /*
       * update the events rendering in the calendar. Add if does not yet exist.
       */
      _updateEventInCalendar : function (calEvent) {
         var self = this;
         self._cleanEvent(calEvent);
         if (calEvent.id) {
            self.element.find(".wc-cal-event").each(function() {
               if ($(this).data("calEvent").id === calEvent.id || $(this).hasClass("wc-new-cal-event")) {
                  $(this).remove();
                  return false;
               }
            });
         }

         var $weekDay = self._findWeekDayForEvent(calEvent, self.element.find(".wc-time-slots .wc-day-column-inner"));
         if ($weekDay) {
            var $calEvent = self._renderEvent(calEvent, $weekDay);
            self._adjustForEventCollisions($weekDay, $calEvent, calEvent, calEvent);
            self._refreshEventDetails(calEvent, $calEvent);
            self._positionEvent($weekDay, $calEvent);
            self._adjustOverlappingEvents($weekDay);
         }
      },

      /*
       * Position the event element within the weekday based on it's start / end dates.
       */
      _positionEvent : function($weekDay, $calEvent) {
         var options = this.options;
         var calEvent = $calEvent.data("calEvent");
         var pxPerMillis = $weekDay.height() / options.millisToDisplay;
         var firstHourDisplayed = options.businessHours.limitDisplay ? options.businessHours.start : 0;
         var startMillis = calEvent.start.getTime() - new Date(calEvent.start.getFullYear(), calEvent.start.getMonth(), calEvent.start.getDate(), firstHourDisplayed).getTime();
         var eventMillis = calEvent.end.getTime() - calEvent.start.getTime();
         var pxTop = pxPerMillis * startMillis;
         var pxHeight = pxPerMillis * eventMillis;
         $calEvent.css({top: pxTop, height: pxHeight});
      },

      /*
       * Determine the actual start and end times of a calevent based on it's
       * relative position within the weekday column and the starting hour of the
       * displayed calendar.
       */
      _getEventDurationFromPositionedEventElement : function($weekDay, $calEvent, top) {
         var options = this.options;
         var startOffsetMillis = options.businessHours.limitDisplay ? options.businessHours.start * 60 * 60 * 1000 : 0;
         var start = new Date($weekDay.data("startDate").getTime() + startOffsetMillis + Math.round(top / options.timeslotHeight) * options.millisPerTimeslot);
         var end = new Date(start.getTime() + ($calEvent.height() / options.timeslotHeight) * options.millisPerTimeslot);
         return {start: start, end: end};
      },

      /*
       * If the calendar does not allow event overlap, adjust the start or end date if necessary to
       * avoid overlapping of events. Typically, shortens the resized / dropped event to it's max possible
       * duration  based on the overlap. If no satisfactory adjustment can be made, the event is reverted to
       * it's original location.
       */
      _adjustForEventCollisions : function($weekDay, $calEvent, newCalEvent, oldCalEvent, maintainEventDuration) {
         var options = this.options;

         if (options.allowCalEventOverlap) {
            return;
         }
         var adjustedStart, adjustedEnd;
         var self = this;

         $weekDay.find(".wc-cal-event").not($calEvent).each(function() {
            var currentCalEvent = $(this).data("calEvent");

            //has been dropped onto existing event overlapping the end time
            if (newCalEvent.start.getTime() < currentCalEvent.end.getTime()
                  && newCalEvent.end.getTime() >= currentCalEvent.end.getTime()) {

               adjustedStart = currentCalEvent.end;
            }


            //has been dropped onto existing event overlapping the start time
            if (newCalEvent.end.getTime() > currentCalEvent.start.getTime()
                  && newCalEvent.start.getTime() <= currentCalEvent.start.getTime()) {

               adjustedEnd = currentCalEvent.start;
            }
            //has been dropped inside existing event with same or larger duration
            if (! oldCalEvent.resizable || (newCalEvent.end.getTime() <= currentCalEvent.end.getTime()
                  && newCalEvent.start.getTime() >= currentCalEvent.start.getTime())) {

               adjustedStart = oldCalEvent.start;
               adjustedEnd = oldCalEvent.end;
               return false;
            }

         });


         newCalEvent.start = adjustedStart || newCalEvent.start;

         if (adjustedStart && maintainEventDuration) {
            newCalEvent.end = new Date(adjustedStart.getTime() + (oldCalEvent.end.getTime() - oldCalEvent.start.getTime()));
            self._adjustForEventCollisions($weekDay, $calEvent, newCalEvent, oldCalEvent);
         } else {
            newCalEvent.end = adjustedEnd || newCalEvent.end;
         }


         //reset if new cal event has been forced to zero size
         if (newCalEvent.start.getTime() >= newCalEvent.end.getTime()) {
            newCalEvent.start = oldCalEvent.start;
            newCalEvent.end = oldCalEvent.end;
         }

         $calEvent.data("calEvent", newCalEvent);
      },

      /*
       * Add draggable capabilities to an event
       */
      _addDraggableToCalEvent : function(calEvent, $calEvent) {
         var self = this;
         var options = this.options;
         var $weekDay = self._findWeekDayForEvent(calEvent, self.element.find(".wc-time-slots .wc-day-column-inner"));
         $calEvent.draggable({
            handle : ".wc-time",
            containment: ".wc-scrollable-grid",
            revert: 'valid',
            opacity: 0.5,
            grid : [$calEvent.outerWidth() + 1, options.timeslotHeight ],
            start : function(event, ui) {
               var $calEvent = ui.draggable;
               options.eventDrag(calEvent, $calEvent);
            }
         });

      },

      /*
       * Add droppable capabilites to weekdays to allow dropping of calEvents only
       */
      _addDroppableToWeekDay : function($weekDay) {
         var self = this;
         var options = this.options;
         $weekDay.droppable({
            accept: ".wc-cal-event",
            drop: function(event, ui) {
               var $calEvent = ui.draggable;
               var top = Math.round(parseInt(ui.position.top));
               var eventDuration = self._getEventDurationFromPositionedEventElement($weekDay, $calEvent, top);
               var calEvent = $calEvent.data("calEvent");
               var newCalEvent = $.extend(true, {start: eventDuration.start, end: eventDuration.end}, calEvent);
               self._adjustForEventCollisions($weekDay, $calEvent, newCalEvent, calEvent, true);
               var $weekDayColumns = self.element.find(".wc-day-column-inner");
               var $newEvent = self._renderEvent(newCalEvent, self._findWeekDayForEvent(newCalEvent, $weekDayColumns));
               $calEvent.hide();

               //trigger drop callback
               options.eventDrop(newCalEvent, calEvent, $newEvent);
               $calEvent.data("preventClick", true);

               var $weekDayOld = self._findWeekDayForEvent($calEvent.data("calEvent"), self.element.find(".wc-time-slots .wc-day-column-inner"));

               if ($weekDayOld.data("startDate") != $weekDay.data("startDate")) {
                  self._adjustOverlappingEvents($weekDayOld);
               }
               self._adjustOverlappingEvents($weekDay);

               setTimeout(function() {
                  $calEvent.remove();
               }, 1000);

            }
         });
      },

      /*
       * Add resizable capabilities to a calEvent
       */
      _addResizableToCalEvent : function(calEvent, $calEvent, $weekDay) {
         var self = this;
         var options = this.options;
         $calEvent.resizable({
            grid: options.timeslotHeight,
            containment : $weekDay,
            handles: "s",
            minHeight: options.timeslotHeight,
            stop :function(event, ui) {
               var $calEvent = ui.element;
               var newEnd = new Date($calEvent.data("calEvent").start.getTime() + ($calEvent.height() / options.timeslotHeight) * options.millisPerTimeslot);
               var newCalEvent = $.extend(true, {start: calEvent.start, end: newEnd}, calEvent);
               self._adjustForEventCollisions($weekDay, $calEvent, newCalEvent, calEvent);

               self._refreshEventDetails(newCalEvent, $calEvent);
               self._positionEvent($weekDay, $calEvent);
               self._adjustOverlappingEvents($weekDay);
               //trigger resize callback
               options.eventResize(newCalEvent, calEvent, $calEvent);
               $calEvent.data("preventClick", true);
               setTimeout(function() {
                  $calEvent.removeData("preventClick");
               }, 500);
            }
         });
      },

      /*
       * Refresh the displayed details of a calEvent in the calendar
       */
      _refreshEventDetails : function(calEvent, $calEvent) {
         var self = this;
         var options = this.options;
         $calEvent.find(".wc-time").html(self._formatDate(calEvent.start, options.timeFormat) + options.timeSeparator + self._formatDate(calEvent.end, options.timeFormat));
         $calEvent.find(".wc-title").html(calEvent.title);
         $calEvent.data("calEvent", calEvent);
      },

      /*
       * Clear all cal events from the calendar
       */
      _clearCalendar : function() {
         this.element.find(".wc-day-column-inner div").remove();
         this.eventStartDates = []
      },

      /*
       * Scroll the calendar to a specific hour
       */
      _scrollToHour : function(hour) {
         var self = this;
         var options = this.options;
         var $scrollable = this.element.find(".wc-scrollable-grid");
         var slot = hour;
         if (self.options.businessHours.limitDisplay) {
            if (hour <= self.options.businessHours.start) {
               slot = 0;
            } else if (hour > self.options.businessHours.end) {
               slot = self.options.businessHours.end -
               self.options.businessHours.start - 1;
            } else {
               slot = hour - self.options.businessHours.start;
            }
            
         }

         var $target = this.element.find(".wc-grid-timeslot-header .wc-hour-header:eq(" + slot + ")");

         $scrollable.animate({scrollTop: 0}, 0, function() {
            var targetOffset = $target.offset().top;
            var scroll = targetOffset - $scrollable.offset().top - $target.outerHeight();
            $scrollable.animate({scrollTop: scroll}, options.scrollToHourMillis);
         });
      },

      /*
       * find the hour (12 hour day) for a given hour index
       */
      _hourForIndex : function(index) {
         if (index === 0) { //midnight
            return 12;
         } else if (index < 13) { //am
            return index;
         } else { //pm
            return index - 12;
         }
      },

      _24HourForIndex : function(index) {
         if (index === 0) { //midnight
            return "00:00";
         } else if (index < 10) {
            return "0" + index + ":00";
         } else {
            return index + ":00";
         }
      },

      _amOrPm : function (hourOfDay) {
         return hourOfDay < 12 ? "AM" : "PM";
      },

      _isToday : function(date) {
         var clonedDate = this._cloneDate(date);
         this._clearTime(clonedDate);
         var today = new Date();
         this._clearTime(today);
         return today.getTime() === clonedDate.getTime();
      },

      /*
       * Clean events to ensure correct format
       */
      _cleanEvents : function(events) {
         var self = this;
         $.each(events, function(i, event) {
            self._cleanEvent(event);
         });
         return events;
      },

      /*
       * Clean specific event
       */
      _cleanEvent : function (event) {
         if (event.date) {
            event.start = event.date;
         }
         event.start = this._cleanDate(event.start);
         event.end = this._cleanDate(event.end);
         if (!event.end) {
            event.end = this._addDays(this._cloneDate(event.start), 1);
         }
      },

      /*
       * Disable text selection of the elements in different browsers
       */
      _disableTextSelect : function($elements) {
         $elements.each(function() {
            if ($.browser.mozilla) {//Firefox
               $(this).css('MozUserSelect', 'none');
            } else if ($.browser.msie) {//IE
               $(this).bind('selectstart', function() {
                  return false;
               });
            } else {//Opera, etc.
               $(this).mousedown(function() {
                  return false;
               });
            }
         });
      },

      /*
       * returns the date on the first millisecond of the week
       */
      _dateFirstDayOfWeek : function(date) {
         var self = this;
         var midnightCurrentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
         var millisToSubtract = self._getAdjustedDayIndex(midnightCurrentDate) * 86400000;
         return new Date(midnightCurrentDate.getTime() - millisToSubtract);

      },

      /*
       * returns the date on the first millisecond of the last day of the week
       */
      _dateLastDayOfWeek : function(date) {
         var self = this;
         var midnightCurrentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
         var millisToAdd = (6 - self._getAdjustedDayIndex(midnightCurrentDate)) * MILLIS_IN_DAY;
         return new Date(midnightCurrentDate.getTime() + millisToAdd);
      },

      /*
       * gets the index of the current day adjusted based on options
       */
      _getAdjustedDayIndex : function(date) {

         var midnightCurrentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
         var currentDayOfStandardWeek = midnightCurrentDate.getDay();
         var days = [0,1,2,3,4,5,6];
         this._rotate(days, this.options.firstDayOfWeek);
         return days[currentDayOfStandardWeek];
      },

      /*
       * returns the date on the last millisecond of the week
       */
      _dateLastMilliOfWeek : function(date) {
         var lastDayOfWeek = this._dateLastDayOfWeek(date);
         return new Date(lastDayOfWeek.getTime() + (MILLIS_IN_DAY));

      },

      /*
       * Clear the time components of a date leaving the date
       * of the first milli of day
       */
      _clearTime : function(d) {
         d.setHours(0);
         d.setMinutes(0);
         d.setSeconds(0);
         d.setMilliseconds(0);
         return d;
      },

      /*
       * add specific number of days to date
       */
      _addDays : function(d, n, keepTime) {
         d.setDate(d.getDate() + n);
         if (keepTime) {
            return d;
         }
         return this._clearTime(d);
      },

      /*
       * Rotate an array by specified number of places.
       */
      _rotate : function(a /*array*/, p /* integer, positive integer rotate to the right, negative to the left... */) {
         for (var l = a.length, p = (Math.abs(p) >= l && (p %= l),p < 0 && (p += l),p), i, x; p; p = (Math.ceil(l / p) - 1) * p - l + (l = p)) {
            for (i = l; i > p; x = a[--i],a[i] = a[i - p],a[i - p] = x);
         }
         return a;
      },

      _cloneDate : function(d) {
         return new Date(d.getTime());
      },

      /*
       * return a date for different representations
       */
      _cleanDate : function(d) {
         if (typeof d == 'string') {
            return $.weekCalendar.parseISO8601(d, true) || Date.parse(d) || new Date(parseInt(d));
         }
         if (typeof d == 'number') {
            return new Date(d);
         }
         return d;
      },

      /*
       * date formatting is adapted from
       * http://jacwright.com/projects/javascript/date_format
       */
      _formatDate : function(date, format) {
         var options = this.options;
         var returnStr = '';
         for (var i = 0; i < format.length; i++) {
            var curChar = format.charAt(i);
            if ($.isFunction(this._replaceChars[curChar])) {
               returnStr += this._replaceChars[curChar](date, options);
            } else {
               returnStr += curChar;
            }
         }
         return returnStr;
      },

      _replaceChars : {

         // Day
         d: function(date) {
            return (date.getDate() < 10 ? '0' : '') + date.getDate();
         },
         D: function(date, options) {
            return options.shortDays[date.getDay()];
         },
         j: function(date) {
            return date.getDate();
         },
         l: function(date, options) {
            return options.longDays[date.getDay()];
         },
         N: function(date) {
            return date.getDay() + 1;
         },
         S: function(date) {
            return (date.getDate() % 10 == 1 && date.getDate() != 11 ? 'st' : (date.getDate() % 10 == 2 && date.getDate() != 12 ? 'nd' : (date.getDate() % 10 == 3 && date.getDate() != 13 ? 'rd' : 'th')));
         },
         w: function(date) {
            return date.getDay();
         },
         z: function(date) {
            return "Not Yet Supported";
         },
         // Week
         W: function(date) {
            return "Not Yet Supported";
         },
         // Month
         F: function(date, options) {
            return options.longMonths[date.getMonth()];
         },
         m: function(date) {
            return (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1);
         },
         M: function(date, options) {
            return options.shortMonths[date.getMonth()];
         },
         n: function(date) {
            return date.getMonth() + 1;
         },
         t: function(date) {
            return "Not Yet Supported";
         },
         // Year
         L: function(date) {
            return "Not Yet Supported";
         },
         o: function(date) {
            return "Not Supported";
         },
         Y: function(date) {
            return date.getFullYear();
         },
         y: function(date) {
            return ('' + date.getFullYear()).substr(2);
         },
         // Time
         a: function(date) {
            return date.getHours() < 12 ? 'am' : 'pm';
         },
         A: function(date) {
            return date.getHours() < 12 ? 'AM' : 'PM';
         },
         B: function(date) {
            return "Not Yet Supported";
         },
         g: function(date) {
            return date.getHours() % 12 || 12;
         },
         G: function(date) {
            return date.getHours();
         },
         h: function(date) {
            return ((date.getHours() % 12 || 12) < 10 ? '0' : '') + (date.getHours() % 12 || 12);
         },
         H: function(date) {
            return (date.getHours() < 10 ? '0' : '') + date.getHours();
         },
         i: function(date) {
            return (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
         },
         s: function(date) {
            return (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
         },
         // Timezone
         e: function(date) {
            return "Not Yet Supported";
         },
         I: function(date) {
            return "Not Supported";
         },
         O: function(date) {
            return (date.getTimezoneOffset() < 0 ? '-' : '+') + (date.getTimezoneOffset() / 60 < 10 ? '0' : '') + (date.getTimezoneOffset() / 60) + '00';
         },
         T: function(date) {
            return "Not Yet Supported";
         },
         Z: function(date) {
            return date.getTimezoneOffset() * 60;
         },
         // Full Date/Time
         c: function(date) {
            return "Not Yet Supported";
         },
         r: function(date) {
            return date.toString();
         },
         U: function(date) {
            return date.getTime() / 1000;
         }
      }

   });

   $.extend($.ui.weekCalendar, {
      version: '1.2.2-pre',
      getter: ['getTimeslotTimes', 'getData', 'formatDate', 'formatTime'],
      defaults: {
         date: new Date(),
         timeFormat : "h:i a",
         dateFormat : "Y년 "+"0M d일",
         use24Hour : false,
         daysToShow : 6,
         firstDayOfWeek : 1,
         useShortDayNames: false,
         timeSeparator : " to ",
         startParam : "start",
         endParam : "end",
         businessHours :{start: 9, end: 21, limitDisplay: true },
         newEventText : "New Event",
         timeslotHeight: 20,
         defaultEventLength : 2,
         timeslotsPerHour : 6,
         buttons : true,
         buttonText : {
            today : "이번주",
            lastWeek : "◀",
            nextWeek : "▶"
        },
        scrollToHourMillis : 500,
        allowCalEventOverlap : true,
        overlapEventsSeparate: true,
         readonly: false,
         //TODO
         draggable : function(calEvent, element) {
            return false;
         },
         resizable : function(calEvent, element) {
            return calEvent.readOnly != true;
         },
         eventClick : function() {
         },
         eventRender : function(calEvent, element) {
            return element;
         },
         eventAfterRender : function(calEvent, element) {
            return element;
         },
         eventDrag : function(calEvent, element) {
         },
         eventDrop : function(calEvent, element) {
         },
         eventResize : function(calEvent, element) {
         },
         eventNew : function(calEvent, element) {
         },
         eventMouseover : function(calEvent, $event) {
         },
         eventMouseout : function(calEvent, $event) {
         },
         calendarBeforeLoad : function(calendar) {
         },
         calendarAfterLoad : function(calendar) {
         },
         noEvents : function() {
         },
         shortMonths : ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
         LongMonths : ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
         shortDays : ['일', '월', '화', '수', '목', '금', '토'],
         longDays : ['일', '월', '화', '수', '목', '금', '토']
      }
   });

   var MILLIS_IN_DAY = 86400000;
   var MILLIS_IN_WEEK = MILLIS_IN_DAY * 7;

   $.weekCalendar = function() {
      return {
         parseISO8601 : function(s, ignoreTimezone) {

            // derived from http://delete.me.uk/2005/03/iso8601.html
            var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
                         "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
                         "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
            var d = s.match(new RegExp(regexp));
            if (!d) return null;
            var offset = 0;
            var date = new Date(d[1], 0, 1);
            if (d[3]) {
               date.setMonth(d[3] - 1);
            }
            if (d[5]) {
               date.setDate(d[5]);
            }
            if (d[7]) {
               date.setHours(d[7]);
            }
            if (d[8]) {
               date.setMinutes(d[8]);
            }
            if (d[10]) {
               date.setSeconds(d[10]);
            }
            if (d[12]) {
               date.setMilliseconds(Number("0." + d[12]) * 1000);
            }
            if (!ignoreTimezone) {
               if (d[14]) {
                  offset = (Number(d[16]) * 60) + Number(d[17]);
                  offset *= ((d[15] == '-') ? 1 : -1);
               }
               offset -= date.getTimezoneOffset();
            }
            return new Date(Number(date) + (offset * 60 * 1000));
         }
      };
   }();


})(jQuery);
if(typeof(reservation) == typeof(undefined)) {
  reservation = {};
}

reservation = {
  create: function() {
    $.ajax({
      type: "POST",
      url: "/reservations",
      data: {},
      success: function(data){
        if(result.status == 200){
          alert('저장되었습니다');
        }
      },
      // dataType: dataType
    });
  }
};



$(document).ready(function() {
  

  $("#datepicker").datepicker({
    prevText: '이전달',
    nextText: '다음달',
    monthNames: ['년 1월','년 2월','년 3월','년 4월','년 5월','년 6월','년 7월','년 8월','년 9월','년 10월','년 11월','년 12월'],
    closeText: '닫기',
    monthNamesShort: ['년 1월','년 2월','년 3월','년 4월','년 5월','년 6월','년 7월','년 8월','년 9월','년 10월','년 11월','년 12월'],
    dayNames: ['일','월','화','수','목','금','토'],
    dayNamesShort: ['일','월','화','수','목','금','토'],
    dayNamesMin: ['일','월','화','수','목','금','토'],
    dateFormat: 'yy-mm-dd',
    firstDay: 1,
    isRTL: false,
    showMonthAfterYear: true,
    yearSuffix: "년",
    duration:200,
    showAnim:'show',
    onSelect: function (date) {
      $("#calendar").weekCalendar("gotoWeek", new Date(date));
    }
  });
});
$(document).ready(function() {
  var $calendar = $('#calendar');

   $calendar.weekCalendar({
      height : function($calendar) {
         return $(window).height() - $("h1").outerHeight() - 1;
      },
      eventRender : function(calEvent, $event) {
        console.log(calEvent.start);

         if (calEvent.end.getTime() < new Date().getTime()) {
            $event.css("backgroundColor", "#aaa");
            $event.find(".wc-time").css({
               "backgroundColor" : "#999",
               "border" : "1px solid #888"
            });
         }

        $calendar.weekCalendar("addEventStartDate", calEvent.start.getTime());
      },
      eventNew : showCreateReservationForm,
      eventClick : showModifyReservationForm,
   });

  // ;

  //TODO
  function showCreateReservationForm(calEvent, $event) {
    resetForm();
    var $dialogContent = $("#event_edit_container");
    var start;
    $dialogContent.dialog({
      modal: true,
      //TODO : 제목 바꿀 것
      title: "스터디룸 예약",
      close: function() {
          $calendar.weekCalendar("removeEventStartDate", calEvent.start.getTime());
         $dialogContent.dialog("destroy");
         $dialogContent.hide();
         $('#calendar').weekCalendar("removeUnsavedEvents");
      },
      buttons: {
        //TODO : 버튼 제목 바꿀 것
        //TODO : 예약 POST 날리기
        '예약' : function() {
          var selectedStartTime = new Date($dialogContent.find("select[name='start']").val()),
              selectedEndTime = new Date($dialogContent.find("select[name='end']").val());
          
          var memberInfomations = [];
          var $members = $("#event_edit_container > div > [data-member]"),
              $leader = $("#event_edit_container > [data-leader]")
          
          if($leader.find('.uid').val() === '') {
            alert('조장 학번을 입력해 주세요');
            return;
          }
          if($leader.find('.name').val() === '') {
            alert('조장 이름을 입력해 주세요');
            return;
          }

          var isOk = true;
          $members.each(function(i) {
            var member = {
              uid: $($members.get(i)).find('.uid').val(),
              name: $($members.get(i)).find('.name').val()  
            }
            if(member.uid === '' || member.name === '') {
              isOk = false;
              return;
            }

            memberInfomations[i] = member;
          });

          if(!isOk) {
            alert('조원의 정보를 올바르게 입력해 주세요.\n(최소 입장인원은 3명입니다)');
            return; 
          }


          var params = {
            reservation: {
              location: $('#location').text(),
              reservation_date: Math.round((new Date(selectedStartTime.getFullYear(), selectedStartTime.getMonth(), selectedStartTime.getDate())).getTime() / 1000),
              start_time: Math.round(selectedStartTime.getTime() / 1000),
              end_time: Math.round(selectedEndTime.getTime() / 1000),
              leader: {
                uid: $leader.find('.uid').val(),
                name: $leader.find('.name').val(),  
              },
              phone_number: $dialogContent.find('[data-phonenumber]').val(),
              members: memberInfomations
            }
          };

          
          
          

          $.ajax({
            type: "POST",
            url: "/reservations",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(params),
            success: function(result){
              console.log(result);
              if(result.status == 200){
                $calendar.weekCalendar("removeEventStartDate", calEvent.start.getTime());
                $calendar.weekCalendar("removeUnsavedEvents");
                calEvent.title = $leader.find('.uid').val() + ' - ' + $leader.find('.name').val();
                calEvent.id = result.rid;
                calEvent.start = selectedStartTime;
                calEvent.members = memberInfomations;
                calEvent.end = selectedEndTime;
                $calendar.weekCalendar("addEventStartDate", calEvent.start.getTime());
                $calendar.weekCalendar("updateEvent", calEvent);
                $dialogContent.dialog("close");
                resetForm();
                alert('예약되었습니다.');
              } else if(result.status == 400) {
                alert('중복된 예약 시간입니다.');
              } else {
                alert('예약실패');
              }
            }
          });
        },
        //TODO : 버튼 제목 바꿀 것
        '예약취소' : function() {
          $calendar.weekCalendar("removeEventStartDate", calEvent.start.getTime());
          $dialogContent.dialog("close");
          resetForm();
        }
      }
    }).show();

    
    // 날짜 추가
    $dialogContent.find(".date_holder").text($calendar.weekCalendar("formatDate", calEvent.start));

    // 시간 추가
    setupStartAndEndTimeFields(calEvent);
  }

  //TODO
  function showModifyReservationForm(calEvent, $event) {
    if (calEvent.readOnly) { return; }

    resetForm();

    var $dialogContent = $("#event_edit_container");
     
    var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
    var endField = $dialogContent.find("select[name='end']").val(calEvent.end);

    var $members = $("#event_edit_container > div > [data-member]"),
        $leader = $("#event_edit_container > [data-leader]");

    $.ajax({
      type: "GET",
      url: "/reservations/" + calEvent.id + '/edit',
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(result){
        $leader.find('.uid').val(result.leader.uid);
        $leader.find('.name').val(result.leader.name);
        $members.each(function(i) {
          if(i >= result.members.length) {
            return;
          } 
          $($members.get(i)).find('.uid').val(result.members[i].uid);
          $($members.get(i)).find('.name').val(result.members[i].name); 
        });
        var length = result.members.length - $members.length;
        for(var i = 0, j = $members.length ; i < length ; i++, j++) {
          addMember();
          $members = $("#event_edit_container > div > [data-member]");
          $($members.get(j)).find('.uid').val(result.members[j].uid);
          $($members.get(j)).find('.name').val(result.members[j].name);
        }
      }
    });

    $dialogContent.dialog({
      modal: true,
      //TODO : 스터디룸 수정 제목 변경
      title: "스터디룸 예약수정",
      close: function() {
        $dialogContent.dialog("destroy");
        $dialogContent.hide();
        $('#calendar').weekCalendar("removeUnsavedEvents");
      },
      buttons: {
        //TODO : 버튼 제목 바꿀 것
        "예약수정" : function() {
          var selectedStartTime = new Date($dialogContent.find("select[name='start']").val()),
              selectedEndTime = new Date($dialogContent.find("select[name='end']").val());

          var memberInfomations = [];
          var $members = $("#event_edit_container > div > [data-member]");

          $members.each(function(i) {
            var member = {
              uid: $($members.get(i)).find('.uid').val(),
              name: $($members.get(i)).find('.name').val()  
            }
            
            memberInfomations[i] = member;
          });

          var params = {
            reservation: {
              location: $('#location').text(),
              reservation_date: Math.round((new Date(selectedStartTime.getFullYear(), selectedStartTime.getMonth(), selectedStartTime.getDate())).getTime() / 1000),
              start_time: Math.round(selectedStartTime.getTime() / 1000),
              end_time: Math.round(selectedEndTime.getTime() / 1000),
              leader: {
                uid: $leader.find('.uid').val(),
                name: $leader.find('.name').val(),  
              },
              phone_number: $dialogContent.find('[data-phonenumber]').val(),
              members: memberInfomations
            }
          };

          console.log("/reservations/" + calEvent.id);
          $.ajax({
            type: "PUT",
            url: "/reservations/" + calEvent.id,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(params),
            success: function(result){
              if(result.status == 200){
                $calendar.weekCalendar("removeUnsavedEvents");
                calEvent.start = selectedStartTime;
                calEvent.end = selectedEndTime;
                $calendar.weekCalendar("updateEvent", calEvent);
                $calendar.weekCalendar("removeEventStartDate", calEvent.start.getTime());
                $dialogContent.dialog("close");
                resetForm();
                alert('수정되었습니다.');
              } else if(result.status == 400) {
                alert('중복된 예약 시간입니다.');
              } else {
                alert('수정실패');
              }
            }
          });
        },
        "예약삭제" : function() {
          console.log(calEvent.id);
          console.log(calEvent.start);
          $.ajax({
            type: "DELETE",
            url: "/reservations/" + calEvent.id,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(result){
            if(result.status == 200){
              alert('삭제되었습니다.');
              $calendar.weekCalendar("removeEventStartDate", calEvent.start.getTime());
              $calendar.weekCalendar("removeEvent", calEvent.id);
              $dialogContent.dialog("close");
              resetForm();
            } else {
              alert('삭제 실패');
            }
            }
          });
        },
        "예약취소" : function() {
          $dialogContent.dialog("close");
          resetForm();
        }
      }
    }).show();

    var startField = $dialogContent.find("select[name='start']").val(calEvent.start);
    var endField = $dialogContent.find("select[name='end']").val(calEvent.end);
    $dialogContent.find(".date_holder").text($calendar.weekCalendar("formatDate", calEvent.start));
    setupStartAndEndTimeFields(calEvent);
    $(window).resize().resize();
  }

  function resetForm() {
    var reservationTemplate = jQuery.extend({}, $('#reservation-template'));
    $('#event_edit_container').html(reservationTemplate.html());
    memberRemoveEventBinding();
    memberAddEventBinding();
    startTimeChangeEventBinding();
    endTimeChangeEventBinding();
  }

  function memberAddEventBinding() {
    $('[data-event-member-add]').click(function() {
      addMember();
    });
  }

  function addMember() {
    var memberTemplate = jQuery.extend({}, $('#member-template'));
    $('#event_edit_container >[member-table]').append(memberTemplate.html());
    memberRemoveEventBinding();
  }

  function memberRemoveEventBinding() {
    $('[data-event-member-remove]').click(function() {
      $(this).parent().remove();
    });

    $('.uid').keyup(function() {
      var $self = $(this);
          uid = $self.val();
      if(uid.length == 7) {
        $.ajax({
          type: "GET",
          url: "/users/" + uid,
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          success: function(result){
            if(result.status === "200") {
              $self.parent('div').find('.name').val(result.name);
              if(typeof($self.parent('div').attr('data-leader'))  != typeof(undefined) ) {
                $($self.parent('div').next().children().get(0)).find('.uid').focus();
              } else {
                $self.parent('div').next().find('.uid').focus();  
              }
            } else {
              $self.next().focus();
            }
          }
        });
      }
    });
  }  
     
  function startTimeChangeEventBinding() {
    $("select[name='start']").change(function() {
      var $startTimeField = $(this),
          $endTimeField = $("#event_edit_container").find("select[name='end']");
      timeOptionSetting($startTimeField, $endTimeField);
    });
  }

  function endTimeChangeEventBinding() {
    $("select[name='end']").change(function() {
      var $startTimeField = $("#event_edit_container").find("select[name='start']"),
          $endTimeField = $(this);
      timeOptionSetting($startTimeField, $endTimeField);
    });
  }

  function timeOptionSetting($startTimeField, $endTimeField) {
    var $endTimeOptions = $endTimeField.find("option");

    var startTime = $startTimeField.find(":selected").val();
    var currentEndTime = $endTimeField.find("option:selected").val();
    $endTimeField.html(
      $endTimeOptions.filter(function() {
         return startTime < $(this).val();
      })
    );

    var endTimeSelected = false;
    $endTimeOptions.each(function() {
      if ($(this).val() === currentEndTime) {
        $(this).attr("selected", "selected");
        endTimeSelected = true;
        return false;
      }
    });

    if (!endTimeSelected) {
      $endTimeField.find("option:eq(0)").attr("selected", "selected");
    }
  }

  //시간 초기화 하는 함수
  function setupStartAndEndTimeFields(calEvent) {
    var $startTimeField = $("#event_edit_container").find("select[name='start']"),
        $endTimeField = $("#event_edit_container").find("select[name='end']");
  
    var timeArray = $calendar.weekCalendar("getTimeslotTimes", calEvent.start),
        selectedStartTime = calEvent.start.getTime();
        selectedEndTime = calEvent.end.getTime();


    for (var i = 0; i < timeArray.length; i++) {
      var startTime = timeArray[i].start,
          endTime = timeArray[i].end;

      var startOption = $('<option/>');
      startOption.attr({ 'value': startTime }).text(timeArray[i].startFormatted);

      var endOption = $('<option/>');
      endOption.attr({ 'value': endTime }).text(timeArray[i].endFormatted);

      if (startTime.getTime() === selectedStartTime) {
          startOption.attr({ 'selected': 'selected' });
      }
    
      if (endTime.getTime() === selectedEndTime) {
          endOption.attr({ 'selected': 'selected' });
      }

      $startTimeField.append(startOption);
      $endTimeField.append(endOption);
    }
  }

  $('[data-event-study-room-click]').click(function() {
    $('#location').text($(this).attr('data-study-room'))
    $calendar.weekCalendar("location");
  });

  
});
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//



