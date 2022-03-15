function TestSuite(suiteName, reportSelector) {
	var isBrowser = typeof document == 'object'
	var suite = { tests:{}, promises:[], results:[], test, node_test, ignore_test, report }
	TestSuite.suites = TestSuite.suites || {}
	TestSuite.suites[suiteName] = suite

	function test(name, test) {
		suite.tests[name] = test
		suite.promises.push(TestSuite.evaluateTestAsync(name, test))
	}

	function node_test(name, fn) {
		if (isBrowser) ignore_test(name, fn)
		else test(name, fn)
	}
	
	function ignore_test(name, test) {
		suite.tests[name] = test
		suite.promises.push(Promise.resolve({ name: name, status: 'ignored', error: false }))
	}

	async function report() {
		var results = await Promise.all(suite.promises)
		suite.results = results
		if(isBrowser) report_html(results)
		else report_console(results)
	}

	function report_html(results) {
		function esc(str) {
			return str.toString()
				.split('&').join('&amp;')
				.split('<').join('&lt;')
				.split('>').join('&gt;')
		}
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

	function report_console(results) {
		if (TestSuite.verbose) {
			for (var item of results) console.log(item.status, ' ', item.name)
		}
		var failures = results.filter(e => e.status == 'failure')
		for (var failure of failures) {
			console.log('\x1b[31m%s\x1b[0m', failure.name)
			console.log('   ' + failure.error)
		}
		if(failures.length)
			throw new Error(failures.length + ' test failures')
	}

	return suite
}

TestSuite.evaluateTestAsync = function (name, test) {
	try {
		var output = test()
		if (output && 'function' == typeof output.then) {
			return output
				.then(() => ({ name: name, status: 'success' }))
				.catch((e) => ({ name: name, status: 'failure', error: e }))
		} else {
			return Promise.resolve({ name: name, status: 'success' })
		}
	}
	catch(e) {
		return Promise.resolve({ name: name, status: 'failure', error: e })
	}
}

TestSuite.run = function (suite, testname) {
	var test = TestSuite.suites[suite].tests[testname]
	TestSuite.evaluateTestAsync(testname, test).then(res => console.log(res))
}

TestSuite.isEqual = function (a, b) {
	function compare(a, b) {
		for(var k in a) {
			if (a.hasOwnProperty(k) && !TestSuite.isEqual(a[k], b[k]))
				return false
		}
		return true
	}
	switch (typeof(a)) {
		case 'undefined':
		case 'boolean':
		case 'number':
		case 'string':
		case 'symbol': return a === b
		case 'function': return typeof(a) === typeof(b)
		case 'object':
		default:
			if (a === null || b === null || b === undefined)
				return a === b
			return compare(a, b) && compare(b, a)
	}
}

TestSuite.assert = function (a, operator, b) {
	function fatal(sym) {
		throw new Error(JSON.stringify(a)+' '+sym+' '+JSON.stringify(b))
	}
	switch (operator){
		case '=': if(!TestSuite.isEqual(a, b)) fatal('≠'); break;
		case '>': if(a <= b) fatal('≯'); break;
		case '<': if(a >= b) fatal('≮'); break;
		case 'includes': if(!a.includes(b)) fatal('does not include'); break;
		case 'throws':
			var didThrow = false
			try { a() }
			catch(e) { didThrow = e instanceof b; }
			if(!didThrow)
				throw new Error('Function did not throw an ' + b)
			break;
		default: throw new Error('bad assert operator ', operator)
	}
}

TestSuite.assertEqual = function (a, b) {
	TestSuite.assert(a, '=', b)
}

TestSuite.verbose = false

module.exports = TestSuite
