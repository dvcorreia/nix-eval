{
  fetchPnpmDeps,
  lib,
  nix-eval,
  nodejs_26,
  pnpm,
  pnpmConfigHook,
  stdenvNoCC,
  version ? "0.0.0",
}:

stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "nix-eval-demo";
  inherit version;

  src = lib.cleanSource ../.;

  pnpmRoot = "demo";
  pnpmDeps = fetchPnpmDeps {
    inherit (finalAttrs) pname version src;
    sourceRoot = "${finalAttrs.src.name}/demo";
    inherit pnpm;
    fetcherVersion = 4;
    hash = "sha256-WNvgO9ck9o5OHhREctNBkTNDiT335f8T7Dvn5zCcrPQ=";
  };

  nativeBuildInputs = [
    nodejs_26
    pnpm
    pnpmConfigHook
  ];

  buildPhase = ''
    runHook preBuild

    cd demo
    rm -rf node_modules/nix-eval
    cp -R ${nix-eval} node_modules/nix-eval
    chmod -R u+w node_modules/nix-eval
    pnpm run build

    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall

    mkdir -p "$out"
    cp -R dist/. "$out/"

    runHook postInstall
  '';
})
