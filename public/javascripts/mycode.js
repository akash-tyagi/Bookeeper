$(document).ready(function() {
    if($('tr').length > 0) {
        var firstID = $('tr')[1].getElementsByTagName('td')[0].innerHTML
        var lastID = $('tr')[$('tr').length -1].getElementsByTagName('td')[0].innerHTML
        var type = "read"
        if ($('h1').text() == 'Books To Be Read') {
                type = "unread"
            } 
        $('li.next a').attr("href", "/books/"+type+"?lastID="+lastID)
        $('li.previous a').attr("href", "/books/"+type+"?firstID="+firstID)
    }
    
    $( "#bookSearch" ).submit(function( event ) {
        if ($("#bookSearch [name=end]").val() != '' && 
            $("#bookSearch [name=start]").val() == ''){
                alert( "Please provide start year for using range." );
                return false
            }
        var end = $("#bookSearch [name=end]").val();
        if (end != '' && $.isNumeric(end) != true){
                alert( "Please enter numeric value for END YEAR." );
                return false
            }
        var start = $("#bookSearch [name=start]").val();
        if (start != '' && $.isNumeric(start) != true){
                alert( "Please enter numeric value for START YEAR." );
                return false
            }
        return true;
    });
    
    $( "#createBook" ).submit(function( event ) {
        var pubYear = $("#createBook [name=published]").val();
        if ($.isNumeric(pubYear) != true || pubYear.toString().length != 4){
                alert( "Please enter numeric value for Publishing Year." );
                return false
            }
        return true;
    });
    
     $( "#updateBook" ).submit(function( event ) {
        var pubYear = $("#updateBook [name=published]").val();
        if ($.isNumeric(pubYear) != true || pubYear.toString().length != 4){
                alert( "Please enter numeric value for Publishing Year." );
                return false
            }
        return true;
    });
    
    if($('#status') != []){
        $('#status').val($('#status').attr('value'));
    }
});