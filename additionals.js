// -- analytics ---------------------

try {
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-50041909-1', 'nomnoml.com');
  ga('set', 'anonymizeIp', true);
  ga('send', 'pageview');
} catch(e) {}

new Image().src='https://nullitics.com/null.gif'+
  '?u='+encodeURI(location.href)+
  '&r='+encodeURI(document.referrer)+
  '&d='+screen.width

// -- daily tip ---------------------

var { DailyTip } = WebApp

{
  const el = React.createElement
  const root = document.querySelector('[daily-tip]')
  const tip = el(
    DailyTip,
    { id: 'parser-v2', sticky: true },
    el(
      'p',
      {},
      'I am developing a new parser with more features. Would you like to contribute to this project? Test the new version and give me feedback!'
    ),
    el(
      'a',
      { href: 'https://stage.nomnoml.com/' },
      'Take me to the new version!'
    )
  )
  ReactDOM.render(tip, root)
}
