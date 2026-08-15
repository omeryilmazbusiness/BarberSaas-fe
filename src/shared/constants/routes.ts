export const AuthRoute = {
  Login: 'Login',
  SignupShop: 'SignupShop',
} as const;

export const ShopTabRoute = {
  Home: 'Home',
  Appointments: 'Appointments',
  Staff: 'Staff',
  Services: 'Services',
  Users: 'Users',
} as const;

export const StackRoute = {
  Auth: 'Auth',
  Shop: 'Shop',
  CreateAppointment: 'CreateAppointment',
  CreateStaff: 'CreateStaff',
  CreateService: 'CreateService',
  CreateUser: 'CreateUser',
} as const;

export type AuthRoute = (typeof AuthRoute)[keyof typeof AuthRoute];
export type ShopTabRoute = (typeof ShopTabRoute)[keyof typeof ShopTabRoute];
export type StackRoute = (typeof StackRoute)[keyof typeof StackRoute];
