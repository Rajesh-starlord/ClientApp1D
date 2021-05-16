
//Utils:::DateFormatter
const DateFormatter = {
    getStringDate:(timestamp) => {
      var date = new Date(timestamp);
      var day = (parseInt(date.getDate()) < 10 )?('0'+date.getDate()):date.getDate();
      var month = (parseInt(date.getMonth()+1) < 10 ) ?('0'+(date.getMonth()+1)):(date.getMonth()+1);
      var year = date.getFullYear();
      date = day+'/'+month+'/'+year;
      return date;
    }
}

//Utils:::FinancialYear Formatting
const FinancialYear = {
  getFinancialear:(currentYear,month) => {
    var finantialyear = currentYear;
    if(month > 3){
      finantialyear = currentYear+'-'+(parseInt(currentYear)+1).toString().substr(2,3);
    }else if(month < 4){
      finantialyear = (parseInt(currentYear)-1)+'-'+currentYear.toString().substr(2,3);
    }
    return finantialyear;
  }
}

module.exports = {DateFormatter,FinancialYear};
