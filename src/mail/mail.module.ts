import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
@Module({
  imports:[
    MailerModule.forRoot({
      transport: `smtps://${process.env.EMAIL}:${process.env.EMAIL_PASSWORD}@mail.google.com`,
      template: {
        dir: process.cwd()+'/src/mail/template',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    })
  ],
  providers: [MailService, ConfigService],
  exports: [MailService]
})
export class MailModule {}