const MyDAOSourceTpl = (
  address,
  daoName,
  description,
  long_description,
  purpose,
  tags,
  links,
  plugins,
  members,

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

  let pluginsImport = '';
  let pluginsInfo = '';
  var count = 0;
  for (const k in plugins) {
    const value = plugins[k];
    const t = count > 0 ? '\t\t' : '';
    const n = count != plugins.length - 1 ? '\n' : '';
    pluginsImport += `${t}use StarcoinFramework::${value}::{Self, ${value}};`;
    pluginsInfo += `${t}DAOSpace::install_plugin_with_root_cap<${daoName}, ${value}>(&dao_root_cap, ${value}::required_caps());${n}`;
    count++;
  }

  count = 0;
  let membersInfo = '';
  for (const k in members) {
    const value = members[k];
    const t = count > 0 ? '\t\t' : '';
    const n = count != plugins.length - 1 ? '\n' : '';
    membersInfo += `${t}DAOSpace::issue_member_offer(&dao_root_cap, @${value}, Option::none<vector<u8>>(), Option::none<vector<u8>>(), 1);${n} `;
    count++;
  }

  console.log(plugins);
  console.log(membersInfo);

  return `
module ${address}::${daoName} {
    use StarcoinFramework::Vector;
    use StarcoinFramework::Option;
    use StarcoinFramework::DAOAccount;
    use StarcoinFramework::DAOSpace;
    ${pluginsImport}
    
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

        let cap = DAOAccount::extract_dao_account_cap(&sender);
        let image_data = Option::none<vector<u8>>();
        let image_url = Option::some<vector<u8>>(b"ipfs://QmdTwdhFi61zhRM3MtPLxuKyaqv3ePECLGsMg9pMrePv4i"); //TODO change to real image url
        let dao_root_cap = DAOSpace::create_dao<${daoName}>(cap, *&NAME, image_data, image_url, b"${description}", dao, config);
        
        ${pluginsInfo}

        ${membersInfo}

        DAOSpace::burn_root_cap(dao_root_cap);
    }
}
`;
};

export { MyDAOSourceTpl };
