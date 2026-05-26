const API = (
  process.env.REACT_APP_API_URL || "http://localhost:5000/api"
)
  .trim()
  .replace(/\/$/, "");

export function extractGoogleDriveFileId(value = "") {
  if (!value) return null;
  const byQuery = value.match(/[?&]id=([^&]+)/);
  if (byQuery) return byQuery[1];
  const byPath = value.match(/\/d\/([^/]+)/);
  if (byPath) return byPath[1];
  return null;
}

/**
 * Best URL for displaying a user's profile picture in <img>.
 * Prefer backend proxy (always works when Drive file exists).
 */
export function getProfilePictureSrc(user, previewUrl = null) {
  if (previewUrl) return previewUrl;
  if (!user) return null;

  const userId = user._id || user.id;
  const driveId =
    user.profilePictureDriveId ||
    extractGoogleDriveFileId(user.profilePicture);

  if (userId && driveId) {
    return `${API}/auth/user/${userId}/avatar`;
  }

  if (driveId) {
    return `https://drive.google.com/thumbnail?id=${driveId}&sz=w500`;
  }

  return user.profilePicture || null;
}
