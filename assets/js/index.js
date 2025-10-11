console.log('Starting map initialization...');

let currentLang = 'uk';

function changeLanguage() {
    currentLang = document.getElementById('language').value;
    document.title = translations[currentLang].title;
    updateTexts();
    updateLayerOptions();
    updateMortarOptions();
    updateLanguageOptions();
    showMenuSection(document.querySelector('.menu-nav-item.active').getAttribute('data-section'));
    document.getElementById('distance').placeholder = currentLang === 'ru' ? 'например, 1350' : (currentLang === 'uk' ? 'наприклад, 1350' : 'e.g., 1350');
    document.getElementById('h_mortar').placeholder = currentLang === 'ru' ? 'например, 170' : (currentLang === 'uk' ? 'наприклад, 170' : 'e.g., 170');
    document.getElementById('h_target').placeholder = currentLang === 'ru' ? 'например, 120' : (currentLang === 'uk' ? 'наприклад, 120' : 'e.g., 120');
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

// Инициализация карты с простой системой координат
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

// Наложение карты Удачное
const udachneBounds = [[0, 0], [5120, 10240]];
let udachneLayer;
try {
    udachneLayer = L.imageOverlay('./assets/images/udachne.png', udachneBounds).addTo(map);
    console.log('Udachne layer added');
} catch (error) {
    console.error('Error loading udachne layer:', error);
}

// Размеры для остальных карт
const donairBounds = [[0, 0], [4352, 4352]];
const sergeevkaBounds = [[0, 0], [10240, 10240]];

// Карты
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

// Функция для управления отображением сетки
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

// Функция для отрисовки сетки
function drawGrid() {
    gridLayer.clearLayers();
    minorGridLayer.clearLayers();

    if (!isGridEnabled) return;

    const majorStep = 1000; // 1 км
    const minorStep = 100;  // 100 м
    const zoom = map.getZoom();

    // Определяем размеры карты
    let width = mapWidth;
    let height = mapHeight;

    // Основная сетка (1 км)
    for (let x = 0; x <= width; x += majorStep) {
        gridLayer.addLayer(L.polyline([[0, x], [height, x]], { className: 'grid-line' }));
    }
    for (let y = 0; y <= height; y += majorStep) {
        gridLayer.addLayer(L.polyline([[y, 0], [y, width]], { className: 'grid-line' }));
    }

    // Мелкая сетка (100 м), отображается при zoom >= 0
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

// Обновление сетки при зуме
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

    // Очищаем маркеры при смене карты
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

// Маркеры
let mortarMarker = null;
let targetMarker = null;

// Данные минометов
const uaMortarData = [
    [400, 1531], [500, 1514], [600, 1496], [700, 1478], [800, 1460], [900, 1442],
    [1000, 1424], [1100, 1405], [1200, 1385], [1300, 1366], [1400, 1346], [1500, 1326],
    [1600, 1305], [1700, 1283], [1800, 1261], [1900, 1238], [2000, 1214], [2100, 1188],
    [2200, 1162], [2300, 1134], [2400, 1104], [2500, 1070], [2600, 1034], [2700, 993],
    [2800, 942], [2900, 870]
];

const ruMortarData = [
    [400, 1418], [500, 1398], [600, 1376], [700, 1355], [800, 1333], [900, 1311],
    [1000, 1288], [1100, 1264], [1200, 1240], [1300, 1215], [1400, 1189], [1500, 1161],
    [1600, 1133], [1700, 1102], [1800, 1069], [1900, 1034], [2000, 995], [2100, 950],
    [2200, 896], [2300, 820]
];

const gradMortarData = [
    [3000, 140], [3200, 150], [3400, 159], [3600, 169], [3800, 179], [4000, 190],
    [4200, 200], [4400, 211], [4600, 221], [4800, 233], [5000, 244], [5200, 256],
    [5400, 268], [5600, 280], [5800, 293], [6000, 306], [6200, 320], [6400, 334],
    [6600, 349], [6800, 364], [7000, 380], [7200, 398], [7400, 416], [7600, 436],
    [7800, 458], [8000, 482], [8200, 509], [8400, 543], [8600, 587]
];

function interpolate(data, dist) {
    if (dist < data[0][0] || dist > data[data.length - 1][0]) return null;
    for (let i = 0; i < data.length - 1; i++) {
        if (dist >= data[i][0] && dist <= data[i + 1][0]) {
            const ratio = (dist - data[i][0]) / (data[i + 1][0] - data[i][0]);
            const elev = data[i][1] + (data[i + 1][1] - data[i][1]) * ratio;
            return elev;
        }
    }
    return null;
}

let guidances = {
    udachne: [],
    sergeevka: [],
    DonAirConflict: []
}

function saveToHistory() {
    if (tempguid == {}) {
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

// Обработчики событий карты
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

function calculateFromMap() {
    if (!mortarMarker || !targetMarker) return;
    const mortarPos = mortarMarker.getLatLng();
    const targetPos = targetMarker.getLatLng();
    let dist, dx, dy;
    const layer = document.getElementById('layer').value;
    dx = targetPos.lng - mortarPos.lng;
    dy = targetPos.lat - mortarPos.lat;
    dist = Math.sqrt(dx * dx + dy * dy);
    const azRad = Math.atan2(dx, dy);
    let azDeg = (azRad * 180 / Math.PI + 360) % 360;
    const azUaMils = (azDeg / 360) * 6400;
    const azRuMils = (azDeg / 360) * 6000;
    const mortarType = document.getElementById('mortar').value;
    let data, azMils;
    if (mortarType === 'ua') {
        data = uaMortarData;
        azMils = azUaMils.toFixed(0);
    } else if (mortarType === 'ru') {
        data = ruMortarData;
        azMils = azRuMils.toFixed(0);
    } else {
        data = gradMortarData;
        azMils = azRuMils.toFixed(0);
    }
    // Учет высоты
    const h_mortar = parseFloat(document.getElementById('h_mortar').value) || 0;
    const h_target = parseFloat(document.getElementById('h_target').value) || 0;
    const deltaH = h_target - h_mortar;
    const correction = Math.abs(deltaH) < 25 ? 0 : deltaH / 2;
    const adjustedDist = dist + (deltaH >= 0 ? correction : -correction);
    let elev = interpolate(data, adjustedDist);
    let elevText = elev !== null ? `${elev.toFixed(1)} mils` : translations[currentLang].outOfRange;
    const t = translations[currentLang];
    let resultText = `
                ${t.rangeText}${dist.toFixed(0)} м<br>
                ${t.azimuthText}${azDeg.toFixed(1)}° (${azMils} mils)<br>
                ${t.elevationText}${elevText}
            `;
    if (Math.abs(deltaH) >= 25) {
        resultText = `
                    ${t.rangeText}${dist.toFixed(0)} м<br>
                    ${t.adjustedRangeText}${adjustedDist.toFixed(0)} м<br>
                    ${t.azimuthText}${azDeg.toFixed(1)}° (${azMils} mils)<br>
                    ${t.elevationText}${elevText}
                `;
    }
    document.getElementById('result').innerHTML = resultText;
    document.getElementById('result-panel').classList.add('active');
}

function calculateManual() {
    const dist = parseFloat(document.getElementById('distance').value);
    if (isNaN(dist)) return;
    const mortarType = document.getElementById('mortar').value;
    let data;
    if (mortarType === 'ua') {
        data = uaMortarData;
    } else if (mortarType === 'ru') {
        data = ruMortarData;
    } else {
        data = gradMortarData;
    }
    // Учет высоты
    const h_mortar = parseFloat(document.getElementById('h_mortar').value) || 0;
    const h_target = parseFloat(document.getElementById('h_target').value) || 0;
    const deltaH = h_target - h_mortar;
    const correction = Math.abs(deltaH) < 25 ? 0 : deltaH / 2;
    const adjustedDist = dist + (deltaH >= 0 ? correction : -correction);
    let elev = interpolate(data, adjustedDist);
    let elevText = elev !== null ? `${elev.toFixed(1)} mils` : translations[currentLang].outOfRange;
    const t = translations[currentLang];
    let resultText = `${t.manualRange}${dist} м | ${t.elevationText}${elevText}`;
    if (Math.abs(deltaH) >= 25) {
        resultText = `
                    ${t.manualRange}${dist} м<br>
                    ${t.adjustedRangeText}${adjustedDist.toFixed(0)} м<br>
                    ${t.elevationText}${elevText}
                `;
    }
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
        showNotification(translations[currentLang].deviceBtnTitle + ': ' + translations[currentLang].pcBtn);
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
updateTexts();
updateLayerOptions();
updateMortarOptions();
updateThemeOptions();
updateLanguageOptions();
drawGrid();
