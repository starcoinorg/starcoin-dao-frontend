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
    if (value) {
      const t = count > 0 ? '\t\t' : '';
      const n = count != plugins.length - 1 ? '\n' : '';
      pluginsImport += `${t}use StarcoinFramework::${value}::{Self, ${value}};${n}`;
      pluginsInfo += `${t}DAOSpace::install_plugin<${daoName}, ${daoName}, ${value}>(&install_cap, ${value}::required_caps());${n}`;
      count++;
    }
  }

  count = 0;
  let membersInfo = '';
  for (const k in members) {
    const value = members[k];
    if (value) {
      const t = count > 0 ? '\t\t' : '';
      const n = count != plugins.length - 1 ? '\n' : '';
      membersInfo += `${t}DAOSpace::issue_member_offer(&member_cap, @${value}, Option::none<vector<u8>>(), Option::none<vector<u8>>(), 1000);${n} `;
      count++;
    }
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
    
    struct ${daoName} has store, drop {}
    
    struct Ext has store, drop {
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
        let witness = ${daoName} {};
        let config = DAOSpace::new_dao_config(
            ${voting_delay},
            ${voting_period},
            ${voting_quorum_rate},
            ${min_action_delay},
            ${min_proposal_deposit},
        );
        
        let cap = DAOAccount::extract_dao_account_cap(&sender);
        let image_data = Option::none<vector<u8>>();
        let image_url = Option::some<vector<u8>>(b"ipfs://QmdTwdhFi61zhRM3MtPLxuKyaqv3ePECLGsMg9pMrePv4i"); //TODO change to real image url
        DAOSpace::create_dao<${daoName}>(cap, *&NAME, image_data, image_url, b"${description}", config);
        
        // store ext info
        ${tagsCode}
        ${linksCode}
        let ext_info = Ext {
            long_description: b"${long_description}",
            purpose: b"${purpose}",
            tags: tags,
            links: links,
        };
        let storage_cap = DAOSpace::acquire_storage_cap<${daoName}, ${daoName}>(&witness);
        DAOSpace::save_to_storage<${daoName}, ${daoName}, Ext>(&storage_cap, ext_info);

        let install_cap = DAOSpace::acquire_install_plugin_cap<${daoName}, ${daoName}>(&witness);
        ${pluginsInfo}

        let member_cap = DAOSpace::acquire_member_cap<${daoName}, ${daoName}>(&witness);
        DAOSpace::join_member_with_member_cap(&member_cap, &sender, Option::none<vector<u8>>(), Option::none<vector<u8>>(), 1000);

        ${membersInfo}
    }
}
`;
};

export { MyDAOSourceTpl };
