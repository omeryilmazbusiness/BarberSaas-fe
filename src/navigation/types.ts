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
  [CustomerRoute.Login]: undefined;
  [CustomerRoute.Services]: undefined;
  [CustomerRoute.Schedule]: { serviceIds: string };
  [CustomerRoute.Success]: {
    appointmentId: string;
    startsAt: string;
    serviceName: string;
  };
  [CustomerRoute.Profile]: undefined;
};

export type RootStackParamList = {
  [StackRoute.ShopDirectory]: undefined;
  [StackRoute.AdminLogin]: undefined;
  [StackRoute.Admin]: undefined;
  [StackRoute.ManagerLogin]: { shopSlug: string };
  [StackRoute.Customer]: {
    shopSlug: string;
    screen?: keyof CustomerStackParamList;
    params?: CustomerStackParamList[keyof CustomerStackParamList];
  };
  [StackRoute.Auth]: undefined;
  [StackRoute.Shop]: undefined;
  [StackRoute.CreateAppointment]: undefined;
  [StackRoute.AppointmentDetail]: { appointmentId: string };
  [StackRoute.CreateStaff]: undefined;
  [StackRoute.CreateService]: undefined;
  [StackRoute.CreateUser]: undefined;
  [StackRoute.ShopSettings]: undefined;
  [StackRoute.ShopSetup]: undefined;
};
