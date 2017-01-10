var axios = require('axios');
var moment = require('moment');
var _ = require('lodash');
var NodeHelper = require('node_helper');

module.exports = NodeHelper.create({});

function getNBASchedule() {
  return axios.get('http://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2016/league/00_full_schedule.json')
    .then(function(data){
      return data.data.lscd;
    });
}

var now = moment().format('YYYY MM DD');
var currentMonth = moment().format('MMMM');

function filterByMonth(month, data) {
  for (var i = 0; i <= data.length; i++) {
    if (data[i].mscd.mon === month){
      currentScheduleMonth = data.slice(i,data.length);
      return currentScheduleMonth;
    }
  }
}

var getData = function() {
  return getNBASchedule().then(function(payload) {
      return filterByMonth(currentMonth, payload);
  }).then(function(result) {
      return result
  });
}

var getMonthlySchedule = function(data, month){

  var dataSet = [];

  for (var k = 0; k < data.length; k++) {
     if (data[k].mscd.mon === month) {
       var currentMonthlySchedule = data[k].mscd.g;
       for (var i = 0; i < currentMonthlySchedule.length; i++) {
          if (currentMonthlySchedule[i].v.tid === 1610612744 || currentMonthlySchedule[i].h.tid === 1610612744) {
           dataSet.push(currentMonthlySchedule[i]);
          }
       }
     }
  }

  return dataSet;
};

var getSchedule = function(month) {
  return getData().then(function(payload) {
    return getMonthlySchedule(payload, month)
  })
};

var monthlyScheduleResults = function() {
  return getSchedule(currentMonth).then(function(r) {
    console.log("result of monthlyResults", r, r.length)
    return r
  });
};

monthlyScheduleResults();
