var axios = require('axios');
var moment = require('moment');
var _ = require('lodash');
var NodeHelper = require('node_helper');

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

    var now = moment().format('YYYY MM DD');
    var date = now.replace(/\s+/g, '-');

    function filteredTeamCurrentRecord(payload, teamId) {
      var lastGameObject = _.last(payload)

      if (teamId === lastGameObject.v.tid) {
        return lastGameObject.v.re
      } else {
        return lastGameObject.h.re
      }
    }

    function filteredTeamNextGamesFromCurrentDate(schedule, date) {
      var scheduleFromCurrentDate = [];
      for (var i = 0; i < schedule.length; i++) {
        if (moment(date).isSameOrBefore(schedule[i].gdte)) {
          scheduleFromCurrentDate.push(schedule[i])
        }
      }

      return scheduleFromCurrentDate;
    }

    function getCurrentSchedule(data) {
      var schedule = []
      for (var mscdObj = 0; mscdObj < data.length; mscdObj++) {
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
        if (fSch.v.tid === teamId || fSch.h.tid === teamId) {
              teamSchedule.push(fSch)
        }
      });

      return teamSchedule;
    }

    function getResults(result) {
      return result;
    }


    var getData = function(url) {
      return axios.get(url)
      .then(checkResponseStatus)
      .then(massageResponseData)
      .then(getCurrentSchedule)
      .catch(function(error) {
        if (error.response) {
          console.log(error.response.data)
          console.log(error.response.status)
        } else {
          console.log("Error with getData", error.message)
        }
      });
    }

    var getFilteredTeamSchedule = function(teamId) {
      var getScheduleFromApi = getData('http://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2016/league/00_full_schedule.json');
      return getScheduleFromApi.then(function(payload) {
        return filterForTeamSchedule(payload, teamId)
      })
    };

    var filteredTeamSchedule = getFilteredTeamSchedule(1610612744).then(getResults);

    var currentTeamRecord = filteredTeamSchedule.then(function(res){
      return filteredTeamCurrentRecord(res, 1610612744)
    });

    var currentScheduleFromDate = filteredTeamSchedule.then(function(res) {
      var now = moment().format('YYYY MM DD');
      var date = now.replace(/\s+/g, '-');
      return filteredTeamNextGamesFromCurrentDate(res, date)
    });

    var nextSixGames = currentScheduleFromDate.then(function(teamScheduleFromTodayDate) {
      return teamScheduleFromTodayDate.splice(0,6)
    });

    nextSixGames.then(function(res) {
      console.log(res)
    })
  }
});
