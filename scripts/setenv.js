const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const path = require('path');

const envPath = path.resolve(__dirname, '../config/env.ts');
const appJsonPath = path.resolve(__dirname, '../app.json');
const stringsXmlPath = path.resolve(__dirname, '../android/app/src/main/res/values/strings.xml');
const buildGradlePath = path.resolve(__dirname, '../android/app/build.gradle');
const infoPlistPath = path.resolve(__dirname, '../ios/template_s2t/Info.plist');
const pbxprojPath = path.resolve(__dirname, '../ios/template_s2t.xcodeproj/project.pbxproj');

function stringConfig({key, configs, config}) {
  const isPick = key.includes('NAME') ? key : undefined;
  const union = isPick ? configs.map(item => `'${item[key]}'`).join(' | ') : '';
  return `export const ${key} = '${config[key]}' as ${isPick ? union : typeof config[key]};\n`;
}

function setAppName(appName) {
  // app.json
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  appJson.displayName = appName;
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

  // android strings.xml
  let strings = fs.readFileSync(stringsXmlPath, 'utf8');
  strings = strings.replace(/<string name="app_name">.*<\/string>/, `<string name="app_name">${appName}</string>`);
  fs.writeFileSync(stringsXmlPath, strings);

  // iOS Info.plist
  let plist = fs.readFileSync(infoPlistPath, 'utf8');
  plist = plist.replace(/(<key>CFBundleDisplayName<\/key>\s*<string>).*(<\/string>)/, `$1${appName}$2`);
  fs.writeFileSync(infoPlistPath, plist);
}

function setAppId(appId) {
  // android build.gradle
  let gradle = fs.readFileSync(buildGradlePath, 'utf8');
  gradle = gradle.replace(/(applicationId\s+)"[^"]+"/, `$1"${appId}"`);
  fs.writeFileSync(buildGradlePath, gradle);

  // iOS project.pbxproj — replace only literal (non-variable) bundle ID entries
  let pbxproj = fs.readFileSync(pbxprojPath, 'utf8');
  pbxproj = pbxproj.replace(
    /(PRODUCT_BUNDLE_IDENTIFIER = )(?!"[^$]*\$\()([^;]+)(;)/g,
    (match, prefix, value, suffix) => {
      // Skip entries that use variable substitution
      if (value.includes('$(')) {
        return match;
      }
      return `${prefix}${appId}${suffix}`;
    },
  );
  fs.writeFileSync(pbxprojPath, pbxproj);
}

fs.readFile(path.resolve(__dirname, '../config/envkey.json'), 'utf8', function (err, data) {
  if (err) {
    throw err;
  }
  /**
   * @type {import('../config/envkey.json')}
   */
  const configs = JSON.parse(data);
  const {name} = args;
  configs.forEach(config => {
    if (config.NAME === name) {
      // Write env.ts
      const fd = fs.openSync(envPath, 'w');
      Object.keys(config).forEach(key => {
        fs.writeSync(fd, stringConfig({config, configs, key}));
      });
      fs.closeSync(fd);

      // Update native app name and app ID
      if (config.APP_NAME) {
        setAppName(config.APP_NAME);
      }
      if (config.APP_ID) {
        setAppId(config.APP_ID);
      }
    }
  });
});
