import { Model } from './model';
import type { DateType } from './model';

export enum Role {
  Admin = 'admin',
  User = 'user',
}

export type DefaultUserData = {
  role: Role;
};

export type UserType = {
  id: number;
  email: string;
  nickname: string;
  password: string;
  role: Role;
};

const defaultUserData: DefaultUserData = {
  role: Role.User,
};

export class UserModel extends Model {
  static tableName = 'users';

  public static async create<Payload>(data: Payload): Promise<UserType & DateType> {
    return super.insert<Payload & DefaultUserData, UserType>({
      ...data,
      ...defaultUserData,
    });
  }

  public static findByEmail(email: string): Promise<UserType> {
    return this.findBy<
      {
        email: string;
      },
      UserType
    >({ email });
  }

  public static findByNickname(nickname: string): Promise<UserType> {
    return this.findBy<
      {
        nickname: string;
      },
      UserType
    >({ nickname });
  }
}
