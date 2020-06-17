const express = require("express");
const morgan = require("morgan");
const expresshbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const validator = require('express-validator');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('passport');
require('./lib/passport');

const {database} = require('./keys');

//Inicialização
const app = express();

//Configurações
app.set("port", process.env.PORT || 3000);
app.set('views', path.join(__dirname, '/views'));
app.engine('.hbs', expresshbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

//Middleawares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(session({
    secret: 'mycrudmysql',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(validator());


//Variáveis Globais
app.use((req, res, next) => {
    app.locals.sucess = req.flash('sucess');
    app.locals.message = req.flash('message');
    app.locals.user = req.user;
    next();
})

//Rotas
app.use(require('./routes/index'));
app.use(require('./routes/authentication'));
app.use('/links', require('./routes/links'));


//Public
app.use(express.static(path.join(__dirname, 'public')));

//Startando o servidor
app.listen(app.get('port'), () => {
    console.log("Servidor rodando na porta: ", app.get('port'));
})