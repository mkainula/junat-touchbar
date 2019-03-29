const {app, BrowserWindow, TouchBar} = require('electron');
require('es6-promise').polyfill();
require('isomorphic-fetch');

const {TouchBarLabel, TouchBarButton, TouchBarSpacer, TouchBarSlider, TouchBarPopover} = TouchBar;

var trains = []
let currentIndex = 0

const trainTypeLabel = new TouchBarLabel({label: 'Train type', textColor: '#a0aacc'})

const trainNumberLabel = new TouchBarLabel({label: 'Train numberr',textColor: '#ffffff'})

const trainCategoryLabel = new TouchBarLabel({label: 'Train category'})

const firstStationLabel = new TouchBarLabel({label: "First station"})

const lastStationLabel = new TouchBarLabel({label: "Last station"})

const lateLabel = new TouchBarLabel({label: "Late?", textColor: "#FF0000"})

const leftButton = new TouchBarButton({
    label: '<',
    click: () => {
        if(currentIndex != 0) {
            currentIndex--
            updateTrainLabels()
        }
    }
})

const rightButton = new TouchBarButton({
    label: '>',
    click: () => {
        if(currentIndex != trains.length - 1) {
            currentIndex++
            updateTrainLabels()
        }
    }
})

const touchBar = new TouchBar([
    leftButton,
    rightButton,
    new TouchBarSpacer(['small']),
    trainTypeLabel,
    trainNumberLabel,
    trainCategoryLabel,
    new TouchBarSpacer(['small']),
    firstStationLabel,
    lastStationLabel,
    lateLabel
])

const formatDateTime = (datetimeStr) => {
    datetime = new Date(datetimeStr)
    return datetime.toTimeString().split(" ")[0]
}

const updateTrainLabels = () => {
    let lastStopIndex = trains[currentIndex].timeTableRows.length - 1
    let difference = trains[currentIndex].timeTableRows[lastStopIndex].differenceInMinutes
    let differenceStr = difference ? difference.toString() : "0"
    var color = "#FFFFFF"
    if (difference != null && difference < 0) {
        color = "#008000"
    }
    else if (difference == null || (difference != null && difference == 0)) {
        color = "#FFFFFF"
    }
    else {
        color = "#FF0000"
    }
    trainNumberLabel.textColor = '#ffffff'
    trainTypeLabel.label = trains[currentIndex].trainType
    trainNumberLabel.label = trains[currentIndex].trainNumber.toString() + " " + trains[currentIndex].commuterLineID
    trainCategoryLabel.label = trains[currentIndex].trainCategory
    firstStationLabel.label = trains[currentIndex].timeTableRows[0].stationShortCode + " " + formatDateTime(trains[currentIndex].timeTableRows[0].scheduledTime)
    lastStationLabel.label = trains[currentIndex].timeTableRows[lastStopIndex].stationShortCode + " " + formatDateTime(trains[currentIndex].timeTableRows[lastStopIndex].scheduledTime)
    lateLabel.label = differenceStr
    lateLabel.textColor = color
}

const fetchTrains = () => {
    fetch(`https://rata.digitraffic.fi/api/v1/live-trains/station/LPV?arrived_trains=0&arriving_trains=0&departed_trains=0&departing_trains=1&minutes_before_departure=10&minutes_after_departure=10&minutes_before_arrival=10&minutes_after_arrival=10&include_nonstopping=false`)
    .then(response => {
        return response.json();
    })
    .then(json => {
        trains = json
        currentIndex = 0
        updateTrainLabels()
    }).catch(ex => {
        console.log('parsing failed', ex)
    })
}


app.once('ready', () => {
    window = new BrowserWindow({ width: 200, height: 200 });
    fetchTrains();
    window.setTouchBar(touchBar);
})

app.on('window-all-closed', () => {
    app.quit();
});
