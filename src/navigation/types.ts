import {
  AuthRoute,
  ShopTabRoute,
  StackRoute,
} from '../shared/constants/routes';

export type AuthStackParamList = {
  [AuthRoute.Login]: undefined;
  [AuthRoute.SignupShop]: undefined;
};

export type ShopTabParamList = {
  [ShopTabRoute.Home]: undefined;
  [ShopTabRoute.Appointments]: undefined;
  [ShopTabRoute.Staff]: undefined;
  [ShopTabRoute.Services]: undefined;
  [ShopTabRoute.Users]: undefined;
};

export type RootStackParamList = {
  [StackRoute.Auth]: undefined;
  [StackRoute.Shop]: undefined;
  [StackRoute.CreateAppointment]: undefined;
  [StackRoute.CreateStaff]: undefined;
  [StackRoute.CreateService]: undefined;
  [StackRoute.CreateUser]: undefined;
};
