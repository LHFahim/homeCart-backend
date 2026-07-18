import { ControllersEnum } from '../enum/controllers.enum';

export const Routes = {
  [ControllersEnum.AdminAuth]: {
    login: 'login/email',
    registerByEmail: 'register/email',
    refreshJwtToken: 'refresh-token',
    changePassword: 'change-password',
    resetPassword: 'reset-password',
    resetPasswordSendCode: 'reset-password/send',
    verifyEmailPublic: 'verify-email/public',
  },

  [ControllersEnum.Auth]: {
    login: 'login/email',
    registerByEmail: 'register/email',
    refreshJwtToken: 'refresh-token',
  },
  [ControllersEnum.Users]: {
    findAll: '',
    findOne: ':id',
    updateOne: ':id',
    deleteOne: ':id',
  },
  [ControllersEnum.Profile]: {
    me: 'me',
  },
  [ControllersEnum.Households]: {
    create: '',
    findAll: '',
    findOne: ':id',
    updateOne: ':id',
    deleteOne: ':id',
  },
  [ControllersEnum.Carts]: {
    create: '',
    findAll: '',
    findOne: ':id',
    updateOne: ':id',
    deleteOne: ':id',
    createItem: ':id/items',
    findAllItems: ':id/items',
    findOneItem: ':id/items/:itemId',
    updateOneItem: ':id/items/:itemId',
    deleteOneItem: ':id/items/:itemId',
  },

  [ControllersEnum.Notifications]: {
    publicKey: 'public-key',
    subscribe: 'subscribe',
    unsubscribe: 'unsubscribe',
    test: 'test',
    highPriorityReminderTest: 'reminders/high-priority/test',
    highPriorityRemindersInternal: 'internal/high-priority-reminders',
  },
} as const;
