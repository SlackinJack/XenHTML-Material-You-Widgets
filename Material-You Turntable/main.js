let stringBackgroundColour;
let stringPlayButtonColour;
let stringSkipButtonColour;
let stringGlyphColour;
let stringSkipGlyphColour;

let stringDarkBackgroundColour;
let stringDarkPlayButtonColour;
let stringDarkSkipButtonColour;
let stringDarkGlyphColour;
let stringDarkSkipGlyphColour;

let stringFavouriteMediaApplication;

let modeStyle;

function onLoad() {
    applyConfiguration();
    doUpdates();
    setInterval(doUpdates, 1000);

    api.media.observeData(function (dataIn) {
        if (dataIn !== null && !dataIn.isStopped && dataIn.nowPlaying.artwork.length > 1) {
            document.getElementById('imgArtwork').src = dataIn.nowPlaying.artwork;
            stringNowPlayingApplication = dataIn.nowPlayingApplication.identifier;
            toggleVisibilityForElement('svgNoMusic', false);
            toggleVisibilityForElement('divPlayButton', true);
            toggleVisibilityForElement('divSkipButton', true)
            toggleVisibilityForElement('imgArtwork', true);
            toggleVisibilityForElement((dataIn.isPlaying ? 'svgPlay' : 'svgPause'), false);
            toggleVisibilityForElement((dataIn.isPlaying ? 'svgPause' : 'svgPlay'), true);
        } else {
            stringNowPlayingApplication = '';
            toggleVisibilityForElement('divPlayButton', false);
            toggleVisibilityForElement('divSkipButton', false);
            toggleVisibilityForElement('imgArtwork', false);
            toggleVisibilityForElement('svgNoMusic', true);
        }
    });
}

function applyConfiguration() {
    stringBackgroundColour = config.stringBackgroundColour;
    stringPlayButtonColour = config.stringPlayButtonColour;
    stringSkipButtonColour = config.stringSkipButtonColour;
    stringGlyphColour = config.stringGlyphColour;
    stringSkipGlyphColour = config.stringSkipGlyphColour;

    stringDarkBackgroundColour = config.stringDarkBackgroundColour;
    stringDarkPlayButtonColour = config.stringDarkPlayButtonColour;
    stringDarkSkipButtonColour = config.stringDarkSkipButtonColour;
    stringDarkGlyphColour = config.stringDarkGlyphColour;
    stringDarkSkipGlyphColour = config.stringDarkSkipGlyphColour;

    stringFavouriteMediaApplication = config.stringFavouriteMediaApplication;
}

function updateColours(mode) {
    switch (mode) {
        case 2:
            setBackgroundColourForElement('divSkipButton', stringDarkSkipButtonColour);
            setBackgroundColourForElement('divPlayButton', stringDarkPlayButtonColour);
            setBackgroundColourForElement('divBackground', stringDarkBackgroundColour);
            setFillColourForElement('svgSkip', stringDarkSkipGlyphColour);
            setFillColourForElement('svgPlay', stringDarkGlyphColour);
            setFillColourForElement('svgPause', stringDarkGlyphColour);
            setFillColourForElement('svgNoMusic', stringDarkPlayButtonColour);
            break;
        default:
            setBackgroundColourForElement('divSkipButton', stringSkipButtonColour);
            setBackgroundColourForElement('divPlayButton', stringPlayButtonColour);
            setBackgroundColourForElement('divBackground', stringBackgroundColour);
            setFillColourForElement('svgSkip', stringSkipGlyphColour);
            setFillColourForElement('svgPlay', stringGlyphColour);
            setFillColourForElement('svgPause', stringGlyphColour);
            setFillColourForElement('svgNoMusic', stringPlayButtonColour);
            break;
    }
}

function doUpdates() {
    checkSystemDarkMode();
    updateColours(modeStyle);
}

function onBackgroundClick() {
    api.apps.launchApplication(stringFavouriteMediaApplication);
}

function onPlayerClick() {
    api.apps.launchApplication(stringNowPlayingApplication);
}

function onPlayButtonClick() {
    api.media.togglePlayPause();
}

function onSkipButtonClick() {
    api.media.nextTrack();
}

function setBackgroundColourForElement(idIn, colourIn) {
    document.getElementById(idIn).style.background = colourIn;
}

function setFillColourForElement(idIn, colourIn) {
    document.getElementById(idIn).style.fill = colourIn;
}

function checkSystemDarkMode() {
    api.fs.read('/var/mobile/Library/Preferences/com.apple.uikitservices.userInterfaceStyleMode.plist', 'plist').then((data) => {
        console.log(data);
        modeStyle = data.UserInterfaceStyleMode;
    }).catch((error) => {
        modeStyle = 0;
    });
}

function toggleVisibilityForElement(idIn, visibilityIn) {
    if (idIn.startsWith('div')) {
        document.getElementById(idIn).style.display = (visibilityIn ? 'flex' : 'none');
    } else {
        document.getElementById(idIn).style.display = (visibilityIn ? 'initial' : 'none');
    }
}