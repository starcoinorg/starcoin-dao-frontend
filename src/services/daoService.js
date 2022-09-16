import { WasmFs } from '@wasmer/wasmfs';
import { Git, MovePackage } from '@starcoin/move-js';
import { MoveTomlTpl } from '../contracts/template/DAO/Move.toml';
import { MyDAOSourceTpl } from '../contracts/template/DAO/sources/MyDAO.move';
import { listDaos, getDaoDetail } from '../utils/dao';

class DaoService {
  constructor() {
    this.wasmfs = new WasmFs();
    this.git = new Git(this.wasmfs);
  }

  async createDao(cfg) {
    // download starcoin framework
    this.wasmfs.fs.mkdirpSync('/workspace/starcoin-framework/unit-test');

    // const starcoinFrameworkURL =
    //   process.env.NODE_ENV === 'production'
    //     ? '/dapps/data/starcoin-framework.zip'
    //     : '/data/starcoin-framework.zip';
    const starcoinFrameworkURL = '/data/starcoin-framework.zip';
    await this.git.download(
      starcoinFrameworkURL,
      '/workspace/starcoin-framework',
    );

    // download starcoin framework

    this.wasmfs.fs.mkdirpSync('/workspace/freepai-plugin/sources');
    // const freepaiPluginURL =
    //   process.env.NODE_ENV === 'production'
    //     ? '/dapps/data/freepai-plugin.zip'
    //     : '/data/freepai-plugin.zip';
    const freepaiPluginURL = '/data/freepai-plugin.zip';
    await this.git.download(freepaiPluginURL, '/workspace/freepai-plugin');

    // render DAO package
    this.renderDAOPackage('/workspace/my-dao', cfg);

    const mp = new MovePackage(this.wasmfs, {
      packagePath: '/workspace/my-dao',
      test: false,
      alias: new Map([
        ['StarcoinFramework', '/workspace/starcoin-framework'],
        ['FreePlugin', '/workspace/freepai-plugin'],
      ]),
      initFunction: `${cfg.address}::${cfg.name}::initialize`,
    });

    await mp.build();
    const blobBuf = this.wasmfs.fs.readFileSync(
      '/workspace/my-dao/target/starcoin/release/package.blob',
    );
    return blobBuf;
  }

  renderDAOPackage(destPath, cfg) {
    this.wasmfs.fs.mkdirpSync(destPath);

    window.console.info(
      `Token Address: ${cfg.address}::${cfg.name}::${cfg.name}`,
    );

    const moveTomlPath = `${destPath}/Move.toml`;
    const moveTomlContent = MoveTomlTpl(cfg.name, cfg.address);
    this.wasmfs.fs.writeFileSync(moveTomlPath, moveTomlContent);
    window.console.info(moveTomlPath);
    window.console.info(moveTomlContent);
    window.console.info();

    const sourcesDir = `${destPath}/sources`;
    this.wasmfs.fs.mkdirpSync(sourcesDir);
    const myTokenPath = `${sourcesDir}/MyDAO.move`;
    const myTokenContent = MyDAOSourceTpl(
      cfg.address,
      cfg.name,
      cfg.description,
      cfg.longDescription,
      cfg.purpose,
      cfg.tags,
      cfg.links,

      cfg.proposalConfig.voting_delay,
      cfg.proposalConfig.voting_period,
      cfg.proposalConfig.voting_quorum_rate,
      cfg.proposalConfig.min_action_delay,
      cfg.proposalConfig.min_proposal_deposit,
    );
    this.wasmfs.fs.writeFileSync(myTokenPath, myTokenContent);
    window.console.info(myTokenPath);
    window.console.info(myTokenContent);
    window.console.info();
  }

  async listDaos() {
    return await listDaos();
  }

  async getDao(daoId) {
    return await getDaoDetail(daoId);
  }
}

export { DaoService };
