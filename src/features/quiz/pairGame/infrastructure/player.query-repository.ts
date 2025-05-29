import { Injectable } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../domain/player.entity';

@Injectable()
export class PlayerQueryRepository {
  constructor(@InjectRepository(Player) private playerRepositoryTypeOrm: Repository<Player>) {}

  async findPlayerByUserId(userId: string): Promise<Player | null> {
    const player = await this.playerRepositoryTypeOrm.findOne({ where: { userId: userId, deletedAt: IsNull() } });
    return player;
  }

  async findActivePlayerByUserId(userId: string): Promise<Player | null> {
    const player = await this.playerRepositoryTypeOrm.findOne({ where: { userId: userId, deletedAt: IsNull(), status: IsNull() } });
    return player;
  }

  async findPlayersByUserId(userId: string): Promise<Player[]> {
    const players = await this.playerRepositoryTypeOrm.find({ where: { userId: userId, deletedAt: IsNull() } });
    return players;
  }

  async findPlayerByPlayerIdAndUserId(playerId: number, userId: string): Promise<Player | null> {
    const player = await this.playerRepositoryTypeOrm.findOne({ where: { id: playerId, userId: userId, deletedAt: IsNull() } });
    return player;
  }
}