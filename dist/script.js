//for toggling unit
var unitInF = true;
//array for days in string
var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

$(document).ready(function() {
  //location search
  if (navigator.geolocation) {
    //if location works
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    //if location does not work
    clearStart();
    alert('Geolocation not available. Please search for location');
  }
  //change unit
  $("#unit").click(function() {
    changeUnit();
  });
  //search location
  $("#sButton").click(function() {
    searchLocation();
  });
  //search location with enter
  $(window).keypress(function(event) {
    var code = event.which;
    if (code === 13) {
      searchLocation();
    }
  });
});

//geolocation successful
function success(data) {
  var lat = data.coords.latitude;
  var lon = data.coords.longitude;
  getWeather(lat, lon);
  getLocationName(lat, lon);
}

//geolocation fail
function error(err) {
  console.log("error", err);
  clearStart();
}

//if no geolocation or search fail
function clearStart() {
  //hide everything except search
  $(".centerBox").hide();
  $(".forecastBox").hide();
  $("#searchTitle").show();
}

//search location
function searchLocation() {
  var search = document.getElementsByName("input")[0].value;
  var zip = search.match(new RegExp(/\d{5}/, "gi"));
  if (zip != null) {
    //zip search
    var requestGeo = "https://maps.googleapis.com/maps/api/geocode/json?address=" + zip + "&key=AIzaSyCuugDMliUtuYZ1tT2PZbgB_LMvOYi0wFU";
    $.getJSON(requestGeo, function(data) {
      var lat = data.results[0].geometry.location.lat;
      var lon = data.results[0].geometry.location.lng;
      getWeather(lat, lon);
      getLocationName(lat, lon);
    });
  } else {
    //name search
    var name = search.split(",");
    var requestGeo = "https://maps.googleapis.com/maps/api/geocode/json?address=" + name[0] + "+" + name[1] + "&key=AIzaSyCuugDMliUtuYZ1tT2PZbgB_LMvOYi0wFU";
    $.getJSON(requestGeo, function(data) {
      var lat = data.results[0].geometry.location.lat;
      var lon = data.results[0].geometry.location.lng;
      getWeather(lat, lon);
      getLocationName(lat, lon);
    });
  }

}

//get location name
function getLocationName(lat, lon) {
  var requestGeo = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon + "&key=AIzaSyCuugDMliUtuYZ1tT2PZbgB_LMvOYi0wFU";
  $.getJSON(requestGeo, function(data) {
    var city, state, country, secondary;
    for (var i = 0; i < data.results[0].address_components.length; i++) {
      var component = data.results[0].address_components[i];

      switch (component.types[0]) {
        case 'locality':
          city = component.long_name;
          break;
        case 'administrative_area_level_1':
          state = component.short_name;
          break;
        case 'country':
          country = component.short_name;
          break;
        case 'administrative_area_level_2':
          secondary = component.long_name;
      }
    }
    if (country === "US") {
      $("#geoLoc").html(city + ", " + state);
    } else if (city === undefined) {
      $("#geoLoc").html(secondary + ", " + country);
    } else {
      $("#geoLoc").html(city + ", " + country);
    }
  });
}

//get local weather
function getWeather(lat, lon) {
  //skycons free icons
  var skycons = new Skycons({
    "color": "white"
  });
  var requestWeather = "https://api.darksky.net/forecast/f74a4a03d5aac2c965dd54511ae47ac6/" + lat + "," + lon + "?callback=?&units=us";
  $.getJSON(requestWeather, function(data) {
    //show weather info
    $(".centerBox").show();
    $(".forecastBox").show();
    $("#searchTitle").hide();
    $(".overlay").show();
    //change weather information
    $("#wSummary").html(data.currently.summary);
    $("#wTemp").html(Math.round(data.currently.temperature));
    $("#fLike").html(Math.round(data.currently.apparentTemperature));
    $("#precipProb").html(Math.round((data.currently.precipProbability) * 100) + "%");
    $("#windSpeed").html(Math.round(data.currently.windSpeed) + " MPH");
    $("#cloudCover").html((Math.round(data.currently.cloudCover) * 100) + "%");
    $("#unit").html("F");

    //change icons
    skycons.add("icon1", data.currently.icon.toUpperCase());
    skycons.add("precip", "rain");
    skycons.add("wind", "wind");
    skycons.add("cloudCov", "cloudy");
    skycons.play();

    //fill next 5 days weather info
    forcast(data);

    //change background color
    colorChange(data.currently.icon);

    //reset unit toggle 
    unitInF = true;
  });
}

//populate next 5 days weather info
function forcast(data) {
  var date = new Date();
  var skyconsForcast = new Skycons({
    "color": "white"
  });
  date = date.getDay();
  var curForcast;
  for (var i = 1; i < 6; i++) {
    curForcast = date + i;
    //to loop around new week start
    if (curForcast > 6) {
      curForcast -= 7;
    }
    //get weather info for day i
    $("#day" + (i)).html(days[curForcast]);
    $("#day" + (i) + "Sum").html("");
    $("#day" + (i) + "High").html(Math.round(data.daily.data[i].temperatureMax));
    $("#day" + (i) + "Low").html(Math.round(data.daily.data[i].temperatureMin));
    $("#day" + (i) + "Perc").html(Math.round((data.daily.data[i].precipProbability) * 100));
    skyconsForcast.add("day" + i + "Icon", data.daily.data[i].icon);
    skyconsForcast.play();
  }

}

//change background color
function colorChange(icon) {

  if (icon === "sleet") {
    icon = "snow";
  } else if (icon === "wind" || icon === "fog") {
    icon = "cloudy";
  }
  switch (icon) {
    case 'clear-day':
      $(".diagonal").css("background-color", "#3399db");
      $("body").css("background-color", "#2b8fcf");
      $(".overlay").css("background", "linear-gradient(to top, rgba(0,100,255,.5), rgba(255,200,200,.3));")
      break;
    case 'partly-cloudy-day':
      $(".diagonal").css("background-color", "#416d8a");
      $("body").css("background-color", "#739eba");
      $(".overlay").css("background", "linear-gradient(to top, rgba(70,100,255,.3), rgba(255,200,200,.3))")
      break;
    case 'clear-night':
      $(".diagonal").css("background-color", "#2b8fcf");
      $("body").css("background-color", "#3399db");
      $(".overlay").css("background", "linear-gradient(to top, rgba(0,0,255,0.6), rgba(0,0,0,1));")
      break;
    case 'partly-cloudy-night':
      $(".diagonal").css("background-color", "#416d8a");
      $("body").css("background-color", "#739eba");
      $(".overlay").css("background", "linear-gradient(to top, rgba(200,200,255,0.6), rgba(0,0,0,1));")
      break;
    case 'cloudy':
      $(".diagonal").css("background-color", "#797979");
      $("body").css("background-color", "#6a6b6b");
      $(".overlay").css("background", "linear-gradient(to top, rgba(0,0,0,0.3), rgba(150,150,150,0.8));")
      break;
    case 'rain':
      $(".diagonal").css("background-color", "#03b8ba");
      $("body").css("background-color", "#2abad4");
      $(".overlay").css("background", "linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.8));")
      break;
    case 'snow':
      $(".diagonal").css("background-color", "#73d7e9");
      $("body").css("background-color", "#c4f6ff");
      $(".overlay").css("background", "linear-gradient(to top, rgba(0,0,0,.3), rgba(255,255,255,0.6));")
      break;
  }

}

//change units depending on user choice
function changeUnit() {
  if (unitInF) {
    //change to C
    toC("#wTemp");
    toC("#fLike");
    for (var i = 1; i < 6; i++) {
      toC("#day" + (i) + "High");
      toC("#day" + (i) + "Low");
    }
    $("#unit").html("C");
    unitInF = false;
  } else {
    //change to F
    toF("#wTemp");
    toF("#fLike");
    for (var i = 1; i < 6; i++) {
      toF("#day" + (i) + "High");
      toF("#day" + (i) + "Low");
    }
    $("#unit").html("F");
    //  forcast(data);
    unitInF = true;
  }


}

//function to change to celsius
function toC(tag) {
  var tempInF = parseInt($(tag).text());
  var inC = (tempInF - 32) * (5 / 9);
  $(tag).html(Math.round(inC));
}

//function to change to fahrenheit
function toF(tag) {
  var tempInC = parseInt($(tag).text());
  var inF = (tempInC * (9 / 5)) + 32;
  $(tag).html(Math.floor(inF));
}