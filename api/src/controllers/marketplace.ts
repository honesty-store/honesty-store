import { authenticateAccessToken } from '../middleware/authenticate';
import { mailStoreAgent } from './support';

export default (router) => {
  router.post(
    '/marketplace',
    authenticateAccessToken,
    async (
      key,
      _params,
      { item: { name, qualifier, totalPaid, quantity }, storeCode },
      { user }
    ) => {
      const subject = 'Marketplace Request';

      const adminUrl = `https://honesty.store/admin/listing/${storeCode}`;

      const message =
`A marketplace request has been made by ${user.emailAddress}.
If you're happy, you can list the item at ${adminUrl}.

Here's what the submitted:
Name: ${name}
Qualifier: ${qualifier || ''}
Total paid (£): ${totalPaid}
Quantity: ${quantity}
`;

      return await mailStoreAgent({
        key,
        replyTo: user.emailAddress,
        subject,
        message,
        storeCode
      });
    });
};
