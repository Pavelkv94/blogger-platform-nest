import { Injectable } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../domain/player.entity';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';
import { PlayerStatus } from '../dto/player-status';

@Injectable()
export class PlayerRepository {
  constructor(@InjectRepository(Player) private playerRepositoryTypeOrm: Repository<Player>) {}

  async createPlayer(userId: string): Promise<Player> {
    const player = Player.buildInstance(userId);
    const newPlayer = await this.playerRepositoryTypeOrm.save(player);
    return newPlayer;
  }

  async findPlayerById(playerId: string): Promise<Player> {
    const player = await this.playerRepositoryTypeOrm.findOne({ where: { id: Number(playerId), deletedAt: IsNull() } });
    if (!player) {
      throw NotFoundDomainException.create('Player not found');
    }
    return player;
  }

  async findPlayersByUserId(userId: string): Promise<Player[]> {
    const players = await this.playerRepositoryTypeOrm.find({ where: { userId: userId, deletedAt: IsNull() } });
    return players;
  }

  async updatePlayerScore(playerId: string): Promise<void> {
    const player = await this.findPlayerById(playerId);
    player.addScore();
    await this.playerRepositoryTypeOrm.save(player);
  }

  async updatePlayerStatus(playerId: string, status: PlayerStatus): Promise<void> {
    const player = await this.findPlayerById(playerId);
    player.setStatus(status);
    await this.playerRepositoryTypeOrm.save(player);
  }
}
