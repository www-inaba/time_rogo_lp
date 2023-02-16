import $ from 'jquery';

$(function(){
    $(window).on("scroll", function(){
        $(".c_header").css("left", -$(window).scrollLeft());
    });
});