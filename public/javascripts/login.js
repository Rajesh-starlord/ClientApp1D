//var {encryptsha256,sha256} = require('../frontend/Scripts/sha256');
$(document).ready(function(){
    $("#submit").on("click",function(){
        event.preventDefault();
        submit();
    })
})

function submit(){
    var data = {};
    data.UserID = $("#UserID").val();
    data.Password = encryptsha256($("#Password").val());
    data._csrf = $("#csrf").val();
    $.ajax({
        url:"/login",
        method:"POST",
        data:data,
        success:function(res){
            //console.log(res)
            if(res.message == "success"){
                 window.location.href=res.url;
            }else{
                $("#msg").html(res.message);
            }
        },
        error:function(err){
            console.log(err)
           // location.reload();
        }
    })
}
