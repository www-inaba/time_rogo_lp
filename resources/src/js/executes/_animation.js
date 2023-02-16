import Animation from './../modules/_Animation';
import $ from 'jquery';

$(function(){
  
  new Animation({
    '$element': $("[data-anime='addClass']"),
    'mode': 'addClass',
  });
  new Animation({
    '$element': $("[data-anime='infinite']"),
    'mode': 'infinite'
  });
  new Animation({
    '$element': $("[data-anime='parallax']"),
    'mode': 'parallax',
    'direction': 'up'
  });
  
})