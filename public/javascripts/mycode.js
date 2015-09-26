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
});