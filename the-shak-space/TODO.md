# TODO - Remove Register feature

- [ ] Update `src/App.jsx` to remove `/register` route and any RegisterPage imports/usages.
- [ ] Update `src/pages/LoginPage.jsx` to remove Register button/link and any navigation to `/register`.
- [x] Update `src/App.jsx` to remove `/register` route and any RegisterPage imports/usages.
- [x] Update `src/pages/LoginPage.jsx` to remove Register button/link and any navigation to `/register`.
- [x] Update `src/stores/useAuthStore.js` to remove `register()` if unused after cleanup.
- [x] Delete `src/pages/RegisterPage.jsx`.
- [ ] Search codebase for remaining references: `RegisterPage`, `/register`, `register(`, `navigate("/register")`, `Link to="/register"`.
- [ ] Run dev server / build checks to ensure no blank screens, route errors, or console errors.


