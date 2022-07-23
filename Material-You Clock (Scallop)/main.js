let stringBackgroundColour;
let stringHourColour;
let stringMinuteColour;
let stringSecondColour;

let stringDarkBackgroundColour;
let stringDarkTextColour;
let stringDarkHourColour;
let stringDarkMinuteColour;
let stringDarkSecondColour;

let shouldShowDate;
let modeStyle;
let stringClockAppIdentifier;

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

document.documentElement.style.setProperty('--hours-starting-degree', initPos()[0]);
document.documentElement.style.setProperty('--mins-starting-degree', initPos()[1]);
document.documentElement.style.setProperty('--secs-starting-degree', initPos()[2]);

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
    stringHourColour = config.stringHourColour;
    stringMinuteColour = config.stringMinuteColour;
    stringSecondColour = config.stringSecondColour;

    stringDarkBackgroundColour = config.stringDarkBackgroundColour;
    stringDarkHourColour = config.stringDarkHourColour;
    stringDarkMinuteColour = config.stringDarkMinuteColour;
    stringDarkSecondColour = config.stringDarkSecondColour;

    shouldShowDate = config.shouldShowDate;
	stringClockAppIdentifier = config.stringOverrideClockAppID;
}

function updateColours(mode) {
    switch(mode){
        case 2:
            document.getElementById('svgBackground').style.fill = stringDarkBackgroundColour;
            document.getElementById('divHour').style.background = stringDarkHourColour;
            document.getElementById('divMinute').style.background = stringDarkMinuteColour;
            document.getElementById('divSecond').style.background = stringDarkSecondColour;
            document.getElementById('divDate').style.color = stringDarkHourColour;
        break;

        default:
            document.getElementById('svgBackground').style.fill = stringBackgroundColour;
            document.getElementById('divHour').style.background = stringHourColour;
            document.getElementById('divMinute').style.background = stringMinuteColour;
            document.getElementById('divSecond').style.background = stringSecondColour;
            document.getElementById('divDate').style.color = stringHourColour;
        break;
    }
}

function initPos() {
    const today = new Date();
    const hour = today.getHours();
    const min = today.getMinutes();
    const sec = today.getSeconds();

    let hourDegrees = ((hour / 12) * 360) + ((min / 60) * 30) + 180;
    let minDegrees = ((min / 60) * 360) + ((sec / 60) * 6) + 180;
    let secDegrees = (sec / 60) * 360 + 180;

    return [hourDegrees, minDegrees, secDegrees];
}

function doUpdates() {
    checkSystemDarkMode();
    updateColours(modeStyle);

    if (shouldShowDate) {
        const today = new Date();
        const weekday = weekdays[today.getDay()];
        const date = today.getDate();

        if (date < 10) {
            date = '0' + date;
        }

        for (let i = 0; i < 3; i++) {
            setInnerTextForElement('span' + (i + 1).toString(), weekday.charAt(i).toString());
        }

        for (let j = 0; j < 2; j++) {
            setInnerTextForElement('span' + (j + 4).toString(), date.toString().charAt(j).toString());
        }
    }
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