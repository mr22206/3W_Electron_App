#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <time.h> // Ajouté pour la fonction time


typedef struct {
    uint8_t humidity;      // 1 octet
    int8_t temperature;    // 1 octet
    int16_t altitude;      // 2 octets
    int32_t latitude;      // 4 octets
    int32_t longitude;     // 4 octets
    uint16_t luminosity;   // 2 octets
    uint32_t timestamp;    // 4 octets
} SensorData;

void generer_fichier_binaire(const char *nom_fichier, size_t nombre_enregistrements) {
    FILE *fichier = fopen(nom_fichier, "wb");
    if (fichier == NULL) {
        perror("Erreur lors de l'ouverture du fichier binaire");
        return;
    }

    for (size_t i = 0; i < nombre_enregistrements; i++) {
        SensorData data;
        
        // Remplir la structure avec des valeurs d'exemple
        data.humidity = (uint8_t)(50 + (rand() % 51)); // Humidité entre 50 et 100
        data.temperature = (int8_t)(-10 + (rand() % 21)); // Température entre -10 et 10
        data.altitude = (int16_t)(1000 + (rand() % 2000)); // Altitude entre 1000 et 3000 mètres
        data.latitude = (int32_t)(340000000 + (rand() % 100000)); // Latitude fictive
        data.longitude = (int32_t)(200000000 + (rand() % 100000)); // Longitude fictive
        data.luminosity = (uint16_t)(100 + (rand() % 900)); // Luminosité entre 100 et 1000
        data.timestamp = (uint32_t)time(NULL) + i; // Timestamp courant + index

        // Écrire la structure dans le fichier binaire
        fwrite(&data, sizeof(SensorData), 1, fichier);
    }

    fclose(fichier);
    printf("Fichier binaire créé : %s avec %zu enregistrements.\n", nom_fichier, nombre_enregistrements);
}

int main(int argc, char *argv[]) {
    if (argc != 3) {
        fprintf(stderr, "Usage: %s <nom_fichier_binaire> <nombre_enregistrements>\n", argv[0]);
        return EXIT_FAILURE;
    }

    const char *nom_fichier = argv[1];
    size_t nombre_enregistrements = (size_t)atoi(argv[2]);

    // Générer le fichier binaire avec des données
    generer_fichier_binaire(nom_fichier, nombre_enregistrements);

    return EXIT_SUCCESS;
}
