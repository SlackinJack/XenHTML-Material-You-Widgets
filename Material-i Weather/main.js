let stringBackgroundColour;
let stringTextColour;

let stringDarkBackgroundColour;
let stringDarkTextColour;

let stringWeatherAppIdentifier;

let modeStyle;

function onLoad() {
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


function checkSystemDarkMode() {
    api.fs.read('/var/mobile/Library/Preferences/com.apple.uikitservices.userInterfaceStyleMode.plist', 'plist').then((data) => {
        console.log(data);
        modeStyle = data.UserInterfaceStyleMode;
    }).catch((error) => {
        modeStyle = 0;
    });
}