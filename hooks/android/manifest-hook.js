//Define 'use strict' directive to the roojai sightcall plugin to execute in strict mode.
'use strict';
const fs = require('fs');
const xml2js = require('xml2js');

module.exports = function (context) {
  const parseString = xml2js.parseString;
  const builder = new xml2js.Builder();
  let timeout = 3600, resourcesRoot, manifestRoot;

  const stringXmlPath = context.opts.projectRoot + "\\platforms\\android\\app\\src\\main\\res\\values\\strings.xml";
  const androidStringXml = fs.readFileSync(stringXmlPath).toString();
  if (androidStringXml) {
    parseString(androidStringXml, async(err, resources) => {
      if (err) return console.error(err);
      resourcesRoot = resources["resources"];
      var existingIntegerAr =
        resourcesRoot["integer"] && resourcesRoot["integer"].length > 0
          ? resourcesRoot["integer"]
          : [];
      if(existingIntegerAr.length>0){
        await existingIntegerAr.forEach(async function (obj) {
          if(obj.$["name"]=="universal_acd_request_timeout_in_seconds"){
            obj["_"]= await timeout;
          }
        });
      }else{
        var universalCustom = {
          _: timeout,
          $: { name: "universal_acd_request_timeout_in_seconds" },
        };
        existingIntegerAr.push(universalCustom);
      }
      resourcesRoot["integer"] = existingIntegerAr;
      fs.writeFileSync(stringXmlPath, builder.buildObject(resources));
    });
  }

  const manifestPath = context.opts.projectRoot + '\\platforms\\android\\app\\src\\main\\AndroidManifest.xml';
  const androidManifest = fs.readFileSync(manifestPath).toString();
  
  // console.log("@@@androidManifest",androidManifest);
  if (androidManifest) {
    parseString(androidManifest, (err, manifest) => {
      if (err) return console.error(err);
      manifestRoot = manifest['manifest'];
      manifestRoot.$['xmlns:tools'] = 'http://schemas.android.com/tools';
      var application = manifestRoot['application'];
      
      application[0].$['tools:replace'] = ["android:allowBackup","android:usesCleartextTraffic"];

      application[0].$['android:allowBackup'] = "false";
      
      // application[0].$['tools:replace'] = "android:usesCleartextTraffic";
      
      console.log("@@@application",application);
      fs.writeFileSync(manifestPath, builder.buildObject(manifest));
    });
  }

};