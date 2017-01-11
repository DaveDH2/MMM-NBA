var axios = require('axios');
var moment = require('moment');
var _ = require('lodash');
var NodeHelper = require('node_helper');

function getNBASchedule() {
  return axios.get('http://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2016/league/00_full_schedule.json')
    .then(function(data){
      return data.data.lscd;
    });
}

function filterByMonth(month, data) {
  for (var i = 0; i <= data.length; i++) {
    if (data[i].mscd.mon === month){
      currentScheduleMonth = data.slice(i,data.length);
      return currentScheduleMonth;
    }
  }
}

var getDataFromNBA = function() {
  return getNBASchedule().then(function(payload) {
      var currentMonth = moment().format('MMMM');
      return filterByMonth(currentMonth, payload);
  }).then(function(result) {
      return result
  });
}

var getMonthlySchedule = function(data, month, teamId){

  var dataSet = [];

  for (var k = 0; k < data.length; k++) {
     if (data[k].mscd.mon === month) {
       var currentMonthlySchedule = data[k].mscd.g;
       for (var i = 0; i < currentMonthlySchedule.length; i++) {
          if (currentMonthlySchedule[i].v.tid === teamId || currentMonthlySchedule[i].h.tid === teamId) {
           dataSet.push(currentMonthlySchedule[i]);
          }
       }
     }
  }

  return dataSet;
};

var getTeamSchedule = function(teamId) {
  return getDataFromNBA().then(function(payload) {
    return getMonthlySchedule(payload, month, teamId)
  })
};

var monthlyScheduleResults = function(teamId) {
  return getTeamSchedule(teamId).then(function(r) {
    console.log("result of monthlyResults", r, r.length)
    return r
  });
};

monthlyScheduleResults(1610612744);

module.exports = NodeHelper.create({

  url: "http://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2016/league/00_full_schedule.json",
  scores: [],
  details: {},
  nextMatch: null,
  live: {
    state: false,
    matches: []
  },

  start: function() {
    console.log("Starting Module: " + this.name);
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "CONFIG") {
      this.config = payload.config;
      //this.teams = payload.teams;
      this.getData();
      setInterval(() => {
        this.getData();
      }, this.config.reloadInterval);
      setInterval(() => {
        this.fetchOnLiveState();
      }, 60*1000);
    }
  },

  fetchOnLiveState: function() {
    if (this.live.state === true) {
      this.getData();
    }
  },

  getData: function() {
    var axios = require('axios');
    var _ = require('lodash');

    function checkResponseStatus(res) {
      if (res.status !== 200) {
        throw new Error(res);
      } else {
        return res;
      }
    }

    function massageResponseData(data) {
      return data.data.lscd;
    }

    function getCurrentMonth() {

    }

    function getTeamsCurrentRecord() {

    }

    function getCurrentSchedule(data) {
      var schedule = []
      for (var mscdObj = 0; mscdObj < data.length; mscdObj++) {
          //schedule.push(data[mscdObj].mscd.g)
        var gameSchedule = data[mscdObj].mscd.g;
        for (var gameObj = 0; gameObj < gameSchedule.length; gameObj++) {
          schedule.push(gameSchedule[gameObj])
        }
      }
      return schedule;
    }

    function filterForTeamSchedule(schedule, teamId) {
      var teamSchedule = [];

      _.filter(schedule, function(fSch) {
        teamSchedule.push(fSch.v.tid === teamId || fSch.h.tid === teamId)
      })

      return teamSchedule;
    }

    function getTeamSchedule(result) {
      console.log(result)
      return result;
    }


    var getData = function(url, teamId) {
      return axios.get(url)
      .then(checkResponseStatus)
      .then(massageResponseData)
      .then(getCurrentSchedule)
      .then(getTeamSchedule)
      .catch(function(error) {
        if (error.response) {
          console.log(error.response.data)
          console.log(error.response.status)
        } else {
          console.log("Error with getData", error.message)
        }
      });
    }

    getData('http://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2016/league/00_full_schedule.json', 1610612744);
});
