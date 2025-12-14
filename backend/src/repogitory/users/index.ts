import { getSheet } from '../../spreadsheet';
import { type User } from '../../entity';

export class UserRepository {
    private sheet = getSheet('users');

    generateId(): number {
        const lastRow = this.sheet.getLastRow();
        if (lastRow <= 1) {
            return 1;
        }

        const idColumn = this.sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        const ids = idColumn.map(row => Number(row[0])).filter(id => !isNaN(id));
        return ids.length > 0 ? Math.max(...ids) + 1 : 1;
    }

    findByEmail(email: string): User | null {
        const data = this.sheet.getDataRange().getValues();
        const headerRow = data[0];
        const emailColIndex = headerRow.indexOf('email');

        if (emailColIndex === -1) {
            throw new Error('emailL�dK�~[�');
        }

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row[emailColIndex] === email) {
                return {
                    id: Number(row[0]),
                    name: String(row[1]),
                    role: row[3] as 'player' | 'observer'
                };
            }
        }

        return null;
    }

    findById(id: number): User | null {
        const data = this.sheet.getDataRange().getValues();

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (Number(row[0]) === id) {
                return {
                    id: Number(row[0]),
                    name: String(row[1]),
                    role: row[3] as 'player' | 'observer'
                };
            }
        }

        return null;
    }

    findAll(): User[] {
        const data = this.sheet.getDataRange().getValues();
        const users: User[] = [];

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row[0] && row[1]) { // idhnameLX(Y�4n
                users.push({
                    id: Number(row[0]),
                    name: String(row[1]),
                    role: row[3] as 'player' | 'observer'
                });
            }
        }

        return users;
    }

    create(name: string, email: string, role: 'player' | 'observer'): User {
        const id = this.generateId();
        const newUser: User = { id, name, role };

        this.sheet.appendRow([id, name, email, role]);

        return newUser;
    }

    update(id: number, updates: Partial<Pick<User, 'name' | 'role'>>): User | null {
        const data = this.sheet.getDataRange().getValues();

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (Number(row[0]) === id) {
                const rowRange = this.sheet.getRange(i + 1, 1, 1, 4);
                const updatedRow = [...row];

                if (updates.name !== undefined) {
                    updatedRow[1] = updates.name;
                }
                if (updates.role !== undefined) {
                    updatedRow[3] = updates.role;
                }

                rowRange.setValues([updatedRow]);

                return {
                    id: Number(updatedRow[0]),
                    name: String(updatedRow[1]),
                    role: updatedRow[3] as 'player' | 'observer'
                };
            }
        }

        return null;
    }
}