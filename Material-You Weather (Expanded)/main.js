let stringBackgroundColour;
let stringTextColour;

let stringDarkBackgroundColour;
let stringDarkTextColour;

let shouldUse24HourClock;
let stringWeatherAppIdentifier;

let modeStyle;

function onLoad() {
    api.weather.observeData(function (newData) {
        for (let i = 0; i < 3; i++) {
            const hourlyWeather = newData.hourly[i];
            setInnerTextForElement(('p' + i + 'HourTemp'), ('' + hourlyWeather.temperature.forecast + '\u00B0'));
            setSRCForElement(('imgWeatherIcon' + i + 'Hour'), ('xui://resource/default/weather/' + hourlyWeather.condition.code + '.svg'));
            let hours = hourlyWeather.timestamp.getHours();
            if (shouldUse24HourClock) {
                if (hours < 10) {
                    hours = "0" + hours;
                }

                hours = hours + ":00";
            } else {
                if (hours > 12) {
                    hours -= 12;
                    hours = hours + "PM";
                } else if (hours == 12) {
                    hours = hours + "PM";
                } else {
                    hours = hours + "AM";
                }
            }
            setInnerTextForElement(('p' + i + 'HourTime'), hours);
        }

	setInnerTextForElement('pCondition', truncateStringToLength(newData.now.condition.description, 13, true));
    });

    applyConfiguration();
    doUpdates();
    setInterval(doUpdates, 1000);
}

function onWeatherClick() {
    api.apps.launchApplication(stringWeatherAppIdentifier);
}

function applyConfiguration() {
    stringBackgroundColour = config.stringBackgroundColour;
    stringTextColour = config.stringTextColour;

    stringDarkBackgroundColour = config.stringDarkBackgroundColour;
    stringDarkTextColour = config.stringDarkTextColour;
    shouldUse24HourClock = config.shouldUse24HourClock;
    stringWeatherAppIdentifier = config.stringOverrideWeatherAppID;
}

function updateColours(mode) {
    switch (mode) {
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
}

function setInnerTextForElement(elementIn, innerTextIn) {
    document.getElementById(elementIn).innerText = innerTextIn;
}

function setSRCForElement(elementIn, srcIn) {
    document.getElementById(elementIn).src = srcIn;
    document.getElementById(elementIn).style.width = '32px';
}

function truncateStringToLength(stringIn, intLengthIn, shouldAddEllipsis) {
    let stringOutput = '';
    let canAddEllipsis = shouldAddEllipsis;
    let isLastCharacterSpace = false;

    if (shouldAddEllipsis && stringIn.length <= intLengthIn) {
        canAddEllipsis = false;
    }

    for (let i = 0; i < intLengthIn; i++) {
        stringOutput = stringOutput + stringIn.charAt(i);

        if (i === (intLengthIn - 1)) {
            isLastCharacterSpace = (stringIn.charAt(i) === ' '.charAt(0));
        }
    }

    return stringOutput + (isLastCharacterSpace ? '' : ' ') + (canAddEllipsis ? '...' : '');
}


function checkSystemDarkMode() {
    api.fs.read('/var/mobile/Library/Preferences/com.apple.uikitservices.userInterfaceStyleMode.plist', 'plist').then((data) => {
        console.log(data);
        modeStyle = data.UserInterfaceStyleMode;
    }).catch((error) => {
        modeStyle = 0;
    });
}