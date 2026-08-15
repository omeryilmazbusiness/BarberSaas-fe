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
  AdminLogin: 'AdminLogin',
  ManagerLogin: 'ManagerLogin',
  Customer: 'Customer',
  Auth: 'Auth',
  Shop: 'Shop',
  CreateAppointment: 'CreateAppointment',
  CreateStaff: 'CreateStaff',
  CreateService: 'CreateService',
  CreateUser: 'CreateUser',
} as const;

export const CustomerRoute = {
  Login: 'CustomerLogin',
  Services: 'CustomerServices',
  Schedule: 'CustomerSchedule',
  Success: 'CustomerSuccess',
  Profile: 'CustomerProfile',
} as const;

export type AuthRoute = (typeof AuthRoute)[keyof typeof AuthRoute];
export type ShopTabRoute = (typeof ShopTabRoute)[keyof typeof ShopTabRoute];
export type StackRoute = (typeof StackRoute)[keyof typeof StackRoute];
export type CustomerRoute = (typeof CustomerRoute)[keyof typeof CustomerRoute];
