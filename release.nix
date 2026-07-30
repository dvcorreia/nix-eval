{
  nix-eval,
  pnpm,
  stdenvNoCC,
  version ? "0.0.0",
}:

stdenvNoCC.mkDerivation {
  pname = "nix-eval-tarball";
  inherit version;

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
