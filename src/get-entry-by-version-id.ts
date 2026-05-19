export function getEntryByVersionID<T extends { id: string }>(
  versions: T[],
  id?: string | null
): T | undefined {
  if (id != null) {
    return versions.find((version) => version.id === id)
  }

  return versions.find((version) => version.id.toLowerCase() !== 'unreleased')
}
