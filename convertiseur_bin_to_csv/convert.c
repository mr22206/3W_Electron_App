#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <time.h>  // Inclure la bibliothèque time.h pour la conversion du timestamp
#include <string.h>
#include <libgen.h>
#include <sys/stat.h> // Inclure cette bibliothèque pour mkdir
#ifdef _WIN32
#include <direct.h> // Pour _mkdir sur Windows
#endif

typedef struct {
    uint8_t humidity;      // 1 octet
    int8_t temperature;    // 1 octet
    int16_t altitude;      // 2 octets
    int32_t latitude;      // 4 octets
    int32_t longitude;     // 4 octets
    uint16_t luminosity;   // 2 octets
    uint32_t timestamp;    // 4 octets
} SensorData;

void convertir_binaire_en_csv(const char *fichier_binaire) {
    FILE *f_binaire = fopen(fichier_binaire, "rb");
    if (f_binaire == NULL) {
        perror("Erreur lors de l'ouverture du fichier binaire");
        return;
    }

    // Créer le dossier converted_files s'il n'existe pas
#ifdef _WIN32
    _mkdir("converted_files"); // Utiliser _mkdir sur Windows
#else
    mkdir("converted_files", 0755); // Utiliser mkdir sur Unix/Linux
#endif

    // Générer le nom du fichier CSV à partir du nom du fichier binaire
    char chemin_csv[256]; // Buffer pour le chemin du fichier CSV
    snprintf(chemin_csv, sizeof(chemin_csv), "converted_files/%s", basename((char *)fichier_binaire)); // Conserver le nom de base
    // Supprimer l'extension .bin si elle existe
    char *dot = strrchr(chemin_csv, '.');
    if (dot && strcmp(dot, ".bin") == 0) { // Vérifier si l'extension est .bin
        *dot = '\0'; // Supprimer l'extension
    }
    strcat(chemin_csv, ".csv"); // Ajouter l'extension .csv

    FILE *f_csv = fopen(chemin_csv, "w"); // Ouvrir le fichier CSV avec le nouveau chemin
    if (f_csv == NULL) {
        perror("Erreur lors de l'ouverture du fichier CSV");
        fclose(f_binaire);
        return;
    }

    fprintf(f_csv, "Humidity,Temperature,Altitude,Latitude,Longitude,Luminosity,Timestamp,Date\n"); // Écriture de l'en-tête CSV

    SensorData data;
    while (fread(&data, sizeof(SensorData), 1, f_binaire) == 1) {
        // Convertir le timestamp en date
        time_t timestamp = (time_t)data.timestamp; // Convertir le timestamp en type time_t
        struct tm *tm_info = localtime(&timestamp); // Convertir en structure tm
        char date_buffer[26]; // Buffer pour stocker la date formatée
        strftime(date_buffer, sizeof(date_buffer), "%Y-%m-%d %H:%M:%S", tm_info); // Formater la date

        // Écrire les données dans le fichier CSV
        fprintf(f_csv, "%d,%d,%d,%d,%d,%d,%u,%s\n", 
                data.humidity, 
                data.temperature, 
                data.altitude, 
                data.latitude, 
                data.longitude, 
                data.luminosity, 
                data.timestamp, 
                date_buffer); // Inclure la date formatée
    }

    fclose(f_binaire);
    fclose(f_csv);
}

int main(int argc, char *argv[]) {
    if (argc != 2) { // Modifier pour n'attendre qu'un seul argument
        fprintf(stderr, "Usage: %s <fichier_binaire>\n", argv[0]);
        return EXIT_FAILURE;
    }

    const char *fichier_binaire = argv[1];
    convertir_binaire_en_csv(fichier_binaire);

    printf("Conversion terminée. Fichier CSV créé : converted_files/%s.csv\n", basename((char *)fichier_binaire));

    return EXIT_SUCCESS;
}
