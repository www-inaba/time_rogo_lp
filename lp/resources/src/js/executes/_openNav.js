import $ from 'jquery';

$(function(){
    let isActive = false;
    $('[data-button="hamburger-button"],[data-button-bg="hamburger-button-bg"]').click(function () {
        isActive = !isActive;
        $('body').toggleClass('__isActive');
        $('[data-button-contents="hamburger-button-contents"]').attr('aria-expanded', isActive);
        $('[data-button="hamburger-button"]').attr('aria-expanded', isActive);
        $('[data-button-header="hamburger-button-header"]').attr('aria-expanded', isActive);
        $('[data-button-bg="hamburger-button-bg"]').attr('aria-expanded', isActive);
    });
});