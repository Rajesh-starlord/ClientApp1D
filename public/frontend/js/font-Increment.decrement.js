$(document).ready(function () {
    $('#linkIncrease').click(function () {
        modifyFontsize('Increase');
    });
    $('#linkDecrese').click(function () {
        modifyFontsize('Decrese');
    });
    $('#linkCurrentSize').click(function () {
        modifyFontsize('CurrentSize');
    });

    function modifyFontsize(flag) {
        var x = $('p');
        var currentFonntsize = parseInt(x.css('font-size'));
        if (flag == 'Decrese') currentFonntsize -= 1;
        else if (flag == 'Increase') currentFonntsize += 1;
        else if (flag == 'CurrentSize') currentFonntsize = 14;
        x.css('font-size', currentFonntsize);
    }
});