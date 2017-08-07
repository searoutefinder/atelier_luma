		/*
         * Perform a quick fix to the InfoWindow class of the google maps api v3 as it 
         * does not have a isOpen method to detect if the infowindows is open or not
         */  
        google.maps.InfoWindow.prototype.isOpen = function(){
            var map = this.getMap();
            return (map !== null && typeof map !== "undefined");
        }

        /* Let's lay out our module that is going to be responsible for the map display and intractions */

		var projectMap = (function (window, $) {
        	var publicVars = {
        		'map': null,
        		'bubble': new google.maps.InfoWindow, 
        		'currentlyOnDisplay': [],
        		'peopleMarkers': [],
        		'projectCoverages': [],
        		'languageCode': 'en',
        		'updateLanguage': function(){
        			for(i in this.api){
        				this.api[i] = this.api[i].split('*').join(this.languageCode);
        			}
        			return true;
        		},
        		'vertices': [],
        		'connections': [],
        		'relations': [],
                'individualLocations': [],
        		'api': {
        			'projects': 'https://staging-luma.basedigital.io/api/*/projects.json',
        			'people': 'https://staging-luma.basedigital.io/api/*/people.json',
        			'themes': 'https://staging-luma.basedigital.io/api/*/themes.json'
        		},
        		'data': {
        			'projects': null,
        			'people': null,
        			'themes': null,
        			'themecolors': {}
        		},
        		'assets': {
        			'basemarker': '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="16" height="16" id="svg2" version="1.1"><path d="m 15.75,8.0000013 c 0,4.2802067 -3.469793,7.7499997 -7.75,7.7499997 -4.2802068,0 -7.75,-3.469793 -7.75,-7.7499997 0,-4.2802068 3.4697932,-7.74999998 7.75,-7.74999998 4.280207,0 7.75,3.46979318 7.75,7.74999998 z" style="fill:marker-color-here;fill-opacity:1;stroke:none"/></svg>'
        		}
        	};

            function _getMap(){
                return publicVars.map;
            }

            function _getPeopleMarkers(){
                return publicVars.peopleMarkers;
            }

            function _getClusterer(){
                return publicVars.clusterer;
            }

        	/*	
        	 *	Public function _init
        	 *	@param: container
        	 *	@param: languageCode
        	 *	Must be a HTML DOM pointer. Either document.getElementById('dom-element-id')
        	 *	or $('#dom-element-id').get(0)
        	 *
        	 */
        	function _init(container, languageCode){
        		if( languageCode != ''){
					publicVars.languageCode = languageCode;
					publicVars.updateLanguage();
        		}        		
        		publicVars.map = new google.maps.Map(container, {
        			'center': new google.maps.LatLng(43.6766, 4.6278),
        			'mapTypeId': google.maps.MapTypeId.ROADMAP,
        			'zoom': 12,
        			'disableDefaultUI': true,
        			'zoomControl': true,
				    'zoomControlOptions': {
				        'position': google.maps.ControlPosition.RIGHT_BOTTOM
				    },       			
        			'scaleControl': false,
        			'streetViewControl': false,
        			'styles': [
					    {
					        "featureType": "water",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "color": "#e9e9e9"
					            },
					            {
					                "lightness": 17
					            }
					        ]
					    },
					    {
					        "featureType": "landscape",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "color": "#f5f5f5"
					            },
					            {
					                "lightness": 20
					            }
					        ]
					    },
					    {
					        "featureType": "road.highway",
					        "elementType": "geometry.fill",
					        "stylers": [
					            {
					                "color": "#ffffff"
					            },
					            {
					                "lightness": 17
					            }
					        ]
					    },
					    {
					        "featureType": "road.highway",
					        "elementType": "geometry.stroke",
					        "stylers": [
					            {
					                "color": "#ffffff"
					            },
					            {
					                "lightness": 29
					            },
					            {
					                "weight": 0.2
					            }
					        ]
					    },
					    {
					        "featureType": "road.arterial",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "color": "#ffffff"
					            },
					            {
					                "lightness": 18
					            }
					        ]
					    },
					    {
					        "featureType": "road.local",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "color": "#ffffff"
					            },
					            {
					                "lightness": 16
					            }
					        ]
					    },
					    {
					        "featureType": "poi",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "color": "#f5f5f5"
					            },
					            {
					                "lightness": 21
					            }
					        ]
					    },
					    {
					        "featureType": "poi.park",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "color": "#dedede"
					            },
					            {
					                "lightness": 21
					            }
					        ]
					    },
					    {
					        "elementType": "labels.text.stroke",
					        "stylers": [
					            {
					                "visibility": "on"
					            },
					            {
					                "color": "#ffffff"
					            },
					            {
					                "lightness": 16
					            }
					        ]
					    },
					    {
					        "elementType": "labels.text.fill",
					        "stylers": [
					            {
					                "saturation": 36
					            },
					            {
					                "color": "#333333"
					            },
					            {
					                "lightness": 40
					            }
					        ]
					    },
					    {
					        "elementType": "labels.icon",
					        "stylers": [
					            {
					                "visibility": "off"
					            }
					        ]
					    },
					    {
					        "featureType": "transit",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "color": "#f2f2f2"
					            },
					            {
					                "lightness": 19
					            }
					        ]
					    },
					    {
					        "featureType": "administrative",
					        "elementType": "geometry.fill",
					        "stylers": [
					            {
					                "color": "#fefefe"
					            },
					            {
					                "lightness": 20
					            }
					        ]
					    },
					    {
					        "featureType": "administrative",
					        "elementType": "geometry.stroke",
					        "stylers": [
					            {
					                "color": "#fefefe"
					            },
					            {
					                "lightness": 17
					            },
					            {
					                "weight": 1.2
					            }
					        ]
					    }
					]
        		});

				google.maps.event.addListener(publicVars.map, 'click', function(){
					publicVars.bubble.close();
					// $('#controls').removeClass('slide-in').addClass('slide-out');
				});
        	}

        	function _closeBubble(){
				publicVars.bubble.close(); 
				$('#controls').removeClass('slide-in').addClass('slide-out'); 		
        	}

        	function _getSingleTheme(themeID){

        	}

        	/*
        	 *	Public function _getSingleProject
        	 *	@param: projectID
        	 *	Retrieves information of a single project
        	 *	Basically all what we need is the title of the project, its theme and the IDs of all the people working on *  the project        	 
        	 */
        	function _getSingleProject(projectID){
        		for( i=0;i<publicVars.data.projects.length;i++ ){
        			//console.log([publicVars.data.projects[i], projectID]);
        			
        			if( publicVars.data.projects[i].id == projectID ){
        				return publicVars.data.projects[i];
        			}
        		}
        		return false;
        	} 
        	/*
        	 *	Public function _getAllProjects
        	 */
        	function _getAllProjects(){
        		return $.get(publicVars.api.projects);
        	}

        	/*
        	 *	Public function _getAllPeople
        	 */
        	function _getAllPeople(){
        		return $.get(publicVars.api.people);
        	}        	

        	/*
        	 *	Public function _getAllThemes
        	 */
        	function _getAllThemes(){
				return $.get(publicVars.api.themes);
        	}

        	/*
        	 *	Public function _getThemeColor
        	 *	@param: themeID
        	 *	This method is used to retrieve a theme info using the themes ID
        	 */
        	function _getThemeInfo(themeID){
        		for(i=0;i<publicVars.data.themes.length;i++){
        			if( parseInt(publicVars.data.themes[i]['id']) == parseInt(themeID) ){
        				return publicVars.data.themes[i];
        			}
        		}
        		return false;
        	}

        	function _getThemeColor(themeID){
        		for(i=0;i<publicVars.data.themes.length;i++){              			
        			if( parseInt(publicVars.data.themes[i]['id']) == parseInt(themeID) ){
        				return publicVars.data.themes[i].color;
        			}
        		}
        		return false;
        	}        	

        	/*
        	 *	Public function setProjects
        	 *	@param: projectsJSON
        	 *	Representation of all projects in JSON format from CarftCMS API
        	 *	This function is intended to store this JSON in the module's private var
        	 */
        	function _setProjects(projectsJSON){
        		//console.log(projectsJSON.data);
        		publicVars.data.projects = projectsJSON.data.slice(); 
        		return publicVars.data.projects;
        	}

        	/*
        	 *	Public function setPeople
        	 *	@param: peopleJSON
        	 *	Representation of all people in JSON format from CarftCMS API
        	 *	This function is intended to store this JSON in the module's private var
        	 */
        	function _setPeople(peopleJSON){        		
        		publicVars.data.people = peopleJSON.data.slice();
        		return publicVars.data.people;
        	}

        	/*
        	 *	Public function setThemes
        	 *	@param: themesJSON
        	 *	Representation of all themes in JSON format from CarftCMS API
        	 *	This function is intended to store this JSON in the module's private var
        	 */
        	function _setThemes(themesJSON){
        		publicVars.data.themes = themesJSON.data.slice();
        		for(i=0;i<publicVars.data.themes.length;i++){
        			publicVars.data.themecolors[ publicVars.data.themes[i]['id'] ] = publicVars.data.themes[i]['color'];
        		}
        		return publicVars.data.themes;
        	}

        	/*
        	 *	Public function setResult
        	 *	@param: resultJSON
        	 *	Representation of results in JSON format from CarftCMS API upon user selection on dropdown
        	 *	This function is intended to store this JSON in the module's private var
        	 */
        	function _setResult(resultJSON){
        		publicVars.currentlyOnDisplay = resultJSON.data.slice();
        		return publicVars.currentlyOnDisplay;
        	}

        	/*
        	 *	Public function extractPeople
        	 *	@param: projectJSON
        	 *	This method extracts people IDs from their JSON URLS 
        	 */
        	function _extractPeople(projectJSON){

        	}

        	/*
        	 *	Public function _createProjectDropdown
        	 *	@param: projectsList
        	 *	@param: className
        	 *	Used to create an inline dropdown within the map that lists projects
        	 *	that the user can choose from
        	 */
        	function _createProjectDropdown(projectsList, className){
        		var $select = $('<select class="' + className + '"></select>');
        		if(projectsList.length > 0){
        			if( publicVars.languageCode == 'en' ){
        				//$select.append($('<option selected disabled>Select a project...</option>'));					
        				$select.append($('<option value="9999">All projects...</option>'));
        			} else if ( publicVars.languageCode == 'fr' ){
        				//$select.append($('<option selected disabled>Sélectionnez un projet...</option>'));
        				$select.append($('<option value="9999">Tous les projets...</option>'));
        			}

        			for(i=0;i<projectsList.length;i++){
        				$select.append($('<option value="' + projectsList[i].id + '">' + projectsList[i].title + '</option>'));
        			}
        		}
        		else
        		{
        			$select.append('<option selected disabled>No available projects</option>');
        		}
        		return $select;
        	}

        	function _createThemeDropdown(themeList, className){
        		var $select = $('<select class="' + className + '"></select>');
        		if(themeList.length > 0){
        			if( publicVars.languageCode == 'en' ){
        				$select.append($('<option selected disabled>Select a theme...</option>'));					
        			} else if ( publicVars.languageCode == 'fr' ){
        				$select.append($('<option selected disabled>Sélectionnez un theme...</option>'));
        			}

        			for(i=0;i<themeList.length;i++){
        				$select.append($('<option value="' + themeList[i].id + '">' + themeList[i].title + '</option>'));
        			}
        		}
        		else
        		{
        			$select.append('<option selected disabled>No available themes</option>');
        		}
        		return $select;        		
        	}

        	/*
        	 *	Public function _updateMapDropDown
        	 *	@param: $domElement        	 
        	 *	Takes the input which is a jQuery object representing a select element
			 *	and append it as an inline control to the Google Map instance
			 */
        	function _updateMapDropdown($domElement){
        		//publicVars.map.controls[google.maps.ControlPosition.TOP_LEFT].push($domElement.get(0));
                $('#wrapper').append($domElement);
        	}
        	/*
 			 *	Private function _createBubble
 			 *	@param: marker [a google.maps.Marker object]
 			 *	Creates an info window using the marker's attributes
        	 */
        	function _createBubble(marker, peopleJSON){
        		console.clear();
                console.log(marker.attributes);

                if( typeof marker.attributes.institution[0] == 'undefined' ){
        			var institution = '';
        		}
        		else
        		{
        			var institution = '<p style="font-size:12px;margin:0;">' + marker.attributes.institution[0].title + '</p>';
        		}                    
        		

                var pplCount = 0;
                var pplBbl = [];
                for(i in peopleJSON){
                    if( [peopleJSON[i].latitude, peopleJSON[i].longitude].join(",") == marker.getPosition().toUrlValue() ){
                        pplCount++;
                        pplBbl.push( peopleJSON[i] );
                    }
                }

                if(pplCount > 1){
                    /*Show a list of people in the bubble*/
                    var $content = $('<div style="padding:5px;height:auto;overflow:hidden;"><p style="font-size:14px;font-weight:bold;margin:0;">' + marker.attributes.projectTitle + '</p><ul></ul></div>');
                    for(i in pplBbl){
                        $content.find('ul').append( $('<li>' + pplBbl[i].title + '</li>') );
                    }
                }
                else
                {
                    /*Show only the individual's details in the bubble*/
                    var $content = $('<div style="padding:5px;height:auto;overflow:hidden;"><p style="font-size:14px;font-weight:bold;margin:0;">' + marker.attributes.title + '</p><p style="font-size:12px;margin:0;">' + marker.attributes.jobTitle + '</p>' + institution + '<p style="font-size:12px;margin:0;">' + marker.attributes.projectTitle + '</p></div>');
                }

                publicVars.bubble.setOptions({
          			content: $content.get(0),
        		});
        	}

        	/*
			 *	Public function _deleteOverlays
			 *	@param: no params
			 *	Deletes all overlays from the map
        	 */
        	function _deleteOverlays(){
        		/* Delete markers */
        		while(publicVars.peopleMarkers[0]){
        			publicVars.peopleMarkers.pop().setMap(null);
        		}

        		publicVars.peopleMarkers.length = 0;

        		/* Delete polylines */	
        		while(publicVars.projectCoverages[0]){
        			publicVars.projectCoverages.pop().setMap(null);
        		}
        		publicVars.projectCoverages.length = 0;        		
        	}


			function getAllOtherVertices(vertexID){
			    var _vertices = [];
			    for(i in publicVars.vertices){
			    		if( parseInt(publicVars.vertices[i].id) != parseInt(vertexID) ){
			        	_vertices.push(publicVars.vertices[i]);
			        }
			    }
			    return _vertices;
			}

			function connectVertexToAllVertices(vertexID){
				var _vertices = getAllOtherVertices(vertexID);
			  for(i=0;i<_vertices.length;i++){
			    var _row = _vertices[i];
			    var _matching_row = publicVars.vertices.filter(function( obj ) {
			      //console.log( [parseInt(obj.id), parseInt(_row['id'])] );
			      if( parseInt(obj.id) == parseInt(_row['id']) ){
			      	var _relation = [ parseInt(_row.id), parseInt(vertexID) ];
			        //obj.attributes.connections.push(_relation);
			        publicVars.connections.push(_relation);
			        return true;
			      }
			    });
			  }
			}

			function getUniqueConnections(connection){
				for(i=0;i<publicVars.connections.length;i++){
			  	if( JSON.stringify(connection) == JSON.stringify(publicVars.connections[i].reverse()) ){
			    	publicVars.relations.push(connection);    
			    }
			  }
			}

        	/*
        	 *	Public function _displaySelectedPeople
        	 *	@param peopleJSON: json representation of people involved in the selected project
        	 *	@param project: json representation of the selected project
        	 *	@param setToBounds: boolean flag whether to focus the map on the results or not
        	 *	Displays people and connecting lines of a selected project
        	 */
        	function _displaySelectedPeople(peopleJSON, project, setToBounds, isOverall){
        		
        		//console.log(['_displaySelectedPeople got called', peopleJSON, project]);        		

        		/* Instantiate a wrapper for polyline vertices */	
        		var latlngs = [];

        		for(i=0;i<peopleJSON.length;i++){
        			if( peopleJSON[i].latitude != 0 && peopleJSON[i].longitude != 0){
        				
        				var pplMarker = new google.maps.Marker({        					
                            'draggable': true,
        					'position': new google.maps.LatLng( parseFloat(peopleJSON[i].latitude), parseFloat(peopleJSON[i].longitude)),
        					'icon': {
								'url': 'data:image/svg+xml,' + publicVars.assets.basemarker.split('marker-color-here').join(project.themeColor),
							    'size': new google.maps.Size(16, 16),
							    'scaledSize': new google.maps.Size(16, 16),
							    'anchor': new google.maps.Point(8, 8)        						
        					}
        				});        		

        				pplMarker.attributes = $.extend(true, {}, peopleJSON[i], {'themeColor': project.themeColor, 'themeID': project.themeID, 'projectTitle': project.title});
        				pplMarker.connections = [];

        				google.maps.event.addListener(pplMarker, 'click', function(e){
        					
                            if( publicVars.bubble.isOpen() ){
                                publicVars.bubble.close();
                                return;
                            }

                            _createBubble(this, peopleJSON);

        					publicVars.bubble.open(publicVars.map, this);

        				});

                        if(publicVars.peopleMarkers.length == 0){  
                            pplMarker.setMap(publicVars.map);                          
                            publicVars['individualLocations'].push( pplMarker.getPosition().toString() ); 
                            publicVars.peopleMarkers.push(pplMarker);                         
                        }
                        else{                        
                            if( publicVars['individualLocations'].indexOf(pplMarker.getPosition().toString()) == -1 ){                                 
                                pplMarker.setMap( publicVars.map );
                                publicVars['individualLocations'].push( pplMarker.getPosition().toString() );
                                publicVars.peopleMarkers.push( pplMarker );                                
                            }
                        }
                        latlngs.push({'latitude': pplMarker.getPosition().lat(), 'longitude': pplMarker.getPosition().lng()});                              
        			}
        		}
                
                
                //ppl_lls.length = 0;
                //ppl_lls = null;

        		if(!isOverall){
        			var uniqLatLngs =  [];
        			var a = [];
        			publicVars.connections.length = 0;
        			publicVars.relations.length = 0;
        			publicVars.vertices.length = 0;

        			for(i=0;i<publicVars.peopleMarkers.length;i++){
        				uniqLatLngs.push(publicVars.peopleMarkers[i].getPosition().toUrlValue());
        			}
	        		
					for(j=0;j<uniqLatLngs.length;j++){
						if( a.indexOf(uniqLatLngs[j]) == -1){
							a.push( uniqLatLngs[j] );
						}
					}

					for(r=0;r<a.length;r++){
						var coordinates = a[r].split(",");
						publicVars.vertices.push({'latlng': new google.maps.LatLng( parseFloat(coordinates[0]), parseFloat(coordinates[1]) ), 'url': a[r], 'id': r});
					}

					for(i in publicVars.vertices){
					  connectVertexToAllVertices(publicVars.vertices[i].id);
					}

					for(j=publicVars.connections.length - 1;j>=0;j--){
						getUniqueConnections(publicVars.connections[j]);
					}					
					//console.clear();
					//console.log(publicVars.vertices);
					//console.log(publicVars.relations);

					for(i in publicVars.relations){

		        		publicVars.projectCoverages.push(new google.maps.Polyline({
		        			'map': publicVars.map,
		        			'strokeOpacity': 1,
		        			'strokeColor': project.themeColor,
		        			'strokeWeight': 2,
		        			'path': [publicVars.vertices[ publicVars.relations[i][0] ].latlng, publicVars.vertices[ publicVars.relations[i][1] ].latlng]
		        		}));						
					}
				}				



        		var ring = calculateConvexHull(latlngs);

        		var path = [];
        		var bounds = new google.maps.LatLngBounds();

        		for(i in ring){
        			/*if(isOverall){
        				path.push(new google.maps.LatLng(ring[i].latitude, ring[i].longitude));
        			}*/	
        			bounds.extend(new google.maps.LatLng(ring[i].latitude, ring[i].longitude));
        		}
        		if(isOverall){
                    //console.log('Tamas');
	        		/*path.push(new google.maps.LatLng(ring[0].latitude, ring[0].longitude));
	        		
	        		publicVars.projectCoverages.push(new google.maps.Polyline({
	        			'map': publicVars.map,
	        			'strokeOpacity': 1,
	        			'strokeColor': project.themeColor,
	        			'strokeWeight': 2,
	        			'path': path
	        		}));*/
				}
        		if(setToBounds){
        			if( !bounds.isEmpty() ){
        				publicVars.map.fitBounds(bounds);
        			}
        		}        		
        	}

        	function _displayAllProjects(initial){
        		
        		/* Delete all possible overlays from the map */
        		_deleteOverlays();
        		
        		var updatedProjectsArray = [];

				for( i=0;i<publicVars.data.projects.length;i++ ){
					publicVars.data.projects[i].peopleIDs = [];
        			for( j=0;j<publicVars.data.projects[i].people.length;j++ ){
	        			var regExp = /\/people\/(.*?).json/;
	        			var matches = regExp.exec(publicVars.data.projects[i].people[j].jsonUrl);
	        			publicVars.data.projects[i].peopleIDs.push(parseInt(matches[1]));
        			}
        			var regExp_themeID = /\/themes\/(.*?).json/;        				
        			var themeID_matches = regExp_themeID.exec(publicVars.data.projects[i].theme[0].jsonUrl);
        			var themeID = themeID_matches[1];

        			publicVars.data.projects[i]['themeID'] = parseInt(themeID);
					publicVars.data.projects[i]['themeColor'] = publicVars.data.themecolors[ publicVars.data.projects[i]['themeID'] ];				
				}

        		

        		var counter = 0;

        		for(k in publicVars.data.projects){        			
					var ppl = (function(project){
						return _getUrlContents('https://staging-luma.basedigital.io/api/en/people/' + publicVars.data.projects[k].peopleIDs + '.json').then(function(data){							
								counter++;
								if(counter == publicVars.data.projects.length){
									var bounds = new google.maps.LatLngBounds();
									for(z in publicVars.peopleMarkers){
										bounds.extend(publicVars.peopleMarkers[z].getPosition());
									}
									if( !bounds.isEmpty() ){
										if( initial ){
                                            publicVars.map.fitBounds(bounds);
                                        }    
						        		_createCluster();										
									}
								}
								else
								{
									_displaySelectedPeople(data.data, project, false, true);								
								}
							});
					})(publicVars.data.projects[k]);        			
        		}       		
        	}

        	function _getUrlContents(url){
				return $.ajax({
				    'url': url,
				    'type': 'GET'   
				});        		
        	}

        	function _createCluster(){
        		if( typeof publicVars.clusterer != 'undefined' ){
        			publicVars.clusterer.clearMarkers();
        			publicVars.clusterer = null;
	        		publicVars.clusterer = new MarkerClusterer(publicVars.map, publicVars.peopleMarkers, {
						'gridSize': 20, 
						'maxZoom': 13,
						'imagePath': 'img/m',
						'imageExtension': 'png',
						'minimumClusterSize': 3
					});         			
        		}
        		else
        		{
	        		publicVars.clusterer = new MarkerClusterer(publicVars.map, publicVars.peopleMarkers, {
						'gridSize': 20, 
						'maxZoom': 13,
						'imagePath': 'img/m',
						'imageExtension': 'png',
						'minimumClusterSize': 3
					}); 
        		}        		
        	}

            function _fetchProjectPeople(){
                for( i=0;i<publicVars.data.projects.length;i++ ){
                    publicVars.data.projects[i].peopleIDs = [];
                    for( j=0;j<publicVars.data.projects[i].people.length;j++ ){
                        var regExp = /\/people\/(.*?).json/;
                        var matches = regExp.exec(publicVars.data.projects[i].people[j].jsonUrl);
                        publicVars.data.projects[i].peopleIDs.push(parseInt(matches[1]));
                    }
                    var regExp_themeID = /\/themes\/(.*?).json/;                        
                    var themeID_matches = regExp_themeID.exec(publicVars.data.projects[i].theme[0].jsonUrl);
                    var themeID = themeID_matches[1];

                    publicVars.data.projects[i]['themeID'] = parseInt(themeID);
                    publicVars.data.projects[i]['themeColor'] = publicVars.data.themecolors[ publicVars.data.projects[i]['themeID'] ];              
                }                
            }

            function _resetLocations(){
                publicVars['individualLocations'].length = 0;
            }

        	return {
            	init: _init,
            	getAllPeople: _getAllPeople, 
            	getAllThemes: _getAllThemes,            	
            	getAllProjects: _getAllProjects,
            	getSingleProject: _getSingleProject,
            	getThemeInfo:_getThemeInfo,
            	setPeople: _setPeople,
            	setProjects: _setProjects,
            	setThemes: _setThemes,
            	setResult: _setResult,
            	createProjectDropdown: _createProjectDropdown,
            	updateMapDropdown: _updateMapDropdown,
            	getUrlContents: _getUrlContents,
				displaySelectedPeople: _displaySelectedPeople,
				displayAllProjects:_displayAllProjects,
				closeBubble:_closeBubble,
				deleteOverlays: _deleteOverlays,
				createCluster: _createCluster,
                fetchProjectPeople: _fetchProjectPeople,
                getClusterer: _getClusterer,
                getPeopleMarkers: _getPeopleMarkers,
                getMap: _getMap,
                resetLocations: _resetLocations
        	};
    	})(window, jQuery);