console.log('Не забуваєм Легенд (Bars) Желенскі++');
console.log('Starting map initialization...');

let currentLang = 'uk';

function changeLanguage() {
    currentLang = document.getElementById('language').value;
    document.title = translations[currentLang].title;
    updateTexts();
    updateLayerOptions();
    updateMortarOptions();
    updateLanguageOptions();
    updateProjectileSelect();
    showMenuSection(document.querySelector('.menu-nav-item.active').getAttribute('data-section'));
    document.getElementById('distance').placeholder = currentLang === 'ru' ? 'например, 1350' : (currentLang === 'uk' ? 'наприклад, 1350' : 'e.g., 1350');
    document.getElementById('h_mortar').placeholder = currentLang === 'ru' ? 'например, 170' : (currentLang === 'uk' ? 'наприклад, 170' : 'e.g., 170');
    document.getElementById('h_target').placeholder = currentLang === 'ru' ? 'например, 120' : (currentLang === 'uk' ? 'наприклад, 120' : 'e.g., 120');
    document.getElementById('distance-correction').placeholder = currentLang === 'ru' ? 'например, -400' : (currentLang === 'uk' ? 'наприклад, -400' : 'e.g., -400');
}

function toggleHistory() {
    document.getElementById('history-panel').classList.toggle('active')
    document.getElementById('toggleHistoryBtn').classList.toggle('active')
}

function updateTexts() {
    const t = translations[currentLang];
    document.getElementById('nav-setup').textContent = t.navSetup;
    document.getElementById('setup-title').textContent = t.setupTitle;
    document.getElementById('mortar-label').textContent = t.mortarLabel;
    document.getElementById('projectile-label').textContent = t.projectileLabel;
    document.getElementById('correction-label').textContent = t.correctionLabel; // НОВОЕ
    document.getElementById('distance-label').textContent = t.distanceLabel;
    document.getElementById('h_mortar-label').textContent = t.h_mortarLabel;
    document.getElementById('h_target-label').textContent = t.h_targetLabel;
    document.getElementById('calculate-manual-btn').textContent = t.calculateManualBtn;
    document.getElementById('layer-label').textContent = t.layerLabel;
    document.getElementById('grid-toggle-label').textContent = t.gridToggleLabel;
    document.getElementById('language-label').textContent = t.languageLabel;
    document.getElementById('pc-btn').textContent = t.pcBtn;
    document.getElementById('mobile-btn').textContent = t.mobileBtn;
    document.getElementById('mortar-btn-text').textContent = t.mortarBtn;
    document.getElementById('target-btn-text').textContent = t.targetBtn;
    document.getElementById('main-menu-btn').title = t.settingsTitle;
    document.getElementById('credits').textContent = t.credits;
    document.getElementById('nav-device').textContent = t.navDevice;
    document.getElementById('nav-calc').textContent = t.navCalc;
    document.getElementById('nav-info').textContent = t.navInfo;
    document.getElementById('device-title').textContent = t.navDevice;
    document.getElementById('calc-title').textContent = t.navCalc;
    document.getElementById('info-title').textContent = t.navInfo;
    document.getElementById('history-title').textContent = t.historyTitle;
    document.getElementById('info-content').innerHTML = t.infoText;
    document.getElementById('theme-label').innerHTML = t.themeLabel;
    document.getElementById('onmap-history').textContent = t.onMapHistory + t.layerOptions[currentLayer._url.split(".")[1].replace("/assets/images/", "")]
    document.getElementById('toggleMenuLabel').textContent = t.toggleMenuLabel.toUpperCase();
    if (mortarMarker) mortarMarker.bindPopup(t.mortarPopup);
    if (targetMarker) targetMarker.bindPopup(t.targetPopup);
}

function updateLayerOptions() {
    const t = translations[currentLang];
    const select = document.getElementById('layer');
    select.options[0].text = t.layerOptions.udachne;
    select.options[1].text = t.layerOptions.sergeevka;
    select.options[2].text = t.layerOptions.satellite;
}

function updateThemeOptions() {
    const t = translations[currentLang];
    const select = document.getElementById('theme');
    select.options[0].text = t.themes.darkgreen;
    select.options[1].text = t.themes.lightgreen;
    select.options[2].text = t.themes.darkred;
    select.options[3].text = t.themes.lightred;
}

function updateMortarOptions() {
    const t = translations[currentLang];
    const select = document.getElementById('mortar');
    select.options[0].text = t.mortarOptions.ua;
    select.options[1].text = t.mortarOptions.ru;
    select.options[2].text = t.mortarOptions.grad;
}

function updateProjectileSelect() {
    const mortarType = document.getElementById('mortar').value;
    const projectileGroup = document.getElementById('projectile-form-group');
    const projectileSelect = document.getElementById('projectile');
    const t = translations[currentLang];

    if (mortarType === 'grad') {
        projectileGroup.style.display = 'block';
        projectileSelect.innerHTML = ''; 

        for (const key in t.projectileOptions) {
            const option = document.createElement('option');
            option.value = key;
            option.text = t.projectileOptions[key];
            projectileSelect.appendChild(option);
        }
    } else {
        projectileGroup.style.display = 'none'; 
        projectileSelect.innerHTML = '';
    }
}


function updateLanguageOptions() {
    const t = translations[currentLang];
    const select = document.getElementById('language');
    select.options[0].text = t.languageOptions.ru;
    select.options[1].text = t.languageOptions.uk;
    select.options[2].text = t.languageOptions.en;
}

function closeResult() {
    document.getElementById('result-panel').classList.remove('active');
}

if (localStorage.getItem("mortar-calc-theme") != null) {
    document.body.setAttribute('theme', localStorage.getItem("mortar-calc-theme"));
}

document.querySelector("select#theme").addEventListener("change", e => {
    const selectedTheme = e.target.value;
    document.body.setAttribute('theme', selectedTheme);
    localStorage.setItem("mortar-calc-theme", selectedTheme)
})

let mapWidth = 10240;
let mapHeight = 5120;
let map;
try {
    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 2,
        zoom: -1,
        center: [mapHeight / 2, mapWidth / 2],
        maxBounds: [[0, 0], [mapHeight, mapWidth]],
        maxBoundsViscosity: 1.0
    });
    console.log('Map initialized successfully');
} catch (error) {
    console.error('Error initializing map:', error);
}

const udachneBounds = [[0, 0], [5120, 10240]];
let udachneLayer;
try {
    udachneLayer = L.imageOverlay('./assets/images/udachne.png', udachneBounds).addTo(map);
    console.log('Udachne layer added');
} catch (error) {
    console.error('Error loading udachne layer:', error);
}

const donairBounds = [[0, 0], [4352, 4352]];
const sergeevkaBounds = [[0, 0], [10240, 10240]];

let sergeevkaLayer, donAirLayer;
try {
    sergeevkaLayer = L.imageOverlay('./assets/images/sergeevka.png', sergeevkaBounds);
    donAirLayer = L.imageOverlay('./assets/images/DonAirConflict.png', donairBounds);
    console.log('Other layers initialized');
} catch (error) {
    console.error('Error initializing other layers:', error);
}

let currentLayer = udachneLayer;
let gridLayer = L.layerGroup().addTo(map);
let minorGridLayer = L.layerGroup();
let isGridEnabled = true;

function toggleGrid() {
    isGridEnabled = document.getElementById('grid-toggle').checked;
    if (isGridEnabled) {
        gridLayer.addTo(map);
        if (map.getZoom() >= 0) minorGridLayer.addTo(map);
    } else {
        map.removeLayer(gridLayer);
        map.removeLayer(minorGridLayer);
    }
    console.log('Grid toggled:', isGridEnabled);
}

function drawGrid() {
    gridLayer.clearLayers();
    minorGridLayer.clearLayers();

    if (!isGridEnabled) return;

    const majorStep = 1000;
    const minorStep = 100;
    const zoom = map.getZoom();

    let width = mapWidth;
    let height = mapHeight;

    for (let x = 0; x <= width; x += majorStep) {
        gridLayer.addLayer(L.polyline([[0, x], [height, x]], { className: 'grid-line' }));
    }
    for (let y = 0; y <= height; y += majorStep) {
        gridLayer.addLayer(L.polyline([[y, 0], [y, width]], { className: 'grid-line' }));
    }

    if (zoom >= 0) {
        minorGridLayer.addTo(map);
        for (let x = 0; x <= width; x += minorStep) {
            if (x % majorStep !== 0) {
                minorGridLayer.addLayer(L.polyline([[0, x], [height, x]], { className: 'grid-line-minor' }));
            }
        }
        for (let y = 0; y <= height; y += minorStep) {
            if (y % majorStep !== 0) {
                minorGridLayer.addLayer(L.polyline([[y, 0], [y, width]], { className: 'grid-line-minor' }));
            }
        }
    } else {
        map.removeLayer(minorGridLayer);
    }
}

map.on('zoomend', drawGrid);

let tempguid = {}

function changeLayer() {
    const layer = document.getElementById('layer').value;
    map.removeLayer(currentLayer);

    if (layer === 'udachne') {
        mapWidth = 10240;
        mapHeight = 5120;
        currentLayer = udachneLayer;
        map.setView([mapHeight / 2, mapWidth / 2], -1);
        map.options.crs = L.CRS.Simple;
        map.setMaxBounds(udachneBounds);
        showNotification(translations[currentLang].layerOptions.udachne + ' загружена');
    } else if (layer === 'sergeevka') {
        mapHeight = 10240;
        mapWidth = 10240;
        currentLayer = sergeevkaLayer;
        map.setView([mapHeight / 2, mapWidth / 2], -1);
        map.options.crs = L.CRS.Simple;
        map.setMaxBounds(sergeevkaBounds);
        showNotification(translations[currentLang].layerOptions.sergeevka + ' загружена');
    } else if (layer === 'satellite') {
        mapHeight = 4352;
        mapWidth = 4352;
        currentLayer = donAirLayer;
        map.setView([mapHeight / 2, mapWidth / 2], -1);
        map.options.crs = L.CRS.Simple;
        map.setMaxBounds(donairBounds);
        showNotification(translations[currentLang].layerOptions.satellite + ' загружена');
    }

    try {
        map.addLayer(currentLayer);
        console.log('Layer changed to:', layer);
    } catch (error) {
        console.error('Error adding layer:', error);
    }
    drawGrid();

    if (mortarMarker) {
        map.removeLayer(mortarMarker);
        mortarMarker = null;
    }
    if (targetMarker) {
        map.removeLayer(targetMarker);
        targetMarker = null;
    }
    document.getElementById('result-panel').classList.remove('active');
    loadHistoryItems();
    updateTexts();
    tempguid = {}
}

let mortarMarker = null;
let targetMarker = null;

const uaMortarData = [
    [400, 1531, null], [500, 1514, null], [600, 1496, null], [700, 1478, null], [800, 1460, null], [900, 1442, null],
    [1000, 1424, null], [1100, 1405, null], [1200, 1385, null], [1300, 1366, null], [1400, 1346, null], [1500, 1326, null],
    [1600, 1305, null], [1700, 1283, null], [1800, 1261, null], [1900, 1238, null], [2000, 1214, null], [2100, 1188, null],
    [2200, 1162, null], [2300, 1134, null], [2400, 1104, null], [2500, 1070, null], [2600, 1034, null], [2700, 993, null],
    [2800, 942, null], [2900, 870, null]
];

const ruMortarData = [
    [400, 1418, null], [500, 1398, null], [600, 1376, null], [700, 1355, null], [800, 1333, null], [900, 1311, null],
    [1000, 1288, null], [1100, 1264, null], [1200, 1240, null], [1300, 1215, null], [1400, 1189, null], [1500, 1161, null],
    [1600, 1133, null], [1700, 1102, null], [1800, 1069, null], [1900, 1034, null], [2000, 995, null], [2100, 950, null],
    [2200, 896, null], [2300, 820, null]
];

const grad_9m22_of_bt_data = [
    [1600, 150, 7.2], [1800, 169, 8.1], [2000, 188, 9.0], [2200, 208, 9.9], [2400, 227, 10.9],
    [2600, 248, 11.9], [2800, 268, 12.8], [3000, 290, 13.8], [3200, 312, 14.9], [3400, 335, 15.9],
    [3600, 359, 17.0], [3800, 384, 18.1], [4000, 410, 19.3], [4200, 439, 20.6], [4400, 470, 22.0],
    [4600, 504, 23.4], [4800, 543, 25.0], [5000, 591, 27.0], [5200, 660, 29.7]
];
const grad_9m28k_data = [
    [3800, 150, 10.8], [4000, 157, 11.4], [4200, 164, 12.0], [4400, 172, 12.6], [4600, 179, 13.2],
    [4800, 187, 13.7], [5000, 194, 14.3], [5200, 202, 14.9], [5400, 209, 15.5], [5600, 217, 16.1],
    [5800, 225, 16.7], [6000, 233, 17.3], [6200, 241, 17.8], [6400, 249, 18.5], [6600, 257, 19.0],
    [6800, 265, 19.7], [7000, 273, 20.3], [7200, 281, 20.9], [7400, 290, 21.6], [7600, 298, 22.2],
    [7800, 307, 22.8], [8000, 316, 23.5], [8200, 324, 24.1], [8400, 334, 24.8], [8600, 343, 25.5],
    [8800, 352, 26.2], [9000, 362, 26.9], [9200, 371, 27.6], [9400, 381, 28.3], [9600, 391, 29.1]
];
const grad_3m16_data = [
    [3800, 147, 10.8], [4000, 154, 11.3], [4200, 161, 11.9], [4400, 169, 12.4], [4600, 176, 13.0],
    [4800, 183, 13.6], [5000, 190, 14.1], [5200, 198, 14.7], [5400, 205, 15.3], [5600, 213, 15.9],
    [5800, 220, 16.5], [6000, 228, 17.0], [6200, 236, 17.7], [6400, 243, 18.3], [6600, 251, 18.9],
    [6800, 259, 19.5], [7000, 267, 20.1], [7200, 275, 20.7], [7400, 283, 21.3], [7600, 292, 21.9],
    [7800, 300, 22.6], [8000, 309, 23.2], [8200, 317, 23.9], [8400, 326, 24.5], [8600, 335, 25.2],
    [8800, 344, 25.8], [9000, 353, 26.5], [9200, 362, 27.2], [9400, 372, 27.9], [9600, 382, 28.6]
];
const grad_9m43_smoke_data = [
    [4600, 144, 11.7], [4800, 150, 12.2], [5000, 156, 12.7], [5200, 162, 13.2], [5400, 168, 13.7],
    [5600, 173, 14.2], [5800, 179, 14.7], [6000, 185, 15.2], [6200, 191, 15.8], [6400, 197, 16.3],
    [6600, 203, 16.8], [6800, 209, 17.3], [7000, 215, 17.8], [7200, 221, 18.4], [7400, 227, 18.9],
    [7600, 234, 19.4], [7800, 240, 19.9], [8000, 246, 20.5], [8200, 252, 21.0], [8400, 259, 21.6],
    [8600, 265, 22.1], [8800, 272, 22.7], [9000, 278, 23.2], [9200, 285, 23.8], [9400, 291, 24.4],
    [9600, 298, 24.9], [9800, 305, 25.5], [10000, 312, 26.1], [10200, 319, 26.7], [10400, 326, 27.2],
    [10600, 333, 27.8]
];
const grad_9m28k_bt_data = [
    [1400, 147, 6.7], [1600, 169, 7.6], [1800, 191, 8.6], [2000, 213, 9.6], [2200, 236, 10.7],
    [2400, 260, 11.7], [2600, 284, 12.8], [2800, 309, 13.9], [3000, 336, 15.0], [3200, 363, 16.2],
    [3400, 392, 17.4], [3600, 424, 18.7], [3800, 458, 20.1], [4000, 496, 21.6], [4200, 540, 23.3],
    [4400, 596, 25.5], [4600, 689, 28.8]
];
const grad_9m22_of_data = [
    [4600, 144, 11.7], [4800, 150, 12.2], [5000, 156, 12.7], [5200, 162, 13.2], [5400, 168, 13.7],
    [5600, 173, 14.2], [5800, 179, 14.7], [6000, 185, 15.2], [6200, 191, 15.8], [6400, 197, 16.3],
    [6600, 203, 16.8], [6800, 209, 17.3], [7000, 215, 17.8], [7200, 221, 18.4], [7400, 227, 18.9],
    [7600, 234, 19.4], [7800, 240, 19.9], [8000, 246, 20.5], [8200, 252, 21.0], [8400, 259, 21.6],
    [8600, 265, 22.1], [8800, 272, 22.7], [9000, 278, 23.2], [9200, 285, 23.8], [9400, 291, 24.4],
    [9600, 298, 24.9], [9800, 305, 25.5], [10000, 312, 26.1], [10200, 319, 26.7], [10400, 326, 27.2],
    [10600, 333, 27.8]
];
const grad_3m16_mt_data = [
    [2000, 142, 7.8], [2200, 156, 8.5], [2400, 170, 9.3], [2600, 184, 10.1], [2800, 198, 10.9],
    [3000, 212, 11.7], [3200, 227, 12.5], [3400, 242, 13.3], [3600, 257, 14.2], [3800, 272, 15.0],
    [4000, 288, 15.9], [4200, 304, 16.7], [4400, 320, 17.6], [4600, 337, 18.5], [4800, 354, 19.5],
    [5000, 372, 20.5], [5200, 391, 21.4], [5400, 411, 22.4], [5600, 431, 23.5], [5800, 453, 24.7],
    [6000, 476, 25.8], [6200, 502, 27.1], [6400, 529, 28.4], [6600, 561, 30.0], [6800, 598, 31.7],
    [7000, 647, 33.9]
];
const grad_9m22_of_mt_data = [
    [2400, 151, 8.7], [2600, 163, 9.4], [2800, 175, 10.2], [3000, 187, 10.9], [3200, 200, 11.7],
    [3400, 212, 12.4], [3600, 225, 13.2], [3800, 238, 14.0], [4000, 251, 14.7], [4200, 264, 15.5],
    [4400, 278, 16.3], [4600, 291, 17.1], [4800, 305, 17.9], [5000, 320, 18.7], [5200, 334, 19.6],
    [5400, 349, 20.5], [5600, 365, 21.3], [5800, 381, 22.3], [6000, 398, 23.2], [6200, 415, 24.2],
    [6400, 433, 25.2], [6600, 452, 26.2], [6800, 472, 27.3], [7000, 493, 28.4], [7200, 517, 29.7],
    [7400, 542, 31.0], [7600, 571, 32.5], [7800, 605, 34.2], [8000, 649, 36.3]
];
const grad_3m16_bt_data = [
    [1400, 147, 6.6], [1600, 168, 7.6], [1800, 190, 8.6], [2000, 213, 9.6], [2200, 236, 10.6],
    [2400, 259, 11.7], [2600, 283, 12.7], [2800, 308, 13.8], [3000, 334, 15.0], [3200, 362, 16.2],
    [3400, 391, 17.4], [3600, 422, 18.6], [3800, 456, 20.1], [4000, 494, 21.6], [4200, 537, 23.3],
    [4400, 592, 25.4], [4600, 679, 28.5]
];
const grad_9m28k_mt_data = [
    [2000, 144, 7.8], [2200, 158, 8.6], [2400, 172, 9.3], [2600, 186, 10.2], [2800, 200, 10.9],
    [3000, 215, 11.7], [3200, 229, 12.6], [3400, 244, 13.4], [3600, 260, 14.3], [3800, 275, 15.1],
    [4000, 291, 15.9], [4200, 307, 16.8], [4400, 324, 17.7], [4600, 341, 18.7], [4800, 359, 19.6],
    [5000, 378, 20.6], [5200, 397, 21.6], [5400, 417, 22.6], [5600, 438, 23.8], [5800, 460, 24.8],
    [6000, 484, 26.1], [6200, 511, 27.4], [6400, 540, 28.8], [6600, 573, 30.4], [6800, 614, 32.3],
    [7000, 674, 34.9]
];

function interpolate(data, dist) {
    if (dist < data[0][0] || dist > data[data.length - 1][0]) {
        return { elevation: null, time: null };
    }
    for (let i = 0; i < data.length - 1; i++) {
        if (dist >= data[i][0] && dist <= data[i + 1][0]) {
            const ratio = (dist - data[i][0]) / (data[i + 1][0] - data[i][0]);
            
            const elev = data[i][1] + (data[i + 1][1] - data[i][1]) * ratio;
            
            let time = null;
            if (data[i].length > 2 && data[i][2] !== null && data[i + 1][2] !== null) {
                time = data[i][2] + (data[i + 1][2] - data[i][2]) * ratio;
            }
            
            return { elevation: elev, time: time };
        }
    }
    return { elevation: null, time: null };
}

let guidances = {
    udachne: [],
    sergeevka: [],
    DonAirConflict: []
}

function saveToHistory() {
    if (mortarMarker == null || targetMarker == null) {
        return showNotification(translations[currentLang].saveToHistoryFailed)
    }
    guidances[currentLayer._url.split(".")[1].replace("/assets/images/", "")].push({
        ...tempguid,
        name: 'New points'
    })

    localStorage.setItem("mortar-calc", JSON.stringify(guidances))
    loadHistoryItems();
}

function deleteHistoryItem(i) {
    var gd = guidances[currentLayer._url.split(".")[1].replace("/assets/images/", "")]
    i = i.parentNode;
    i.outerHTML = '';
    var guid = JSON.parse(i.getAttribute("guid"));
    gd.splice(gd.indexOf(guid), 1)
    localStorage.setItem("mortar-calc", JSON.stringify(guidances))
}

function renameHistoryItem(i) {
    var guid = JSON.parse(i.parentNode.getAttribute("guid"))
    i.outerHTML = `<input onfocusout="runRenameHistoryItemFocus(this)" onkeydown="runRenameHistoryItem(event)" class="history-text" id="name" value="${guid.name}">`
}

function runRenameHistoryItem(event) {
    event = event || window.event;
    var key = event.key || event.keyCode;
    if (key === 'Enter' || key === 13) {
        var inputEl = event.target || event.srcElement;
        var parent = inputEl.parentNode;
        var gd = guidances[currentLayer._url.split(".")[1].replace("/assets/images/", "")];
        var guid = JSON.parse(parent.getAttribute("guid"));
        const idx = gd.findIndex(item => JSON.stringify(item) === JSON.stringify(guid));
        if (idx !== -1) {
            gd[idx].name = inputEl.value;
        }
        localStorage.setItem("mortar-calc", JSON.stringify(guidances))
        loadHistoryItems()
    }
}

function runRenameHistoryItemFocus(i) {
    var gd = guidances[currentLayer._url.split(".")[1].replace("/assets/images/", "")];
    var guid = JSON.parse(i.parentNode.getAttribute("guid"));
    const idx = gd.findIndex(item => JSON.stringify(item) === JSON.stringify(guid));
    if (idx !== -1) {
        gd[idx].name = i.value;
    }
    localStorage.setItem("mortar-calc", JSON.stringify(guidances))
    loadHistoryItems()
}

function loadHistoryItems() {
    if (localStorage.getItem("mortar-calc") != null) {
        guidances = JSON.parse(localStorage.getItem("mortar-calc"))
    }

    document.getElementById('history-list').innerHTML = "";
    guidances[currentLayer._url.split(".")[1].replace("/assets/images/", "")].forEach(m => {
        document.getElementById('history-list').innerHTML += `
        <div class="history-item" guid='${JSON.stringify(m)}'>
                <a href="javascript:void(0)" ondblclick="renameHistoryItem(this)" onclick="loadPointsFrom(this)" class="history-text">${m.name}</a>
                <button class="military-btn" onclick="deleteHistoryItem(this)"><i class="fa fa-close"></i></button>
            </div>
            `
    })
}
loadHistoryItems();

function loadPointsFrom(i) {
    i = i.parentNode;
    var obj = JSON.parse(i.getAttribute("guid"));
    if (targetMarker) map.removeLayer(targetMarker);
    if (mortarMarker) map.removeLayer(mortarMarker);

    targetMarker = L.marker({ lat: obj.pointTarget[0], lng: obj.pointTarget[1] }, { draggable: true, icon: L.divIcon({ className: 'target-icon', html: '<div style="background:blue;width:10px;height:10px;border-radius:50%;"></div>' }) }).addTo(map);
    mortarMarker = L.marker({ lat: obj.pointMortar[0], lng: obj.pointMortar[1] }, { draggable: true, icon: L.divIcon({ className: 'mortar-icon', html: '<div style="background:red;width:10px;height:10px;border-radius:50%;"></div>' }) }).addTo(map);
    targetMarker.bindPopup(translations[currentLang].targetPopup).openPopup();
    calculateFromMap();
}

map.on('contextmenu', (e) => {
    if (deviceMode !== 'pc') return;
    if (mortarMarker) map.removeLayer(mortarMarker);
    mortarMarker = L.marker(e.latlng, { draggable: true, icon: L.divIcon({ className: 'mortar-icon', html: '<div style="background:red;width:10px;height:10px;border-radius:50%;"></div>' }) }).addTo(map);
    tempguid.pointMortar = [e.latlng.lat, e.latlng.lng];
    mortarMarker.bindPopup(translations[currentLang].mortarPopup).openPopup();
    mortarMarker.on('dragend', calculateFromMap);
    calculateFromMap();
});

map.on('click', (e) => {
    if (deviceMode !== 'pc') return;
    if (targetMarker) map.removeLayer(targetMarker);
    tempguid.pointTarget = [e.latlng.lat, e.latlng.lng];
    targetMarker = L.marker(e.latlng, { draggable: true, icon: L.divIcon({ className: 'target-icon', html: '<div style="background:blue;width:10px;height:10px;border-radius:50%;"></div>' }) }).addTo(map);
    targetMarker.bindPopup(translations[currentLang].targetPopup).openPopup();
    targetMarker.on('dragend', calculateFromMap);
    calculateFromMap();
});

// ОБНОВЛЕНО: Полностью переписана логика выбора данных и отображения результата
function calculateFromMap() {
    if (!mortarMarker || !targetMarker) return;
    
    const t = translations[currentLang];
    const mortarPos = mortarMarker.getLatLng();
    const targetPos = targetMarker.getLatLng();
    
    let dx = targetPos.lng - mortarPos.lng;
    let dy = targetPos.lat - mortarPos.lat;
    let dist = Math.sqrt(dx * dx + dy * dy);
    
    const azRad = Math.atan2(dx, dy);
    let azDeg = (azRad * 180 / Math.PI + 360) % 360;
    
    const mortarType = document.getElementById('mortar').value;
    let data, azMils, azUaMils, azRuMils;

    // Логика выбора данных
    if (mortarType === 'ua') {
        data = uaMortarData;
        azUaMils = (azDeg / 360) * 6400;
        azMils = azUaMils.toFixed(0);
    } else if (mortarType === 'ru') {
        data = ruMortarData;
        azRuMils = (azDeg / 360) * 6000;
        azMils = azRuMils.toFixed(0);
    } else if (mortarType === 'grad') {
        const projectileType = document.getElementById('projectile').value;
        switch (projectileType) {
            case '9m22_of': data = grad_9m22_of_data; break;
            case '9m22_of_bt': data = grad_9m22_of_bt_data; break;
            case '9m22_of_mt': data = grad_9m22_of_mt_data; break;
            case '9m28k': data = grad_9m28k_data; break;
            case '9m28k_bt': data = grad_9m28k_bt_data; break;
            case '9m28k_mt': data = grad_9m28k_mt_data; break;
            case '3m16': data = grad_3m16_data; break;
            case '3m16_bt': data = grad_3m16_bt_data; break;
            case '3m16_mt': data = grad_3m16_mt_data; break;
            case '9m43_smoke': data = grad_9m43_smoke_data; break;
            default: data = grad_9m22_of_data;
        }
        azRuMils = (azDeg / 360) * 6000;
        azMils = azRuMils.toFixed(0);
    } else {
        data = uaMortarData;
        azUaMils = (azDeg / 360) * 6400;
        azMils = azUaMils.toFixed(0);
    }

    // *** НОВАЯ ЛОГИКА РАСЧЕТА ДИСТАНЦИИ ***

    // 1. Получаем все значения
    const h_mortar = parseFloat(document.getElementById('h_mortar').value) || 0;
    const h_target = parseFloat(document.getElementById('h_target').value) || 0;
    const correction = parseFloat(document.getElementById('distance-correction').value) || 0;

    // 2. Считаем поправку на высоту
    const deltaH = h_target - h_mortar;
    const heightCorrection = Math.abs(deltaH) < 25 ? 0 : deltaH / 2;
    const adjustedDist = dist + (deltaH >= 0 ? heightCorrection : -heightCorrection);

    // 3. Применяем ручную коррекцию (НОВОЕ)
    const correctedDist = adjustedDist + correction;

    // 4. Ищем угол и время по ФИНАЛЬНОЙ дистанции
    const calcResult = interpolate(data, correctedDist);
    const elev = calcResult.elevation;
    const time = calcResult.time;

    // *** НОВАЯ ЛОГИКА ОТОБРАЖЕНИЯ РЕЗУЛЬТАТА ***

    let elevText = elev !== null ? `${elev.toFixed(1)} mils` : t.outOfRange;
    let timeText = (time !== null && time > 0) ? `<br>${t.flightTimeText}${time.toFixed(1)} ${t.flightTimeSeconds}` : '';
    
    // Всегда показываем "сырую" дистанцию по карте
    let resultText = `
        ${t.rangeText}${dist.toFixed(0)} м<br>
    `;

    // Показываем "Расчетную" дистанцию, ТОЛЬКО если она отличается от "сырой"
    if (correctedDist.toFixed(0) !== dist.toFixed(0)) {
        resultText += `${t.calcDistanceText}${correctedDist.toFixed(0)} м<br>`;
    }

    // Добавляем азимут и угол
    resultText += `
        ${t.azimuthText}${azDeg.toFixed(1)}° (${azMils} mils)<br>
        ${t.elevationText}${elevText}
        ${timeText}
    `;
    
    document.getElementById('result').innerHTML = resultText;
    document.getElementById('result-panel').classList.add('active');
}

// ОБНОВЛЕНО: Логика выбора данных и отображения результата
function calculateManual() {
    const dist = parseFloat(document.getElementById('distance').value);
    if (isNaN(dist)) return;

    const t = translations[currentLang];
    const mortarType = document.getElementById('mortar').value;
    let data;

    // Логика выбора данных
    if (mortarType === 'ua') {
        data = uaMortarData;
    } else if (mortarType === 'ru') {
        data = ruMortarData;
    } else if (mortarType === 'grad') {
        const projectileType = document.getElementById('projectile').value;
        switch (projectileType) {
            case '9m22_of': data = grad_9m22_of_data; break;
            case '9m22_of_bt': data = grad_9m22_of_bt_data; break;
            case '9m22_of_mt': data = grad_9m22_of_mt_data; break;
            case '9m28k': data = grad_9m28k_data; break;
            case '9m28k_bt': data = grad_9m28k_bt_data; break;
            case '9m28k_mt': data = grad_9m28k_mt_data; break;
            case '3m16': data = grad_3m16_data; break;
            case '3m16_bt': data = grad_3m16_bt_data; break;
            case '3m16_mt': data = grad_3m16_mt_data; break;
            case '9m43_smoke': data = grad_9m43_smoke_data; break;
            default: data = grad_9m22_of_data;
        }
    } else {
        data = uaMortarData;
    }

    // *** НОВАЯ ЛОГИКА РАСЧЕТА ДИСТАНЦИИ ***

    // 1. Получаем все значения
    const h_mortar = parseFloat(document.getElementById('h_mortar').value) || 0;
    const h_target = parseFloat(document.getElementById('h_target').value) || 0;
    const correction = parseFloat(document.getElementById('distance-correction').value) || 0;

    // 2. Считаем поправку на высоту
    const deltaH = h_target - h_mortar;
    const heightCorrection = Math.abs(deltaH) < 25 ? 0 : deltaH / 2;
    const adjustedDist = dist + (deltaH >= 0 ? heightCorrection : -heightCorrection);

    // 3. Применяем ручную коррекцию (НОВОЕ)
    const correctedDist = adjustedDist + correction;

    // 4. Ищем угол и время по ФИНАЛЬНОЙ дистанции
    const calcResult = interpolate(data, correctedDist);
    const elev = calcResult.elevation;
    const time = calcResult.time;

    // *** НОВАЯ ЛОГИКА ОТОБРАЖЕНИЯ РЕЗУЛЬТАТА ***

    let elevText = elev !== null ? `${elev.toFixed(1)} mils` : t.outOfRange;
    let timeText = (time !== null && time > 0) ? `<br>${t.flightTimeText}${time.toFixed(1)} ${t.flightTimeSeconds}` : '';

    // Всегда показываем "сырую" дистанцию
    let resultText = `
        ${t.manualRange}${dist.toFixed(0)} м<br>
    `;
    
    // Показываем "Расчетную" дистанцию, ТОЛЬКО если она отличается от "сырой"
    if (correctedDist.toFixed(0) !== dist.toFixed(0)) {
        resultText += `${t.calcDistanceText}${correctedDist.toFixed(0)} м<br>`;
    }

    // Добавляем угол
    resultText += `
        ${t.elevationText}${elevText}
        ${timeText}
    `;

    document.getElementById('result').innerHTML = resultText;
    document.getElementById('result-panel').classList.add('active');
}

function clearMap() {
    if (mortarMarker) map.removeLayer(mortarMarker);
    if (targetMarker) map.removeLayer(targetMarker);
    mortarMarker = null;
    targetMarker = null;
    document.getElementById('result').innerText = '';
    document.getElementById('result-panel').classList.remove('active');
}

// Функции главного меню
function toggleMainMenu() {
    console.log('Toggling main menu...');
    const modal = document.getElementById('main-modal');
    if (!modal.classList.contains('active')) {
        modal.setAttribute("style", "display: flex;")
        setTimeout(() => {
            modal.classList.add('active');
        }, 100)
    } else {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.setAttribute("style", "display: none;")
        }, 100)
    }

    console.log('Menu state:', modal.classList.contains('active') ? 'open' : 'closed');
}

function showMenuSection(sectionId) {
    console.log('Showing menu section:', sectionId);
    // Скрываем все разделы
    const sections = document.querySelectorAll('.menu-section');
    sections.forEach(section => section.classList.remove('active'));

    // Убираем активный класс со всех навигационных элементов
    const navItems = document.querySelectorAll('.menu-nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // Показываем выбранный раздел
    document.getElementById(sectionId).classList.add('active');

    // Добавляем активный класс к соответствующему навигационному элементу
    const clickedNav = document.querySelector(`[data-section="${sectionId}"]`);
    if (clickedNav) clickedNav.classList.add('active');
}

// Закрытие модального окна при клике вне его
document.getElementById('main-modal').addEventListener('click', (e) => {
    if (e.target.id === 'main-modal') {
        toggleMainMenu();
    }
});

let deviceMode = 'pc';
let activeMode = null;

function setDevice(mode) {
    deviceMode = mode;
    // Закрываем главное меню
    toggleMainMenu();

    if (mode === 'mobile') {
        document.getElementById('mobile-buttons').classList.add('active');
        map.off('contextmenu');
        map.off('click');
        map.on('click', handleMobileClick);

        // Показываем уведомление
        showNotification(translations[currentLang].deviceBtnTitle + ': ' + translations[currentLang].mobileBtn);
    } else {
        document.getElementById('mobile-buttons').classList.remove('active');
        map.off('click');
        map.on('contextmenu', (e) => {
            if (mortarMarker) map.removeLayer(mortarMarker);
            mortarMarker = L.marker(e.latlng, { draggable: true, icon: L.divIcon({ className: 'mortar-icon', html: '<div style="background:red;width:10px;height:10px;border-radius:50%;"></div>' }) }).addTo(map);
            mortarMarker.bindPopup(translations[currentLang].mortarPopup).openPopup();
            mortarMarker.on('dragend', calculateFromMap);
            calculateFromMap();
        });
        map.on('click', (e) => {
            if (targetMarker) map.removeLayer(targetMarker);
            targetMarker = L.marker(e.latlng, { draggable: true, icon: L.divIcon({ className: 'target-icon', html: '<div style="background:blue;width:10px;height:10px;border-radius:50%;"></div>' }) }).addTo(map);
            targetMarker.bindPopup(translations[currentLang].targetPopup).openPopup();
            targetMarker.on('dragend', calculateFromMap);
            calculateFromMap();
        });

        // Показываем уведомление
        showNotification(translations[currentLang].deviceBtnTitle + ': ' : ' + translations[currentLang].pcBtn);
    }
}

// Функция уведомлений
function showNotification(text) {
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 50%;
                    transform: translateX(50%);
                    background: linear-gradient(135deg, #2f855a, #38a169);
                    color: #e2e8f0;
                    padding: 15px 25px;
                    border-radius: 8px;
                    box-shadow: 0 4px 15px rgba(47, 133, 90, 0.4);
                    z-index: 3000;
                    font-weight: bold;
                    opacity: 0;
                    transition: all 0.3s ease;
                    pointer-events: none;
                `;
        document.body.appendChild(notification);
    }

    notification.textContent = text;
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(50%) translateY(0)';

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(50%) translateY(-20px)';
    }, 3000);
}

function toggleMobileButtons() {
    const mobileButtons = document.getElementById('mobile-buttons');
    mobileButtons.classList.remove('active');
    activeMode = null;
    document.getElementById('mortar-btn').classList.remove('active');
    document.getElementById('target-btn').classList.remove('active');
}

function activateMode(mode) {
    activeMode = mode;
    if (mode === 'mortar') {
        document.getElementById('mortar-btn').classList.add('active');
        document.getElementById('target-btn').classList.remove('active');
    } else if (mode === 'target') {
        document.getElementById('target-btn').classList.add('active');
        document.getElementById('mortar-btn').classList.remove('active');
    }
}

function handleMobileClick(e) {
    const t = translations[currentLang];
    if (activeMode === 'mortar') {
        if (mortarMarker) map.removeLayer(mortarMarker);
        mortarMarker = L.marker(e.latlng, { draggable: true, icon: L.divIcon({ className: 'mortar-icon', html: '<div style="background:red;width:10px;height:10px;border-radius:50%;"></div>' }) }).addTo(map);
        mortarMarker.bindPopup(t.mortarPopup).openPopup();
        mortarMarker.on('dragend', calculateFromMap);
        calculateFromMap();
        activeMode = null;
        document.getElementById('mortar-btn').classList.remove('active');
    } else if (activeMode === 'target') {
        if (targetMarker) map.removeLayer(targetMarker);
        targetMarker = L.marker(e.latlng, { draggable: true, icon: L.divIcon({ className: 'target-icon', html: '<div style="background:blue;width:10px;height:10px;border-radius:50%;"></div>' }) }).addTo(map);
        targetMarker.bindPopup(t.targetPopup).openPopup();
        targetMarker.on('dragend', calculateFromMap);
        calculateFromMap();
        activeMode = null;
        document.getElementById('target-btn').classList.remove('active');
    }
}

try {
    map.fitBounds(udachneBounds);
    console.log('Map fit to bounds');
} catch (error) {
    console.error('Error fitting map bounds:', error);
}

document.getElementById('mortar').addEventListener('change', updateProjectileSelect);

updateTexts();
updateLayerOptions();
updateMortarOptions();
updateThemeOptions();
updateLanguageOptions();
updateProjectileSelect(); 
drawGrid();
