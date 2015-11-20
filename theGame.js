//
// VARS
//
var theGame;
var theField;
var theLeftBotStatus;
var theRightBotStatus;
var leftBlob;
var leftWorker;
var rightBlob;
var rightWorker;
var botFunctions;
var theScanData = {range:-1, leftDirection:-1, rightDirection:-1};
var theLeftShotStatus;
var theRightShotStatus;



//
// GAME FUNCTIONS
//
theGameInit = function()
{
  //
  // setup the game
  //
  theGame = {time:0, tick:100, boardX:500, boardY:500, state:0};
  // state: 0 not started, 1 running, 2 paused, 3 complete

  //
  // setup the field
  //
  myCanvas.width = theGame.boardX;
  myCanvas.height = theGame.boardY;
  theField = document.getElementById("myCanvas").getContext("2d");
  theField.font = "20px Arial";
  theField.fillStyle = "purple";
  theField.fillText("Save your bot changes before reloading page",10,25);
};


theGameLoop = function()
{
  // display game time
  theGame.time++;
  document.getElementById("gameStatus").innerHTML = "Turn: "+theGame.time
  ;

  // accelerate bots
  accelerateBot(theLeftBotStatus);
  accelerateBot(theRightBotStatus);

  // move bots
  moveBot(theLeftBotStatus);
  moveBot(theRightBotStatus);
  collideBots(theLeftBotStatus,theRightBotStatus);

  // move shots
  moveShot(theLeftShotStatus);
  moveShot(theRightShotStatus);

  // scan data
  scanDataRefresh();

  // draw field
  theField.clearRect(0, 0, theGame.boardX, theGame.boardY);
  theField.font = "20px Arial";
  theField.textAlign = "center";
  theField.textBaseline = "middle";
  // bots
  theField.fillStyle = "red";
  theField.fillText("L",theLeftBotStatus.locX,theLeftBotStatus.locY);
  theField.fillStyle = "blue";
  theField.fillText("R",theRightBotStatus.locX,theRightBotStatus.locY);
  // shots
  theField.fillStyle = "red";
  theField.fillText("*",theLeftShotStatus.locX,theLeftShotStatus.locY);
  theField.fillStyle = "blue";
  theField.fillText("*",theRightShotStatus.locX,theRightShotStatus.locY);
  // explodes
  if(theLeftShotStatus.range == 0)
  {
    theField.fillStyle = "red";
    theField.fillText("-#-",theLeftShotStatus.locX,theLeftShotStatus.locY);
    theField.fillText("\\|/",theLeftShotStatus.locX,theLeftShotStatus.locY-10);
    theField.fillText("/|\\",theLeftShotStatus.locX,theLeftShotStatus.locY+10);
  }
  if(theRightShotStatus.range == 0)
  {
    theField.fillStyle = "blue";
    theField.fillText("-#-",theRightShotStatus.locX,theRightShotStatus.locY);
    theField.fillText("\\|/",theRightShotStatus.locX,theRightShotStatus.locY-10);
    theField.fillText("/|\\",theRightShotStatus.locX,theRightShotStatus.locY+10);
  }
  
  // explode shots
  explodeShot(theLeftShotStatus);
  explodeShot(theRightShotStatus);

  // diplay bot status left
  document.getElementById("leftStatus").innerHTML =
  "locX: "+Math.round(theLeftBotStatus.locX)+"<br>"+
  "locY: "+Math.round(theLeftBotStatus.locY)+"<br>"+
  "speed: "+theLeftBotStatus.speed+"<br>"+
  "direction: "+theLeftBotStatus.direction+"<br>"+
  "damage: "+theLeftBotStatus.damage;
  // diplay bot status right
  document.getElementById("rightStatus").innerHTML =
  "locX: "+Math.round(theRightBotStatus.locX)+"<br>"+
  "locY: "+Math.round(theRightBotStatus.locY)+"<br>"+
  "speed: "+theRightBotStatus.speed+"<br>"+
  "direction: "+theRightBotStatus.direction+"<br>"+
  "damage: "+theRightBotStatus.damage;

  // send the bot threads status
  leftWorker.postMessage(theLeftBotStatus);
  rightWorker.postMessage(theRightBotStatus);

  //check for end game, close it all down
  if( (theLeftBotStatus.damage >= 100) || (theRightBotStatus.damage >= 100) )
  {
    theGame.state = 3;
  }

  //pause repeat
  if(theGame.state == 1) setTimeout(theGameLoop, theGame.tick);
};


function scanDataRefresh()
{
  var leftX = theLeftBotStatus.locX;
  var leftY = theLeftBotStatus.locY;
  var rightX = theRightBotStatus.locX;
  var rightY = theRightBotStatus.locY;
  var dx = leftX - rightX;
  var dy = leftY - rightY;
  
  var r = Math.sqrt( (dx*dx) + (dy*dy) );
  var d1 = Math.atan2(dx,dy) * (180/Math.PI);
  d1 += 360+90;
  d1 %= 360;
  d1 = 360-d1;
  var d2 = (d1 + 180)%360;

  theScanData.range = r;
  theScanData.leftDirection = d1;
  theScanData.rightDirection = d2;
}


function randomBetween(a,b)
{
  var r = Math.random();
  r = r * (b-a);
  r = r + a;
  return Math.round(r);
}


//
// BOT FUNCTIONS
//
function leftHandler(event)
{
  botHandler(theLeftBotStatus,event);
}

function rightHandler(event)
{
  botHandler(theRightBotStatus,event);
}


function botHandler(bot,event)
{
  var m = event.data;
  var l;
  switch(m.function)
  {
//    case "log": // message
//      l = bot.name+"Log";
//      document.getElementById(l).value =
//      document.getElementById(l).value + m.p1;
//      break;
    
    case "cannon": // direction, range
      var directionT = Math.round(m.p1);
        directionT %= 360;
        if(directionT < 0) directionT += 360;
      var rangeT = Math.round(m.p2);
        if(rangeT > 300) rangeT=300;
        if(rangeT < 0) rangeT=0;
      if(bot.name == "left") { fireBot(theLeftBotStatus,theLeftShotStatus,directionT,rangeT);}
      if(bot.name == "right") { fireBot(theRightBotStatus,theRightShotStatus,directionT,rangeT);}
      break;
    
    case "scan": // direction, resolution
      var directionT = Math.round(m.p1);
        directionT %= 360;
        if(directionT < 0) directionT += 360;
      var resolutionT = Math.round(m.p2);
        if(resolutionT > 10) resolutionT=10;
        if(resolutionT < 0) resolutionT=0;
      var scanHigh = directionT+resolutionT;
      var scanLow = directionT-resolutionT;
      var directionActual = Math.round(theScanData[bot.name+"Direction"]);
      if( (directionActual >= scanLow) && (directionActual <= scanHigh) )
        {
          bot.scanResult = Math.round(theScanData.range);
        }
      else
        {
          bot.scanResult = 0;
        }
      break;
    
    case "drive": // direction, speed
      var directionT = Math.round(m.p1);
        directionT %= 360;
        if(directionT < 0) directionT += 360;
      var speedT = Math.round(m.p2);
        if(speedT > 100) speedT=100;
        if(speedT < 0) speedT=0;
      var directionC = bot.direction;
      var speedC = bot.speed;
      if(speedC <= 50)
      {
        bot.direction = directionT;
        bot.speedTarget = speedT;
      }
      else
      {
        bot.speedTarget = speedT;
      }
      break;
    
    default:
      console.warning("bad function name");
  }
}


function accelerateBot(bot)
{
  var step = Math.min( 5, Math.abs(bot.speedTarget - bot.speed));
  if(bot.speed < bot.speedTarget) { bot.speed+=step; }
  else if (bot.speed > bot.speedTarget) { bot.speed-=step; }
}


function moveBot(bot)
{
  if(bot.speed <= 0) return;
  var d = bot.direction;
  var s = bot.speed / 10;
  var stepX = Math.cos( (d%360) * (Math.PI/180) ) * s;
  var stepY = Math.sin( (d%360) * (Math.PI/180) ) * s;
  bot.locX += stepX;
  bot.locY += stepY;
  
  if(bot.locX > theGame.boardX)
    {
      bot.damage += 2;
      bot.speed = 0;
      bot.speedTarget = 0;
      bot.locX = theGame.boardX-1;
    }
    
  if(bot.locX < 1)
    {
      bot.damage += 2;
      bot.speed = 0;
      bot.speedTarget = 0;
      bot.locX = 2;
    }
    
  if(bot.locY > theGame.boardY)
      {
      bot.damage += 2;
      bot.speed = 0;
      bot.speedTarget = 0;
      bot.locY = theGame.boardY-1;
    }
    
  if(bot.locY < 1)
      {
      bot.damage += 2;
      bot.speed = 0;
      bot.speedTarget = 0;
      bot.locY = 2;
    }
}


function moveShot(shot)
{
  if(shot.locX == -1) return;
  var d = shot.direction;
  var r = shot.range;
  r = Math.min(20,r);
  var stepX = Math.cos( (d%360) * (Math.PI/180) ) * r;
  var stepY = Math.sin( (d%360) * (Math.PI/180) ) * r;
  shot.locX += stepX;
  shot.locY += stepY;
  shot.range -= r;
  
  if(shot.locX > theGame.boardX)
    {
      shot.locX = theGame.boardX-1;
      shot.range = 0;
    }
    
  if(shot.locX < 1)
    {
      shot.locX = 1;
      shot.range = 0;
    }
    
  if(shot.locY > theGame.boardY)
    {
      shot.locY = theGame.boardY-1;
      shot.range = 0;
    }
    
  if(shot.locY < 1)
    {
      shot.locY = 1;
      shot.range = 0;
    }
    
  if(shot.range <= 2)
    {
      shot.range = 0;
    }
}


function explodeShot(shot)
{
  if(shot.range != 0) return;
  //deal damage to bots
  damageBot(shot,theLeftBotStatus);
  damageBot(shot,theRightBotStatus);

  //reset shot
  shot.locX = -1;
  shot.locY = -1;
  shot.direction = -1;
  shot.range = -1;
  
}


function damageBot(shot,bot)
{
  var dx = shot.locX - bot.locX;
  var dy = shot.locY - bot.locY;
  var dist = Math.sqrt( (dx*dx)+(dy*dy) );
  if(dist > 40) return;
//  var dam = Math.round( 20 / ( 1+dist) );
  var dam = Math.round( 20 - dist/2 );
  bot.damage += dam;
//  log(bot.name+" "+dist+" "+dam);
}


function collideBots(bot1,bot2)
{
  var dx = bot1.locX - bot2.locX;
  var dy = bot1.locY - bot2.locY;
  var dist = Math.sqrt( (dx*dx) + (dy*dy) );

  if( (dist <= 15) && (Math.max(bot1.speed, bot2.speed) > 10) )
  {
    bot1.speed=0;
    bot1.speedTarget=0;
    bot1.damage+=2;

    bot2.speed=0;
    bot2.speedTarget=0;
    bot2.damage+=2;
  }
}


function fireBot(bot,shot,direction,range)
{
  if(shot.locX == -1) // ready to fire
  {
    shot.locX = bot.locX;
    shot.locY = bot.locY;
    shot.direction = direction;
    shot.range = range;
    bot.cannonStatus = 0;
  }
  else // not ready to fire
  {
    bot.cannonStatus = 0; // TODO need to set this to 1 somewhere
  }
}



//
// BUTTON HANDLERS
//
startClick = function()
{
  if(theGame.state != 1)
  {
    //
    // setup the bots
    //
    if(leftWorker !== undefined)
    {
      leftWorker.terminate();
      leftWorker = undefined;
    }
    if(rightWorker !== undefined)
    {
      rightWorker.terminate();
      rightWorker = undefined;
    }

    theLeftBotStatus = {name:"left", locX:randomBetween(10,200), locY:randomBetween(10,490), speed:0, direction:0, damage:0, speedTarget:0, scanResult:-1, cannonStatus:-1 };
    leftBlob = new Blob([botFunctions + document.getElementById("leftCode").value]);
    leftWorker = new Worker(window.URL.createObjectURL(leftBlob));
    leftWorker.onmessage = leftHandler;

    theRightBotStatus = {name:"right", locX:randomBetween(300,490), locY:randomBetween(10,490), speed:0, direction:0, damage:0, speedTarget:0, scanResult:-1, cannonStatus:-1 };
    rightBlob = new Blob([botFunctions + document.getElementById("rightCode").value]);
    rightWorker = new Worker(window.URL.createObjectURL(rightBlob));
    rightWorker.onmessage = rightHandler;

    rightWorker.postMessage(theRightBotStatus);
    leftWorker.postMessage(theLeftBotStatus);
    
    theLeftShotStatus = {locX:-1, locY:-1, direction:-1, range:-1};
    theRightShotStatus = {locX:-1, locY:-1, direction:-1, range:-1};

    //
    // set or reset the game
    //
    theGame.tick = document.getElementsByName("tickTime")[0].value;
    theGame.time = 0;
    theGame.state = 1;
    theGameLoop();
  }
};


pauseClick = function()
{
  if(theGame.state === 1)
  {
    theGame.state = 2;
  }
};


continueClick = function()
{
  if(theGame.state === 2)
  {
    theGame.tick = document.getElementsByName("tickTime")[0].value;
    theGame.state = 1;
    theGameLoop();
  }
};


function killClick()
{
  theGame.state = 0;
  leftWorker.terminate();
  leftWorker = undefined;
  rightWorker.terminate();
  rightWorker = undefined;
}



//
// LOAD CALLS
//
$("#leftCode").load("leftBot.js");
$("#rightCode").load("rightBot.js");
$.get("botFunctions.js", function(response) {botFunctions = response;});
theGameInit();
