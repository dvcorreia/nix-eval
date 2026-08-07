{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    tvix = {
      url = "git+https://cl.tvl.fyi/depot?ref=canon&rev=60cffdcbe403b0101e579f6d1031348c54b63f7d";
      flake = false;
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      tvix,
    }:
    let
      inherit (nixpkgs) lib;
      forAllSystems = lib.genAttrs lib.systems.flakeExposed;

      version = (builtins.fromJSON (builtins.readFile ./package.json)).version;
    in
    {
      overlays.default = final: _: {
        nix-eval-wasm = final.callPackage ./rust { inherit tvix version; };
        nix-eval = final.callPackage ./package.nix { inherit version; };
        nix-eval-demo = final.callPackage ./demo { inherit version; };
        nix-eval-tarball = final.callPackage ./release.nix { inherit version; };
      };

      packages = forAllSystems (
        system:
        let
          pkgs = import nixpkgs {
            inherit system;
            overlays = [ self.overlays.default ];
          };
        in
        {
          inherit (pkgs) nix-eval nix-eval-demo nix-eval-tarball nix-eval-wasm;
          default = pkgs.nix-eval;
        }
      );

      checks = forAllSystems (system: {
        nix-eval = self.packages.${system}.nix-eval;
      });

      formatter = forAllSystems (system: nixpkgs.legacyPackages.${system}.nixfmt-tree);

      devShells = forAllSystems (
        system:
        let
          pkgs = import nixpkgs {
            inherit system;
            overlays = [ self.overlays.default ];
          };
        in
        {
          default = pkgs.mkShell {
            inputsFrom = [
              pkgs.nix-eval
              pkgs.nix-eval-wasm
              pkgs.nix-eval-demo
            ];
            packages = [
              pkgs.rustfmt
            ];
            shellHook = ''
              if [ -L rust/tvix ] && [ "$(readlink rust/tvix)" != "${tvix}/tvix" ]; then
                rm rust/tvix
              fi
              if [ ! -e rust/tvix ]; then
                ln -s ${tvix}/tvix rust/tvix
              fi
            '';
          };
        }
      );
    };
}
