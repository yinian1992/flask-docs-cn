$(document).ready(function(){
    $('p, li, td').html(function(){return $(this).html().replace(/([\u4E00-\u9FFF])\s([\u4E00-\u9FFF])/g, "$1$2")})
})