export const mockGeolocation = {
  getCurrentPosition: vi.fn((success) =>
    success({
      coords: {
        latitude: 37.5665,
        longitude: 126.9780,
      },
    })
  ),
};

export const mockWeatherApiResponse = {
  weather: [{ main: 'Clear', description: 'clear sky' }],
  main: { temp: 20 },
  name: 'Seoul',
};
