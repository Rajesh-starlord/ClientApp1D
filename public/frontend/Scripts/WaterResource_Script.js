/// <reference path="1.5.8.angular.min.js" />

var app = angular.module('WaterResourceApp', ['angular.filter']);
app.directive('validNumber', function () {
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            if (!ngModelCtrl) {
                return;
            }
            ngModelCtrl.$parsers.push(function (val) {
                if (angular.isUndefined(val)) {
                    var val = '';
                }
                var clean = val.replace(/[^0-9\.]/g, '');
                var negativeCheck = clean.split('-');
                var decimalCheck = clean.split('.');
                if (!angular.isUndefined(negativeCheck[1])) {
                    negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
                    clean = negativeCheck[0] + '-' + negativeCheck[1];
                    if (negativeCheck[0].length > 0) {
                        clean = negativeCheck[0];
                    }
                }
                if (!angular.isUndefined(decimalCheck[1])) {
                    decimalCheck[1] = decimalCheck[1].slice(0, 2);
                    clean = decimalCheck[0] + '.' + decimalCheck[1];
                }
                if (val !== clean) {
                    ngModelCtrl.$setViewValue(clean);
                    ngModelCtrl.$render();
                }
                return clean;
            });
            element.bind('keypress', function (event) {
                if (event.keyCode === 32) {
                    event.preventDefault();
                }
            });
        }
    };
});

app.directive("limitTo", [function () {
    return {
        restrict: "A",
        link: function (scope, elem, attrs) {
            var limit = parseInt(attrs.limitTo);
            angular.element(elem).on("keypress", function (e) {
                if (this.value.length == limit) e.preventDefault();

            });
            angular.element(elem).on("focusout", function (e) {
                if (this.value.length != limit) {

                    this.value = '';
                }

            });
        }
    }
}]);
app.directive('capitalize', function () {
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            var capitalize = function (inputValue) {
                if (inputValue == undefined) inputValue = '';
                var capitalized = inputValue.toUpperCase();
                if (capitalized !== inputValue) {
                    ngModelCtrl.$setViewValue(capitalized);
                    ngModelCtrl.$render();
                }
                return capitalized;
            }
            ngModelCtrl.$parsers.push(capitalize);
            capitalize(scope[attrs.ngModel]);
        }
    };
});

app.directive('loading', ['$http', function ($http) {
    return {
        restrict: 'A',
        template: '<div class="loading">Loading&#8230;</div>',
        link: function (scope, elm, attrs) {
            scope.isLoading = function () {
                return $http.pendingRequests.length > 0;
            };
            scope.$watch(scope.isLoading, function (v) {
                if (v) {
                    elm.css('display', 'block');
                } else {
                    elm.css('display', 'none');
                }
            });
        }
    };
}]);
app.directive('numbersOnly', function () {
    return {

        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');
                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }


            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});
app.directive('negetiveNumbers', function () {
    return {

        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    //var transformedInput = text.replace(/[^0-9]/g, '');
                    var transformedInput = text.replace(/^-?[0-9]\d*(\.\d+)?$/, '');
                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }


            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});

app.filter('numberFixedLen', function () {
    return function (n, len) {
        var num = parseInt(n, 10);
        len = parseInt(len, 10);
        if (isNaN(num) || isNaN(len)) {
            return n;
        }
        num = '' + num;
        while (num.length < len) {
            num = '0' + num;
        }
        return num;
    };
});
//app.directive('restrictDirective', function () {
//    function link(scope, elem, attrs, ngModel) {
//        ngModel.$parsers.push(function (viewValue) {
//            console.log(elem);
//            console.log(attrs);
//            debugger;
//            var reg = /^[a-zA-Z0-9]*$/;
//            var elm = new RegExp(elem[0].pattern);
//            //var elm1 = elm.replace('"', " ");
//            if (viewValue.match(elm)) {
//                return viewValue;
//            }
//            var transformedValue = ngModel.$modelValue || ngModel.$$rawModelValue;
//            ngModel.$setViewValue(transformedValue);
//            ngModel.$render();
//            debugger;
//            return transformedValue;
//        });
//    }

//    return {
//        restrict: 'A',
//        require: 'ngModel',
//        link: link
//    };
//});

app.controller('WaterResourceController', function ($scope, $http, $location, $filter, $timeout, $window, $q) {
    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@@#\$%\^&\*])(?=.{8,})");
    var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
    $scope.passwordflag = false;
    $scope.passwordText;
    $scope.passwordStrength = {};
    var token = document.getElementsByName('__RequestVerificationToken')[0].value;
    $scope.analyze = function (value) {
        if (strongRegex.test(value)) {
            $scope.passwordStrength["color"] = "green";
            $scope.passwordText = " * Strong";
            $scope.passwordflag = true;
            $scope.btnSave = true;
        } else if (mediumRegex.test(value)) {
            $scope.passwordStrength["color"] = "orange";
            $scope.passwordText = "* Medium";
            $scope.passwordflag = true;
            $scope.btnSave = false;

        } else {

            $scope.passwordStrength["color"] = "red";
            $scope.passwordText = " * Weak"
            $scope.passwordflag = false;
            $scope.btnSave = false;
        }

    };

    $scope.resetform = function () {
        $scope.passwordflag = false;
        $scope.p = null;
    };

    $scope.UserRegister = function () {
        //debugger;
        if ($scope.passwordText == " * Strong") {

            var pass = $scope.txtPassword; var cnfpass = $scope.txtRePassword;
            if (pass == cnfpass) {
                var newhash = sha256_digest($scope.txtPassword);
                var confpass = sha256_digest($scope.txtRePassword);
                //$scope.MyAction = "Register";
                $http({
                    url: 'UserRegistration',
                    method: "POST",
                    datatype: 'json',
                    headers: { '__RequestVerificationToken': token },
                    params: {
                        MyAction: $scope.MyAction, UserID: $scope.txtUserID, Password: newhash, Farm_Name: $scope.ddlFarmName, PAN: $scope.txtPAN, Exec_Eng: $scope.ddlExec_Eng, MobileNo: $scope.txtMobileNo,
                        DistrictID: $scope.ddlDistrict, EmailID: $scope.txtEmailID, CaptchText: $scope.txtCaptcha
                    }

                }).then(function (response) {
                    $scope.Message = response.data.status;
                    if ($scope.Message == "Success") {
                        alert('You have Successfully Registered!!! Please remember your UserID and Password for further Login');
                        window.location.href = "Registration";
                    }
                    else if ($scope.Message == "UnSuccess") {
                        alert('Please after Sometime');
                        window.location.href = "Registration";
                    }
                    else if ($scope.Message == "Mob_Exists") {
                        alert('Mobile Number Already Exists!!! Please check your Mobile Number');
                        window.location.href = "Registration";
                    }
                    else if ($scope.Message == "Email_Exists") {
                        alert('Email ID Already Exists!!! Please check your Email ID');
                        window.location.href = "Registration";
                    }
                    else if ($scope.Message == "User_Exists") {
                        alert('User ID Already Exists!!! Please check your User ID');
                        window.location.href = "Registration";
                    }
                    else if ($scope.Message == "Ind_Exists") {
                        alert('Industry Already Exists!!! Please Contact to your Executive Enginner');
                        window.location.href = "Registration";
                    }
                    else if ($scope.Message == "Captcha_Mis") {
                        alert('Invalid Captcha!!!Please try again');
                        window.location.href = "Registration";
                    }
                    else {
                        alert('Please try After Some time!!! Contact your Administrator');
                        window.location.href = "Registration";
                    }

                });
            }
            else { alert("New Password & Confirm Password are not same"); $scope.txtPassword = ""; $scope.txtRePassword = ""; }
        }
        else { alert("Password Must be 8 or more Than 8 Letters with at least one special character"); $scope.txtPassword = ""; $scope.txtRePassword = ""; }
    }
    $scope.BindDistrict = function () {
        $http({
            url: 'ddl_Dist',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            $scope.lst_Bind_Dist = response.data;
        });
    }
    $scope.BindExecEng = function () {
        $http({
            url: 'ddl_ExecEng',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            $scope.lst_Exec_Eng = response.data;
        });
    }
    $scope.BindIndName = function () {
        $http({
            url: 'ddl_IndName',
            method: "GET",
            datatype: 'json',
            params: { Division: $scope.ddlExec_Eng }
        }).then(function (response) {
            $scope.lst_Ind_Name = response.data;
        });
    }
    $scope.UserLogin = function () {
        var slt = window.rnd;
        var ll = $location.path();

        var pass = $scope.txtPassword;
        var newhash = sha256_digest(slt + sha256_digest(sha256_digest(pass)));
        $scope.txtPassword = newhash;

    }

    $scope.CreateUserLogin = function () {
        $http({
            url: 'Insertuser',
            method: "POST",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: {
                MyAction: $scope.MyAction, UserID: $scope.txtuserid, Roles: $scope.ddlRoles
            }
        }).then(function (response) {
            console.log(response.data);
        });
    }
    $scope.lst_Target = [];
    $scope.BindDivisionCEWS = function () {
        $http({
            url: '../CEWS/ddl_Division',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            $scope.lst_Bind_Division = response.data;

        });
    }
    $scope.ResetSelect = function () {
        $scope.ddlYear = "";
        $scope.lst_Target = "";
    }
    $scope.UserLogin_Index = function () {
        var slt = window.rnd;
        var pass = $scope.txtPassword;
        var newhash = sha256_digest(slt + sha256_digest(sha256_digest(pass)));
        $scope.txtPassword = newhash;
    }
    $scope.ClearInfo = function () {
        $scope.txtUserID = "";
        $scope.txtPassword = "";
        window.location.href = "/forgotpassword";
    }

    $scope.ChangePassword = function () {
        debugger;
        if ($scope.passwordText == " * Strong") {
            var exispwd = sha256_digest($scope.txtExisPWD);
            var newhash = sha256_digest($scope.txtNewPWD);
            var confpass = sha256_digest($scope.txtConfPWD);
            $scope.txtExisPWD = exispwd;
            $scope.txtNewPWD = newhash;
            $scope.txtConfPWD = confpass;
        }
    }

    $scope.checkstatus = function () {
        $http({
            url: 'checkstatus',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
        }).then(function (response) {
            $scope.successdiv = false;
            if (response.data == "Pending" || response.data == "Reject") {
                var clkresponce = confirm("Your Registration status did not Activate yet.Please Contact your Executive Engineer !!!");
                if (clkresponce) {
                    $scope.successdiv = false;
                    window.location.href = "Index";
                }
            }
            else {
                $scope.GetExec_Eng();
                $scope.successdiv = true;
            }
        }).then(function () {
            $http({
                url: 'IndustryWiseSource',
                method: "GET",
                datatype: 'json',
                headers: { '__RequestVerificationToken': token }
            }).then(function (responce) {
                debugger;
                $scope.Lstsource = responce.data;
            })
        });
    }
    $scope.pcheck = true;
    $scope.SourceWisepurposedtls = function () {
        $scope.listofpurpose = "";
        $http({
            url: 'SourceWisepurposedtls',
            method: "GET",
            headers: { '__RequestVerificationToken': token },
            params: { Water_sourceId: $scope.ddlPaymentTowards }
        }).then(function (response) {
            debugger;
            $scope.listofpurpose = response.data;
            if ($scope.listofpurpose.length > 1) {
                $scope.pcheck = false;
                document.getElementById('ddlpurposeTowards').setAttribute('required', 'required')
            }
            if ($scope.listofpurpose.length == 1) {
                $scope.ddlpurposeTowards = $scope.listofpurpose[0].Purpose_CD;
            }
        })
    }
    $scope.GetExec_Eng = function () {

        $http({
            url: 'GetExec_Eng',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: {
                MyAction: $scope.MyAction
            }
        }).then(function (response) {
            $scope.lblExec_Eng = response.data.status;
            $scope.txtAccnt_Head = response.data.status1;   //'0700-80-800-0097-02240-000';
            $scope.Industry_name = response.data.status2;
        })
    }
    $scope.Ins_Trs_Transaction = function () {

        if ($scope.ddlPaymentTowards != null && $scope.ddlPaymentTowards != undefined && $scope.ddlPaymentTowards != "") {
            debugger;
            if ($scope.ddlpurposeTowards != null) {
                if ($scope.txtAmount != null || $scope.txtAmount != undefined || $scope.txtAmount != "") {
                    $http({
                        url: 'Trs_Transaction',
                        method: "POST",
                        headers: { '__RequestVerificationToken': token },
                        params: {
                            Trs_Head: $scope.txtAccnt_Head, Amount: $scope.txtAmount, PaymentTowards: $scope.ddlPaymentTowards, EE_Name: $scope.lblExec_Eng, CaptchText: $scope.txtCaptcha, Purpose_CD: $scope.ddlpurposeTowards
                        }
                    }).then(function () {
                        //debugger;
                        window.location.href = "Treasury";
                    });
                }
                else {
                    alert('Enter Valid Amount');
                }
            }
            else {
                alert('Please Choose purpose');
            }
        }
        else {
            alert('Choose Payment Towards');
        }
    };

    $scope.printToCart = function (printSectionId) {
        var innerContents = document.getElementById(printSectionId).innerHTML;
        var popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        popupWinindow.document.write('<html><head><link href="~/CSS/style.css" rel="stylesheet" type="text/css" /></script><script src="~/js/font-i-d-min.js"></script><style>.Acknowledgment { width: 100%; }</style></head><body onload="window.print()">' + innerContents + '</html>');
        popupWinindow.document.close();
    }
    $scope.FetchPending = function () {
        //$scope.MyAction = "FetchPending";
        //debugger;
        $http({
            url: 'RegistrationStatus1',
            method: "GET",
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            $scope.lst_BindIndustry = response.data;
        })
    }
    $scope.Industrydetails = function () {
        //debugger;
        $http({
            url: 'ddl_Name',
            method: "GET",
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            //debugger;
            $scope.lstName = response.data;
        })
    }
    $scope.GetMeter = function () {
        //debugger;
        $http({
            url: 'ddl_BindMeter',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: {
                Industry_Code: $scope.ddlIndustry
            }
        }).then(function (response) {
            //debugger;
            $scope.lst_BindMeter = response.data;
        });
    }
    $scope.GetTrandRcv = function () {

        $http({
            url: 'GetAllTrans',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token }

        }).then(function (response) {
            debugger;
            $scope.lst_AllTrans = response.data;
        });
    };
    $scope.GetTrandRcv_Div = function () {
        //debugger;
        $http({
            url: 'GetAllTrans',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token }

        }).then(function (response) {
            debugger;
            $scope.lst_AllTrans = response.data;
        })
    }
    $scope.GetAllData = function (TRSID) {
        debugger;
        $http({
            url: 'GetAllData',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: { TrsID: TRSID }
        }).then(function (response) {
            //debugger;
        });
    }
    $scope.GetAllData_Div = function (TRSID) {
        //debugger;
        $http({
            url: 'GetAllData',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: { TrsID: TRSID }
        }).then(function (response) {
            //debugger;
        });
    }
    $scope.GetTrsData = function () {
        debugger;
        $http({
            url: 'BindChallan',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            debugger;
            $scope.lst_TrsSingleRec = response.data;
            $scope.Industry_Code = response.data.Industry_Code;
            $scope.TrsID = response.data.TrsID;
            $scope.Industry_Name = response.data.Industry_Name;
            $scope.BankTransactionId = response.data.BankTransactionId;
            $scope.Ref_No = response.data.Ref_No;
            $scope.Status = response.data.Status;
            $scope.Dt_Time = response.data.Dt_Time;
            $scope.DistrictName = response.data.DistrictName;
            $scope.EE_Name = response.data.EE_Name;
            $scope.Amount = response.data.Amount;
            $scope.InWordsAmount = response.data.InWordsAmount;
            $scope.Trs_Head = response.data.Trs_Head;
            $scope.Address = response.data.Address;
            $scope.Challan_No = response.data.Challan_No;
            $scope.date = response.data.date;
        });
    }
    $scope.GetTrsData_Div = function () {
        //debugger;
        $http({
            url: 'BindChallan',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            //debugger;
            $scope.lst_TrsSingleRec = response.data;
            $scope.Industry_Code = response.data.Industry_Code;
            $scope.TrsID = response.data.TrsID;
            $scope.Industry_Name = response.data.Industry_Name;
            $scope.BankTransactionId = response.data.BankTransactionId;
            $scope.Ref_No = response.data.Ref_No;
            $scope.Status = response.data.Status;
            $scope.Dt_Time = response.data.Dt_Time;
            $scope.DistrictName = response.data.DistrictName;
            $scope.EE_Name = response.data.EE_Name;
            $scope.Amount = response.data.Amount;
            $scope.InWordsAmount = response.data.InWordsAmount;
            $scope.Trs_Head = response.data.Trs_Head;
            $scope.Address = response.data.Address;
        });
    }
    $scope.WaterSourcedtls = function () {
        $http({
            url: 'ddl_watersource',
            method: "GET",
            headers: { '__RequestVerificationToken': token }

        }).then(function (response) {
            //debugger;
            $scope.lstName_watersource = response.data;
        })
    }

    $scope.IndWiseWaterSourcedtls = function () {
        debugger;
        $http({
            url: 'IndustryWiseSource',
            method: "GET",
            headers: { '__RequestVerificationToken': token },
            params: { Industry_Code: $scope.ddlIndustry }
        }).then(function (response) {
            $scope.listofwatersource = response.data;
        })
    }
    $scope.SourceWiseprpsdtls = function () {
        $scope.listofpurpose = "";
        $http({
            url: 'sourceWisepurpose',
            method: "GET",
            headers: { '__RequestVerificationToken': token },
            params: { Source_CD: $scope.ddlWaterSource, Industry_Code: $scope.ddlIndustry }
        }).then(function (response) {
            debugger;
            $scope.listofpurpose = response.data;
        })
    }
    $scope.SaveChallanEntry = function () {
        //debugger;
        $http({
            url: 'SaveChallanEntry',
            method: "POST",
            headers: { '__RequestVerificationToken': token },
            params: {
                Industry_Code: $scope.ddlIndustry, Watersource: $scope.ddlWaterSource, month_cd: $scope.ddlMonth, Financial_Year: $scope.ddlYear,
                Challan_No: $scope.txtChallanNumber, Challan_Dt: $scope.txtDate, Challan_Amt: $scope.txtChallanAmt, Remarks: $scope.txtRemarks, Purpose_CD: $scope.ddlWaterPurpose
            }
        }).then(function (response) {
            //debugger;
            $scope.Message = response.data.status;
            if ($scope.Message == "Success") {
                alert('Challan Details Saved Successfully!!!');
                window.location.href = "ChallanEntry";
            }
            else {
                alert('Please try After Some time');
            }
        });
    }
    $scope.Fetch_Meter_Reading = function () {
        $scope.MyAction = "Fetch_Meter_Reading";
        //debugger;
        $http({
            url: 'MeterReadingEntry',
            method: "POST",
            headers: { '__RequestVerificationToken': token },
            params: {
                Industry_Code: $scope.ddlIndustry, MeterId: $scope.ddlMeter
            }
        }).then(function (response) {
            $scope.lst_meter_reading = response.data;
        })
    }
    $scope.Fetch_Meter_Detail = function () {
        $scope.MyAction = "Fetch_Meter_Detail";
        //debugger;
        $http({
            url: 'MeterDetails',
            method: "GET",
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            $scope.lst_meter_reading = response.data;
        })
    }
    $scope.UpdateMeterDet = function (MR) {
        //debugger;
        $http({
            url: 'InsertMeterDet',
            method: "POST",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: {
                Industry_Code: $scope.ddlIndustry, MeterId: $scope.ddlMeter, month_cd: MR.month_cd, month: MR.month, year: MR.year, initial_reading: MR.initial_reading, final_reading: MR.final_reading,
                arrear: MR.arrear, intrest: MR.intrest, penalty: MR.penalty, commitment_charge: MR.commitment_charge
            }
        }).then(function (response) {
            $scope.Message = response.data.status;
            if ($scope.Message == "Success") {
                alert('Meter Reading Saved Sucessfully...');
                $http({
                    url: 'MeterReadingEntry',
                    method: "POST",
                    headers: { '__RequestVerificationToken': token },
                    params: {
                        Industry_Code: $scope.ddlIndustry, MeterId: $scope.ddlMeter
                    }
                }).then(function (response) {
                    $scope.lst_meter_reading = response.data;
                })
            }
            else {
                alert('Please after Sometime');
                window.location.href = "MeterReadingEntry";
            }


        });

    }
    $scope.ActivateStatus = function (Industry_Code) {
        //debugger;
        //  $scope.MyAction = "Activate";
        $http({
            url: 'ActivateStatus',
            method: "POST",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: { Industry_Code: Industry_Code },
        }).then(function (response) {
            //debugger;
            $scope.Message = response.data.status;
            if ($scope.Message == "Success") {
                alert('Data Saved Successfully');
                window.location.href = "RegistrationStatus";
            }
            else {
                alert('Sorry Please try after some time');
                window.location.href = "RegistrationStatus";
            }
        })
    }
    $scope.RejectStatus = function (Industry_Code) {
        //debugger;
        //  $scope.MyAction = "Activate";
        $http({
            url: 'RejectStatus',
            method: "POST",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: { Industry_Code: Industry_Code },
        }).then(function (response) {
            $scope.Message = response.data.status;
            if ($scope.Message == "Success") {
                alert('Data Saved Successfully');
                window.location.href = "RegistrationStatus";
            }
            else {
                alert('Sorry Please try after some time');
                window.location.href = "RegistrationStatus";
            }
        })
    }

    $scope.VerifyInfo = function () {
        //   $scope.MyAction = 'GetExec_Eng';
        //debugger;
        $http({
            url: 'VerifyInfo',
            method: "get",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: {
                PAN: $scope.txtPAN, MobileNo: $scope.txtMobile
            }
        }).then(function (response) {
            //debugger;
            if (response.data.status != "No PAN" && response.data.status != "No Mob") {
                $scope.lblRegName = response.data.status;
                $scope.hdnCode = response.data.status1;
                $scope.txtOTP = response.data.status1;
            }
            else {
                alert($scope.hdnCode);
                alert('Invalid Information');
            }
        });
    }

    $scope.CheckCode = function () {
        //debugger;
        if ($scope.txtOTP == $scope.hdnCode) {
            $scope.imgCode = true;
        }
    }

    $scope.getUserID = function (SS) {
        //debugger;
        if (SS == "Y") {
            $scope.rdInfoY = "Y";
        }
        else if (SS == "N") {
            $scope.rdInfoY = "N";
        }
        else {

        }
    }

    $scope.SaveUserIDPWD = function () {
        //debugger;
        if ($scope.passwordText == " * Strong") {
            var pass = $scope.txtPassword; var cnfpass = $scope.txtRePassword;
            if (pass == cnfpass) {
                var newhash = sha256_digest(pass);
                var confpass = sha256_digest(cnfpass);
                $http({
                    url: 'ChangeUIDPWD',
                    method: "POST",
                    datatype: 'json',
                    headers: { '__RequestVerificationToken': token },
                    params: {
                        UserID: $scope.txtUserID, Password: newhash, MobileNo: $scope.txtMobile, PAN: $scope.txtPAN
                    }
                }).then(function (response) {
                    $scope.Message = response.data.status;
                    if ($scope.Message == "Success") {
                        alert('You have Successfully Changed your User ID and Password!!! Please remember your UserID and Password for further Login');
                        window.location.href = "PasswordRecovery";
                    }
                    else {
                        alert('Please try After Some time!!! Contact your Administrator');
                        window.location.href = "PasswordRecovery";
                    }
                })
            }
        }
    }

    $scope.BindDivision = function () {
        //debugger;
        $http({
            url: 'ddl_ExecEng',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            //debugger;
            $scope.lst_Exec_Eng = response.data;
            $scope.BindBasin();
        });
    }

    $scope.BindBasin = function () {
        $http({
            url: 'ddl_Basin',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            //debugger;
            $scope.lst_Basin = response.data;
        });
    }

    $scope.WaterPurpose = function () {
        //debugger;
        $scope.Purpose_CD = "";

        $http({
            url: 'ddl_WaterPurpose',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: { Source_CD: $scope.ddlWaterSource }
        }).then(function (response) {
            //debugger;
            $scope.lst_WaterPurpose = response.data;
        });
    }
    $scope.InsertMeterDet = function () {
        var txtDateOfCommissioning = document.getElementById('txtDateOfCommissioning').value;
        var txtSealDate = document.getElementById('txtSealDate').value;
        var txtInitialInspectionDate = document.getElementById('txtInitialInspectionDate').value;
        var txtDateOfCalibration = document.getElementById('txtDateOfCalibration').value;
        $scope.MyAction = "I";
        var prcdata = {
            IndustryId: $scope.ddlIndustry, Make: $scope.txtMake, Unit_Id: $scope.ddlUnit, SerialNo: $scope.txtSerialNo, MaxDigits: $scope.txtMaxDigit, CommissioningDate: txtDateOfCommissioning, SealDate: txtSealDate, InitialInspectionDate: txtInitialInspectionDate, CalibrationDate: txtDateOfCalibration, Source_CD: $scope.ddlWaterSource, BasinID: $scope.ddlBasin, RiverID: $scope.ddlRiver, purpose_CD: $scope.ddlWaterPurpose, DamID: $scope.ddlDam, MeterId: $scope.MeterIdpk
        };

        var myAction = {
            method: 'POST',
            url: 'MeterDet_Entry',
            headers: { '__RequestVerificationToken': token },
            //datatype: 'json',
            data: { objsnew: prcdata }
        };
        $http(myAction).then(function success(response) {
            //debugger;
            $scope.Message = response.data.status;
            if ($scope.Message == "Success") {
                alert('Data saved successfully !');
                window.location.href = "MeterDetails";
            }
            else if ($scope.Message != null) {
                alert($scope.Message);
            }
            else {
                alert('Data Proccesing Failed Please try after some time !');
                window.location.href = "MeterDetails";
            }
        });
    }
    $scope.Fetch_Meter_Details = function () {

        //debugger;
        $http({
            url: 'MeterDetails_all',
            method: "GET",
            headers: { '__RequestVerificationToken': token },
        }).then(function (response) {
            $scope.lst_meter_details = response.data;
        })
    }
    $scope.chkPhase = false;
    $scope.WaterSource = function () {
        //debugger;
        $http({
            url: 'ddl_WaterSource',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            $scope.lst_WaterSource = response.data;
        });
    };
    $scope.lst_Dam = [];
    $scope.BindDam = function () {
        $scope.lst_Dam.length = 0;
        if ($scope.ddlWaterSource == "IW" && $scope.ddlRiver) {
            //debugger;
            BindDam();
        }
    };
    function BindDam() {
        //debugger;
        $http({
            url: 'ddl_Dam',
            method: "Get",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: { BasinID: $scope.ddlBasin }
        }).then(function (response) {
            //debugger;
            $scope.lst_Dam = response.data;
        });
    }
    $scope.BindRiver = function () {
        $scope.lst_Dam.length = 0;
        //debugger;
        $http({
            url: 'ddl_River',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: { BasinID: $scope.ddlBasin, Source_CD: $scope.ddlWaterSource },
        }).then(function (response) {

            //debugger;
            if ($scope.ddlWaterSource == "GWS") {
                $scope.lst_Dam = ""; $scope.lst_River = response.data;
            }
            else if ($scope.ddlWaterSource == "GW") {

            }
            else if ($scope.ddlWaterSource == "IW") {
                $scope.lst_River = response.data;
                $scope.lst_Dam.length = 0;
            }
            else {
                $scope.lst_Dam = ""; $scope.lst_River = "";
            }
            console.log($scope.lst_Dam);
        });

    }
    $scope.Ind_Info = function () {
        debugger;
        var objnew1 = "";
        if ($scope.chkPhase == true) {
            var ch = 'Y';
            objnew1 = $scope.AllocPh;
            var objnew2 = $scope.AllPhaseRecdnew;
        }
        else if ($scope.chkPhase == false) {
            var ch = 'N';
            objnew1 = $scope.AllRecdnew;
        }
        else {

        }
        var orddt = document.getElementById("orddt").value;
        var objnew = {

            MyAction: $scope.MyAction, IndustryName: $scope.txtIndustryName, Division: $scope.ddlDivision, Address: $scope.txtAddress,
            Status: $scope.rdStatus, Industry_Type: $scope.rdType,
            PIN: $scope.txtPIN, Source_CD: $scope.ddlWaterSource, Purpose_CD: $scope.ddlWaterPurpose, Allocation_Qty: $scope.AlloQty,
            OrderNo: $scope.ordno, OrderDate: orddt, PhaseAllocation: ch
        };

        $http({
            url: 'Ins_Ind_Info',
            method: "POST",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            data: { objnew: objnew, objnew1: objnew1, objnew2: objnew2 }
        }).then(function (response) {
            debugger;
            $scope.Message = response.data.status;
            if ($scope.Message == "Success") {
                alert('You have Successfully Submitted Data');
                window.location.href = "PhaseAllocation";
            }
            else {
                alert('Please try after some time');
                //window.location.href = "PhaseAllocation";
            }
        });


    }
    $scope.Reset = function () {
        window.location.reload();
    }
    $scope.AllRecdnew = [];
    $scope.IndStsChng = function () {
        $scope.StsMsg = "";
    };
    $scope.IndTypChng = function () {
        $scope.TypMsg = "";
    };
    $scope.RemoveIndAlloc = function (indx) {
        $scope.AllRecdnew.splice(indx, 1);
    };
    $scope.adddet = function () {
        debugger;
        if (!$scope.rdStatus) {
            $scope.StsMsg = "Industry Status Required";
            return;
        }
        else {
            $scope.StsMsg = "";
        }
        if (!$scope.rdType) {
            $scope.TypMsg = "Industry Type Required";
            return;
        }
        else {
            $scope.TypMsg = "";
        }
        var chk;
        if ($scope.chkPhase == true) {
            chk = "Y";
        }
        else { chk = "N"; }
        var orddt = document.getElementById('orddt').value;
        var Agdt = document.getElementById('Agdt').value;
        var frmdt = document.getElementById('frmdt').value;
        var todt = document.getElementById('todt').value;
        $scope.AllRecdnew.push({
            Source_CD: $scope.ddlWaterSource, Purpose_CD: $scope.ddlWaterPurpose, Basin: $scope.ddlBasin,
            River_Nalla: $scope.ddlRiver, Dam: $scope.ddlDam, Allocation_Qty: $scope.AlloQty, OrderDate: orddt,
            OrderNo: $scope.ordno, Aggrement_OrderNo: $scope.Agordno, Aggrement_Qty: $scope.AgoQty, Aggrement_DT: Agdt,
            From_DT: frmdt, To_DT: todt, PhaseAllocation: chk
        });
        $scope.ddlWaterSource = "";
        $scope.ddlWaterPurpose = "";
        $scope.ddlBasin = "";
        $scope.ddlRiver = "";
        $scope.ddlDam = "";
        $scope.AlloQty = "";
        $scope.orddt = "";
        $scope.ordno = "";
        $scope.Agordno = "";
        $scope.AgoQty = "";
        $scope.Agdt = "";
        $scope.frmdt = "";
        $scope.todt = "";
    };
    $scope.AllPhaseRecdnew = [];
    $scope.AllocPh = [];
    $scope.RemoveIndPhase = function (indx) {
        $scope.AllPhaseRecdnew.splice(indx, 1);
    };
    $scope.addPhasedet = function () {
        debugger;
        if (!$scope.rdStatus) {
            $scope.StsMsg = "Industry Status Required";
            return;
        }
        else {
            $scope.StsMsg = "";
        }
        if (!$scope.rdType) {
            $scope.TypMsg = "Industry Type Required";
            return;
        }
        else {
            $scope.TypMsg = "";
        }
        var chk;
        if ($scope.chkPhase == true) {
            chk = "Y";
        }
        else { chk = "N"; }
        var txtPhaseFrom_DT = document.getElementById('txtPhaseFrom_DT').value;
        var orddt = document.getElementById('orddt').value;
        var txtPhaseTo_DT = document.getElementById('txtPhaseTo_DT').value;
        var txtPhaseAggrement_DT = document.getElementById('txtPhaseAggrement_DT').value;
        var txtPhaseAggr_From_DT = document.getElementById('txtPhaseAggr_From_DT').value;
        var txtPhaseAggr_To_DT = document.getElementById('txtPhaseAggr_To_DT').value;
        $scope.AllPhaseRecdnew.push({
            Source_CD: $scope.ddlWaterSource, Purpose_CD: $scope.ddlWaterPurpose, Basin: $scope.ddlBasin, PhaseAllocation: chk,
            River_Nalla: $scope.ddlRiver, Dam: $scope.ddlDam, Allocation_Qty: $scope.AlloQty, OrderDate: orddt,
            OrderNo: $scope.ordno, Phase: $scope.txtPhase, PhaseAllocation_Qty: $scope.txtAlloQty, PhaseFrom_DT: txtPhaseFrom_DT, PhaseTo_DT: txtPhaseTo_DT,
            PhaseAggrement_OrderNo: $scope.txtPhaseAggrement_OrderNo, PhaseAggrement_DT: txtPhaseAggrement_DT,
            PhaseAggr_From_DT: txtPhaseAggr_From_DT, PhaseAggr_To_DT: txtPhaseAggr_To_DT, PhaseAggr_Qty: $scope.txtPhaseAggr_Qty
        });

        $scope.AllocPh.push({
            Source_CD: $scope.ddlWaterSource, Purpose_CD: $scope.ddlWaterPurpose, Basin: $scope.ddlBasin,
            River_Nalla: $scope.ddlRiver, Dam: $scope.ddlDam, Allocation_Qty: $scope.AlloQty, OrderDate: orddt,
            OrderNo: $scope.ordno,

            Aggrement_OrderNo: $scope.txtPhaseAggrement_OrderNo, Aggrement_Qty: $scope.AgoQty, Aggrement_DT: txtPhaseAggrement_DT,
            From_DT: txtPhaseAggr_From_DT, To_DT: txtPhaseAggr_To_DT, PhaseAllocation: chk, Phase: chk
        });

        $scope.ddlWaterSource = "";
        $scope.ddlWaterPurpose = "";
        $scope.ddlBasin = "";
        $scope.ddlRiver = "";
        $scope.ddlDam = "";
        //$scope.AlloQty = "";
        //$scope.orddt = "";
        //$scope.ordno = "";
        $scope.txtPhase = "";
        $scope.txtAlloQty = "";
        $scope.txtPhaseFrom_DT = "";
        $scope.txtPhaseTo_DT = "";
        $scope.txtPhaseAggrement_OrderNo = "";
        $scope.txtPhaseAggrement_DT = "";
        $scope.txtPhaseAggr_From_DT = "";
        $scope.txtPhaseAggr_To_DT = "";
        //$scope.txtPhaseAggr_Qty = "";
    };
    $scope.EditMeter = function (MR) {
        debugger;
        $scope.ddlIndustry = MR.Industry_Code;
        $http({
            url: 'ddl_Unit',
            method: "GET",
            headers: { '__RequestVerificationToken': token },
        }).then(function (response) {
            $scope.lstUnit = response.data;
        });
        $scope.ddlUnit = MR.UnitId
        $http({
            url: 'IndustryWiseSource',
            method: "GET",
            headers: { '__RequestVerificationToken': token },
            params: { Industry_Code: $scope.ddlIndustry }
        }).then(function (response) {
            $scope.listofwatersource = response.data;
        })
        $scope.ddlWaterSource = MR.WaterSourceId;
        $http({
            url: 'sourceWisepurpose',
            method: "GET",
            headers: { '__RequestVerificationToken': token },
            params: { Source_CD: $scope.ddlWaterSource, Industry_Code: $scope.ddlIndustry }
        }).then(function (response) {
            debugger;
            $scope.listofpurpose = response.data;
        })
        $scope.ddlWaterPurpose = MR.Purpose_CD;
        debugger;
        $scope.txtMake = MR.Make;
        $scope.txtSerialNo = MR.SerialNo;
        $scope.txtMaxDigit = MR.MaxDigits;
        $scope.txtDateOfCommissioning = MR.CommissioningDate;
        $scope.txtSealDate = MR.SealDate;
        $scope.txtDateOfCalibration = MR.CalibrationDate;
        $scope.txtInitialInspectionDate = MR.InitialInspectionDate;
        $http({
            url: 'ddl_Basin',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            //debugger;
            $scope.lst_Basin = response.data;
        });
        $scope.ddlBasin = MR.BasinId;
        $http({
            url: 'ddl_River',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: { BasinID: $scope.ddlBasin, Source_CD: $scope.ddlWaterSource },
        }).then(function (response) {

            if ($scope.ddlWaterSource == "GWS") {
                $scope.lst_Dam = ""; $scope.lst_River = response.data;
            }
            else if ($scope.ddlWaterSource == "GW") {

            }
            else if ($scope.ddlWaterSource == "IW") {
                $scope.lst_River = response.data;
                $scope.lst_Dam.length = 0;
            }
            else {
                $scope.lst_Dam = ""; $scope.lst_River = "";
            }
            // console.log($scope.lst_Dam);
        });
        $scope.ddlRiver = MR.RiverId;
        $http({
            url: 'ddl_Dam',
            method: "Get",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: { BasinID: $scope.ddlBasin }
        }).then(function (response) {
            //debugger;
            $scope.lst_Dam = response.data;
        });
        $scope.ddlDam = MR.DamId;
        $scope.MeterIdpk = MR.MeterId;

    }

    //BISWAJIT
    $scope.billingtbl = {};
    $scope.Allmeter = [];
    $scope.allmonths = [];

    $scope.AllMeterIndustryWise = function () {
        $http({
            method: 'get',
            url: 'AllMeterIndustryWise',
            headers: { '__RequestVerificationToken': token }
        }).success(function (data) {
            $scope.Allmeter = data;
            $scope.ntt = { final_read: "", ddlmonth: "", ddlyr: "", Diffmeterread: "", meterRate: "", chkbox: "", finalRead: "", finaltxtRead: "", initialtxtRead: "", allmonths: "", status: null, meterunitrate: "" };
            $scope.ntt.initialtxtRead = true;
            $scope.ntt.finaltxtRead = true;
            $scope.ntt.initialRead = false;
            $scope.ntt.finalRead = false;
            angular.forEach($scope.Allmeter.getmeterdetail, function (value, key) {
                angular.merge(value, $scope.ntt);
            })
        });
    };

    $scope.getmonthlst = function (nt) {
        $http({
            method: 'get',
            url: 'getmonthlist',
            headers: { '__RequestVerificationToken': token },
            params: { fynanceyr: nt.fyyr, meterID: nt.meterID, sourceCD: nt.sourcecode, PurposeCD: nt.purpose_cd }
        }).success(function (data) {
            nt.allmonths = data.getallmonthyr;
        });
    };

    $scope.getpricedata = function (nt, indx) {
        $scope.monthId = nt.ddlmonth;
        $scope.MeterID = nt.meterID;
        $scope.fyyr = nt.ddlyr;
        $http({
            method: 'get',
            url: 'getalldtlsmonthwise',
            headers: { '__RequestVerificationToken': token },
            params: { monthid: $scope.monthId, meterID: $scope.MeterID, fyyr: nt.fyyr }
        })
            .success(function (data) {
                debugger;
                nt.initial_dt = FromJSONDate(data.Industrywisepurpose.startdate); nt.Enddate = FromJSONDate(data.Industrywisepurpose.Enddate);
                nt.initial_read = data.Industrywisepurpose.Intialreading; nt.final_read = data.Industrywisepurpose.finalreading;
                nt.meterRate = data.Industrywisepurpose.meterRate; nt.Diffmeterread = data.Industrywisepurpose.differncemeterread;
                nt.status = data.Industrywisepurpose.status; nt.meterunitrate = data.Industrywisepurpose.meterunitrate;
                if (nt.initial_read > 0) { nt.initialtxtRead = false; nt.initialRead = true; } else { nt.initialtxtRead = true; nt.initialRead = false; }
                if (nt.final_read > 0) { nt.finalRead = true; nt.finaltxtRead = false; } else { nt.finaltxtRead = true; nt.finalRead = false; }
            });
    };

    function FromJSONDate(date) {
        if (date != null && date != "undefined") {
            var jsonDate = new Date(parseInt(date.substr(6)));
            var newdate = jsonDate.getDate().toString().length === 1 ? "0" + jsonDate.getDate().toString() : jsonDate.getDate().toString();
            var newmonth = (jsonDate.getMonth() + 1).toString().length === 1 ? "0" + (jsonDate.getMonth() + 1).toString() : (jsonDate.getMonth() + 1).toString();
            var Newdate = newdate + '/' + newmonth + '/' + jsonDate.getFullYear().toString();
            return Newdate;
        }
        else { return date; }
    }

    $scope.differencecal = function (nt) {
        debugger;
        if (nt.initial_read == 0) {
            nt.initial_read = nt.initial_read.toString();
        }
        if (nt.initial_read && nt.final_read && nt.initial_read != "" && (nt.final_read != 0 || nt.final_read != "")) {
            $scope.fnlval = nt.final_read; $scope.intlval = nt.initial_read;
            if (parseFloat(nt.initial_read) <= parseFloat(nt.final_read)) {
                nt.Diffmeterread = (parseFloat($scope.fnlval) - parseFloat($scope.intlval)) * parseFloat(nt.meterunitrate);
            }
            else {
                var result = confirm("Is your Meter Initialize ?");
                if (result) {
                    var maxstring = '';
                    if (nt.maxDigit > 0) {
                        nt.maxDigit = parseInt(nt.maxDigit);

                        for (var i = 0; i < nt.maxDigit; i++) {
                            maxstring += '9';
                        }
                    }
                    var maxxvalue = parseFloat(maxstring);
                    var Finalmetervlue = maxxvalue + parseFloat(nt.final_read);
                    nt.Diffmeterread = (parseFloat(Finalmetervlue) - parseFloat($scope.intlval)) * parseFloat(nt.meterunitrate);
                }
                else {
                    nt.Diffmeterread = 0; nt.final_read = 0;
                    return false;
                }
            }
        }
        else { return false; }
        return false;
    }

    $scope.differencecalfst = function (nt) {
        if (nt.initial_read && nt.final_read && nt.initial_read != "" && (nt.final_read != null || nt.final_read != 0) && nt.ddlmonth != "") {
            $scope.fnlval = nt.final_read; $scope.intlval = nt.initial_read;
            if (parseFloat(nt.initial_read) <= parseFloat(nt.final_read)) {
                nt.Diffmeterread = (parseFloat($scope.fnlval) - parseFloat($scope.intlval)) * parseFloat(nt.meterunitrate);
            }
            else {
                var result = confirm("Is your Meter Initialize ?");
                if (result) {
                    var maxstring = '';
                    if (nt.maxDigit > 0) {
                        nt.maxDigit = parseInt(nt.maxDigit);

                        for (var i = 0; i < nt.maxDigit; i++) {
                            maxstring += '9';
                        }
                        debugger;
                    }
                    var maxxvalue = parseFloat(maxstring);
                    var Finalmetervlue = maxxvalue + parseFloat(nt.final_read);
                    nt.Diffmeterread = (parseFloat(Finalmetervlue) - parseFloat($scope.intlval)) * parseFloat(nt.meterunitrate);
                }
                else {
                    nt.Diffmeterread = 0; nt.final_read = 0;
                    return false;
                }
            }
        }
    }

    $scope.meterReadingdtls = [];

    $scope.selectline = function (nt) {
        if (nt.initial_read != null && nt.initial_read != 0 && nt.final_read != null && nt.final_read != 0 && nt.ddlmonth != "") {
            if ($scope.meterReadingdtls.length > 0) {
                if (nt.chkbox == true) {
                    $scope.meterReadingdtls.push({
                        Industry_ID: nt.industryID, Meter_ID: nt.meterID,
                        //Financial_Year: nt.fyyr,
                        Financial_Year: nt.ddlyr,
                        Month_ID: nt.ddlmonth, InitialDate: todate(nt.initial_dt), FinalDate: todate(nt.Enddate),
                        InitialMeterReading: nt.initial_read, FinalMeterReading: nt.final_read,
                        MeterReadingDifference: nt.Diffmeterread, MeterRate: nt.meterRate,
                        Purpose_CD: nt.purpose_cd, watersourceID: nt.sourcecode
                    });
                    console.log($scope.meterReadingdtls);
                    nt.chkbox = true;
                }
                else {
                    angular.forEach($scope.meterReadingdtls, function (value, key) {
                        if (value.Meter_ID == nt.meterID) {
                            $scope.meterReadingdtls.splice(key, 1);
                            nt.chkbox = false;
                        }
                    });
                }

            }
            else {
                $scope.meterReadingdtls.push({
                    Industry_ID: nt.industryID, Meter_ID: nt.meterID,
                    //Financial_Year: nt.fyyr,
                    Financial_Year: nt.ddlyr,
                    Month_ID: nt.ddlmonth, InitialDate: todate(nt.initial_dt), FinalDate: todate(nt.Enddate),
                    InitialMeterReading: nt.initial_read, FinalMeterReading: nt.final_read,
                    MeterReadingDifference: nt.Diffmeterread, MeterRate: nt.meterRate,
                    Purpose_CD: nt.purpose_cd, watersourceID: nt.sourcecode
                });
                console.log($scope.meterReadingdtls);
                nt.chkbox = true;
            }
        }
        else {
            nt.chkbox = false;
            alert("Please Fill all the Field");

        }
    }

    $scope.Edittext = function (nt) {
        nt.finaltxtRead = true; nt.finalRead = false;
        nt.final_read = ""; nt.Diffmeterread = ""; nt.netmeterread = ""; nt.totalamnt = ""; nt.penalty = "";
    }

    $scope.updatetext = function (nt) {
        if ((nt.final_read != null && nt.final_read != 0)) {
            var billinddtls = { Industry_ID: nt.industryID, Meter_ID: nt.meterID, Financial_Year: nt.ddlyr, Month_ID: nt.ddlmonth, InitialDate: nt.initial_dt, FinalDate: nt.Enddate, InitialMeterReading: parseFloat(nt.initial_read), FinalMeterReading: parseFloat(nt.final_read), MeterReadingDifference: nt.Diffmeterread, MeterRate: nt.meterRate };
            $http({
                method: 'POST',
                url: 'updatebillingstts',
                datatype: 'json',
                headers: { '__RequestVerificationToken': token },
                data: { objbillings: billinddtls }
            }).success(function (responce) {
                if (responce == "success") {
                    alert("Data Updated Successfully");
                    window.location.reload();
                }
                else { alert(responce); }
            })
        }
        else { alert('Fill all the fiels before proceed...'); }

    }

    $scope.insertmeterDtls = function () {
        if ($scope.meterReadingdtls.length > 0) {
            var myReq = {
                method: 'POST',
                url: 'InsertmeterReading',
                headers: { '__RequestVerificationToken': token },
                data: { objbilling: $scope.meterReadingdtls }
            };
            $http(myReq).then(function success(response) {
                if (response.data == true) {
                    alert("Data Saved Successfully");
                    window.location.reload();
                }
                else {
                    alert("Failed");
                }
            });
        }
        else {
            alert("please choose the check box before proceed !!!");
        }
    };

    function todate(strdate) {
        var jsonDate = strdate.split("/");
        var Newdate = new Date(jsonDate[2], jsonDate[1] - 1, jsonDate[0]);
        return Newdate;
    }

    //EE
    $scope.GetmeterReadingdtls = [];
    $scope.GetindstryMeter = function (ddlIndustry) {
        debugger;
        $http({
            method: 'get',
            url: 'MeterIndustryWise',
            headers: { '__RequestVerificationToken': token },
            params: { IndustryID: ddlIndustry }
        }).success(function (responce) {
            $scope.Allmeter = responce;
            $scope.ntt = { ddlyr: "", ddlmonth: "", final_read: "", Diffmeterread: "", meterRate: "", chkbox: "", finalRead: "", finaltxtRead: "", initialtxtRead: "", allmonths: "", status: null, meterunitrate: "" };
            $scope.ntt.initialtxtRead = true;
            $scope.ntt.finaltxtRead = true;
            $scope.ntt.initialRead = false;
            $scope.ntt.finalRead = false;
            angular.forEach($scope.Allmeter.getmeterdetail, function (value, key) {
                angular.merge(value, $scope.ntt);
            })
        });
    }

    $scope.getmonthlist = function (nt) {
        if (nt.ddlyr) {
            $http({
                method: 'get',
                url: 'getmonthlist',
                headers: { '__RequestVerificationToken': token },
                params: { fynanceyr: nt.fyyr, meterID: nt.meterID, IndustryID: nt.industryID, sourceCD: nt.sourcecode, PurposeCD: nt.purpose_cd }
            }).success(function (data) {

                nt.allmonths = data.getallmonthyr;
            });
        }
        else {
            nt.allmonths = [];
        }
    };
    $scope.getmonthlistNoMtr = function (nt, scp, yy) {

        //var rr = document.getElementById('ddlyrlst');
        //nt.fyyr = document.getElementById('ddlyrlst').text;
        //nt.fyyr = document.getElementById('ddlyrlst').value;
        //nt.fyyr = document.getElementById('ddlyrlst').selectedOptions[0].text;

        nt.fyyr = scp.ddl;
        $http({
            method: 'get',
            url: 'getmonthlistNoMtr',
            headers: { '__RequestVerificationToken': token },
            params: { fynanceyr: nt.fyyr, meterID: nt.meterID, IndustryID: nt.industryID, sourceCD: nt.sourcecode, PurposeCD: nt.purpose_cd }
        }).success(function (data) {

            nt.allNotApprvMonths = data.getallmonthyrNotApprv;
        });
    };

    $scope.getpricedtls = function (nt, indx) {
        $scope.monthId = nt.ddlmonth;
        $scope.MeterID = nt.meterID;
        $scope.fyyr = nt.ddlyr;
        $http({
            method: 'get',
            url: 'getalldtlsmonthwise',
            headers: { '__RequestVerificationToken': token },
            params: { monthid: $scope.monthId, meterID: $scope.MeterID, IndustryID: $scope.ddlIndustry, fyyr: nt.fyyr }
        })
            .success(function (data) {
                nt.initial_dt = FromJSONDate(data.Industrywisepurpose.startdate);
                nt.Enddate = FromJSONDate(data.Industrywisepurpose.Enddate);
                nt.initial_read = data.Industrywisepurpose.Intialreading;
                nt.final_read = data.Industrywisepurpose.finalreading;
                nt.meterRate = data.Industrywisepurpose.meterRate;
                nt.Diffmeterread = data.Industrywisepurpose.differncemeterread;
                nt.status = data.Industrywisepurpose.status;
                nt.meterunitrate = data.Industrywisepurpose.meterunitrate;
                if (nt.initial_read > 0) {
                    nt.initialtxtRead = false; nt.initialRead = true;
                }
                else { nt.initialtxtRead = true; nt.initialRead = false; }
                if (nt.final_read > 0) {
                    nt.finalRead = true; nt.finaltxtRead = false;
                }
                else { nt.finaltxtRead = true; nt.finalRead = false; }
                var p = document.getElementById("chk");
                debugger;
                if (nt.status != null && nt.status == "Approved") {
                    p.disabled = true;
                }
                else {
                    p.disabled = false;
                }
            });
    };

    $scope.selectchkline = function (nt) {
        if (nt.initial_read != null && nt.final_read != null && nt.final_read != "" && nt.ddlmonth != "") {
            if ($scope.GetmeterReadingdtls.length > 0) {
                if (nt.chkbox == true) {
                    $scope.GetmeterReadingdtls.push({
                        Industry_ID: $scope.ddlIndustry, Meter_ID: nt.meterID, Financial_Year: nt.fyyr, Month_ID: nt.ddlmonth, InitialDate: todate(nt.initial_dt),
                        FinalDate: todate(nt.Enddate), InitialMeterReading: nt.initial_read, FinalMeterReading: nt.final_read, MeterReadingDifference: nt.Diffmeterread, MeterRate: nt.meterRate
                    });
                    console.log($scope.GetmeterReadingdtls);
                    nt.chkbox = true;
                }
                else {
                    angular.forEach($scope.GetmeterReadingdtls, function (value, key) {
                        if (value.Meter_ID == nt.meterID) {
                            $scope.GetmeterReadingdtls.splice(key, 1);
                            nt.chkbox = false;
                        }
                    });
                }
            }
            else {
                $scope.GetmeterReadingdtls.push({ Industry_ID: $scope.ddlIndustry, Meter_ID: nt.meterID, Financial_Year: nt.fyyr, Month_ID: nt.ddlmonth, InitialDate: todate(nt.initial_dt), FinalDate: todate(nt.Enddate), InitialMeterReading: nt.initial_read, FinalMeterReading: nt.final_read, MeterReadingDifference: nt.Diffmeterread, MeterRate: nt.meterRate });
                console.log($scope.GetmeterReadingdtls);
                nt.chkbox = true;
            }
        }
        else {
            nt.chkbox = false;
            alert("Please Fill all the Field");

        }
    };

    $scope.insertmeterDetails = function () {
        if ($scope.GetmeterReadingdtls.length > 0) {
            var myReq = {
                method: 'POST',
                url: 'InsertmeterReadingdtls',
                headers: { '__RequestVerificationToken': token },
                data: { objbilling: $scope.GetmeterReadingdtls }
            };
            $http(myReq).then(function success(response) {
                if (response.data == true) {
                    alert("Data Saved Successfully");
                    //return true;
                    window.location.reload();
                }
                else if (response.data == "Dup") {
                    alert("Record Already Exists.");
                }
                else {
                    alert("Failed");
                }
            });
        }
        else {
            alert("please choose the check box before proceed !!!");
        }
    }

    $scope.Edittext = function (nt) {

        nt.finaltxtRead = true; nt.finalRead = false;
        nt.final_read = ""; nt.Diffmeterread = "";
    };


    $scope.updatemeterread = function (nt) {
        debugger;
        if ((nt.final_read != null || nt.final_read != "" && nt.final_read != 0)) {
            //var Ind = document.getElementById("Ind_CD").value;
            var billinddtls = { Industry_ID: $scope.ddlIndustry, Meter_ID: nt.meterID, Financial_Year: nt.ddlyr, Month_ID: nt.ddlmonth, InitialDate: nt.initial_dt, FinalDate: nt.Enddate, InitialMeterReading: parseFloat(nt.initial_read), FinalMeterReading: parseFloat(nt.final_read), MeterReadingDifference: nt.Diffmeterread, MeterRate: nt.meterRate };
            $http({
                method: 'POST',
                url: 'updatebillingstatus',
                datatype: 'json',
                headers: { '__RequestVerificationToken': token },
                data: { objbillings: billinddtls }
            }).success(function (responce) {
                var k = responce;
                if (k == "success") {
                    alert("Data Updated Successfully");
                    window.location.reload();
                }
                else { alert(k); }
            })
        }
        else { alert('Fill all the fiels before proceed...'); }

    }

    $scope.updateNOmeterread = function (nt) {
        debugger;
        if ((nt.final_read != null || nt.final_read != "" && nt.final_read != 0)) {
            var Ind = document.getElementById("Ind_CD").value;
            var billinddtls = {
                Industry_ID: Ind, Meter_ID: nt.meterID, Financial_Year: nt.yyyr, Month_ID: nt.ddlmonth,
                InitialDate: nt.initial_dt, FinalDate: nt.Enddate, InitialMeterReading: parseFloat(nt.initial_read),
                FinalMeterReading: parseFloat(nt.final_read), MeterReadingDifference: nt.Diffmeterread,
                MeterRate: nt.meterRate, NometerPenalty: nt.Penalty_Rate
            };
            $http({
                method: 'POST',
                url: 'updatebillingstatus',
                datatype: 'json',
                headers: { '__RequestVerificationToken': token },
                data: { objbillings: billinddtls }
            }).success(function (responce) {
                var k = responce;
                if (k == "success") {
                    alert("Data Updated Successfully");
                    window.location.reload();
                }
                else { alert(k); }
            })
        }
        else { alert('Fill all the fiels before proceed...'); }

    }


    $scope.allmonths = function () {
        $http({
            url: 'getAllmonth',
            method: "get",
            headers: { '__RequestVerificationToken': token },
        }).then(function (response) {
            $scope.allmonths = response.data;
        })
    }

    $scope.cancleclk = function () {
        window.location.reload();
    }

    $scope.Getapprvlist = $scope.allyrs = [];
    $scope.Getfinancialyr = function (ddlIndustry) {
        $scope.allyrs.length = 0;
        $http({
            url: "Getfinancialyr",
            method: "get",
            headers: { '__RequestVerificationToken': token },
            params: { IndustryID: ddlIndustry }
        }).success(function (data) {
            //debugger
            $scope.allyrs.length = 0;
            $scope.Getapprvlist.length = 0;
            if (data.length > 0) {
                $scope.allyrs = data;
            }
        })
    }

    $scope.getindustrydetails = function () {
        debugger;
        var objnew = { IndustryID: $scope.ddlIndustry, FinancialYr: $scope.ddlyr, monthID: $scope.ddlmonth };
        $http({
            url: "getindustrydetails",
            method: "get",
            params: objnew
        }).success(function (data) {
            $scope.Getapprvlist = data;
        });
    }

    $scope.updateApproval = function (vm) {
        vm.IndustryID = vm.IndustryID;
        vm.meterID = vm.meterID;
        vm.FinancialYr = vm.FinancialYr;
        vm.monthID = vm.monthID;
        var result = confirm("Are you sure want to Approve ?");
        if (result) {
            $http({
                url: "updateapproveindividual",
                method: "post",
                headers: { '__RequestVerificationToken': token },
                data: { objbill: vm }
            }).success(function (data) {
                if (data == true) {
                    alert("Data updated Successfully");
                    window.location.reload();
                }
                else {
                    alert("Failed");
                }
            });
        }
    };
    //For Hydro Power
    $scope.HPIndustrydetails = function () {
        $http({
            url: 'HPIndustrydetails',
            method: "GET",
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            $scope.lstIndstryName = response.data;
        })
    }
    $scope.Getmetergenerateddtls = [];
    $scope.GetHydropower = function (ddlIndustry) {
        $http({
            method: 'get',
            url: 'HPMeterIndustryWise',
            headers: { '__RequestVerificationToken': token },
            params: { IndustryID: ddlIndustry }
        }).success(function (responce) {
            //debugger;
            $scope.AllHydropower = responce;
            $scope.ntt = { ddlyr: "", ddlmonth: "", Generatedmtrread: "", Generated_mtrread: "", Generated_txtmtrread: "", chkbox: "", allmonths: "", status: null };
            $scope.ntt.Generated_mtrread = false;
            $scope.ntt.Generated_txtmtrread = true;
            angular.forEach($scope.AllHydropower.getHPmeterdetail, function (value, key) {
                angular.merge(value, $scope.ntt);
            });
        });
    };

    $scope.getHPdtls = function (nt, indx) {
        $scope.monthId = nt.ddlmonth;
        $scope.MeterID = nt.meterID;
        $scope.fyyr = nt.ddlyr;
        //debugger;
        $http({
            method: 'get',
            url: 'getallHPdtlsmonthwise',
            headers: { '__RequestVerificationToken': token },
            params: { monthid: $scope.monthId, meterID: $scope.MeterID, IndustryID: nt.industryID, fyyr: $scope.fyyr }
        })
            .success(function (data) {
                nt.initial_dt = FromJSONDate(data.Industrywisegenerated.startdate);
                nt.Enddate = FromJSONDate(data.Industrywisegenerated.Enddate);
                nt.Generatedmtrread = data.Industrywisegenerated.generatedUnit;
                nt.status = data.Industrywisegenerated.status;

                if (nt.Generatedmtrread > 0) {
                    nt.Generated_txtmtrread = false; nt.Generated_mtrread = true;
                }
                else { nt.Generated_txtmtrread = true; nt.Generated_mtrread = false; }
            });
    };
    $scope.EditHydPow = function (nt) {

        nt.Generated_mtrread = false;
        nt.Generated_txtmtrread = true;
        $scope.OldGeneratedmtrread = nt.Generatedmtrread;
        nt.Generatedmtrread = "";
        nt.final_read = ""; nt.Diffmeterread = "";
    };
    $scope.updateHydrometerread = function (nt) {
        debugger;
        //var Ind = document.getElementById("Ind").value;
        var objbillings = [];
        objbillings.push({
            Industry_ID: nt.industryID, Meter_ID: nt.meterID, Financial_Year: nt.fyyr, Month_ID: nt.ddlmonth,
            InitialDate: todate(nt.initial_dt), FinalDate: todate(nt.Enddate), Generated_unit: nt.Generatedmtrread
        });
        $http({
            method: 'Post',
            url: 'UpdateHPReadingdtls',
            headers: { '__RequestVerificationToken': token },
            data: { objbilling: objbillings }
        })
            .then(function success(response) {
                if (response.data == true) {
                    alert("Data Updated Successfully");
                    window.location.reload();
                }
                else {
                    alert("Failed");
                }
            });

    };

    $scope.getHPmonthlist = function (nt) {
        $http({
            method: 'get',
            url: 'getHPmonthlist',
            headers: { '__RequestVerificationToken': token },
            params: { fynanceyr: nt.fyyr, meterID: nt.meterID, IndustryID: nt.industryID, sourceCD: nt.sourcecode, PurposeCD: nt.purpose_cd }
        }).success(function (data) {
            nt.allmonths = data.getallmonthyr;
        });
    };

    $scope.selectlineHp = function (nt) {
        //debugger;
        if (nt.Generatedmtrread != null && nt.Generatedmtrread != 0 && nt.ddlmonth != "") {
            if ($scope.Getmetergenerateddtls.length > 0) {

                if (nt.chkbox == true) {
                    $scope.Getmetergenerateddtls.push({
                        Industry_ID: nt.industryID, Meter_ID: nt.meterID, Financial_Year: nt.fyyr, Month_ID: nt.ddlmonth, InitialDate: todate(nt.initial_dt),
                        FinalDate: todate(nt.Enddate), Generated_unit: nt.Generatedmtrread
                    });
                    console.log($scope.Getmetergenerateddtls);
                    nt.chkbox = true;
                }
                else {
                    angular.forEach($scope.Getmetergenerateddtls, function (value, key) {
                        if (value.Meter_ID == nt.meterID) {
                            $scope.Getmetergenerateddtls.splice(key, 1);
                            nt.chkbox = false;
                        }
                    });
                }

            }
            else {
                $scope.Getmetergenerateddtls.push({ Industry_ID: nt.industryID, Meter_ID: nt.meterID, Financial_Year: nt.fyyr, Month_ID: nt.ddlmonth, InitialDate: todate(nt.initial_dt), FinalDate: todate(nt.Enddate), Generated_unit: nt.Generatedmtrread });
                console.log($scope.Getmetergenerateddtls);
                nt.chkbox = true;
            }

        }
        else {
            nt.chkbox = false;
            alert("Please Fill all the Field");

        }
    };

    $scope.InsertHPReadingdtls = function () {
        //debugger;
        if ($scope.Getmetergenerateddtls.length > 0) {
            var myReq = {
                method: 'POST',
                url: 'InsertHPReadingdtls',
                headers: { '__RequestVerificationToken': token },
                data: { objbilling: $scope.Getmetergenerateddtls }
            };
            $http(myReq).then(function success(response) {
                if (response.data == true) {
                    alert("Data Saved Successfully");
                    window.location.reload();
                }
                else {
                    alert("Failed");
                }
            });
        }
        else {
            alert("please choose the check box before proceed !!!");
        }
    };

    $scope.getHPindustrydetails = function () {
        var objnew = { IndustryID: $scope.ddlIndustry, FinancialYr: $scope.ddlyr, monthID: $scope.ddlmonth };
        $http({
            url: "getHPindustrydetails",
            method: "get",
            params: objnew
        }).success(function (data) {
            $scope.Getapprvlist = data;
        });
    };
    //Hydro Power Industry Insert
    $scope.Getmetergenerateddtls = [];
    $scope.GetindstryHydropower = function () {
        $http({
            method: 'get',
            url: 'HPMeterIndustryWise',
            headers: { '__RequestVerificationToken': token }
        }).success(function (responce) {
            //debugger;
            $scope.AllHydropower = responce;
            $scope.ntt = { ddlyr: "", ddlmonth: "", Generatedmtrread: "", chkbox: "", allmonths: "", status: null };
            angular.forEach($scope.AllHydropower.getHPmeterdetail, function (value, key) {
                angular.merge(value, $scope.ntt);
            })
        });
    };

    $scope.getIndHPdtls = function (nt, indx) {
        $scope.monthId = nt.ddlmonth;
        $scope.MeterID = nt.meterID;
        $scope.fyyr = nt.ddlyr;
        //debugger;
        $http({
            method: 'get',
            url: 'getallHPdtlsmonthwise',
            headers: { '__RequestVerificationToken': token },
            params: { monthid: $scope.monthId, meterID: $scope.MeterID, fyyr: $scope.fyyr }
        })
            .success(function (data) {
                nt.initial_dt = FromJSONDate(data.Industrywisegenerated.startdate);
                nt.Enddate = FromJSONDate(data.Industrywisegenerated.Enddate);
                nt.Generatedmtrread = data.Industrywisegenerated.generatedUnit;
                nt.status = data.Industrywisegenerated.status;
                //debugger;
                if (nt.Generatedmtrread > 0) {
                    nt.Generated_txtmtrread = false; nt.Generated_mtrread = true;
                }
                else { nt.Generated_txtmtrread = true; nt.Generated_mtrread = false; }
            });
    };

    $scope.getIndHPmonthlist = function (nt) {
        //debugger;
        $http({
            method: 'get',
            url: 'getHPmonthlist',
            headers: { '__RequestVerificationToken': token },
            params: { fynanceyr: nt.ddlyr, meterID: nt.meterID }
        }).success(function (data) {
            nt.allmonths = data.getallmonthyr;
        })
    }
    $scope.selectlinehpind = function (nt) {
        if (nt.Generatedmtrread != null && nt.Generatedmtrread != 0 && nt.ddlmonth != "") {
            if ($scope.Getmetergenerateddtls.length > 0) {

                if (nt.chkbox == true) {
                    $scope.Getmetergenerateddtls.push({
                        Industry_ID: nt.industryID, Meter_ID: nt.meterID, Financial_Year: nt.ddlyr, Month_ID: nt.ddlmonth, InitialDate: todate(nt.initial_dt),
                        FinalDate: todate(nt.Enddate), Generated_unit: nt.Generatedmtrread
                    });
                    console.log($scope.Getmetergenerateddtls);
                    nt.chkbox = true;
                }
                else {
                    angular.forEach($scope.Getmetergenerateddtls, function (value, key) {
                        if (value.Meter_ID == nt.meterID) {
                            $scope.Getmetergenerateddtls.splice(key, 1);
                            nt.chkbox = false;
                        }
                    });
                }
            }
            else {
                $scope.Getmetergenerateddtls.push({ Industry_ID: nt.industryID, Meter_ID: nt.meterID, Financial_Year: nt.ddlyr, Month_ID: nt.ddlmonth, InitialDate: todate(nt.initial_dt), FinalDate: todate(nt.Enddate), Generated_unit: nt.Generatedmtrread });
                console.log($scope.Getmetergenerateddtls);
                nt.chkbox = true;
            }

        }
        else {
            nt.chkbox = false;
            alert("Please Fill all the Field");

        }
    }

    $scope.InsertIndHPReadingdtls = function () {
        //debugger;
        if ($scope.Getmetergenerateddtls.length > 0) {
            var myReq = {
                method: 'POST',
                url: 'InsertHPReadingdtls',
                headers: { '__RequestVerificationToken': token },
                data: { objbilling: $scope.Getmetergenerateddtls }
            };
            $http(myReq).then(function success(response) {
                if (response.data == true) {
                    alert("Data Saved Successfully");
                    window.location.reload();
                }
                else {
                    alert("Failed");
                }
            });
        }
        else {
            alert("please choose the check box before proceed !!!");
        }
    }

    //Hydro Bill Generation

    //No Allocation
    $scope.Getnoallocationmeterdtls = [];
    $scope.NoAllocationIndustrydetails = function () { ///No Allocation Industry
        //debugger;
        $http({
            url: 'NoAllocationIndustrydetails',
            method: "GET",
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            $scope.lstIndstryName = response.data;
        })
    }
    $scope.NoAllocationMtrIndsWise = function (ddlIndustry) { ///No Allocation Industry Meter && Year
        debugger;
        $http({

            method: 'get',
            url: 'NoAllocationMtrIndsWise',
            headers: { '__RequestVerificationToken': token },
            params: { IndustryID: ddlIndustry }
        }).success(function (responce) {
            $scope.Allnoallocation = responce;
            $scope.ntt = { ddlyr: "", ddlmonth: "", Allocatedmtrread: "", chkbox: "", chkboxDsbl: "", allmonths: "", status: null, Penalty_Rate: "" };
            angular.forEach($scope.Allnoallocation.getmeterdetail, function (value, key) {
                angular.merge(value, $scope.ntt);
            })
        });
    };
    $scope.getnoallocationmonthlist = function (nt) {   ///No Allocation Months
        $http({
            method: 'get',
            url: 'getnoallocationmonthlist',
            headers: { '__RequestVerificationToken': token },
            params: { fynanceyr: nt.fyyr, meterID: nt.meterID, IndustryID: nt.industryID, sourceCD: nt.sourcecode, PurposeCD: nt.purpose_cd }
        }).success(function (data) {
            nt.allmonths = data.getallmonthyr;
        });
    };
    $scope.getIndnoallocationdtls = function (nt, indx) {  //Details of no allocation meter

        $scope.monthId = nt.ddlmonth;
        $scope.MeterID = nt.meterID;
        $scope.fyyr = nt.ddlyr;
        $http({
            method: 'get',
            url: 'getIndnoallocationdtls',
            headers: { '__RequestVerificationToken': token },
            params: { monthid: $scope.monthId, meterID: $scope.MeterID, IndustryID: nt.industryID, fyyr: nt.fyyr }
        })
            .success(function (data) {
                nt.initial_dt = FromJSONDate(data.Industrywisepurpose.startdate);
                nt.Enddate = FromJSONDate(data.Industrywisepurpose.Enddate);
                nt.Allocatedmtrread = data.Industrywisepurpose.allocationprice;
                nt.status = data.Industrywisepurpose.status;
                //var p = document.getElementById("chk");
                debugger;
                if (nt.status != null && nt.status == "Approved") {
                    //p.disabled = true;
                    nt.chkboxDsbl = true;
                }
                else {
                    //p.disabled = false;
                    nt.chkboxDsbl = false;
                }
                nt.Penalty_Rate = data.Industrywisepurpose.nometerpenatly;
            });
    };

    $scope.NometertypePenal = [{
        typeid: 1, Typename: "Normal Rate"
    }, {
        typeid: 2, Typename: "Penalty Rate(6 Times)"
    }];

    $scope.selectlinenoallo = function (nt) {
        debugger;
        if (nt.Allocatedmtrread != null && nt.Allocatedmtrread != 0 && nt.ddlmonth != "" && nt.Penalty_Rate) {
            if ($scope.Getnoallocationmeterdtls.length > 0) {
                if (nt.chkbox == true) {
                    $scope.Getnoallocationmeterdtls.push({
                        Industry_ID: nt.industryID, Meter_ID: nt.meterID, Financial_Year: nt.fyyr, Month_ID: nt.ddlmonth, InitialDate: todate(nt.initial_dt),
                        FinalDate: todate(nt.Enddate), AllocatedMeterReading: nt.Allocatedmtrread, NometerPenalty: nt.Penalty_Rate
                    });
                    console.log($scope.Getnoallocationmeterdtls);
                    nt.chkbox = true;
                }
                else {
                    angular.forEach($scope.Getnoallocationmeterdtls, function (value, key) {
                        if (value.Meter_ID == nt.meterID) {
                            $scope.Getnoallocationmeterdtls.splice(key, 1);
                            nt.chkbox = false;
                        }
                    });
                }
            }
            else {
                $scope.Getnoallocationmeterdtls.push({ Industry_ID: nt.industryID, Meter_ID: nt.meterID, Financial_Year: nt.fyyr, Month_ID: nt.ddlmonth, InitialDate: todate(nt.initial_dt), FinalDate: todate(nt.Enddate), AllocatedMeterReading: nt.Allocatedmtrread, NometerPenalty: nt.Penalty_Rate });
                nt.chkbox = true;
            }

        }
        else {
            nt.chkbox = false;
            alert("Please Fill all the Field");

        }
    }


    $scope.InsertnoalloReadingdtls = function () {// Insert statement
        if ($scope.Getnoallocationmeterdtls.length > 0) {
            var myReq = {
                method: 'POST',
                url: 'InsertnoallocationReadingdtls',
                headers: { '__RequestVerificationToken': token },
                data: { objbilling: $scope.Getnoallocationmeterdtls }
            };
            $http(myReq).then(function success(response) {
                if (response.data == true) {
                    alert("Data Saved Successfully");
                    window.location.reload();
                }
                else if (response.data == "Dup") {
                    alert("Record Already Exists.");
                }
                else {
                    alert("Failed");
                }
            });
        }
        else {
            alert("please choose the check box before proceed !!!");
        }
    }
    //No Allocation Industry
    $scope.GetnoallocationIndmeterdtls = [];
    $scope.NoAllocationIndMtrIndsWise = function () { //No Allocation Industry Meter && Year
        $http({
            method: 'get',
            url: 'NoAllocationMtrIndsWise',
            headers: { '__RequestVerificationToken': token }
        }).success(function (responce) {
            //debugger;
            $scope.Allnoallocation = responce;
            $scope.ntt = { ddlyr: "", ddlmonth: "", Allocatedmtrread: "", chkbox: "", chkboxDsbl: "", allmonths: "", status: null };
            angular.forEach($scope.Allnoallocation.getmeterdetail, function (value, key) {
                angular.merge(value, $scope.ntt);
            })
        });
    };
    $scope.getnoallocationIndmonthlist = function (nt) {   ///No Allocation Months
        //debugger;
        $http({
            method: 'get',
            url: 'getnoallocationmonthlist',
            headers: { '__RequestVerificationToken': token },
            params: { fynanceyr: nt.ddlyr, meterID: nt.meterID }
        }).success(function (data) {
            nt.allmonths = data.getallmonthyr;
        });
    };
    $scope.getIndnoallocationInddtls = function (nt, indx) {  //Details of no allocation meter
        $scope.monthId = nt.ddlmonth;
        $scope.MeterID = nt.meterID;
        $scope.fyyr = nt.ddlyr;
        //debugger;
        $http({
            method: 'get',
            url: 'getIndnoallocationdtls',
            headers: { '__RequestVerificationToken': token },
            params: { monthid: $scope.monthId, meterID: $scope.MeterID, fyyr: $scope.fyyr }
        })
            .success(function (data) {
                nt.initial_dt = FromJSONDate(data.Industrywisenoallocation.startdate);
                nt.Enddate = FromJSONDate(data.Industrywisenoallocation.Enddate);
                nt.Allocatedmtrread = data.Industrywisenoallocation.allocationprice;
                nt.status = data.Industrywisenoallocation.status;

            });
    };

    $scope.selectlinenoalloInd = function (nt) {
        //debugger;
        if (nt.Allocatedmtrread != null && nt.Allocatedmtrread != 0 && nt.ddlmonth != "") {
            if ($scope.GetnoallocationIndmeterdtls.length > 0) {
                if (nt.chkbox == true) {
                    ////debugger;
                    $scope.GetnoallocationIndmeterdtls.push({
                        Industry_ID: nt.industryID, Meter_ID: nt.meterID, Financial_Year: nt.fyyr, Month_ID: nt.ddlmonth, InitialDate: todate(nt.initial_dt),
                        FinalDate: todate(nt.Enddate), AllocatedMeterReading: nt.Allocatedmtrread
                    });
                    console.log($scope.GetnoallocationIndmeterdtls);
                    nt.chkbox = true;
                }
                else {
                    angular.forEach($scope.GetnoallocationIndmeterdtls, function (value, key) {
                        if (value.Meter_ID == nt.meterID) {
                            $scope.GetnoallocationIndmeterdtls.splice(key, 1);
                            nt.chkbox = false;
                        }
                    });
                }
            }
            else {
                $scope.GetnoallocationIndmeterdtls.push({ Industry_ID: nt.industryID, Meter_ID: nt.meterID, Financial_Year: nt.fyyr, Month_ID: nt.ddlmonth, InitialDate: todate(nt.initial_dt), FinalDate: todate(nt.Enddate), AllocatedMeterReading: nt.Allocatedmtrread });
                console.log($scope.GetnoallocationIndmeterdtls);
                nt.chkbox = true;
            }

        }
        else {
            nt.chkbox = false;
            alert("Please Fill all the Field");

        }
    }

    $scope.InsertnoalloindReadingdtls = function () {// Insert statement
        //debugger;
        if ($scope.GetnoallocationIndmeterdtls.length > 0) {
            var myReq = {
                method: 'POST',
                url: 'InsertnoallocationReadingdtls',
                headers: { '__RequestVerificationToken': token },
                data: { objbilling: $scope.GetnoallocationIndmeterdtls }
            };
            $http(myReq).then(function success(response) {
                if (response.data == true) {
                    alert("Data Saved Successfully");
                    window.location.reload();
                }
                else if (response.data == "Dup") {
                    alert("Record Already Exists.");
                }
                else {
                    alert("Failed");
                }
            });
        }
        else {
            alert("please choose the check box before proceed !!!");
        }
    }

    //No Allocation Industry


    $scope.GetAllBilldtls1 = function () {
        var obdata = null;

        $http({
            url: "getbillexec",
            method: "get",
            headers: { '__RequestVerificationToken': token },
            params: { objdata: obdata }
        }).success(function (data) {
            //debugger;
            $scope.Getabilllist = data
        })
    }

    //All Bill Generation
    $scope.GetAllBilldtls = function () {
        debugger;
        var objdata = { IndustryID: $scope.ddlIndustry, FinancialYr: $scope.ddlyr, monthID: $scope.ddlmonth };
        $http({
            url: "getbillexec",
            method: "get",
            headers: { '__RequestVerificationToken': token },
            params: objdata
        }).success(function (data) {
            //debugger;
            $scope.Getabilllist = data;
        })
    }
    $scope.GetAllDivBill = function () {

        $http({
            url: "GetAllDivBill",
            method: "get",
            headers: { '__RequestVerificationToken': token },
            params: { divisionID: $scope.ddl_Division, monthID: $scope.ddlmonth, FinancialYr: $scope.ddlyr }
        }).success(function (data) {
            $scope.Getabilllist = data;
        })
    }
    $scope.Getfinancialyrindwise = function (ddlIndustry) {

        $http({
            url: "Getfinancialyrindwise",
            method: "get",
            headers: { '__RequestVerificationToken': token },
            params: { IndustryID: ddlIndustry }
        }).success(function (data) {
            //debugger
            $scope.allyrs.length = 0;
            if (data.length > 0) {
                $scope.allyrs = data;
            }
        })
    }
    $scope.viewBillindustry = function (v) {
        var vxv = { IndustryID: v.IndustryID, divisionID: v.divisionID, monthID: v.monthID, FinancialYr: v.FinancialYr }
        $window.open("getbillindividual?divisionID=" + v.divisionID + "&&IndustryID=" + v.IndustryID + "&&monthID=" + v.monthID + "&&FinancialYr=" + v.FinancialYr + "&&watersource=" + v.watersourceID + "&&purpose=" + v.Purpose_CD, "Popup", "width=1250,height=600");
    };

    $scope.viewHPBillindustry = function (v) {
        var vxv = { IndustryID: v.IndustryID, divisionID: v.divisionID, monthID: v.monthID, FinancialYr: v.FinancialYr }
        $window.open("getHPbillindividual?divisionID=" + v.divisionID + "&&IndustryID=" + v.IndustryID + "&&monthID=" + v.monthID + "&&FinancialYr=" + v.FinancialYr + "&&watersource=" + v.watersourceID + "&&purpose=" + v.Purpose_CD, "Popup", "width=1250,height=600");
    }

    //Industry View Bill

    $scope.GetAllIndBilldtls = function () {
        debugger;
        var objdata = { FinancialYr: $scope.ddlyr, monthID: $scope.ddlmonth };
        $http({
            url: "getbillindustry",
            method: "get",
            headers: { '__RequestVerificationToken': token },
            params: objdata
        }).success(function (data) {
            //debugger;
            $scope.Getabilllist = data
        })
    }

    $scope.ViewIndustry = function (v) {
        debugger;
        var vxv = { IndustryID: v.IndustryID, divisionID: v.divisionID, monthID: v.monthID, FinancialYr: v.FinancialYr }
        $window.open("getbillindividual?IndustryID=" + v.IndustryID + "&&monthID=" + v.monthID + "&&FinancialYr=" + v.FinancialYr + "&&watersource=" + v.watersourceID + "&&purpose=" + v.Purpose_CD, "Popup", "width=1250,height=600");
    }
    $scope.ViewHPIndustry = function (v) {
        var vxv = { IndustryID: v.IndustryID, divisionID: v.divisionID, monthID: v.monthID, FinancialYr: v.FinancialYr }
        $window.open("getHPbillindividual?IndustryID=" + v.IndustryID + "&&monthID=" + v.monthID + "&&FinancialYr=" + v.FinancialYr + "&&watersource=" + v.watersourceID + "&&purpose=" + v.Purpose_CD, "Popup", "width=1250,height=600");
    }

    //Industry View Bill

    $scope.ViewBllget = function () {
        //debugger;
        var cv = {};
        $http({
            url: "ViewBll",
            method: "get",
            headers: { '__RequestVerificationToken': token },
            data: { objdata: cv }
        }).success(function (data) {
            debugger;
            if (data.PaymentReceived == 0) {
                $scope.currentdemand = data.PaymentReceived;
                $scope.PreviousArrear = 0;
                $scope.interest = 0;
            }
            else {
                $scope.currentdemand = data.PaymentReceived - data.interest - data.PreviousArrear;
                $scope.interest = data.interest;
                $scope.PreviousArrear = data.PreviousArrear;
            }
            //$scope.currentdemand = data.currentdemand,
            debugger;
            $scope.IndustryID = data.IndustryID, $scope.IndustryName = data.IndustryName, $scope.PIN = data.PIN, $scope.divisionID = data.divisionID, $scope.divisionName = data.divisionName, $scope.FinancialYr = data.FinancialYr, $scope.monthID = data.monthID, $scope.monthname = data.monthname, $scope.DamName = data.DamName, $scope.watersourceID = data.watersourceID, $scope.MeterRate = data.MeterRate, $scope.AllocatedMeterReading = data.AllocatedMeterReading, $scope.MeterReadingDifference = data.MeterReadingDifference, $scope.TotAmount = data.TotAmount, $scope.AllTotalAmount = data.AllTotalAmount,
                $scope.PaymentReceived = data.PaymentReceived, $scope.Totalcollection = data.Totalcollection, $scope.CumulativeDemand = data.CumulativeDemand, $scope.NetMeterReading = data.NetMeterReading, $scope.PaymentTowardsPrincipal = data.PaymentTowardsPrincipal, $scope.PaymentTowardsPenalty = data.PaymentTowardsPenalty, $scope.currentinterest = data.currentinterest, $scope.WSourceName = data.SourceName, $scope.PaymentTowardsInterest = data.PaymentTowardsInterest,
                $scope.CommimentCharge = data.CommimentCharge, $scope.penalty = data.penalty, $scope.currentdemand = data.currentdemand; $scope.IndustryNameWithAddress = data.IndustryNameWithAddress;
            $scope.DivShortNm = data.DivShortNm; $scope.CurrentFyear = data.CurrentFyear; $scope.UniqNum = data.File_Num; $scope.Bill_Dt = data.Bill_Dt;
            console.log($scope.UniqNum);
        });
    };
    $scope.genetareBill = function (vm) {
        vm.IndustryID = vm.IndustryID;
        vm.meterID = vm.meterID;
        vm.FinancialYr = vm.FinancialYr;
        vm.monthID = vm.monthID;
        vm.purpose_CD = vm.purpose_CD;
        $http({
            url: "updateapproveindividual",
            method: "post",
            headers: { '__RequestVerificationToken': token },
            data: { objbill: vm }
        }).success(function (data) {
            if (data == true) {
                alert("Bill Generated Successfully.Proceed to Bill page");
                $scope.getindustrydetails();
            }
            else {
                alert("Failed");
            }
        });
    };

    //Bill Generation
    // No Meter
    $scope.WaterSource_Dtls = function () {
        $http({
            url: 'ddl_WaterSource',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            $scope.lst_WaterSource = response.data;
        });
    };

    $scope.NoMeterIndustrydetails = function (ddlWaterSource) {

        $http({
            url: "NometerIndustrydetails",
            method: "GET",
            headers: { '__RequestVerificationToken': token },
            params: { water_CD: ddlWaterSource }
        }).then(function (response) {
            //debugger;
            // $scope.lstIndstryName.length = 0;
            if (response.data.length > 0) {
                $scope.lstIndstryName = response.data;
            }
        });
    };

    $scope.Allocation_dtls = function () {
        if ($scope.ddlIndustry != "" && $scope.ddlIndustry != null) {
            $http({
                url: 'getAllocationdetails',
                method: "GET",
                headers: { '__RequestVerificationToken': token },
                params: { Industry_Code: $scope.ddlIndustry, Source_CD: $scope.ddlWaterSource, Purpose_CD: $scope.ddlWaterPurpose }
            }).success(function (data) {

                if (data.BasinId != null) {
                    $scope.txtAllocNo = data.Allocation_Qty; $scope.txtRiverID = data.RiverId; $scope.txtDamID = data.DamId; $scope.txtBasinID = data.BasinId; $scope.Purpose_CD = data.Purpose_CD; $scope.PurposeDesc = data.PurposeDesc;
                    $scope.txtRiverName = data.RiverName; $scope.txtDamName = data.DamName; $scope.txtBasinName = data.BasinName;
                }
                else {
                    alert("No Allocation Found");
                    $scope.ddlIndustry = ""; $scope.txtAllocNo = ""; $scope.txtRiverID = ""; $scope.txtDamID = ""; $scope.txtBasinID = "";
                    $scope.txtRiverName = ""; $scope.txtDamName = ""; $scope.txtBasinName = "";
                }
            });
        }
        else {
            alert("Please choose the industry first.");
        }
    };

    $scope.Resetnometer = function () {
        window.location.reload();
    };
    $scope.Insertnometerdtls = function () {
        //debugger;
        $http({
            url: 'Insertnometer',
            method: "POST",
            headers: { '__RequestVerificationToken': token },
            data: {
                IndustryId: $scope.ddlIndustry, Source_CD: $scope.ddlWaterSource, BasinID: $scope.txtBasinID, RiverID: $scope.txtRiverID, DamID: $scope.txtDamID, purpose_CD: $scope.Purpose_CD
            }
        }).success(function (data) {
            debugger;
            if (data.Output == "Successful") {
                alert("Update Meter Successfully");
                window.location.reload();
            }
            else if (data.Output != null) {
                alert(data.Output);
            }
            else {
                alert("Please Try Later");
            }
        });
    };

    //No Meter Reading Exec
    $scope.NometerIndustrydtls = function () {
        $http({
            url: 'NometerIndustrydtls',
            method: "GET",
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            $scope.lstIndstryName = response.data;
        });
    };
    $scope.dispTbl = false;
    $scope.NoAllocationMtrIndsWise = function (ddlIndustry) { ///No Allocation Industry Meter && Year
        if (ddlIndustry) {
            $http({
                method: 'get',
                url: 'NoMtrIndsWise',
                headers: { '__RequestVerificationToken': token },
                params: { IndustryID: ddlIndustry }
            }).success(function (responce) {
                debugger;
                $scope.Allnoallocation = responce;
                $scope.ntt = { ddlyr: "", ddlmonth: "", Allocatedmtrread: "", chkbox: "", chkboxDsbl: "", allmonths: "", status: null };
                if ($scope.Allnoallocation.getmeterdetailList.length > 0 && $scope.Allnoallocation.getmeterdetail.length > 0) {
                    if ($scope.Allnoallocation.getmeterdetailList[0].LstFinYr != null) {
                        angular.forEach($scope.Allnoallocation.getmeterdetailList, function (value, key) {
                            angular.merge(value, $scope.ntt);
                        });
                    }
                    else {
                        $scope.dispTbl = true;
                        angular.forEach($scope.Allnoallocation.getmeterdetail, function (value, key) {
                            angular.merge(value, $scope.ntt);
                        });
                    }
                };
            });
        }
        else {
            $scope.dispTbl = false;
        }

    };
    //No Meter Reading

    $scope.printDiv = function (divName) {
        //debugger;
        var printContents = document.getElementById(divName).innerHTML;
        var popupWin = window.open('', '_blank', 'width=1200,height=800');
        popupWin.document.open();
        popupWin.document.write('<html><head><link href="../css/style.css" rel="stylesheet" type="text/css" /><link href="../jquery-ui-1.12.1.custom/jquery-ui.css" rel="stylesheet"><style>#printSectionId { width: 100%; }</style><style type="text/css" media="print">@page { size: landscape; }</style></head><body onload="window.print()">' + printContents + '</body></html>');
        popupWin.document.close();
    }


    //Report
    $scope.IndRegStts = [];
    $scope.Get_indregstts = function () {
        //debugger;
        var objnew = { Division: $scope.Division };
        $http({
            url: 'getDivwiseIndDtls',
            method: "GET",
            datatype: 'json',
            params: { Division: $scope.Division }
        })
            .success(function (data) {
                //debugger;
                if (data.length > 0) {
                    $scope.IndRegStts = data;
                    $scope.total = 0;
                }
                if (data.length == 0) {
                    $scope.IndRegStts.length = 0;
                    return;
                }

            })
    };

    $scope.IndOperationStts = [];
    $scope.Get_indOperationstts = function () {
        //debugger;
        var objnew = { Division: $scope.Division };
        $http({
            url: 'operatioalstatus',
            method: "GET",
            datatype: 'json',
            params: { Division: $scope.Division }
        })
            .success(function (data) {
                //debugger;
                if (data.length > 0) {
                    $scope.IndOperationStts = data;
                    $scope.total = 0;
                }
                if (data.length == 0) {
                    $scope.IndOperationStts.length = 0;
                    return;
                }

            })
    };

    //BISWAJIT

    //mrutyunjay
    $scope.ViewtoIndustry = function (vm) {
        vm.IndustryID = vm.IndustryID;
        vm.meterID = vm.meterID;
        vm.FinancialYr = vm.FinancialYr;
        vm.monthID = vm.monthID;
        $http({
            url: "updateapproveindividual",
            method: "post",
            headers: { '__RequestVerificationToken': token },
            data: { objbill: vm }
        }).success(function (data) {
            if (data == true) {
                alert("Bill Generated Successfully.Proceed to Bill page");
                window.location.reload();
            }
            else {
                alert("Failed");
            }
        })
    }

    $scope.ddlBindBasin = function () {
        $scope.lst_Dam = "";
        $scope.lst_River = "";
        $scope.lst_Basin = "";
        $http({
            url: 'ddl_Basin',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            //debugger;
            $scope.lst_Basin = response.data;
        });
    }

    $scope.Ins_Arrear_entry = function () {
        debugger;
        $http({
            url: 'Ins_Arrear_Entry',
            method: "POST",
            headers: { '__RequestVerificationToken': token },
            params: {
                Industry_Code: $scope.ddlIndustry, Watersource: $scope.ddlWaterSource, Purpose_CD: $scope.ddlWaterPurpose, PrevMonthArrear: $scope.PrevMonthArrear, intrest: $scope.Prevmonthins, penalty: $scope.Prevmonthpenalty, commitment_charge: $scope.Prevmonthcommitmentcharges, currentdemand: $scope.PrevMonthdemand
            }
        }).then(function () {

            //debugger;
            alert('Data Saved Sucessfully...');
            window.location.href = "ArrearEntry";

        })
    }
    $scope.getexistrecord = function () {
        $http.post('/Admin/complainMode').then(function success(response) {
            $scope.AllCompMode = response.data;
        }, function error(response) {
            alert(response.status);
        });
    }

    $scope.lst_Target = [];
    $scope.Ins_Target = function () {
        //debugger;
        $scope.MyAction = "CreateTarget";
        $http({
            url: 'CreateTarget',
            method: "get",
            headers: { '__RequestVerificationToken': token },
            params: {
                MyAction: $scope.MyAction, Division: $scope.ddlDivision, Financial_Year: $scope.ddlYear
            }
        }).then(function (response) {
            //debugger;
            if (response.data.length > 0) {
                $scope.lst_Target = response.data;
            }
        });
    }

    $scope.FetchTarget = function () {
        //debugger;
        $http({
            url: 'GetTarget',
            method: "get",
            headers: { '__RequestVerificationToken': token },
            params: {
                Financial_Year: $scope.ddlYear
            }
        }).then(function (response) {
            //debugger;
            if (response.data.length > 0) {
                $scope.lst_Target = response.data;
            }
        });
    }

    $scope.Unitdetails = function () {
        $http({
            url: 'ddl_Unit',
            method: "GET",
            headers: { '__RequestVerificationToken': token },
        }).then(function (response) {
            $scope.lstUnit = response.data;
        })
    }
    $scope.UpdateTarget = function () {
        //debugger;

        $http({
            url: 'UpdateTarget',
            method: 'POST',
            headers: { '__RequestVerificationToken': token },
            data: { lstobjnew: $scope.lst_Target }
        }).then(function (response) {
            $scope.Message = response.data.status;
            if ($scope.Message == "Success") {
                alert('Target Added Successfully');

            }
            else {
                alert('Request Could not be Process');
                window.location.href = "Target";
            }
        })
    }

    //  Jyoti

    $scope.GetIndustry = function () {
        $http({
            method: 'get',
            url: 'ddl_Industry',
            headers: { '__RequestVerificationToken': token }
        })
            .success(function (data) {
                //debugger;
                $scope.AllIndustry = data;
            })
            .error(function () {

            })
    };
    $scope.AllIndustryAlloc = [];
    $scope.AllIndustryPhase = [];
    $scope.ChkPhaseAll = function () {
        $scope.chkPhase = false;
        $scope.GetIndByPhase();
    };
    $scope.GetIndByPhase = function () {
        if ($scope.chkPhase == true) {
            $scope.AllIndustryAlloc = [];
            $http({
                method: 'get',
                url: 'IndDetByPh',
                headers: { '__RequestVerificationToken': token },
                params: { Industry_Code: $scope.ddl_IndCode }
            })
                .success(function (data) {
                    if (data == "NA") {
                        $scope.AllIndustryPhase = [];
                        alert('It Is Not a Phase Industry');
                    }
                    else {
                        $scope.AllIndustryPhase = data;
                        $scope.BindBasin();
                    }
                })
                .error(function () {

                })
        }
        else if ($scope.chkPhase == false) {
            $scope.AllIndustryPhase = [];
            $http({
                method: 'get',
                url: 'IndDetByAlloc',
                headers: { '__RequestVerificationToken': token },
                params: { Industry_Code: $scope.ddl_IndCode }
            })
                .success(function (data) {
                    if (data == "NA") {
                        $scope.AllIndustryAlloc = [];
                        alert('It Is Not a Allocation Industry');
                    }
                    else {
                        $scope.AllIndustryAlloc = data;
                        $scope.BindBasin();
                    }
                })
                .error(function () {

                })
        }
    };
    $scope.BindIndData = function () {
        //debugger;
        $scope.IndData = ($filter('filter')($scope.AllIndustry, { Industry_Code: $scope.ddl_IndCode }));
        $scope.BindExecEng();
        //debugger;
        $scope.Address = $scope.IndData[0].Address;
        $scope.Division = $scope.IndData[0].Division;
        $scope.PIN = $scope.IndData[0].PIN;

        $scope.AllIndustryAlloc = [];
        $scope.AllIndustryPhase = [];
        var ph = document.getElementById('if_Fase_Allocation');
        ph.style.display = 'none';
        var aloc = document.getElementById('ifAllocation');
        aloc.style.display = 'none';
        $scope.NewPhBtn = false;

    };

    $scope.CloseAlloModal = function () {
        //debugger;
        var openModal = document.getElementById('AllocationModal');
        var CloseBtn = document.getElementById('AllocationCloseBtn');
        function AlloCloseModal() {
            openModal.style.display = "none";
        }
        AlloCloseModal();
    };
    $scope.ClosePhaseModal = function () {
        //debugger;
        var openmodal = document.getElementById('simple-modal');
        var modalBtn = document.getElementById('PhaseCloseBtn');
        function CloseModal() {
            openmodal.style.display = 'none';
        }
        CloseModal();
    };
    $scope.CloseAddPhaseModal = function () {
        //debugger;
        var openmodal = document.getElementById('AddPh-modal');
        var modalBtn = document.getElementById('PhaseCloseBtn');
        function CloseModal() {
            openmodal.style.display = 'none';
        }
        CloseModal();
    };


    $scope.NewPhBtn = false;
    $scope.GetRecords = function (chkPhase) {
        //debugger;
        if (chkPhase == true) {
            $scope.AllIndustryAlloc = [];
            $http({
                method: 'get',
                url: 'IndDetByPh',
                headers: { '__RequestVerificationToken': token },
                params: { Industry_Code: $scope.ddl_IndCode }
            })
                .success(function (data) {
                    if (data == "NA") {
                        $scope.AllIndustryPhase = [];
                        alert('It Is Not a Phase Industry');
                    }
                    else {
                        $scope.AllIndustryPhase = data;
                        //debugger;
                        $scope.NewPhBtn = true;
                        $scope.BindBasin();
                    }
                })
                .error(function () {

                })
        }
        else if (chkPhase == false) {
            //debugger;
            $scope.NewPhBtn = false;
            $scope.AllIndustryPhase = [];
            $http({
                method: 'get',
                url: 'IndDetByAlloc',
                headers: { '__RequestVerificationToken': token },
                params: { Industry_Code: $scope.ddl_IndCode }
            })
                .success(function (data) {
                    if (data == "NA") {
                        $scope.AllIndustryAlloc = [];
                        alert('It Is Not a Allocation Industry');
                    }
                    else {
                        $scope.AllIndustryAlloc = data;
                        //debugger;
                        $scope.BindBasin();
                    }
                })
                .error(function () {

                })
        }
    };

    $scope.EditAlloc = function (v) {
        debugger;
        $scope.Dam = "0";
        var openModal = document.getElementById('AllocationModal');
        function AlloOpenModal() {
            openModal.style.display = "block";
        }
        AlloOpenModal();
        $scope.Alloc_SlNo = v.Alloc_SlNo;
        $scope.Industry_Code = v.Industry_Code;
        $scope.IndustryName = v.IndustryName;
        //debugger;
        $scope.ddlWaterSource = v.Source_CD;
        $scope.WaterPurpose();


        $http({
            url: 'ddl_River',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: { BasinID: v.Basin },
        }).then(function (response) {
            $scope.lst_River = response.data;

            $scope.BindDam();
        });

        $timeout(function () {
            $scope.Purpose_CD = v.Purpose_CD;
            $scope.Allocation_Qty = v.Allocation_Qty;
            $scope.OrderNo = v.OrderNo;
            $scope.OrderDate = v.OrderDate;
            //debugger;
            $scope.Phase = v.Phase;
            $scope.SerialNo = v.SerialNo;
            $scope.Alloc_SlNo = v.Alloc_SlNo;
            $scope.ddlBasin = v.Basin;
            $scope.ddlRiver = v.River_Nalla;
            $scope.WaterSource();
            $scope.$watch('Source_CD', function () {
                $scope.ddlWaterSource = v.Source_CD;
            });

            $scope.Dam = v.Dam;
            $scope.Aggrement_OrderNo = v.Aggrement_OrderNo;
            $scope.Aggrement_Qty = v.Aggrement_Qty;
            $scope.Aggrement_DT = v.Aggrement_DT;
            $scope.Agg_From_DT = v.Agg_From_DT;
            $scope.Agg_To_DT = v.Agg_To_DT;

            $scope.IP_Address = v.IP_Address;

            $scope.Division = $scope.Division;
            $scope.Address = $scope.Address;
            $scope.PIN = $scope.PIN;
        }, 300);

    };


    $scope.EditPhase = function (v) {
        debugger;
        var modal = document.getElementById('simple-modal');
        function OpenModal() {
            modal.style.display = 'block';
        }
        OpenModal();
        $scope.Phase_SlNo = v.Phase_SlNo;
        $scope.Industry_Code = v.Industry_Code;
        $scope.IndustryName = v.IndustryName;
        $scope.ddlWaterSource = v.Source_CD;
        $scope.WaterPurpose();

        $scope.ddlBasin = v.Basin;

        $http({
            url: 'ddl_River',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: { BasinID: $scope.ddlBasin },
        }).then(function (response) {
            $scope.lst_River = response.data;
            $scope.BindDam();
        });
        $timeout(function () {
            var bb = $scope.lst_WaterPurpose;
            $scope.Purpose_CD = v.Purpose_CD;
            $scope.Allocation_Qty = v.Allocation_Qty;
            $scope.OrderNo = v.OrderNo;
            $scope.OrderDate = v.OrderDate;

            $scope.SerialNo = v.SerialNo;
            $scope.Phase_SlNo = v.Phase_SlNo;

            $scope.ddlRiver = v.River_Nalla;


            $scope.Dam = v.dam;
            $scope.hdnIndustryCD = v.Industry_Code;
            debugger;
            $scope.txtIndNM = v.IndustryName;
            $scope.PhaseAggrement_OrderNo = v.PhaseAggrement_OrderNo;
            $scope.PhaseAllocation_Qty = v.PhaseAllocation_Qty;
            $scope.PhaseAggrement_DT = v.PhaseAggrement_DT;
            $scope.PhaseAggr_From_DT = v.PhaseAggr_From_DT;
            $scope.PhaseAggr_To_DT = v.PhaseAggr_To_DT;
            $scope.Phase = v.Phase;
            $scope.PhaseFrom_DT = v.PhaseFrom_DT;
            $scope.PhaseTo_DT = v.PhaseTo_DT;
            $scope.IP_Address = v.IP_Address;
            $scope.Division = $scope.Division;
            $scope.Address = $scope.Address;
            $scope.PIN = $scope.PIN;
        }, 300);

    };

    $scope.NewPhaseAddition = function () {
        var modal = document.getElementById('AddPh-modal');
        function OpenModal() {
            modal.style.display = 'block';
        }
        OpenModal();
        console.log($scope.AllIndustryPhase);
        $http({
            url: 'ddl_River',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: { BasinID: $scope.AllIndustryPhase[0].Basin },
        }).then(function (response) {
            $scope.lst_River = response.data;
            $scope.BindDam();
        });

        $scope.IndustryName = $scope.AllIndustryPhase[0].IndustryName;
        $scope.Allocation_Code = $scope.AllIndustryPhase[0].Allocation_Code;
        $scope.Industry_Code = $scope.AllIndustryPhase[0].Industry_Code;
        $scope.Allocation_Qty = $scope.AllIndustryPhase[0].Allocation_Qty;
        $scope.ddlBasin = $scope.AllIndustryPhase[0].Basin;
        $scope.ddlRiver = $scope.AllIndustryPhase[0].River_Nalla;
        $scope.Dam = $scope.AllIndustryPhase[0].Dam;
        $scope.OrderDate = $scope.AllIndustryPhase[0].OrderDate;
        $scope.OrderNo = $scope.AllIndustryPhase[0].OrderNo;
        $scope.Purpose_CD = $scope.AllIndustryPhase[0].PurposeDesc;
        $scope.ddlWaterSource = $scope.AllIndustryPhase[0].WaterSource;
    };

    $scope.AddNewPhase = function () {
        debugger;
        var objnew = {
            Industry_Code: $scope.Industry_Code, Allocation_Code: $scope.Allocation_Code, Allocation_Qty: $scope.Allocation_Qty,
            Basin: $scope.ddlBasin, River_Nalla: $scope.ddlRiver, Dam: $scope.Dam,
            PhaseAggrement_OrderNo: $scope.PhaseAggrement_OrderNo, PhaseAllocation_Qty: $scope.PhaseAllocation_Qty,
            PhaseAggrement_DT: $scope.PhaseAggrement_DT, PhaseAggr_From_DT: $scope.PhaseAggr_From_DT,
            PhaseAggr_To_DT: $scope.PhaseAggr_To_DT, Phase: $scope.Phase, PhaseFrom_DT: $scope.PhaseFrom_DT,
            PhaseTo_DT: $scope.PhaseTo_DT
        };
        console.log(objnew);
        $http({
            url: 'AddNewPhase',
            method: 'post',
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            data: { objnew: objnew }
        }).then(function success(result) {
            var data = result.data;
            if (data.status == "Success") {

                alert("Phase Added Successfully.");

                $scope.GetRecords(true);
                $scope.CloseAddPhaseModal();
                $scope.PhaseAggrement_OrderNo = "";
                $scope.PhaseAllocation_Qty = "";
                $scope.PhaseAggrement_DT = "";
                $scope.PhaseAggr_From_DT = "";
                $scope.PhaseAggr_To_DT = "";
                $scope.Phase = "";
                $scope.PhaseFrom_DT = "";
                $scope.PhaseTo_DT = "";
            }
        });
    };

    $scope.ConvertDt = function (dt) {
        debugger;
        var wanted = '';
        if (dt) {
            if (dt.includes('-')) {
                var parts = dt.split(/[-]/);
                if (parts[2].length == 4) {
                    wanted = parts[0] + '/' + parts[1] + '/' + parts[2];
                    return wanted;
                }
                else if (parts[0].length == 4) {
                    wanted = parts[2] + '/' + parts[1] + '/' + parts[0];
                    return wanted;
                }
            }
            else {
                return dt;
            }
        }
        else {
            return '01/01/1900';
        }

    };

    $scope.UpdAllocPh = function (chkPhase) {
        debugger;
        var PhaseAlloc;

        if (chkPhase == true) {
            $scope.ClosePhaseModal();
            PhaseAlloc = "Y";
            var objnew1 = {};
            var objnew = {
                Industry_Code: $scope.Industry_Code, IndustryName: $scope.IndustryName, Division: $scope.Division,
                Address: $scope.Address, PIN: $scope.PIN, PhaseAllocation: PhaseAlloc
            };

            var PhOrd_Dt = $scope.ConvertDt(document.getElementById('PhOrd_Dt').value);
            var PhAggr_Dt = $scope.ConvertDt(document.getElementById('PhAggr_Dt').value);
            var PhAggrFrm_Dt = $scope.ConvertDt(document.getElementById('PhAggrFrm_Dt').value);

            var PhAggrTo_Dt = $scope.ConvertDt(document.getElementById('PhAggrTo_Dt').value);
            var PhFrm_Dt = $scope.ConvertDt(document.getElementById('PhFrm_Dt').value);
            var PhTo_Dt = $scope.ConvertDt(document.getElementById('PhTo_Dt').value);
            //var objnew2 = {
            //    SerialNo: $scope.SerialNo, Phase_SlNo: $scope.Phase_SlNo, Industry_Code: $scope.Industry_Code,
            //    Source_CD: $scope.ddlWaterSource, Purpose_CD: $scope.Purpose_CD, Basin: $scope.ddlBasin, River_Nalla: $scope.ddlRiver,
            //    Dam: $scope.Dam, Allocation_Qty: $scope.Allocation_Qty, OrderDate: PhOrd_Dt, OrderNo: $scope.OrderNo,
            //    PhaseAggrement_OrderNo: $scope.PhaseAggrement_OrderNo, PhaseAllocation_Qty: $scope.PhaseAllocation_Qty,
            //    PhaseAggrement_DT: PhAggr_Dt, PhaseAggr_From_DT: PhAggrFrm_Dt, PhaseAggr_To_DT: PhAggrTo_Dt, Phase: $scope.Phase,
            //    PhaseFrom_DT: PhFrm_Dt, PhaseTo_DT: PhTo_Dt, PhaseAllocation: PhaseAlloc
            //};
            objnew1 = {
                SerialNo: $scope.SerialNo, Industry_Code: $scope.Industry_Code, Source_CD: $scope.ddlWaterSource,
                Purpose_CD: $scope.Purpose_CD, Allocation_Qty: $scope.Allocation_Qty, OrderDate: PhOrd_Dt,
                OrderNo: $scope.OrderNo
            };

            var objnew2 = {
                Industry_Code: $scope.Industry_Code, Phase_SlNo: $scope.Phase_SlNo, Source_CD: $scope.ddlWaterSource, Purpose_CD: $scope.Purpose_CD,
                Basin: $scope.ddlBasin, River_Nalla: $scope.ddlRiver, Dam: $scope.Dam, Allocation_Qty: $scope.Allocation_Qty,
                //OrderDate: PhOrd_Dt, OrderNo: $scope.OrderNo,
                Phase: $scope.Phase, PhaseAllocation_Qty: $scope.PhaseAllocation_Qty,
                PhaseFrom_DT: PhFrm_Dt, PhaseTo_DT: PhTo_Dt, PhaseAggrement_OrderNo: $scope.PhaseAggrement_OrderNo,
                PhaseAggrement_DT: PhAggr_Dt, PhaseAggr_From_DT: PhAggrFrm_Dt, PhaseAggr_To_DT: PhAggrTo_Dt
            };
        }
        else if (chkPhase == false) {
            $scope.CloseAlloModal();
            PhaseAlloc = "N";
            var objnew = {
                Industry_Code: $scope.Industry_Code, IndustryName: $scope.IndustryName, Division: $scope.Division, Address: $scope.Address, PIN: $scope.PIN,
                PhaseAllocation: PhaseAlloc
            };

            var Ord_Dt = $scope.ConvertDt(document.getElementById('AllocOrd_Dt').value);
            var AllocAggr_Dt = $scope.ConvertDt(document.getElementById('AllocAggr_Dt').value);
            var AllocAggrFrm_Dt = $scope.ConvertDt(document.getElementById('AllocAggrFrm_Dt').value);
            var AllocAggrTo_Dt = $scope.ConvertDt(document.getElementById('AllocAggrTo_Dt').value);
            var objnew1 = {

                MyAction: $scope.MyAction, Alloc_SlNo: $scope.Alloc_SlNo, SerialNo: $scope.SerialNo, Industry_Code: $scope.Industry_Code, Source_CD: $scope.ddlWaterSource, Purpose_CD: $scope.Purpose_CD, Basin: $scope.ddlBasin,
                River_Nalla: $scope.ddlRiver, Dam: $scope.Dam, Allocation_Qty: $scope.Allocation_Qty, OrderDate: Ord_Dt,
                OrderNo: $scope.OrderNo, Aggrement_OrderNo: $scope.Aggrement_OrderNo, Aggrement_Qty: $scope.Aggrement_Qty, Aggrement_DT: AllocAggr_Dt,
                Agg_From_DT: AllocAggrFrm_Dt, Agg_To_DT: AllocAggrTo_Dt, Phase: PhaseAlloc
            };
            var objnew2 = {};
        }


        $http({
            url: 'Upd_Ind_Info',
            method: "POST",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            data: { objnew: objnew, objnew1: objnew1, objnew2: objnew2 },
        }).then(function (response) {

            $scope.Message = response.data.status;
            if ($scope.Message == "Success") {
                alert('Record Updated Successfully.');
                window.location.href = "EditPhaseAllocation";
            }
            else {
                alert('Please try after some time');
                //window.location.href = "PhaseAllocation";
            }
        })
    };

    $scope.DeleteAllocPh = function (chkPhase) {
        var PhaseAlloc;
        if (chkPhase == true) {
            $scope.ClosePhaseModal();
            PhaseAlloc = "Y";
            //debugger;
            var objnew = { Industry_Code: $scope.ddl_IndCode, PhaseAllocation: PhaseAlloc };
            var objnew1 = {};
            var objnew2 = {
                Phase_SlNo: $scope.Phase_SlNo, SerialNo: $scope.SerialNo
            };
        }
        else if (chkPhase == false) {
            $scope.CloseAlloModal();
            PhaseAlloc = "N";
            var objnew = { Industry_Code: $scope.ddl_IndCode, PhaseAllocation: PhaseAlloc };
            var objnew1 = {
                Alloc_SlNo: $scope.Alloc_SlNo, SerialNo: $scope.SerialNo
            };
            var objnew2 = {};
        }

        $http({
            url: 'Del_Ind_Info',
            method: "POST",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            data: { objnew: objnew, objnew1: objnew1, objnew2: objnew2 },
        }).then(function (response) {
            $scope.Message = response.data.status;
            if ($scope.Message == "Success") {
                alert('You have Deleted Successfully.');
                window.location.href = "EditPhaseAllocation";
            }
            else {
                alert('Please try after some time');
                //window.location.href = "PhaseAllocation";
            }
        })
    };


    $scope.GetAlloQty = function () {
        if ($scope.AlloQty && $scope.AlloQty != "") {
            var AlloQty = $scope.AlloQty;
            $http({
                method: 'GET',
                url: 'AlloQtyDetails',
                params: { AlloQty: AlloQty },
                headers: { '__RequestVerificationToken': token }
            })
                .success(function (data) {
                    ////debugger;
                    $scope.GetAlloQtydata = data;
                    console.log($scope.GetAlloQtydata);
                })
                .error(function () {

                })
        }
    };


    $scope.Datecheck = function () {
        $timeout(function () {
            var todt = $scope.To_DT.split('/');
            var newdate = todt[1] + '/' + todt[0] + '/' + todt[2];
            var todaydt = new Date(newdate);
            var lastdt = new Date();
            debugger;
            if (todaydt >= lastdt) {
                debugger;
                document.getElementById('DivTo_Dt').value = "";
                alert("To Date Can not be greater than Today Date.");
            }
        }, 500);
    };

    $scope.chkDiv = false;
    $scope.DivTrsByDt = [];
    $scope.Get_Trans = function () {
        debugger;
        var divv = $scope.Division;
        var frmdt = $scope.From_DT.split('/');
        var Fromdtdt = new Date(frmdt[1] + '/' + frmdt[0] + '/' + frmdt[2]);
        var todt = $scope.To_DT.split('/');
        var Todtdt = new Date(todt[1] + '/' + todt[0] + '/' + todt[2]);
        if (frmdt != null && frmdt != "" && todt != null && todt != "") {
            debugger;
            if (Fromdtdt >= Todtdt) {
                debugger;
                alert("From Date Can not be greater than To Date.");
                return;
            }
            if ($scope.Division || $scope.chkDiv == true) {
                var objnew = { Division: divv, From_DT: $scope.From_DT, To_DT: $scope.To_DT };
                $http({
                    method: 'post',
                    url: 'GetTransByDivDt',
                    data: { objnew: objnew },
                    headers: { '__RequestVerificationToken': token }
                })
                    .success(function (data) {
                        //debugger;
                        if (data == -1) {
                            alert("From Date Can not be greater than To Date.");
                            return;
                        }
                        if (data.length > 0) {
                            $scope.DivTrsByDt = data;
                            $scope.total = 0;
                            angular.forEach($scope.DivTrsByDt, function (value, key) {
                                $scope.total += parseFloat(value.Amount);
                            });
                        }
                        if (data.length == 0) {
                            $scope.DivTrsByDt.length = 0;
                            return;
                        }

                    })
            }
            else {
                $scope.DivTrsByDt.length = 0;
                alert("Select Division or All Division");

            }
        }
        else {
            $scope.DivTrsByDt.length = 0;
            alert("Select Date Fields");

        }

    };
    $scope.grptotal = function (data) {
        debugger;
        $scope.grtotal = 0;
        angular.forEach(data, function (value, key) {
            debugger;
            $scope.grtotal += parseFloat(value.Amount);
        });
        return $scope.grtotal;
    };

    $scope.Get_NoofIndustry = function () {
        $http({
            url: 'getDivwisenoIndDtls',
            method: "GET",
            datatype: 'json',
            params: { Division: $scope.Division }
        })
            .success(function (data) {
                debugger;
                if (data.length > 0) {
                    $scope.DivTrsByDt = data;
                    $scope.totalnoind = 0; $scope.totalnoreg = 0; $scope.totalnoact = 0; $scope.totalnorej = 0; $scope.totalpercent = 0;
                    angular.forEach($scope.DivTrsByDt, function (value, key) {
                        $scope.totalnoind += parseFloat(value.TotalNoInd);
                        $scope.totalnoreg += parseFloat(value.Totalregistered);
                        $scope.totalnoact += parseFloat(value.NoofIndAct);
                        $scope.totalnorej += parseFloat(value.NoofINDReg);
                    });
                    debugger;
                    $scope.totalpercent = Math.round((parseFloat(parseFloat($scope.totalnoreg) / parseFloat($scope.totalnoind)) * 100), 2);
                }
                if (data.length == 0) {
                    $scope.DivTrsByDt.length = 0;
                    return;
                }

            })

    };

    $scope.dwn = function () {
        //debugger;
        $http({
            method: 'POST',
            url: 'GetPDF',
            headers: { '__RequestVerificationToken': token }
        })
            .success(function (data) {
                //debugger;

            })
    };

    //Report

    //  Jyoti

    //DHIREN BHAI
    $scope.Editarrear = function (MR) {
        //debugger;
        //$http({
        //    url: 'Editarrear',
        //    method: "POST",
        //    datatype: 'json',
        //    params: {
        //        Industry_Code: MR.Industry_Code, MeterId: MR.MeterId, month_cd: MR.month_cd, year: MR.year
        //    }
        //}).then(function (response) {
        //    $scope.Message = response.data.status;



        //})
        $scope.ddlIndustry = MR.Industry_Code; $scope.ddlWaterSource = MR.MeterId; $scope.PrevMonthArrear = MR.PrevMonthArrear; $scope.Prevmonthins = MR.intrest; $scope.Prevmonthpenalty = MR.penalty; $scope.Prevmonthcommitmentcharges = MR.commitment_charge;
    }
    $scope.Arrear_Clear = function () {
        window.location.href = "ArrearEntry";
    }
    $scope.deletearrear = function (MR) {
        //debugger;
        $http({
            url: 'Deletearrear',
            method: "POST",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: {
                Industry_Code: MR.Industry_Code, MeterId: MR.MeterId, month_cd: MR.month_cd, year: MR.year
            }
        }).then(function (response) {
            $scope.Message = response.data.status;
            window.location.href = "ArrearEntry";


        })
    }

    $scope.Fetch_Arrear = function () {

        //debugger;
        $http({
            url: 'ArrearResult',
            method: "POST",
            headers: { '__RequestVerificationToken': token },
        }).then(function (response) {
            $scope.lst_arrear = response.data;
        })
    }
    $scope.BindQuantity = function () {
        // var MyAction = 'BindBasinWise';
        //debugger;
        $http({
            url: 'BindQuantity',
            method: "GET",
            headers: { '__RequestVerificationToken': token },
            params: { BasinID: $scope.ddlBasin }
        }).then(function (response) {
            if (response.data.length > 0) {
                //debugger;
                $scope.lst_BindQuantity = response.data;
            }
            else {
                alert('No Data Found');
                $scope.lst_BindQuantity = 0;
            }
        })
    }
    $scope.get_target = function () {
        if ($scope.ddlFYear != "") {
            var sss = { Month_Code: $scope.ddlFMonths, Financial_Year: $scope.ddlFYear, Division: $scope.ddlDivision };
            $http({
                url: "BindTargetAchieve",
                method: "get",
                headers: { '__RequestVerificationToken': token },
                params: sss
            }).success(function (data) {
                //debugger;

                $scope.Division = data.Division; $scope.Curr_Target = data.Curr_Target; $scope.Arr_Target = data.Arr_Target; $scope.Arrear_Target_Achieved = data.Arrear_Target_Achieved; $scope.Current_Target_Achieved = data.Current_Target_Achieved;

            })
        }
        else { alert("Please choose Financial Year !!"); }
    }

    $scope.changeDivision = function () {
        $scope.ddlFYear = "";
        $scope.ddlFMonths = "";
    }
    $scope.changefyyr = function () {
        $scope.ddlFMonths = "";
    }

    $scope.UpdateTargetachievements = function () {
        debugger;
        var insertdata = { Month_Code: $scope.ddlFMonths, Financial_Year: $scope.ddlFYear, Division: $scope.Division, Curr_Target: $scope.Curr_Target, Arr_Target: $scope.Arr_Target, Arrear_Target_Achieved: $scope.Arrear_Target_Achieved, Current_Target_Achieved: $scope.Current_Target_Achieved };
        //debugger;
        $http({
            url: "updateTargetAchieve",
            method: "post",
            headers: { '__RequestVerificationToken': token },
            params: insertdata
        }).success(function (data) {
            //debugger;
            if (data.status == "Success") {
                alert("Update successful");
                window.location.reload();
            }
            else { alert("Update Failed"); }
        });
    };
    //Change Meter
    $scope.GetAllMeterdtls = function () {
        //debugger;
        $http({
            url: 'GetAllIndMeterdtls',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: {
                Industry_Code: $scope.ddlIndustry
            }
        }).then(function (response) {
            //debugger;
            $scope.lst_BindMeter = response.data;
        });
    }
    $scope.getmeterDtls = function (ddlMeter) {
        //debugger;
        $http({
            url: 'getmeterdtls',
            method: 'get',
            headers: { '__RequestVerificationToken': token },
            params: { IndustryId: $scope.ddlIndustry, MeterId: ddlMeter }
        }).success(function (data) {
            //debugger;

            $scope.txtwatersource = data.Source_CD; $scope.txtmeterUnit = data.Unit_Name; $scope.txtmeterID = data.MeterId; $scope.txtmtrMake = data.Make; $scope.txtserialNo = data.SerialNo; $scope.txtCommissioningdt = data.CommissioningDate; $scope.txtstatus = data.status;
        })

    }

    $scope.Updatemeterdtls = function () {

        var Meter_Change_Dt = document.getElementById('meterchangedt').value;
        if (Meter_Change_Dt != null && $scope.txtremarks != null) {
            var insertdata = { MeterId: $scope.txtmeterID, IndustryId: $scope.ddlIndustry, Meter_Change_Dt: Meter_Change_Dt, Remarks: $scope.txtremarks };
            //debugger;
            $http({
                url: "UpdtMeterStatus",
                method: "post",
                headers: { '__RequestVerificationToken': token },
                params: insertdata
            }).success(function (data) {
                //debugger;
                if (data.status == "Success") {
                    alert("Update successful");
                    window.location.reload();
                }
                else { alert("Update Failed"); }
            })
        }
        else {
            alert("Please Fill all the field before proceeed");
        }
    }

    $scope.GetAllIndInActiveMeterdtls = function () {
        //debugger;
        $http({
            url: 'GetAllIndInActiveMeterdtls',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: {
                IndustryId: $scope.ddlIndustry
            }
        }).then(function (response) {

            $scope.InActiveMeterdtls = response.data;
        });
    }
    //Change Meter

    $scope.Noallocationqtyupdate = function () {
        //debugger;
        $http({
            url: 'Noallocation_quantity_update',
            method: "POST",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: { Industry_Code: $scope.ddlIndustry, Source_CD: $scope.ddlWaterSource, Purpose_CD: $scope.ddlWaterPurpose, BasinId: $scope.ddlBasin, RiverId: $scope.ddlRiver, DamId: $scope.ddlDam, Allocation_Qty: $scope.allocationqty, metertype: $scope.ddlmetertype }
        }).then(function (response) {
            $scope.Message = response.data.status;
            if ($scope.Message == "Success") {
                alert('Data Updated Successfully');
                window.location.href = "NoAllocation";
            }
            else {
                alert('Sorry Please try after some time');
                window.location.href = "NoAllocation";
            }
        })
    }

    $scope.Insert_AllocationMultipleSource = function () {
        var orddt = document.getElementById('orddt').value;
        var Agdt = document.getElementById('Agdt').value;
        var frmdt = document.getElementById('frmdt').value;
        var todt = document.getElementById('todt').value;
        $http({
            url: 'Insert_AllocationMultipleSource',
            method: "POST",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            params: {
                Industry_Code: $scope.ddlIndustry, Source_CD: $scope.ddlWaterSource,
                Purpose_CD: $scope.ddlWaterPurpose, Allocation_Qty: $scope.AlloQty,
                Order_No: $scope.ordno, Order_DT: orddt, BasinID: $scope.ddlBasin,
                River: $scope.ddlRiver, Dam: $scope.ddlDam, Aggrement_OrderNo: $scope.Agordno,
                Aggrement_Qty: $scope.AgoQty, Aggrement_DT: Agdt, From_DT: frmdt,
                To_DT: todt,
            }
        }).then(function (response) {
            $scope.Message = response.data.status;
            if ($scope.Message == "Success") {
                alert('Data Saved Successfully...');
                window.location.href = "AllocationMultipleSource";
            }
            else {
                alert('Please after Sometime');
                window.location.href = "AllocationMultipleSource";
            }
        });
    }

    $scope.uploadFile = function () {
        //debugger;

        var files = document.getElementById('fluXML').files;
        var fileData = new FormData();
        //Take the first selected file
        fileData.append("file", files[0]);

        $http({
            url: 'UploadFiles',
            method: "POST",
            dataType: "multipart/form-data",
            contentType: false, // Not to set any content header
            processData: false, // Not to process data
            //headers: { '__RequestVerificationToken': token },
            withCredentials: true,
            headers: { 'Content-Type': undefined, '__RequestVerificationToken': token },
            transformRequest: angular.identity,
            data: fileData
        }).then(function (response) {
            //debugger;
            if (response.data.Output == "Success") {
                alert("Data Uploaded Successfully.");
                window.location.reload();
            }
            else if (response.data.Output == "N") {
                alert("Value Not Found.");
            }
            else { alert("Please try after some time."); }
        });

    }

    //MMJ
    $scope.get_currArr = function () {
        $http({
            url: 'Report_Alltarget',
            method: "Get",
            params: {
                FYYR: $scope.ddlFYear
            }
        }).then(function (responce) {
            $scope.Alltarget = responce.data;
        })
    }
    //MMJ

    $scope.ViewPayment = function () {
        if ($scope.ddlYear != null) {
            $http({
                url: 'BindChallanCount',
                method: 'GET',
                params: { Month_Code: $scope.ddlMonthCD, Financial_Year: $scope.ddlYear }
            }).then(function (response) {
                if (response.data.length > 0) {
                    $scope.DivTrsByDt = response.data;
                    $scope.totalAct = 0; $scope.paidonline = 0; $scope.ChallanNo = 0; $scope.totalind = 0; $scope.PaymentRequired = 0;
                    angular.forEach($scope.DivTrsByDt, function (value, key) {
                        $scope.totalAct += parseFloat(value.NoofIndAct);
                        $scope.PaymentRequired += parseFloat(value.paymentrequired);
                        $scope.totalind += parseFloat(value.TotalNoInd);
                        $scope.paidonline += parseFloat(value.COUNT);
                        $scope.ChallanNo += parseFloat(value.Challan_No);
                    });
                    debugger;
                    $scope.totalpayachieve = Math.round((parseFloat(parseFloat($scope.ChallanNo) / parseFloat($scope.PaymentRequired)) * 100), 2);
                    var CurrentFyyr = ($filter('filter')($scope.crrfyyr, { fyyrid: $scope.ddlYear }));
                    $scope.fyyrname = CurrentFyyr[0].Fyyridname;
                    var monthdt = ($filter('filter')($scope.Monthlist, { monthid: $scope.ddlMonthCD }));
                    $scope.monthIiD = monthdt[0].Monthname;
                }
                else {
                    $scope.DivTrsByDt = "";
                }
            })
        }
        else {
            alert("Please Choose Financial Year");
            $scope.ddlMonthCD = "";
        }
    }

    $scope.ViewOpIndPayment = function () {
        if ($scope.ddlYear != null) {
            $http({
                url: 'BindOpIndChallan',
                method: 'GET',
                params: { Month_Code: $scope.ddlMonthCD, Financial_Year: $scope.ddlYear }
            }).then(function (response) {
                debugger;
                if (response.data.length > 0) {
                    $scope.DivTrsByDt = $filter('orderBy')(response.data, 'EE_Name');

                    $scope.TotalNoInd = 0;
                    $scope.paymentrequired = 0;
                    $scope.OpInd_BillOl_GW = 0;
                    $scope.OpInd_BillOl_SW = 0;
                    $scope.OperatingIndSwGw = 0;
                    $scope.NoOfBillGW_Ol = 0;
                    $scope.NoOfBillSW_Ol = 0;
                    $scope.COUNT = 0;
                    $scope.Amount = 0;

                    angular.forEach($scope.DivTrsByDt, function (value, key) {
                        $scope.TotalNoInd += parseFloat(value.TotalNoInd);
                        $scope.paymentrequired += parseFloat(value.paymentrequired);
                        $scope.OpInd_BillOl_GW += parseFloat(value.OpInd_BillOl_GW);
                        $scope.OpInd_BillOl_SW += parseFloat(value.OpInd_BillOl_SW);
                        $scope.OperatingIndSwGw += parseFloat(value.OperatingIndSwGw);
                        $scope.NoOfBillGW_Ol += parseFloat(value.NoOfBillGW_Ol);
                        $scope.NoOfBillSW_Ol += parseFloat(value.NoOfBillSW_Ol);
                        $scope.COUNT += parseFloat(value.COUNT);
                        $scope.Amount += parseFloat(value.Amount);
                    });
                    debugger;
                    $scope.totalpayachieve = Math.round((parseFloat(parseFloat($scope.COUNT) / parseFloat($scope.paymentrequired)) * 100), 2);
                    var CurrentFyyr = ($filter('filter')($scope.crrfyyr, { fyyrid: $scope.ddlYear }));
                    $scope.fyyrname = CurrentFyyr[0].Fyyridname;
                    var monthdt = ($filter('filter')($scope.Monthlist, { monthid: $scope.ddlMonthCD }));
                    $scope.monthIiD = monthdt[0].Monthname;
                }
                else {
                    $scope.DivTrsByDt = "";
                }
            })
        }
        else {
            alert("Please Choose Financial Year");
            $scope.ddlMonthCD = "";
        }
    }

    $scope.removechoosemonth = function () {
        $scope.ddlMonthCD = "";
    }
    $scope.grndtotal = function (data) {
        debugger;
        $scope.grptotal = 0;
        angular.forEach(data, function (value, key) {
            debugger;
            $scope.grptotal += parseFloat(value.COUNT);
        });
        return $scope.grptotal;
    }
    $scope.Get_IndTransDtls = function () {
        debugger;
        var frmdt = $filter('date')(document.getElementById('DivFrm_Dt').value, 'dd/MM/yyyy');
        var todt = $filter('date')(document.getElementById('DivTo_Dt').value, 'dd/MM/yyyy');
        if (frmdt != null && frmdt != "" && todt != null && todt != "") {
            if (frmdt >= todt) {
                alert("From Date Can not be greater than To Date.");
                return;
            }
            if ($scope.ddlIndustry || $scope.chkDiv == true) {
                $http({
                    method: 'post',
                    url: 'GetTransByindDt',
                    data: { Industry_Code: $scope.ddlIndustry, From_DT: frmdt, To_DT: todt },
                    headers: { '__RequestVerificationToken': token }
                })
                    .success(function (data) {
                        //debugger;
                        if (data == -1) {
                            alert("From Date Can not be greater than To Date.");
                            return;
                        }
                        if (data.length > 0) {
                            $scope.DivTrsByDt = data;
                            $scope.total = 0;
                            angular.forEach($scope.DivTrsByDt, function (value, key) {
                                $scope.total += parseFloat(value.Amount);
                            });
                        }
                        if (data.length == 0) {
                            $scope.DivTrsByDt.length = 0;
                            alert("No data found");
                        }

                    })
            }
            else {
                $scope.DivTrsByDt.length = 0;
                alert("Select Industry or All Industry");

            }
        }
        else {
            $scope.DivTrsByDt.length = 0;
            alert("Select Date Fields");

        }

    };

    $scope.Monthlist = [{
        monthid: 1, Monthname: "January"
    }, {
        monthid: 2, Monthname: "February"
    }, {
        monthid: 3, Monthname: "March"
    }, {
        monthid: 4, Monthname: "April"
    }, {
        monthid: 5, Monthname: "May"
    }, {
        monthid: 6, Monthname: "June"
    }, {
        monthid: 7, Monthname: "July"
    }, {
        monthid: 8, Monthname: "August"
    }, {
        monthid: 9, Monthname: "September"
    }, {
        monthid: 10, Monthname: "October"
    }, {
        monthid: 11, Monthname: "November"
    }, {
        monthid: 12, Monthname: "December"
    }]
    $scope.crrfyyr = [{
        fyyrid: 2017, Fyyridname: "2017-18"
    }, {
        fyyrid: 2018, Fyyridname: "2018-19"
    }, {
        fyyrid: 2019, Fyyridname: "2019-20"
    }, {
        fyyrid: 2020, Fyyridname: "2020-21"
    }, {
        fyyrid: 2021, Fyyridname: "2021-22"
    }, {
        fyyrid: 2022, Fyyridname: "2022-23"
    }, {
        fyyrid: 2023, Fyyridname: "2023-24"
    }, {
        fyyrid: 2024, Fyyridname: "2024-25"
    }];
    $scope.crryr = [{
        fyyrid: 2017, Fyyridname: "2017"
    }, {
        fyyrid: 2018, Fyyridname: "2018"
    }, {
        fyyrid: 2019, Fyyridname: "2019"
    }, {
        fyyrid: 2020, Fyyridname: "2020"
    }, {
        fyyrid: 2021, Fyyridname: "2021"
    }, {
        fyyrid: 2022, Fyyridname: "2022"
    }, {
        fyyrid: 2023, Fyyridname: "2023"
    }, {
        fyyrid: 2024, Fyyridname: "2024"
    }, {
        fyyrid: 2025, Fyyridname: "2025"
    }];

    $scope.monthchange = function () {
        $scope.ddl_Monthcode = "";
        $scope.DivTrsByDt = "";
    }

    $scope.Indwiselistmeter = function () {
        if ($scope.ddl_FinancialYr != null && $scope.ddl_Monthcode != null) {
            $http({
                url: 'Indwiselistmeter',
                method: 'GET',
                params: { CurrentFinancialYear: $scope.ddl_FinancialYr, Month_Code: $scope.ddl_Monthcode }
            }).then(function (response) {
                if (response.data.length > 0) {
                    $scope.DivTrsByDt = response.data;
                    $scope.totalndustry = 0; $scope.totalnoofmeter = 0; $scope.totalbillgenerated = 0;
                    angular.forEach($scope.DivTrsByDt, function (value, key) {
                        $scope.totalndustry += parseFloat(value.COUNT);
                        $scope.totalnoofmeter += parseFloat(value.Noofmeter);
                        $scope.totalbillgenerated += parseFloat(value.Totalbillgenerated);
                    });
                }
                else {
                    $scope.DivTrsByDt = "";
                }
            })
        }
        else {
            alert("Please both choose Financial Year and Month");
            $scope.ddl_Monthcode = "";
        }
    }

    $scope.divwiseIndBill = function () {
        if ($scope.ddl_FinancialYr != null && $scope.ddl_Monthcode != null) {
            $http({
                url: 'divwiseIndBill',
                method: 'GET',
                params: { CurrentFinancialYear: $scope.ddl_FinancialYr, Month_Code: $scope.ddl_Monthcode }
            }).then(function (response) {
                if (response.data.length > 0) {
                    $scope.DivByIndBill = response.data;
                    $scope.totalndustry = 0; $scope.totalnoofmeter = 0; $scope.totalbillgenerated = 0;
                    angular.forEach($scope.DivByIndBill, function (value, key) {
                        $scope.totalndustry += parseFloat(value.COUNT);
                        $scope.totalbillgenerated += parseFloat(value.Totalbillgenerated);
                    });
                    debugger;
                    $scope.totalbillpercent = Math.round((parseFloat(parseFloat($scope.totalbillgenerated) / parseFloat($scope.totalndustry)) * 100), 2);
                    $scope.fyyrname = $scope.ddl_FinancialYr;
                    var monthdt = ($filter('filter')($scope.Monthlist, { monthid: $scope.ddl_Monthcode }));
                    $scope.monthIiD = monthdt[0].Monthname;
                }
                else {
                    $scope.DivByIndBill = "";
                }
            })
        }
        else {
            alert("Please both choose Financial Year and Month");
            $scope.ddl_Monthcode = "";
        }
    }

    $scope.Get_NoofIndustryRpt = function () {
        $http({
            url: 'getDivwisenoIndDtlsRpt',
            method: "GET",
            datatype: 'json',
            params: { Division: $scope.Division }
        })
            .success(function (data) {
                debugger;
                if (data.length > 0) {
                    $scope.DivTrsByDt = data;
                    $scope.totalnoind = 0; $scope.totalnoreg = 0; $scope.totalnoact = 0; $scope.NoofopINDReg = 0; $scope.NoofclINDReg = 0;
                    $scope.totalpercent = 0; $scope.NoOfOperatingInd = 0; $scope.NoOfClosedInd = 0;
                    angular.forEach($scope.DivTrsByDt, function (value, key) {
                        $scope.NoOfOperatingInd += parseFloat(value.NoOfOperatingInd);
                        $scope.NoOfClosedInd += parseFloat(value.NoOfClosedInd);
                        $scope.totalnoind += parseFloat(value.TotalNoInd);
                        $scope.totalnoreg += parseFloat(value.Totalregistered);
                        $scope.NoofopINDReg += parseFloat(value.NoofopINDReg);
                        $scope.NoofclINDReg += parseFloat(value.NoofclINDReg);
                        $scope.totalnoact += parseFloat(value.NoofIndAct);
                    });
                    debugger;
                    $scope.totalpercent = Math.round((parseFloat(parseFloat($scope.NoofopINDReg) / parseFloat($scope.NoOfOperatingInd)) * 100), 2);
                }
                if (data.length == 0) {
                    $scope.DivTrsByDt.length = 0;
                    return;
                }

            })
    };

    $scope.Get_OlineBillingRpt = function () {
        $http({
            url: 'getDivwiseOnlineBillingRpt',
            method: "GET",
            datatype: 'json',
            params: { CurrentFinancialYear: $scope.ddl_FinancialYr, Month_Code: $scope.ddl_Monthcode }
        })
            .success(function (data) {
                debugger;
                if (data.length > 0) {
                    $scope.DivTrsByDt = data;
                    $scope.operatingSurfaceW = 0; $scope.operatingGW = 0; $scope.OperatingSWGW = 0; $scope.NoOfClosedInd = 0; $scope.totalBillReq = 0; $scope.GrTotalSource = 0;
                    $scope.BillGen_GW = 0; $scope.BillGen_GWS = 0; $scope.ClosedIndBill = 0;
                    $scope.Totalbillgenerated = 0;
                    angular.forEach($scope.DivTrsByDt, function (value, key) {
                        $scope.operatingSurfaceW += parseFloat(value.operatingSurfaceW);
                        $scope.operatingGW += parseFloat(value.operatingGW);
                        $scope.OperatingSWGW += parseFloat(value.OperatingSWGW);
                        $scope.BillGen_GW += parseInt(value.BillGen_GW);
                        $scope.BillGen_GWS += parseInt(value.BillGen_GWS);
                        $scope.ClosedIndBill += parseInt(value.ClosedIndBill);
                        $scope.NoOfClosedInd += parseFloat(value.NoOfClosedInd);
                        $scope.totalBillReq += parseFloat(value.totalBillReq) + parseFloat(value.DiffPurpose);
                        $scope.Totalbillgenerated += parseFloat(value.Totalbillgenerated);
                        $scope.GrTotalSource += parseFloat(value.Totalsource);
                    });
                    $scope.totalpercent = Math.round((parseFloat(parseFloat($scope.Totalbillgenerated) / parseFloat($scope.totalBillReq)) * 100), 2);
                    var CurrentFyyr = ($filter('filter')($scope.crrfyyr, { fyyrid: $scope.ddl_FinancialYr }));
                    $scope.fyyrname = CurrentFyyr[0].Fyyridname;
                    var monthdt = ($filter('filter')($scope.Monthlist, { monthid: $scope.ddl_Monthcode }));
                    $scope.monthIiD = monthdt[0].Monthname;
                }
                if (data.length == 0) {
                    $scope.DivTrsByDt.length = 0;
                    return;
                }

            })
    };



    $scope.ChkMnth = true;
    $scope.MetervarificationRpt = function () {
        if ($scope.ddlYear) {
            $scope.ChkMnth = false;
        }
        else {
            $scope.ddlMonthCD = "";
            $scope.ChkMnth = true;
        }
        $http({
            url: 'getDivwiseflowmetrvarificationRpt',
            method: "GET",
            datatype: 'json',
            params: { Division: $scope.Division, Financial_Year: $scope.ddlYear, Month_Code: $scope.ddlMonthCD }
        })
            .success(function (data) {
                debugger;
                $scope.GW_Inspected = 0;
                $scope.SW_Inspected = 0;
                if (data.length > 0) {
                    $scope.DivTrsByDt = data;
                    $scope.NoOfOperatingInd = 0; $scope.NoofopSW = 0; $scope.NoofopGW = 0; $scope.NoOfSWater = 0; $scope.NoOfGWater = 0;
                    angular.forEach($scope.DivTrsByDt, function (value, key) {
                        $scope.NoOfOperatingInd += parseFloat(value.NoOfOperatingInd);
                        $scope.NoofopSW += parseFloat(value.NoofopSW);
                        $scope.NoofopGW += parseFloat(value.NoofopGW);
                        $scope.NoOfSWater += parseFloat(value.operatingSurfaceW);
                        $scope.NoOfGWater += parseFloat(value.operatingGW);
                        $scope.GW_Inspected += parseFloat(value.GW_Inspected);
                        $scope.SW_Inspected += parseFloat(value.SW_Inspected);
                    });

                }
                if (data.length == 0) {
                    $scope.DivTrsByDt.length = 0;
                    return;
                }

            })
    };

    $scope.printReport = function (Print_Report) {
        var innerContents = document.getElementById(Print_Report).innerHTML;
        var headerdata = '<div class="row" style="text-align:center"><div style ="height:120px;width:120px;margin:auto"><img src="/images/logo.png" /></div><p class="text-center">INDUSTRIAL WATER CONSUMPTION & REVENUE COLLECTION MONITORING </p><p class="text-center">WATER RESOURCES DEPARTMENT , GOVERNMENT OF ODISHA</p></div>';

        var footerdata = '<div><p> <b><u class="text-capitalize">Note:</u></b></p><p>(*) Highlight will indicate all the names of Industries/ Commercial establishment</p><p>Information will be supplied by concerend Division.</p><p>(**)Highlight will indicate the names of Industries/ Commercial Establishments.</p></div >';
        var popupWinindow = window.open('', '', 'width=1000,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../CSS/style.css" /><style>#Expo > thead tr, th { background-color: #bfbfbf;color: #000000; }.headertxt { visibility: visible; }@page { size: auto; margin-top:5mm; margin-left: 35px;  margin-right:35px; }</style></head><body onload="window.print()">' + headerdata + innerContents + footerdata + '</html>');
        popupWinindow.document.close();
    };
    //Print changes
    $scope.printReport_up = function (Print_Report) {
        var innerContents = document.getElementById(Print_Report).innerHTML;
        var headerdata = '<div class="row" style="text-align:center"><div style ="height:120px;width:120px;margin:auto"><img src="/images/logo.png" /></div><p class="text-center">INDUSTRIAL WATER CONSUMPTION & REVENUE COLLECTION MONITORING </p><p class="text-center">WATER RESOURCES DEPARTMENT , GOVERNMENT OF ODISHA</p></div>';

        var popupWinindow = window.open('', '', 'width=1000,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();
        popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../CSS/style.css" /><style>#Expo > thead tr, th { background-color: #bfbfbf;color: #000000; }.headertxt { visibility: visible; }@page { size: auto; margin-top:5mm; margin-left: 35px;  margin-right:35px;  } #dividd { font-size: 12px; } .wdt { width: 278px; } </style></head><body onload="window.print()">' + headerdata + innerContents + '</html>');
        popupWinindow.document.close();
    };
    $scope.printReport_FloMtr = function (Print_Report) {
        var innerContents = document.getElementById(Print_Report).innerHTML;
        var headerdata = '<div class="row" style="text-align:center"><div style ="height:120px;width:120px;margin:auto"><img src="/images/logo.png" /></div><p class="text-center">INDUSTRIAL WATER CONSUMPTION & REVENUE COLLECTION MONITORING </p><p class="text-center">WATER RESOURCES DEPARTMENT , GOVERNMENT OF ODISHA</p></div>';
        var yrmnth = '';
        if ($scope.ddlYear && $scope.ddlMonthCD) {
            var CurrentFyyr = ($filter('filter')($scope.crrfyyr, { fyyrid: $scope.ddlYear }));
            $scope.fyyrname = CurrentFyyr[0].Fyyridname;
            var monthdt = ($filter('filter')($scope.Monthlist, { monthid: $scope.ddlMonthCD }));
            $scope.monthIiD = monthdt[0].Monthname;
            yrmnth = '<div class="row" style = "text-align:center"><p class="text-center headertxt">ONLINE FLOW METER VARIFICATION REPORT</p></div><div class="row" style="text-align:center"><div class="box box-2" ><label>Financial Year :</label></div ><div class="box box-3"><label>' + $scope.fyyrname + '</label></div><div class="box box-2"><label>Month :</label></div><div class="box box-3"><label>' + $scope.monthIiD + '</label></div></div >';
        }
        if ($scope.ddlYear && !$scope.ddlMonthCD) {
            var CurrentFyyr = ($filter('filter')($scope.crrfyyr, { fyyrid: $scope.ddlYear }));
            $scope.fyyrname = CurrentFyyr[0].Fyyridname;
            yrmnth = '<div class="row" style = "text-align:center"><p class="text-center headertxt">ONLINE FLOW METER VARIFICATION REPORT</p></div><div class="row" style="text-align:center"><div class="box box-2" ><label>Financial Year :</label></div ><div class="box box-3"><label>' + $scope.fyyrname + '</label></div></div >';
        }
        if (!$scope.ddlYear && !$scope.ddlMonthCD) {
            yrmnth = '<div class="row" style = "text-align:center"><p class="text-center headertxt">ONLINE FLOW METER VARIFICATION REPORT</p></div>';
        }
        var popupWinindow = window.open('', '', 'width=1000,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
        popupWinindow.document.open();

        popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../CSS/style.css" /><style>table > thead tr, th { background-color: #bfbfbf;color: #000000; }.headertxt { visibility: visible; }@page { size: auto; margin-top:5mm; margin-left: 35px;  margin-right:35px;  } #dividd { font-size: 12px; } .wdt { width: 278px; } footer.stikybottom { position: fixed;bottom: 0;left: 0; right: 0; }</style></head><body onload="window.print()">' + headerdata + yrmnth + innerContents + '</html>');
        popupWinindow.document.close();
    };

    $scope.DeleteRecords = function (indCode) {
        var result = confirm("Are you sure want to delete all the Record of this Indusry ?");
        if (result) {
            var objnew = { Industry_Code: indCode };
            debugger;
            $http({
                url: 'Del_Ind',
                method: "POST",
                datatype: 'json',
                headers: { '__RequestVerificationToken': token },
                data: { objnew: objnew },
            }).then(function (response) {
                $scope.Message = response.data.status;
                if ($scope.Message == "Success") {
                    alert('You have Deleted Successfully.');
                    window.location.href = "EditPhaseAllocation";
                }
                else {
                    alert('Please try after some time');
                }
            });
        };
    };

    //PhaseWiseAllocation


    $scope.AllRecdnew_Phase = [];
    $scope.adddet_Phase = function () {

        debugger;
        var txtPhaseFrom_DT = document.getElementById('txtPhaseFrom_DT').value;
        var txtPhaseTo_DT = document.getElementById('txtPhaseTo_DT').value;

        $scope.AllRecdnew_Phase.push({
            Industry_Code: $scope.ddl_IndCode, Phase: $scope.txtPhase, PhaseAllocation_Qty: $scope.txtAlloQty,
            PhaseFrom_DT: txtPhaseFrom_DT, PhaseTo_DT: txtPhaseTo_DT, PhaseAggrement_OrderNo: $scope.Agordno,
            PhaseAggrement_DT: $scope.Agdt, PhaseAggr_From_DT: $scope.Agfrmdt, PhaseAggr_To_DT: $scope.Agtodt
        });
        $scope.txtPhase = "";
        $scope.txtAlloQty = "";
        $scope.txtPhaseFrom_DT = "";
        $scope.txtPhaseTo_DT = "";
        $scope.Agordno = "";
        $scope.Agdt = "";
        $scope.Agfrmdt = "";
        $scope.Agtodt = "";
    };
    $scope.Ins_PhaseWiseAllocantion = function () {

        var orddt = document.getElementById('orddt').value;
        var Agdt = document.getElementById('Agdt').value;
        var Agfrmdt = document.getElementById('Agfrmdt').value;
        var Agtodt = document.getElementById('Agtodt').value;
        var Phaseobj = {
            MyAction: $scope.MyAction, Industry_Code: $scope.ddl_IndCode, Source_CD: $scope.ddlWaterSource, Purpose_CD: $scope.ddlWaterPurpose,
            Basin: $scope.ddlBasin, River: $scope.ddlRiver, Dam: $scope.ddlDam, Allocation_Qty: $scope.AlloQty,
            OrderNo: $scope.ordno, OrderDate: orddt, Aggr_OrderNo: $scope.Agordno, Aggr_Date: Agdt,
            Aggr_FrmDT: Agfrmdt, Aggr_ToDT: Agtodt
        };
        var Phaseobj1 = $scope.AllRecdnew_Phase;

        $http({
            url: 'Ins_PhaseWiseAllocantion',
            method: "POST",
            //datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            data: { objnew: Phaseobj, objnew1: Phaseobj1 },
        }).then(function (response) {
            $scope.Message = response.data.status;
            if ($scope.Message == "Success") {
                alert('You have Successfully Submitted Data');
                window.location.href = "PhaseWiseAllocation";
            }
            else {
                alert('Please try after some time');
                window.location.href = "PhaseWiseAllocation";
            }
        });
    };
    //PhaseWiseAllocation


    $scope.Datevalidation = function () {
        debugger;
        var frmdt = $filter('date')(document.getElementById('txtPhaseFrom_DT').value, "dd/MM/yyyy");
        var Fromdtdt = new Date(frmdt);
        var todt = $filter('date')(document.getElementById('txtPhaseTo_DT').value, "dd/MM/yyyy");
        var Todtdt = new Date(todt);
        if (frmdt != null && frmdt != "" && todt != null && todt != "") {
            debugger;
            if (Fromdtdt >= Todtdt) {
                debugger;
                alert("From Date Can not be greater than To Date.");
                return;
            }
        }
    }

    $scope.getAllocationdetails = function () {
        var defer = $q.defer();
        var promise = defer.promise;
        promise.then($scope.BindIndName())
            .then($scope.AllocationInformation())
    };

    $scope.AllocationInformation = function () {
        $scope.AllAllocation = "";
        var req = {
            url: 'getAllocationDetails',
            method: 'get',
            headers: {
                '__RequestVerificationToken': token
            },
            datatype: 'json',
            params: { Division: $scope.ddlExec_Eng, Industry_Code: $scope.ddlIndustry }
        };
        $http(req).then(function (response) {
            $scope.AllAllocation = response.data;
        }).then(function () { $scope.BindBasin(); })
    }

    $scope.DeleteAllocation = function (v) {
        var result = confirm("Are you sure want to delete the Allocation ?");
        if (result) {
            var req = {
                url: 'RemoveAllocationdtls',
                method: 'post',
                headers: {
                    '__RequestVerificationToken': token
                },
                datatype: 'json',
                data: { SerialNo: v.SerialNo, Alloc_SNo: v.Alloc_SNo, Industry_Code: v.Industry_Code }
            };
            $http(req).then(function (response) {
                if (response.data == "Success") {
                    result = confirm("Data deleted Successfully");
                    if (result) {
                        $scope.getAllocationdetails();
                    }
                } else {
                    alert("Please Try after some time !!!");
                }
            })
        }
    }

    $scope.updateAllocationDetails = function () {
        debugger;
        var result = confirm("Are you want to Update the Allocation details");
        if (result) {
            var req = {
                url: 'UpdateAllocationdtls',
                method: 'post',
                headers: {
                    '__RequestVerificationToken': token
                },
                datatype: 'json',
                data: { SerialNo: $scope.SerialNo, Alloc_SNo: $scope.Alloc_SlNo, Industry_Code: $scope.Industry_Code, Source_CD: $scope.ddlWaterSource, Purpose_CD: $scope.Purpose_CD, Allocation_Qty: $scope.Allocation_Qty, Aggrement_Qty: $scope.Aggrement_Qty, Basin_CD: $scope.ddlBasin, Dam: $scope.Dam, River_Nalla_CD: $scope.ddlRiver, Aggrement_OrderNo: $scope.Aggrement_OrderNo, Aggrement_Status: $scope.ddlAggrement }
            };
            $http(req).then(function (response) {
                if (response.data == "Success") {
                    result = confirm("Data Updated Successfully");
                    if (result) {
                        $scope.CloseAlloModal();
                        $scope.getAllocationdetails();
                    }
                } else {
                    alert("Please Try after some time !!!");
                }
            })
        }
    }

    $scope.Aggrement_Status = [{ Aggrement_cd: 'Y', Aggrement_Name: 'Allocation Type Quantity' }, { Aggrement_cd: 'N', Aggrement_Name: 'Allowed Type Quantity' }]

    $scope.EditAllocation_dtls = function (v) {
        $scope.SerialNo = ""; $scope.Alloc_SlNo = ""; $scope.Industry_Code = ""; $scope.ddlWaterSource = ""; $scope.Purpose_CD = ""; $scope.Allocation_Qty = ""; $scope.Aggrement_Qty = ""; $scope.ddlBasin = ""; $scope.Dam = ""; $scope.ddlRiver = ""; $scope.Aggrement_OrderNo = ""; $scope.ddlAggrement = "";
        debugger;
        var openModal = document.getElementById('AllocationModal');
        function AlloOpenModal() {
            openModal.style.display = "block";
        }
        AlloOpenModal();
        $scope.Industry_Code = v.Industry_Code;
        $scope.IndustryName = v.IndustryName;
        $scope.ddlWaterSource = v.Source_CD;
        $scope.EE_Name = v.EE_Name;
        $scope.WaterPurpose();
        $timeout(function () {
            $scope.Purpose_CD = v.Purpose_CD;
            $scope.Allocation_Qty = v.Allocation_Qty;
            $scope.OrderNo = v.OrderNo;
            $scope.OrderDate = v.OrderDate;
            $scope.SerialNo = v.SerialNo;
            $scope.Alloc_SlNo = v.Alloc_SNo;
            $scope.ddlBasin = v.Basin_CD;
            $scope.ddlRiver = v.River_Nalla_CD;
            $scope.WaterSource();
            $scope.$watch('Source_CD', function () {
                $scope.ddlWaterSource = v.Source_CD;
            });
            $http({
                url: 'ddl_River',
                method: "GET",
                datatype: 'json',
                headers: { '__RequestVerificationToken': token },
                params: { BasinID: $scope.ddlBasin },
            }).then(function (response) {
                $scope.lst_River = response.data;
                $scope.BindDam();
            });
            $scope.Dam = v.Dam;
            $scope.ddlAggrement = v.Aggrement_Status;
            $scope.Aggrement_OrderNo = v.Aggrement_OrderNo;
            $scope.Aggrement_Qty = v.Aggrement_Qty;
            $scope.Aggrement_DT = v.Aggrement_DT;
            $scope.Agg_From_DT = v.Agg_From_DT;
            $scope.Agg_To_DT = v.Agg_To_DT;
            $scope.Division = v.Division;
            $scope.Address = $scope.Address;
            $scope.PIN = $scope.PIN;
        }, 300);

    };

    $scope.CreateNewUser = function () {
        if ($scope.txtNewPWD != null && $scope.passwordText == " * Strong") {
            var pass = $scope.txtNewPWD; var cnfpass = $scope.txtConfPWD;
            if (pass == cnfpass) {
                var newhash = sha256_digest(pass);
                var confpass = sha256_digest(cnfpass);
                $http({
                    url: 'InsertNewUser',
                    method: "POST",
                    datatype: 'json',
                    headers: { '__RequestVerificationToken': token },
                    params: {
                        UserID: $scope.txtuserName, Roles: $scope.ddlRoles, Password: newhash, IP_Address: $scope.txtIPAddress,
                        MobileNo: $scope.MobileNo
                    }
                }).then(function (response) {
                    console.log(response.data);
                    if (response.data.status == "Success") {
                        alert("User Created Successfully");
                        window.location.reload();
                    }
                    else if (response.data.status == "UnSuccess") {
                        alert("Please Try After Some Time");
                        $scope.txtNewPWD = ""; $scope.txtConfPWD = ""; $scope.txtIPAddress = ""; $scope.ddlRoles = "";
                        $scope.MobileNo = "";
                    }
                    else {
                        alert(response.data.status);
                        $scope.txtNewPWD = ""; $scope.txtConfPWD = ""; $scope.txtIPAddress = ""; $scope.ddlRoles = "";
                        $scope.MobileNo = "";
                    }
                });
            }
            else { alert("New Password & Confirm Password Doesn't Match"); $scope.txtNewPWD = ""; $scope.txtConfPWD = ""; $scope.txtIPAddress = ""; $scope.ddlRoles = ""; }
        }
        else { alert("Password Must be 8 or more Than 8 Letters with at least one Uppercase,one Lowercase,one Special Character and one Number"); $scope.txtNewPWD = ""; $scope.txtConfPWD = ""; $scope.txtIPAddress = ""; $scope.ddlRoles = ""; }
    }
    $scope.ConvertionStatus = "";
    $scope.ExistingMeter = true;
    $scope.MeterInitialize = true;
    $scope.DivtoMeter = true;
    $scope.divdefectivcemeter = true;
    $scope.CovertionMeter = function (v) {

        if (v.MeterDefRed == null) {
            $scope.MeterTypeDsblN = true;
            $scope.MeterTypeDsbl = true;
        }
        $scope.selectMeterID = v.MeterId;
        //$scope.MeterTypeDsblN = true;
        //$scope.MeterTypeDsbl = true;

        $scope.txtDefUnits = v.MeterDefRed;
        $scope.txtDefdt = FromJSONDate(v.MeterDefectiveDt);
        $scope.txtmeterdefectiveDt = FromJSONDate(v.MeterDefectiveDt);
        if (v.MeterType == 1) {
            // $scope.ConvertionStatus = "Defective Flow Meter";
            $scope.divdefectivcemeter = false;
        }
        else {
            // $scope.ConvertionStatus = "No Flow Meter To Flow Meter";
            $scope.MeterType = 4;
            $scope.chngMeterStatus();
            $scope.divdefectivcemeter = false;
        }
    };

    $scope.chngMeterStatus = function () {

        if ($scope.MeterType == 4) {
            $scope.DivtoMeterDef = false; $scope.DivtoMeter = true; $scope.ExistingMeter = true; $scope.MeterTypeDsblIn = false; $scope.Unitdetails(); $scope.MeterInitialize = true; $scope.ConvertionStatus = "Defective Meter";
        }
        else if ($scope.MeterType == 1) {
            $scope.DivtoMeterDef = true; $scope.DivtoMeter = false; $scope.ExistingMeter = true; $scope.Unitdetails(); $scope.MeterInitialize = true; $scope.ConvertionStatus = "Installation Of New Meter or Replace Meter";
        }
        else if ($scope.MeterType == 2) {
            $scope.DivtoMeterDef = true; $scope.DivtoMeter = true; $scope.ExistingMeter = false;
            $scope.MeterInitialize = false;
            $scope.ConvertionStatus = "Defective Meter";
            $scope.txtmeterdefectiveDt = $scope.txtDefdt;
        }
        else {
            $scope.DivtoMeterDef = true; $scope.DivtoMeter = true; $scope.ExistingMeter = true; $scope.ConvertionStatus = "Meter Initialization"; $scope.MeterInitialize = false;
        }
    };
    $scope.MeterTypeDsbl = false; $scope.MeterTypeDsblN = false; $scope.MeterTypeDsblIn = false;
    $scope.DivtoMeterDef = true;
    $scope.MeterTypeDsbDef = false;
    $scope.getMeterAllocationDtls = function () {
        var myReq = {
            method: 'GET',
            url: 'getAllmeterdetails',
            headers: {
                ["__RequestVerificationToken"]: token
            },
            params: { _Industry_id: $scope.ddlIndustry, _source_cd: $scope.ddlWaterSource, _Purpose_cd: $scope.ddlWaterPurpose }
        };

        $http(myReq).then(function success(response) {
            debugger;
            $scope.txtAllocationQty = response.data.alloqdt;
            $scope.LstMeterData = response.data.obbdt;

            if ($scope.LstMeterData.length > 0) {
                $scope.MeterId = $scope.LstMeterData.MeterId;
                $scope.DivtoMeterDef = false;
            }
            else {
                $scope.DivtoMeterDef = true;
            }
        });
    };


    $scope.getInActiveMeter = function () {
        if ($scope.ddlIndustry != null) {
            if ($scope.ddlmeterType != null) {
                var myReq = {
                    method: 'GET',
                    url: '/Exec_Eng/getAllInActivemeterdetails',
                    headers: {
                        ["__RequestVerificationToken"]: token
                    },
                    params: { _Industry_id: $scope.ddlIndustry, MeterType: $scope.ddlmeterType }
                };

                $http(myReq).then(function success(response) {
                    debugger;
                    if (response.data.length > 0) {
                        $scope.LstMeterData = response.data;
                    }
                    else { $scope.LstMeterData = ""; }
                });
            }
            else { alert("Please Meter Type"); }
        }
        else { alert("Please Choose Industry"); }
    };

    $scope.LstMeterData = "";

    var Cleardata = function (x) {
        $scope.ddlWaterSource = ""; $scope.ddlWaterPurpose = ""; $scope.txtAllocationQty = ""; $scope.LstMeterData = ""; $scope.DivtoMeterDef = true;
        $scope.ConvertionStatus = ""; $scope.MeterType = ""; $scope.txtmtrMake = ""; $scope.txtmtrSerialNo = ""; $scope.ddlUnit = "";
        $scope.txtmtrMaxDigit = ""; $scope.txtMtrCommissioningdt = ""; $scope.txtmtrSealdt = ""; $scope.txtMtrCalibrationdt = ""; $scope.txtMtrInspeciondt = ""; $scope.txtmeterchangedt = ""; $scope.txtmtrremarks = ""; $scope.txtmeterdefectiveDt = ""; $scope.divdefectivcemeter = true;
        $scope.txtMtrInstallation = ""; $scope.radiometerInitialize = ""; $scope.MeterTypeDsbl = false; $scope.MeterTypeDsblN = false; $scope.MeterTypeDsblIn = false; $scope.DivtoMeter = true;
        x();
    };

    $scope.getclrrecord = function () {
        Cleardata(function () {
            $scope.IndWiseWaterSourcedtls();
        });
    };

    $scope.Btn_Save_defective_Meter = function () {
        var reqdata = {
            // MeterId: $scope.PreviousMeter,
            Industry_Code: $scope.ddlIndustry,
            Source_CD: $scope.ddlWaterSource,
            Purpose_CD: $scope.ddlWaterPurpose,
            SerialNo: $scope.txtmtrSerialNo,
            Status: $scope.ConvertionStatus,
            Make: $scope.txtmtrMake,
            metertype: $scope.MeterType,
            UnitId: $scope.ddlUnit,
            MaxDigits: $scope.txtmtrMaxDigit,
            CommissioningDate: $scope.txtMtrCommissioningdt,
            SealDate: $scope.txtmtrSealdt,
            CalibrationDate: $scope.txtMtrCalibrationdt,
            InitialInspectionDate: $scope.txtMtrInspeciondt,
            MeterChangeDt: $scope.txtmeterchangedt,
            Remarks: $scope.txtmtrremarks,
            MeterDefectiveDt: $scope.txtDefdt,
            MeterInstallationDt: $scope.txtMtrInstallation,
            MeterInitialize: $scope.radiometerInitialize,
            MeterInitializationDt: $scope.txtMtrinitiaizationdt,
            MeterDefReading: $scope.txtDefUnits
        };
        if ($scope.selectMeterID != null) {
            reqdata.MeterId = $scope.selectMeterID;
        }

        var myReq = {
            method: 'POST',
            url: '/Exec_Eng/Insert_DefetctiveMeter',
            headers: {
                ["__RequestVerificationToken"]: token
            },
            data: { ExeOAL: reqdata }
        };
        $http(myReq).then(function success(response) {
            if (response.data.output == "Success") {
                alert("Data Saved Successfully");
                window.location.reload();
            } else if (response.data.output != null) {
                alert(response.data.output);
            }
            else { alert("Please Try Later"); }
        });
    };
    $scope.clrdatatype = function () {
        $scope.ddlmeterType = ""; $scope.LstMeterData = "";
    };

    $scope.MetervarificationRptDivWise = function () {
        $http({
            url: 'getDivwiseflowmetrvarificationRpt',
            method: "GET",
            datatype: 'json',
            params: { Division: $scope.Division }
        })
            .success(function (data) {
                debugger;
                if (data.length > 0) {
                    $scope.DivTrsByDt = data;
                    $scope.NoOfOperatingInd = 0; $scope.NoofopSW = 0; $scope.NoofopGW = 0; $scope.NoOfSWater = 0; $scope.NoOfGWater = 0;
                    $scope.SW_InspectedTot = 0; $scope.GW_InspectedTot = 0; $scope.operatingGWTot = 0;
                    angular.forEach($scope.DivTrsByDt, function (value, key) {
                        $scope.NoOfOperatingInd += parseFloat(value.NoOfOperatingInd);
                        $scope.NoofopSW += parseFloat(value.NoofopSW);
                        $scope.NoofopGW += parseFloat(value.NoofopGW);
                        $scope.operatingGWTot += parseFloat(value.operatingGW);
                        $scope.NoOfSWater += parseFloat(value.operatingSurfaceW);
                        $scope.SW_InspectedTot += parseFloat(value.SW_Inspected);
                        $scope.GW_InspectedTot += parseFloat(value.GW_Inspected);
                    });

                }
                if (data.length == 0) {
                    $scope.DivTrsByDt.length = 0;
                    return;
                }
            })
    };

    $scope.ChkInsertMeterDet = function () {
        var txtDateOfCommissioning = document.getElementById('txtDateOfCommissioning').value;
        var txtSealDate = document.getElementById('txtSealDate').value;
        var txtInitialInspectionDate = document.getElementById('txtInitialInspectionDate').value;
        var txtDateOfCalibration = document.getElementById('txtDateOfCalibration').value;
        $scope.MyAction = "I";
        $scope.prcdata = {
            IndustryId: $scope.ddlIndustry, Make: $scope.txtMake, Unit_Id: $scope.ddlUnit, SerialNo: $scope.txtSerialNo, MaxDigits: $scope.txtMaxDigit, CommissioningDate: txtDateOfCommissioning, SealDate: txtSealDate, InitialInspectionDate: txtInitialInspectionDate, CalibrationDate: txtDateOfCalibration, Source_CD: $scope.ddlWaterSource, BasinID: $scope.ddlBasin, RiverID: $scope.ddlRiver, purpose_CD: $scope.ddlWaterPurpose, DamID: $scope.ddlDam, MeterId: $scope.MeterIdpk
        };

        var myAction = {
            method: 'POST',
            url: 'ChkMeterDet_Entry',
            headers: { '__RequestVerificationToken': token },
            //datatype: 'json',
            data: { objsnew: $scope.prcdata }
        };
        $http(myAction).then(function success(response) {
            debugger;
            $scope.Message == response.data.status;
            if ($scope.Message == "No Meter already Assisgn to Same Industry") {
                var result = confirm("Do You Want To Insert Meter ?");
                if (result) {
                    $scope.InsertMeterDet();
                }

            }
            else {
                $scope.InsertMeterDet();
            }


        });
    }

    /////////////

    $scope.CovertionMeterDef = function (v) {
        $scope.selectMeterID = v.MeterId;
        $scope.SerialNo = v.serialNo;
        $scope.txtDefUnits = parseInt(v.MeterDefRed);
        $scope.txtDefdt = FromJSONDate(v.MeterDefectiveDt);
        $scope.txtmeterdefectiveDt = FromJSONDate(v.MeterDefectiveDt);

        $scope.MeterType = 4;
        $scope.chngMeterStatus();
        $scope.divdefectivcemeter = false;
    };
    $scope.ChkDefMeter = function () {
        $scope.MeterTypeDsblN = true;
        $scope.MeterTypeDsbl = true;
    };
    $scope.Defective_MeterEntry = function () {
        debugger;
        // var mtrid = document.getElementById('mtrid').value;
        var reqdata = {
            //MeterId: mtrid,
            Industry_Code: $scope.ddlIndustry,
            Source_CD: $scope.ddlWaterSource,
            Purpose_CD: $scope.ddlWaterPurpose,
            SerialNo: $scope.txtmtrSerialNo,
            Status: $scope.ConvertionStatus,
            Make: $scope.txtmtrMake,
            metertype: $scope.MeterType,
            UnitId: $scope.ddlUnit,
            MaxDigits: $scope.txtmtrMaxDigit,
            CommissioningDate: $scope.txtMtrCommissioningdt,
            SealDate: $scope.txtmtrSealdt,
            CalibrationDate: $scope.txtMtrCalibrationdt,
            InitialInspectionDate: $scope.txtMtrInspeciondt,
            MeterChangeDt: $scope.txtmeterchangedt,
            Remarks: $scope.txtDefRemark,
            MeterDefectiveDt: $scope.txtDefdt,
            MeterInstallationDt: $scope.txtMtrInstallation,
            MeterInitialize: $scope.radiometerInitializ8e,
            MeterInitializationDt: $scope.txtMtrinitiaizationdt,
            MeterDefReading: $scope.txtDefUnits
        };
        if ($scope.selectMeterID != null) {
            reqdata.MeterId = $scope.selectMeterID;
        }
        if (!reqdata.SerialNo) {
            reqdata.SerialNo = $scope.SerialNo;
        }
        if ($scope.txtDefdt && $scope.txtDefUnits) {
            var myReq = {
                method: 'POST',
                url: '/Exec_Eng/InsertDefetctiveMtr',
                headers: {
                    ["__RequestVerificationToken"]: token
                },
                data: { ExeOAL: reqdata }
            };
            $http(myReq).then(function success(response) {
                if (response.data.output == "Success") {
                    alert("Data Saved Successfully");
                    window.location.reload();
                } else if (response.data.output != null) {
                    alert(response.data.output);
                }
                else { alert("Please Try Later"); }
            });
        };
    };
    $scope.IndustrydetailsDef = function () {
        $http({
            url: 'ddl_DefName',
            method: "GET",
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            $scope.lstName = response.data;
        });
    };
    $scope.GetindstryMeterDef = function (ddlIndustry) {
        $http({
            method: 'get',
            url: 'DefMeterIndustryWise',
            headers: { '__RequestVerificationToken': token },
            params: { IndustryID: ddlIndustry }
        }).success(function (responce) {
            $scope.Allmeter = responce;
            $scope.ntt = { ddlyr: "", ddlmonth: "", final_read: "", Diffmeterread: "", meterRate: "", chkbox: "", finalRead: "", finaltxtRead: "", initialtxtRead: "", allmonths: "", status: null, meterunitrate: "", showUpdateBtn: false };
            $scope.ntt.initialtxtRead = true;
            $scope.ntt.finaltxtRead = true;
            $scope.ntt.initialRead = false;
            $scope.ntt.finalRead = false;
            angular.forEach($scope.Allmeter.getmeterdetail, function (value, key) {
                value.CommissioningDate = FromJSONDate(value.CommissioningDate);
                value.SealDate = FromJSONDate(value.SealDate);
                value.MeterDefectiveDt = FromJSONDate(value.MeterDefectiveDate);
                angular.merge(value, $scope.ntt);
            })
        });
    }
    $scope.selectchklineDef = function (nt) {
        debugger;
        if (nt.Month_Code != "") {
            if ($scope.GetmeterReadingdtls.length > 0) {
                if (nt.chkbox == true) {
                    $scope.GetmeterReadingdtls.push({
                        Industry_ID: $scope.ddlIndustry, Meter_ID: nt.meterID, Financial_Year: nt.fyyr, Month_ID: nt.Month_Code, InitialDate: todate(nt.initial_dt),
                        FinalDate: todate(nt.Enddate), InitialMeterReading: nt.initial_read, FinalMeterReading: nt.final_read, MeterReadingDifference: nt.Diffmeterread, MeterRate: nt.meterRate
                    });
                    console.log($scope.GetmeterReadingdtls);
                    nt.chkbox = true;
                }
                else {
                    angular.forEach($scope.GetmeterReadingdtls, function (value, key) {
                        if (value.Meter_ID == nt.meterID) {
                            $scope.GetmeterReadingdtls.splice(key, 1);
                            nt.chkbox = false;
                        }
                    });
                }

            }
            else {
                $scope.GetmeterReadingdtls.push({
                    Industry_ID: $scope.ddlIndustry, Meter_ID: nt.meterID, Financial_Year: nt.fyyr, Month_ID: nt.Month_Code,
                    InitialDate: todate(nt.initial_dt), FinalDate: todate(nt.Enddate), InitialMeterReading: nt.initial_read,
                    FinalMeterReading: nt.final_read, MeterReadingDifference: nt.Diffmeterread, MeterRate: nt.meterRate
                });
                console.log($scope.GetmeterReadingdtls);
                nt.chkbox = true;
            }
        }
        else {
            nt.chkbox = false;
            alert("Please Fill all the Field");

        }
    };

    $scope.getmonthlistDef = function (nt) {
        if (nt.ddlyr) {
            debugger;
            $http({
                method: 'get',
                url: 'GetDefMnth',                                      //getmonthlist',
                headers: { '__RequestVerificationToken': token },
                params: {
                    fynanceyr: nt.yyyr, meterID: nt.meterID, IndustryID: nt.industryID, sourceCD: nt.sourcecode,
                    PurposeCD: nt.purpose_cd
                }
            }).success(function (data) {
                debugger;
                nt.allmonths = data;
            });
        }
        else {
            nt.allmonths = [];
        }

    };
    $scope.MeterStatus = "";
    $scope.getpricedtlsDef = function (nt, indx) {
        debugger;
        $scope.monthId = nt.Month_Code;
        $scope.MeterID = nt.MeterId;
        $scope.fyyr = nt.ddlyr;

        //$scope.IndData = ($filter('filter')(nt.allmonths, { Month_Code: nt.Month_Code }));
        //if ($scope.IndData.length > 0) {
        //    nt.initial_dt = FromJSONDate($scope.IndData[0].startdate);
        //    nt.Enddate = FromJSONDate($scope.IndData[0].Enddate);
        //    nt.meterRate = $scope.IndData[0].MeterRate;
        //    nt.showUpdateBtn = true;
        //}
        //else {
        //    nt.initial_dt = "";
        //    nt.Enddate = "";
        //    nt.meterRate = "";
        //    nt.showUpdateBtn = false;
        //}

        $scope.monthId = nt.Month_Code;
        $scope.MeterID = nt.meterID;
        $scope.fyyr = nt.ddlyr;
        $http({
            method: 'get',
            url: 'getalldtlsmonthwise',
            headers: { '__RequestVerificationToken': token },
            params: { monthid: $scope.monthId, meterID: $scope.MeterID, IndustryID: $scope.ddlIndustry, fyyr: nt.fyyr }
        })
            .success(function (data) {
                if (data.Industrywisepurpose) {
                    nt.initial_dt = FromJSONDate(data.Industrywisepurpose.startdate);
                    nt.Enddate = FromJSONDate(data.Industrywisepurpose.Enddate);
                    nt.initial_read = data.Industrywisepurpose.Intialreading;
                    nt.final_read = data.Industrywisepurpose.finalreading;
                    nt.meterRate = data.Industrywisepurpose.meterRate;
                    nt.Diffmeterread = data.Industrywisepurpose.differncemeterread;
                    nt.status = data.Industrywisepurpose.status;
                    $scope.MeterStatus = nt.status;
                    nt.meterunitrate = data.Industrywisepurpose.meterunitrate;
                    nt.showUpdateBtn = true;
                    if (nt.initial_read > 0) {
                        nt.initialtxtRead = false; nt.initialRead = true;
                    }
                    else { nt.initialtxtRead = true; nt.initialRead = false; }
                    if (nt.final_read > 0) {
                        nt.finalRead = true; nt.finaltxtRead = false;
                    }
                    else { nt.finaltxtRead = true; nt.finalRead = false; }
                    var p = document.getElementById("chk");
                    debugger;
                    if (nt.status != null && nt.status == "Approved") {
                        p.disabled = true;
                    }
                    else {
                        p.disabled = false;
                    }
                }
                else {
                    nt.initial_dt = "";
                    nt.Enddate = "";
                    nt.meterRate = "";
                    nt.showUpdateBtn = false;
                }

            });
    };

    $scope.updatemeterreadDef = function (nt) {
        debugger;

        var billinddtls = {
            Industry_ID: $scope.ddlIndustry, Meter_ID: nt.meterID, Financial_Year: nt.ddlyr, Month_ID: nt.Month_Code,
            InitialDate: nt.initial_dt, FinalDate: nt.Enddate, MeterRate: nt.meterRate
        };
        $http({
            method: 'POST',
            url: 'updateDefbillingstatus',
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            data: { objbillings: billinddtls }
        }).success(function (responce) {
            debugger;
            var k = responce;
            if (k == "success") {
                alert("Data Updated Successfully");
                window.location.reload();
            }
            else { alert(k); }
        });
    };
    $scope.insertDefmeterDetails = function () {
        if ($scope.GetmeterReadingdtls.length > 0) {
            var myReq = {
                method: 'POST',
                url: 'InsertDefmeterReadingdtls',
                headers: { '__RequestVerificationToken': token },
                data: { objbilling: $scope.GetmeterReadingdtls }
            };
            $http(myReq).then(function success(response) {
                debugger;
                if (response.data == true) {
                    alert("Data Saved Successfully");
                    window.location.reload();
                }
                else if (response.data == "Dup") {
                    alert("Record Already Exists.");
                }
                else {
                    alert("Failed");
                }
            });
        }
        else {
            alert("please choose the check box before proceed !!!");
        }
    }
    $scope.MtrStatus = false;
    $scope.GetMtrdtls = [];
    $scope.selectdMtrRplc = function (nt) {
        $scope.MtrStatus = true;
        $scope.txtmeterdefectiveDt = nt.MeterDefectiveDt;
        if ($scope.GetMtrdtls.length > 0) {
            $scope.GetMtrdtls.splice(0, 1);
            $scope.GetMtrdtls.push({
                Industry_ID: nt.industryID, Meter_ID: nt.meterID, Financial_Year: nt.fyyr, Month_ID: nt.Month_Code,
                CommissioningDate: nt.CommissioningDate, Make: nt.Make, meterunit: nt.meterunit, purpose_cd: nt.purpose_cd,
                sourcecode: nt.sourcecode, SealDate: nt.SealDate, SerialNo: nt.SerialNo, UnitName: nt.UnitName, Year: nt.yyyr
            });
        }
        else {
            $scope.GetMtrdtls.push({
                Industry_ID: nt.industryID, Meter_ID: nt.meterID, Financial_Year: nt.fyyr, Month_ID: nt.Month_Code,
                CommissioningDate: nt.CommissioningDate, Make: nt.Make, meterunit: nt.meterunit, purpose_cd: nt.purpose_cd,
                sourcecode: nt.sourcecode, SealDate: nt.SealDate, SerialNo: nt.SerialNo, UnitName: nt.UnitName, Year: nt.yyyr
            });
        }
    };

    $scope.DisplyBtn = function () {
        if ($scope.MeterType == 1) {
            $scope.DivtoMeterDef = true; $scope.DivtoMeter = false; $scope.ExistingMeter = true; $scope.Unitdetails(); $scope.MeterInitialize = true; $scope.ConvertionStatus = "Installation Of New Meter or Replace Meter";
        }
        else if ($scope.MeterType == 2) {
            $scope.DivtoMeterDef = true; $scope.DivtoMeter = true; $scope.ExistingMeter = false;
            $scope.MeterInitialize = false;
            $scope.ConvertionStatus = "Meter Repaired";
            //$scope.txtmeterdefectiveDt = $scope.GetMtrdtls[0].MeterDefectiveDt;
        }
        $scope.saveMtrBtn = true;
    };
    $scope.Save_MeterDtls = function () {
        debugger;
        var objnew = {
            //PreviousMeterId: $scope.GetMtrdtls[0].Meter_ID,
            MeterId: $scope.GetMtrdtls[0].Meter_ID,
            Industry_Code: $scope.GetMtrdtls[0].Industry_ID,
            Source_CD: $scope.GetMtrdtls[0].sourcecode,
            Purpose_CD: $scope.GetMtrdtls[0].purpose_cd,
            SerialNo: $scope.txtmtrSerialNo,
            Status: $scope.ConvertionStatus,
            Make: $scope.txtmtrMake,
            metertype: $scope.MeterType,
            UnitId: $scope.ddlUnit,
            MaxDigits: $scope.txtmtrMaxDigit,
            CommissioningDate: $scope.txtMtrCommissioningdt,
            SealDate: $scope.txtmtrSealdt,
            CalibrationDate: $scope.txtMtrCalibrationdt,
            InitialInspectionDate: $scope.txtMtrInspeciondt,
            MeterChangeDt: '',
            Remarks: $scope.txtmtrremarks
        };
        if ($scope.MeterType == 1) {
            objnew.MeterChangeDt = $scope.txtmeterchangedt;
        }
        if ($scope.MeterType == 2) {
            objnew.MeterChangeDt = $scope.txtMtrInstallation;
        }
        $http({
            method: 'post',
            url: '/Exec_Eng/InsertMtrDtls',
            headers: {
                ["__RequestVerificationToken"]: token
            },
            data: { objnew: objnew }
        })
            .then(function success(response) {
                debugger;
                if (response.data.Output == "Success") {
                    alert("Data Saved Successfully");
                    window.location.reload();
                } else if (response.data.Output != null) {
                    alert(response.data.Output);
                }
                else { alert("Please Try Later"); }
            });
    };

    $scope.MtrIni = function (v) {
        debugger;
        $scope.selectMeterIDIni = v.MeterId;
        $scope.SerialNoIni = v.serialNo;
        //$scope.txtDefUnits = parseInt(v.MeterDefRed);
        //$scope.txtDefdt = FromJSONDate(v.MeterDefectiveDt);
        //$scope.txtmeterdefectiveDt = FromJSONDate(v.MeterDefectiveDt);

        $scope.MeterType = 3;
        $scope.MtrIniData = false;
    };
    $scope.MtrIniData = true;
    $scope.MeterInitialize = function () {
        debugger;
        var reqdata = {
            Industry_Code: $scope.ddlIndustry,
            Source_CD: $scope.ddlWaterSource,
            Purpose_CD: $scope.ddlWaterPurpose,
            SerialNo: $scope.SerialNoIni,
            Status: "Meter Initialization",
            metertype: $scope.MeterType,
            Remarks: $scope.txtDefRemark,
            MeterInitialize: $scope.radiometerInitialize,
            MeterInitializationDt: $scope.txtMtrinitiaizationdt,
            MeterDefReading: $scope.txtReadingBefInitialize
        };
        if ($scope.selectMeterIDIni != null) {
            reqdata.MeterId = $scope.selectMeterIDIni;
        }
        if ($scope.radiometerInitialize && $scope.txtMtrinitiaizationdt && $scope.txtReadingBefInitialize) {
            var myReq = {
                method: 'POST',
                url: '/Exec_Eng/InsertMtrDtls',
                headers: {
                    ["__RequestVerificationToken"]: token
                },
                data: { objnew: reqdata }
            };
            $http(myReq).then(function success(response) {
                if (response.data.Output == "Success") {
                    alert("Data Saved Successfully");
                    window.location.reload();
                } else if (response.data.output != null) {
                    alert(response.data.output);
                }
                else { alert("Please Try Later"); }
            });
        };
    };

    $scope.UploadExcel = function () {
        debugger;
        var file = document.getElementById('fileupld').files[0];
        var fd = new FormData();
        if (file) {
            fd.append("ExlFile", file);
            $http({
                method: 'post',
                url: 'readExcel',
                data: fd,
                headers: { 'Content-Type': undefined }
            })
                .then(function success(response) {
                    debugger;
                    var data = response.data.status;
                    if (data >= 0) {
                        alert(data + " Records Updated");
                        window.location.reload();
                    }
                    else {
                        alert("Some Error Occured");
                        window.location.reload();
                    };
                });
        }
        else {
            alert("Choose a File.");
        }
    };

    $scope.GetUId = function () {
        $http({
            method: 'get',
            url: 'Get_Ind_UId'
        })
            .then(function success(response) {
                debugger;
                var data = response.data;
                if (data.length > 0) {
                    $scope.UIdData = data;
                }
                else {

                }
            });
    };

    $scope.Get_NoMtrInd = function () {
        debugger;
        var objnew = { Division: $scope.Division };
        $http({
            url: 'NoMetInd',
            method: "GET",
            datatype: 'json',
            params: { Division: $scope.Division }
        })
            .success(function (data) {
                debugger;
                if (data.length > 0) {
                    $scope.IndOperationStts = data;
                    $scope.total = 0;
                }
                if (data.length == 0) {
                    $scope.IndOperationStts.length = 0;
                    return;
                }

            })
    };

    $scope.get_Culture = function () {

        var xmlHttp;
        function srvTime() {
            try {
                //FF, Opera, Safari, Chrome
                xmlHttp = new XMLHttpRequest();
            }
            catch (err1) {
                //IE
                try {
                    xmlHttp = new ActiveXObject('Msxml2.XMLHTTP');
                }
                catch (err2) {
                    try {
                        xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
                    }
                    catch (eerr3) {
                        //AJAX not supported, use CPU time.
                        alert("AJAX not supported");
                    }
                }
            }
            xmlHttp.open('HEAD', window.location.href.toString(), false);
            xmlHttp.setRequestHeader("Content-Type", "text/html");
            xmlHttp.send('');
            return xmlHttp.getResponseHeader("Date");
        }

        var st = srvTime();
        var today = new Date(st);
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var hours = today.getHours();
        var minutes = today.getMinutes();
        var seconds = today.getSeconds();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        var strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        today = dd + '/' + mm + '/' + yyyy + ' ' + strTime;
        $scope.date = today;
    };

    //----------------04-09-2019

    $scope.GenBill_Tmp = function (vm, typ) {
        $http({
            url: "view_Billindividual",
            method: "post",
            headers: { '__RequestVerificationToken': token },
            data: { objbill: vm }
        }).success(function (data) {
            debugger;
            if (data == true) {
                if (typ == 'I') {
                    $window.open("ViewTmpBill", "Popup", "width=1250,height=600");
                }
                else if (typ == 'H') {
                    $window.open("ViewTmpHPbill", "Popup", "width=1250,height=600");
                }
            }
            else {
                alert("Failed");
            }
        });
    };

    $scope.viewTmpBillindustry = function (v) {
        var vxv = { IndustryID: v.IndustryID, divisionID: v.divisionID, monthID: v.monthID, FinancialYr: v.FinancialYr }
        $window.open("ViewTmpBill?divisionID=" + v.divisionID + "&&IndustryID=" + v.IndustryID + "&&monthID=" + v.monthID + "&&FinancialYr=" + v.FinancialYr + "&&watersource=" + v.watersourceID + "&&purpose=" + v.Purpose_CD, "Popup", "width=1250,height=600");
    };

    $scope.viewHPTmpBillindustry = function (v) {
        var vxv = { IndustryID: v.IndustryID, divisionID: v.divisionID, monthID: v.monthID, FinancialYr: v.FinancialYr }
        $window.open("getHPbillindividual?divisionID=" + v.divisionID + "&&IndustryID=" + v.IndustryID + "&&monthID=" + v.monthID + "&&FinancialYr=" + v.FinancialYr + "&&watersource=" + v.watersourceID + "&&purpose=" + v.Purpose_CD, "Popup", "width=1250,height=600");
    };

    $scope.ViewTmpBllFull = function () {
        //debugger;
        var cv = {};
        $http({
            url: "ViewTmpBllFull",
            method: "get",
            headers: { '__RequestVerificationToken': token },
            data: { objdata: cv }
        }).success(function (data) {
            debugger;
            if (data.PaymentReceived == 0) {
                $scope.currentdemand = data.PaymentReceived;
                $scope.PreviousArrear = 0;
                $scope.interest = 0;
            }
            else {
                $scope.currentdemand = data.PaymentReceived - data.interest - data.PreviousArrear;
                $scope.interest = data.interest;
                $scope.PreviousArrear = data.PreviousArrear;
            }
            //$scope.currentdemand = data.currentdemand,

            debugger;
            $scope.IndustryID = data.IndustryID, $scope.IndustryName = data.IndustryName, $scope.PIN = data.PIN, $scope.divisionID = data.divisionID, $scope.divisionName = data.divisionName, $scope.FinancialYr = data.FinancialYr, $scope.monthID = data.monthID, $scope.monthname = data.monthname, $scope.DamName = data.DamName, $scope.watersourceID = data.watersourceID, $scope.MeterRate = data.MeterRate, $scope.AllocatedMeterReading = data.AllocatedMeterReading, $scope.MeterReadingDifference = data.MeterReadingDifference, $scope.TotAmount = data.TotAmount, $scope.AllTotalAmount = data.AllTotalAmount,
                $scope.PaymentReceived = data.PaymentReceived, $scope.Totalcollection = data.Totalcollection, $scope.CumulativeDemand = data.CumulativeDemand, $scope.NetMeterReading = data.NetMeterReading, $scope.PaymentTowardsPrincipal = data.PaymentTowardsPrincipal, $scope.PaymentTowardsPenalty = data.PaymentTowardsPenalty, $scope.currentinterest = data.currentinterest, $scope.WSourceName = data.SourceName, $scope.PaymentTowardsInterest = data.PaymentTowardsInterest,
                $scope.CommimentCharge = data.CommimentCharge, $scope.penalty = data.penalty, $scope.currentdemand = data.currentdemand; $scope.IndustryNameWithAddress = data.IndustryNameWithAddress;
            $scope.DivShortNm = data.DivShortNm; $scope.CurrentFyear = data.CurrentFyear; $scope.UniqNum = data.File_Num;

            // console.log($scope.UniqNum);
        });
    };

    $scope.removeConsumedmonth = function () {
        $scope.ddlMonthCD = "";
        $scope.Mnthly_WatConsumed = [];
    };
    $scope.Mnthly_WatConsumed = [];
    $scope.WatConsumed_Mnth = function () {
        //if ($scope.ddlYear != null & $scope.ddlMonthCD != null) {
        $http({
            url: 'GetWatConsumed_Mnth',
            method: 'POST',
            headers: { '__RequestVerificationToken': token },
            data: { Month_Code: $scope.ddlMonthCD, Financial_Yr: $scope.ddlYear }
        }).then(function (response) {
            debugger;
            var data = response.data;
            if (data.length > 0) {
                $scope.Mnthly_WatConsumed = data;
            }
            else {
                //alert('No Data Found.');
                $scope.Mnthly_WatConsumed = [];
                //window.location.href = "PhaseAllocation";
            }
        });
        //}
    };
    $scope.AllBilledInd = [];
    $scope.getBilledInds = function () {
        $http({
            url: 'GetAllBilledInd',
            method: 'POST',
            headers: { '__RequestVerificationToken': token },
            params: { Financial_Yr: $scope.ddl_FinancialYr, Month_Code: $scope.ddl_Monthcode }
        }).then(function (response) {
            debugger;
            var data = response.data;
            if (data.length > 0) {
                $scope.AllBilledInd = data;
            }
            else {
                //alert('No Data Found.');
                $scope.AllBilledInd = [];
                //window.location.href = "PhaseAllocation";
            }
        });
    };

    $scope.AllNoBilledInd = [];
    $scope.getNoBilledInds = function () {
        $http({
            url: 'GetAllNoBilledInd',
            method: 'POST',
            headers: { '__RequestVerificationToken': token },
            params: { Financial_Yr: $scope.ddl_FinancialYr, Month_Code: $scope.ddl_Monthcode }
        }).then(function (response) {
            debugger;
            var data = response.data;
            if (data.length > 0) {
                $scope.AllNoBilledInd = data;
            }
            else {
                //alert('No Data Found.');
                $scope.AllNoBilledInd = [];
                //window.location.href = "PhaseAllocation";
            }
        });
    };
    $scope.getPrevMnth = function () {
        debugger;
        var dt = new Date();
        var mnth = $scope.ddl_Monthcode;
        var yr = $scope.ddl_FinancialYr;
        if (!mnth) {
            mnth = dt.getMonth() + 1;
            yr = new Date().getFullYear();
        }
        var monthNames = ',December,January,February,March,April,May,June,July,August,September,October,November'.split(',');
        var indx = monthNames.indexOf(monthNames[mnth]);

        var gdt = dt.getMonth() - 1;
        $scope.prevMnth1 = (GetMonthName(gdt));
        $scope.prevMnth = monthNames[mnth];
        //$scope.getyr = indx === 1 ? parseInt(new Date().getFullYear()) - 1 : parseInt(new Date().getFullYear());
        $scope.getyr = indx === 1 ? parseInt(yr) - 1 : parseInt(yr);

        function GetMonthName(monthNumber) {
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            return months[monthNumber];
        }
    };

    $scope.paidInds = [];
    $scope.NonPaidInds = [];
    $scope.GetAllPaidInds = function () {
        $http({
            url: 'GetPaidInd',
            method: 'POST',
            headers: { '__RequestVerificationToken': token },
            params: { Financial_Yr: $scope.ddlYear, Month_Code: $scope.ddlMonthCD }
        }).then(function (response) {
            debugger;
            var data = response.data;
            if (data.length > 0) {
                $scope.paidInds = data;
                if (!$scope.ddlYear) {
                    $scope.ddlYear = new Date().getFullYear();
                    $scope.ddlMonthCD = new Date().getMonth() + 1;
                }
                var CurrentFyyr = ($filter('filter')($scope.crrfyyr, { fyyrid: $scope.ddlYear }));
                $scope.fyyrname = CurrentFyyr[0].Fyyridname;
                var monthdt = ($filter('filter')($scope.Monthlist, { monthid: $scope.ddlMonthCD }));
                $scope.monthIiD = monthdt[0].Monthname;
            }
            else {
                //alert('No Data Found.');
                $scope.paidInds = [];
                //window.location.href = "PhaseAllocation";
            }
        });
    };

    $scope.GetAllNonPaidInds = function () {
        $http({
            url: 'GetNonPaidInd',
            method: 'POST',
            headers: { '__RequestVerificationToken': token },
            params: { Financial_Yr: $scope.ddlYear, Month_Code: $scope.ddlMonthCD }
        }).then(function (response) {
            debugger;
            var data = response.data;
            if (data.length > 0) {
                $scope.NonPaidInds = data;
                if (!$scope.ddlYear) {
                    $scope.ddlYear = new Date().getFullYear();
                    $scope.ddlMonthCD = new Date().getMonth() + 1;
                }
                var CurrentFyyr = ($filter('filter')($scope.crrfyyr, { fyyrid: $scope.ddlYear }));
                $scope.fyyrname = CurrentFyyr[0].Fyyridname;
                var monthdt = ($filter('filter')($scope.Monthlist, { monthid: $scope.ddlMonthCD }));
                $scope.monthIiD = monthdt[0].Monthname;
            }
            else {
                //alert('No Data Found.');
                $scope.NonPaidInds = [];
                //window.location.href = "PhaseAllocation";
            }
        });
    };

    $scope.GetAcknowledgementData = function (msg, status, err) {
        if (msg) {
            $scope.AcknowledgementMsg = msg;
            $scope.AcknowledgementStatus = status;
        }
        else if (err) {
            $scope.AcknowledgementErr = err;
            $scope.AcknowledgementStatus = status;
        }
        else {
            $scope.AcknowledgementStatus = status;
        }
    };

    $scope.closeBtnAck = function (e) {
        var div = e.target.parentElement;
        div.style.opacity = "0";
        setTimeout(function () { div.style.display = "none"; }, 600);
    };

    $scope.CheckPayStatus = function () {
        var obj = { Amount: $scope.txtAmount, TrsID: $scope.refNo, CaptchText: $scope.txtCaptcha };
        $http({
            url: 'CheckPaymentStatus',
            method: 'POST',
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            data: { objnew: obj }
        }).then(function (response) {
            var rslt = response.data;
            if (rslt && rslt.Output) {
                if (rslt.Output == "1") {
                    alert("Success");
                    $scope.status = rslt.Output;
                    $scope.trs_id = rslt.trs_id;
                    $scope.bankMsg = rslt.bankMsg;
                }
                else if (rslt.Output == "2") {
                    alert("Failed");
                }
                else if (rslt.Output == "21") {
                    alert("Invalid Transaction Id");
                }
                else if (rslt.Output == "22") {
                    alert("Some Error Occured");
                }
                else if (rslt.Output == "3") {
                    alert("Invalid Data");
                }
                else if (rslt.Output == "4") {
                    alert("Invalid Data");
                }
                else if (rslt.Output == "5") {
                    alert("Invalid Code");
                }
                else if (rslt.Output == "6") {
                    alert("Invalid Parameters");
                }
                else if (rslt.Output == "7") {
                    alert("Invalid Captcha");
                }
                else if (rslt.Output == "8") {
                    alert("Invalid Transaction for This User !!!");
                }
                else {
                    alert("Please Try Again");
                }

            }
        })
    };

    $scope.payDemandrpt = function () {
        debugger;
        if ($scope.ddlIndustry) {
            $scope.lstDemand = "";
            $http({
                url: 'getPayDemandRpt',
                method: 'POST',
                datatype: 'json',
                headers: { '__RequestVerificationToken': token },
                data: { Industry_Code: $scope.ddlIndustry }
            }).then(function (response) {
                if (response.data.length > 0) {
                    $scope.lstDemand = response.data;
                }
            })
        }
    };
    $scope.currentDate = new Date();
    $scope.CurrentFinYrFunc = function () {
        debugger;
        var fiscalyear = "";
        var today = new Date();
        var yr = parseInt(today.getFullYear().toString().substr(-2));
        if ((today.getMonth() + 1) <= 3) {
            fiscalyear = (today.getFullYear() - 1) + "-" + yr;
        } else {
            fiscalyear = today.getFullYear() + "-" + (yr + 1);
        }
        return fiscalyear
    }
    $scope.payBrakeupRpt = function () {
        debugger;
        if ($scope.ddlIndustry) {
            $scope.lstBrakeup = "";
            $http({
                url: 'PaymentBrakeup',
                method: 'POST',
                datatype: 'json',
                headers: { '__RequestVerificationToken': token },
                data: { Industry_Code: $scope.ddlIndustry }
            }).then(function (response) {
                if (response.data.length > 0) {
                    $scope.lstBrakeup = response.data;
                }
            })
        }
    };

    $scope.prevPaySubmit = function () {
        //var clkresponce = confirm("Please Re-verify and Submit !!!");
        var obj = {
            Industry_Code: $scope.ddlIndustry, Source_CD: $scope.ddlWaterSource,
            Purpose_CD: $scope.ddlWaterPurpose//, Allocation_Qty: $scope.txtAllocationQty
        }
        if ($scope.chkSecuDepo === true) {
            obj.chkSecuDepo = $scope.chkSecuDepo;
            obj.secuDepRecv = $scope.seqDepRecv;
            obj.secuDepDt = $scope.txtSecudt;
            obj.secuDepMode = $scope.secuPayMode;
            obj.secuDepDtls = $scope.txtPaydtls;
        }
        if ($scope.chkProcesFee === true) {
            obj.chkProcesFee = $scope.chkProcesFee;
            obj.procFeeRecv = $scope.proceFeeRecv;
            obj.procFeeDt = $scope.txtproceFeedt;
            obj.procFeeMode = $scope.proceFeePayMode;
            obj.procFeeDtls = $scope.txtproceFeedtls;
        }

        $http({
            url: 'InsPrevPaymentDtls',
            method: 'POST',
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            data: { objnew: obj }
        }).then(function success(response) {
            var resp = response.data;
            if (resp && resp.status) {
                if (resp.status == "Success") {
                    alert("Submitted Successfully");
                    $scope.ddlIndustry = "";
                    $scope.ddlWaterSource = "";
                    $scope.ddlWaterPurpose = "";
                    $scope.txtAllocationQty = "";
                    $scope.chkSecuDepo = "";
                    $scope.seqDepRecv = "";
                    $scope.txtSecudt = "";
                    $scope.secuPayMode = "";
                    $scope.txtPaydtls = "";
                    $scope.chkProcesFee = "";
                    $scope.proceFeeRecv = "";
                    $scope.txtproceFeedt = "";
                    $scope.proceFeePayMode = "";
                    $scope.txtproceFeedtls = "";
                }
                else if (resp.status == "UnSuccess") {
                    alert("Submit Failed");
                }
                else {
                    alert("Some Error Occured");
                }
            }
        });

    };

    $scope.getPrevPay = function () {
        $http({
            url: 'getPrevPaymentDtls',
            method: 'get',
            datatype: 'json'
        }).then(function (response) {
            $scope.lstPrevPay = response.data;
            angular.forEach($scope.lstPrevPay, function (value, key) {
                value.secuDepDt = FromJSONDate(value.secuDepDt);
                value.procFeeDt = FromJSONDate(value.procFeeDt);
            });
        });
    };

    $scope.EditPrevPay = function (v) {
        const openpayModal = document.getElementById('PayModal');
        function payOpnModal() {
            openpayModal.style.display = "block";
        }
        payOpnModal();
        $scope.txtIndustry = v.IndustryName;
        $scope.txtSource = v.Source_Name;
        $scope.txtPurpose = v.Purpose_Name;
        $scope.Source_CD = v.Source_CD;
        $scope.Purpose_CD = v.Purpose_CD;

        $scope.SlNo = v.SerialNo;
        if (v.secuDepMode != "" && v.secuDepRecv != "") {
            $scope.chkSecuDepo = true;
        }
        if (v.procFeeMode !== "" && v.procFeeRecv !== "") {
            $scope.chkProcesFee = true;
        }

        if ($scope.chkSecuDepo === true) {
            $scope.seqDepRecv = parseFloat(v.secuDepRecv);
            $scope.txtSecudt = v.secuDepDt;
            $scope.secuPayMode = v.secuDepMode;
            $scope.txtPaydtls = v.secuDepDtls;
        }
        if ($scope.chkProcesFee === true) {
            $scope.proceFeeRecv = parseFloat(v.procFeeRecv);
            $scope.txtproceFeedt = v.procFeeDt;
            $scope.proceFeePayMode = v.procFeeMode;
            $scope.txtproceFeedtls = v.procFeeDtls;
        }

    };
    $scope.ClosePayModal = function () {
        const closepayModal = document.getElementById('PayModal');
        function PayCloseModal() {
            closepayModal.style.display = "none";
        }
        PayCloseModal();
    };
    $scope.prevPayUpdate = function () {
        var obj = {
            Industry_Code: $scope.txtIndustry, Source_CD: $scope.Source_CD,
            Purpose_CD: $scope.Purpose_CD, SerialNo: $scope.SlNo
        }
        if ($scope.chkSecuDepo === true) {
            obj.secuDepRecv = $scope.seqDepRecv;
            obj.secuDepDt = $scope.txtSecudt;
            obj.secuDepMode = $scope.secuPayMode;
            obj.secuDepDtls = $scope.txtPaydtls;
        }
        if ($scope.chkProcesFee === true) {
            obj.procFeeRecv = $scope.proceFeeRecv;
            obj.procFeeDt = $scope.txtproceFeedt;
            obj.procFeeMode = $scope.proceFeePayMode;
            obj.procFeeDtls = $scope.txtproceFeedtls;
        }
        $http({
            url: 'UpdatePayDtls',
            method: 'POST',
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            data: { obj: obj }
        }).then(function success(response) {
            var resp = response.data;
            if (resp && resp.status) {
                if (resp.status == "S") {
                    alert("Submitted Successfully");
                    window.location.reload();
                }
                else if (resp.status == "F") {
                    alert("Submit Failed");
                }
                else {
                    alert("Some Error Occured");
                }
            }
        });

    };
    $scope.DeletePrevPay = function (v) {
        var slno = parseInt(v.SerialNo);
        if (slno > 0) {
            $http({
                url: 'DeletePayDtls',
                method: 'POST',
                datatype: 'json',
                headers: { '__RequestVerificationToken': token },
                params: { slno: slno }
            }).then(function success(response) {
                var resp = response.data;
                if (resp && resp.status) {
                    if (resp.status == "S") {
                        alert("Submitted Successfully");
                        window.location.reload();
                    }
                    else if (resp.status == "F") {
                        alert("Submit Failed");
                    }
                    else {
                        alert("Some Error Occured");
                    }
                }
            });
        }
    };

    $scope.SubmitFeed = function () {
        var obj = { q1: $scope.q1, q2: $scope.q2, q3: $scope.q3, q4: $scope.q4, q5: $scope.q5, q6: $scope.q6, q7: $scope.q7, q8: $scope.q8, q9: $scope.fedtxt };

        $http({
            url: 'SaveFeedback',
            method: 'POST',
            datatype: 'json',
            headers: { '__RequestVerificationToken': token },
            data: { objnew: obj }
        }).then(function success(response) {
            debugger;
            var rslt = response.data;
            if (rslt === true) {
                alert("Saved Successfully");
            }
            else {
                alert("Save Failed");
            }
        });
    };
    $scope.ViewFeed = function () {

        $http({
            url: 'GetFeedback',
            method: 'get',
            datatype: 'json',
            headers: { '__RequestVerificationToken': token }
        }).then(function success(response) {
            debugger;
            $scope.lstFeedback = response.data;
        });
    };
    $scope.lst_rpt = [];
    $scope.ViewReport = function () {
        debugger;
        //var divv = $scope.Division;
        var frmdt = $scope.From_DT.split('/');
        var Fromdtdt = new Date(frmdt[1] + '/' + frmdt[0] + '/' + frmdt[2]);
        var todt = $scope.To_DT.split('/');
        var Todtdt = new Date(todt[1] + '/' + todt[0] + '/' + todt[2]);
        if (frmdt != null && frmdt != "" && todt != null && todt != "") {
            debugger;
            if (Fromdtdt >= Todtdt) {
                debugger;
                alert("From Date Can not be greater than To Date.");
                return;
            }

            var objnew = { From_DT: $scope.From_DT, To_DT: $scope.To_DT };
            $http({
                method: 'post',
                url: 'GetReport',
                datatype: 'json',
                headers: { '__RequestVerificationToken': token },
                data: { objnew: objnew }
            })
            .success(function (data) {
                debugger;
                if (data == -1) {
                    alert("From Date Can not be greater than To Date.");
                    return;
                }
                if (data.length > 0) {
                    $scope.lst_rpt = data;
                    $scope.total = 0;

                }
                if (data.length == 0) {
                    $scope.lst_rpt.length = 0;
                    return;
                }

            })
        }
        else {
            $scope.lst_rpt.length = 0;
            alert("Select Date Fields");

        }
    };

    $scope.tableToExcel = (function () {
        var uri = 'data:application/vnd.ms-excel;base64,'
            , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns=""><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>'
            , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
            , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
        return function (table, name) {
            if (!table.nodeType) table = document.getElementById(table)
            var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML }
            window.location.href = uri + base64(format(template, ctx))
        }
    })();

    ///---------- IOT ----------///

    $scope.BindIOTInd = function () {
        $http({
            url: 'getIOT_Ind',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            $scope.lst_Bind_Industry = response.data;
        });
    };

    $scope.getFlowDateWise = function () {
        $http({
            url: 'getIOT_Ind',
            method: "GET",
            datatype: 'json',
            headers: { '__RequestVerificationToken': token }
        }).then(function (response) {
            $scope.lst_Bind_Industry = response.data;
        });
    };

    ///---------- IOT ----------///
});
