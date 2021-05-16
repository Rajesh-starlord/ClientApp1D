$(document).ready(()=>{
  if($('#indStatus').val() == 'Activate'){
    console.log('Activate');
    GetExec_Eng();
    getWsourceOfIndustry();
    $("#div_cap").on('click',()=>{getCaptcha()});
    getCaptcha();
  }
})

//get captcha code
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

/*====================================================================================================================/
                                              MODULE:ONLINE PAYMENT
/*===================================================================================================================*/
/*--------------------------------------------------/
    FUNCTION:MAKE PAYMENT
/--------------------------------------------------*/

//get watersource of an industry
function getWsourceOfIndustry(){
  let industry = $('#industry').val();
  $.ajax({
    url:'/waterresource/common-getWsourceOfIndustry?industry='+industry,
    method:'get',
    contentType:'application/json',
    async:false,
    success:function(res){
      console.log(res)
      let length = res.length;
      let op = '<option value=\"\">---Select---</option>';
      for(let i = 0;i<length;i++){
        op+= '<option value=\"'+res[i].source_cd+'\">'+res[i].watersource+'</option>';
      }
      $("#ddlPaymentTowards").html('');
      $("#ddlPaymentTowards").append(op);
      //ng-options="dt.Water_sourceId as dt.Water_Resource for dt in Lstsource  track by dt.Water_sourceId"
    },
    error:function(err){
      console.log(err);
    }
  })
}

//get waterpurpose of an industry
function SourceWisepurposedtls(){
  let industry = $('#industry').val();
  let source = $('#ddlPaymentTowards').val();
  $.ajax({
    url:'/waterresource/common-getWaterPurposeOfIndustry?industry='+industry+'&source_cd='+source,
    method:'get',
    contentType:'application/json',
    async:false,
    success:function(res){
      console.log(res)
      let length = res.length;
      let op = '<option value=\"\">---Select---</option>';
      for(let i = 0;i<length;i++){
        op+= '<option value=\"'+res[i].purpose_cd+'\">'+res[i].purposedesc+'</option>';
      }
      //ng-options="dt_ws.Purpose_CD as dt_ws.PurposeDesc for dt_ws in listofpurpose track by dt_ws.Purpose_CD"
      $("#wPurpose").html('');
      $("#wPurpose").append(op);
    },
    error:function(err){
      console.log(err);
    }
  })
}

//get executive engineer details
function GetExec_Eng() {
  $.ajax({
      url: 'e-payment-ExEngDetails',
      method: "GET",
      datatype: 'json',
      success:function(res) {
        if(res.message == 'success'){
            $('#divisionname').html(res.body.ee_name);
            $('#acchead').val(res.body.acchead);
        }else{
          console.log(res.message);
        }
      },
      error:function(err) {
        console.log(err);
      }
    });
}

//industry treasery transaction details save
function Ins_Trs_Transaction() {
  if($('#amount').val()!='undefined' && parseInt($('#amount').val()) !=0 ){
    var paydata  = {
      division:$('#division').val(),
      acchead:$('#acchead').val(),
      amount:parseFloat($('#amount').val()),
      payment_towards:$("#ddlPaymentTowards").val(),
      purpose:$('#wPurpose').val(),
      captcha:$('#captcha').val(),
      _csrf:$('#csrf').val()
    }
    console.log(paydata);

    $.ajax({
        url: 'e-payment',
        method: "POST",
        datatype: 'json',
        data:paydata,
        success:function(res) {
          if(res.message == 'success'){
            swal({
              text:'Payment Success',
              type:'success'
            })
          }else{
            console.log(res.message);
            swal({
              text:res.message,
              type:'warning'
            })
          }
        },
        error:function(err) {
          console.log(err);
        }
      });
  }
}
