import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FormModule } from './form/form.module';
import { DeviceModule } from './device/device.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { UtilsModule } from './utils/utils.module';
@Module({
  imports: [
    MailModule,
    AuthModule,
    UserModule,
    FormModule,
    DeviceModule,
    PrismaModule, 
    ConfigModule.forRoot({
      isGlobal: true
    }),
    UtilsModule
  ]
})
export class AppModule {}
