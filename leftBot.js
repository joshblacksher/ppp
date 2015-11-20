
scanDir = 90;
scan(scanDir,10);

function onStatusUpdate()
{
  if(myStatus.scanResult == 0)
  {
    scanDir -= 15;
    scanDir += 360;
    scanDir %= 360;
  }
  
  if(myStatus.scanResult > 100)
  {
    cannon(scanDir,myStatus.scanResult);
    drive(scanDir,50);
  }
  else
  {
    drive(scanDir,0);
  }

  scan(scanDir,10);
}

