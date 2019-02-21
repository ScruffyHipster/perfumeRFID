///////////////Classs Tag manager////////////////////
function TagManager() {

  var tagData = [];

  this.storeTag = function(data) {
    tagData.push(data);
  };

  this.clearData = function() {
    tagData = [];
  }

  this.removeTagData = function(uid) {
    if(tagData.length > 0) {
      for(var i = 0; i < tagData.length; i++) {
        if(tagData[i] == uid) {
          var array = tagData.splice(i, 1);
          tagData = array;
        }
      }
    }
  }

  this.checkTagData = function() {
    printOut("Checking tag data");
    for(var i = 0; i < tagData.length; i++) {
      var info = tagData[i];
      printOut("from the array " + info);
      for(var b = 0; b < productsArray.length; b++) {
        var product = productsArray[b];
        var id = product.getProductId();
        printOut("The id is " + id);
        if(info == id) {
          printOut("Got the id " + id + " for product " + product.getProductName());
          printOut("Going to the sign for this product");
          var sign = product.getSignName();
          switch(sign) {
            case "perfume1":
              printOut("perfume 1");
              break;
            case "perfume2":
              printOut("perfume 2");
              break;
          }
        }
      }
    }
  }
}
/////////////////////class tag manager////////////////////////

////////////////////class product info////////////////////////
function ProductInformation(productName, productID, signName) {

  this.productId = productID;
  this.productName = productName;
  this.signName = signName;
  this.timesInteracted = 0;

  this.getProductId = function() {
    return this.productId;
  }

  this.getProductName = function() {
    return this.productName;
  }

  this.getSignName = function() {
    return this.signName;
  }

  this.increaseInteraction = function() {
    this.timesInteracted ++;
  }

  this.showAmountInteracted = function() {
    return this.timesInteracted;
  }
}

///////////////////class product manager///////////////////////


const manager = new TagManager();
const perfume1 = new ProductInformation("Perfume1", "04D92C2A", "perfume1");
const perfume2 = new ProductInformation("Perfume2", "04E12C2A", "perfume2");

var vendor = '1B4F';
var product = '9204';

var deviceArray = [];
var tagData = [];
var productsArray = [perfume1, perfume2];


getDeviceInfoFor(vendor, product);

for(var device = 0; device < deviceArray.length; device++) {
  printOut("iterating over devices");
  SignStixSerial.requestPermission(deviceArray[device].devicePath, "onPermissionGranted");
}

//1 shows which device is shown
function myDeviceInfo() {
  var info = SignStixConfig.getDeviceId();
  if (info != null) {
    SignStixDebug.info(info);
  } else {
    SignStixDebug.error("error getting device name");
  }
}


//2 get device info for serial use
function getDeviceInfoFor(vendorId, productId) {
 var devicesInfo = SignStixSerial.getDevicesInfo();
 var devices = JSON.parse(devicesInfo);
 var device;
 var i;
 for (i = 0; i < devices.length; i++) {
   if (devices[i].vendorId == vendorId && devices[i].productId == productId) {
        deviceArray.push(devices[i]);
   } else {
     SignStixDebug.error("Error gaining device info", vendorId && productId);
   }
 }
  return null;
}

//3 get permission
function onPermissionGranted(devicePath, success) {
  SignStixDebug.info("we got permission granted ");
  var driverName = "usb";
  var baudRate = 9600;
  var stopBits = 1;
  var dataBits = 8;
  var parity = 0;
  var connectionId = SignStixSerial.connect(devicePath, driverName, baudRate, stopBits, dataBits, parity);
  //starts reading from the serial device

  SignStixSerial.startReading(connectionId, "globalOnDataRead");
  SignStixDebug.info("Now starting to read data");
}

//4 Read from the device and change content on SignStix device
function globalOnDataRead(connectionId, hexData) {
  SignStixDebug.info("Now going to read the data");
  printOut("received hex data " + hexData);
  var layer = SignStixGraphics.getLayerNamed('textLayer');

  layer.setText(hexData);
  SignStixGraphics.updateDisplay();

  var value = dataRead(hexData);

  // var command = value.splice(hexData.length, - 2);
  // var tagUID = value.splice(hexData.length, 8);

  manager.storeTag(hexData);
  printOut(value);
  switch(value) {
    case 50:
    //suggests product has been placed back;
    //check for tag in tag Array
    manager.removeTagData(hexData);
    //remove tag from the array
      break;
    case 42:
    //suggests product picked up;
    manager.checkTagData();
    //check for tag in tag data Array
    //present the product on screen
      break;
  }
}

function dataRead(hex) {
  var bytes = hexToBytes(hex);
  var value;
  for (var i = 0; i < bytes.length; i++) {
    var value = bytes[i];
  }
  return parseFloat(value);
}

function hexToBytes(hex) {
  for (var bytes = [], a = 0; a < hex.length; a += 2)
  bytes.push(parseInt(hex.substr(a, 2), 16));
  return bytes;
}

///////////////////////////////////////////////////////////

function getCurrentSignInfo() {
  var currentSign = SignStixStats.getCurrentSignInfo()
  var currInfo = JSON.parse(currentSign);
  var currentSign = currInfo.signName;
  return currentSign;
}

function printOut(string) {
  SignStixDebug.info(string);
}

function updateDisplay() {
  SignStixGraphics.updateDisplay();
}

function jumpToSign(signName) {
  SignStixEngine.jumpToSignInSequence(signName);
  currentSign = signName;
}
