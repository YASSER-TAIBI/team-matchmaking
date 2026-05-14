package com.yazzer.foot5connect.services;

public interface CloudinaryMediaService {

    // Indique si l'URL fournie correspond à un ancien logo d'équipe géré par Cloudinary
    // dans le dossier teams, donc potentiellement supprimable côté serveur.
    boolean isManagedTeamAssetUrl(String url);

    // Supprime un asset Cloudinary à partir de son URL publique complète,
    // uniquement lorsqu'il s'agit d'un fichier géré par le backend.
    void deleteAssetByUrl(String url);
}
