var state = {
  NONE: 0,
  INSTRUCTIONS: 1,
  SHAPES: 2,
  PLACEHOLDERS: 3,
};

var flag = 0;

var ctx = {
  w: 800,
  h: 600,

  trials: [],
  participant: "",
  startBlock: 0,
  startTrial: 0,
  cpt: 0,

  participantIndex: "ParticipantID",
  blockIndex: "Block1",
  trialIndex: "Block2",
  differenceTypeIndex: "DT",
  objectsCountIndex: "TD",

  state: state.NONE,
  targetIndex: 0,

  startDate: Date.now(),
  stopDate: Date.now(),
  errCnt: 0,

  loggedTrials: [["DesignName", "ParticipantID", "TrialID", "Block1", "Block2", "DT", "TD", "visualSearchTime", "ErrorCount"]]
};

/****************************************/
/********** LOAD CSV DESIGN FILE ********/
/****************************************/

var loadData = function(svgEl) {
  d3.csv("data.csv").then(function(data) {
    ctx.trials = data;
    var participant = "";
    var options = [];

    for(var i = 0; i < ctx.trials.length; i++) {
      if(!(ctx.trials[i][ctx.participantIndex] === participant)) {
        participant = ctx.trials[i][ctx.participantIndex];
        options.push(participant);
      }
    }

    var select = d3.select("#participantSel")
      .selectAll("option")
      .data(options)
      .enter()
      .append("option")
      .text(function(d) { return d; });

    setParticipant(options[0]);

  }).catch(function(error) { console.log(error); });
};

/****************************************/
/************* RUN EXPERIMENT ***********/
/****************************************/

var startExperiment = function(event) {
  event.preventDefault();
  console.log("ctx.startTrial: "+ctx.startTrial);
  for(var i = 0; i < ctx.trials.length; i++) {
    if(ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if(parseInt(ctx.trials[i][ctx.blockIndex]) == ctx.startBlock) {
        if(parseInt(ctx.trials[i][ctx.trialIndex]) == ctx.startTrial) {
          ctx.cpt = i - 1;
          console.log("start experiment at "+ctx.cpt);
          nextTrial();
          return;
        }
      }
    }
  }
}

// Helper function to check if we've completed all trials for current participant
function isParticipantComplete(currentIndex, trials, participant) {
  for (let i = currentIndex + 1; i < trials.length; i++) {
    if (trials[i][ctx.participantIndex] === participant) {
      return false;
    }
  }
  return true;
}

// Helper function to check if we've completed all trials for current block
function isBlockComplete(currentIndex, trials, participant, block) {
  for (let i = currentIndex + 1; i < trials.length; i++) {
    if (trials[i][ctx.participantIndex] === participant && 
        parseInt(trials[i][ctx.blockIndex]) === block) {
      return false;
    }
  }
  return true;
}

var nextTrial = function() {
  if (ctx.cpt >= ctx.trials.length - 1) {
    alert("Experiment complete!");
    return;
  }

  if (isParticipantComplete(ctx.cpt, ctx.trials, ctx.participant)) {
    alert("All trials completed for Participant " + ctx.participant);
    return;
  }

  if (isBlockComplete(ctx.cpt, ctx.trials, ctx.participant, ctx.startBlock)) {
    alert("All trials completed for Block " + ctx.startBlock);
    return;
  }

  ctx.cpt++;

  if (ctx.trials[ctx.cpt][ctx.participantIndex] !== ctx.participant) {
    alert("All trials completed for Participant " + ctx.participant);
    return;
  }

  if (parseInt(ctx.trials[ctx.cpt][ctx.blockIndex]) !== ctx.startBlock) {
    alert("All trials completed for Block " + ctx.startBlock);
    return;
  }

  displayInstructions();
}

var displayInstructions = function() {
  ctx.state = state.INSTRUCTIONS;
  d3.select("#instructionsCanvas")
    .append("div")
    .attr("id", "instructions")
    .classed("instr", true);

  d3.select("#instructions")
    .append("p")
    .html("Multiple letters 'A' will get displayed.<br> Only <b>one letter</b> is different from all other letters.");

  d3.select("#instructions")
    .append("p")
    .html("1. Spot it as fast as possible and press <code>Space</code> bar;");

  d3.select("#instructions")
    .append("p")
    .html("2. Click on the placeholder over that letter.");

  d3.select("#instructions")
    .append("p")
    .html("Press <code>Enter</code> key when ready to start.");
}

var displayShapes = function() {
  ctx.state = state.SHAPES;

  var differenceType = ctx.trials[ctx.cpt]["DT"];
  var td = ctx.trials[ctx.cpt]["TD"];
  var blockType = ctx.trials[ctx.cpt]["Block1"];
  
  var objectCount = td === "Low" ? 9 : td === "Medium" ? 25 : 49;
  console.log("display shapes for condition " + objectCount + "," + differenceType);

  var svgElement = d3.select("svg");
  var group = svgElement.append("g")
    .attr("id", "shapes")
    .attr("transform", "translate(100,100)");

  var gridCoords = gridCoordinates(objectCount, 60);
  ctx.targetIndex = Math.floor(Math.random() * objectCount);
  
  if (blockType === "1") { // Font type variation
    // [Previous font type code remains unchanged]
    var isUniqueSpecial = Math.random() < 0.5;
    for (var i = 0; i < objectCount; i++) {
      let textElement = group.append("text")
        .attr("x", gridCoords[i].x)
        .attr("y", gridCoords[i].y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", "24px")
        .text("A");

      if (i !== ctx.targetIndex) {
        textElement.attr("font-family", isUniqueSpecial ? "Arial" : "Courier New");
      } else {
        textElement.attr("font-family", isUniqueSpecial ? "Courier New" : "Arial");
      }
    }
  }
  else if (blockType === "2") { // Font weight variation
    // [Previous font weight code remains unchanged]
    var isUniqueSpecial = Math.random() < 0.5;
    for (var i = 0; i < objectCount; i++) {
      let textElement = group.append("text")
        .attr("x", gridCoords[i].x)
        .attr("y", gridCoords[i].y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-family", "Arial")
        .attr("font-size", "24px")
        .text("A");

      if (i !== ctx.targetIndex) {
        textElement.attr("font-weight", isUniqueSpecial ? "normal" : "bold");
      } else {
        textElement.attr("font-weight", isUniqueSpecial ? "bold" : "normal");
      }
    }
  }
  else if (differenceType === "Font_Type_Font_Weight") { // Combined variation
    // Define all possible combinations
    var combinations = [
      { font: "Arial", weight: "normal" },
      { font: "Arial", weight: "bold" },
      { font: "Courier New", weight: "normal" },
      { font: "Courier New", weight: "bold" }
    ];
    
    // Randomly select which combination will be unique (appears once)
    var uniqueComboIndex = Math.floor(Math.random() * combinations.length);
    var uniqueCombo = combinations[uniqueComboIndex];
    
    // Remove the unique combination from the array
    combinations.splice(uniqueComboIndex, 1);
    
    // Create distribution array for non-target positions
    var distribution = [];
    // Add each remaining combination at least twice
    combinations.forEach(combo => {
      distribution.push(combo);
      distribution.push(combo);
    });
    
    // Fill remaining positions (if any) randomly from the three combinations
    while (distribution.length < objectCount - 1) { // -1 because one position is for unique
      distribution.push(combinations[Math.floor(Math.random() * combinations.length)]);
    }
    
    // Shuffle the distribution array
    for (let i = distribution.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [distribution[i], distribution[j]] = [distribution[j], distribution[i]];
    }
    
    // Create all letters
    for (var i = 0; i < objectCount; i++) {
      if (i === ctx.targetIndex) {
        // Create unique letter
        group.append("text")
          .attr("x", gridCoords[i].x)
          .attr("y", gridCoords[i].y)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-family", uniqueCombo.font)
          .attr("font-weight", uniqueCombo.weight)
          .attr("font-size", "24px")
          .text("A");
      } else {
        // Use pre-calculated distribution
        var combo = distribution[i > ctx.targetIndex ? i - 1 : i];
        group.append("text")
          .attr("x", gridCoords[i].x)
          .attr("y", gridCoords[i].y)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-family", combo.font)
          .attr("font-weight", combo.weight)
          .attr("font-size", "24px")
          .text("A");
      }
    }
  }
}

var displayPlaceholders = function() {
  ctx.state = state.PLACEHOLDERS;

  var td = ctx.trials[ctx.cpt]["TD"];
  var objectCount = 0;

  if(td === "Low") {
    objectCount = 9;
  } else if(td === "Medium") {
    objectCount = 25;
  } else if(td === "High") {
    objectCount = 49;
  }

  var svgElement = d3.select("svg");
  var group = svgElement.append("g")
    .attr("id", "placeholders")
    .attr("transform", "translate(100,100)");

  var gridCoords = gridCoordinates(objectCount, 60);
  for (var i = 0; i < objectCount; i++) {
    var placeholder = group.append("rect")
        .attr("id", i)
        .attr("x", gridCoords[i].x-28)
        .attr("y", gridCoords[i].y-28)
        .attr("width", 56)
        .attr("height", 56)
        .attr("fill", "Gray");

    placeholder.on("click",
        function() {
          var selectedX = gridCoords[ctx.targetIndex].x-28;
          var selectedY = gridCoords[ctx.targetIndex].y-28;
          var pointedX = this.getAttribute("x"); 
          var pointedY = this.getAttribute("y");
          
          if (selectedX==pointedX && selectedY==pointedY){
            var timeInterval = (ctx.stopDate - ctx.startDate).toString();

            ctx.loggedTrials.push([
              ctx.trials[ctx.cpt]["DesignName"],
              ctx.trials[ctx.cpt]["ParticipantID"],
              ctx.trials[ctx.cpt]["TrialID"],
              ctx.trials[ctx.cpt]["Block1"],
              ctx.trials[ctx.cpt]["Block2"],
              ctx.trials[ctx.cpt]["DT"],
              ctx.trials[ctx.cpt]["TD"],
              timeInterval,
              ctx.errCnt
            ]);

            ctx.errCnt=0;                   
          } else {
            ctx.cpt--;
            ctx.errCnt++;
          }

          d3.select("#placeholders").remove();
          d3.select("#shapes").remove();

          if (ctx.cpt<(ctx.trials.length-1)){
            nextTrial();
          }
        }
      );
  }
}

var keyListener = function(event) {
  event.preventDefault();

  if(ctx.state == state.INSTRUCTIONS && event.code == "Enter") {
    d3.select("#instructions").remove();
    ctx.startDate = Date.now()
    displayShapes();
  }

  if(ctx.state == state.SHAPES && event.code == "Space") {
    ctx.stopDate = Date.now()
    displayPlaceholders();
  }
}

var downloadLogs = function(event) {
  event.preventDefault();
  var csvContent = "data:text/csv;charset=utf-8,";
  console.log("logged lines count: "+ctx.loggedTrials.length);
  ctx.loggedTrials.forEach(function(rowArray){
   var row = rowArray.join(",");
   csvContent += row + "\r\n";
   console.log(rowArray);
  });
  var encodedUri = encodeURI(csvContent);
  var downloadLink = d3.select("form")
    .append("a")
    .attr("href", encodedUri)
    .attr("download", "logs_"+ctx.trials[ctx.cpt][ctx.participantIndex]+"_"+Date.now()+".csv")
    .text("logs_"+ctx.trials[ctx.cpt][ctx.participantIndex]+"_"+Date.now()+".csv");
}

// Returns array of coordinates for laying out objectCount objects as a grid
function gridCoordinates(objectCount, cellSize) {
  var gridSide = Math.sqrt(objectCount);
  var coords = [];
  for (var i = 0; i < objectCount; i++) {
    coords.push({
      x: i%gridSide * cellSize,
      y: Math.floor(i/gridSide) * cellSize
    });
  }
  return coords;
}

/****************************************/
/******** STARTING PARAMETERS ***********/
/****************************************/

var setTrial = function(trialID) {
  ctx.startTrial = parseInt(trialID);
}

var setBlock = function(blockID) {
  ctx.startBlock = parseInt(blockID);

  var trial = "";
  var options = [];

  for(var i = 0; i < ctx.trials.length; i++) {
    if(ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if(parseInt(ctx.trials[i][ctx.blockIndex]) == ctx.startBlock) {
        if(!(ctx.trials[i][ctx.trialIndex] === trial)) {
          trial = ctx.trials[i][ctx.trialIndex];
          options.push(trial);
        }
      }
    }
  }

  var select = d3.select("#trialSel");
  select.selectAll("option")
    .data(options)
    .enter()
    .append("option")
    .text(function (d) { return d; });

  setTrial(options[0]);
}

var setParticipant = function(participantID) {
  ctx.participant = participantID;

  var block = "";
  var options = [];

  for(var i = 0; i < ctx.trials.length; i++) {
    if(ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if(!(ctx.trials[i][ctx.blockIndex] === block)) {
        block = ctx.trials[i][ctx.blockIndex];
        options.push(block);
      }
    }
  }

  var select = d3.select("#blockSel")
    .selectAll("option")
    .data(options)
    .enter()
    .append("option")
    .text(function (d) { return d; });

  setBlock(options[0]);
};

function onchangeParticipant() {
  selectValue = d3.select("#participantSel").property("value");
  setParticipant(selectValue);
};

function onchangeBlock() {
  selectValue = d3.select("#blockSel").property("value");
  setBlock(selectValue);
};

function onchangeTrial() {
  selectValue = d3.select("#trialSel").property("value");
  setTrial(selectValue);
};

var createScene = function(){
  var svgEl = d3.select("#sceneCanvas").append("svg");
  svgEl.attr("width", ctx.w);
  svgEl.attr("height", ctx.h)
    .classed("centered", true);

  loadData(svgEl);
};