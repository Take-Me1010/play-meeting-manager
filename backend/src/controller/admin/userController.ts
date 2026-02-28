import { UserRepository } from "../../repogitory/users";
import { type User } from "../../entity";

export class AdminUserController {
  private userRepo = new UserRepository();

  getAllUsers(): User[] {
    return this.userRepo.findAll();
  }
}

// GAS用のグローバル関数をエクスポート
export function getAllUsers() {
  const controller = new AdminUserController();
  return controller.getAllUsers();
}
