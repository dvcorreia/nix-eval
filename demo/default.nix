{
  fetchPnpmDeps,
  lib,
  nix-eval,
  nodejs_22,
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
    hash = "sha256-PKUw+UQBM258Bs6EfsU+noARp4lFtB8lDpd9k1ZSmz4=";
  };

  nativeBuildInputs = [
    nodejs_22
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
