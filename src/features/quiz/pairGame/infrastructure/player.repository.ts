import { Injectable } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../domain/player.entity';
import { NotFoundDomainException } from 'src/core/exeptions/domain-exceptions';

@Injectable()
export class PlayerRepository {
  constructor(@InjectRepository(Player) private playerRepositoryTypeOrm: Repository<Player>) {}

  async createPlayer(userId: string): Promise<Player> {
    const player = Player.buildInstance(userId);
    const newPlayer = await this.playerRepositoryTypeOrm.save(player);
    return newPlayer;
  }

  // async setGameIdForPlayer(playerId: string, gameId: string): Promise<void> {
  //   const player = await this.findPlayerById(playerId);
  //   player.setGameId(gameId);
  //   await this.playerRepositoryTypeOrm.save(player);
  // }

  async findPlayerById(playerId: string): Promise<Player> {
    const player = await this.playerRepositoryTypeOrm.findOne({ where: { id: Number(playerId), deletedAt: IsNull() } });
    if (!player) {
      throw NotFoundDomainException.create('Player not found');
    }
    return player;
  }
}
