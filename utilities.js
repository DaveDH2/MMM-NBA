var axios = require('axios');
var _ = require('lodash');
var moment = require('moment');

var utilities = module.exports = {

  checkResponseStatus: function(res) {
    if (res.status !== 200) {
      throw new Error(res);
    } else {
      return res;
    }
  },

  massageResponseData: function(data) {
      return data.data.lscd;
  },

  filteredTeamCurrentRecord: function(payload, teamId) {
    var lastGameObject = _.last(payload)

    if (teamId === lastGameObject.v.tid) {
      return lastGameObject.v.re
    } else {
      return lastGameObject.h.re
    }
  },

  filteredTeamNextGamesFromCurrentDate: function(schedule, date) {
    var scheduleFromCurrentDate = [];
    for (var i = 0; i < schedule.length; i++) {
      if (moment(date).isSameOrBefore(schedule[i].gdte)) {
        scheduleFromCurrentDate.push(schedule[i])
      }
    }
    return scheduleFromCurrentDate;
  },

  getHead: function(arr) {
    var test = []
    _.filter(arr, function(x) {
      if (x === 1) {
        test.push('yes')
      }
    })
    return test;
  },

  filterForTeamSchedule: function(schedule, teamId) {
    var teamSchedule = [];

    _.filter(schedule, function(payloadSch) {
      if (payloadSch.v.tid === teamId || payloadSch.h.tid === teamId) {
        teamSchedule.push(payloadSch)
      }
    });

    return teamSchedule;
  },

  getCurrentSchedule: function(data) {
    var schedule = []
    for (var mscdObj = 0; mscdObj < data.length; mscdObj++) {
      var gameSchedule = data[mscdObj].mscd.g;
      for (var gameObj = 0; gameObj < gameSchedule.length; gameObj++) {
        schedule.push(gameSchedule[gameObj])
      }
    }
    return schedule;
  },

  getResults: function(results) {
    console.log("READY!", results, results.length)
    return results;
  },

  getDataFromApi: function(url) {
    return axios.get(url)
    .then(utilities.checkResponseStatus)
    .then(utilities.massageResponseData)
    .then(utilities.getCurrentSchedule)
    .catch(function(error) {
      if (error.response) {
        console.log(error.response.data)
        console.log(error.response.status)
      } else {
        console.log("Error with getData", error.message)
      }
    });
  },

  getFilteredTeamSchedule: function(payload, teamId) {
      return utilities.filterForTeamSchedule(payload, teamId)
  },

  teamSchedule: function(url, teamId) {
    var getScheduleFromApi = utilities.getDataFromApi(url);
    return getScheduleFromApi.then(function(payload) {
      return utilities.getFilteredTeamSchedule(payload, teamId)
    });
  },

  currentScheduleFromDate: function(payload) {
      var now = moment().format('YYYY MM DD');
      var date = now.replace(/\s+/g, '-');
      return utilities.filteredTeamNextGamesFromCurrentDate(payload, date)
  }
};
