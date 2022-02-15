// ==UserScript==
// @name         Officient additions
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Making Officient better
// @author       Subler
// @match        https://selfservice.officient.io/*
// @icon         https://selfservice.officient.io/favicon-32x32.png
// @grant        none
// ==/UserScript==

(function(){
    let lastClickedIndex = -1;
    addClickListeners();

    const bgColorFocusedDay = "#dddddd";
    const bgColorSortedDay = "#d8ffcb";

    addStyle(`
        .week-calendars .day.today {
            background-color: ${bgColorFocusedDay};
        }

        .custom-current-sorted-day{
            background-color: ${bgColorSortedDay} !important;
        }

        .custom-passed-day {
            display: none !important;
        }
    `);

	function addStyle(styleString) {
	  const style = document.createElement('style');
	  style.textContent = styleString;
	  document.head.append(style);
	}

    function addClickListeners(){
        document.addEventListener('click', function(event){
            const clickedDay = event.target.closest('.week-calendar-header .day');
            if(clickedDay){
                onDayClicked(clickedDay);
            }
        });
    }

    function onDayClicked(clickedDay){
        const index = Array.prototype.indexOf.call(clickedDay.parentNode.children, clickedDay);
        if(lastClickedIndex === index){
            lastClickedIndex = -1;
            resetCalendars();
        }else{
            markCalendarStartOrder();
            lastClickedIndex = index;
            const sortedCalendars = sortOnDay(index);
            rearrangeCalendars(sortedCalendars);
            markDayAndRows(sortedCalendars, index);
        }
    }

    function sortOnDay(dayIndex){
        const personCalendars = getCalendars();
        personCalendars.sort((a,b) => {
            const aValue = getDayType(a, dayIndex) === "free" ? 1 : 0;
            const bValue = getDayType(b, dayIndex) === "free" ? 1 : 0;
            return bValue - aValue;
        });
        return personCalendars;
    }

    function getDayType(personCalendar, dayIndex){
        const day = personCalendar.querySelectorAll('.day')[dayIndex];
        const isFree = !!(day.matches('.empty') && !day.matches('.zeroSchedule, .nullSchedule'));
        return isFree ? 'free' : 'not free';
    }

    function rearrangeCalendars(newCalendars){
        const parent = document.querySelector('.week-calendars');
        while(parent.children.length > 0){
            parent.removeChild(parent.children[0]);
        }
        for(let i=0; i<newCalendars.length; i++){
            parent.appendChild(newCalendars[i]);
        }
    }

    function markDayAndRows(sortedCalendars, index){
        clearMarkings();
        var headerDays = document.querySelectorAll('.week-calendar-header .day');
        mark(headerDays[index]);
        sortedCalendars.forEach(calendar => {
            if(getDayType(calendar, index) === 'free'){
                mark(calendar.querySelectorAll('.day'));
                mark(calendar.querySelector('.person'));
            }else{
                mark(calendar.querySelectorAll('.day')[index]);
            }
        });
    }

    function mark(elements){
        if(!Array.isArray(elements) && !(elements instanceof NodeList)){
            elements = [elements];
        }
        for(let i=0; i<elements.length; i++){
            elements[i].classList.add('custom-current-sorted-day');
        }
    }

    function clearMarkings(){
        const markedElements = document.querySelectorAll('.custom-current-sorted-day');
        for(let i=0; i<markedElements.length; i++){
            markedElements[i].classList.remove('custom-current-sorted-day');
        }
    }

    function markCalendarStartOrder(){
        if(!document.querySelector('[data-custom-calendar-startindex]')){
            getCalendars().forEach((calendar, index) => calendar.setAttribute('data-custom-calendar-startindex', index));
        }
    }

    function resetCalendars(){
        clearMarkings();
        const calendars = getCalendars().sort((a,b) => {
            var aIndex = parseInt(a.getAttribute('data-custom-calendar-startindex'));
            var bIndex = parseInt(b.getAttribute('data-custom-calendar-startindex'));
            return aIndex - bIndex;
        });
        rearrangeCalendars(calendars);
    }

    function getCalendars(){
        return Array.prototype.slice.apply(document.querySelectorAll('.week-calendars .week-calendar-row'));
    }
})();