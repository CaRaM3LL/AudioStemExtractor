// src/fadrapi/fadrapi.controller.ts
import { Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { FadrApiService } from './fadrapi.service';

@Controller('fadrapi')
export class FadrApiController {
  constructor(private readonly fadrApiService: FadrApiService) {}

  @Post('upload_and_get_stems')
  async uploadAndGetStems() {
    try {
      const songPath = 'songs/songnName.MP3';
      const songName = 'songName';
      const songExt = 'mp3';
      const outputDir = 'songs/output/';
      const stemTypes = ['bass', 'drums', 'kicks'];
      await this.fadrApiService.stemSong(
        songPath,
        songName,
        songExt,
        outputDir,
        stemTypes,
      );
      return { message: 'Stem processing initiated successfully' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
