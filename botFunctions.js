var myStatus = {name:"none", locX:-1, locY:-1, speed:-1, direction:-1, damage:-1, speedTarget:-1, scanResult:-1, cannonStatus:-1 };

onmessage = function(e){
  myStatus = e.data;
  onStatusUpdate();
};

function onStatusUpdate(){}

function log(message){
//  postMessage({function:"log", p1:message});
  console.log(myStatus.name+": "+message);
}

function drive(direction, speed){
  postMessage({function:"drive", p1:direction, p2:speed});
}

function cannon(direction, range){
  postMessage({function:"cannon", p1:direction, p2:range});
}

function scan(direction, resolution){
  postMessage({function:"scan", p1:direction, p2:resolution});
}

