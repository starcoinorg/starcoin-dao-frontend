const MyDAOSourceTpl = (
    daoName:string, 
    voting_delay:number, 
    voting_period:number,
    voting_quorum_rate:number,
    min_action_delay: number,
    min_proposal_deposit: number,
    describe: string,
    long_description: string,
    purpose: string,
    tags: [string],
    links: [string]
) => {

    let tagsCode = "let tags = Vector::empty<vector<u8>>();\n"
    for (const i in tags) {
        const tag = tags[i];
        tagsCode+=`Vector::push_back<vector<u8>>(&mut tags, b"${tag}");\n`;
    }

    let linksCode = "let tags = Vector::empty<vector<u8>>();\n"
    for (const i in links) {
        const link = links[i];
        linksCode+=`Vector::push_back<vector<u8>>(&mut tags, b"${link}");\n`;
    }

    return `
module ${daoName}::${daoName} {
    use StarcoinFramework::Vector;
    use StarcoinFramework::DAOAccount;
    use StarcoinFramework::DAOSpace;
    use StarcoinFramework::MemberProposalPlugin::{Self, MemberProposalPlugin};
    use StarcoinFramework::InstallPluginProposalPlugin::{Self, InstallPluginProposalPlugin};
    use FreePlugin::PluginMarketplace;
    
    /// The info for DAO installed Plugin
    struct InstalledWebPluginInfo has store, drop {
        plugin_id: u64,
        plugin_version: u64,
    }

    struct ${daoName} has store{
        long_description: vector<u8>
        purpose: vector<u8>
        tags: vector<vector<u8>>
        links: vector<vector<u8>>
        installed_web_plugins: vector<InstalledWebPluginInfo>
    }
    
    const NAME: vector<u8> = b"${daoName}";
    const CONTRACT_ACCOUNT:address = @${daoName};

    const ERR_ALREADY_INITIALIZED: u64 = 100;
    const ERR_NOT_CONTRACT_OWNER: u64 = 101;
    const ERR_NOT_FOUND_PLUGIN: u64 = 102;
    const ERR_EXPECT_PLUGIN_NFT: u64 = 103;
    const ERR_REPEAT_ELEMENT: u64 = 104;
    const ERR_PLUGIN_HAS_INSTALLED: u64 = 105;
    const ERR_PLUGIN_VERSION_NOT_EXISTS: u64 = 106;
    const ERR_PLUGIN_NOT_INSTALLED: u64 = 107;

    /// directly upgrade the sender account to DAOAccount and create DAO
    public(script) fun create_dao(
        sender: signer
    ){
        let dao_account_cap = DAOAccount::upgrade_to_dao(sender);
        let config = DAOSpace::new_dao_config(
            ${voting_delay},
            ${voting_period},
            ${voting_quorum_rate},
            ${min_action_delay},
            ${min_proposal_deposit},
        );
        ${tagsCode}
        ${linksCode}
        let dao = ${daoName}{
            long_description: b"${long_description}"
            purpose: b"${purpose}"
            tags: tags,
            links: links,
            installed_web_plugins: Vector::empty<InstalledWebPluginInfo>(),
        }

        let dao_root_cap = DAOSpace::create_dao<${daoName}>(dao_account_cap, *&NAME, b"${describe}", dao, config);
        
        DAOSpace::install_plugin_with_root_cap<${daoName}, InstallPluginProposalPlugin>(&dao_root_cap, InstallPluginProposalPlugin::required_caps()); 
        DAOSpace::install_plugin_with_root_cap<${daoName}, MemberProposalPlugin>(&dao_root_cap, MemberProposalPlugin::required_caps());
        
        DAOSpace::burn_root_cap(dao_root_cap);
    }

    /// Install plugin with DAOInstallPluginCap
    public fun install_plugin(sender: &signer, plugin_id:u64, plugin_version: u64) acquires ${daoName} {
        assert!(Signer::address_of(sender)==CONTRACT_ACCOUNT, Errors::requires_address(ERR_NOT_CONTRACT_OWNER));
        assert!(PluginMarketplace::exists_plugin_version(plugin_id, plugin_version), Errors::invalid_state(ERR_PLUGIN_VERSION_NOT_EXISTS));
        
        let dao = borrow_global_mut<${daoName}>(CONTRACT_ACCOUNT);
        assert!(!exists_installed_plugin(dao, plugin_id, plugin_version), Errors::already_published(ERR_PLUGIN_HAS_INSTALLED));
        
        Vector::push_back<InstalledWebPluginInfo>(&mut dao.installed_plugins, InstalledWebPluginInfo{
            plugin_id: plugin_id,
            plugin_version: plugin_version,
        });
    }

    /// Install plugin with DAOInstallPluginCap
    public fun uninstall_plugin(sender: &signer, plugin_id:u64, plugin_version: u64) acquires ${daoName} {
        assert!(Signer::address_of(sender)==CONTRACT_ACCOUNT, Errors::requires_address(ERR_NOT_CONTRACT_OWNER));

        let dao = borrow_global_mut<${daoName}>(CONTRACT_ACCOUNT);
        let idx = find_by_plugin_id_and_version(&dao.installed_plugins, plugin_id, plugin_version);
        assert!(Option::is_some(&idx), Errors::already_published(ERR_PLUGIN_NOT_INSTALLED));

        let i = Option::extract(&mut idx);
        Vector::remove<InstalledWebPluginInfo>(&mut dao.installed_plugins, i);
    }

    /// Helpers
    /// ---------------------------------------------------

    fun assert_no_repeat<E>(v: &vector<E>) {
        let i = 1;
        let len = Vector::length(v);
        while (i < len) {
            let e = Vector::borrow(v, i);
            let j = 0;
            while (j < i) {
                let f = Vector::borrow(v, j);
                assert!(e != f, Errors::invalid_argument(ERR_REPEAT_ELEMENT));
                j = j + 1;
            };
            i = i + 1;
        };
    }

    fun find_by_plugin_id_and_version(
        c: &vector<InstalledPluginInfo>,
        plugin_id: u64, plugin_version: u64
    ): Option<u64> {
        let len = Vector::length(c);
        if (len == 0) {
            return Option::none()
        };
        let idx = len - 1;
        loop {
            let plugin = Vector::borrow(c, idx);
            if (plugin.plugin_id == plugin_id && plugin.plugin_version == plugin_version) {
                return Option::some(idx)
            };
            if (idx == 0) {
                return Option::none()
            };
            idx = idx - 1;
        }
    }

    fun exists_installed_plugin(dao: &${daoName}, plugin_id: u64, plugin_version: u64): bool {
        let idx = find_by_plugin_id_and_version(&dao.installed_plugins, plugin_id, plugin_version);
        Option::is_some(&idx)
    }
}
`
}

export {MyDAOSourceTpl}