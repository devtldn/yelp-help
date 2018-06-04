// $(document).ready(function() {
//Parameters for the Yelp query
var proxy = 'https://cors-anywhere.herokuapp.com/';
//var proxy = "http://crossorigin.me/";
//var proxy = "https://cors-escape.herokuapp.com/";
var url = "https://api.yelp.com/v3/businesses/search";
var locationd;
// var termd = "italian food";
// var radiusd = 4000;
// var travelModed = 'DRIVING';
var termd;
var radiusd;
var travelModed;
var limitd = 8;
var sort_byd = "distance" //Also can do by rating or best_match
var open_nowd = true;
var latituded = 34.040982;
var longituded = -118.51400;
var possibleDestinations = [];

//Var are declared out since need to be global, but have to be assigned inside
var geocoder;
var directionsDisplay;
var directionsService;
var o;
var bounds;
var markersArray;
var destinationIcon;
var originIcon;
var map;

function initMap() {
    
    
    geocoder = new google.maps.Geocoder;
    directionsService = new google.maps.DirectionsService;

    
    //var line = new google.maps.PolylineOptions({strokeColor: "red"});
    
    directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setOptions({
        polylineOptions: {
            strokeColor: "red"
        }
    });
    // directionsDisplay.setOptions({
    //     option: google.maps.DirectionsRendererOptions({
    //         polylineOptions: "blue"
    //     })
    // });

    //Location object for origin
    o = new google.maps.LatLng({"lat": latituded, "lng":longituded});

     //Size map should be
     bounds = new google.maps.LatLngBounds;
     markersArray = [];


     //What the markers will look like
     destinationIcon = 'https://chart.googleapis.com/chart?' +
         'chst=d_map_pin_letter&chld=D|FF0000|000000';
     originIcon = 'https://chart.googleapis.com/chart?' +
         'chst=d_map_pin_letter&chld=O|FFFF00|000000';

     //Initialize map and Geocoder
     map = new google.maps.Map(document.getElementById('map'), {
         center: {lat: 34.047519, lng: -118.525081},
         zoom: 14
     });
 
     
     directionsDisplay.setMap(map);


    
}


var placeMarkers = function() {
    $.ajax({
        
    //Making the Yelp query
    // url: proxy + "https://api.yelp.com/v3/businesses/search?term=delis&latitude=37.786882&longitude=-122.399972",
    url: proxy + "https://api.yelp.com/v3/businesses/search",
    data: {
        latitude: latituded,
        longitude: longituded,
        term: termd,
        radius: radiusd,
        sort_by: sort_byd,
        // open_now: open_nowd,
        limit: limitd

    },
    headers: {
        "Authorization":
        "Bearer siEX8OCYbi_jlP5s9XfsZIzFp7Y6-wLg1E9CDaP3dMl9pUBv5oSNNXDWJfXrVinZHlUQD8ParDCMjkUjt4irK5k-qnVL0IOo0sA0BHpVJnXxcGMOMhGc6QiRAEEQW3Yx"
    },
    method: 'GET'

    //Once the Yelp query has returned some businesses, do this
    }).then( function (response){
        var resultcount = 0;
        var results = response.businesses;
        //console.log(businesses);
        results.forEach( function(result){
            console.log("Business name: " + result.name);
            // console.log("Latitude: " + result.coordinates.latitude);
            // console.log("Longitide: " + result.coordinates.longitude);
            // console.log("Phone: " + result.display_phone);
            // console.log("Distance: " + result.distance);
            // console.log("Price: " + result.price);
            // console.log("Rating: " + result.rating);
            // console.log("Business id: " + result.id);
            console.log("Address: " + result.location.address1 + " " + result.location.city);
            console.log("");


            //var coordinates = {"lat": result.coordinates.latitude, "lng": result.coordinates.longitude}; 
            // google.maps.LatLng(result.coordinates.latitude,result.coordinates.longitude);
            //possibleDestinations.push( new google.maps.LatLng(coordinates));

            //Results from Yelp are put in this array and given to Google
            //Business name and street address are all that Google needs to find the right place
            //Only plot top 6
            if( result.location.address1.length > 8 && resultcount <=6){
                possibleDestinations.push(result.name +", "+ result.location.address1);
                resultcount++;
            }
            
        });

    


        var service = new google.maps.DistanceMatrixService;
        service.getDistanceMatrix({
            origins: [o],
            destinations: possibleDestinations,
            travelMode: 'DRIVING',
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            avoidHighways: false,
            avoidTolls: false
        }, function(response, status) {
        if (status !== 'OK') {
            alert('Error was: ' + status);
        } else {

            console.log(response);

            //If successfully got distance matrix, put them on the map and
            //durations on the page

            //Get list of destination durations/distances
            var originList = response.originAddresses;
            var destinationList = response.destinationAddresses;

            //Div to add results on the side
            var outputDiv = document.getElementById('output');
            outputDiv.innerHTML = '';
            deleteMarkers(markersArray);


            //For destinations only
            var placeDestination= function(index) {

                //Determine if icon is origin or destination (false=origin)
                var icon = destinationIcon;
                console.log("Status: " + status);
                console.log("Index: " + index);
                return function(results, status) {
                    if (status === 'OK') {

                        //What to display when marker is clicked
                        //Only show business name, address, and directions button
                        var infowindow = new google.maps.InfoWindow({
                            content: "<b>" + possibleDestinations[index].split(",")[0] + "</b><br>" +
                                possibleDestinations[index].split(",")[1].trim() + 
                                // "<br><button id='testbutton'>Directions</button>"
                                "<br><button class='directions'>Directions</button>"
                        });
                    
                        
                        map.fitBounds(bounds.extend(results[0].geometry.location));
                        
                        //Make marker and place it
                        var marker = new google.maps.Marker({
                            title:possibleDestinations[index],
                            map: map,
                            position: results[0].geometry.location,
                            icon: icon
                        });

                        //What to do when marker is clicked
                        //https://developers.google.com/maps/documentation/javascript/events for more
                        //TODO: timer, stay open for 3 seconds or something
                        marker.addListener("click", function() {
                            infowindow.open(map, marker);
                        });

                        // marker.addListener("mouseout", function() {
                        //     infowindow.close();
                        // });

                        markersArray.push(marker);
                    } else {
                    alert('Geocode was not successful due to: ' + status);
                    }
                };
            };
            

            //For origin only
            var placeOrigin = function(){
                var icon = originIcon;
                console.log("Status: " + status);
                return function( results, status){
                    if (status === 'OK'){

                        var infowindow = new google.maps.InfoWindow({
                            content: "<b>Starting Point</b>" + "<br>" +
                            response.originAddresses[0]
                        });

                        map.fitBounds(bounds.extend(results[0].geometry.location));
                        
                        //Make marker and place it
                        var marker = new google.maps.Marker({
                            title:response.originAddresses[0],
                            map: map,
                            position: results[0].geometry.location,
                            icon: icon
                        });

                        //What to do when marker is clicked
                        marker.addListener("click", function() {
                            infowindow.open(map, marker);
                        });
                        markersArray.push(marker);
                    }
                    else{
                        alert("Origin Geocode was not successful due to: " + status);
                    }
                }
            }


                //Read the matrix
                //Fortunate that the destinations are returned in the order they were given
                for (var i = 0; i < originList.length; i++) {
                    //For one origin, list of results, one for each destination
                    var results = response.rows[i].elements;
                    

                    geocoder.geocode({'address': originList[i]},
                        placeOrigin());
                    
                    //Read each destination for one origin
                    for (var j = 0; j < results.length; j++) {

                        console.log(destinationList[j]);

                        //Place destination on the map
                        geocoder.geocode({'address': destinationList[j]},
                            placeDestination(j));
                        
                        //Put results on the side bar
                        outputDiv.innerHTML += originList[i] + ' to ' + destinationList[j] +
                            ': ' + results[j].distance.text + ' in ' +
                            results[j].duration.text + '<br>';
                    }
                }
            }

            
        });

        
    });
}



//What to do when directions button is clicked
$(document).on("click", ".directions", function(){


    //Get name and address from element
    //Search directions without the word "directions in the query"
    var d = $(this)[0].parentElement.innerText.slice(0,-10)
    directionsService.route({
        origin: o,
        destination: d,
        travelMode: 'DRIVING'
    }, function(response, status) {
        if(status === "OK"){
            //Get list of directions, put polyline on page, and put steps in panel
            directionsDisplay.setDirections(response);
            var data = response.routes[0];
            console.log(data);
            var steps = data.legs[0].steps;
            // steps.forEach( function(step) {
            //     $("#right-panel").append(step.instructions+"<br>");
            // });
            directionsDisplay.setPanel( document.getElementById("right-panel"));

        }
        else {
            window.alert('Directions request failed due to ' + status);
        }
    });
    
});




//Clear markers laying around on the map
function deleteMarkers(markersArray) {
    for (var i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(null);
    }
    markersArray = [];
}

    
// });
