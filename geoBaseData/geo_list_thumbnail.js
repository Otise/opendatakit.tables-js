"use strict";

$(document).ready(setup);
//handles events from html page
	
function setup() {
	displayGroup();
}
		
function handleClick(index) {
	control.openItem(index);
}

function displayGroup() {
	var indexed = data.isIndexed();
	if(data.inCollectionMode()) {
		indexed = false;
	}
	for (var i = 0; i < data.getCount(); i++) {	
		/*	Creating the item space	*/
		var itemHeading = document.createElement("div");
		var headingText = document.createElement("p");
		headingText.innerHTML = data.getData(i, "Description");
		itemHeading.setAttribute("class", "heading");  
		var src = data.getData(i, "Image");
		var thumbnail = document.createElement("img");
		thumbnail.setAttribute("src", src);
		thumbnail.setAttribute("class", "thumbnail");
		var buffer = document.createElement("p");
		buffer.setAttribute("class", "clear");
		itemHeading.appendChild(thumbnail);
		itemHeading.appendChild(headingText);
		itemHeading.appendChild(buffer);
		
		var detailContainer = document.createElement("div");
		detailContainer.setAttribute("onclick", "handleClick(" + i + ")");
		detailContainer.setAttribute("class", "detail_container");  
		detailContainer.setAttribute("id", "item_" + i);
		$(detailContainer).hide();
		var field1 = document.createElement("p");
		field1.innerHTML = "Latitude: " + data.getData(i, "Location_Latitude"); 
		var field2 = document.createElement("p");
		field2.innerHTML = "Longitude: " + data.getData(i, "Location_Longitude");
		var field3 = document.createElement("p");
		field3.innerHTML = "Altitude: " + data.getData(i, "Location_Altitude");

		detailContainer.appendChild(field1);
		detailContainer.appendChild(field2);
		detailContainer.appendChild(field3);
		
		$(itemHeading).click(function()
		{
			if($(this).hasClass('selected')) {
				$(this).removeClass('selected');
			} else {
				$(this).addClass('selected');
			}
			$(this).next(detailContainer).slideToggle("fast");
		});
		
		document.getElementById("wrapper").appendChild(itemHeading);
		document.getElementById("wrapper").appendChild(detailContainer);
	}
}