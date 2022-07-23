let stringBackgroundColour;
let stringTextColour;

let stringDarkBackgroundColour;
let stringDarkTextColour;

let shouldUse24HourClock;
let stringClockAppIdentifier;

let modeStyle;

// Constants
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function onLoad() {
    applyConfiguration();
    doUpdates();
    setInterval(doUpdates, 1000);
}

function onClockClick() {
    api.apps.launchApplication(stringClockAppIdentifier);
}

function applyConfiguration() {
    stringBackgroundColour = config.stringBackgroundColour;
    stringTextColour = config.stringTextColour;

    stringDarkBackgroundColour = config.stringDarkBackgroundColour;
    stringDarkTextColour = config.stringDarkTextColour;

    stringClockAppIdentifier = config.stringOverrideClockAppID;
    shouldUse24HourClock = config.shouldUse24HourClock;
}

function updateColours(mode) {
    switch(mode){
        case 2:
        document.getElementById('svgPill').style.fill = stringDarkBackgroundColour;
        document.body.style.color = stringDarkTextColour;
        break;

        default:
        document.getElementById('svgPill').style.fill = stringBackgroundColour;
        document.body.style.color = stringTextColour;
        break;
    }
}

function doUpdates() {
    checkSystemDarkMode();
    updateColours(modeStyle);

    const dateToday = new Date();
    const theWeekday = weekdays[dateToday.getDay()];
    const theMonth = months[dateToday.getMonth()];

    let textTime = formatTime(dateToday);
    let textHour = textTime[0].toString();
    let textMin = textTime[1].toString();
    let textDate = truncateStringToLength(theWeekday, 3) + ', ' + truncateStringToLength(theMonth, 3) + ' ' + dateToday.getDate();

    setInnerTextForElement('pDate', textDate);

    setInnerTextForElement('divLeft', textHour.charAt(0) + '\n' + textMin.charAt(0));
    setInnerTextForElement('divRight', textHour.charAt(1) + '\n' + textMin.charAt(1));
}

function setInnerTextForElement(elementIn, innerTextIn) {
    document.getElementById(elementIn).innerText = innerTextIn;
}

/*********************/
/******* Utils *******/
/*********************/

function checkSystemDarkMode() {
    api.fs.read('/var/mobile/Library/Preferences/com.apple.uikitservices.userInterfaceStyleMode.plist', 'plist').then((data) => {
        console.log(data);
        modeStyle = data.UserInterfaceStyleMode;
    }).catch((error) => {
        modeStyle = 0;
    });
}

function truncateStringToLength(stringIn, intLengthIn) {
    return stringIn.substring(0, intLengthIn);
}

function formatTime(dateIn) {
    let hour = dateIn.getHours();
    let min = dateIn.getMinutes();

    if (min < 10) {
        min = "0" + min;
    }

    if (!shouldUse24HourClock) {
        if (hour > 12) {
            hour -= 12;
        }
    }

    if (hour < 10) {
        hour = "0" + hour;
    }

    return [hour, min];
}