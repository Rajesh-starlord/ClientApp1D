//on document ready function
$(document).ready(()=>{
  $('#phaseAllocTable').hide();
  $('#recTable').hide();
  $('#newPhBtn').hide();
  $('.wr-date').datepicker({dateFormat: 'dd/mm/yy', changeMonth: true, changeYear: true});
  $("#if_phase_Allocation").hide();
  $("#ifAllocation").hide();
  $("#if_phase_Allocation").css('overflow-x','auto');

  //tables
  $("#phaseTbl").hide();
  $('#Expo').hide();
  $('#targetTbl').hide();
  $('#tgtSaveBtn').hide();
  $('#divwisetargetTbl').hide();
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

/*==========================================================================================================/
                                  Allocation Entry
/===========================================================================================================*/
function getWSource(){
  let division = $('#division').val();
  $.ajax({
    url:'/waterresource/getWSource?division='+division,
    method:'get',
    contentType:'application/json',
    async:false,
    success:function(res){
      console.log(res)
    },
    error:function(err){
      console.log(err);
    }
  })
}

function getWaterPurpose(){
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

/*============================================================================================================
                                    ALLOCATION ENTRY SECTION
==============================================================================================================
*/
var allcData = {};
var AllRecdnew = [];
var AllPhaseRecdnew = [];
var AllRecd = [];
function addData(){
  var formData = {};
  var itype = "";
  var istatus = '';
  if($('#typI').is(':checked')){
     itype = 'Industrial';
  }
  if($('#typC').is(':checked')){
     itype = 'Commercial';
  }
  if($('#typO').is(':checked')){
     itype = 'Others';
  }

  if($('#statO').is(':checked')){
     istatus = 'O';
  }
  if($('#statN').is(':checked')){
     istatus = 'N';
  }

  if($("#IndustryName").val()==null || $("#IndustryName").val() == ""){
    swal('Industry Name required')
  }else if(checkSpecialChar($("#IndustryName").val())){
      swal({
        title:'Special Charecter is not Allowed',
        text:'Enter valid Indusrty',
        type:'warning'
      })
  }else if($("#division").val()==null || $("#division").val() == ""){
    swal('Division Type required')
  }else if($("#address").val()==null || $("#address").val() == ""){
    swal('Industry Type required')
  }else if(checkSpecialChar($("#address").val())){
      swal({
        title:'Special Charecter is not Allowed',
        text:'Enter valid Address',
        type:'warning'
      })
  }else if($("#PIN").val()==null || $("#PIN").val() == ""){
    swal('PIN Code Type required')
  }else if(istatus==null || istatus == ""){
    swal('Industry status required')
  }else if(itype==null || itype == ""){
    swal('Industry Type required')
  }else if($("#wsource").val()==null || $("#wsource").val() == ""){
    swal('Select Water Source')
  }else if($("#wPurpose").val()==null || $("#wPurpose").val() == ""){
    swal('Select Water Purpose')
  }else{
    formData = {
      industry:$("#IndustryName").val(),
      division:$("#division").val(),
      address:$("#address").val(),
      pin:$("#PIN").val(),
      indStatus:istatus,
      indType:itype,

      wsource:$("#wsource").val(),
      wPurpose:$("#wPurpose").val(),
      basin:$("#basin").val(),
      river:$("#river").val(),
      dam:$("#dam").val(),

      AlloQty:$("#AlloQty").val(),
      OrderNo:$("#ordno").val(),
      orddt:$("#orddt").val(),

      Agordno:$("#Agordno").val(),
      AgoQty:$("#AgoQty").val(),
      Agdt:$("#Agdt").val(),
      frmdt:$("#frmdt").val(),
      todt:$("#todt").val(),
    }
    if($("#chkPhase").is(':checked')){
      formData.phaseAlloc = "Y";
      formData.phase = $("#phase").val();
      formData.phaseAlocQty = $("#PhaseAllocation_Qty").val();
      formData.phaseFromDT = $("#txtPhaseFrom_DT").val();
      formData.PhaseToDT = $("#txtPhaseTo_DT").val();
      AllPhaseRecdnew.push(formData);
      $('#phaseAllocTable').show();
      appendTableData('#phaseAllocTable',AllPhaseRecdnew);
    }else{
      formData.phaseAlloc = "N";
      AllRecdnew.push(formData);
      $('#recTable').show();
      appendTableData('#recTable',AllRecdnew);
    }
  }
}

function appendTableData(id,data){

  $(id+" tbody").html('');
  let phase = data[0].phaseAlloc;
  for(let i = 0; i<data.length;i++){
    let tr = '';
    if(phase == 'N'){
      tr = '<tr>'+
            '<td>'+(i+1)+'</td>'+
            '<td>'+data[i].wsource+'</td>'+
            '<td>'+data[i].wPurpose+'</td>'+
            '<td>'+data[i].basin+'</td>'+
            '<td>'+data[i].river+'</td>'+
            '<td>'+data[i].dam+'</td>'+
            '<td>'+data[i].AlloQty+'</td>'+
            '<td>'+data[i].OrderNo+'</td>'+
            '<td>'+data[i].orddt+'</td>'+
            '<td>'+data[i].Agordno+'</td>'+
            '<td>'+data[i].AgoQty+'</td>'+
            '<td>'+data[i].Agdt+'</td>'+
            '<td>'+data[i].frmdt+'</td>'+
            '<td>'+data[i].todt+'</td>'+
          '<td><span onclick=RemoveIndAlloc(\"N\",'+i+')><i class=\"fa fa-trash\" style=\"font-size:15px;color:red\"></i></span></td>'+
      '</tr>';
      $(id+" tbody").append(tr)
    }else{
      tr = '<tr>'+
            '<td>'+(i+1)+'</td>'+
            '<td>'+data[i].wsource+'</td>'+
            '<td>'+data[i].wPurpose+'</td>'+
            '<td>'+data[i].basin+'</td>'+
            '<td>'+data[i].river+'</td>'+
            '<td>'+data[i].dam+'</td>'+
            '<td>'+data[i].AlloQty+'</td>'+
            '<td>'+data[i].OrderNo+'</td>'+
            '<td>'+data[i].orddt+'</td>'+
            '<td>'+data[i].phase+'</td>'+
            '<td>'+data[i].phaseAlocQty+'</td>'+
            '<td>'+data[i].phaseFromDT+'</td>'+
            '<td>'+data[i].PhaseToDT+'</td>'+
            '<td>'+data[i].Agordno+'</td>'+
            '<td>'+data[i].Agdt+'</td>'+
            '<td>'+data[i].frmdt+'</td>'+
            '<td>'+data[i].todt+'</td>'+
          '<td><span onclick=RemoveIndAlloc(\"Y\",'+i+')><i class=\"fa fa-trash\" style=\"font-size:15px;color:red\"></i></span></td>'+
      '</tr>';
        $(id+" tbody").append(tr)
    }

  }
}

function RemoveIndAlloc(type,index){
  if(type === "Y"){
    AllPhaseRecdnew.splice(index, 1);
    appendTableData('#phaseAllocTable',AllPhaseRecdnew);
  }else{
    AllRecdnew.splice(index, 1);
    appendTableData('#recTable',AllRecdnew);
  }
}

function allocEntry(){
  var data = {};
  if($("#chkPhase").is(':checked')){
    //console.log(AllPhaseRecdnew)
    data.allcData = AllPhaseRecdnew;
  }else{
    //console.log(AllRecdnew);
    data.allcData = AllRecdnew;
  }
  if(data.allcData.length > 0){
    data._csrf = $("#csrf").val();
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
            }, 2000)
          })
        }
      }).then((result) => {
        if (result.value) {
          $.ajax({
            url:'allocationentry',
            method:'post',
            data:data,
            success:function(res){
              console.log(res)
              if(res.message == 'success'){
                swal.fire({
                  title: 'Done',
                  text: "Records Saved Successfully",
                  type: "success",
                })
                window.location.href=res.url;
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
    }else{
    swal({
      title:'No Data Added',
      text:'plese make sure that you have added the data',
      type:'warning'
    })
  }
}

/*============================================================================================================
                                    ALLOCATION ENTRY-EDIT SECTION
==============================================================================================================
*/

function setEditData(){
  $("#if_phase_Allocation").hide();
  $("#ifAllocation").hide();
  let industry_code = $('#industry').val();
  var data = {
    _csrf:$('#csrf').val()
  }
  $.ajax({
    url:'editphaseallocation-getIndustryDetails?industry_code='+industry_code,
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
          url:'editphaseallocation-delete?industry_code='+industry_code,
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
      url:'editphaseallocation-GetRecords?industry_code='+industry_code+'&phase='+phase,
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
            $('#allocation_code').val(res.body[0].allocation_code);
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
  }else{
    swal.fire({
      title: 'Error..',
      text: "Select Industry First",
      type: "warning",
    })
  }
}

function showEditTableData(id,data,phase) {
    console.log(data);
    $("#"+id+" tbody").html('');
    let tr = '';
    if(data.length > 0){
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
    url:'editphaseallocation-getDropdownData?source_cd='+data.source_cd+'&basinid='+data.basin,
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
    url:'editphaseallocation-GetRecordById?industry_code='+industry_code+'&phase='+phase+'&slno='+slno,
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
    url:'editphaseallocation-GetRecordById?industry_code='+industry_code+'&phase='+phase+'&slno='+slno,
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
    url:'editphaseallocation-getDropdownData?source_cd='+data.source_cd+'&basinid='+data.basin,
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
    allocation_code:$('#allocation_code').val(),
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
            url:'editphaseallocation-addNewPhase',
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
                  title: 'Error',
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
          url:'editphaseallocation-updateData',
          method:'post',
          data:data,
          success:function(res){
            console.log(res);
            if(res.message == 'success'){
              swal.fire({
                title: 'Done',
                text: "Record Updated Successfully",
                type: "success",
              }).then(()=>{
                  $("#AllocationModal").hide();
                //  GetRecordsAfterDel(isPhase);
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

//Get records and rerender the table after delete
function functionName() {
  let industry_code = $('#industry').val();
  var data = {
    _csrf:$('#csrf').val()
  }
  $.ajax({
    url:'editphaseallocation-GetRecords?industry_code='+industry_code+'&phase='+phase,
    method:'post',
    data:data,
    async:false,
    success:function(res){
      //console.log(res);
      if(res.message == 'success'){
          $('#allocation_code').val(res.body[0].allocation_code);
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
            url:'editphaseallocation-deleteModalAllocData',
            method:'post',
            data:data,
            success:function(res){
              console.log(res);
              if(res.message == 'success'){
                swal.fire({
                  title: 'Done',
                  text: "Record Deleted Successfully",
                  type: "success",
                }).then(()=>{
                  $("#AllocationModal").hide();
                  //GetRecords(isPhase);
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

/*=======================================================================================================/
                                      PHASE ALOCATION SECTION
/=======================================================================================================*/

var phaseData = [];
function addPhase(){
  let arr = ['wsource','wPurpose']
  let status = validate(arr);
  if(status){
    data = {
      //Industry
      industry_code:$("#industry").val(),
      division:$("#division").val(),
      address:$("#address").val(),
      pin:$("#pin").val(),
      //Allocation
      source_cd:$("#wsource").val(),
      purpose_cd:$("#wPurpose").val(),
      basin:$("#basin").val(),
      river:$("#river").val(),
      dam:$("#dam").val(),
      //Allocation info
      allocation_qty:$("#AlloQty").val(),
      order_no:$("#ordno").val(),
      order_dt:$("#orddt").val(),
      //Aggreement
      aggrement_orderno:$("#Agordno").val(),
      aggrement_dt:$("#Agdt").val(),
      from_dt:$("#Agfrmdt").val(),
      to_dt:$("#Agtodt").val(),
      //phase
      phase : $("#phase").val(),
      phaseAlocQty : $("#PhaseAllocation_Qty").val(),
      phaseFromDT : $("#txtPhaseFrom_DT").val(),
      PhaseToDT : $("#txtPhaseTo_DT").val()
    }
    phaseData.push(data);
    renderPhAllocTable();
  }
}

function renderPhAllocTable() {

  if(phaseData.length > 0){
    $("#phaseTbl").show();
    $("#phaseTbl tbody").html('');
    phaseData.forEach((data, i) => {
      var tr = '<tr>'+
          '<td>'+(i+1)+'</td>'+
          '<td>'+data.industry_code+'</td>'+
          '<td>'+data.phase+'</td>'+
          '<td>'+data.phaseAlocQty+'</td>'+
          '<td>'+data.phaseFromDT+'</td>'+
          '<td>'+data.PhaseToDT+'</td>'+
          '<td>'+data.aggrement_orderno+'</td>'+
          '<td>'+data.aggrement_dt+'</td>'+
          '<td>'+data.from_dt+'</td>'+
          '<td>'+data.to_dt+'</td>'+
      '</tr>';
      $("#phaseTbl tbody").append(tr);
    });
  }else{
    $("#phaseTbl").hide();
  }
}

function popPhase(){
  phaseData.pop();
  if(phaseData.length > 0){
      renderPhAllocTable();
  }else{
    $("#phaseTbl").hide();
  }
}

function savePhase() {
  var data = {};
  data._csrf = $('#csrf').val();
  data.phaseData = phaseData;
  console.log(data);
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
          }, 3000)
        })
      }
    }).then((result) => {
      if (result.value) {
          $.ajax({
            url:'phaseallocation-save',
            method:'post',
            data:data,
            async:false,
            success:function(res){
              console.log(res);
              if(res.message == 'success'){
                swal.fire({
                  title: 'Done',
                  text: "Record Saved Successfully",
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

/*=============================================================================================================/
                                          ADD SOURCE SECTION
/==============================================================================================================*/

function getIndustryByDivision() {
  let division = $('#division').val();
  let data = {};
  data._csrf = $('#csrf').val();
  $.ajax({
    url:'addsource-getIndustryByDivision?division='+division,
    method:'get',
    data:data,
    async:false,
    success:function(res){
      //console.log(res);
      $('#industry').html('');
      let op = '<option value=\"\">--Select--</option>';
      for(let i = 0;i<res.industry.length;i++){
        op+= '<option value=\"'+res.industry[i].industry_code+'\">'+res.industry[i].industryname+'</option>';
      }
      $('#industry').append(op);
    },
    error:function (err) {
      console.log(err);
    }
  });
}

function InsertAllocationMultipleSource() {
    var arr = ['division','industry','wsource','wPurpose'];
    let status = validate(arr);
    if(status){
      //console.log('validation success');
      var data = {
        industry_code:$("#industry").val(),
        division:$("#division").val(),
        source_cd:$("#wsource").val(),
        purpose_cd:$("#wPurpose").val(),
        basin:$("#basin").val(),
        river:$("#river").val(),
        dam:$("#dam").val(),

        allocation_qty:$("#AlloQty").val(),
        order_no:$("#ordno").val(),
        order_dt:$("#orddt").val(),

        aggrement_orderno:$("#Agordno").val(),
        aggrement_qty:$("#AgoQty").val(),
        aggrement_dt:$("#Agdt").val(),
        from_dt:$("#frmdt").val(),
        to_dt:$("#todt").val(),
      }
      data._csrf = $('#csrf').val();
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
              }, 3000)
            })
          }
        }).then((result) => {
          if (result.value) {
              $.ajax({
                url:'addsource-save',
                method:'post',
                data:data,
                success:function(res){
                  console.log(res);
                  if(res.message == 'success'){
                    swal.fire({
                      title: 'Done',
                      text: "Record Saved Successfully",
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
}

/*========================================================================================================/
                            UPDATE ALLOCATION DIVISION WISE
/=========================================================================================================*/

function getAllocDetByDivision() {
  getIndustryByDivision();
  getAllocDetByDivisionWise();
}

function getAllocDetByDivisionWise() {
  let data = {};
  data._csrf = $('#csrf').val();
  data.division = $('#division').val();
  data.industry = $('#industry').val();
  console.log(data);
  $.ajax({
    url:'allocationdetails-divisionWise',
    method:'get',
    data:data,
    async:false,
    success:function(res){
    //  console.log(res);
      if(res.message == 'success'){
        showDivisionWiseTable(res.body);
      }else{
        swal.fire({
          title: 'Error',
          text: res.message,
          type: "warning",
        })
      }
    },
    error:function (err) {
      console.log(err);
    }
  });
}

function showDivisionWiseTable(data) {
  $('#Expo').show();
  $('#Expo tbody').html('');
  data.forEach((c, i) => {
    let data = JSON.stringify(c);
    let aggstatus = '';
    if(c.aggrement_status == "Y"){
      aggstatus = 'Allocation Type Quantity';
    }else{
      aggstatus = 'Allowed Type Quantity';
    }
    let phase = '';
    if(c.phase == "Y"){
      phase = 'Phase Allocation';
    }else{
      phase = 'Normal';
    }
    let tr =  '<tr id="tr'+i+'">'+
                '<td>'+(i+1)+'</td>'+
                '<td>'+c.industryname+'</td>'+
                '<td>'+c.watersource+'</td>'+
                '<td>'+c.purposedesc+'</td>'+
                '<td>'+c.basinname+'</td>'+
                '<td>'+c.rivername+'</td>'+
                '<td>'+c.damname+'</td>'+
                '<td>'+c.allocation_qty+'</td>'+
                '<td>'+c.aggrement_qty+'</td>'+
                '<td>'+aggstatus+'</td>'+
                '<td>'+phase+'</td>'+
                '<td>'+
                    '<button class="btn fa-xs"><i class="fa fa-edit" id="AllocationEditBtnClick" ></i></button>&nbsp;&nbsp;'+
                    '<button class="btn fa-xs"><i class="fa fa-trash" ></i></button>'+
                '</td>'+
            '</tr>';
      $('#Expo tbody').append(tr);
      $('#tr'+i+' td:last button:first').on('click',function() {
        EditAllocation_dtls(data)
      })
      $('#tr'+i+' td:last-child button:last').on('click',function() {
        AllocationDetDel(data)
      })
  });
}

function EditAllocation_dtls(data) {
  var data = JSON.parse(data)
  console.log(data);
  let secreat = {};
  secreat._csrf = $('#csrf').val();
  $.ajax({
    url:'editphaseallocation-getDropdownData?source_cd='+data.source_cd+'&basinid='+data.basin,
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
          op+= '<option value=\"'+res.dam[i].damid+'\" selected>'+res.dam[i].damname+'</option>';
        }else{
          op+= '<option value=\"'+res.dam[i].damid+'\">'+res.dam[i].damname+'</option>';
        }
      }
      $("#dam").html('');
      $("#dam").append(op3);
    },
    error:function (err) {
      console.error(err);
    }
  })
  $('#industryName').html(data.industryname);
  $('#divisionName').html(data.ee_name);
  $('#wsource').val(data.source_cd);
  $('#aggrement_status').val(data.aggrement_status);
  $("#AlloQty").val(data.allocation_qty);
  $("#Agordno").val(data.aggrement_orderno);
  $("#AgoQty").val(data.aggrement_qty);
  //hidden fields
  $('#serialno').val(data.serialno),
  $('#alloc_slno').val(data.alloc_slno),
  $("#industry").val(data.industry_code),
  $('#AllocationModal').show();
}

function updatedivWiseAlloc() {
  var data = {
    serialno:$('#serialno').val(),
    alloc_slno:$('#alloc_slno').val(),
    industry_code:$("#industry").val(),
    source_cd:$("#wsource").val(),
    purpose_cd:$("#wPurpose").val(),
    basin:$("#basin").val(),
    river:$("#river").val(),
    dam:$("#dam").val(),
    allocation_qty:$("#AlloQty").val(),
    aggrement_orderno:$("#Agordno").val(),
    aggrement_qty:$("#AgoQty").val(),
    aggrement_status:$('#aggrement_status').val()
  }
  data._csrf = $('#csrf').val();
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
          }, 3000)
        })
      }
    }).then((result) => {
      if (result.value) {
          $.ajax({
            url:'allocationdetails-updatedivWise',
            method:'post',
            data:data,
            success:function(res){
              console.log(res);
              if(res.message == 'success'){
                swal.fire({
                  title: 'Done',
                  text: "Record Saved Successfully",
                  type: "success",
                }).then(()=>{
                    $('#AllocationModal').hide();
                    $('#industry').val('');
                    getAllocDetByDivisionWise();
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

//division wise delete allocation
function AllocationDetDel(data) {
  var data = JSON.parse(data)
  //console.log(data);
  //data._csrf = $('#csrf').val();
  swal.fire({
    title: "Are you sure want to Delete?",
    type: "warning",
    showCancelButton: true,
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
          }, 2000)
        })
      }
    }).then((result) => {
      if (result.value) {
          $.ajax({
            url:'allocationdetails-deletedivWise',
            method:'post',
            data:{serialno:data.serialno,alloc_slno:data.alloc_slno,industry_code:data.industry_code,_csrf:$('#csrf').val()},
            success:function(res){
              console.log(res);
              if(res.message == 'success'){
                swal.fire({
                  title: 'Done',
                  text: "Record Deleted Successfully",
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
  let division = $('#division').val();
  if(division == ''){
    swal.fire({
      text: "Select Division",
      type: "warning",
    })
  }else{
    let financial_Year = $('#financial_Year').val();
    $.ajax({
      url:'target-view?division='+division+'&financial_Year='+financial_Year,
      method:'get',
      async:false,
      data:{_csrf:$('#csrf').val()},
      success:function(res){
        //console.log(res);
        $('#targetTbl tbody').html('');
        if(res.message == 'success'){
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
}

function UpdateTarget() {
  var arr = [];
  $('#targetTbl tbody tr').each(function() {
    let data = {
      division:$('#division').val(),
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
            url:'target-update',
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
                  title: 'Error',
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

function get_currArr(){
  var financial_Year = $('#financial_Year').val();
  $.ajax({
    url:'target-view-divisionWise?financial_Year='+financial_Year,
    method:'get',
    data:{_csrf:$('#csrf').val()},
    success:function(res){
      if(res.message == 'success'){
        $('#divwisetargetTbl').show();
        $('#divwisetargetTbl tbody').html('');
        if(res.body.length > 0){
          res.body.forEach((x, i) => {
            var tr = '<tr>'+
                        '<td>'+(i+1)+'</td>'+
                        '<td>'+x.division+'</td>'+
                        '<td>'+x.curr_target+'</td>'+
                        '<td>'+x.arr_target+'</td>'+
                        '<td>'+x.total_arr_curr+'</td>'+
                    '</tr>';
            $('#divwisetargetTbl tbody').append(tr);
          })
        }else{
          $('#divwisetargetTbl tbody').append('<td colspan="5">No Data found</td>');
        }
      }else{
        swal.fire({
          title: 'Error',
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

function get_targetAchievement(){
  var financial_year = $('#financial_Year').val();
  var division = $('#division').val();
  var month_code = $('#month_code').val();
  if(division == ""){
    swal.fire({
      text: "Select Division",
      type: "warning",
    })
  }else if (financial_year == '') {
    swal.fire({
      text: "Select financial year",
      type: "warning",
    })
  }else{
    $.ajax({
      url:'divisionachievement-getdata',
      method:'post',
      data:{division:division,month_code:month_code,financial_year:financial_year,_csrf:$('#csrf').val()},
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
            title: 'Error',
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

function UpdateTargetachievements() {
  let ids = ['division','financial_Year','month_code','Curr_Target',
  'Arr_Target','Current_Target_Achieved','Arrear_Target_Achieved']
  let status = validateAndMsg(ids);
  if(status){
    var data = {
      financial_year:$('#financial_Year').val(),
      division:$('#division').val(),
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
              url:'divisionachievement-updatedata',
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
}
