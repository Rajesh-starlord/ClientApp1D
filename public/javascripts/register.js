
$(document).ready(function(){
    getCaptcha();
    $("canvas").css('background-color','skyblue');
    $("#div_cap").on('click',()=>{getCaptcha()});
    $("#submit").on("click",function(){
        event.preventDefault();
        register();
    })
})

function validateAndMsg(arr) {
  var status = true;
  arr.forEach((id, i) => {
    if($('#'+id).val() == '' || $('#'+id).val() == null){
      let msg = '<span style="color: red">This is a required field.</span>';
      if(!($('#'+id).next()).is('span')){
        $('#'+id).after(msg);
      }
      status = false;
      let ar = [id];
      if($('#'+id).is('input')){
        $('#'+id).keyup(()=>{
          validateAndMsg(ar)
        })
      }else if($('#'+id).hasClass('wr-date')){
        console.log('called');
        $('#'+id).onfocus(()=>{
          validateAndMsg(ar)
        })
      }else{
        $('#'+id).on('click',()=>{
          validateAndMsg(ar)
        })
      }
    }else{
      if(($('#'+id).next()).is('span')){
        $('#'+id).next("span").remove();
      }
    }
  });
  return status;
}

/*==================================================================================================================
====================================================================================================================*/

var captcha = "";
function getCaptcha(){
     $.ajax({
        url:"/getCaptcha",
        method:"get",
        async:false,
        success:function(res){
            if($("canvas").length == 0){
                var canv = document.createElement("canvas");
                canv.id = "captcha";
                canv.width = 100;
                canv.height = 40;
                var ctx = canv.getContext("2d");
                ctx.font = "20px Arial";
                ctx.fillStyle = "blue";
                ctx.textAlign = "center";
                ctx.strokeText(res.captcha,50,30);
                $("#div_cap").html('');
                $("#div_cap").append(canv);
            }else{
                $("#div_cap").html('');
                var canv = document.createElement("canvas");
                canv.id = "captcha";
                canv.width = 100;
                canv.height = 40;
                var ctx = canv.getContext("2d");
                ctx.font = "20px Verdana";
                ctx.fillStyle = "blue";
                ctx.textAlign = "center";
                ctx.strokeText(res.captcha,50,30);
                $("#div_cap").append(canv);
            }
            captcha=res.captcha;
        },
        error:function(err){
            console.log(err)
           //location.reload();
        }
    })

}

function BindIndName() {
  let division = $('#exeng').val();
  if(division){
    $('#industry').html('');
    $.ajax({
        url:"/waterresource/common-getIndOfDiv?division="+division,
        method:"get",
        success:function(res){
            if(res.body.length>0){
              let op = '<option value="">--Select--</option>';
              res.body.forEach((item, i) => {
                op+= '<option  value="'+item.industry_code+'">'+item.industryname+'</option>';
              });
              $('#industry').append(op);
            }
        },
        error:function(err){
          console.log(err)
        }
    })
  }
}

function BindDistrict() {
  $('#dist').html('');
  $.ajax({
      url:"/waterresource/common-getDist",
      method:"get",
      success:function(res){
          if(res.body.length>0){
            let op = '<option value="">--Select--</option>';
            res.body.forEach((item, i) => {
              op+= '<option  value="'+item.districtid+'">'+item.districtname+'</option>';
            });
            $('#dist').append(op);
          }
      },
      error:function(err){
        console.log(err)
      }
  })
}

function register(){
    var arr = ['exeng','industry','dist','mobile','email','userId','password','cnfpassword','captcha'];
    var status = validateAndMsg(arr);

    var data = {
      exeng: $("#exeng").val(),
      industry: $("#industry").val(),
      dist: $("#dist").val(),
      mobile: $("#mobile").val(),
      pan: $("#pan").val()!=''?encryptsha256($("#pan").val()):'',
      email: $("#email").val(),
      userId : $("#userId").val(),
      password : $("#password").val()!=''?encryptsha256($("#password").val()):'',
      cnfpassword: $("#cnfpassword").val()!=''?encryptsha256($("#cnfpassword").val()):'',
      captcha : $("#captcha").val(),
      _csrf : $("#csrf").val()
    }
    console.log(data);
    if(status){
      $.ajax({
          url:"/register",
          method:"POST",
          data:data,
          success:function(res){
              console.log(res)
              if(res.message == "success"){
                  swal.fire({
                    title:'Done',
                    text:'Registration Successfull',
                    type:'success'
                  }).then(value=>location.reload());
                  //alert('Registration Successfull')
              }else{
                swal.fire({
                  text:res.message,
                  type:'warning'
                });
                //alert(res.message)
                $("#cap").val('');
                $("#msg").html(res.message);
                getCaptcha();
              }
          },
          error:function(err){
              console.log(err)
             // location.reload();
          }
      })
    }
}
