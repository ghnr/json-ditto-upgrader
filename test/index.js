'use strict';

const assert = require('assert');
const ditto_v2 = require('json-ditto-v2');
const _ = require('lodash');

let dittoUpgrader = require('../index')
let data = require('./data');

describe('ditto upgrader', () => {
  _.each(data, function(serviceObj, testService) {
    let sample = serviceObj.sample;
    let oldMapping = serviceObj.oldMapping;
    let upgradedMapping = dittoUpgrader.dittoUpgrader(oldMapping);
    let expectedResult = serviceObj.expectedResult;

    new ditto_v2(upgradedMapping).unify(sample).then((result) => {
      for (let key in expectedResult) {
        if (key === "id" || key === "createdAt") {
          continue;
        }
        it(`${testService}: should have the same ${key} value as the expected result`, () => {
          assert.deepStrictEqual(result[key], expectedResult[key])
        });  
      }    
    });
  });
  it('', function () {});
});