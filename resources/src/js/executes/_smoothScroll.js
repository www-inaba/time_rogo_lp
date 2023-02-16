import $ from 'jquery';

$(function(){

    var headerHight = 140;
    var urlHash = location.hash;
    if(urlHash) {
        $('body,html').stop().scrollTop(0);
        setTimeout(function () {
            scrollToAnker(urlHash) ;
        }, 100);
    }

    $('a[href^="#"]').click(function() {
        var href= $(this).attr("href");
        var hash = href == "#" || href == "" ? 'html' : href;
        scrollToAnker(hash);
        return false;
    });

    function scrollToAnker(hash) {
        var target = $(hash);
        var position = target.offset().top-headerHight;
        $('body,html').stop().animate({scrollTop:position}, 1000);
    }

    //topBack
    var topBtn = $('[data-button="scroll-button"]');
    topBtn.click(function () {
        $('[data-wrapper="scroll"]').animate({
            scrollTop: 0
        }, 800);
        return false;
    });

});