const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const healthRoute = require('./health.route');
const docsRoute = require('./docs.route');
const expenseRoute = require('./expense.route');
const friendsRoute = require('./friends.route');
const groupsRoute = require('./group.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/expense',
    route: expenseRoute,
  },
  {
    path: '/friend',
    route: friendsRoute
  },  
  {
    path: '/group',
    route: groupsRoute,
  },
  {
    path: '/health',
    route: healthRoute,
  },
  
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
