package com.yazzer.foot5connect.services.impl;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.cloudinary.Cloudinary;
import com.yazzer.foot5connect.services.CloudinaryMediaService;

import lombok.RequiredArgsConstructor;

/**
 * Implémentation du service de gestion des médias Cloudinary.
 */
@Service
@RequiredArgsConstructor
public class CloudinaryMediaServiceImpl implements CloudinaryMediaService {

    private static final String CLOUDINARY_HOST = "res.cloudinary.com";
    private static final String UPLOAD_SEGMENT = "/image/upload/";
    private static final String TEAMS_FOLDER_PREFIX = "teams/";
    private static final Logger log = LoggerFactory.getLogger(CloudinaryMediaServiceImpl.class);

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    /**
     * Vérifie si une URL publique correspond à un asset Cloudinary du dossier teams,
     * donc à un ancien logo d'équipe que le backend est autorisé à gérer.
     *
     * @param url l'URL publique à vérifier
     * @return true si l'URL correspond à un asset géré, false sinon
     */
    @Override
    public boolean isManagedTeamAssetUrl(String url) {
        String publicId = extractTeamAssetPublicId(url);
        return publicId != null;
        
    }

    /**
     * Supprime l'ancien logo à partir de son URL complète si Cloudinary est correctement
     * configuré et si l'URL appartient bien aux assets d'équipe gérés.
     *
     * @param url l'URL publique de l'asset à supprimer
     */
    @Override
    public void deleteAssetByUrl(String url) {
        if (!isCloudinaryConfigured()) {
            log.warn("Suppression Cloudinary ignorée : configuration incomplète (cloudName/apiKey/apiSecret manquants).");
            return;
        }

        String publicId = extractTeamAssetPublicId(url);
        if (publicId == null) {
            log.warn("Suppression Cloudinary ignorée : URL non reconnue comme asset géré teams. url={}", url);
            return;
        }

        try {
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, Map.of("resource_type", "image", "invalidate", true));
            log.info("Résultat suppression Cloudinary pour publicId={}: {}", publicId, result);
        } catch (IOException exception) {
            log.error("Échec suppression Cloudinary pour url={}.", url, exception);
            throw new IllegalStateException("Impossible de supprimer l'ancien logo Cloudinary.", exception);
        }
    }

    /**
     * Vérifie que le backend possède bien toutes les clés privées nécessaires
     * avant d'essayer une suppression côté serveur.
     *
     * @return true si le backend est correctement configuré, false sinon
     */
    private boolean isCloudinaryConfigured() {
        return StringUtils.hasText(cloudName)
                && StringUtils.hasText(apiKey)
                && StringUtils.hasText(apiSecret);
    }

    /**
     * Analyse l'URL Cloudinary publique pour extraire le public_id réel du fichier,
     * uniquement si l'asset appartient au dossier teams.
     *
     * @param url l'URL publique à analyser
     * @return le public_id de l'asset si trouvé, null sinon
     */
    private String extractTeamAssetPublicId(String url) {
        if (!StringUtils.hasText(url) || !StringUtils.hasText(cloudName)) {
            return null;
        }

        try {
            URI uri = new URI(url);
            if (!CLOUDINARY_HOST.equalsIgnoreCase(uri.getHost())) {
                return null;
            }

            String path = uri.getPath();
            String cloudPrefix = "/" + cloudName + UPLOAD_SEGMENT;
            if (!path.startsWith(cloudPrefix)) {
                return null;
            }

            String assetPath = path.substring(cloudPrefix.length());
            assetPath = stripVersionPrefix(assetPath);
            if (!assetPath.startsWith(TEAMS_FOLDER_PREFIX)) {
                return null;
            }

            int extensionIndex = assetPath.lastIndexOf('.');
            if (extensionIndex <= 0) {
                return null;
            }

            return assetPath.substring(0, extensionIndex);
        } catch (URISyntaxException exception) {
            return null;
        }
    }

    /**
     * Retire le segment de version Cloudinary de type v123456789 quand il est présent,
     * afin de reconstituer le public_id attendu par l'API de suppression.
     *
     * @param assetPath le chemin de l'asset à traiter
     * @return le chemin de l'asset sans segment de version
     */
    private String stripVersionPrefix(String assetPath) {
        if (!StringUtils.hasText(assetPath) || assetPath.charAt(0) != 'v') {
            return assetPath;
        }

        int slashIndex = assetPath.indexOf('/');
        if (slashIndex <= 1) {
            return assetPath;
        }

        String versionSegment = assetPath.substring(0, slashIndex);
        for (int index = 1; index < versionSegment.length(); index++) {
            if (!Character.isDigit(versionSegment.charAt(index))) {
                return assetPath;
            }
        }

        return assetPath.substring(slashIndex + 1);
    }
}
