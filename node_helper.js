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
    var utils = require('./utilities.js')
    var _ = require('lodash');
    var moment = require('moment');

    var teamID = 1610612744;
    var URL = "http://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2016/league/00_full_schedule.json"

    var getData = function(url, teamId) {
      return utils.teamSchedule(url, teamId);
    }

    var object = {
      'schedule': [],
      'record': {
        'tRecord': null,
        'oRecord': null
      },
      'nextMatch': null,
      'live': {
        'state': false,
        'gameTime': null
      }
    }

    getData(URL, teamID).then(function(data) {
      var nextScheduledGames = utils.currentScheduleFromDate(data).splice(0,6);
      var firstGame = _.head(nextScheduledGames);

      var now = moment().format('LLLL');
      var gameTimeVar = firstGame.etm
      var gameTime = moment(gameTimeVar).format('LLLL')


      object.schedule = nextScheduledGames;
      object.live.gameTime = firstGame.etm;

      if (1610612744 === firstGame.h.tid) {
        object.record.tRecord = firstGame.h.re;
        object.record.oRecord = firstGame.v.re;

      } else {
        object.record.tRecord = firstGame.v.re;
        object.record.oRecord = firstGame.h.re;
      }

      if (object.live.state !== true) {
        if (_.nth(nextScheduledGames, 0).v.tid !== 1610612744) {
          object.nextMatch = _.nth(nextScheduledGames, 0).v.tn
        } else {
          object.nextMatch = _.nth(nextScheduledGames, 0).h.tn
        }
      }

      if (moment(gameTime).isSame(now)) {
        object.live.state = true;
      }

    });
  }
});
