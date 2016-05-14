Donkin’s Donuts Locator Description
Idea:
Donkin Donuts iced coffee is my favorite coffee. When I check their website, I found their locator
website. The link is http://www.dunkindonuts.com/dunkindonuts/en/stores.html. It looks old.
This time, I decide to create a new Donkin's Donuts Locator web application with Angular and
Leaflet.

Objective:
The locator application can help people find DD store nearby. The user can input their address
or zip code and filter the stores by select distance radius, Wifi option, Full Menu Option, Drive
Through Option and Open Time Option. The web application also includes an interactive density
map.

Data:
The data comes from the Internet. The original format is CSV. The data has 4806 rows which
include address and coordinates. I transfer it into GeoJson. Without using GeoServer or ArcGIS
online, Rending the 4806 points is slow . So I just use data about Maine,
New Hamshire, and Vermont. These three states have
457 points.

Framework
The JavaScript framework is Angular. Based on Angular, I use AngularLeafletDirective
and
AngularBootstrapdirective.
The UI is based on Bootstrap.

JavaScript API
Leaflet, jQuery and Google Map JavaScript API(Geocoding)

Functionalities
1) Get user location by IP address.
This part is implemented by jQuery to get data from a free IPgeo
library.
2) Rend GeoJSON data and Popup
I use angularleaflet
to load it and render it with Donkin’s Donuts icon. When users click one
point, the information of the store will pop up.
3) Make points clustered
It is necessary for this application because thousands of points.
I use angularleaflet
to finish it
4) Geocoding
I choose Google Map Geocoding API to do this part.
5) Interactive Density Maps
This map shows the density of states about DD stores in the US. From this map, people can
know how many people have one DD store in different states.
6) A Single Page Application
The web application uses Angular Routes. It just renders part of a page. In this way, it
decreases the rendering time.
7) Full Screen
People can view maps in fullscreen
mode. It is completed by angularleafletdirective

Drawbacks
1) The loading speed is slow. I guess JavaScript is slow to parse, filter and render GeoJSON.
2) The UI is not beautiful. I am sorry that I do not have much time to do it.

Testing:
Chrome and Firefox work well.
But IE is very slow.
Bugs:
For the searching button, you need click twice. I do not know. Maybe some asynchronous
communication is inappropriate.