var _ = require('lodash')

function TestSuite(name) {
    var results = []
    return {
        test: function (name, test) {
            try {
                test()
                results.push({ name: name, status: 'success', error: false })
            }
            catch(e) {
                results.push({ name: name, status: 'failure', error: e })
            }
        },
        assertEqual: function (a, b) {
            if(!_.isEqual(a, b))
                throw new Error(JSON.stringify(a) + ' != ' + JSON.stringify(b))
        },
        ignore: {
            test: function (name) {
                results.push({ name: name, status: 'ignored', error: false })
            },
            assertEqual: function () {}
        },
        report: function () {
            if(typeof document == 'object') {
                var divs = results.map(function (e){
                    var details = e.error ? '<div class=details>'+e.error+'</div>' : ''
                    return '<div class='+e.status+'>'+e.name+'</div>' + details
                })
                var h1 = '<h1>' + name + '</h1>'
                document.getElementById('testreport').innerHTML = h1 + divs.join('')
            }
            else {
                var failures = results.filter(e => e.status == 'failure')
                console.log(failures.map(e => e.name + '\n   ' + e.error).join('\n'))
                if(failures.length)
                    throw new Error(failures.length + ' test failures')
            }
        }
    }
}

module.exports = TestSuite