const MoveTomlTpl = (daoName, address) => {
  return `
[package]
name = "my_dao"
version = "0.0.1"

[addresses]
StarcoinFramework = "0x1"
FreePlugin = "0x7dA9Cd8048A4620fda9e22977750C517"
${daoName} = "${address}"

[dependencies]
StarcoinFramework = {git = "https://github.com/starcoinorg/starcoin-framework.git", rev="cf1deda180af40a8b3e26c0c7b548c4c290cd7e7"}
FreePlugin = {git = "https://github.com/freepai/freepai-plugin.git", rev="05108faced5935cd8a868490549a737050126983"}
`;
};

export { MoveTomlTpl };
