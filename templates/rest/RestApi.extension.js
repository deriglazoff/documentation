// https://github.com/dotnet/docfx/tree/v2.45/src/docfx.website.themes/default

function addDefinition(definition, definitions) {

  if (!definition) {
    return;
  }

  var xRefName = definition.items && definition.items['x-internal-ref-name']
    ? definition.items['x-internal-ref-name']
    : definition['x-internal-ref-name'];

  // Not complex type.
  if (!xRefName) {
    return;
  }

  // Definition already exists return.
  if (definitions.some(function (d) { return d['x-internal-ref-name'] == xRefName; })) {
    return;
  }

  // Create clone to not affect object structure used in original location
  definition = JSON.parse(JSON.stringify(definition));

  // Unify different object structure to be the same

  // Sometimes properties is under items sometimes not
  if (definition.items && definition.items.properties) {
    definition.properties = definition.items.properties;
  }

  // Sometimes ref-name is under items sometimes not
  definition['x-internal-ref-name'] = xRefName;

  // Sometimes properties are key/value pairs sometimes not
  if (definition.properties && !Array.isArray(definition.properties)) {
    definition.properties = Object.keys(definition.properties).map(function (key) {
      return {
        key: key,
        value: definition.properties[key]
      }
    });
  }
  //console.log(JSON.stringify(definition))
  // Add definition to definitions list.
  definitions.push(definition);

  // Loop through properties that refer to other definitions.
  (definition.properties || []).forEach(function (property) {
    addComplexTypeMetadata(property.value, definitions);
  });
}

function addComplexTypeMetadata(child, definitions) {
  // Add variations of x-internal-ref-name to support 
  if (child == null)
    return;

  //console.log("child " + child['x-internal-ref-name'])

  if (child && child['x-internal-ref-name']) {
    child.cTypeId = child['x-internal-ref-name'].replace(/\./g, '_');
    child.cType = child['x-internal-ref-name'].replace(/([A-Z])/g, '<wbr>$1');
  }
  if (child && child.items && child.items['x-internal-ref-name']) {
    child.cTypeId = child.items['x-internal-ref-name'].replace(/\./g, '_');
    child.cType = child.items['x-internal-ref-name'].replace(/([A-Z])/g, '<wbr>$1');
    child.cTypeIsArray = true;
  }

  addDefinition(child, definitions);
}

/**
 * This method will be called at the start of exports.transform in RestApi.html.primary.js
 */
exports.preTransform = function (model) {
  console.log("Start")
  return model;
}

/**
 * This method will be called at the end of exports.transform in RestApi.html.primary.js
 */
exports.postTransform = function (model) {
  model.definitions = [];
  model.tags.forEach(function (tag) {
    tag.children.forEach(function (child) {
      // Ломало раньше из за undefined  console.log("Item: " + JSON.stringify(child))
      try {
        if (child.parameters !== undefined) {

          child.parameters.forEach(function (parameter) {
            addComplexTypeMetadata(parameter.schema, model.definitions);
          });
        }
      } catch (e) {
        console.error(e);
      }
      child.responses.forEach(function (response) { addComplexTypeMetadata(response.schema, model.definitions); });
    });
  });
  model.children.forEach(function (child) {
    child.parameters.forEach(function (parameter) { addComplexTypeMetadata(parameter.schema, model.definitions); });
    child.responses.forEach(function (response) { addComplexTypeMetadata(response.schema, model.definitions); });
  });
  return model;
}