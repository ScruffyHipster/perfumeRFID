#include<MFRC522.h>

String uidValue[] = {""};
int rfidPin = 10;
int resetPin = 9;
String content = "";
String toSend = "";
byte letter;
bool successfulRead = false;
MFRC522 mfrc522(rfidPin, resetPin);

void setup() {
  Serial.begin(9600);
  while (!Serial) {
    ;
  }
  SPI.begin(); //init the SPI bus
  mfrc522.PCD_Init(); //init the RFID reader
  showRFIDReaderDetails();
}

void loop() {
  do {
    Serial.println(F("Checking for RFID tag"));
    checkForCard();
    delay(1000);
  } 
  while(!successfulRead);
  Serial.println(sizeof(uidValue));
}

void checkForCard() {
  if (!mfrc522.PICC_IsNewCardPresent()) {
    Serial.println(F("Cannot see any cards"));
    return; //if cannot see new card return
  }
  if (!mfrc522.PICC_ReadCardSerial()) {
    return; //If cannot read card serial return
  }
  //When card is found we can then read it
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    content.concat(String(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " "));
    content.concat(String(mfrc522.uid.uidByte[i], HEX));
    content.concat(String(" "));
    content.toUpperCase();
    successfulRead = true;
    Serial.println(F("Found a tag "));
  }
}

void checkData() {
  //check if the array has no value and content does
  if (sizeof(uidValue) == 1 && content != "") {
    for (int i = 0; i < sizeof(uidValue); i++) {
      if (uidValue[i] == content) {
        //if same, break as that means the product hasn't moved.
        Serial.println(F("Product is still on the reader"));
        break;
      } else {
        //add to the array
        uidValue[0] = content;
        Serial.println(F("Added product to the array"));
      }
    }
  } else {
    for (int i = 0; i < sizeof(uidValue); i++) {
      if (uidValue[i] != content) {
        Serial.println(F("No product on reader"));
        toSend = i;
        //send value, clear array, clear constant variable;
        Serial.println(toSend);
        uidValue[0] = {""};
        toSend = "";
        content = "";
        successfulRead = false;
      }
    }
  }
}


/////////////RFID Setup///////////////
void showRFIDReaderDetails() {
  byte v = mfrc522.PCD_ReadRegister(mfrc522.VersionReg);
  Serial.println(F("RFID Verison number is.."));
  Serial.println(v, HEX);
  switch (v) {
    case (0x91):
      Serial.println(F("Verion 1"));
      break;
    case (0x92):
      Serial.println(F("Version 2"));
      break;
    case (0x00 || 0xFF):
      Serial.println(F("Couldn't read the connected reader!. Please check all connections"));
      while (true); // won't proceed any further
    default:
      break;
      Serial.println("Unknown card reader");
  }
}

