const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const POST_INSTALL_BLOCK = `  post_install do |installer|
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        if target.name.start_with?('RNFB')
          config.build_settings['CLANG_ENABLE_MODULES'] = 'NO'
        end
      end
    end
    react_native_post_install(`;

const ORIGINAL_POST_INSTALL = `  post_install do |installer|
    react_native_post_install(`;

module.exports = function withFirebasePodfileFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf8');

      if (podfile.includes("CLANG_ENABLE_MODULES'] = 'NO'")) {
        return cfg;
      }

      if (podfile.includes(ORIGINAL_POST_INSTALL)) {
        podfile = podfile.replace(ORIGINAL_POST_INSTALL, POST_INSTALL_BLOCK);
        fs.writeFileSync(podfilePath, podfile);
      }

      return cfg;
    },
  ]);
};
