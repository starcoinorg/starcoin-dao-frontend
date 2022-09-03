module MemberPlugin::MemberPlugin {
    use StarcoinFramework::Signer;
    use StarcoinFramework::Errors;
    use StarcoinFramework::Vector;
    use FreePlugin::PluginMarketplace;

    const PLUGIN_ID: u64 = 2;
    const CONTRACT_ACCOUNT:address = @MemberPlugin;

    const ERR_ALREADY_INITIALIZED: u64 = 100;
    const ERR_NOT_CONTRACT_OWNER: u64 = 101;

    public(script) fun initialize(sender: signer) {
        assert!(Signer::address_of(&sender)==CONTRACT_ACCOUNT, Errors::requires_address(ERR_NOT_CONTRACT_OWNER));
        
        let required_caps = Vector::empty<vector<u8>>();
        Vector::push_back<vector<u8>>(&mut required_caps, b"0x1::DAOSpace::DAOUpgradeModuleCap");
        Vector::push_back<vector<u8>>(&mut required_caps, b"0x1::DAOSpace::DAOMemberCap");

        let export_caps = Vector::empty<vector<u8>>();

        let implement_extpoints = Vector::empty<vector<u8>>();
        Vector::push_back<vector<u8>>(&mut implement_extpoints, b"0x1::ExtensionPoint::IApp/v1");

        let depend_extpoints = Vector::empty<vector<u8>>();
        Vector::push_back<vector<u8>>(&mut depend_extpoints, b"0x1::Starcoin::IToken/v1");

        // 0xce38a3D11bb357ceA0cc60a62b9D11dB::MemberPlugin
        PluginMarketplace::publish_plugin_version(
            &sender, 
            PLUGIN_ID,
            b"v0.1.0", 
            *&required_caps, 
            *&export_caps, 
            *&implement_extpoints, 
            *&depend_extpoints, 
            b"0xce38a3D11bb357ceA0cc60a62b9D11dB::MemberPlugin", 
            b"ipfs:://QmR2qsFESkhDe4Sgr1MazzfXUbUGc2CBa7vG6p2u9ALzUF"
        );
    }
}