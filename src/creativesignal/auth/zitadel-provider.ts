export interface SocialProvider {
  name: string;
  provider: string;
}

export function selectZitadelProvider<T extends SocialProvider>(
  providers: readonly T[],
): T | undefined {
  return providers.find(
    (provider) => provider.provider.trim().toLowerCase() === "zitadel",
  );
}
