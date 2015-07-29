myUtil={

    delet : function(){
//        import json,httplib
//        var connection = httplib.HTTPSConnection('api.parse.com', 443)
//        connection.connect()
//        connection.request('DELETE', '/1/files/...profile.png', '', {
//            "X-Parse-Application-Id": "${APPLICATION_ID}",
//            "X-Parse-Master-Key": "${MASTER_KEY}"
//        })
//        result = json.loads(connection.getresponse().read())
//        print result


    /**
     *
     *          *

     curl -X DELETE \
     -H "X-Parse-Application-Id: ${APPLICATION_ID}" \
     -H "X-Parse-Master-Key: rBQdXzvfYvYQs0VjF5pULt6OUTsSWRD42TQG1iIP" \
     https://api.parse.com/1/files/heart.jpg

     curl -X DELETE \
     -H "X-Parse-Application-Id: SPKa9SYs7TlVHUjbDDs5uKutjIrtVPLssh58WuTt" \
     -H "X-Parse-Master-Key: rBQdXzvfYvYQs0VjF5pULt6OUTsSWRD42TQG1iIP" \
     https://api.parse.com/1/files/tfss-d0f05315-b3f1-4aff-a40a-971053a8295d-heart.jpg


     http://files.parsetfss.com/7894170c-542c-4a35-8379-36addbfb3a15/tfss-d0f05315-b3f1-4aff-a40a-971053a8295d-heart.jpg



     curl -X DELETE \
     -H "X-Parse-Application-Id: SPKa9SYs7TlVHUjbDDs5uKutjIrtVPLssh58WuTt" \
     -H "X-Parse-Master-Key: rBQdXzvfYvYQs0VjF5pULt6OUTsSWRD42TQG1iIP" \
     http://files.parsetfss.com/7894170c-542c-4a35-8379-36addbfb3a15/tfss-d0f05315-b3f1-4aff-a40a-971053a8295d-heart.jpg


     https://api.parse.com/1/files/heart.jpg
     {"url":"http://files.parsetfss.com/7894170c-542c-4a35-8379-36addbfb3a15/tfss-5f8ac5e4-f72d-4c32-91bf-bd0672218064-heart.jpg",
     "name":"tfss-5f8ac5e4-f72d-4c32-91bf-bd0672218064-heart.jpg"}

     curl -X DELETE \
     -H "X-Parse-Application-Id: SPKa9SYs7TlVHUjbDDs5uKutjIrtVPLssh58WuTt" \
     -H "X-Parse-Master-Key: rBQdXzvfYvYQs0VjF5pULt6OUTsSWRD42TQG1iIP" \
     https://api.parse.com/1/files/tfss-5f8ac5e4-f72d-4c32-91bf-bd0672218064-heart.jpg

     *
     */

},

makeRequest :function () {
    alert("inside makeRequest()");
    var settings = {
        type: "GET",
        url:URL+"?"+REQUEST,
        dataType:"json",
        error: function(XHR,textStatus,errorThrown) {
            alert ("XHR="+XHR+"\ntextStatus="+textStatus+"\nerrorThrown=" + errorThrown);
        },
        success: function(data,textStatus) {
            alert("succes "+data);
            //            $("body").append(data);
        },
        headers: {
            "X-Parse-Application-Id":"SPKa9SYs7TlVHUjbDDs5uKutjIrtVPLssh58WuTt",
            "X-Parse-Master-Key":"rBQdXzvfYvYQs0VjF5pULt6OUTsSWRD42TQG1iIP"
        }
    };
    $.ajax(settings);
}
}