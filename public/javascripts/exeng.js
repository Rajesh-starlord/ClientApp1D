//on document ready function
$(document).ready(()=>{
  $('.wr-date').datepicker({dateFormat: 'dd/mm/yy', changeMonth: true, changeYear: true});
  //tables
  $('#targetTbl').hide();
  $('#tgtSaveBtn').hide();
  $('#divwisetargetTbl').hide();
  $('#defMetrTbl').hide();
  $('#slidedown').hide();
})

//special Charecter validate
function checkSpecialChar(str){
  var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  return format.test(str)?true:false;
}

//blank validation
function validate(arr){
  var status = true;
  arr.forEach((id, i) => {
    if(status){
      if($('#'+id).val() == '' || $('#'+id).val() == null){
        var label = $("label[for='" +id+ "']").html();
        //console.log(label)
        if(label.includes(':')){
          label = label.split(':')[0];
        }
        swal('Require '+label)
        status = false;
        return ;
      }
    }
  });
  return status;
}

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

function FromJSONDate(date) {
  var newdate = '';
  if(date){
     newdate =  date.split('T')[0];
  }
  return newdate.replaceAll('-','/');
}

//-----------------------------------common requirement ---------------------------------------------//
//get watersource of an industry
function getWsourceOfIndustry(){
  $('#defMetrTbl tbody').html('');
  $('#defMetrTbl').hide();
  $('#slidedown').hide();
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
      $("#wsource").html('');
      $("#wsource").append(op);
    },
    error:function(err){
      console.log(err);
    }
  })
}

//get waterpurpose of an industry
function SourceWisepurposedtls(){
  $('#defMetrTbl tbody').html('');
  $('#defMetrTbl').hide();
  $('#slidedown').hide();
  let industry = $('#industry').val();
  let source = $('#wsource').val();
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
      $("#wPurpose").html('');
      $("#wPurpose").append(op);
    },
    error:function(err){
      console.log(err);
    }
  })
}


function getWaterPurpose(){
  $('#defMetrTbl tbody').html('');
  $('#defMetrTbl').hide();
  $('#slidedown').hide();
  let wsource = $('#wsource').val();
  $.ajax({
    url:'/waterresource/common-getWaterPurpose?wsource='+wsource,
    method:'get',
    contentType:'application/json',
    async:false,
    success:function(res){
      let length = res.length;
      let op = '<option value=\"\">---Select---</option>';
      for(let i = 0;i<length;i++){
        op+= '<option value=\"'+res[i].purpose_cd+'\">'+res[i].purposedesc+'</option>';
      }
      $("#wPurpose").html('');
      $("#wPurpose").append(op);
    },
    error:function(err){
      console.log(err);
    }
  })
}

function getBasin(){
  //let purpose_cd = $('#wPurpose').val();
  $.ajax({
    url:'/waterresource/common-getBasin',
    method:'get',
    contentType:'application/json',
    async:false,
    success:function(res){
      let length = res.length;
      let op = '<option value=\"\">---Select---</option>';
      for(let i = 0;i<length;i++){
        op+= '<option value=\"'+res[i].basinid+'\">'+res[i].basinname+'</option>';
      }
      $("#basin").html('');
      $("#basin").append(op);
    },
    error:function(err){
      console.log(err);
    }
  })
}

function getRiver(){
  let basinid = $('#basin').val();
  $.ajax({
    url:'/waterresource/common-getRiver?basinid='+basinid,
    method:'get',
    contentType:'application/json',
    async:false,
    success:function(res){
      let length = res.length;
      let op = '<option value=\"\">---Select---</option>';
      for(let i = 0;i<length;i++){
        op+= '<option value=\"'+res[i].riverid+'\">'+res[i].rivername+'</option>';
      }
      $("#river").html('');
      $("#river").append(op);
    },
    error:function(err){
      console.log(err);
    }
  })
}

function getDam(){
  let basinid = $('#basin').val();
  $.ajax({
    url:'/waterresource/common-getDam?basinid='+basinid,
    method:'get',
    contentType:'application/json',
    async:false,
    success:function(res){
      let length = res.length;
      let op = '<option value=\"\">---Select---</option>';
      for(let i = 0;i<length;i++){
        op+= '<option value=\"'+res[i].damid+'\">'+res[i].damname+'</option>';
      }
      $("#dam").html('');
      $("#dam").append(op);
    },
    error:function(err){
      console.log(err);
    }
  })
}


/*===================================================================================================================/
                                            METER
=====================================================================================================================*/
/*------------------------------------------/
  FUNCTION:METER ENTRY
/-------------------------------------------*/
function MeterEntry() {
  var arr = ['industry','wsource','wPurpose']
  var status = validateAndMsg(arr);
  if(status){
    $('#MeterEntryForm').submit();
  }
}

function EditMeter(index) {
  $("#sendbtn").val('Update');

  var data = {};
  index = (parseInt(index)+1);
  var position = '#MeterDetlTbl tbody tr:nth-child('+index+') td:first';
  data.MeterId = $(position).find('#MeterId').val();
  data.IndustryID = $(position).find('#IndustryID').val();
  data.UnitId = $(position).find('#UnitId').val();
  data.watersourceID = $(position).find('#watersourceID').val();
  data.BasinId = $(position).find('#BasinId').val();
  data.RiverId = $(position).find('#RiverId').val();
  data.DamId = $(position).find('#DamId').val();
  data.purposeId = $(position).find('#purposeId').val();
  //console.log(data);
  //set edit values
  var loc = '#MeterDetlTbl tbody tr:nth-child('+index+')';
  $('#meterid').val(data.MeterId);
  $('#industry').val(data.IndustryID);
  $('#unitval').val(data.UnitId);
  $('#wsource').val(data.watersourceID);
  getWaterPurpose();
  $('#make').val($(loc+' td:nth-child(7)').find('span').html());
  $('#serialno').val($(loc+' td:nth-child(8)').find('span').html());
  $('#MaxDigit').val($(loc+' td:nth-child(9)').find('span').html());
  $('#DateOfCommissioning').val($(loc+' td:nth-child(10)').find('span').html());
  $('#SealDate').val($(loc+' td:nth-child(12)').find('span').html());
  $('#DateOfCalibration').val($(loc+' td:nth-child(11)').find('span').html());
  $('#InitialInspectionDate').val($(loc+' td:nth-child(13)').find('span').html());

  $('#wPurpose').val(data.purposeId);
  getBasin();
  $('#basin').val(data.BasinId);
  getRiver();
  $('#river').val(data.RiverId);
  getDam();
  $('#dam').val(data.DamId);

}

function resetMeterId() {
  $('#meterid').val('');
  $("#sendbtn").val('Send');
}

/*------------------------------------------/
  FUNCTION:ARREAR ENTRY
/-------------------------------------------*/
function SubmitArrearEntry(){
  var arr = ['industry','wsource','wPurpose']
  //'pma','Intrest','Penalty','commitmentcharges'];
  var status = validateAndMsg(arr);
  if(status){
    $('#ArrearEntryForm').submit();
  }
}

/*------------------------------------------/
  FUNCTION:CHALLAN ENTRY
/-------------------------------------------*/
//challanentry
function SaveChallanEntry() {
  var arr = ['industry','wsource','wPurpose','month','financial_Year',
  'Challan_Number','Challan_Date','Challan_Amount','remarks']
  var status = validateAndMsg(arr);
  if(status){
    $('#ChallanForm').submit();
  }
}

/*------------------------------------------/
  FUNCTION:BACKLOG METER ENTRY
/-------------------------------------------*/
//getMeterUnit
function getMeterUnit(){
  var industry = $('#industry').val();
  $.ajax({
    url:'backlogmeterreading-getMeterUnit?industry='+industry,
    method:'get',
    success:function(res){
      console.log(res)
      $('#meterUnit').html('');
      $('#meterUnit').append('<option>--select--</option>');
      res.body.forEach((data, i) => {
        var op = '<option value="'+data.meterid+'">'+data.unit_name+'</option>';
        $('#meterUnit').append(op);
      });
    },
    error:function (err) {
      console.error(err);
    }
  })
}

//getbacklogmeterReading
function getBackLogMeterReading(){
  var industry = $('#industry').val();
  var unit = $('#meterUnit').val();
  $.ajax({
    url:'backlogmeterreading-getData?industry='+industry+'&unit='+unit,
    method:'get',
    success:function(res){
      console.log(res)
      $('#backlogTable tbody').html('');
      res.body.forEach((data, i) => {
        var tr = '<tr>'+
                    '<td><input type="hidden" value="{{MR.month_cd}}" /><strong> {{MR.month}}</strong></td>'+
                    '<td><strong> {{MR.year}}</strong></td>'+
                    '<td>'+
                        '<input type="text" id="inreading" ng-model="MR.initial_reading" numbers-only name="inr" required="required" />'+
                    '</td>'+
                    '<td>'+
                        '<input type="text" id="freading" ng-model="MR.final_reading" numbers-only name="fnr" required="required" />'+
                    '</td>'+
                    '<td>'+
                        '<input type="text" id="arrear" ng-model="MR.arrear" numbers-only name="arrear" required="required" />'+
                    '</td>'+
                    '<td>'+
                        '<input type="text" id="intrest" ng-model="MR.intrest" numbers-only name="intrest" required="required" />'+
                    '</td>'+
                    '<td>'+
                        '<input type="text" id="penalty" ng-model="MR.penalty" numbers-only name="penalty" required="required" />'+
                    '</td>'+
                    '<td>'+
                        '<input type="text" id="comcharge" ng-model="MR.commitment_charge" numbers-only name="comcharge" required="required" />'+
                    '</td>'+

                    '<td><a href="#" class="btn btn-green" ng-disabled="formDetail.$invalid" ng-click="UpdateMeterDet(MR)">Update</a></td>'+
                '</tr>';
              $('#backlogTable tbody').append(tr);
              $('#backlogTable').show();
      });
    },
    error:function (err) {
      $('#backlogTable').hide();
      console.error(err);
    }
  })
}


/*------------------------------------------/
  FUNCTION:NO METER ENTRY
/-------------------------------------------*/

//get allocation details of industry
function Allocation_dtls(){
  let industry = $('#industry').val();
  let source = $('#wsource').val();
  let purpose = $('#wPurpose').val();
  $.ajax({
    url:'nometerEntry-getAlocDetls?industry='+industry+'&source_cd='+source+'&purpose_cd='+purpose,
    method:'get',
    contentType:'application/json',
    async:false,
    success:function(res){
      console.log(res)
      if(res.body.length>0){
        $('#basinid').val(res.body[0].basin);
        $('#riverid').val(res.body[0].river_nalla);
        $('#damid').val(res.body[0].dam);
        $('#basin').val(res.body[0].basinname);
        $('#river').val(res.body[0].rivername);
        $('#dam').val(res.body[0].damname);
        $('#allocation_qty').val(res.body[0].allocation_qty);
        $('#allocation_code').val(res.body[0].allocation_code);
      }
    },
    error:function(err){
      console.log(err);
    }
  })
}

//insert no meter details
function InsertNometerDtls(){
  var noMetrData = {
    industry_code : $('#industry').val(),
    allocation_code : $('#allocation_code').val(),
    source_cd : $('#wsource').val(),
    purpose_cd : $('#wPurpose').val(),
    basin : $('#basinid').val(),
    river : $('#riverid').val(),
    dam : $('#damid').val(),
    _csrf : $('#csrf').val()
  }
  console.log(noMetrData);
  swal.fire({
    title: "Are you sure want to Submit?",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#77e790",
    confirmButtonText: "Submit",
    showLoaderOnConfirm: true,
    reverseButtons: true,
    confirmButtonAriaLabel: 'Thumbs up, great!',
    cancelButtonText: 'Cancel',
    cancelButtonAriaLabel: 'Thumbs down',
    preConfirm: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            console.log("Doing async operation");
            resolve()
          }, 3000)
        })
      }
    }).then((result) => {
      if (result.value) {
          $.ajax({
            url:'nometerEntry',
            method:'post',
            async:false,
            data:noMetrData,
            success:function(res){
              console.log(res)
              if(res.message == 'success'){
                swal.fire({
                  title: 'Done',
                  text: "No Meter Inserted Successfully",
                  type: "success",
                }).then(result=>{location.reload();})
              }else{
                swal.fire({
                  text: res.message,
                  type: "warning",
                })
              }
            },
            error:function(err){
              console.log(err);
            }
        })//ajax
      }//if
    })//swal
}

/*------------------------------------------/
===========================================================================================/
FUNCTION:NO METER TYPE INDUSTRY
===========================================================================================/
/-------------------------------------------*/

//get industry meter reading
var noMeterReadings = [];
const PenaltyRates = [{val:1,type:'Normal Rate'},{val:2,type:'Penalty Rate(6 Times)'}];
function NoAllocationMtrIndsWise() {
  noMeterReadings = [];
  var industry = $('#industry').val();
  $.ajax({
    url:'nometerTypeIndustry-getMeterDetails?industry='+industry,
    method:'get',
    success:function(res){
      console.log(res)
      if(res.body){
        console.log('inside');
        var Allnoallocation = res.body;
        var meterData = [];
        var fyearList = false;
        $('#noMeterReadTbl').show();
        $('#noRecordTbl').hide();
        $('#noMeterReadTbl tbody').html('');
        if (Allnoallocation.meterDetailList.length > 0 && Allnoallocation.meterDetails.length > 0) {
            if (Allnoallocation.meterDetailList[0].LstFinYr != null) {
                meterData = Allnoallocation.meterDetailList;
            }
            else {
                meterData = Allnoallocation.meterDetails;
                var fyearList = true;
            }
        }else{
          meterData = Allnoallocation.meterDetails;
          var fyearList = true;
        }
        console.log(meterData);
        meterData.forEach((data, i) => {
          let tr1 = '<tr>'+
              '<td class="fstcol">'+
                  '<input type="checkbox" onchange="selectchkline(\''+i+'\')" ng-checked="nt.chkbox" ng-model="nt.chkbox" id="chk_'+i+'" />'+
              '</td>'+
              '<td class="fstcol"><input type="hidden" id="meterid_'+i+'" value="'+data.meterid+'">No Meter</td>'+
              '<td class="fstcol">'+
              '<select  ng-model="nt.ddlyr" name="Financial_Year" id="finyear_'+i+'">'+
                '<option value="">--select--</option>';
              let fyyrList = '';
              if(fyearList){
                fyyrList = '<option value="'+data.yyyr+'">'+data.financial_year+'</option>';
              }else{
                data.LstFinYr.forEach((item) => {
                  fyyrList += '<option value="'+item.yyyr+'">'+item.fyyr+'</option>';
                });
              }

          let tr2 = '</select>'+
            '</td>'+
                '<td class="fstcol">'+
                    '<select id="monthList_'+i+'">'+
                        '<option value="">--select--</option>'+
                    '</select>'+
                '</td>'+
                '<td class="fstcol">'+
                    '<input type="text" id="initialdt_'+i+'" disabled>'+

                '</td>'+
                '<td class="fstcol">'+
                    '<input type="text" id="Enddate_'+i+'" disabled>'+
                '</td>'+
                '<td>'+
                    '<input type="text" id="Allocatedmtrread_'+i+'" disabled>'+
                '</td>'+
                '<td>'+
                  '<select id="penaltyRate_'+i+'">'+
                      '<option value="">--select--</option>';
                      let prate = '';
                        PenaltyRates.forEach((p) => {
                          prate += '<option value="'+p.val+'">'+p.type+'</option>';
                        });

            let foot = '</select>'+
                '</td>'+
                '<td id="action_'+i+'">'+
                '</td>'+
            '</tr>';
          let row = tr1+fyyrList+tr2+prate+foot;
          $('#noMeterReadTbl tbody').append(row);
          $('#insrtReadingBtn').show();
          $('#finyear_'+i).on('change',()=>{
            if($('#finyear_'+i).val()){
              if(fyearList){
                GetMonthList(data,i)
              }else{
                getmonthlistNoMtr(data,i)
              }
            }else{
              GetMonthList('',i)
            }

          })
        });
      }else{
        $('#noMeterReadTbl').hide();
        $('#insrtReadingBtn').hide();
        $('#noRecordTbl').show();
      }
    },
    error:function (err) {
      console.error(err);
      $('#noMeterReadTbl').hide();
      $('#insrtReadingBtn').hide();
      $('#noRecordTbl').show();
    }
  })
}

//get industry meter month list
function GetMonthList(data,index) {
  data._csrf = $('#csrf').val();
  if(!data){
    let op = '<option>---select---</option>';
    $('#monthList_'+index).html('');
    $('#monthList_'+index).html(op);
  }
  $.ajax({
    url:'/waterresource/industrymeterreading-getMonthList',
    method:'post',
    data:data,
    success:function(res){
      console.log(res)
      if(res.body.length>0){
        let op = '<option>---select---</option>';
        res.body.forEach((item, i) => {
          op+='<option value="'+item.monthcode+'_'+i+'">'+item.monthname+'</option>';
        });
        $('#monthList_'+index).html('');
        $('#monthList_'+index).html(op);
        $('#monthList_'+index).on('change',()=>{
          let i = $('#monthList_'+index).val().split('_')[1];
          if(i){
            data.monthname = res.body[i].monthname;
            data.monthcode = res.body[i].monthcode;
            data.status = res.body[i].status;
            data.enddt = res.body[i].enddt;
          }else{
            getIndnoallocationdtls({},index)
          }
            getIndnoallocationdtls(data,index)
        })
      }
    },
    error:function (err) {
      console.error(err);
    }
  })
}

function getmonthlistNoMtr(data,i) {
  console.log(data);
  GetMonthList(data,index)
}

/*
get allocation details of industry
having nometer ( of a month )
*/
function getIndnoallocationdtls(data,index) {
  //console.log(data);
  let span = '';
  if((data.status !='Approved' && data.status !=null && data.status !='')){
    span = '<span>'+
              '<a href="#" class="btn btn-red" id="updateMtrbtn_'+index+'">Update</a>'+
          '</span>';
  }else if(data.status == 'Approved'){
      span = '<span style="color:red">Approved</span>';
  }
  $('#action_'+index).html('');
  $('#action_'+index).html(span);


  data._csrf = $('#csrf').val();
  $.ajax({
    url:'/waterresource/industrymeterreading-getPriceDetails',
    method:'post',
    data:data,
    success:function(res){
      //console.log(res)
      console.log(index);
      if(res.body){
        var dt = res.body;
        console.log(dt);
        $('#initialdt_'+index).val(FromJSONDate(dt.startdate));
        $('#Enddate_'+index).val(FromJSONDate(dt.Enddate));
        $('#Allocatedmtrread_'+index).val(dt.allocationprice);
        $('#status_'+index).val(dt.status);

        if (dt.status != null && dt.status == "Approved") {
           $("#chk_"+index).prop('disabled',true);
        }
        else {
           $("#chk_"+index).prop('disabled',false);
        }

        $('#updateMtrbtn_'+index).on('click',()=>{
          //console.log('hii');
            updateNOmeterread(dt,index);
        });
      }
    },
    error:function (err) {
      console.error(err);
    }
  })

}

//get all no-meter data of a row ofter chkbox checked!!!
function selectchkline(index) {
  if($('#chk_'+index).is(':checked')){
    var meterData = {
      industry:$('#industry').val(),
      Meter_ID:$('#meterid_'+index).val(),
      financial_year:$('#finyear_'+index).val(),
      Month_ID:$('#monthList_'+index).val().split('_')[0],
      initialdt:$('#initialdt_'+index).val(),
      Enddate:$('#Enddate_'+index).val(),
      AllocatedMeterReading:$('#Allocatedmtrread_'+index).val(),
      NometerPenalty:$('#penaltyRate_'+index).val()
    }
    noMeterReadings.push(meterData)
    console.log(noMeterReadings);
  }else{
    noMeterReadings = noMeterReadings.filter(m => m.Meter_ID != $('#meterid_'+index).val());
    console.log(noMeterReadings);
  }
}

//insert nometer readings
function InsertnoalloReadingdtls() {
  let data = {
    readings:noMeterReadings,
    _csrf:$('#csrf').val()
  }
  if(noMeterReadings.length>0){
    swal.fire({
      title: "Are you sure want to Submit?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#77e790",
      confirmButtonText: "Submit",
      showLoaderOnConfirm: true,
      reverseButtons: true,
      confirmButtonAriaLabel: 'Thumbs up, great!',
      cancelButtonText: 'Cancel',
      cancelButtonAriaLabel: 'Thumbs down',
      preConfirm: () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              console.log("Doing async operation");
              resolve()
            }, 3000)
          })
        }
      }).then((result) => {
        if (result.value) {
            $.ajax({
              url:'nometerTypeIndustry',
              method:'post',
              data:data,
              success:function(res){
                console.log(res)
                if(res.message == 'success'){
                  swal.fire({
                    title: 'Done',
                    text: "Meter Reading Inserted Successfully",
                    type: "success",
                  }).then(result=>{location.reload();})
                }else{
                  swal.fire({
                    text: res.message,
                    type: "warning",
                  })
                }
              },
              error:function(err){
                console.log(err);
              }
          })//ajax
        }//if
      })//swal
  }else{
    swal.fire({
      title: "Select At least one checkbox",
      type: "warning",
    })
  }
}

//update meter reading!!!!!!!!!!
function updateNOmeterread(data,index) {
  //console.log(data);
  var billinddtls = {
      Industry_ID: $('#industry').val(),
      Meter_ID: $('#meterid_'+index).val(),
      Financial_Year: $('#finyear_'+index).val(),
      Month_ID: $('#monthList_'+index).val().split('_')[0],
      InitialDate: $('#initialdt_'+index).val(),
      FinalDate: $('#Enddate_'+index).val(),
      InitialMeterReading: data.intialreading,
      FinalMeterReading: data.finalreading,
      MeterReadingDifference: 0,
      MeterRate: data.meterRate,
      NometerPenalty:$('#penaltyRate_'+index).val(),
      _csrf:$('#csrf').val()
    };
    console.log(billinddtls);
    $.ajax({
      url:'/waterresource/industrymeterreading-updateReadings',
      method:'post',
      data:billinddtls,
      success:function(res){
        console.log(res)
        if(res.message == 'success'){
          swal.fire({
            title: 'Done',
            text: "Meter Reading Updated Successfully",
            type: "success",
          }).then(result=>{location.reload();})
        }else{
          swal.fire({
            text: res.message,
            type: "warning",
          })
        }
      },
      error:function(err){
        console.log(err);
      }
  })//ajax

}

/*------------------------------------------/
  FUNCTION:INSPECTION
/-------------------------------------------*/
/**
**  FORM SECTION
**/
//get meter ids of indusrty
function getMeterIdsOfInd() {
  $('#Meters').html('')
  let Industry = $('#industry').val()
  $.ajax({
    url: 'inspection-getMeterIdOfInd?Industry=' + Industry,
    method: 'get',
    contentType: 'application/json',
    async: false,
    success: function (res) {
      for (i = 0; i < res.body.length; i++) {
        var Meters =`<option value="${res.body[i].meterid}">${res.body[i].meterid}</option>`;
        $('#Meters').append(Meters)
      }
    }
  })
}

/**
**  VIEW LIST SECTION
**/
//get inspection details of indystry
function getInspectionDetails() {
  let industry = $('#industry').val();
  $.ajax({
    url:'inspection-viewList?industry_code='+industry,
    method:'get',
    contentType:'application/json',
    async:false,
    success:function(res){
      console.log(res)
      if(res.body.length>0){
        $('#noDataDiv').hide();
        $('#inspectionTbl tbody').html('');
        res.body.forEach((data, i) => {
          let tr = '<tr>'+
                      '<th>'+data.meterid+'</th>'+
                      '<th>'+data.industryid+'</th>'+
                      '<th>'+data.divisionid+'</th>'+
                      '<th>'+data.initialinspectiondate+'</th>'+
                      '<th>'+data.initialinspectionby+'</th>'+
                      '<th>'+data.username+'</th>'+
                      '<th>'+data.meterinitilize+'</th>'+
                      '<th>'+data.initialmeterreading+'</th>'+
                      '<th>'+data.entrytime+'</th>'+
                      '<th>'+data.Actions+'</th>'+
                  '</tr>';
            $('#inspectionTbl').show();
            $('#inspectionTbl tbody').append(tr);
        });
      }else{
        $('#inspectionTbl').hide();
        $('#noDataDiv').show();
      }
    },
    error:function(err){
      $('#noDataDiv').show();
      console.log(err);
    }
  })
}


//delete inspection
 function DeleteInspection(meterid, initialinspectiondate){
   swal.fire({
     title: "Are you sure want to Delete?",
     type: "warning",
     showCancelButton: true,
     //confirmButtonColor: "#77e790",
     confirmButtonColor: "red",
     confirmButtonText: "Delete",
     showLoaderOnConfirm: true,
     reverseButtons: true,
     confirmButtonAriaLabel: 'Thumbs up, great!',
     cancelButtonText: 'Cancel',
     cancelButtonAriaLabel: 'Thumbs down',
     preConfirm: () => {
         return new Promise((resolve) => {
           setTimeout(() => {
             console.log("Doing async operation");
             resolve()
           }, 3000)
         })
       }
     }).then((result) => {
       if (result.value) {
          $.ajax({
            url: 'inspection-delete?meterid='+meterid+'&inspdt='+ initialinspectiondate,
            method: 'get',
            contentType:'application/json' ,
            async : false,
            success: function(res){
              if(res.message == 'success'){
                swal.fire({
                  title:'Done',
                  text:'Record Deleted Successfully',
                  type:'success'
                }).then(result=>{getInspectionDetails()})

              }else {
                swal.fire({
                  text:res.message,
                  type:'warning'
                })
              }
            },
            error:function(err){
              console.log(err);
            }
        })
      }
    });
}



/*============================================================================================================/
                                    ALLOCATION/GENERATION
/==============================================================================================================*/
/*------------------------------------------/
  FUNCTION:NO ALLOCATION
/-------------------------------------------*/
function submitNoAllocationForm(){
    var arr = ['industry','wsource','wPurpose','basin','river','dam','allocationqty','MeterType'];
    var status = validateAndMsg(arr);
    if(status){
      $('#NoAllocationForm').submit();
    }
}

/*------------------------------------------/
  FUNCTION:EDIT ALLOCATION
/-------------------------------------------*/
function setEditData(){
  $("#if_phase_Allocation").hide();
  $("#ifAllocation").hide();
  let industry_code = $('#industry').val();
  var data = {
    _csrf:$('#csrf').val()
  }
  $.ajax({
    url:'ee_editphaseallocation-getIndustryDetails?industry_code='+industry_code,
    method:'get',
    data:data,
    success:function(res){
      //console.log(res)
      $('#divisionSel').html('');
      $('#divisionSel').html('<option>'+res[0].division+'</option>');
      $('#address').text(res[0].address);
      $('#pin').val(res[0].pin);
    },
    error:function (err) {
      console.error(err);
    }
  })
}

//Delete entire allocation entry
function deleteAllocEntry(){
  let industry_code = $('#industry').val();
  var data = {
    _csrf:$('#csrf').val()
  }
  swal.fire({
    title: "Are you sure want to Delete?",
    type: "warning",
    showCancelButton: true,
    //confirmButtonColor: "#77e790",
    confirmButtonColor: "red",
    confirmButtonText: "Delete",
    showLoaderOnConfirm: true,
    reverseButtons: true,
    confirmButtonAriaLabel: 'Thumbs up, great!',
    cancelButtonText: 'Cancel',
    cancelButtonAriaLabel: 'Thumbs down',
    preConfirm: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            console.log("Doing async operation");
            resolve()
          }, 3000)
        })
      }
    }).then((result) => {
      if (result.value) {
        $.ajax({
          url:'ee_editphaseallocation-delete?industry_code='+industry_code,
          method:'post',
          data:data,
          success:function(res){
            if(res.message == "success"){
              swal.fire({
                title: 'Done',
                text: "Record Deleted Successfully",
                type: "success",
              }).then(result=>{
                location.reload();
              })
            }else{
              swal.fire({
                title: res.message,
                text: "Plese Try after some time",
                type: "warning",
              })
            }
          },
          error:function (err) {
            console.error(err);
            swal.fire({
              title: 'Something Went Wrong',
              text: "Plese Try after some time",
              type: "warning",
            })
          }
        })
      }
    })
}

//get allocation records by industry
function GetRecords(phase) {
  let industry_code = $('#industry').val();
  if(industry_code != ""){
    var data = {
      _csrf:$('#csrf').val()
    }
    $.ajax({
      url:'ee_editphaseallocation-GetRecords?industry_code='+industry_code+'&phase='+phase,
      method:'post',
      data:data,
      success:function(res){
        //console.log(res);
        if(res.message == 'success'){
          if(res.body.length > 0){
            if(phase){
              showEditTableData('if_phase_Allocation',res.body,true);
            }else{
              showEditTableData('ifAllocation',res.body,false);
            }
          }else{
            if(phase){
              swal.fire({
                title: 'This is not a phase industry',
                text: "Plese Try Another industry",
                type: "warning",
              })
            }else{
              swal.fire({
                text: "No Records Found",
                type: "warning",
              })
            }
          }
        }else{
          swal.fire({
            text: res.message,
            type: "warning",
          })
        }

      },
      error:function (err) {
        console.error(err);
      }
    })
  }else{
    swal.fire({
      title: 'Error..',
      text: "Select Industry First",
      type: "warning",
    })
  }
}

function showEditTableData(id,data,phase) {

    $("#"+id+" tbody").html('');
    let tr = '';
    if(phase){
      $('#newPhBtn').show();
      $('#newPhBtn').on('click',function () {
        addNewPhase(data[0]);
      })
      $("#if_phase_Allocation").show();
      $("#ifAllocation").hide();
      for(let i = 0; i<data.length;i++){
        tr = '<tr>'+
              '<td>'+(i+1)+'</td>'+
              '<td>'+data[i].watersource+'</td>'+
              '<td>'+data[i].purposedesc+'</td>'+
              '<td>'+data[i].basinname+'</td>'+
              '<td>'+data[i].rivername+'</td>'+
              '<td>'+data[i].damname+'</td>'+
              '<td>'+data[i].allocation_qty+'</td>'+
              '<td>'+data[i].order_no+'</td>'+
              '<td>'+data[i].order_dt.split('T')[0]+'</td>'+
              '<td>'+data[i].phaseaggrement_orderno+'</td>'+
              '<td>'+data[i].phaseallocation_qty+'</td>'+
              '<td>'+data[i].phaseaggrement_dt.split('T')[0]+'</td>'+
              '<td>'+data[i].phaseaggr_from_dt.split('T')[0]+'</td>'+
              '<td>'+data[i].phaseaggr_to_dt.split('T')[0]+'</td>'+
              '<td>'+data[i].phase+'</td>'+
              '<td>'+data[i].phasefrom_dt.split('T')[0]+'</td>'+
              '<td>'+data[i].phaseto_dt.split('T')[0]+'</td>'+
            '<td><a href="#" class="btn btn-red" onclick=editPhaseAllocation(\"'+data[i].phase_slno+'\",\"'+data[i].industry_code+'\") id="PhaseEditBtnClick">Edit</a></td>'+
        '</tr>';
          $("#"+id+" tbody").append(tr)
        }
    }else{
      $('#newPhBtn').hide();
      $("#if_phase_Allocation").hide();
      $("#ifAllocation").show();
      for(let i = 0; i<data.length;i++){
        tr = '<tr>'+
              '<td>'+(i+1)+'</td>'+
              '<td>'+data[i].watersource+'</td>'+
              '<td>'+data[i].purposedesc+'</td>'+
              '<td>'+data[i].basinname+'</td>'+
              '<td>'+data[i].rivername+'</td>'+
              '<td>'+data[i].damname+'</td>'+
              '<td>'+data[i].allocation_qty+'</td>'+
              '<td>'+data[i].order_no+'</td>'+
              '<td>'+data[i].order_dt.split('T')[0]+'</td>'+
              '<td>'+data[i].aggrement_orderno+'</td>'+
              '<td>'+data[i].aggrement_qty+'</td>'+
              '<td>'+data[i].aggrement_dt.split('T')[0]+'</td>'+
              '<td>'+data[i].from_dt.split('T')[0]+'</td>'+
              '<td>'+data[i].to_dt.split('T')[0]+'</td>'+
            '<td><a href="#" class="btn btn-red" onclick=editAllocation(\"'+data[i].serialno+'\",\"'+data[i].industry_code+'\") id="PhaseEditBtnClick">Edit</a></td>'+
        '</tr>';
        $("#"+id+" tbody").append(tr)
      }
    }
}

function setEditVal(data,isPhase){
  console.log(data);
  //hidden fields
  $('#Industry_Code').val(data.industry_code);
  $('#serialno').val(data.serialno);
  $('#alloc_slno').val(data.alloc_slno);

  //edit details common
  $('#IndustryName').val(data.industryname);
  $('#division').val($('#divisionSel').val());
  $('#Address').val($('#address').val());
  $('#PIN').val($('#pin').val());

  //dropdown
  $('#wsource').val(data.source_cd);
  //get dropdown data
  var secreat = {
    _csrf:$('#csrf').val()
  }
  console.log(data.source_cd+"---"+data.basin);
  $.ajax({
    url:'ee_editphaseallocation-getDropdownData?source_cd='+data.source_cd+'&basinid='+data.basin,
    method:'post',
    data:secreat,
    success:function(res){
      console.log(res);
      /********* set waterpurpose ************/
      let op = '<option value=\"\">---Select---</option>';
      for(let i = 0;i<res.purpose.length;i++){
        if(res.purpose[i].purpose_cd == data.purpose_cd){
          op+= '<option value=\"'+res.purpose[i].purpose_cd+'\" selected>'+res.purpose[i].purposedesc+'</option>';
        }else{
          op+= '<option value=\"'+res.purpose[i].purpose_cd+'\">'+res.purpose[i].purposedesc+'</option>';
        }
      }
      $("#wPurpose").html('');
      $("#wPurpose").append(op);

      /********* set basin ************/
      let op1 = '<option value=\"\">---Select---</option>';
      for(let i = 0;i<res.basin.length;i++){
        if(res.basin[i].basinid == data.basin){
          op1+= '<option value=\"'+res.basin[i].basinid+'\" selected>'+res.basin[i].basinname+'</option>';
        }else{
          op1+= '<option value=\"'+res.basin[i].basinid+'\" >'+res.basin[i].basinname+'</option>';
        }
      }
      $("#basin").html('');
      $("#basin").append(op1);

      /********* set river ************/
      let op2 = '<option value=\"\">---Select---</option>';
      for(let i = 0;i<res.river.length;i++){
        if(res.river[i].riverid == data.river_nalla){
          op2+= '<option value=\"'+res.river[i].riverid+'\" selected>'+res.river[i].rivername+'</option>';
        }else{
          op2+= '<option value=\"'+res.river[i].riverid+'\">'+res.river[i].rivername+'</option>';
        }
      }
      $("#river").html('');
      $("#river").append(op2);

      /********* set dam ************/
      let op3 = '<option value=\"\">---Select---</option>';
      for(let i = 0;i<res.dam.length;i++){
        if(res.dam[i].damid == data.dam){
          op3+= '<option value=\"'+res.dam[i].damid+'\" selected>'+res.dam[i].damname+'</option>';
        }else{
          op3+= '<option value=\"'+res.dam[i].damid+'\">'+res.dam[i].damname+'</option>';
        }
      }
      $("#dam").html('');
      $("#dam").append(op3);
    },
    error:function (err) {
      console.error(err);
    }
  })
  $('#dam').val(data.dam);
  $('#Allocation_Qty').val(data.allocation_qty);
  $('#OrderNo').val(data.order_no);

  //Phase Allocation section
  if(isPhase){
    $('#phase_slno').val(data.phase_slno);
    $('#PhaseAggrement_OrderNo').val(data.phaseaggrement_orderno);
    $('#PhaseAllocation_Qty').val(data.phaseallocation_qty);
    $('#PhAggr_Dt').val(data.phaseaggrement_dt);
    $('#PhAggrFrm_Dt').val(data.phaseaggr_from_dt);
    $('#PhAggrTo_Dt').val(data.phaseaggr_to_dt);
    $('#Phase').val(data.phase);
    $('#PhFrm_Dt').val(data.phasefrom_dt);
    $('#PhTo_Dt').val(data.phaseto_dt);
  }else{
    //Allocation section
    $('#AllocOrd_Dt').val(data.order_dt);
    $('#Aggrement_OrderNo').val(data.aggrement_orderno);
    $('#Aggrement_Qty').val(data.aggrement_qty);
    $('#AllocAggr_Dt').val(data.aggrement_dt);
    $('#AllocAggrFrm_Dt').val(data.from_date);
    $('#AllocAggrTo_Dt').val(data.to_dt);
  }
}

function getEditVal(isPhase){
  var data = {};
  //hidden fields
  data.Industry_Code = $('#Industry_Code').val();
  data.serialno = $('#serialno').val();
  data.alloc_slno = $('#alloc_slno').val();

  //edit details common
  data.industryName = $('#IndustryName').val();
  data.division = $('#division').val();
  data.address = $('#Address').val();
  data.pin = $('#PIN').val();
  data.source_cd = $('#wsource').val();
  data.purpose_cd = $('#wPurpose').val();
  data.basin = $('#basin').val();
  data.river_nalla = $("#river").val();
  data.dam = $('#dam').val();
  data.allocation_qty = $('#Allocation_Qty').val();
  data.order_no = $('#OrderNo').val();
  data.order_dt = $('#AllocOrd_Dt').val();
  if(isPhase){
    data.isPhase = "Y";
    //Phase Allocation section
    data.phase_slno = $('#phase_slno').val();
    data.phaseaggrement_orderno = $('#PhaseAggrement_OrderNo').val();
    data.phaseallocation_qty = $('#PhaseAllocation_Qty').val();
    data.phaseaggrement_dt = $('#PhAggr_Dt').val();
    data.phaseaggr_from_dt = $('#PhAggrFrm_Dt').val();
    data.phaseaggr_to_dt = $('#PhAggrTo_Dt').val();
    data.phase = $('#Phase').val();
    data.phasefrom_dt = $('#PhFrm_Dt').val();
    data.phaseto_dt = $('#PhTo_Dt').val();
  }else{
    data.isPhase = "N";
    //Allocation section
    data.order_dt = $('#AllocOrd_Dt').val();
    data.aggrement_orderno = $('#Aggrement_OrderNo').val();
    data.aggrement_qty = $('#Aggrement_Qty').val();
    data.aggrement_dt = $('#AllocAggr_Dt').val();
    data.from_date = $('#AllocAggrFrm_Dt').val();
    data.to_dt = $('#AllocAggrTo_Dt').val();
  }

  return data;
}


function editAllocation(slno,industry_code){
  $('#phaseAllcSec').hide();
  $('#allcSec').show();
  $('#aggrOrdno').show();
  $('#phAggrOrdno').hide();
  $('#editHead').html('Edit Allocation');
  $('#phaseAllocBtnRow').hide();
  $('#allocBtnRow').show();
  console.log(slno+"----"+industry_code)
  let phase = 'false';
  var data = {
    _csrf:$('#csrf').val()
  }
  $.ajax({
    url:'ee_editphaseallocation-GetRecordById?industry_code='+industry_code+'&phase='+phase+'&slno='+slno,
    method:'post',
    data:data,
    success:function(res){
      //console.log(res);
      setEditVal(res.body[0],false);
    },
    error:function (err) {
      console.error(err);
    }
  })

  $("#AllocationModal").show();
}

function editPhaseAllocation(slno,industry_code){
  $('#allcSec').hide();
  $('#phaseAllcSec').show();
  $('#aggrOrdno').hide();
  $('#phAggrOrdno').show();
  $('#editHead').html('Edit Phase Allocation');
  $('#phaseAllocBtnRow').show();
  $('#allocBtnRow').hide();
  console.log(slno+"----"+industry_code)
  let phase = 'true';
  var data = {
    _csrf:$('#csrf').val()
  }
  $.ajax({
    url:'ee_editphaseallocation-GetRecordById?industry_code='+industry_code+'&phase='+phase+'&slno='+slno,
    method:'post',
    data:data,
    success:function(res){
      //console.log(res);
      setEditVal(res.body[0],true);
    },
    error:function (err) {
      console.error(err);
    }
  })
  $("#AllocationModal").show();
}

function addNewPhase(data){
  setNewPhaseVal(data);
  $('#AddPh-modal').show();
}

function BindRiver(){
  let basinid = $('#mbasin').val();
  $.ajax({
    url:'/waterresource/common-getRiver?basinid='+basinid,
    method:'get',
    contentType:'application/json',
    async:false,
    success:function(res){
      let length = res.length;
      let op = '<option value=\"\">---Select---</option>';
      for(let i = 0;i<length;i++){
        op+= '<option value=\"'+res[i].riverid+'\">'+res[i].rivername+'</option>';
      }
      $("#mriver").html('');
      $("#mriver").append(op);
    },
    error:function(err){
      console.log(err);
    }
  })
}

function BindDam(){
  let basinid = $('#mbasin').val();
  $.ajax({
    url:'/waterresource/common-getDam?basinid='+basinid,
    method:'get',
    contentType:'application/json',
    async:false,
    success:function(res){
      let length = res.length;
      let op = '<option value=\"\">---Select---</option>';
      for(let i = 0;i<length;i++){
        op+= '<option value=\"'+res[i].damid+'\">'+res[i].damname+'</option>';
      }
      $("#mdam").html('');
      $("#mdam").append(op);
    },
    error:function(err){
      console.log(err);
    }
  })
}

function setNewPhaseVal(data){
  //hidden fields
  $('#mIndustry_Code').val(data.industry_code);
  $('#mphase_slno').val(data.phase_slno);
  //$('#alloc_slno').val(data.alloc_slno);
  //edit details common
  $('#mIndustryName').val(data.industryname);
  //dropdown
  $('#mwsource').val(data.source_cd);
  $('#mWpurpose').val(data.purpose_cd);
  $('#mwsourceName').val(data.watersource);
  $('#mWpurposeName').val(data.purposedesc);
  //get dropdown data
  var secreat = {
    _csrf:$('#csrf').val()
  }

  $.ajax({
    url:'ee_editphaseallocation-getDropdownData?source_cd='+data.source_cd+'&basinid='+data.basin,
    method:'post',
    data:secreat,
    success:function(res){
      console.log(res);

      /********* set basin ************/
      let op1 = '<option value=\"\">---Select---</option>';
      for(let i = 0;i<res.basin.length;i++){
        if(res.basin[i].basinid == data.basin){
          op1+= '<option value=\"'+res.basin[i].basinid+'\" selected>'+res.basin[i].basinname+'</option>';
        }else{
          op1+= '<option value=\"'+res.basin[i].basinid+'\" >'+res.basin[i].basinname+'</option>';
        }
      }
      $("#mbasin").html('');
      $("#mbasin").append(op1);

      /********* set river ************/
      let op2 = '<option value=\"\">---Select---</option>';
      for(let i = 0;i<res.river.length;i++){
        if(res.river[i].riverid == data.river_nalla){
          op2+= '<option value=\"'+res.river[i].riverid+'\" selected>'+res.river[i].rivername+'</option>';
        }else{
          op2+= '<option value=\"'+res.river[i].riverid+'\">'+res.river[i].rivername+'</option>';
        }
      }
      $("#mriver").html('');
      $("#mriver").append(op2);

      /********* set dam ************/
      let op3 = '<option value=\"\">---Select---</option>';
      for(let i = 0;i<res.dam.length;i++){
        if(res.dam[i].damid == data.dam){
          op3+= '<option value=\"'+res.dam[i].damid+'\" selected>'+res.dam[i].damname+'</option>';
        }else{
          op3+= '<option value=\"'+res.dam[i].damid+'\">'+res.dam[i].damname+'</option>';
        }
      }
      $("#mdam").html('');
      $("#mdam").append(op3);
    },
    error:function (err) {
      console.error(err);
    }
  })
  $('#mAllocation_Qty').val(data.allocation_qty);
}


//add a new phase to an existing industry
function saveNewPhase() {
  var newdata = {
    industry_code:$('#mIndustry_Code').val(),
    industryname:$('#mIndustryName').val(),
    phase_slno:$('#mphase_slno').val(),
    basin:$('#mbasin').val(),
    river:$("#mriver").val(),
    dam:$('#mdam').val(),
    allocation_qty:$('#mAllocation_Qty').val(),
    phaseaggrement_orderno:$('#mPhaseAggrement_OrderNo').val(),
    phaseallocation_qty:$('#mPhaseAllocation_Qty').val(),
    phaseaggrement_dt:$('#mPhAggr_Dt').val(),
    phaseaggr_from_dt:$('#mPhAggrFrm_Dt').val(),
    phaseaggr_to_dt:$('#mPhAggrTo_Dt').val(),
    phase:$('#newPhase').val(),
    phasefrom_dt:$('#mPhFrm_Dt').val(),
    phaseto_dt:$('#mPhTo_Dt').val(),
    _csrf:$('#csrf').val()
  }
  console.log(newdata);
  swal.fire({
    title: "Are you sure want to Submit?",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#77e790",
    confirmButtonText: "Submit",
    showLoaderOnConfirm: true,
    reverseButtons: true,
    confirmButtonAriaLabel: 'Thumbs up, great!',
    cancelButtonText: 'Cancel',
    cancelButtonAriaLabel: 'Thumbs down',
    preConfirm: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            console.log("Doing async operation");
            resolve()
          }, 3000)
        })
      }
    }).then((result) => {
      if (result.value) {
          $.ajax({
            url:'ee_editphaseallocation-addNewPhase',
            method:'post',
            data:newdata,
            success:function(res){
              console.log(res);
              if(res.message == 'success'){
                swal.fire({
                  title: 'Done',
                  text: "Record Added Successfully",
                  type: "success",
                }).then(()=>{$("#AddPh-modal").hide()})
              }else{
                swal.fire({
                  text: res.message,
                  type: "warning",
                })
              }
            },
            error:function (err) {
              swal.fire({
                title: 'Error',
                text: "Something went wrong",
                type: "warning",
              })
              console.error(err);
            }
          })
        }
    })
}

//update allocation entry
function UpdateAlloc(isPhase){
  var data = getEditVal(isPhase);
  console.log(data);
  data._csrf = $('#csrf').val();
  swal.fire({
    title: "Are you sure want to Update?",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#77e790",
    confirmButtonText: "Update",
    showLoaderOnConfirm: true,
    reverseButtons: true,
    confirmButtonAriaLabel: 'Thumbs up, great!',
    cancelButtonText: 'Cancel',
    cancelButtonAriaLabel: 'Thumbs down',
    preConfirm: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            console.log("Doing async operation");
            resolve()
          }, 3000)
        })
      }
    }).then((result) => {
      if (result.value) {
        $.ajax({
          url:'ee_editphaseallocation-updateData',
          method:'post',
          data:data,
          success:function(res){
            console.log(res);
            if(res.message == 'success'){
              swal.fire({
                title: 'Done',
                text: "Record Updated Successfully",
                type: "success",
              }).then(()=>{$("#AllocationModal").hide()})
            }else{
              swal.fire({
                text: res.message,
                type: "warning",
              })
            }
          },
          error:function (err) {
            swal.fire({
              title: 'Error',
              text: "Something went wrong",
              type: "warning",
            })
            console.error(err);
          }
        })
      }
    })
}

//Delete a single allocation entry
function DeleteAlloc(isPhase){
  var data = {};
  //hidden fields
  data.Industry_Code = $('#Industry_Code').val();
  data.serialno = $('#serialno').val();
  data.alloc_slno = $('#alloc_slno').val();
  if(isPhase){
    data.isPhase = "Y";
    data.phase_slno = $('#phase_slno').val();
  }else{
      data.isPhase = "N";
      data.phase_slno = 0;
  }
  data._csrf = $('#csrf').val();
  swal.fire({
    title: "Are you sure want to Delete?",
    type: "warning",
    showCancelButton: true,
    //confirmButtonColor: "#77e790",
    confirmButtonColor: "red",
    confirmButtonText: "Delete",
    showLoaderOnConfirm: true,
    reverseButtons: true,
    confirmButtonAriaLabel: 'Thumbs up, great!',
    cancelButtonText: 'Cancel',
    cancelButtonAriaLabel: 'Thumbs down',
    preConfirm: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            console.log("Doing async operation");
            resolve()
          }, 3000)
        })
      }
    }).then((result) => {
      if (result.value) {
          $.ajax({
            url:'ee_editphaseallocation-deleteModalAllocData',
            method:'post',
            data:data,
            success:function(res){
              console.log(res);
              if(res.message == 'success'){
                swal.fire({
                  title: 'Done',
                  text: "Record Deleted Successfully",
                  type: "success",
                }).then(()=>{$("#AllocationModal").hide()})
              }else{
                swal.fire({
                  text: res.message,
                  type: "warning",
                })
              }
            },
            error:function (err) {
              swal.fire({
                title: 'Error',
                text: "Something went wrong",
                type: "warning",
              })
              console.error(err);
            }
          })
        }
    })
}


/*============================================================================================================
                                    TARGET AND ACHIEVEMENT
==============================================================================================================
*/

function get_Target() {

  let financial_Year = $('#financial_Year').val();
  $.ajax({
    url:'viewtarget-throughAjax?financial_Year='+financial_Year,
    method:'get',
    async:false,
    success:function(res){
      //console.log(res);
      if(res.message == 'success'){
        $('#targetTbl tbody').html('');
        $('#targetTbl').show();
        if(res.body.length > 0){
          res.body.forEach((data, i) => {
            let tr ='<tr>'+
                    '<td><input type="hidden" id="month_code" value="'+data.month_code+'" /><strong>'+data.monthname+'</strong></td>'+
                    '<td><strong id="fin_year">'+data.financial_year+'</strong></td>'+
                    '<td><input type="text" id="Curr_Target" value="'+data.curr_target+'"></td>'+
                    '<td><input type="text" id="Arr_Target" value="'+data.arr_target+'"></td>'+
                    '</tr>';
            $('#targetTbl tbody').append(tr);
          });
          $('#tgtSaveBtn').show();
        }else{
          $('#targetTbl tbody').append('<td colspan="4">No Data found</td>');
          $('#tgtSaveBtn').hide();
        }
      }else{
        swal.fire({
          text: res.message,
          type: "warning",
        })
      }
    },
    error:function (err) {
      console.error(err);
    }
  })
}

//update target
function UpdateTarget() {
  var arr = [];
  $('#targetTbl tbody tr').each(function() {
    let data = {
      month_code:$(this).find('#month_code').val(),
      financial_year:$(this).find('#fin_year').html(),
      curr_target:$(this).find('#Curr_Target').val(),
      arr_target:$(this).find('#Arr_Target').val()
    }
    arr.push(data);
  })
  console.log(arr);
  var data = {
    targets:arr,
    _csrf:$('#csrf').val()
  }
  swal.fire({
    title: "Are you sure want to Submit?",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#77e790",
    confirmButtonText: "Send",
    showLoaderOnConfirm: true,
    reverseButtons: true,
    confirmButtonAriaLabel: 'Thumbs up, great!',
    cancelButtonText: 'Cancel',
    cancelButtonAriaLabel: 'Thumbs down',
    preConfirm: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            console.log("Doing async operation");
            resolve()
          }, 2000)
        })
      }
    }).then((result) => {
      if (result.value) {
          $.ajax({
            url:'viewtarget-update',
            method:'post',
            data:data,
            success:function(res){
              console.log(res);
              if(res.message == 'success'){
                swal.fire({
                  title: 'Done',
                  text: "Record Saved Successfully",
                  type: "success",
                }).then(()=>{get_Target();})
              }else{
                swal.fire({
                  text: res.message,
                  type: "warning",
                })
              }
            },
            error:function (err) {
              swal.fire({
                title: 'Error',
                text: "Something went wrong",
                type: "warning",
              })
              console.error(err);
            }
          })
        }
    })
}

//update target_achieved
function get_targetAchievement(){
  var financial_year = $('#financial_Year').val();
  var month_code = $('#month_code').val();
  if (financial_year == '') {
    swal.fire({
      text: "Select financial year",
      type: "warning",
    })
  }else{
    $.ajax({
      url:'divisiontargetachievement-getdata',
      method:'post',
      data:{month_code:month_code,financial_year:financial_year,_csrf:$('#csrf').val()},
      success:function(res){
        console.log(res);
        if(res.message == 'success'){
          if(res.body.length > 0){
            $('#Curr_Target').val(res.body[0].curr_target);
            $('#Arr_Target').val(res.body[0].arr_target);
            $('#Current_Target_Achieved').val(res.body[0].curr_target_achieved);
            $('#Arrear_Target_Achieved').val(res.body[0].arr_target_achieved);
          }else{
            $('#Curr_Target').val('');
            $('#Arr_Target').val('');
            $('#Current_Target_Achieved').val('');
            $('#Arrear_Target_Achieved').val('');
          }
        }else{
          swal.fire({
            text: res.message,
            type: "warning",
          })
        }
      },
      error:function(err) {
        console.log(err);
      }
    })
  }
}

//update target achievement
function UpdateTargetachievements() {
  let ids = ['financial_Year','month_code','Curr_Target',
  'Arr_Target','Current_Target_Achieved','Arrear_Target_Achieved']
  let status = validateAndMsg(ids);
  if(status){
    var data = {
      financial_year:$('#financial_Year').val(),
      month_code:$('#month_code').val(),
      curr_target:$('#Curr_Target').val(),
      arr_target:$('#Arr_Target').val(),
      curr_target_achieved:$('#Current_Target_Achieved').val(),
      arr_target_achieved:$('#Arrear_Target_Achieved').val(),
      _csrf:$('#csrf').val()
    }
    console.log(data);
    swal.fire({
      title: "Are you sure want to Update?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#77e790",
      confirmButtonText: "Update",
      showLoaderOnConfirm: true,
      reverseButtons: true,
      confirmButtonAriaLabel: 'Thumbs up, great!',
      cancelButtonText: 'Cancel',
      cancelButtonAriaLabel: 'Thumbs down',
      preConfirm: () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              console.log("Doing async operation");
              resolve()
            }, 2000)
          })
        }
      }).then((result) => {
        if (result.value) {
            $.ajax({
              url:'divisiontargetachievement-updatedata',
              method:'post',
              data:data,
              success:function(res){
                console.log(res);
                if(res.message == 'success'){
                  swal.fire({
                    title: 'Done',
                    text: "Record Updated Successfully",
                    type: "success",
                  }).then(()=>{location.reload()})
                }else{
                  swal.fire({
                    title: 'Error',
                    text: res.message,
                    type: "warning",
                  })
                }
              },
              error:function (err) {
                swal.fire({
                  text: "Something went wrong",
                  type: "warning",
                })
                console.error(err);
              }
            })
          }
      })
  }
}


/*============================================================================================================
                                      DEFECTIVE METER
==============================================================================================================
*/
/*------------------------------------------/
  FUNCTION:DEFECTIVE METER ENTRY
/-------------------------------------------*/
var DefectiveMeterList = [];
function getMeterAllocationDtls(){
  var industry_code = $('#industry').val();
  var source_cd = $('#wsource').val();
  var purpose_cd = $('#wPurpose').val();

  $.ajax({
    url:'defectivemeterentry-getMeterDetails?industry_code='+industry_code+'&source_cd='+source_cd+'&purpose_cd='+purpose_cd,
    method:'get',
    success:function(res){
      console.log(res);
      if(res.message == 'success'){
        if(res.body.length > 0){
          DefectiveMeterList = res.body;
          $('#defMetrTbl tbody').html('');
          $('#defMetrTbl').show();
          $('#slidedown').show();
          $('#txtAllocationQty').val(res.body[0].allocation_qty);
          res.body.forEach((item, i) => {
            var tr =  '<tr>'+
                  '<td>'+(i+1)+'</td>'+
                  '<td>'+item.make+'</td>'+
                  '<td>'+item.serialno+'</td>'+
                  '<td>'+item.unit_name+'</td>'+
                  '<td>'+item.maxdigits+'</td>'+
                  '<td>'+item.commissioningdate+'</td>'+
                  '<td>'+item.sealdate+'</td>'+
                  '<td>'+
                      '&nbsp;&nbsp;<input type="checkbox" id="meterchk_'+i+'" onclick="giveIndex(\''+i+'\')" />'+
                      '<input type="hidden" id="allocation_code" value='+item.allocation_code+' />'+
                      '<input type="hidden" id="unitid" value='+item.unitid+' />'+
                      '<input type="hidden" id="meterid" value='+item.meterid+' />'+
                  '</td>'+
              '</tr>';
              $('#defMetrTbl tbody').append(tr);
          });
        }else{
          $('#defMetrTbl tbody').html('');
          $('#defMetrTbl').show();
          $('#slidedown').hide();
          var tr = '<tr>'+
                    '<td colspan="8"> NO DATA FOUND </td>'+
                  '</tr>';
          $('#defMetrTbl tbody').append(tr);
        }
      }else{
        $('#defMetrTbl').hide();
        $('#slidedown').hide();
        swal.fire({
          title: 'Error',
          text: res.message,
          type: "warning",
        })
      }
    },
    error:function (err) {
      $('#defMetrTbl').hide();
      $('#slidedown').hide();
      console.error(err);
    }
  })
}

//give indexOf row of DefectiveMeter table
function giveIndex(i) {
  console.log('hii');
   var currid = 'meterchk_'+i;
   if($('#'+currid).is(':checked')){
       clearOtherBoxes(currid);
       saveSelectedMeterDef(parseInt(i));
   }else{
       removeSelectedMeterDef();
   }
}

//allow only one checkbox to select
function clearOtherBoxes(currid) {
  $(':checkbox').each(()=>{
    console.log($(this).attr('id'));
    if($(this).attr('id') != currid){
      $(this).prop('checked',false);
    }
  })
}

//save selected defective meter
var DefectiveMeter = [];
function saveSelectedMeterDef(index) {
  DefectiveMeter = [];
  DefectiveMeter.push(DefectiveMeterList[index]);
  console.log(DefectiveMeter);
}

//remove defective meter
function removeSelectedMeterDef() {
  DefectiveMeter.pop();
  console.log(DefectiveMeter);
}

//save defective meter
function Defective_MeterEntry() {
  console.log(DefectiveMeter);
}

//get meter deference of industry
function getIndMeterDef() {

}

/*============================================================================================================
                                          ACTIVATION
==============================================================================================================
*/

/*------------------------------------------/
  FUNCTION:APPROVE INDUSTRY
/-------------------------------------------*/

function ActivateIndustry(industry_code) {
  //console.log(industry_code);
  $.ajax({
    url:'registrationstatus-approve?industry_code='+industry_code,
    method:'get',
    success:function(res){
      console.log(res);
      if(res.message == 'success'){
        swal.fire({
          title: 'Approved',
          text: 'Industry Activated Successfully',
          type: "success",
        }).then(result=>{
          location.reload();
        })
      }else{
        swal.fire({
          title: 'Error',
          text: res.message,
          type: "warning",
        })
      }
    },
    error:function (err) {
      console.error(err);
    }
  })
}

function RejectIndustry(industry_code) {
  //console.log(industry_code);
  $.ajax({
    url:'registrationstatus-reject?industry_code='+industry_code,
    method:'get',
    success:function(res){
      console.log(res);
      if(res.message == 'success'){
        swal.fire({
          title: 'Rejected',
          text: 'Industry Rejected Successfully',
          type: "success",
        }).then(result=>{
          location.reload();
        })
      }else{
        swal.fire({
          title: 'Error',
          text: res.message,
          type: "warning",
        })
      }
    },
    error:function (err) {
      console.error(err);
    }
  })
}

/*------------------------------------------/
  FUNCTION:APPROVE READING
/-------------------------------------------*/

function getIndReadingForApprove() {
  var data = {
    industry : $('#industry').val(),
    financial_year : $('#financial_year').val(),
    month : $('#month').val()
  };
  data._csrf = $('#csrf').val();
  console.log(data);

  $.ajax({
    url:'approvebilling-getRecords',
    method:'post',
    data:data,
    success:function(res){
      console.log(res);
      if(res.message == 'success'){
        if(res.body.length>0){
          $('#indReadingTbl tbody').html('');
          res.body.forEach((v, i) => {
            var tr = '<tr>'+
                        '<td>'+(i+1)+'</td>'+
                        '<td>'+v.sourcename+'</td>'+
                        '<td>'+v.industryname+'</td>'+
                        '<td>'+v.finantialyear+'</td>'+
                        '<td>'+v.monthname+'</td>'+
                        '<td>'+v.watersource+'</td>'+
                        '<td>'+v.netmeterreading+'</td>'+
                        '<td>'+v.meterrate+'</td>'+
                        '<td>'+v.principal+'</td>'+
                        '<td>'+v.penalty+'</td>'+
                        '<td>'+v.currentprincipal+'</td>'+
                        '<td>'+v.arrearprincipal+'</td>'+
                        '<td>'+v.paymentrecieved+'</td>';
                        var td1 = '';
                        var td2 = '';
                        if(v.purpose_cd !='gwsh' && v.purpose_cd !='iwhp'){
                          if(v.status == 'NotApproved'){
                            td1 = '<td>'+
                                    '<span><a href="#" class="btn btn-red" id="genBill_'+i+'"><span class="fa fa-eye"></span></a></span>'+
                                '</td>';
                          }else{
                            td1 = '<td>'+
                                    '<span style="color:red"> Approved</span>'+
                                '</td>';
                          }
                        }else if(v.purpose_cd =='gwsh'|| v.purpose_cd =='iwhp'){
                          if(v.status != 'Approved'){
                            td1 = '<td>'+
                                    '<span><a href="#" class="btn btn-red" id="genBillH_'+i+'"><span class="fa fa-eye"></span></a></span>'+
                                  '</td>';
                          }else{
                            td1 = '<td>'+
                                    '<span style="color:red"> Approved </span>'+
                                '</td>';
                          }
                        }

                        if(v.status != 'Approved'){
                          td2 ='<td>'+
                                '<span><a href="#" class="btn btn-red" id="appBill_'+i+'">Approve Bill</a></span>'+
                              '</td>';
                        }else{
                          td2 = '<td>'+
                                  '<span style="color:red"> Approved</span>'+
                              '</td>';
                        }
                    let row = tr+td1+td2+'</tr>';
                    $('#indReadingTbl').show();
                    $('#indReadingTbl tbody').append(row);
                    $('#appBill_'+i).on('click',()=>{
                      updateApproval(v);
                    })
                    $('#genBillH_'+i).on('click',()=>{
                      GenBill_Tmp(v,'H');
                    })
                    $('#genBill_'+i).on('click',()=>{
                      GenBill_Tmp(v,'I');
                    })
          });
        }else{
          $('#indReadingTbl').show();
          $('#indReadingTbl tbody').html('');
          var row = '<tr><td colspan="15">NO DATA FOUND</td></tr>';
          $('#indReadingTbl tbody').append(row);
        }
      }else{
        $('#indReadingTbl').show();
        $('#indReadingTbl tbody').html('');
        var row = '<tr><td colspan="15">NO DATA FOUND</td></tr>';
        $('#indReadingTbl tbody').append(row);
      }
    },
    error:function (err) {
      console.error(err);
    }
  })
}

//generate bill
function GenBill_Tmp(data,type) {
  console.log(data);
  data._csrf = $('#csrf').val();
  $.ajax({
    url:'approvebilling-viewBill',
    method:'post',
    data:data,
    success:function(res) {
      if(res.message == 'success'){
        if(type == 'I'){
          console.log('generate bill success');
        }else{
          console.log('generateHpBill success');
        }
      }else {
        swal({
          text:res.message,
          type:'warning'
        })
      }
    },
    error:function(err) {
      console.log(err);
    }
  })
}

//Approve readings
function updateApproval(data) {
  console.log(data)
  data._csrf = $('#csrf').val();
  $.ajax({
    url:'approvebilling-updateApproval',
    method:'post',
    data:data,
    success:function(res) {
      if(res.message == 'success'){
        swal({
          title:'Done',
          text:'Bill Approved Successfully',
          type:'success'
        })
      }else {
        swal({
          text:res.message,
          type:'warning'
        })
      }
    },
    error:function(err) {
      console.log(err);
    }
  })
}

//ng-model="v.IndustryID"
//ng-model="v.FinancialYr"
//ng-model="v.monthID"
//ng-model="v.watersourceID"
/*---------------------------------------------------------------------------------RJ--------*/
function getpricedtlsDef (indid, meterid, fyear) {
  $('#updateapprove').html('')
  let data = {}
  data.monthid = $('#getMonthListdef').val()
  data.indid = indid;
  data.meterid = meterid;
  data.fyear = fyear;
  $.ajax({
    url: 'getpricedtlsDef',
    method: ' get',
    data: data,
    success: function (res) {
      penaltyenddatestartdate
      $('#initial_dt').val(res[0].startdate)
      $('#Enddate').val(res[0].enddate)
      $('#meterrate').val(res[0].meterrate)
      if (res[0].status != 'Approved' && res[0].status != null) {
        $('#updateapprove').html(`<a href="#" class="btn btn-red" ng-show="nt.showUpdateBtn" onclick="updatemeterreadDef()">Update</a>`);
      }else if(res[0].status == 'Approved'){
        $('#updateapprove').html(`<span ng-if="nt.status =='Approved'" style="color:red">Approved</span>`);
      }
    }
  })
}



function getmonthlistDef (fyear, indid, meterid, sourcecd, purposecd){
  $('#getMonthListdef').html('')
  let data = {}
  data.fyear = fyear;
  data.indid = indid;
  data.meterid = meterid;
  data.sourcecd = sourcecd;
  data.purposecd = purposecd
  $.ajax({
    url: 'inddefectivemeterreads/getMonthListdef',
    method: 'get',
    data: data,
    success: function (res) {
      console.log(res[0].monthname)
      for (i = 0; i < res.length; i++) {
        months =`option value="${res[i].monthcode}">${res[i].monthname}</option>`;
        $('#getMonthListdef').append(months);
      }
    },
    error:function(err) {
      console.log(err);
    }
  })

}


function getIndMeterDef() {
  $('#tabledata').html('')
  industryid = $('#industry').val()
  $.ajax({
    url: 'inddefectivemeterreads/getIndMeterDef?industryid=' + industryid,
    method: 'get',
    success: (res) => {
      if (res.length > 0) {
        $('#table').show()
        for (i = 0; i < res.length; i++) {
          var tabledata =`<tr ng-repeat="nt in Allmeter.getmeterdetail">
                          <td class="fstcol">
                              <input type="checkbox" onchange="selectchklineDef()" ng-checked="nt.chkbox" ng-model="nt.chkbox" id="chk" />
                          </td>
                          <td class="fstcol">${res[i].meterid}</td>
                          <td class="fstcol">

                              <select onchange="getmonthlistDef('${res[i].fyyr}','${res[i].industryid}','${res[i].meterid}','${res[i].sourcecode}','${res[i].purpose_cd}')" ng-model="nt.ddlyr" name="Financial_Year">
                                  <option value="">--select--</option>
                                  <option value=""></option>
                              </select>
                              <input type="hidden"  />
                          </td>
                          <td class="fstcol">

                              <select id="getMonthListdef" onchange="getpricedtlsDef('${res[i].industryid}','${res[i].meterid}','${res[i].fyyr}')" ng-model="nt.Month_Code" name="">
                                  <option value="">--select--</option>
                              </select>
                          </td>
                          <td class="fstcol">
                              <input type="text" id= "initial_dt" disabled>

                          </td>
                          <td class="fstcol">

                          </td>

                          <td >
                          <input type="text" id = "meterrate" disabled>
                          </td>
                          <td id = "updateapprove">
                          </td>
                      </tr>`;
          $('#tabledata').append(tabledata)
        }
      }
    },
    error:function(err) {
      console.log(err);
    }
  })

}
/*---------------------------------------------------------------------------------RJ--------*/

/*------------------------------------------/
  FUNCTION:DEFECTIVE METER ENTRY
/-------------------------------------------*/
var DefectiveMeterList = [];
function getMeterAllocationDtls(){
  var industry_code = $('#industry').val();
  var source_cd = $('#wsource').val();
  var purpose_cd = $('#wPurpose').val();

  $.ajax({
    url:'defectivemeterentry-getMeterDetails?industry_code='+industry_code+'&source_cd='+source_cd+'&purpose_cd='+purpose_cd,
    method:'get',
    success:function(res){
      console.log(res);
      if(res.message == 'success'){
        if(res.body.length > 0){
          DefectiveMeterList = res.body;
          $('#defMetrTbl tbody').html('');
          $('#defMetrTbl').show();
          $('#slidedown').show();
          $('#txtAllocationQty').val(res.body[0].allocation_qty);
          res.body.forEach((item, i) => {
            var tr =  '<tr>'+
                  '<td>'+(i+1)+'</td>'+
                  '<td>'+item.make+'</td>'+
                  '<td>'+item.serialno+'</td>'+
                  '<td>'+item.unit_name+'</td>'+
                  '<td>'+item.maxdigits+'</td>'+
                  '<td>'+item.commissioningdate+'</td>'+
                  '<td>'+item.sealdate+'</td>'+
                  '<td>'+
                      '&nbsp;&nbsp;<input type="radio" name="radioitem" id="meterchk_'+i+'" onclick="giveIndex(\''+i+'\')" />'+
                      '<input type="hidden" id="allocation_code" value='+item.allocation_code+' />'+
                      '<input type="hidden" id="unitid" value='+item.unitid+' />'+
                      '<input type="hidden" id="meterid" value='+item.meterid+' />'+
                  '</td>'+
              '</tr>';
              $('#defMetrTbl tbody').append(tr);
          });
        }else{
          $('#defMetrTbl tbody').html('');
          $('#defMetrTbl').show();
          $('#slidedown').hide();
          var tr = '<tr>'+
                    '<td colspan="8"> NO DATA FOUND </td>'+
                  '</tr>';
          $('#defMetrTbl tbody').append(tr);
        }
      }else{
        $('#defMetrTbl').hide();
        $('#slidedown').hide();
        swal.fire({
          title: 'Error',
          text: res.message,
          type: "warning",
        })
      }
    },
    error:function (err) {
      $('#defMetrTbl').hide();
      $('#slidedown').hide();
      console.error(err);
    }
  })
}

//give indexOf row of DefectiveMeter table
function giveIndex(i) {
  console.log('hii');
   var currid = 'meterchk_'+i;
   if($('#'+currid).is(':checked')){
       //clearOtherBoxes(currid);
       saveSelectedMeterDef(parseInt(i));
   }else{
       removeSelectedMeterDef();
   }
}

//allow only one checkbox to select
// function clearOtherBoxes(currid) {
//   $(':checkbox').each(()=>{
//     console.log($(this).attr('id'));
//     if($(this).attr('id') != currid){
//       $(this).prop('checked',false);
//     }
//   })
// }

//save selected defective meter
var DefectiveMeter = [];
function saveSelectedMeterDef(index) {
  DefectiveMeter = [];
  DefectiveMeter.push(DefectiveMeterList[index]);
  console.log(DefectiveMeter);
}

//remove defective meter
function removeSelectedMeterDef() {
  DefectiveMeter.pop();
  console.log(DefectiveMeter);
}

//---------------------------------------edit Jaydeep start
//save defective meter
function Defective_MeterEntry() {
  console.log(DefectiveMeter);
  var source_cd = $('#wsource').val();
  var purpose_cd = $('#wPurpose').val();
  var meterdefectivedt = $('#defectivedt').val();
  var meterdefreading = $('#mtrreading').val();
  var remarks = $('#remarks').val();
    var reqdata = {
        MeterId: DefectiveMeter[0].meterid,
        Allocation_Code: DefectiveMeter[0].allocation_code,
        Industry_Code: DefectiveMeter[0].industryid,
        Source_CD: source_cd,
        Purpose_CD: purpose_cd,
        SerialNo: DefectiveMeter[0].serialno,
        Status: DefectiveMeter[0].status,
        Make: DefectiveMeter[0].make,
        metertype: DefectiveMeter[0].metertype,
        UnitId: DefectiveMeter[0].unitid,
        MaxDigits: DefectiveMeter[0].maxdigits,
        CommissioningDate: DefectiveMeter[0].commissioningdate,
        SealDate: DefectiveMeter[0].sealdate,
        CalibrationDate: DefectiveMeter[0].calibrationdate,
        InitialInspectionDate: DefectiveMeter[0].initialinspectiondate,
        MeterChangeDt: DefectiveMeter[0].meter_change_dt,
        Remarks: remarks,
        MeterDefectiveDt: meterdefectivedt,
        MeterInstallationDt: '09/02/21',//$scope.txtMtrInstallation,
        MeterInitialize: '',//$scope.radiometerInitialize,
        MeterInitializationDt: '09/02/21',//$scope.txtMtrinitiaizationdt,
        MeterDefReading: meterdefreading,
        _csrf:$('#csrf').val()
    };
    // if ($scope.selectMeterID != null) {
    //     reqdata.MeterId = $scope.selectMeterID;
    // }
    // if (!reqdata.SerialNo) {
    //     reqdata.SerialNo = $scope.SerialNo;
    // }
    // if ($scope.txtDefdt && $scope.txtDefUnits) {
      $.ajax({
        url:'defectivemeterentry-submitdata',
        method:'post',
        data:reqdata,
        success:function(res){
          console.log(res);
          if(res.message == 'success'){
            swal.fire({
              title: 'Done',
              text: "Record added Successfully",
              type: "success",
            }).then(()=>{location.reload()})
          }else{
            swal.fire({
              title: 'Error',
              text: res.message,
              type: "warning",
            })
          }
        },
        error:function (err) {
          swal.fire({
            text: "Something went wrong",
            type: "warning",
          })
          console.error(err);
        }
      })
    // };
}
//---------------------------------------edit Jaydeep end



/*------------------------------------------/
  FUNCTION:DEFECTIVE METER REPLACEMENT
/-------------------------------------------*/

var DefectiveMeterReadingList = [];
function GetindstryMeterDef(){
  var industry_code = $('#industry').val();

  $.ajax({
    url:'defectmeterreplace-getIndMeterDetails?industry_code='+industry_code,
    method:'get',
    success:function(res){
      console.log(res);
      if(res.message == 'success'){
        if(res.body.length > 0){
          DefectiveMeterReadingList = res.body;
          $('#IndFlowMetrTbl tbody').html('');
          $('#IndFlowMetrTbl').show();
          $('#tblTitle').show();
          res.body.forEach((item, i) => {

            var tr =  `<tr>
                  <td> ${(i+1)} </td>
                  <td> ${item.make} </td>
                  <td> ${item.serialno} </td>
                  <td> ${item.unitname} </td>
                  <td> ${item.commissioningdate} </td>
                  <td> ${item.sealdate} </td>
                  <td>
                      &nbsp;&nbsp;<input type="radio" name="radioitem" id="meterchk_${i}" onclick="giveIndex_showSlidedown(${i})" />
                      <input type="hidden" id="mtrdefdate_${i}" value=${item.meterdefectivedate} />
                  </td>
              </tr>`;
              $('#IndFlowMetrTbl tbody').append(tr);
          });
        }else{
          $('#IndFlowMetrTbl tbody').html('');
          $('#IndFlowMetrTbl').show();
          $('#tblTitle').show();
          var tr = '<tr>'+
                    '<td colspan="8"> NO DATA FOUND </td>'+
                  '</tr>';
          $('#IndFlowMetrTbl tbody').append(tr);
        }
      }else{
        $('#IndFlowMetrTbl').hide();
        $('#tblTitle').hide();
        swal.fire({
          title: 'Error',
          text: res.message,
          type: "warning",
        })
      }
    },
    error:function (err) {
      $('#IndFlowMetrTbl').hide();
      console.error(err);
    }
  })
}

//give indexOf row of DefectiveMeter table & show slidedown
function giveIndex_showSlidedown(i) {
  console.log('hiii');
   var currid = 'meterchk_'+i;
   if($('#'+currid).is(':checked')){
       saveSelectedMeterDef(parseInt(i));
   }else{
       removeSelectedMeterDef();
   }
  $('#MtrStatus').show();
}

//save selected defective meter R
var DefectiveMeterRead = [];
function saveSelectedMeterDef(index) {
  DefectiveMeterRead = [];
  DefectiveMeterRead.push(DefectiveMeterReadingList[index]);
  console.log(DefectiveMeterRead);
}

//remove defective meter R
function removeSelectedMeterDef() {
  DefectiveMeterRead.pop();
  console.log(DefectiveMeterRead);
}

//save defective meter
function Save_MeterDtls() {
  console.log(DefectiveMeterRead);
    var data = {
        MeterId: DefectiveMeterRead[0].meterid,
        Industry_Code: DefectiveMeterRead[0].industryid,
        Source_CD: DefectiveMeterRead[0].sourcecode,
        Purpose_CD: DefectiveMeterRead[0].purpose_cd,
        SerialNo: $('#txtmtrSerialNo').val(),
        Status: status,
        Make: $('#txtmtrMake').val(),
        metertype: MeterType,
        UnitId: $('#ddlUnit').val(),
        MaxDigits: $('#mtrMaxDigit').val(),
        CommissioningDate: $('#MtrCommissioningdt').val(),
        SealDate: $('#mtrSealdt').val(),
        CalibrationDate: $('#MtrCalibrationdt').val(),
        InitialInspectionDate: $('#MtrInspeciondt').val(),
        MeterChangeDt: '',
        Remarks: $('#mtrremarks').val(),
        MeterDefectiveDt: $('#meterdefectiveDt').val(),
        MeterInstallationDt: null,//
        MeterInitialize: null,//objnew.MeterInitialize
        MeterInitializationDt: null,//DateConvert(objnew.MeterInitializationDt)
        MeterDefReading: null,//objnew.MeterDefReading
        _csrf:$('#csrf').val()
    };
    if (MeterType = 1) {
      data.MeterChangeDt = $('#meterchangedt').val();
    }
    if (MeterType = 2) {
      data.MeterChangeDt = $('#MtrInstallation').val();
    }
    $.ajax({
      url:'defectmeterreplace-submitdata',
      method:'post',
      data:data,
      success:function(res){
        console.log(res);
        if(res.message == 'success'){
          swal.fire({
            title: 'Done',
            text: "Record added Successfully",
            type: "success",
          }).then(()=>{location.reload()})
        }else{
          swal.fire({
            title: 'Error',
            text: res.message,
            type: "warning",
          })
        }
      },
      error:function (err) {
        swal.fire({
          text: "Something went wrong",
          type: "warning",
        })
        console.error(err);
      }
    });
}
