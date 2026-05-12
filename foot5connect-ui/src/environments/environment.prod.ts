export const environment = {
  production: true,
  api: {
    rootUrl: 'http://localhost:8080'
  },
  cloudinary: {
    cloudName: 'ddsabo1fb',
    uploadPreset: 'team_logos_unsigned',
    folder: 'teams'
  },
  googleMaps: {
    apiKey: '',
    embedPlaceBaseUrl: 'https://www.google.com/maps/embed/v1/place',
    embedSearchBaseUrl: 'https://www.google.com/maps',
    scriptBaseUrl: 'https://maps.googleapis.com/maps/api/js'
  }
};
