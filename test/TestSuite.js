function TestSuite(suiteName, reportSelector) {
	var isBrowser = typeof document == 'object'
	var results = []
	var tests = {}
	var suite = { tests, results, test, node_test, ignore_test, report }
	TestSuite.suites = TestSuite.suites || {}
	TestSuite.suites[suiteName] = suite

	function test(name, test) {
		suite.tests[name] = test
		try {
			test()
			results.push({ name: name, status: 'success', error: false })
		}
		catch(e) {
			results.push({ name: name, status: 'failure', error: e })
		}
	}

	function node_test(name, fn) {
		if (isBrowser) ignore_test(name, fn)
		else test(name, fn)
	}
	
	function ignore_test(name, test) {
		suite.tests[name] = test
		results.push({ name: name, status: 'ignored', error: false })
	}

	function report() {
		if(isBrowser) report_html()
		else report_console()
	}

	function report_html() {
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

	function report_console() {
		var failures = results.filter(e => e.status == 'failure')
		failures.forEach(function (e){
			console.log('\x1b[31m%s\x1b[0m', e.name)
			console.log('   ' + e.error)
		})
		if(failures.length)
			throw new Error(failures.length + ' test failures')
	}

	return suite
}

TestSuite.run = function (suite, test) {
	try { TestSuite.suites[suite].tests[test]() }
	catch(e) { console.log(name + ' failed ', e) }
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

module.exports = TestSuite
