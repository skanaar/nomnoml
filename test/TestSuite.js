function TestSuite(suiteName, reportSelector) {
	var isBrowser = typeof document == 'object'
	function log(text) { console.log(text) }
	function logError(msg) { console.log('\x1b[31m%s\x1b[0m', msg) }
	var results = []
	var tests = {}
	var suite = { tests, results, test, node_test, ignore_test, report }

	function test(name, test) {
		try {
			suite.tests[name] = test
			test()
			results.push({ name: name, status: 'success', error: false })
		}
		catch(e) {
			results.push({ name: name, status: 'failure', error: e })
		}
	}

	function node_test(name, fn) {
		if (isBrowser) ignore_test(name)
		else test(name, fn)
	}
	
	function ignore_test(name) {
		results.push({ name: name, status: 'ignored', error: false })
	}

	function report() {
		function esc(str) {
			return str.toString()
				.split('&').join('&amp;')
				.split('<').join('&lt;')
				.split('>').join('&gt;')
		}
		if(isBrowser) {
			function renderResult(e){
				var rerun = "TestSuite.run('"+suiteName+"','"+e.name+"')"
				var div = `<div class=${e.status} onclick="${rerun}">${esc(e.name)}</div>`
				var details = e.error ? '<div class=details>'+esc(e.error)+'</div>' : ''
				return div + details
			}
			var report = `
			<details open class=testsuite>
				<summary>${esc(suiteName)}</summary>
				${results.map(renderResult).join('')}
			</details>`
			if (reportSelector)
				document.querySelector(reportSelector).innerHTML = report
			else {
				var host = document.createElement('div')
				host.innerHTML = report
				document.body.appendChild(host)
			}
		}
		else {
			var failures = results.filter(e => e.status == 'failure')
			failures.forEach(function (e){
				logError(e.name)
				log('   ' + e.error)
			})
			if(failures.length)
				throw new Error(failures.length + ' test failures')
		}
	}

	TestSuite.suites = TestSuite.suites || {}
	TestSuite.suites[suiteName] = suite
	return suite
}

TestSuite.run = function (suite, test) {
	try { TestSuite.suites[suite].tests[test]() }
	catch(e) {}
}

TestSuite.isEqual = function (a, b) {
	switch (typeof(a)) {
		case 'undefined':
		case 'boolean':
		case 'number':
		case 'string':
		case 'symbol':
			return a === b
		case 'function':
			return typeof(a) === typeof(b)
		case 'object':
			if (a === null || b === null || b === undefined) {
				return a === b
			}
			for(var key in a) {
				if (a.hasOwnProperty(key)) {
					if (!TestSuite.isEqual(a[key], b[key]))
						return false
				}
			}
			for(var bKey in b) {
				if (b.hasOwnProperty(bKey)) {
					if (!TestSuite.isEqual(a[bKey], b[bKey]))
						return false
				}
			}
			return true
	}
}

TestSuite.assert = function (a, operator, b) {
	if (operator == '='){
		if(!TestSuite.isEqual(a, b))
			throw new Error(JSON.stringify(a) + ' ≠ ' + JSON.stringify(b))
	} else if (operator == '>') {
		if(a <= b)
			throw new Error(JSON.stringify(a) + ' ≯ ' + JSON.stringify(b))
	} else if (operator == '<') {
		if(a >= b)
			throw new Error(JSON.stringify(a) + ' ≮ ' + JSON.stringify(b))
	} else if (operator == 'includes') {
		if(!a.includes(b))
			throw new Error(JSON.stringify(a) + ' does not include ' + JSON.stringify(b))
	}
	else
		throw new Error('bad assert operator ', operator)
}

TestSuite.assertEqual = function (a, b) {
	if(!TestSuite.isEqual(a, b))
		throw new Error(JSON.stringify(a) + ' != ' + JSON.stringify(b))
}

TestSuite.assertThrows = function (action) {
	var didThrow = false
	try { action() }
	catch(e) { didThrow = true }
	if(!didThrow)
		throw new Error('Function did not throw error')
}


module.exports = TestSuite
