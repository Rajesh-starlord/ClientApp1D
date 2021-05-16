$(document).ready(function () {
    $('.wr-date').datepicker({dateFormat: 'dd/mm/yy', changeMonth: true, changeYear: true});
    $('#r').click(function () {
        $("body").css("background-color", "#c50b0b");
        $("i,h1").css("color", "#fff;");
        $(".active").css("background-color", "#c50b0b");
        $(".box-panel-header,.box-panel-body,.login-form,.caption").css("background-color", "#c50b0b")
        $("#main-footer p").css("color", "#000");
        $("form>.row").css("background-color", "#c50b0b", );
        $(".box-panel-footer").css("background-color", "#c50b0b");
        $("p,a,label").css("color", "#fff");

//        $(".btn-blue").css("background-color", "#FFF", "color", "#000");
//        $(".btn-blue").css("color", "#000");


    });
    $('#g').click(function () {
        $("body").css("background-color", "#197117");
        $("i,h1").css("color", "#fff;");
        $(".active").css("background-color", "#197117");
        $(".box-panel-header,.box-panel-body,.login-form,.caption").css("background-color", "#197117")
        $("#main-footer p").css("color", "#000");
        $("form>.row").css("background-color", "#197117", );
        $(".box-panel-footer").css("background-color", "#197117");
        $("p,a,label").css("color", "#fff");

//        $(".btn-blue").css("background-color", "#FFF", "color", "#000");
//        $(".btn-blue").css("color", "#000");
    });
    $('#b').click(function () {

        $("body").css("background-color", "#10107e");
        $("i,h1").css("color", "#fff;");
        $(".active").css("background-color", "#10107e");
        $(".box-panel-header,.box-panel-body,.login-form,.caption").css("background-color", "#10107e")
        $("#main-footer p").css("color", "#000");
        $("form>.row").css("background-color", "#10107e", );
        $(".box-panel-footer").css("background-color", "#10107e");
        $("p,a,label").css("color", "#fff");

//        $(".btn-blue").css("background-color", "#FFF", "color", "#000");
//        $(".btn-blue").css("color", "#000");

    });

    $('#d').click(function () {

        $("body").css("background-color", "#fff");

//
//        $(".btn-blue").css("background-color", "#87abe9");
//        $(".btn-blue").css("color", "#fff");
        $("p,#news li a").css("color", "#000");
        $(".login-form").css("background-color", "#fff");
        $(".row").css("background-color", "#FFF");

        $("form > .row:nth-child(odd)").css("background-color", "#e5eaf3", );
        $(".box-panel-header,.box-panel-body").css("background-color", "#FFF");
        $("label").css("color", "#000");
        $(".box-panel-footer").css("background-color", "#e5eaf3");
        $(".caption").css("background-color", "#FFF");
        $("i,h1").css("color", "#000;");
        $(".caption h1 i").css("color", "#6897e7;");
        $("#news li i").css("color", "#f2a00b;");

        $(".imp-links>.container>.row").css("background-color", "#333232;");
        $("#accessbility>.container>.row").css("background-color", "#393636;");

        $("h1#notification,h1#notification i").css("color", "#f00;");
        $("h1#depWelcome,h1#depWelcome i").css("color", "#6897e7;");
        $("h1#loginPanel,h1#loginPanel i").css("color", "#409c36;");

        $(".row").css("background-color", "transparent");


    });

    $('#dropDown').click(function () {
        $('.dropDown').toggle(1000);
    });

    $('#allocation').click(function () {
        $('#ifAllocation').show();
        $('#if_Fase_Allocation').hide();
    });
    $('#phaseAllocation').click(function () {
        $('#if_Fase_Allocation').show();
        $('#ifAllocation').hide();
    });


//****************************modal-1****************************
    var modal = document.getElementById('simple-modal');
    var modalBtn = document.getElementById('btn_modal'); 
    //var modalBtn = document.getElementById('PhaseCloseBtn'); 
    var closeBtn = document.getElementsByClassName('modal-close')[1];
   
    function OpenModal() {
        modal.style.display = 'block';
    }
    function CloseModal() {
        modal.style.display = 'none';
    }
    function OutSideClick(e) {
        if (e.target == modal)
            modal.style.display = 'none';
    }
    modalBtn.addEventListener('click', OpenModal);
    closeBtn.addEventListener('click', CloseModal);
    window.addEventListener('click', OutSideClick);
    //****************************modal-1****************************
    var openModal = document.getElementById('AllocationModal');
    var clickBtn = document.getElementById('AllocationEditBtnClick');
    var CloseBtn = document.getElementById('AllocationCloseBtn');
    clickBtn.addEventListener('click', AlloOpenModal);
    CloseBtn.addEventListener('click', AlloCloseModal);
    window.addEventListener('click', AlloOutSideClick);
    function AlloOpenModal() {
        //debugger;
        openModal.style.display = "block";
    }
    function AlloCloseModal() {
        openModal.style.display = "none";
    }
    function AlloOutSideClick(e) {
        if (e.target == openModal)
            openModal.style.display = 'none';
    }

    //****************************modal-3****************************

    var AddPhmodal = document.getElementById('AddPh-modal');
   // var modalBtn = document.getElementById('btn_modal');
    //var modalBtn = document.getElementById('PhaseCloseBtn'); 
    var AddPhcloseBtn = document.getElementById('NewPhaseCloseBtn');

    function OpenModal1() {
        AddPhmodal.style.display = 'block';
    }
    function CloseModal1() {
        AddPhmodal.style.display = 'none';
    }
    function OutSideClick1(e) {
        if (e.target == AddPhmodal)
            AddPhmodal.style.display = 'none';
    }
    //modalBtn.addEventListener('click', OpenModal);
    AddPhcloseBtn.addEventListener('click', CloseModal1);
    window.addEventListener('click', OutSideClick1);


});

$(document).ready(function () {
    $('.sub-nav').click(function () {
        $(this).toggleClass('tap');
    });
})
//tab js
$(function () {
    $("#tabs").tabs();
});