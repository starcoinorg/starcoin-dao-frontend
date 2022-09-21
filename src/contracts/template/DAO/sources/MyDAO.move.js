const MyDAOSourceTpl = (
  address,
  daoName,
  description,
  long_description,
  purpose,
  tags,
  links,

  voting_delay,
  voting_period,
  voting_quorum_rate,
  min_action_delay,
  min_proposal_deposit,
) => {
  let tagsCode = 'let tags = Vector::empty<vector<u8>>();\n';
  for (const i in tags) {
    const tag = tags[i];
    tagsCode += `\t\tVector::push_back<vector<u8>>(&mut tags, b"${tag}");\n`;
  }

  let linksCode = 'let links = Vector::empty<vector<u8>>();\n';
  for (const key in links) {
    const value = links[key];
    const link = `${key}=${value}`;
    linksCode += `\t\tVector::push_back<vector<u8>>(&mut links, b"${link}");\n`;
  }

  return `
module ${address}::${daoName} {
    use StarcoinFramework::Vector;
    use StarcoinFramework::Option;
    use StarcoinFramework::DAOAccount;
    use StarcoinFramework::DAOSpace;
    use StarcoinFramework::MemberProposalPlugin::{Self, MemberProposalPlugin};
    use StarcoinFramework::InstallPluginProposalPlugin::{Self, InstallPluginProposalPlugin};
    
    struct ${daoName} has key, store {
        long_description: vector<u8>,
        purpose: vector<u8>,
        tags: vector<vector<u8>>,
        links: vector<vector<u8>>,
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
    public(script) fun initialize(
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
        let dao = ${daoName} {
            long_description: b"${long_description}",
            purpose: b"${purpose}",
            tags: tags,
            links: links,
        };

        let image_data = Option::none<vector<u8>>();
        let image_url = Option::some<vector<u8>>(b"ipfs://QmdTwdhFi61zhRM3MtPLxuKyaqv3ePECLGsMg9pMrePv4i"); //TODO change to real image url
        let dao_root_cap = DAOSpace::create_dao<${daoName}>(dao_account_cap, *&NAME, image_data, image_url, b"${description}", dao, config);
        
        DAOSpace::install_plugin_with_root_cap<${daoName}, InstallPluginProposalPlugin>(&dao_root_cap, InstallPluginProposalPlugin::required_caps()); 
        DAOSpace::install_plugin_with_root_cap<${daoName}, MemberProposalPlugin>(&dao_root_cap, MemberProposalPlugin::required_caps());

        DAOSpace::burn_root_cap(dao_root_cap);
    }
}
`;
};

export { MyDAOSourceTpl };
