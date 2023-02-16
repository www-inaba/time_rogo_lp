import $ from 'jquery';

$(function () {
    var ua = navigator.userAgent;
    var appVersion = window.navigator.appVersion.toLowerCase();
    // if (ua.indexOf('iPad') > 0 || ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0　|| appVersion.indexOf("msie 7.") != -1) {
    //
    //   $('#movie').remove();
    //   $("a[youtube_id]").on("click", function(){
    //     var play_id = $(this).attr('youtube_id');
    //     $(this).attr({"href": "https://www.youtube.com/embed/" + play_id, "target": "_blank"});
    //   });
    //
    // }
    // else {
    XT.yt.init();
    // }
});

var XT = XT || {};
window.onYouTubeIframeAPIReady = function(){
    XT.yt.onYouTubeIframeAPIReady();
};

XT.yt = {
    init : function(){
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    },

    player: "",

    onYouTubeIframeAPIReady : function(){
        this.player = new YT.Player('iframe_player_api', {
            width: '100%',
            height: '100%',
            playerVars: {
                'modestbranding': 1,
                'autohide': 1,
                'controls': 1,
                'showinfo': 0,
                'rel': 0,
                'wmode': 'transparent'
            },
            events: {
                'onStateChange': this.onPlayerStateChange,
                'onReady': this.onPlayerReady
            }
        });
    },

    onPlayerStateChange : function(e){
        switch (e.data) {
            case YT.PlayerState.ENDED:
                $('body').removeAttr("data-movie-state");

                $('#movie').css({ "transform": "translate(0, -100%)" });
                XT.yt.player.stopVideo();
                break;
            case YT.PlayerState.PLAYING:
                break;
            case YT.PlayerState.PAUSED:
                break;
            case YT.PlayerState.BUFFERING:
                break;
            case YT.PlayerState.CUED:
                break;
        }
    },

    onPlayerReady :function(e){
        $("a[youtube_id]").css({"cursor":"pointer"});

        $("a[youtube_id]").click(function () {
            var play_id = $(this).attr('youtube_id');
            var startSeconds = $(this).attr('start_seconds') || 0;
            XT.yt.player.loadVideoById(play_id, startSeconds);

            $('body').attr("data-movie-state", "play");
            $('.c_movie').css({ "transform": "translate(0, 0)" });
            return false;
        });

        $('.c_movie-closeBtn').click(function () {
            XT.yt.player.stopVideo();

            $('body').removeAttr("data-movie-state");
            $('.c_movie').css({ "transform": "translate(0, -100%)" });
        });
    }
}