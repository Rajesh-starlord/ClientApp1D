//on document ready function
$(document).ready(()=>{
  $('.wr-date').datepicker({dateFormat: 'dd/mm/yy', changeMonth: true, changeYear: true});
  //tables
  $('#billGenTbl').hide();
  $('#meterReadTbl').hide();
  $('#noRecordTbl').hide();
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
  /*var dateString = new Date(date);
  var month = (dateString.getMonth()+1)>9?(dateString.getMonth()+1).toString():'0'+(dateString.getMonth()+1).toString();
  var year = dateString.getFullYear();
  var day = (dateString.getDay()+1)>9?(dateString.getDay()+1).toString():'0'+(dateString.getDay()+1).toString();*/
  var newdate = '';
  if(date){
     newdate =  date.split('T')[0];
  }
  return newdate.replaceAll('-','/');
}

/*==========================================================================================================/
                                      MODULE::HYDRRO POWER
/*==========================================================================================================*/

/*------------------------------------------/
  FUNCTION:GENARATION UNIT
/-------------------------------------------*/
function getHydroPowerIndDetls(){
  $('#HydroPowerTable').show();
  $('#HydroPowerTable1').html('');
  let industry = $('#industryhyd').val();
  console.log(industry)
  $.ajax({
    url: 'inserthydropower/getHydroPowerIndDetls?Id=' + industry,
    method: 'get',
    success: function (res) {
        console.log(res);
        res.body.forEach((data, i) => {
          let HydroPowerTable =
            `<tr>
                <td class="fstcol">
                    <input type="checkbox" id="selectboxhp_${i}"  onchange="selectlineHp('${i}')"/>
                </td>

                <td class="fstcol"><input type="hidden" value="${data.meterid}" id="meterid_${i}"/>Hydro Meter</td>
                <td class="fstcol">
                    <select id="finyear_${i}">
                        <option value="">--select--</option>
                        <option value="${data.fyyr}">${data.fyyr}</option>
                    </select>
                </td>

                <td class="fstcol">
                    <select id="monthList_${i}">
                        <option value="">--select--</option>
                    </select>
                </td>

                <td  class="fstcol">
                    <input id ="initialdate_${i}" type="text" disabled>
                </td>

                <td class="fstcol">
                    <input id ="finaldate_${i}" type="text"  disabled>
                </td>

                <td>
                    <input type="number" id="GeneratedPower_${i}"  />
                </td>

                <td id = "HydroPowerAction_${i}">
                    <input type="hidden" id="unitrate_${i}" />
                </td>
               </tr>`;
              $('#HydroPowerTable1').append(HydroPowerTable);
              $('#finyear_'+i).on('change',()=>{
                getHPmonthlist(data,i);
              })
              $('#monthList_'+i).on('change',()=>{
                getHPdtls(data,i);
              })
          });
        },
      error:function(err) {
        console.log(err);
      }
  })
}

function getHPmonthlist(param,index){
    let data = {}
    data.fyyr = param.fyyr;
    data.industryid = param.industryid;
    data.meterid = param.meterid;
    data.sourcecd = param.sourcecode;
    data.purposecd = param.purpose_cd;
    data._csrf = $('#csrf').val();
    $('#monthList_'+index).html('')
    console.log(data)
    $.ajax({
      url: 'inserthydropower/getallmonth_HP',
      method: 'post',
      data: data,
      success: (res) => {
        console.log(res)
        $('#monthList_'+index).append('<option value="">--select--</option>');
        for(i=0;res.length>i;i++){
          $('#monthList_'+index).append(`<option value="${res[i].month_id}">${res[i].monthname}</option>`);
        }
      },
      error:function(err) {
        console.log(err);
      }
    })
}

function getHPdtls(param,index){
  $('#hydropowersubmit').html('')
  let data= {}
  data.monthid = $('#monthList_'+index).val();
  data.industryid = param.industryid;
  data.meterid = param.meterid;
  data.fyyr = param.fyyr;
  data._csrf = $('#csrf').val();
  console.log(data);
  $.ajax({
    url:'inserthydropower/getHPdtls',
    method:'post',
    data:data,
    success:function(res){
      console.log(res)
      $('#initialdate_'+index).val(FromJSONDate(res.startdate));
      $('#finaldate_'+index).val(FromJSONDate(res.enddate));
      $('#GeneratedPower_'+index).val(res.generatedunit);
      if (parseInt(res.generatedunit) > 0 && res.generatedunit != null) {
        $('#GeneratedPower_'+index).prop('disabled',true);
        $('#GeneratedPower_'+index).val(res.generatedunit);
        $('#selectboxhp_'+index).prop('disabled',true);
      }else{
      $('#hydropowersubmit').html(`
        <button type="button" class="btn btn-blue" onclick="InsertHPReadingdtls()">Submit</button>
        <button type="button" onclick="window.location.reload()" class="btn btn-red">Cancel</button>`);

      $('#GeneratedPower_'+index).prop('disabled',false)
      $('#selectboxhp_'+index).prop('disabled',false);
    }
    let hddata = '';
    if(res.status != "Approved" && res.status != null ){
      hddata = `<a href="#" class="btn btn-blue" onclick="EditHydPow('${index}')"><span class="fa fa fa-edit"></span></a>
              <a href="#" id="updateHydrometerread" class="btn btn-red" onclick="updateHydrometerread('${index}')"><span class="fa fa-undo"></span></a>
          </span>`;
    }else if(res.status =='Approved'){
      hddata =`<span style="color:red">Approved</span>`;
    }
      $('#HydroPowerAction_'+index).html(hddata);
      rowdata = res
    },
    error:function(err) {
      console.log(err);
    }
  })
}

var HpReadings = [];
function selectlineHp(index){
  if($('#GeneratedPower_'+index).val()>0){
    if($('#selectboxhp_'+index).is(':checked')){
      var meterData = {
        Industry_ID: $('#industryhyd').val(),
        Meter_ID: $('#meterid_'+index).val(),
        Financial_Year: $('#finyear_'+index).val(),
        Month_ID: $('#monthList_'+index).val(),
        InitialDate: $('#initialdate_'+index).val(),
        FinalDate:$('#finaldate_'+index).val(),
        Generated_unit: $('#GeneratedPower_'+index).val()
      }
      HpReadings.push(meterData)
      console.log(HpReadings);
    }else{
      HpReadings = meterReadList.filter(m => m.Meter_ID != $('#meterid_'+index).html());
      console.log(HpReadings);
    }
  }else{
    alert('Please Insert All Fields');
    $('#selectboxhp_'+index).prop('checked',false);
  }
}

function InsertHPReadingdtls(){
  let data = {
    HpReadings:HpReadings,
    _csrf : $('#csrf').val()
  };
  if(HpReadings.length>0){
    $.ajax({
      url:'inserthydropower/InsertHPReadingdtls',
      method:'post',
      data: data,
      success: function(res){
        if(res.message == 'success'){
          swal({
            title:'Done',
            text:"Successfully Updated",
            type:'success'
          }).then(result=>{location.reload();})
        }else{
          swal({
            text:res.message,
            type:'warning'
          });
        }
      },
      error:function(err) {
        console.log(err);
      }
    })
  }else{
    alert('Select atleast one checkbox');
  }
}


function EditHydPow(index){
    $('#GeneratedPower_'+index).prop('disabled',false);
}


function updateHydrometerread(index){
  if(!$('#GeneratedPower_'+index).prop('disabled')){
    var data = {
      Industry_ID: $('#industryhyd').val(),
      Meter_ID: $('#meterid_'+index).val(),
      Financial_Year: $('#finyear_'+index).val(),
      Month_ID: $('#monthList_'+index).val(),
      InitialDate: $('#initialdate_'+index).val(),
      FinalDate:$('#finaldate_'+index).val(),
      Generated_unit: $('#GeneratedPower_'+index).val(),
      _csrf:$('#csrf').val()
    }
    $.ajax({
      url:'inserthydropower-update',
      method:'post',
      data:data,
      success:(res)=>{
        if(res.message == 'success'){
          swal({
            title:'Done',
            text:"Successfully Updated",
            type:'success'
          }).then(result=>{location.reload();})
        }else{
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
  }//if
}


/*------------------------------------------/
  FUNCTION:BILL GENERATED
/-------------------------------------------*/
function getindustrydetails() {
  var data = {
    industry : $('#industry').val(),
    financial_year : $('#financial_year').val(),
    month : $('#month').val()
  };
  data._csrf = $('#csrf').val();
  console.log(data);

  $.ajax({
    url:'generatehpbill-getRecords',
    method:'post',
    data:data,
    success:function(res){
      console.log(res);
      if(res.message == 'success'){
        if(res.body.length>0){
          $('#billGenTbl tbody').html('');
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
                        '<td>'+v.currentprincipal+'</td>'+
                        '<td>'+v.arrearprincipal+'</td>'+
                        '<td>'+v.paymentrecieved+'</td>';
                        var td = '';
                        if(v.status != 'Approved'){
                          td = '<td>'+
                                  '<span><a href="#" class="btn btn-red" id="appBill_'+i+'">Approve Bill</a></span>'+
                              '</td>';
                        }else{
                          td = '<td>'+
                                  '<span style="color:red">Approved</span>'+
                              '</td>';
                        }
                    let row = tr+td+'<td><a href="#" class="btn btn-green" id="genBill_'+i+'">Generate Bill</a></td></tr>';
                    $('#billGenTbl').show();
                    $('#billGenTbl tbody').append(row);
                    $('#appBill_'+i).on('click',()=>{
                      updateApproval(v);
                    })
                    $('#genBill_'+i).on('click',()=>{
                      generateHpBill(v);
                    })
          });
        }else{
          $('#billGenTbl').show();
          $('#billGenTbl tbody').html('');
          var row = '<tr><td colspan="15">NO DATA FOUND</td></tr>';
          $('#billGenTbl tbody').append(row);
        }
      }else{
        $('#billGenTbl').show();
        $('#billGenTbl tbody').html('');
        var row = '<tr><td colspan="15">NO DATA FOUND</td></tr>';
        $('#billGenTbl tbody').append(row);
      }
    },
    error:function (err) {
      console.error(err);
    }
  })
}

//generate bill
function generateHpBill(data) {
  console.log(data);
  data._csrf = $('#csrf').val();
  $.ajax({
    url:'generatehpbill',
    method:'post',
    data:data,
    success:function(res) {
      if(res.message == 'success'){
        swal({
          title:'Done',
          text:'Bill Generated Successfully',
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

//Approve readings
function updateApproval(data) {
  console.log(data)
  data._csrf = $('#csrf').val();
  $.ajax({
    url:'generatehpbill-updateApproval',
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

/*==========================================================================================================/
                                              MODULE::METER
/*==========================================================================================================*/

/*------------------------------------------/
        FUNCTION:METER READING
/-------------------------------------------*/
//get industry meter reading
var meterReadList = [];
function GetIndustryMeterReading() {
  meterReadList = [];
  var industry = $('#industry').val();
  $.ajax({
    url:'industrymeterreading-getData?industry='+industry,
    method:'get',
    success:function(res){
      console.log(res)
      if(res.body.length>0){
        $('#meterReadTbl').show();
        $('#noRecordTbl').hide();
        $('#meterReadTbl tbody').html('');
        res.body.forEach((data, i) => {
          let tr = '<tr>'+
              '<td class="fstcol">'+
                  '<input type="checkbox" onchange="selectchkline(\''+i+'\')" ng-checked="nt.chkbox" ng-model="nt.chkbox" id="chk_'+i+'" />'+
              '</td>'+
              '<td class="fstcol" id="meterid_'+i+'">'+data.meterid+'</td>'+
              '<td class="fstcol">'+
                  '<select  ng-model="nt.ddlyr" name="Financial_Year" id="finyear_'+i+'">'+
                      '<option value="">--select--</option>'+
                      '<option value="'+data.yyyr+'">'+data.financial_year+'</option>'+
                  '</select>'+
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
                  '<input type="number" id="initialread_'+i+'" maxlength='+data.maxdigit+' valid-Number onblur=differencecalf("'+i+'") ></input>'+
              '</td>'+
              '<td>'+
                  '<input type="number" id="finalread_'+i+'" valid-Number maxlength='+data.maxdigit+' onblur=differencecal("'+i+'") ></input>'+
              '</td>'+
              '<td>'+
                  '<input type="text" id="Diffmeterread_'+i+'" disabled>'+
              '</td>'+
              '<td id="mtrRate_'+i+'"></td>'+
              '<td id="action_'+i+'">'+
              '</td>'+
          '</tr>';
          let row = tr;
          $('#meterReadTbl tbody').append(tr);
          $('#insrtReadingBtn').show();
          $('#finyear_'+i).on('change',()=>{
            if($('#finyear_'+i).val()){
              GetMonthList(data,i)
            }else{
              GetMonthList('',i)
            }

          })
        });
      }else{
        $('#meterReadTbl').hide();
        $('#insrtReadingBtn').hide();
        $('#noRecordTbl').show();
      }
    },
    error:function (err) {
      console.error(err);
      $('#meterReadTbl').hide();
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
    url:'industrymeterreading-getMonthList',
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
            data.monthname = '';data.monthcode = '';data.status = '';data.enddt = '';
          }
          getPriceDetails(data,index)
        })
      }
    },
    error:function (err) {
      console.error(err);
    }
  })
}

/*
get price details of industry
meter reading of a month
*/
function getPriceDetails(data,index) {
  data._csrf = $('#csrf').val();
  //console.log(data);
  $.ajax({
    url:'industrymeterreading-getPriceDetails',
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
        $('#initialread_'+index).val(dt.intialreading);
        $('#finalread_'+index).val(dt.finalreading);
        $('#mtrRate_'+index).html(dt.meterRate);
        $('#Diffmeterread_'+index).val(dt.differncemeterread);
        $('#status_'+index).val(dt.status);
        if (parseInt(dt.intialreading) > 0) {
           $("#initialread_"+index).prop('disabled',true);
        }
        else { $("#initialread_"+index).prop('disabled',false); }
        if (parseInt(dt.finalreading) > 0) {
           $("#finalread_"+index).prop('disabled',true);
        }
        else { $("#finalread_"+index).prop('disabled',false); }

        if (dt.status != null && dt.status == "Approved") {
           $("#chk_"+index).prop('disabled',true);
        }
        else {
           $("#chk_"+index).prop('disabled',false);
        }

        let span = '';
        if(dt.status != 'Approved'  && dt.status !=''){
          span = '<span>'+
                    '<a href="#" class="btn btn-blue" id="edtMtrbtn_'+index+'">Edit</a>'+
                    '<a href="#" class="btn btn-red" id="updateMtrbtn_'+index+'">Update</a>'+
                '</span>';
        }else if(dt.status == 'Approved'){
            span = '<span style="color:red">Approved</span>';
        }
        $('#action_'+index).html('');
        $('#action_'+index).html('<input type="hidden" id="unitrate_'+index+'" />'+span);
        $('#unitrate_'+index).val(dt.meterunitrate);
        $('#edtMtrbtn_'+index).on('click',()=>{
            editReading(index);
        });
        $('#updateMtrbtn_'+index).on('click',()=>{
            updateMeterRead(data,index);
        });
      }
    },
    error:function (err) {
      console.error(err);
    }
  })

}

//calculate the difference in meter reading!!!
function differencecal(index) {
    debugger;
    var initial_read = $('#initialread_'+index).val();
    var final_read = $('#finalread_'+index).val();
    var meterunitrate = $('#unitrate_'+index).val();
    var maxDigit = $('#finalread_'+index).attr('maxlength');
    var Diffmeterread = 0;
    console.log('initial reading='+initial_read);
    console.log('final_read='+final_read);
    if (initial_read == 0) {
        initial_read = initial_read.toString();
    }
    if (initial_read && final_read && initial_read != "" && (final_read != 0 || final_read != "")) {
        //$scope.fnlval = nt.final_read; $scope.intlval = nt.initial_read;
        if (parseFloat(initial_read) <= parseFloat(final_read)) {
            Diffmeterread = (parseFloat(final_read) - parseFloat(initial_read)) * parseFloat(meterunitrate);
        }
        else {
            var result = confirm("Is your Meter Initialize ?");
            if (result) {
                var maxstring = '';
                if (maxDigit > 0) {
                    maxDigit = parseInt(maxDigit);
                    for (var i = 0; i < maxDigit; i++) {
                        maxstring += '9';
                    }
                }
                var maxxvalue = parseFloat(maxstring);
                var Finalmetervlue = maxxvalue + parseFloat(final_read);
                Diffmeterread = (parseFloat(Finalmetervlue) - parseFloat(initial_read)) * parseFloat(meterunitrate);
            }
            else {
                Diffmeterread = 0; final_read = 0;
                return false;
            }
        }
        console.log('Diffmeterread='+Diffmeterread);
        $('#Diffmeterread_'+index).val(Diffmeterread);
    }
    else { return false; }
    return false;
}

//edit meter reading!!!!!
function editReading(index) {
  $('#Diffmeterread_'+index).val('');
  $('#finalread_'+index).val('');
  if($("#finalread_"+index).prop('disabled')){
      $("#finalread_"+index).prop('disabled',false)
  }
  //  nt.final_read = ""; nt.Diffmeterread = ""; nt.netmeterread = ""; nt.totalamnt = ""; nt.penalty = "";
}

//update meter reading!!!!!!!!!!
function updateMeterRead(data,index) {
  console.log(data);
  var billinddtls = {
      Industry_ID: $('#industry').val(),
      Meter_ID: $('#meterid_'+index).html(),
      Financial_Year: $('#finyear_'+index).val(),
      Month_ID: $('#monthList_'+index).val().split('_')[0],
      InitialDate: $('#initialdt_'+index).val(),
      FinalDate: $('#Enddate_'+index).val(),
      InitialMeterReading: parseFloat($('#initialread_'+index).val()),
      FinalMeterReading: parseFloat($('#finalread_'+index).val()),
      MeterReadingDifference: $('#Diffmeterread_'+index).val(),
      MeterRate: $('#mtrRate_'+index).html(),
      _csrf:$('#csrf').val()
    };

    $.ajax({
      url:'industrymeterreading-updateReadings',
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

//get all meter data of a row ofter chkbox checked!!!
function selectchkline(index) {
  if($('#finalread_'+index).val()>0){
    if($('#chk_'+index).is(':checked')){
      var meterData = {
        industry:$('#industry').val(),
        Meter_ID:$('#meterid_'+index).html(),
        financial_year:$('#finyear_'+index).val(),
        Month_ID:$('#monthList_'+index).val().split('_')[0],
        initialdt:$('#initialdt_'+index).val(),
        Enddate:$('#Enddate_'+index).val(),
        initialread:$('#initialread_'+index).val(),
        finalread:$('#finalread_'+index).val(),
        MeterRate:$('#mtrRate_'+index).html(),
        MeterReadingDifference:$('#Diffmeterread_'+index).val(),
      }
      meterReadList.push(meterData)
      console.log(meterReadList);
    }else{
      meterReadList = meterReadList.filter(m => m.Meter_ID != $('#meterid_'+index).html());
      console.log(meterReadList);
    }
  }else{
    $('#chk_'+index).prop('checked',false);
    alert('Please Insert All Fields');
  }

}

//insert meter readings
function insertmeterReadings() {
  let data = {
    readings:meterReadList,
    _csrf:$('#csrf').val()
  }
  if(meterReadList.length>0){
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
              url:'industrymeterreading',
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


/*********************************************************************************************************/
