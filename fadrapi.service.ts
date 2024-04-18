import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createWriteStream, readFileSync } from 'fs';
import axios from 'axios';

@Injectable()
export class FadrApiService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('FADR_API_KEY');
    this.baseUrl = this.configService.get<string>('FADR_API_URL');
  }

  async stemSong(
    songPath: string,
    songName: string,
    songExt: string,
    outputDir: string,
    stemTypes: string[],
  ) {
    const file = readFileSync(songPath);
    const headers = { Authorization: `Bearer ${this.apiKey}` };

    const s3Path = await this.getUploadUrl(file, headers, songName, songExt);
    const asset = await this.createAsset(s3Path, headers, songName, songExt);
    const task = await this.initiateStemAnalysis(asset._id, headers);

    for (const stemType of stemTypes) {
      const stemAsset = await this.getStemAsset(task, stemType, headers);
      if (stemAsset && '_id' in stemAsset) {
        await this.downloadStem(
          stemAsset._id,
          stemAsset.name,
          headers,
          outputDir,
        );
      } else {
        console.log(`${stemType} stem not found, moving forward ..`);
      }
    }
  }

  async getUploadUrl(
    file: Buffer,
    headers: object,
    songName: string,
    songExt: string,
  ): Promise<string> {
    console.log('Getting upload URL');
    const response = await axios.post(
      `${this.baseUrl}/assets/upload2`,
      {
        name: `${songName}.${songExt}`,
        extension: songExt,
      },
      { headers },
    );

    console.log('Uploading file to Signed URL');
    await axios.put(response.data.url, file, {
      headers: { 'Content-Type': `audio/${songExt}` },
    });

    return response.data.s3Path;
  }

  async createAsset(
    s3Path: string,
    headers: object,
    songName: string,
    songExt: string,
  ): Promise<any> {
    console.log('Creating asset');
    const response = await axios.post(
      `${this.baseUrl}/assets`,
      {
        name: songName,
        extension: songExt,
        group: `${songName}-group`,
        s3Path: s3Path,
      },
      { headers },
    );

    return response.data.asset;
  }

  async initiateStemAnalysis(assetId: string, headers: object): Promise<any> {
    console.log('Starting Stem Task');
    let response = await axios.post(
      `${this.baseUrl}/assets/analyze/stem`,
      {
        _id: assetId,
      },
      { headers },
    );

    let task = response.data.task;

    console.log('Polling for partial task completion (awaiting stems).');
    while (!task.asset.stems?.length) {
      console.log('Waiting 5 seconds...');
      await this.delay(5000);
      response = await axios.post(
        `${this.baseUrl}/tasks/query`,
        {
          _ids: [task._id],
        },
        { headers },
      );
      task = response.data.tasks[0];
    }
    console.log('Task Complete');
    return task;
  }

  async getStemAsset(
    task: any,
    stemType: string,
    headers: object,
  ): Promise<any> {
    console.log(`Getting all stems to find ${stemType}`);
    const responses = await Promise.all(
      task.asset.stems.map((asset_id: string) =>
        axios.get(`${this.baseUrl}/assets/${asset_id}`, { headers }),
      ),
    );
    const stemAssets = responses.map((response) => response.data.asset);
    // console.log(stemAssets)
    return stemAssets.find((asset) => asset.metaData.stemType === stemType);
  }

  async downloadStem(
    assetId: string,
    assetName: string,
    headers: object,
    outputDir: string,
  ): Promise<void> {
    console.log('Getting download url for stem');
    let response = await axios.get(
      `${this.baseUrl}/assets/download/${assetId}/hq`,
      { headers },
    );
    const downloadUrl = response.data.url;

    console.log('Downloading stem');
    response = await axios.get(downloadUrl, { responseType: 'stream' });
    const writer = createWriteStream(outputDir + assetName + '.mp3');
    response.data.pipe(writer);
  }

  async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
