import { logout } from  '../../../user/src/client';
import { authenticateAccessToken } from '../middleware/authenticate';

// tslint:disable-next-line:export-name
export default (router) => {
  router.post(
    '/logout',
    authenticateAccessToken,
    async (key, _params, _body, req) => await logout(key, req.user.id));
};
