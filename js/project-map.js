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
        		},
                'lastClickedMarkerID': null
        	};

            function _getLang(){
                return publicVars.languageCode;
            }

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
        		publicVars.data.projects = projectsJSON; 
        		return publicVars.data.projects;
        	}


            function _getProjects(){
                return publicVars.data.projects;
            }

            function _getProjectByID(projectID){
                for(i=0;i<publicVars.data.projects.length;i++){
                    if(publicVars.data.projects[i].id.toString() == projectID.toString()){
                        return publicVars.data.projects[i];
                    }
                }
            }

        	/*
        	 *	Public function setPeople
        	 *	@param: peopleJSON
        	 *	Representation of all people in JSON format from CarftCMS API
        	 *	This function is intended to store this JSON in the module's private var
        	 */
        	function _setPeople(peopleJSON){     		
        		publicVars.data.people = peopleJSON;
        		return publicVars.data.people;
        	}

            function _getPeople(){
                return publicVars.data.people;
            }

        	/*
        	 *	Public function setThemes
        	 *	@param: themesJSON
        	 *	Representation of all themes in JSON format from CarftCMS API
        	 *	This function is intended to store this JSON in the module's private var
        	 */
        	function _setThemes(themesJSON){
        		publicVars.data.themes = themesJSON;
        		for(i=0;i<publicVars.data.themes.length;i++){
        			publicVars.data.themecolors[ publicVars.data.themes[i]['id'] ] = publicVars.data.themes[i]['color'];
        		}
        		return publicVars.data.themes;
        	}

            function _getThemes(){
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
        	function _createBubble(marker, peopleJSON, projectID){
                console.log(peopleJSON);
                console.log(marker.attributes);
                console.log(projectID);

                if( typeof marker.attributes.institution[0] == 'undefined' ){
        			var institution = '';
        		}
        		else
        		{
        			var institution = '<p style="font-size:12px;margin:0;">' + marker.attributes.institution[0].title + '</p>';
        		}                    
        		

                var pplCount = 0;
                var pplBbl = [];

                for(i=0;i<publicVars.data.people.length;i++){
                    if( [publicVars.data.people[i].latitude, publicVars.data.people[i].longitude].join(",") == marker.getPosition().toUrlValue() ){
                        pplCount++;
                        if( publicVars.data.people[i].projects.length == 0){
                            pplBbl.push( {'group': 'outcasts', 'projects': [], 'title': publicVars.data.people[i].title, 'jobTitle': publicVars.data.people[i].jobTitle, 'institution': (typeof publicVars.data.people[i].institution[0] == 'undefined') ? '' : publicVars.data.people[i].institution[0].title } );
                        }
                        else{
                            if( publicVars.data.people[i].projects.indexOf(projectID) > -1){
                                pplBbl.push( {'group': 'projectees', 'projects': publicVars.data.people[i].projects.slice(), 'title': publicVars.data.people[i].title, 'jobTitle': publicVars.data.people[i].jobTitle, 'institution': (typeof publicVars.data.people[i].institution[0] == 'undefined') ? '' : publicVars.data.people[i].institution[0].title } );
                            }
                        }                        
                    }
                }

                console.log(pplBbl);

                if(pplCount > 1){
                    /*Show a list of people in the bubble*/
                    var $content = $('<div style="padding:5px;height:auto;overflow:hidden;"><ul class="projectees"></ul></div>');
                    //pplBl = pplBbl.sort(function(a,b){return a.xx-b.xx}).slice();
                    //console.log(pplBbl.sort(function(a,b){return a.noproject-b.noproject}));

                    var projectees = [];
                    var outcasts = [];

                    for(i in pplBbl){                        
                        if( pplBbl[i].group == 'projectees' ){
                            projectees.push(pplBbl[i]);
                        }
                        else if(pplBbl[i].group == 'outcasts')
                        {
                            outcasts.push(pplBbl[i]);                            
                        }
                    }

                    for(k in projectees){
                            var _template_data = [projectees[k].title, projectees[k].jobTitle, projectees[k].institution, "[" + projectees[k].projects.join(',')+"]"];
                            var _templ = [];
                            for(i in _template_data){
                                if(_template_data[i] != ''){
                                    _templ.push(_template_data[i]);
                                }
                            }
                            $content.find('ul.projectees').append( $('<li>' + _templ.join(' &middot; ') +'</li>') );
                    }
                    if(outcasts.length > 0){
                      $content.append('<hr><ul class="outcasts"></ul>');
                    }
                    for(j in outcasts){
                            var _template_data = [outcasts[j].title, outcasts[j].jobTitle, outcasts[j].institution];
                            var _templ = [];
                            for(i in _template_data){
                                if(_template_data[i] != ''){
                                    _templ.push(_template_data[i]);
                                }
                            }
                            $content.find('ul.outcasts').append( $('<li>' + _templ.join(' &middot; ') +'</li>') );                        
                    }
                    console.log([projectees, outcasts]);
                }
                else
                {
                    /*Show only the individual's details in the bubble*/
                    var $content = $('<div style="padding:5px;height:auto;overflow:hidden;"><p style="font-size:14px;font-weight:bold;margin:0;">' + marker.attributes.title + '</p><p style="font-size:12px;margin:0;">' + marker.attributes.jobTitle + '</p>' + institution + '<p style="font-size:12px;margin:0;">' + marker.attributes.projectTitle + '</p><p>' + '[' + marker.attributes.projects.join(",") + ']' + '</p></div>');
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

            function _getMarkerByLatLng(urlValue){
                    return publicVars.peopleMarkers.filter(
                        function (marker) { 
                            return marker.latlng_string === urlValue; 
                        }
                    );            
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
        					'position': new google.maps.LatLng( parseFloat(peopleJSON[i].latitude), parseFloat(peopleJSON[i].longitude)),
        					'draggable': true,
                            'icon': {
								'url': 'data:image/svg+xml,' + publicVars.assets.basemarker.split('marker-color-here').join(project.themeColor.replace(/-/g, "")),
							    'size': new google.maps.Size(16, 16),
							    'scaledSize': new google.maps.Size(16, 16),
							    'anchor': new google.maps.Point(8, 8)        						
        					}
        				});        		  

        				pplMarker.attributes = $.extend(true, {}, peopleJSON[i], {'themeColor': project.themeColor.replace(/-/g, ""), 'themeID': project.themeID, 'projectTitle': project.title});
        		
                        pplMarker.connections = [];

        				google.maps.event.addListener(pplMarker, 'click', function(e){
        					console.log(pplMarker.attributes.id);
                            if( publicVars.bubble.isOpen() ){
                                publicVars.bubble.close();

                                /*If the clicked marker is a different marker from the one we have just clicked on before then open a new info bubble*/
                                if(publicVars.lastClickedMarkerID != this.attributes.id){
                                    _createBubble(this, peopleJSON, project.id);

                                    publicVars.bubble.open(publicVars.map, this);
                                    publicVars.lastClickedMarkerID = this.attributes.id;                                    
                                }
                            }
                            else
                            {
                                _createBubble(this, peopleJSON, project.id);

        					   publicVars.bubble.open(publicVars.map, this);
                               publicVars.lastClickedMarkerID = this.attributes.id;
                            }

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

					for(i in publicVars.relations){
		        		publicVars.projectCoverages.push(new google.maps.Polyline({
		        			'map': publicVars.map,
		        			'strokeOpacity': 1,
		        			'strokeColor': project.themeColor.replace(/-/g, ""),
		        			'strokeWeight': 2,
		        			'path': [publicVars.vertices[ publicVars.relations[i][0] ].latlng, publicVars.vertices[ publicVars.relations[i][1] ].latlng]
		        		}));						
					}
				}

                if(isOverall){
                    for(j in publicVars.peopleMarkers){
                            /*Modify location color*/       
                            var pplCount = 0;
                            var pplBbl = [];
                            for(i=0;i<publicVars.data.people.length;i++){
                                if( [publicVars.data.people[i].latitude, publicVars.data.people[i].longitude].join(",") == publicVars.peopleMarkers[j].getPosition().toUrlValue() ){
                                    pplCount++;
                                    if( publicVars.data.people[i].projects.length == 0){
                                        pplBbl.push( {'group': 'outcasts', 'projects': [], 'title': publicVars.data.people[i].title, 'jobTitle': publicVars.data.people[i].jobTitle, 'institution': (typeof publicVars.data.people[i].institution[0] == 'undefined') ? '' : publicVars.data.people[i].institution[0].title } );
                                    }
                                    else{
                                        if( publicVars.data.people[i].projects.indexOf(project.id) > -1){
                                            pplBbl.push( {'group': 'projectees', 'projects': publicVars.data.people[i].projects.slice(), 'title': publicVars.data.people[i].title, 'jobTitle': publicVars.data.people[i].jobTitle, 'institution': (typeof publicVars.data.people[i].institution[0] == 'undefined') ? '' : publicVars.data.people[i].institution[0].title } );
                                        }
                                    }                        
                                }
                            }
                            if(pplCount > 1){
                                var projectees = [];
                                var outcasts = [];

                                for(i in pplBbl){                        
                                    if( pplBbl[i].group == 'projectees' ){
                                        projectees.push(pplBbl[i]);
                                    }
                                    else if(pplBbl[i].group == 'outcasts')
                                    {
                                        outcasts.push(pplBbl[i]);                            
                                    }
                                }

                                if(outcasts.length > 0){
                                    publicVars.peopleMarkers[j].setOptions({'icon': {'url': 'data:image/svg+xml,' + publicVars.assets.basemarker.split('marker-color-here').join('#000000'),'size': new google.maps.Size(16, 16),'scaledSize': new google.maps.Size(16, 16),'anchor': new google.maps.Point(8, 8)}})
                                }
                            }
                            else
                            {
                                //console.log([publicVars.peopleMarkers[j].attributes.projects.length, publicVars.peopleMarkers[j].attributes.title]);
                                /*Color marker black if the guy is involved in more projects*/
                                if( publicVars.peopleMarkers[j].attributes.projects.length > 1 ){                                    
                                    publicVars.peopleMarkers[j].setOptions({'icon': {'url': 'data:image/svg+xml,' + publicVars.assets.basemarker.split('marker-color-here').join('#000000'),'size': new google.maps.Size(16, 16),'scaledSize': new google.maps.Size(16, 16),'anchor': new google.maps.Point(8, 8)}})
                                }
                            } 
                    }
                }				

        		var ring = calculateConvexHull(latlngs);

        		var path = [];
        		var bounds = new google.maps.LatLngBounds();

        		for(i in ring){
        			bounds.extend(new google.maps.LatLng(ring[i].latitude, ring[i].longitude));
        		}

        		if(setToBounds){
        			if( !bounds.isEmpty() ){
                        google.maps.event.addListenerOnce(publicVars.map, 'bounds_changed', function(){
                            if( publicVars.map.getZoom() == 22){
                                publicVars.map.setZoom(16);
                            }
                        });
        				publicVars.map.fitBounds(bounds);                      
        			}
        		}        		
        	}

            function _createBubbleForOverView(marker){
                if(marker.people.length == 1){
                    console.log(marker.people);
                    if( typeof marker.people[0].institution[0] == 'undefined' ){
                        var institution = '';
                    }
                    else
                    {
                        var institution = '<p style="font-size:12px;margin:0;">' + marker.people[0].institution[0].title + '</p>';
                    }
                    var relatedProject = _getProjectByID(marker.people[0].projects[0]);
                    var projectNames = [];
                    for(a in marker.people[0].projects){
                        var p = _getProjectByID(marker.people[0].projects[a]);
                        projectNames.push('<span style="color: ' + p.themeColor.replace(/-/g, "") + '">' + p.title + '</span>');
                    }
                    var $content = $('<div style="padding:5px;height:auto;overflow:hidden;"><p style="font-size:14px;font-weight:bold;margin:0;">' + marker.people[0].title + '</p><p style="font-size:12px;margin:0;">' + marker.people[0].jobTitle + '</p>' + institution + '<p>' + '[' + projectNames.join(",") + ']' + '</p></div>');
                    publicVars.bubble.setOptions({
                        content: $content.get(0),
                    });
                    publicVars.bubble.open(publicVars.map, marker);              
                }
                else
                {
                    var $content = $('<div style="padding:5px;height:auto;overflow:hidden;"><ul class="a"></ul><ul class="b"></ul></div>');
                    for(u=0;u<marker.people.length;u++){
                        if(marker.people[u].projects.length > 0){
                            var institution = '';
                            if( typeof marker.people[u].institution[0] != 'undefined' ){
                                var institution = marker.people[u].institution[0].title;
                            }
                            var projectNames = [];
                            for(a in marker.people[u].projects){
                                var p = _getProjectByID(marker.people[u].projects[a]);
                                projectNames.push('<span style="color:' + p.themeColor.replace(/-/g, "") + '">' + p.title + '</span>');
                            }                                                        
                            var _template_data = [marker.people[u].title, marker.people[u].jobTitle, institution, '[' + projectNames.join(' ') + ']'];
                            
                            var _templ = [];
                            for(i in _template_data){
                                if(_template_data[i] != '' || typeof _template_data[i] != 'undefined'){
                                    _templ.push(_template_data[i]);
                                }
                            }                            
                            $content.find('ul.a').append( $('<li>' + _template_data.join(' &middot; ') + '</li>') );
                        }
                    }

                    for(h=0;h<marker.people.length;h++){
                        if(marker.people[h].projects.length == 0){
                            var institution = '';
                            if( typeof marker.people[h].institution[0] != 'undefined' ){
                                var institution = marker.people[h].institution[0].title;
                            }                               
                            var template_data = [marker.people[h].title, marker.people[h].jobTitle, institution];
                            var _templ = [];
                            for(i in template_data){
                                if(template_data[i] != '' || typeof template_data[i] != 'undefined'){
                                    _templ.push(template_data[i]);
                                }
                            }                            
                            $content.find('ul.b').append( $('<li>' + template_data.join(' &middot; ') + '</li>') );
                        }
                    }                    
                    publicVars.bubble.setOptions({
                        content: $content.get(0),
                    });
                    publicVars.bubble.open(publicVars.map, marker);                     
                }                                
            }

            function _createBubbleForProjectView(marker, pid){
                var institution = '';
                if( typeof marker.people[0].institution[0] != 'undefined' ){
                    var institution = marker.people[0].institution[0].title;
                }  

                if(marker.people.length > 1){
                    var $content = $('<div style="padding:5px;height:auto;overflow:hidden;"><ul></ul></div>');
                    for(u=0;u<marker.people.length;u++){
                        if(marker.people[u].projects.indexOf(pid) > -1){
                            var projectNames = [];
                            for(a in marker.people[u].projects){
                                var p = _getProjectByID(marker.people[u].projects[a]);
                                projectNames.push('<span style="color:' + p.themeColor.replace(/-/g, "") + '">' + p.title + '</span>');
                            }                          
                            var _template_data = [marker.people[u].title, marker.people[u].jobTitle, institution, '[' + projectNames.join(' ') + ']'];
                            var _templ = [];
                            for(i in _template_data){
                                if(_template_data[i] != '' || typeof _template_data[i] != 'undefined'){
                                    _templ.push(_template_data[i]);
                                }
                            } 
                            $content.find('ul').append( $('<li>' + _template_data.join(' &middot; ') + '</li>') );
                        }
                    }
                }
                else if(marker.people.length == 1)
                {
                    var ps = [];
                    var pk = [];
                    console.log( marker.people[0].projects );
                    for(i in marker.people[0].projects){
                        console.log(marker.people[0].projects[i]);
                        var p = _getProjectByID( marker.people[0].projects[i] );
                        
                        ps.push('<span style="color: '+ p.themeColor.replace(/-/g, "") +'">' + p.title + '</span>');
                        var $content = $('<div style="padding:5px;height:auto;overflow:hidden;"><p style="font-size:14px;font-weight:bold;margin:0;">' + marker.people[0].title + '</p><p style="font-size:12px;margin:0;">' + marker.people[0].jobTitle + '</p>' + institution + '<p>[' + ps.join(', ')+ ']</p></div>');                        
                    }
                    for(i=0;i<marker.people[0].projects.length+1;i++){

                    }
                                            
                }



                //var $content = $('<div style="padding:5px;height:auto;overflow:hidden;"><p style="font-size:14px;font-weight:bold;margin:0;">' + marker.people[0].title + '</p><p style="font-size:12px;margin:0;">' + marker.people[0].jobTitle + '</p>' + institution + '<p>[' + ps.join(', ')+ ']</p></div>');
                publicVars.bubble.setOptions({
                    content: $content.get(0),
                });
                publicVars.bubble.open(publicVars.map, marker);                
            }

            function _displayProjectPeople(projectID){
                var bounds = new google.maps.LatLngBounds();
                publicVars.vertices.length = 0;

               _deleteOverlays();

                /**/

                var latlngs = [];

                /*Collect the distinct locations*/
                for(i=0;i<publicVars.data.people.length;i++){
                    var latlngurl = new google.maps.LatLng(publicVars.data.people[i].latitude, publicVars.data.people[i].longitude).toUrlValue();
                    if(latlngs.indexOf(latlngurl) == -1){
                        latlngs.push(latlngurl);
                    }                    
                }                

                for(j=0;j<latlngs.length;j++){
                    var coordinate_values = latlngs[j].split(",");
                    var marker = new google.maps.Marker({
                        'map': publicVars.map,
                        'position': new google.maps.LatLng(coordinate_values[0], coordinate_values[1]),
                        'latlng_string': new google.maps.LatLng(coordinate_values[0], coordinate_values[1]).toUrlValue(),
                        'people': [],
                        'projectIDs': []
                    });

                    google.maps.event.addListener(marker, 'click', function(){
                        
                            if( publicVars.bubble.isOpen() ){
                                publicVars.bubble.close();

                                /*If the clicked marker is a different marker from the one we have just clicked on before then open a new info bubble*/
                                if(publicVars.lastClickedMarkerID != this.latlng_string){
                                    _createBubbleForProjectView(this, projectID);
                                    publicVars.lastClickedMarkerID = this.latlng_string;                                    
                                }
                            }
                            else
                            {
                                _createBubbleForProjectView(this, projectID);
                               publicVars.lastClickedMarkerID = this.latlng_string;
                            }


                    });
                    
                    publicVars.peopleMarkers.push(marker);
                }

                for(k=0;k<publicVars.data.people.length;k++){
                    var personLocation = new google.maps.LatLng(publicVars.data.people[k].latitude, publicVars.data.people[k].longitude).toUrlValue();
                    var hostMarker = _getMarkerByLatLng(personLocation);
                    hostMarker[0].people.push(publicVars.data.people[k]);
                    for(u in publicVars.data.people[k].projects){
                        hostMarker[0].projectIDs.push( publicVars.data.people[k].projects[u] );
                    }
                }
                /**/

                var p = _getProjectByID(projectID);

                console.log(p);    

                for(i=0;i<publicVars.peopleMarkers.length;i++){
                    if(publicVars.peopleMarkers[i].projectIDs.indexOf(projectID) == -1){
                       publicVars.peopleMarkers[i].setMap(null);   
                    }
                    else
                    {
                        publicVars.peopleMarkers[i].setMap(publicVars.map);
                        publicVars.peopleMarkers[i].setOptions({
                            'icon': {
                                'url': 'data:image/svg+xml,' + publicVars.assets.basemarker.split('marker-color-here').join(p.themeColor.replace(/-/g, "")),
                                'size': new google.maps.Size(16, 16),
                                'scaledSize': new google.maps.Size(16, 16),
                                'anchor': new google.maps.Point(8, 8)                               
                            }}); 
                        bounds.extend(publicVars.peopleMarkers[i].getPosition());
                        publicVars.vertices.push({'latlng': publicVars.peopleMarkers[i].getPosition(), 'id': publicVars.vertices.length});
                    }
                }

                if( !bounds.isEmpty() ){
                    publicVars.map.fitBounds(bounds);
                    if(publicVars.map.getZoom() > 13 ){
                        publicVars.map.setZoom(13);
                    }
                }               


                for(i in publicVars.vertices){
                    connectVertexToAllVertices(publicVars.vertices[i].id);
                }

                for(j=publicVars.connections.length - 1;j>=0;j--){
                    getUniqueConnections(publicVars.connections[j]);
                }                   

                var currentProject = _getProjectByID(projectID);

                for(i in publicVars.relations){
                    publicVars.projectCoverages.push(new google.maps.Polyline({
                        'map': publicVars.map,
                        'strokeOpacity': 1,
                        'strokeColor': currentProject.themeColor.replace(/-/g, ""),
                        'strokeWeight': 2,
                        'path': [publicVars.vertices[ publicVars.relations[i][0] ].latlng, publicVars.vertices[ publicVars.relations[i][1] ].latlng]
                    }));                        
                }

                publicVars.connections.length = 0;
                publicVars.relations.length = 0;
                publicVars.vertices.length = 0;
            }

            function _displayAllPeople(){                
                var bounds = new google.maps.LatLngBounds();
                
                if( typeof publicVars.defaultBounds == 'undefined'){
                    publicVars.defaultBounds = new google.maps.LatLngBounds();
                }

                var latlngs = [];

                /*Collect the distinct locations*/
                for(i=0;i<publicVars.data.people.length;i++){
                    var latlngurl = new google.maps.LatLng(publicVars.data.people[i].latitude, publicVars.data.people[i].longitude).toUrlValue();
                    if(latlngs.indexOf(latlngurl) == -1){                        
                        latlngs.push(latlngurl);
                    }                    
                }                

                for(j=0;j<latlngs.length;j++){
                    var coordinate_values = latlngs[j].split(",");
                    var marker = new google.maps.Marker({
                        'map': publicVars.map,
                        'position': new google.maps.LatLng(coordinate_values[0], coordinate_values[1]),
                        'latlng_string': new google.maps.LatLng(coordinate_values[0], coordinate_values[1]).toUrlValue(),
                        'people': [],
                        'projectIDs': []
                    });

                    google.maps.event.addListener(marker, 'mouseover', function(){
                        console.log(this);
                    });
                    
                    google.maps.event.addListener(marker, 'click', function(){
                        

                            if( publicVars.bubble.isOpen() ){
                                publicVars.bubble.close();

                                /*If the clicked marker is a different marker from the one we have just clicked on before then open a new info bubble*/
                                if(publicVars.lastClickedMarkerID != this.latlng_string){
                                    _createBubbleForOverView(this); 
                                    publicVars.lastClickedMarkerID = this.latlng_string;                                    
                                }
                            }
                            else
                            {
                                _createBubbleForOverView(this); 
                               publicVars.lastClickedMarkerID = this.latlng_string;
                            }



                    });
                    publicVars.peopleMarkers.push(marker);
                }

                for(k=0;k<publicVars.data.people.length;k++){
                    var personLocation = new google.maps.LatLng(publicVars.data.people[k].latitude, publicVars.data.people[k].longitude).toUrlValue();
                    var hostMarker = _getMarkerByLatLng(personLocation);
                    hostMarker[0].people.push(publicVars.data.people[k]);
                    for(u in publicVars.data.people[k].projects){
                        hostMarker[0].projectIDs.push( publicVars.data.people[k].projects[u] );
                    }
                }



                for(l=0;l<publicVars.peopleMarkers.length;l++){                    
                    
                    publicVars.defaultBounds.extend(publicVars.peopleMarkers[l].getPosition());

                    if( publicVars.peopleMarkers[l].people.length > 1 ){

                        var _atOnePlace = [];
                        var _hasNoProjects = 0;

                        for(xy in publicVars.peopleMarkers[l].people){
                            for( xx in publicVars.peopleMarkers[l].people[xy].projects){
                                if(_atOnePlace.indexOf(publicVars.peopleMarkers[l].people[xy].projects[xx]) == -1){
                                    _atOnePlace.push(publicVars.peopleMarkers[l].people[xy].projects[xx]);
                                }
                            }
                        }

                        for(xy in publicVars.peopleMarkers[l].people){
                            if(publicVars.peopleMarkers[l].people[xy].projects.length == 0){
                                 _hasNoProjects++;
                            }
                        }                        

                        if(_atOnePlace.length == 1){
                            var p = _getProjectByID(_atOnePlace[0]);
                            publicVars.peopleMarkers[l].setOptions({'icon': {
                                'url': 'data:image/svg+xml,' + publicVars.assets.basemarker.split('marker-color-here').join(p.themeColor.replace(/-/g, "")),
                                'size': new google.maps.Size(16, 16),
                                'scaledSize': new google.maps.Size(16, 16),
                                'anchor': new google.maps.Point(8, 8)                               
                            }});
                        }
                        else
                        {
                            /*if more people has projects from the same theme change to theme color*/
                            var themeColors = [];
                            for(xy in publicVars.peopleMarkers[l].people){
                                for(z=0;z<publicVars.peopleMarkers[l].people[xy].projects.length;z++){
                                    if(themeColors.indexOf( publicVars.peopleMarkers[l].people[xy].projects[z].themeColor ) == -1 ){
                                        themeColors.push( publicVars.peopleMarkers[l].people[xy].projects[z].themeColor );
                                    }
                                }
                            }  

                            if(themeColors.length == 1){
                                publicVars.peopleMarkers[l].setOptions({'icon': {
                                    'url': 'data:image/svg+xml,' + publicVars.assets.basemarker.split('marker-color-here').join(themeColors[0]),
                                    'size': new google.maps.Size(16, 16),
                                    'scaledSize': new google.maps.Size(16, 16),
                                    'anchor': new google.maps.Point(8, 8)                               
                                }});                                
                            }
                            else
                            {
                                publicVars.peopleMarkers[l].setOptions({'icon': {
                                    'url': 'data:image/svg+xml,' + publicVars.assets.basemarker.split('marker-color-here').join('#000000'),
                                    'size': new google.maps.Size(16, 16),
                                    'scaledSize': new google.maps.Size(16, 16),
                                    'anchor': new google.maps.Point(8, 8)                               
                                }});
                            }                         

                        }

                        if(_hasNoProjects > 0){
                            publicVars.peopleMarkers[l].setOptions({'icon': {
                                'url': 'data:image/svg+xml,' + publicVars.assets.basemarker.split('marker-color-here').join('#000000'),
                                'size': new google.maps.Size(16, 16),
                                'scaledSize': new google.maps.Size(16, 16),
                                'anchor': new google.maps.Point(8, 8)                               
                            }});                            
                        }


                    }
                    else if( publicVars.peopleMarkers[l].people.length == 1 ){
                        /*If there is exactly one person at a given location let's look how many project this person is involved in*/
                        if( publicVars.peopleMarkers[l].people[0].projects.length > 1){
                            /*If the person is active in more than 1 project, turn the dot black*/
                            publicVars.peopleMarkers[l].setOptions({'icon': {
                                'url': 'data:image/svg+xml,' + publicVars.assets.basemarker.split('marker-color-here').join('#000000'),
                                'size': new google.maps.Size(16, 16),
                                'scaledSize': new google.maps.Size(16, 16),
                                'anchor': new google.maps.Point(8, 8)                               
                            }}); 

                            /*De ha ugyanaz a theme akkor szines*/

                            var themeColors = [];

                                for(z=0;z<publicVars.peopleMarkers[l].people[0].projects.length;z++){
                                    var p = projectMap.getProjectByID(publicVars.peopleMarkers[l].people[0].projects[z]);
                                    if(themeColors.indexOf( p.themeColor ) == -1 ){                                        
                                        themeColors.push( p.themeColor );
                                    }
                                }

                            if(themeColors.length == 1){
                                publicVars.peopleMarkers[l].setOptions({'icon': {
                                    'url': 'data:image/svg+xml,' + publicVars.assets.basemarker.split('marker-color-here').join(themeColors[0]),
                                    'size': new google.maps.Size(16, 16),
                                    'scaledSize': new google.maps.Size(16, 16),
                                    'anchor': new google.maps.Point(8, 8)                               
                                }});                                
                            }
                            else
                            {
                                publicVars.peopleMarkers[l].setOptions({'icon': {
                                    'url': 'data:image/svg+xml,' + publicVars.assets.basemarker.split('marker-color-here').join('#000000'),
                                    'size': new google.maps.Size(16, 16),
                                    'scaledSize': new google.maps.Size(16, 16),
                                    'anchor': new google.maps.Point(8, 8)                               
                                }});
                            }                             



                        }
                        else if( publicVars.peopleMarkers[l].people[0].projects.length == 1){
                            /*else, if the only person at the location is active in only one project, color the dot to the project's them color*/
                            var personsProject = _getProjectByID(publicVars.peopleMarkers[l].people[0].projects[0]);
                            publicVars.peopleMarkers[l].setOptions({'icon': {
                                'url': 'data:image/svg+xml,' + publicVars.assets.basemarker.split('marker-color-here').join(personsProject.themeColor.replace(/-/g, "")),
                                'size': new google.maps.Size(16, 16),
                                'scaledSize': new google.maps.Size(16, 16),
                                'anchor': new google.maps.Point(8, 8)                               
                            }});
                        }                        
                    }
                }
                  
                _createCluster();


                return bounds;               
            }

        	function _displayAllProjects(initial){
        		
        		/* Delete all possible overlays from the map */
        		_deleteOverlays();

                if( typeof publicVars.defaultBounds != 'undefined'){
                    if( !publicVars.defaultBounds.isEmpty() ){
                        console.log('Defaulting');
                        publicVars.map.fitBounds(publicVars.defaultBounds);
                    }
                }
        		
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


                _displayAllPeople(); 

                if( initial ){
                    publicVars.map.fitBounds(publicVars.defaultBounds);                 
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
            function _singlePrepareData(){
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

        	return {
            	init: _init,
            	getAllPeople: _getAllPeople, 
            	getAllThemes: _getAllThemes,            	
            	getAllProjects: _getAllProjects,
            	getSingleProject: _getSingleProject,
            	getThemeInfo:_getThemeInfo,
            	setPeople: _setPeople,
                getPeople: _getPeople,
            	setProjects: _setProjects,
                getProjects: _getProjects,
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
                resetLocations: _resetLocations,
                getLanguage: _getLang,
                getProjectByID:_getProjectByID,
                displayProjectPeople: _displayProjectPeople,
                singlePrepareData: _singlePrepareData
        	};
    	})(window, jQuery);