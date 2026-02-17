module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  return {
    ...config,
    android: {
      ...config.android,
      package: config.android?.package ?? 'com.weinn.host',
      config: {
        ...(config.android?.config ?? {}),
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    ios: {
      ...config.ios,
      config: {
        ...(config.ios?.config ?? {}),
        googleMapsApiKey,
      },
    },
    extra: {
      ...(config.extra ?? {}),
      googleMapsApiKey,
    },
  };
};
