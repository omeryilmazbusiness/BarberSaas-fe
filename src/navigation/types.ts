import {
  AuthRoute,
  CustomerRoute,
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

export type CustomerStackParamList = {
  [CustomerRoute.Login]: { shopSlug: string };
  [CustomerRoute.Services]: { shopSlug: string };
  [CustomerRoute.Schedule]: { shopSlug: string; serviceId: string };
  [CustomerRoute.Success]: {
    shopSlug: string;
    appointmentId: string;
    startsAt: string;
    serviceName: string;
  };
};

export type RootStackParamList = {
  [StackRoute.AdminLogin]: undefined;
  [StackRoute.ManagerLogin]: { shopSlug: string };
  [StackRoute.Customer]: {
    shopSlug: string;
    screen?: keyof CustomerStackParamList;
    params?: CustomerStackParamList[keyof CustomerStackParamList];
  };
  [StackRoute.Auth]: undefined;
  [StackRoute.Shop]: undefined;
  [StackRoute.CreateAppointment]: undefined;
  [StackRoute.CreateStaff]: undefined;
  [StackRoute.CreateService]: undefined;
  [StackRoute.CreateUser]: undefined;
};
