$(document).ready(function() {

    var database = firebase.database();
    var userid = location.search.split('=')[1];
    firebase.auth().signInAnonymously().catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
    });

    function fetchFreshData() {
        firebase.database().ref('/bookmarks/').once('value').then(function(snapshot) {
            var contents = snapshot.val();
            for (key in contents) {
               // console.log(JSON.parse(contents[key]))
                insertIntoToPage(JSON.parse(contents[key]).html, key);
            }
        });
    }

    function insertIntoToPage(content, key) {
        if (!$('#' + key).length) {
            var li = $(document.createElement('li'));
            li.attr('id', key);
            li.addClass("list-group-item");
            li.addClass("bookmarks-items");
            li.html(content);
            $('#mybookmarks').prepend(li)
        }
    }

    function buildLinkHTML(content) {
        // <div class="media">
        //     <div class="media-body">
        //         <h5 class="mt-0 mb-1"><a href="">Media object</a></h5> Cras sit amet nibh li
        //     </div>
        //     <div class="thumbnail-img ml-3" class="" style="background-image:url('ss')"></div>
        // </div>
        var anchor = '<a href="' + content.link + '" target="_blank">' + content.title + '</a>';
        var description = content.description;
        var thumbnail = '<div class="thumbnail-img ml-3" class="" style="background-image:url(\'' + content.thumbnail + '\')"></div>'
        var html = '<div class="media"><div class="media-body"><h5 class="mt-0 mb-1">';
        html += anchor;
        html += '</h5>';
        html += description;
        html += '</div>';
        html += thumbnail;
        html += '</div>';
        return html;
    }

    function isUrl(s) {
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
        return regexp.test(s);
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
    $('#summernote').summernote({
        tabsize: 4,
        height: 200,
        dialogsInBody: true,
        toolbar: [
            ['insert', ['link', 'picture', 'video', 'hr']]
        ]
    });

    function saveData(content) {
        var id = (new Date).getTime();
        firebase.database().ref('bookmarks/' + id).set(JSON.stringify({
            html: content
        }));
        fetchFreshData();
    }

    $('#save_changes').click(function() {
        var htmlValue = $('#summernote').summernote('code');
        var cleanText = $("#summernote").summernote('code').replace(/<\/?[^>]+(>|$)/g, "");

        if (isUrl(cleanText)) {
            var url = cleanText;
            var urlEncoded = encodeURIComponent(url);
            var apiKey = '5b40e6a9131e15f60c6d2aac'; // <-- Replace with your AppId
            // The entire request is just a simple get request with optional query parameters
            var requestUrl = 'https://opengraph.io/api/1.1/site/' + urlEncoded + '?app_id=' + apiKey;
            $.getJSON(requestUrl, function(json) {
                //console.log('json', json);
                saveData(buildLinkHTML({
                    'link': cleanText,
                    'title': json.hybridGraph.title,
                    "description": json.hybridGraph.description,
                    "thumbnail": json.hybridGraph.image
                }), 'link');
            });
        } else {
            saveData(htmlValue, 'others')
        }
        fetchFreshData();
        $('#summernote').summernote('reset');
        $('#close_button').click()
    });

    $('#search').bind('keyup', function() {
        var searchString = $(this).val();
        $("#mybookmarks li").each(function(index, value) {
            currentName = $(value).text()
            if (currentName.toUpperCase().indexOf(searchString.toUpperCase()) > -1) {
                $(value).show();
            } else {
                $(value).hide();
            }
        });
    });

});