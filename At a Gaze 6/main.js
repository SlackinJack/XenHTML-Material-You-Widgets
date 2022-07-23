// Booleans
let shouldAbbreviateMonth;
let shouldAddLeadingZeroToHours;
let shouldShowAllDayEvents;
let shouldShowEvents;
let shouldShowNowPlaying;
let shouldShowOverdueReminders;
let shouldShowReminders;
let shouldShowTimeUntilEvent;
let shouldShowWeather;
let shouldUse24HourClock;
let shouldUseDarkText;
let shouldUseAdaptiveColouredText;

// Data
let dataCalendarLatest = null;
let dataMusicLatest = null;
let dataReminderLatest = null;

// Integers
let intTimeRange;

// Strings
let stringCalendarAppIdentifier;
let stringRemindersAppIdentifier;
let stringWeatherAppIdentifier;
let stringCurrentAppIdentifierHeading;
let stringCurrentAppIdentifierSubheading;

// Constants
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const imgCalAsset = 'assets/cal.png';
const imgMusicAsset = 'assets/music.png';
const imgPlayingAsset = 'assets/playing.png';
const imgReminderAsset = 'assets/reminder.png';
const imgSpotifyAsset = 'assets/spotify.png';
const imgYoutubeAsset = 'assets/youtube.png';
const imgYoutubeMusicAsset = 'assets/youtubemusic.png';

let modeStyle;

/**********************/
/***** Main Funcs *****/
/**********************/

function onLoad() {
    applyConfiguration();

    api.reminders.observeData(function (dataIn) {
        dataReminderLatest = dataIn;
    });

    api.calendar.observeData(function (dataIn) {
        dataCalendarLatest = dataIn;
    });

    api.media.observeData(function (dataIn) {
        dataMusicLatest = dataIn;
    });

    doUpdates();
    setInterval(doUpdates, 1500);
}

function onHeadingClick() {
    api.apps.launchApplication(stringCurrentAppIdentifierHeading);
}

function onSubheadingClick() {
    api.apps.launchApplication(stringCurrentAppIdentifierSubheading);
}


function onWeatherClick() {
    api.apps.launchApplication(stringWeatherAppIdentifier);
}

/**********************/
/****** Updaters ******/
/**********************/

function doUpdates() {
    if (shouldUseAdaptiveColouredText) {
        checkSystemDarkMode();
        updateColours(modeStyle);
    } else {
        updateColours(shouldUseDarkText ? 1 : 2);
    }

    let dataToUse = getData();

    setHeadingString(dataToUse[1]);
    setSubheadingString(dataToUse[2], dataToUse[6]);
    setSubheadingImage(dataToUse[3]);
    setAppToOpen(dataToUse[4], dataToUse[5]);
}

function getData() {
    let dataReminder = updateReminder();
    let dataCalendar = updateCalendar();

    if (dataReminder[0] === -1 && dataCalendar[0] === -1) {
        return updateDefault();
    } else {
        if (dataReminder[0] !== -1 && dataCalendar[0] !== -1) {
            if (dataReminder[0] <= dataCalendar[0]) {
                return dataReminder;
            } else {
                return dataCalendar;
            }
        } else {
            if (dataCalendar[0] >= 0) {
                return dataCalendar;
            } else {
                return dataReminder;
            }
        }
    }
}

function updateReminder() {
    let timestamp = -1;
    let stringHeading = '';
    let stringSubheading = '';

    let imgAsset = imgReminderAsset;

    if (shouldUseAdaptiveColouredText) {
        imgAsset = (modeStyle != 2) ? changeDarkIcon(imgAsset) : imgAsset;
    } else if (shouldUseDarkText) {
        imgAsset = changeDarkIcon(imgAsset);
    }

    if (shouldShowReminders) {
        if (dataReminderLatest !== null && dataReminderLatest.pending.length > 0) {
            const timeCurrent = new Date();
            const timeCurrentWithOffset = new Date(timeCurrent.getTime() + (intTimeRange * 60 * 60 * 1000));
            let nearestReminder = null;

            for (let i = 0; i < dataReminderLatest.pending.length; i++) {
                let theReminder = dataReminderLatest.pending[i];

                if (theReminder.due > -1) {
                    if (theReminder.due < timeCurrent.getTime()) {
                        if (!shouldShowOverdueReminders) {
                            continue;
                        } else {
                            nearestReminder = theReminder;
                            break;
                        }
                    } else {
                        if (theReminder.due <= timeCurrentWithOffset.getTime()) {
                            if (nearestReminder != null) {
                                if (theReminder.due < nearestReminder.due) {
                                    nearestReminder = theReminder;
                                }
                            } else {
                                nearestReminder = theReminder;
                            }
                        }
                    }
                }
            }

            if (nearestReminder !== null) {
                timestamp = nearestReminder.due;
                stringHeading = nearestReminder.title;

                if (shouldShowTimeUntilEvent) {
                    const timeDifference = getApproximateTimeDifference(timeCurrent.getTime(), nearestReminder.due);

                    if (timeDifference[0] > 0) {
                        stringHeading = timeDifference[0] + ' ' + timeDifference[1] + ': ' + stringHeading;
                    } else if (timeDifference[0] < 0) {
                        stringHeading = 'Now: ' + stringHeading;
                    } else {
                        stringHeading = 'Soon: ' + stringHeading;
                    }
                }

                stringSubheading = 'at ' + formatTime(nearestReminder.due);
            }
        }
    }

    return [timestamp, stringHeading, stringSubheading, imgAsset, stringRemindersAppIdentifier, stringRemindersAppIdentifier, true];
}

function updateCalendar() {
    let intTimestamp = -1;
    let stringHeading = '';
    let stringSubheading = '';
    let imgAsset = imgCalAsset;

    if (shouldUseAdaptiveColouredText) {
        imgAsset = (modeStyle != 2) ? changeDarkIcon(imgAsset) : imgAsset;
    } else if (shouldUseDarkText) {
        imgAsset = changeDarkIcon(imgAsset);
    }

    if (shouldShowEvents) {
        if (dataCalendarLatest !== null && dataCalendarLatest.upcomingWeekEvents.length > 0) {
            const nearestEvent = dataCalendarLatest.upcomingWeekEvents[0];
            const timeCurrent = new Date();
            const timeCurrentWithOffset = new Date(timeCurrent.getTime() + (intTimeRange * 60 * 60 * 1000));
            const timeNearestEventStart = new Date(nearestEvent.start);

            if (nearestEvent.start <= timeCurrentWithOffset.getTime()) {
                if (nearestEvent.end >= timeCurrent.getTime()) {
                    stringHeading = nearestEvent.title;

                    if (nearestEvent.allDay && shouldShowAllDayEvents) {
                        intTimestamp = nearestEvent.start;
                        
                        const doubleTimeDifference = (nearestEvent.start - timeCurrent.getTime()) / 1000 / 60 / 60 / 24;

                        if (doubleTimeDifference < 1 && timeNearestEventStart.getDate() === timeCurrent.getDate()) {
                            stringSubheading = 'All day today';
                        } else {
                            if (doubleTimeDifference <= 1) {
                                stringSubheading = 'All day tomorrow';
                            } else {
                                const roundedDifference = Math.ceil(doubleTimeDifference);
                                stringSubheading = 'All day in ' + roundedDifference + ' ' + formatPluralSingular(roundedDifference, 'day');
                            }
                        }
                    } else if (!nearestEvent.allDay) {
                        intTimestamp = nearestEvent.start;
                        stringSubheading = formatTime(nearestEvent.start) + ' - ' + formatTime(nearestEvent.end);

                        if (shouldShowTimeUntilEvent) {
                            const timeDifference = getApproximateTimeDifference(timeCurrent.getTime(), nearestEvent.start);
                            let stringTimeRemaining = '';

                            if (timeDifference[0] > 0) {
                                stringTimeRemaining = ' in ' + timeDifference[0] + ' ' + timeDifference[1];
                            } else if (timeDifference[0] < 0) {
                                stringTimeRemaining = ' now';
                            } else {
                                stringTimeRemaining = ' soon';
                            }

                            stringHeading += stringTimeRemaining;
                        }
                    }
                }
            }
        }
    }

    return [intTimestamp, stringHeading, stringSubheading, imgAsset, stringCalendarAppIdentifier, stringCalendarAppIdentifier, true];
}

function updateDefault() {
    const dateToday = new Date();
    let monthText = shouldAbbreviateMonth ? truncateStringToLength(months[dateToday.getMonth()], 3) : months[dateToday.getMonth()];
    let stringHeading = weekdays[dateToday.getDay()] + ', ' + monthText + ' ' + dateToday.getDate();
    let stringSubheading = '';
    let imgAsset = 'none';
    let subHeadingAppIdentifier = '';
    let canShowWeather = true;

    if (shouldShowNowPlaying && dataMusicLatest !== null && dataMusicLatest.isPlaying && !dataMusicLatest.isStopped) {
        subHeadingAppIdentifier = dataMusicLatest.nowPlayingApplication.identifier;

        switch (subHeadingAppIdentifier) {
            case 'com.spotify.client':
                imgAsset = imgSpotifyAsset;
                break;
            case 'com.google.ios.youtube':
                imgAsset = imgYoutubeAsset;
                break;
            case 'com.apple.Music':
                imgAsset = imgMusicAsset;
                break;
            case 'com.google.ios.youtubemusic':
                imgAsset = imgYoutubeMusicAsset;
                break;
            default:
                imgAsset = imgPlayingAsset;
                break;
        }

        if (shouldUseAdaptiveColouredText) {
            imgAsset = (modeStyle != 2) ? changeDarkIcon(imgAsset) : imgAsset;
        } else if (shouldUseDarkText) {
            imgAsset = changeDarkIcon(imgAsset);
        }

        stringSubheading = dataMusicLatest.nowPlaying.artist + ' - ' + dataMusicLatest.nowPlaying.title;

        if (subHeadingAppIdentifier != null && subHeadingAppIdentifier.length > 3 && stringSubheading.length > 3) {
            canShowWeather = false;
        }
    }

    return [-1, stringHeading, stringSubheading, imgAsset, stringCalendarAppIdentifier, subHeadingAppIdentifier, canShowWeather];
}

/********************/
/******* Sets *******/
/********************/

function setHeadingString(stringHeadingIn) {
    setInnerTextForElement('pHeading', stringHeadingIn);
}

function setSubheadingString(stringSubheadingIn, canShowWeather) {
    if (shouldShowWeather && canShowWeather) {
        setDisplayForElement('divSubheadingWeather', 'initial');

        if (stringSubheadingIn.length <= 1) {
            document.getElementById('divSubheadingWeather').style.marginLeft = '-5px';
        } else {
            document.getElementById('divSubheadingWeather').style.marginLeft = '1px';
        }
    } else {
        setDisplayForElement('divSubheadingWeather', 'none');
    }
    
    setInnerTextForElement('pSubheading', stringSubheadingIn);
}

function setSubheadingImage(assetIn) {
    if (assetIn === 'none') {
        setDisplayForElement('imgSubheading', 'none');
    } else {
        document.getElementById('imgSubheading').src = assetIn;
        setDisplayForElement('imgSubheading', 'initial');
    }
}

function setAppToOpen(idForHeadingIn, idForSubheadingIn) {
    stringCurrentAppIdentifierHeading = idForHeadingIn;
    stringCurrentAppIdentifierSubheading = idForSubheadingIn;
}

function setDisplayForElement(elementIn, displayIn) {
    document.getElementById(elementIn).style.display = displayIn;
}

function setInnerTextForElement(elementIn, innerTextIn) {
    document.getElementById(elementIn).innerText = innerTextIn;
}

/*********************/
/******* Utils *******/
/*********************/

function applyConfiguration() {
    intTimeRange = config.intTimeRange;

    shouldAbbreviateMonth = config.shouldAbbreviateMonth;
    shouldAddLeadingZeroToHours = config.shouldAddLeadingZeroToHours;
    shouldShowAllDayEvents = config.shouldShowAllDayEvents;
    shouldShowEvents = config.shouldShowEvents;
    shouldShowNowPlaying = config.shouldShowNowPlaying;
    shouldShowOverdueReminders = config.shouldShowOverdueReminders;
    shouldShowReminders = config.shouldShowReminders;
    shouldShowTimeUntilEvent = config.shouldShowTimeUntilEvent;
    shouldShowWeather = config.shouldShowWeather;
    shouldUse24HourClock = config.shouldUse24HourClock;
    shouldUseDarkText = config.shouldUseDarkText;
    shouldUseAdaptiveColouredText = config.shouldUseAdaptiveColouredText;

    stringCalendarAppIdentifier = config.stringOverrideCalendarAppID;
    stringRemindersAppIdentifier = config.stringOverrideRemindersAppID;
    stringWeatherAppIdentifier = config.stringOverrideWeatherAppID;

    setAppToOpen(stringCalendarAppIdentifier, stringCalendarAppIdentifier);
}

function formatPluralSingular(intNumberIn, stringTextIn) {
    return ((intNumberIn !== 1) ? (stringTextIn + 's') : stringTextIn);
}

function formatTime(dateIn) {
    let theDate = new Date(dateIn);

    let hour = theDate.getHours();
    let min = theDate.getMinutes();

    if (min < 10) {
        min = '0' + min;
    }

    if (!shouldUse24HourClock) {
        if (hour > 12) {
            hour -= 12;
        }
    }

    if (shouldAddLeadingZeroToHours) {
        if (hour < 10) {
            hour = '0' + hour;
        }
    }

    return hour + ':' + min + (shouldUse24HourClock ? '' : (theDate.getHours() >= 12 ? ' pm' : ' am'));
}

function getApproximateTimeDifference(time1In, time2In) {
    if (time2In <= time1In) {
        return [-1, 'now'];
    } else {
        const doubleDaysDifference = (time2In - time1In) / 1000 / 60 / 60 / 24;
        if (doubleDaysDifference < 1) {
            const doubleHoursDifference = (time2In - time1In) / 1000 / 60 / 60;
            if (doubleHoursDifference < 1) {
                const doubleMinsDifference = (time2In - time1In) / 1000 / 60;
                if (doubleMinsDifference < 1) {
                    return [0, 'soon'];
                } else {
                    const roundedDifference = Math.round(doubleMinsDifference);
                    return [roundedDifference, formatPluralSingular(roundedDifference, 'min')];
                }
            } else {
                const roundedDifference = Math.round(doubleHoursDifference);
                return [roundedDifference, formatPluralSingular(roundedDifference, 'hour')];
            }
        } else {
            const roundedDifference = Math.round(doubleDaysDifference);
            return [roundedDifference, formatPluralSingular(roundedDifference, 'day')];
        }
    }
}

function truncateStringToLength(stringIn, intLengthIn) {
    return stringIn.substring(0, intLengthIn);
}

function changeDarkIcon(assetIn) {
    let str = assetIn.split('.');
    return (str[0] + '_dark.' + str[1]);
}

function updateColours(mode) {
    switch (mode) {
        case 2:
            document.body.style.color = "#FFFFFF";
            break;

        default:
            document.body.style.color = "#000000";
            break;
    }
}

function checkSystemDarkMode() {
    api.fs.read('/var/mobile/Library/Preferences/com.apple.uikitservices.userInterfaceStyleMode.plist', 'plist').then((data) => {
        console.log(data);
        modeStyle = data.UserInterfaceStyleMode;
    }).catch((error) => {
        modeStyle = 0;
    });
}