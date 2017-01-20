Module.register("MMM-NBA", {

  modes: {
    "01": "Regular-Season"
  },

  details: {
    y: (new Date()).getFullYear(),
    t: "01"
  },

  states: {
    "1st": "1ST_PERIOD",
    "2nd": "2ND_PERIOD",
    "3rd": "3RD_PERIOD",
    "OT": "OVER_TIME",
    "2OT": "DOUBLE_OVER_TIME",
    "FINAL": "FINAL",
    "FINAL_OT": "FINAL_OVERTIME",
    "FINAL_2OT": "FINAL_DOUBLE_OVERTIME"
  },

  rotateIndex:0,
  rotateInterval: null,

  defaults: {
    colored: false,
    matches: 6,
    format: "ddd h:mm",
    reloadInterval: 30 * 60 * 1000
  },

  getScripts: function() {
    return ["moment.js"];
  },

  getStyles: function() {
    return ["font-awesome.css"];
  },

  start: function() {
    Log.info("Starting module: " + this.name);
    this.sendSocketNotification("CONFIG", {config: this.config }); //teams: this.teams
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "SCORE") {
      this.scores = payload.scores;
      console.log("this.scores" + this.scores)
      this.updateDom(300);
    }
  },

  getDom: function() {
    var wrapper = document.createElement("div");
    var scores = document.createElement("div");
    var header = document.createElement("header");
    header.innerHTML = "NBA " + this.mode[this.details.t] + " " + this.details.y;
    scores.appendChild(header);

    console.log("yooyoyoyoyyoyoy", this.scores)


    if (!this.scores) {
      var text = document.createElement("div");
      text.innerHTML = "LOADING";
      text.classList.add("dimmed", "light");
      scores.appendChild(text)
    }
    //else {
    //   var table = document.createElement("table");
    //   table.classList.add("small", "table");
    //
    //   table.appendChild(this.createLableRow());
    //
    //   var max = 6;
    //
    //   for (var i = 0; i < max; i++) {
    //     this.appendDataRow(this.scores[i], table);
    //   }
    //
    //   scores.appendChild(table);
    // }
    //
    wrapper.appendChild(scores);
    //
    return wrapper;
  },

  createLableRow: function() {
    var lableRow = document.createElement("tr");

    var dataLabel = document.createElement("th");
    var dataIcon = document.createElement("i");
    dataIcon.classList.add("fa", "fa-calendar");
    dataLabel.appendChild(dateIcon);
    lableRow.appendChild(dataLabel);

    var homeLabel = document.createElement("th");
    homeLabel.innerHTML = "HOME";
    homeLabel.setAttribute("colspan", 3);
    labelRow.appendChild(homeLabel);

    var vsLabel = document.createElement("th");
    vsLabel.innerHTML = "";
    labelRow.appendChild(vsLabel);

    var awayLabel = document.createElement("th");
    awayLabel.innerHTML = "AWAY";
    awayLabel.setAttribute("colspan", 3);
    labelRow.appendChild(awayLabel);

    return labelRow;
  }

});
