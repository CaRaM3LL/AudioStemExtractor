// src/fadrapi/fadrapi.module.ts
import { Module } from '@nestjs/common';
import { FadrApiService } from './fadrapi.service';
import { FadrApiController } from './fadrapi.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [FadrApiService, ConfigService],
  exports: [FadrApiService],
  controllers: [FadrApiController],
})
export class FadrApiModule {}
