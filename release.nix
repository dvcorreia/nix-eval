{
  nix-eval,
  pnpm,
  stdenvNoCC,
}:

stdenvNoCC.mkDerivation {
  pname = "nix-eval-tarball";
  version = "0.1.0";

  dontUnpack = true;
  nativeBuildInputs = [ pnpm ];

  buildPhase = ''
    runHook preBuild

    mkdir package
    cp -R ${nix-eval}/. package/
    chmod -R u+w package
    mkdir -p "$out"
    (
      cd package
      pnpm pack --pack-destination "$out"
    )

    runHook postBuild
  '';

  installPhase = "true";
}
