'use strict';

const _ = require('lodash');

const removeInnerReference = (values) => {
  // Upgrade: fields referenced directly no longer need "innerDocument: !"
  if (values.innerDocument === '!') {
    delete values.innerDocument;
  }
}

const changeKeysProperty = (keys) => {
  // Upgrade: keys require $push now and innerDocument is always an internal reference
  keys.innerDocument = '!values';
  keys.$push = true;
  keys.mappings = {'$value': 'id'};
  delete keys.value;
}

function replaceValueReference(values) {
  // Upgrade: Inner references of '$value' are now referred to using '!'
  _.each(values, function(value, key) {
    // Replace $value in mapping properties as well 
    if (key === 'mappings') {
      _.each(values.mappings, function(value, key) {
        // Recursion (max depth = 1)
        replaceValueReference(values.mappings, value, key);
      });
    }
    else {
      if (value.toString().includes('$value')) {
        values[key] = value.replace('$value', '!')
      }
    }
  });

}

const upgradeKeyValueProperties = (obj) => {

  changeKeysProperty(obj.keys);

  if (_.isArray(obj.values)) {
    obj.values.forEach(element => {
      removeInnerReference(element);
      replaceValueReference(element);
    });
  }
  else {
    removeInnerReference(obj.values);
    replaceValueReference(obj.values);
  }
}

// Upgrading mapping file
const upgradeMappingFile = (oldMapping) => {
for (let property in oldMapping) {
  if (_.isObject(oldMapping[property])) {
    if ('values' in oldMapping[property] && 'keys' in oldMapping[property]) {
        upgradeKeyValueProperties(oldMapping[property]);
      }
    }
  }
  return oldMapping;
}

module.exports = upgradeMappingFile;