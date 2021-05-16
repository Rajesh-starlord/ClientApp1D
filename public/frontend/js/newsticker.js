var interval;


function startTicker() {
    $("#news li:first").slideUp(function () {
        $(this).appendTo($("#news")).slideDown();

    });
}
interval = setInterval(startTicker, 2000);

function stopTicker() {

    clearInterval()
}

