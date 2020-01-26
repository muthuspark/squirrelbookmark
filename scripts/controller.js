var app = angular.module('myApp', ['summernote', 'selectize']);

app.controller('myCtrl', function($scope) {

	var database = firebase.database();
	var userid = location.search.split('=')[1];
	firebase.auth().signInAnonymously().catch(function(error) {
	    var errorCode = error.code;
	    var errorMessage = error.message;
	});

	function fetchFreshData(){
		$scope.articles = [];
		var tags = [];
		firebase.database().ref('/bookmarks/').once('value').then(function(snapshot) {
	        var contents = snapshot.val();
	        for (key in contents) {
	        	content = contents[key];
	        	if(content.type) {
	        		tags = tags.concat(content.tags);
	        		content['show'] = true;
	        		$scope.articles.push(content);	
	        	}
	        }
	        tags = [...new Set(tags)];
	        tag_options = []
	        for (i in tags) {
				if(!tag_options[tags[i]]){
					tag_options.push({
						'id': tags[i],
						'title': tags[i]
					});
				}
	        }
	        $scope.articles.reverse();
	        $('#tags')[0].selectize.addOption(tag_options);
	        $scope.$apply();
	    });

	}
	    
    var authFlag = false;
    firebase.auth().onAuthStateChanged(function(user) {
        if (user && !authFlag) {
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            authFlag = true;
            fetchFreshData();
        } else {
            //some error
        }
    });

    $scope.supported_types = [
	  {id: CONSTANTS.VIDEO, title: CONSTANTS.VIDEO},
	  {id: CONSTANTS.ARTICLE, title: CONSTANTS.ARTICLE},
	  {id: CONSTANTS.TOOL, title: CONSTANTS.TOOL},
	  {id: CONSTANTS.PERSON, title: CONSTANTS.PERSON},
	  {id: CONSTANTS.IMAGE, title: CONSTANTS.IMAGE},
	  {id: CONSTANTS.KNOWLEDGE, title: CONSTANTS.KNOWLEDGE},
	  {id: CONSTANTS.ALGORITHMS, title: CONSTANTS.ALGORITHMS},
	  {id: CONSTANTS.BOOKS, title: CONSTANTS.BOOKS}
	];

	$scope.supported_types_config = {
	  create: false,
	  valueField: 'id',
	  labelField: 'title',
	  delimiter: '|',
	  placeholder: 'Pick Type',
	  maxItems: 1
	};

	$scope.tags_config = {
	  create: true,
	  valueField: 'id',
	  labelField: 'title',
	  delimiter: '|',
	  placeholder: 'Tags',
	  //maxItems: 1
	};

    $scope.bookmark = {
    	'id' : '',
    	'url':'',
    	'title': '',
    	'thumbnail': '',
    	'content':'',
    	'tags':[],
    	'type':'',
    	'description':'',
    	'read_status' : false
    }

    $scope.options = {
        tabsize: 4,
        height: 200,
        dialogsInBody: true,
        toolbar: [
        	['headline', ['style']],
            ['insert', ['link', 'picture', 'video', 'hr']]
        ]
    };

    function saveBookmark() {
        firebase.database().ref('bookmarks/' + $scope.bookmark.id).set($scope.bookmark);
        fetchFreshData();
    }

    $scope.save_changes = function(){

    	if($scope.edit_mode){
    		$scope.edit_mode = false;//reset it.
    		firebase.database().ref('bookmarks/' + $scope.bookmark.id).update($scope.bookmark);
        	fetchFreshData();
    	}

    	if($scope.bookmark.url){
    		// this is a link
			var urlEncoded = encodeURIComponent($scope.bookmark.url);
	        var requestUrl = 'https://opengraph.io/api/1.1/site/' + urlEncoded + '?app_id=' + apiKey;
	        $.getJSON(requestUrl, function(json) {
	            $scope.bookmark.title = $scope.bookmark.title || json.hybridGraph.title;
                $scope.bookmark.description = $scope.bookmark.description || json.hybridGraph.description;
                $scope.bookmark.thumbnail = json.hybridGraph.image;
	            console.log($scope.bookmark);
	            saveBookmark();
	        });
    	} else {
    		//this is just some copy pasted text content
			saveBookmark();
    	}
    	$('#close_button').click();
    }

    $scope.summernote_open = function(){
    	$scope.bookmark = {
    		'id' : (new Date).getTime(),
	    	'url':'',
	    	'title': '',
	    	'thumbnail': '',
	    	'content':'',
	    	'tags':[],
	    	'type':'',
	    	'description':'',
	    	'read_status' : false
	    }
    }

    $scope.selectedType = function(title){
    	$scope.selected_type = title;
    }

    $scope.searching = function() {
    	for(article_index in $scope.articles) {
    		article = $scope.articles[article_index];
    		$scope.articles[article_index].show = !(article.title.toLowerCase().indexOf($scope.search_text.toLowerCase()) == -1 && article.description.toLowerCase().indexOf($scope.search_text.toLowerCase()) == -1);
    	}
    }

    $scope.show_preview = function(article){
    	if(article.type == CONSTANTS.ALGORITHMS || article.type == CONSTANTS.KNOWLEDGE || article.type == CONSTANTS.IMAGE) {
    		$scope.preview = article;
    		$("#preview").modal('show');
    	}
    }

    $scope.edit = function(article){
    	$scope.bookmark = article;
    	$scope.edit_mode = true;
    	$('#summernote_modal').modal('show');
    }


    $scope.remove = function(id) {
    	firebase.database().ref('bookmarks/' + id).remove();
    	fetchFreshData();
    }

});

app.filter('unsafe', function($sce) { return $sce.trustAsHtml; });