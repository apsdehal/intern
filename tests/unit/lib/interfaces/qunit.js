define([
	'intern!object',
	'intern/chai!assert',
	'intern/chai!should',
	'intern/chai!expect',
	'../../../../main!tdd',
	'../../../../main!qunit',
	'../../../../main',
	'../../../../lib/Suite',
	'../../../../lib/Test'
], function (registerSuite, assert, should, expect, tdd, QUnit, main, Suite, Test) {
	var shouldInstance = should();

	registerSuite({
		name: 'intern/lib/interfaces/qunit',

		beforeEach: function () {
			main.suites.push(
				new Suite({ name: 'qunit root suite 1'})
			);
		},

		afterEach: function () {
			main.suites.splice(0, 1);
		},

		'should have a root suite': function () {
			assert.strictEqual(main.suites.length, 1, 'There should be exactly one root suite');
			assert.instanceOf(main.suites[0], Suite, 'Root suite 1 should be a suite instance');
			assert.strictEqual(main.suites[0].name, 'qunit root suite 1', 'Root suite 1 should be the one named "qunit root suite 1"');
		},

		'module': {
			'should create a subsuite': function () {
				QUnit.module('qunit suite 1');
				assert.strictEqual(main.suites[0].tests[0].name, 'qunit suite 1', 'First registered module should have name "qunit suite 1');
				assert.strictEqual(main.suites[0].tests[0].parent.name, 'qunit root suite 1', 'First registered module\'s parent name should be "qunit root suite 1"');
			},

			'should add setup and teardown methods': function () {
				QUnit.module('qunit suite 1', {
					setup: function () {},
					teardown: function () {}
				});

				assert.typeOf(main.suites[0].tests[0].afterEach, 'Function', 'afterEach of the created suite should have type "Function"');
				assert.typeOf(main.suites[0].tests[0].beforeEach, 'Function', 'beforeEach of the created suite should have type "Function"');
			},

			'should have a working lifecycle methods': function () {
				var moduleParams = {},
					results = [],
					expectedResults = ['setup', 'teardown'],
					lifecycleMethods = ['beforeEach', 'afterEach']

				expectedResults.forEach(function (method) {
					moduleParams[method] = function () {
						results.push(method);
					};
				});

				QUnit.module('qunit suite 1', moduleParams);

				lifecycleMethods.forEach(function (method) {
					main.suites[0].tests[0][method]();
				});

				assert.deepEqual(results, expectedResults, 'QUnit interface methods should get called when ' + 'corrosponding Suite methods all called');
			}
		},

		'asserts': {
			'should have a working expect': function () {
				var results = [];

				QUnit.module('qunit suite 1');

				QUnit.test('qunit test 1', function (assertParam) {
					assertParam.expect(1);
					results.push(assertParam._expectedAssertions);
					results.push(assertParam.expect());
				});

				main.suites[0].run().then(function () {
					assert.strictEqual(results[0], 1, 'Base assert should have "1" expected assertions');
					assert.strictEqual(results[1], 1, 'Expect should return number of expected assertions if 0 or > 1 argument(s) is(are) passed');
				});
			},

			'should have a working push': function () {
				var results = [];

				QUnit.module('qunit suite 1');

				QUnit.test('qunit test 1', function (assertParam) {
					var actual = 1;
					var expected = 1;

					assertParam.push( actual === expected, actual, expected, '"actual" should be equal to "expected"');
					results.push(assertParam._numAssertions);

					actual = 2;
					expect(assertParam.push( actual === expected, actual, expected, '"actual" should be equal to "expected"')).to.throw(new QUnit.assert.AssertionError('"actual" should be equal to "expected"', { actual: actual, expected: expected }));
				});

				main.suites[0].run().then(function () {
					assert.strictEqual(results[0], 1, 'Base assert should have "1" assertion');
				});
			}
		},

		'test': {
			'should create and push test': function () {
				QUnit.module('qunit suite 1');

				QUnit.test('qunit test 1');

				assert.strictEqual(main.suites[0].tests[0].tests[0].name, 'qunit test 1', 'Module should register a test named "qunit test 1"');
				assert.strictEqual(main.suites[0].tests[0].tests[0].parent.name, 'qunit suite 1', 'Test should be registered in module named "qunit suite 1"');
			},

			'should be added to latest module': function () {
				QUnit.module('qunit suite 1');
				QUnit.module('qunit suite 2');

				QUnit.test('qunit test 1');

				shouldInstance.not.exist(main.suites[0].tests[0].tests[0], 'There should not be any tests registered in module named "qunit suite 1"');
				shouldInstance.exist(main.suites[0].tests[1].tests[0], 'There be a test registered in module named "qunit suite 1"');
				assert.strictEqual(main.suites[0].tests[1].tests[0].name, 'qunit test 1', 'Module 2 should register a test named "qunit test 1"');
				assert.strictEqual(main.suites[0].tests[1].tests[0].parent.name, 'qunit suite 2', 'Test should be registered under module named "qunit suite 2"');
			},

			'should call the test function': function () {
				var results = [];

				QUnit.module('qunit suite 1');

				QUnit.test('qunit test 1', function (assertParam) {
					results.push(assertParam);
				});

				assert.instanceOf(main.suites[0].tests[0].tests[0], Test, 'test 1 should be a Test Instance');

				main.suites[0].run().then(function () {
					assert.strictEqual(QUnit.assert.isPrototypeOf(results[0]), true, 'Assert passed to QUnit test should be instance of QUnit.assert');
				});
			}
		}

	});

});
