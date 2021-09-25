#!/usr/bin/env node
'use strict';
const fs = require('fs');
const xml2js = require('xml2js');

module.exports = function (context) {
  const parseString = xml2js.parseString;
  const builder = new xml2js.Builder();
  const manifestPath = context.opts.projectRoot + '\\platforms\\android\\app\\src\\main\\AndroidManifest.xml';
  const androidManifest = fs.readFileSync(manifestPath).toString();

  let manifestRoot;

  if (androidManifest) {
    parseString(androidManifest, (err, manifest) => {
      if (err) return console.error(err);

      manifestRoot = manifest['manifest'];
      // console.log("manifestRoot",manifestRoot);
      manifestRoot.$['xmlns:tools'] = 'http://schemas.android.com/tools';
      // console.log("application",manifestRoot['application']);

      var application = manifestRoot['application'];
      application[0].$['tools:replace'] = "android:usesCleartextTraffic";
      // console.log('meta-data',application[0]['meta-data']);
      fs.writeFileSync(manifestPath, builder.buildObject(manifest));
      console.log("xmlns:tools added in AndroidManifest.xml");
    });
  }
};