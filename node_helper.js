var axios = require('axios');
var moment = require('moment');
var _ = require('lodash');
var utils = require('./utilities.js')
var NodeHelper = require('node_helper');



module.exports = NodeHelper.create({

  url: "http://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2016/league/00_full_schedule.json",
  teamID: 1610612744,
  score: {
    tScore: null,
    oScore: null
  },
  details: {},
  schedule : [],
  record : {
    tRecord : null,
    oRecord : null
  },
  nextMatch : null,
  live: {
    state: false,
    gameTime : null
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

    utils.getData(this.url, this.teamID).then(function(data) {
      var nextScheduledGames = utils.currentScheduleFromDate(data).splice(0,6);
      var firstGame = _.head(nextScheduledGames);

      var now = moment().format('LLLL');
      var gameTimeVar = firstGame.etm;
      var gameTime = moment(gameTimeVar).format('LLLL')


      this.schedule = nextScheduledGames;
      this.live.gameTime = firstGame.etm;

      if (this.teamID === firstGame.h.tid) {
        this.record.tRecord = firstGame.h.re;
        this.score.tScore = firstGame.h.s
        this.record.oRecord = firstGame.v.re;
        this.score.oScore = firstGame.v.s

      } else {
        this.record.tRecord = firstGame.v.re;
        this.score.tScore = firstGame.v.s
        this.record.oRecord = firstGame.h.re;
        this.score.oScore = firstGame.h.s
      }

      if (this.live.state !== true) {
        if (_.nth(nextScheduledGames, 0).v.tid !== this.teamID) {
          this.nextMatch = _.nth(nextScheduledGames, 0).v.tn
        } else {
          this.nextMatch = _.nth(nextScheduledGames, 0).h.tn
        }
      }

      if (moment(gameTime).isSame(now)) {
        this.live.state = true;
      }

      this.sendSocketNotification("SCORES", {tScore: this.scores.tScore, oScore: this.scores.oScore});

      return;
    });

  }
});
