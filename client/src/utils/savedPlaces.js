const STORAGE_KEY = "uva_saved_places";

export function getSavedPlaces() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read saved places:", error);
    return [];
  }
}

export function isPlaceSaved(placeId) {
  const savedPlaces = getSavedPlaces();

  return savedPlaces.includes(placeId);
}

export function savePlace(placeId) {
  const savedPlaces = getSavedPlaces();

  if (!savedPlaces.includes(placeId)) {
    const updated = [...savedPlaces, placeId];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    window.dispatchEvent(new Event("savedPlacesChanged"));

    return updated;
  }

  return savedPlaces;
}

export function removeSavedPlace(placeId) {
  const savedPlaces = getSavedPlaces();

  const updated = savedPlaces.filter(
    (id) => id !== placeId
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );

  window.dispatchEvent(new Event("savedPlacesChanged"));

  return updated;
}

export function toggleSavedPlace(placeId) {
  if (isPlaceSaved(placeId)) {
    return removeSavedPlace(placeId);
  }

  return savePlace(placeId);
}