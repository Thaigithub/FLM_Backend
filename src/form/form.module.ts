import { Module } from '@nestjs/common';
import { FormService } from './form.service';
import { FormController } from './form.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mail/mail.module';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [PrismaModule, JwtModule, MailModule, UtilsModule],
  providers: [FormService],
  controllers: [FormController]
})
export class FormModule {}
