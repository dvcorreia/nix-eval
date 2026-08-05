# generates an attribute such as:
# {
#   ".." = "cd ..";
#   "..." = "cd ../..";
#   # and such up to n levels
# }

let
  levels = 7;
in

builtins.listToAttrs (
  builtins.genList (
    n:
    let
      alias = builtins.concatStringsSep "" (builtins.genList (_: ".") (n + 2));
      cmd = builtins.concatStringsSep "/" (builtins.genList (_: "..") (n + 1));
    in
    {
      name = alias;
      value = "cd ${cmd}";
    }
  ) levels
)
