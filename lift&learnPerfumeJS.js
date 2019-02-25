///////////////Classs Tag manager////////////////////
function TagManager() {

  var tagData = [];

  this.storeTag = function(data) {
    tagData.push(data);
    twoTags.addTag(uid);
  };

  this.clearData = function() {
    tagData = [];
  }

  this.removeTagData = function(uid) {
    if(tagData.length > 0) {
      for(var i = 0; i < tagData.length; i++) {
        if(tagData[i] == uid) {
          var array = tagData.splice(i, 1);
          twoTags.removeTag(uid);
          tagData = array;
        }
      }
    }
  }


  this.countTags = function() {
    return tagData.length;
  }

  //checks the information of the tag passed into the array
  this.checkTagData = function () {
    printOut("Checking tag data");
    for(var tag = 0; tag < tagData.length; tag ++) {
      var tagInfo = tagData[tag];
      return tagInfo;
    }
  }


  this.checkProduct = function(tagId) {
    printOut("Checking product info for tag id " + tagId);
    for(var product = 0; product < productsArray.length; product ++) {
      var prod = productsArray[product];
      var id = prod.getProductId();
      if(id == tagId) {
        //We know the tag id and the product id match so we can return the id for use.
        return prod;
      } else {
        printOut('Tag id not the same as the product id');
      }
    } return null;
  }

}

/////////////////////class tag manager////////////////////////

/////////////////////class Navigation/////////////////////////

function NavigationController() {

  this.changeSign = function(productId) {
    var signNameToJump = productId.getSignName();
    switch(signNameToJump) {
      case "perfume1":
        //jump to sign
      case "perfume2":
        //jump to sign
    }
  }



  //reset to home screen
  this.returnToHomeScreen = function() {
    var current = getCurrentSignInfo()
    if(current != homeScreenSign) {
      jumpToSign(homeScreenSign);
    }
  }
}

/////////////////////class Navigation/////////////////////////

/////////////////////class Selected duo//////////////////////

//used to keep track of the tags picked up
function TwoSelectedTags() {

  this.tagOne = null;
  this.tagTwo = null;

  //if a tag is already selected bump it to the tag b and reassign tag a
  this.addTag = function(tagId) {
    if (this.tagOne != null) {
      this.tagTwo = this.tagOne
    }
    this.tagOne = tagId
  }

  //removes the selected tag
  //if tag one is set back, set two to one and set two to null
  //if tagtwo is put back set it to null
  this.removeTag = function(knownTag) {
    if(this.tagOne == knownTag) {
      this.tagOne = this.tagTwo;
      this.tagTwo = null;
    } else if (this.tagTwo == knownTag) {
      this.tagTwo = null;
    }
  }

  this.twoSelected = function() {
    return (this.tagOne != null && this.tagTwo != null);
  }

  this.getTagOne = function() {
    return this.tagOne;
  }

  this.getTagTwo = function() {
    return this.tagTwo;
  }

}

/////////////////////class Selected duo//////////////////////

////////////////////class product info////////////////////////
function Product(productName, productID, signName) {

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
const navigationController = new NavigationController();
const twoTags = new TwoSelectedTags();
const perfume1 = new Product("Perfume1", "04D92C2A", "perfume1");
const perfume2 = new Product("Perfume2", "04E12C2A", "perfume2");

var vendor = '1B4F';
var product = '9204';

const homeScreenSign = "HomeScreen";

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

  layer.setText(hexData);
  SignStixGraphics.updateDisplay();

  var value = dataRead(hexData);
  var amount = manager.countTags();

  manager.storeTag(hexData);

  //Check the tag data and find the product related to it
  var uid = manager.checkTagData();
  var product = manager.checkProduct(id);
  //add the product to the twoProduct Class

  switch(value) {
    case 42:
    //suggests product picked up;
    //check for tag in tag data Array
    //present the product on screen
    if(twoTags.twoSelected()) {
      printOut("Jumping to sign which shows two products");
      // navigationController.changeSign("signWithTwoProducts");
    } else {
      printOut("Jumping to sign " + product.getSignName());
      // navigationController.changeSign(product);
    }
    break;
    case 50:
    //suggests product has been placed back;
    //check for tag in tag Array
    manager.removeTagData(hexData);
    //check if a tag is left, if not revert to the last tag sign
    if(amount == 0) {
      printOut("returning to home screen");
      // navigationController.returnToHomeScreen();
    } else {
      printOut("Only one tag left, ")
      navigationController.changeSign(product);
    }
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

/* Convert the argunment string of data and convert to an array of bytes*/
function hexToBytes(hex) {
  for (var bytes = [], a = 0; a < hex.length; a += 2)
  bytes.push(parseInt(hex.substr(a, 2), 16));
  return bytes;
}

/* Convert the bytes in the argument byte array at the argument offset into a hex string. */
function bytesToHex(bytes, offset, length) {
  for (var hex = [], i = 0; i < length; i++) {
    hex.push((bytes[offset + i] >>> 4).toString(16).toUpperCase());
    hex.push((bytes[offset + i] & 0xF).toString(16).toUpperCase());
  }
  return hex.join("");
}

/* Convert the argument text to ASCII hex. */
function textToHex(text) {
  var len = text.length;
  var bytes = new Array();
  for (var i = 0; i < len; i++) {
    var char = text.charCodeAt(i);
    bytes.push(char);
  }
  var hex = bytesToHex(bytes, 0, len);
  return hex;
}

/* Convert the argument hex string to text, assuming the hex values are ASCII. */
function hexToText(hex) {
  var bytes = hexToBytes(hex);
  var text = '';
  for (var i = 0; i < bytes.length; i++) {
    var b = bytes[i];
    var char = String.fromCharCode(b);
    text = text + char;
  }
  return text;
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
