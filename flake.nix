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
    in
    {
      overlays.default = final: _: {
        nix-eval-wasm = final.callPackage ./rust { inherit tvix; };
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
          inherit (pkgs) nix-eval-wasm;
        }
      );

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
            inputsFrom = [ pkgs.nix-eval-wasm ];
            packages = [ pkgs.rustfmt ];
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
