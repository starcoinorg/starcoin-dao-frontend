const MoveTomlTpl = (daoName:string, address:string) => {
    return `
[package]
name = "my_dao"
version = "0.0.1"

[addresses]
StarcoinFramework = "0x1"
${daoName} = "${address}"

[dependencies]
StarcoinFramework = {git = "https://github.com/starcoinorg/starcoin-framework.git", rev="cf1deda180af40a8b3e26c0c7b548c4c290cd7e7"}
`
}

export {MoveTomlTpl}