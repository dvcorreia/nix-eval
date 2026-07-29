{
  fetchPnpmDeps,
  lib,
  nodejs_22,
  nix-eval-wasm,
  pnpm,
  pnpmConfigHook,
  stdenvNoCC,
  typescript,
}:

stdenvNoCC.mkDerivation (finalAttrs: {
  pname = "nix-eval";
  version = "0.1.0";
  src = lib.cleanSource ./.;

  pnpmDeps = fetchPnpmDeps {
    inherit (finalAttrs) pname version src;
    hash = "sha256-dIp6CNh1Kn4aqJWku1G/FUdn/u+epzhqlqwnAkB2uW0=";
    fetcherVersion = 4;
  };

  nativeBuildInputs = [
    nodejs_22
    pnpm
    pnpmConfigHook
    typescript
  ];

  buildPhase = ''
    runHook preBuild

    mkdir wasm
    cp -R ${nix-eval-wasm}/. wasm/
    pnpm run build:types

    runHook postBuild
  '';

  installPhase = ''
    runHook preInstall

    mkdir -p "$out"
    cp -R dist wasm "$out/"
    install -m644 package.json "$out/package.json"

    runHook postInstall
  '';
})
