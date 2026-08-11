module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth-custom/forgot-password',
      handler: 'auth-custom.forgotPassword',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/auth-custom/reset-password',
      handler: 'auth-custom.resetPassword',
      config: {
        auth: false,
      },
    },
  ],
};
