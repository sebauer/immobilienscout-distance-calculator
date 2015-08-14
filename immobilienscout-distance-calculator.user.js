// ==UserScript==
// @name         ImmobilienScout24 Distance Calculator
// @namespace    https://github.com/sebauer/immobilienscout-distance-calculator
// @version      0.2.1
// @description  enter something useful
// @updateURL    https://github.com/sebauer/immobilienscout-distance-calculator/raw/master/immobilienscout-distance-calculator.user.js
// @author       Sebastian Bauer
// @match        http://www.immobilienscout24.de/Suche/*
// @match        http://www.immobilienscout24.de/expose/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==
/* global GM_xmlhttpRequest, XPathResult */
function sendMapsRequest (origin, destination, targetElem) {
  GM_xmlhttpRequest({
    method: 'GET',
    url: 'https://maps.googleapis.com/maps/api/directions/json?origin=' + encodeURIComponent(origin) + '&destination=' + encodeURIComponent(destination) + '&key=AIzaSyBnRL5RMvFyq1QjGZRQPuhrrSLgpICJyXc',
    onload: function (res) {
      console.log(res);
      var resObj = JSON.parse(res.responseText);
      var resultRow = document.createElement('div');
      resultRow.innerHTML = origin + ': ' + resObj.routes[0].legs[0].distance.text + ' / ' + resObj.routes[0].legs[0].duration.text;
      targetElem.appendChild(resultRow);
    }
  });
}

function calculateGoogleMapsRoutes (elem) {
  var destination = elem.getAttribute('data-destination');

  var header = elem.parentNode;
  var routesDiv = document.createElement('div');
  routesDiv.setAttribute('class', 'font-s');
  header.appendChild(routesDiv);

  sendMapsRequest('Köln', destination, routesDiv);
  sendMapsRequest('Bonn', destination, routesDiv);
  sendMapsRequest('Nürburgring', destination, routesDiv);
}

function addRouteButton (elem, destination) {
  var button = document.createElement('button');
  button.setAttribute('style', 'display: block;');
  button.setAttribute('data-destination', destination);
  button.onclick = function () {
    this.style.display = 'none';
    calculateGoogleMapsRoutes(this);
  };
  button.innerHTML = 'Berechnen';
  elem.parentNode.parentNode.appendChild(button);
}

function getResultElements () {
  return document.evaluate("/html/body//span[contains(@class, 'street')]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
}

window.addEventListener('load', function () {
  console.log('run');
  var resultSet = getResultElements();
  console.log(resultSet);
  var currentResult = null;
  for (var i = 0; i < resultSet.snapshotLength; i++) {
    currentResult = resultSet.snapshotItem(i);
    addRouteButton(currentResult, currentResult.innerHTML);
  }

  // is24-expose-address
  var addressElemOnExpose = document.evaluate("/html/body//span[@data-qa='is24-expose-address']", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  if (addressElemOnExpose.snapshotLength > 0) {
    addRouteButton(addressElemOnExpose.snapshotItem(0), addressElemOnExpose.snapshotItem(0).textContent);
  }

  console.log('done');
}, false);
