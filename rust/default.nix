{
  lib,
  lld,
  rustPlatform,
  tvix,
  wasm-bindgen-cli_0_2_99,
  version ? "0.0.0",
}:

rustPlatform.buildRustPackage {
  pname = "nix-eval-wasm";
  inherit version;

  src = lib.cleanSource ./.;

  cargoLock.lockFile = ./Cargo.lock;

  postUnpack = ''
    cp -R ${tvix}/tvix "$sourceRoot/tvix"
  '';

  nativeBuildInputs = [
    lld
    wasm-bindgen-cli_0_2_99
  ];

  cargoBuildFlags = [ "--target=wasm32-unknown-unknown" ];

  doCheck = false;

  installPhase = ''
    wasm-bindgen --target web --out-dir "$out" --out-name nix_eval \
      target/wasm32-unknown-unknown/release/nix_eval.wasm
  '';
}
