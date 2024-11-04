#include <SD.h>
#include <avr/pgmspace.h>  // Pour l'utilisation de PROGMEM
#include <stdint.h>
#include <string.h>
#include <TimeLib.h>       // Pour la gestion du timestamp
#include <RTClib.h>

#define SD_CS_PIN 4       // Pin CS pour la carte SD
#define BUFFER_SIZE 256    // Réduire à 256 octets pour économiser la RAM
#define MAX_FILES 10       // Nombre maximum de fichiers actifs avant archivage
#define LOG_INTERVAL 600000 // 10 minutes en millisecondes
#define TIMEOUT 30000 // 30 secondes
#define FILE_MAX_SIZE 2048 // 2 Ko
#define MAX_MEASUREMENTS 8 // Nombre maximum de mesures par fichier

RTC_DS1307 rtc; // Instance de l'horloge temps réel
unsigned long lastLogTime = 0;
int revisionNumber = 0;
char filename[12];

// Prototypes des fonctions manquantes
int writeBufferToSD();
void generateFileName(char *fileName);
uint8_t readHumidity();
int8_t readTemperature();
int16_t readAltitude();
int16_t readLatitude();
int16_t readLongitude();
uint16_t readLuminosity();

// Structure pour stocker les données du capteur avec optimisation des types
struct SensorData {
    uint8_t humidity;      // 1 octet
    int8_t temperature;    // 1 octet
    int16_t altitude;      // 2 octets
    int32_t latitude;      // 4 octets
    int32_t longitude;     // 4 octets
    uint16_t luminosity;   // 2 octets
    uint32_t timestamp;    // 4 octets
};

#define ERR_SD_INIT 301
#define ERR_FILE_OPEN 302
#define ERR_RTC_NONE 303
#define ERR_LOG_FILE 304
#define ERR_UNKNOWN 305

uint16_t bufferIndex = 0;
char buffer[50]; // Buffer temporaire pour les chaînes


// Fonction pour stocker les données du capteur dans le tampon
void bufferSensorData(SensorData data) {
    if (bufferIndex + sizeof(SensorData) > BUFFER_SIZE) {
        Serial.println(F("Buffer full, waiting to write"));
        return;  // Sortie si le buffer est plein
    }

    memcpy(&buffer[bufferIndex], &data, sizeof(SensorData));
    bufferIndex += sizeof(SensorData);
    Serial.print(F("Data buffered. Current buffer index: "));
    Serial.println(bufferIndex);
}

// Générer un nom de fichier avec un horodatage (format court)
void generateFileName(char *fileName) {
    DateTime now = rtc.now(); // Récupère la date et l'heure actuelles du RTC
    snprintf(fileName, 12, "%02d%02d%02d.bin", now.day(), now.hour(), now.minute());
}


// Fonction pour écrire les données du buffer sur la carte SD
int writeBufferToSD() {
    // Vérifier si le dossier du jour existe, sinon le créer
    char dirName[20];
    DateTime now = rtc.now();
    snprintf(dirName, sizeof(dirName), "/%04d%02d%02d", now.year(), now.month(), now.day());
    if (!SD.exists(dirName)) {
        SD.mkdir(dirName);
        Serial.print(F("Directory created: "));
        Serial.println(dirName);  // Débogage
    }

    // Générer le nom de fichier avec un horodatage
    char fileName[12];
    generateFileName(fileName);
    String fullPath = String(dirName) + "/" + String(fileName);

    // Ouvrir le fichier pour écriture
    File dataFile = SD.open(fullPath, FILE_WRITE);
    if (!dataFile) {
        Serial.println(F("Error: Cannot open file for writing"));
        return ERR_FILE_OPEN;
    }
    
    Serial.print(F("File opened for writing: "));
    Serial.println(fullPath);

    // Écrire le buffer dans le fichier
    if (bufferIndex > 0) { // S'assurer que le buffer n'est pas vide
        dataFile.write((uint8_t*)buffer, bufferIndex);
        dataFile.flush();  // Force l'écriture des données sur la carte SD
        Serial.print(F("Data written to file, size: "));
        Serial.println(bufferIndex);
        bufferIndex = 0;  // Réinitialiser l'index du buffer après écriture
    } else {
        Serial.println(F("Warning: Buffer is empty, nothing to write"));
    }
    dataFile.close();
    return 0; // Pas d'erreur
}


// Fonction pour détecter une anomalie et éviter une écriture inutile
bool detectAnomaly(SensorData currentData, SensorData previousData) {
    if (abs(currentData.humidity - previousData.humidity) > 5 || 
        abs(currentData.temperature - previousData.temperature) > 2 ||
        abs(currentData.luminosity - previousData.luminosity) > 100) {
        return true;
    }
    return false;
}

// Fonction principale de lecture des capteurs et de gestion des données
unsigned long lastWriteTime = 0; // pour le contrôle du temps
const unsigned long WRITE_INTERVAL = 10000; // Écrire toutes les 10 secondes

// Fonction principale de lecture des capteurs et de gestion des données
void logSensorData(SensorData &data) {
    // Capture des données simulées
    data.humidity = readHumidity();
    data.temperature = readTemperature();
    data.altitude = readAltitude();
    data.latitude = readLatitude();
    data.longitude = readLongitude();
    data.luminosity = readLuminosity();
    data.timestamp = millis(); // Utiliser millis() pour le timestamp

    // Ajouter les données au buffer
    bufferSensorData(data);
}

// Dans la fonction loop(), écrivez d'abord le premier objet, puis le deuxième
void loop() {
    Serial.print(F("Buffer index before logging: "));
    Serial.println(bufferIndex);
    
    SensorData firstData;
    logSensorData(firstData); // Écrire le premier objet dans le buffer

    // Écrire le buffer sur la carte SD
    if (bufferIndex > 0) {
        int status = writeBufferToSD();
        if (status == 0) {
            Serial.println(F("First write to SD ok"));
        } else {
            Serial.println(F("Error writing first data to SD"));
        }
    }

    // Simuler l'écriture d'un deuxième objet
    SensorData secondData;
    logSensorData(secondData); // Écrire le deuxième objet dans le buffer

    // Écrire le buffer sur la carte SD
    if (bufferIndex > 0) {
        int status = writeBufferToSD();
        if (status == 0) {
            Serial.println(F("Second write to SD ok"));
        } else {
            Serial.println(F("Error writing second data to SD"));
        }
    }

    Serial.print(F("Buffer index after logging: "));
    Serial.println(bufferIndex);
    
    delay(1000);  // Délai entre deux mesures (ajuster selon la fréquence désirée)
}


// Exemple de fonctions fictives pour lire les capteurs
uint8_t readHumidity() { return 60; }
int8_t readTemperature() { return 22; }
int16_t readAltitude() { return 150; }
int16_t readLatitude() { return 4000; }  // Ex. en dixièmes de degré
int16_t readLongitude() { return 6000; } // Ex. en dixièmes de degré
uint16_t readLuminosity() { return 300; }


void setup() {
    Serial.begin(9600);
    while (!Serial); // Attendre la connexion série pour les cartes comme Arduino Leonardo
    Serial.println(F("go")); // Message de débogage

    delay(1000);
    // Initialisation du RTC
    if (!rtc.begin()) {
        Serial.println(F("error init rtc"));
        return;
    }

    if (!rtc.isrunning()) {
        rtc.adjust(rtc.now()); // Utilise la date et l'heure actuelle du RTC
        

        Serial.println(F("none rtc now ok."));
    } else {
        Serial.println(F("rtc ok"));
    }
    // Initialisation de la carte SD
    if (!SD.begin(SD_CS_PIN)) {
        Serial.println(F("erroe init sd"));
        return;
    }
    Serial.println(F("sd init ok"));


}
