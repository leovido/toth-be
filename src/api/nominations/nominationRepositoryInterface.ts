import { INomination } from './nominationModel';

export interface INominationRepository {
  findById(id: string): Promise<unknown[]>;
  findByFid(fid: number): Promise<unknown[]>;
  findByRound(roundId: string): Promise<unknown[]>;
  findTodaysNominations(): Promise<unknown[]>;
  createNomination(nomination: INomination): Promise<INomination | null>;
}
