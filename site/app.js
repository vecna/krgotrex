const express = require('express'),
      session = require('express-session'),
      logger = require('morgan'),
      sassMiddleware = require('node-sass-middleware'),
      path = require('path'),
      i18n = require("i18n"),
      _ = require('lodash');

// Routes
    const controller = require('./js/controllers/index'),
      app = express();

// Internationalisation
//
// Based on this implementation:
// https://markocen.github.io/blog/i18n-for-node-application.html
// with this fix:
// https://github.com/mashpie/i18n-node/issues/238#issuecomment-220769255
const supportedLanguages = ['de', 'en'];
const defaultLocale = 'de';
const defaultPage = 'map';

app.use(
  session({
    secret: "i18n_locale",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(sassMiddleware({
  src:  path.join(__dirname, 'styles'),
  dest: path.join(__dirname, 'assets'),
  debug: true,
  prefix: '/assets',
  outputStyle: 'compressed',
  sourceMap: true
}));

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/js', express.static(path.join(__dirname, 'js')));

i18n.configure({
  locales: supportedLanguages,
  defaultLocale,
  directory: __dirname + '/locales',
  register: global
});
// default: using 'accept-language' header to guess language settings
app.use(i18n.init);

app.get('/:lang/:page/:option?', (req, res) => {
  const l = supportedLanguages.indexOf(req.params.lang) === -1 ? defaultLocale : req.params.lang;
  return controller.renderLocalizedPage(res, i18n, l, req.params.page, req.params.option);
});
app.get('/:lang/', (req, res) => {
  const l = supportedLanguages.indexOf(req.params.lang) === -1 ? defaultLocale : req.params.lang;
  return controller.renderLocalizedPage(res, i18n, l, defaultPage, null);
});
app.get('/', (req, res) => {
  return controller.renderLocalizedPage(res, i18n, defaultLocale, defaultPage, null);
});

module.exports = app;
