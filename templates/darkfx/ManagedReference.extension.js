// https://github.com/dotnet/docfx/issues/274
// https://gist.github.com/wcoder/1ffaae564978d048357c32652e3f84c7
// TODO Group Namespaces separator "."

exports.preTransform = function (model) {
  transformItem(model, 1);

  return model;

  function transformItem(item, level) {

    try {

      //console.log("Item: " + JSON.stringify(item));

      var isAssembly = item.parent == null && item.assemblies.indexOf(item.uid) !== -1;

      //console.log("isAssembly " + isAssembly);

      //console.log("_shared " + item.__global._shared);

      var shared = item.__global._shared[item._tocKey];

      //TODO тут всегда return...
      if (shared === null || shared === undefined)
        return;

      console.log("shared " + shared);

      var items = shared.items;
      var temp_items = [];

      var rootNamespaces = getAllRootNamespaces(items);

      console.log("rootNamespaces " + rootNamespaces);

      var assemblies = getCommonParts(rootNamespaces);

      console.log(assemblies);

      temp_items = getItemsForAssemblies(assemblies);

      //console.log(temp_items);

      //log += JSON.stringify(temp_items) + "\n";

      ////log += JSON.stringify(item.assemblies) + "\n";

      //for (var i = 0; i < temp_items.length; i++) {
      //  // TODO YP: aggregate items by assemblies
      //}

      //shared.items = temp_items;


      //log += JSON.stringify(model) + "\n";
      //log += "====================================================";
    }
    catch (exception_var_2) {
      console.error(exception_var_2);
    }

    finally {
      console.log("vay");
    }
  }

  function findAssemblyWithName(items, name) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].name === name) {
        return i;
      }
    }
    return -1;
  }

  function getItemsForAssemblies(assemblies) {
    var tmp = [];
    for (var i = 0; i < assemblies.length; i++) {
      var assemblyName = assemblies[i];
      tmp.push({
        "name": assemblyName,
        "href": assemblyName + ".html",
        "topicHref": assemblyName + ".html",
        "topicUid": assemblyName,
        "items": []
      });
    }
    return tmp;
  }

  function getAllRootNamespaces(items) {
    var tmp = [];
    for (var i = 0; i < items.length; i++) {
      tmp.push(items[i].name);
    }
    return tmp;
  }

  function getCommonParts(namespaces) {
    var commonParts = [];
    var xtoolkit = "Softeq.XToolkit.";

    for (var i = 0; i < namespaces.length; i++) {
      var cuttedName = namespaces[i].replace(xtoolkit, "");
      var nameParts = cuttedName.split(".");

      if (nameParts.length === 1) {
        commonParts.push(namespaces[i]);
      } else {
        aggregateForPlatform("iOS");
        aggregateForPlatform("Droid");
      }
    }

    function aggregateForPlatform(platform) {
      var platformIndex = nameParts.indexOf(platform);
      if (platformIndex === -1) {
        return;
      }
      var platformNamespace = xtoolkit + nameParts[platformIndex - 1] + "." + platform;
      if (commonParts.indexOf(platformNamespace) === -1) {
        commonParts.push(platformNamespace);
      }
    }

    return commonParts;
  }
}