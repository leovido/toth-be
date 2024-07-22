import type { User } from '@/api/user/userModel';

export const users: User[] = [
  {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    age: 42,
    createdAt: new Date(),
    updatedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days later
  },
  {
    id: 2,
    name: 'Robert',
    email: 'Robert@example.com',
    age: 21,
    createdAt: new Date(),
    updatedAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days later
  }
];

export class HelperRepository {
  async fetchDegenTips(fid: number): Promise<unknown> {
    const fid = Number(req.query.fid);
    const json = await fetchDegenTips(fid);
    const { remainingAllowance, allowance } = json;

    const serviceResponse = {
      remainingAllowance,
      allowance
    };
  }

  async findByIdAsync(id: number): Promise<User | null> {
    return users.find((user) => user.id === id) || null;
  }
}
