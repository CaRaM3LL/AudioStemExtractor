# AudioStemExtractor

AudioStemExtractor is a service developed using NestJS that allows users to automatically process songs to extract and download specific audio stems such as bass, drums, and vocals. It leverages the FADR API for handling audio files and supports flexible stem selection.

## Features

- **Upload Songs**: Upload songs directly to a designated S3 bucket via signed URLs. This is provided from FADR. See FADR documentation for more information regarding this matter.
- **Extract Stems**: Automatically extract specified stems like bass, drums, or vocals from uploaded songs.
- **Download Stems**: Download the processed stems directly to your local directory.

## Getting Started

### Prerequisites

- Node.js
- NestJS
- An API key for the FADR API

### Installation

- Create .env in root directory of your project and add: FADR_API_URL=https://api.fadr.com, FADR_API_KEY=yourapikey.
- Clone the repository and place fadrapi.controller.ts, fadrapi.module.ts and fadrapi.service.ts in src/fadrapi.
- Don't forget to place FadrApiModule in your app.module.ts file. Example:

```node
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FadrApiModule } from './fadrapi/fadrapi.module';
import { MixSongModule } from './mix_song/mix_song.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FadrApiModule,
    MixSongModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```
- Use stemSong method provided from service to get stems from a song:
```node
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
```
