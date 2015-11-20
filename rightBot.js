
var s=0;

function onStatusUpdate()
{
  var d = 0;
  var r=50;
  
  if(myStatus.locX > 400) d=270;
  if(myStatus.locX < 100) d=90;
  if(myStatus.locY > 400 && myStatus.locX <= 400) d=0;
  if(myStatus.locY < 100 && myStatus.locX >= 100) d=180;
  if(myStatus.direction == d) r=100;
  drive(d,r);

  if(myStatus.scanResult < 1)
  {
    s+=355;
    s%=360;
  }
  else // scanResult >= 1
  {
    cannon(s,myStatus.scanResult);
  }
  scan(s,5);
  
}
