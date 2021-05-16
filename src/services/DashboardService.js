const dbService = require('./dbService');

const DashboardService = {
    getDashData:async ()=>{
        console.log('DashboardService---------->getDashData called');
        var DashData = {
            totalUsers:0,
            totalPosts:0,
            totalPendingRewards:0,
            totalClaimedRewards:0
        }
        try{
            const sql = 'select (select count(*) from userdetail) as totalusers,(select count(*) from userposts) as totalposts'+
                ', (select count(*) from reward where status = 0) as totalPendingRewards, (select count(*) from reward where status = 1) as totalClaimedRewards';
            let resp = await dbService.execute(sql);
            if(typeof resp != 'string'){
                if(resp && resp.length>0){
                    let data = resp[0];
                    DashData.totalUsers = data.totalusers;
                    DashData.totalPosts = data.totalposts;
                    DashData.totalPendingRewards = data.totalpendingrewards;
                    DashData.totalClaimedRewards = data.totalclaimedrewards;
                }
            }
        }catch{
            console.log(e);
        }
        return DashData;
    }
}

module.exports = DashboardService;