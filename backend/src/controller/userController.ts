import { UserRepository } from '../repogitory/users';
import { type User } from '../entity';

export class UserController {
    private userRepo = new UserRepository();

    registerUser(name: string, role: 'player' | 'observer'): User {
        const email = Session.getActiveUser().getEmail();

        if (!email) {
            throw new Error('ユーザーが認証されていません');
        }

        const existingUser = this.userRepo.findByEmail(email);
        if (existingUser) {
            throw new Error('このメールアドレスは既に登録されています');
        }

        return this.userRepo.create(name, email, role);
    }

    getCurrentUser(): User | null {
        const email = Session.getActiveUser().getEmail();

        if (!email) {
            return null;
        }

        return this.userRepo.findByEmail(email);
    }

    getAllUsers(): User[] {
        return this.userRepo.findAll();
    }

    updateUser(updates: Partial<Pick<User, 'name' | 'role'>>): User | null {
        const email = Session.getActiveUser().getEmail();

        if (!email) {
            throw new Error('ユーザーが認証されていません');
        }

        const currentUser = this.userRepo.findByEmail(email);
        if (!currentUser) {
            throw new Error('ユーザーが見つかりません');
        }

        return this.userRepo.update(currentUser.id, updates);
    }

    getUserById(id: number): User | null {
        return this.userRepo.findById(id);
    }
}

// GAS用のグローバル関数をエクスポート
export function registerUser(name: string, role: 'player' | 'observer') {
    const controller = new UserController();
    return controller.registerUser(name, role);
}

export function getCurrentUser() {
    const controller = new UserController();
    return controller.getCurrentUser();
}

export function getAllUsers() {
    const controller = new UserController();
    return controller.getAllUsers();
}

export function updateUser(updates: Partial<Pick<User, 'name' | 'role'>>) {
    const controller = new UserController();
    return controller.updateUser(updates);
}

export function getUserById(id: number) {
    const controller = new UserController();
    return controller.getUserById(id);
}